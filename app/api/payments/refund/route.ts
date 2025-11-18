import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { bictorysService } from '@/lib/bictorys'

// ============================================================================
// INITIER UN REMBOURSEMENT
// Endpoint: POST /api/payments/refund
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parser la requête
    const body = await request.json()
    const {
      orderId,
      amount,
      reason
    }: {
      orderId: string
      amount?: number
      reason: string
    } = body

    if (!orderId || !reason) {
      return NextResponse.json(
        { error: 'orderId and reason are required' },
        { status: 400 }
      )
    }

    // Récupérer la commande et le paiement
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, payments(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur est le producteur (seul lui peut rembourser)
    if (order.producer_id !== user.id) {
      return NextResponse.json(
        { error: 'Only the producer can initiate refunds' },
        { status: 403 }
      )
    }

    // Trouver le paiement complété
    const payment = order.payments?.find((p: any) => p.status === 'completed')
    if (!payment) {
      return NextResponse.json(
        { error: 'No completed payment found for this order' },
        { status: 400 }
      )
    }

    // Montant à rembourser
    const refundAmount = amount || payment.amount

    if (refundAmount > payment.amount) {
      return NextResponse.json(
        { error: 'Refund amount cannot exceed payment amount' },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un remboursement en cours
    const { data: existingRefund } = await supabase
      .from('refunds')
      .select('*')
      .eq('payment_id', payment.id)
      .in('status', ['pending', 'processing'])
      .single()

    if (existingRefund) {
      return NextResponse.json(
        { error: 'A refund is already in progress for this payment' },
        { status: 400 }
      )
    }

    // Créer le remboursement dans la base
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        payment_id: payment.id,
        order_id: orderId,
        amount: refundAmount,
        reason,
        initiated_by: user.id,
        status: 'pending'
      })
      .select()
      .single()

    if (refundError || !refund) {
      return NextResponse.json(
        { error: 'Failed to create refund record' },
        { status: 500 }
      )
    }

    // Initier le remboursement auprès de Bictorys
    if (payment.bictorys_transaction_id) {
      const refundResult = await bictorysService.refundTransaction({
        transactionId: payment.bictorys_transaction_id,
        amount: refundAmount,
        reason
      })

      if (refundResult.success && refundResult.data) {
        // Mettre à jour le remboursement avec l'ID Bictorys
        await supabase
          .from('refunds')
          .update({
            bictorys_refund_id: refundResult.data.refundId,
            status: 'processing'
          })
          .eq('id', refund.id)

        // Enregistrer la transaction
        await supabase
          .from('bictorys_transactions')
          .insert({
            payment_id: payment.id,
            transaction_id: refundResult.data.refundId,
            operation_type: 'refund',
            amount: refundAmount,
            status: 'processing',
            request_data: { orderId, amount: refundAmount, reason },
            response_data: refundResult.data
          })

        return NextResponse.json({
          success: true,
          refundId: refund.id,
          bictorysRefundId: refundResult.data.refundId,
          amount: refundAmount,
          status: 'processing'
        })
      } else {
        // Le remboursement Bictorys a échoué
        await supabase
          .from('refunds')
          .update({ status: 'failed' })
          .eq('id', refund.id)

        return NextResponse.json(
          {
            error: 'Failed to process refund with payment provider',
            details: refundResult.error
          },
          { status: 500 }
        )
      }
    }

    // Paiement sans transaction Bictorys (cash on delivery)
    // Marquer comme complété directement
    await supabase
      .from('refunds')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', refund.id)

    // Notifier le distributeur
    await supabase
      .from('notifications')
      .insert({
        user_id: order.distributor_id,
        type: 'order_status',
        title: 'Remboursement effectué',
        message: `Un remboursement de ${refundAmount} XOF a été effectué pour la commande #${order.order_number}`,
        data: { order_id: orderId, refund_id: refund.id }
      })

    return NextResponse.json({
      success: true,
      refundId: refund.id,
      amount: refundAmount,
      status: 'completed'
    })
  } catch (error) {
    console.error('Refund error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
