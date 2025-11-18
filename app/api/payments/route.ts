import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { bictorysService, initiateOrderPayment, calculatePlatformFee } from '@/lib/bictorys'
import { PaymentMethod } from '@/lib/types'

// ============================================================================
// INITIER UN PAIEMENT
// Endpoint: POST /api/payments
// Crée un paiement pour une commande et retourne le lien Bictorys
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Créer un client Supabase avec le token de l'utilisateur
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Vérifier l'utilisateur
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
      paymentMethod
    }: {
      orderId: string
      paymentMethod: PaymentMethod
    } = body

    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { error: 'orderId and paymentMethod are required' },
        { status: 400 }
      )
    }

    // Récupérer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, distributor:user_profiles!orders_distributor_id_fkey(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Vérifier que c'est bien le distributeur qui paie
    if (order.distributor_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only pay for your own orders' },
        { status: 403 }
      )
    }

    // Vérifier que la commande est en attente de paiement
    if (order.status !== 'pending_payment') {
      return NextResponse.json(
        { error: `Order is not pending payment (status: ${order.status})` },
        { status: 400 }
      )
    }

    // Vérifier qu'il n'y a pas déjà un paiement en cours
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .in('status', ['pending', 'processing'])
      .single()

    if (existingPayment) {
      // Retourner le paiement existant s'il a un lien
      if (existingPayment.bictorys_response?.link) {
        return NextResponse.json({
          success: true,
          paymentId: existingPayment.id,
          checkoutUrl: existingPayment.bictorys_response.link,
          chargeId: existingPayment.bictorys_charge_id
        })
      }
    }

    // URLs de callback
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/api/webhooks/bictorys`
    const redirectUrl = `${baseUrl}/orders/${orderId}/confirmation`

    // Préparer les données client
    const distributor = order.distributor
    const customer = {
      name: distributor.business_name || `${distributor.first_name} ${distributor.last_name}`,
      email: distributor.email,
      phone: distributor.phone
    }

    // Initier le paiement avec Bictorys
    const chargeResult = await initiateOrderPayment(
      orderId,
      order.total_amount,
      customer,
      paymentMethod,
      callbackUrl,
      redirectUrl
    )

    if (!chargeResult.success || !chargeResult.data) {
      return NextResponse.json(
        {
          error: 'Failed to initiate payment',
          details: chargeResult.error
        },
        { status: 500 }
      )
    }

    // Créer ou mettre à jour le paiement dans la base
    const paymentData = {
      order_id: orderId,
      amount: order.total_amount,
      payment_method: paymentMethod,
      status: 'pending' as const,
      bictorys_charge_id: chargeResult.data.chargeId,
      bictorys_response: chargeResult.data
    }

    let paymentId: string

    if (existingPayment) {
      // Mettre à jour le paiement existant
      const { data: updated } = await supabase
        .from('payments')
        .update(paymentData)
        .eq('id', existingPayment.id)
        .select()
        .single()

      paymentId = updated?.id || existingPayment.id
    } else {
      // Créer un nouveau paiement
      const { data: created, error: createError } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (createError || !created) {
        return NextResponse.json(
          { error: 'Failed to create payment record' },
          { status: 500 }
        )
      }

      paymentId = created.id
    }

    // Enregistrer la transaction
    await supabase
      .from('bictorys_transactions')
      .insert({
        payment_id: paymentId,
        charge_id: chargeResult.data.chargeId,
        operation_type: 'charge',
        amount: order.total_amount,
        status: 'initiated',
        request_data: {
          orderId,
          paymentMethod,
          amount: order.total_amount,
          customer
        },
        response_data: chargeResult.data
      })

    // Retourner le résultat
    return NextResponse.json({
      success: true,
      paymentId,
      chargeId: chargeResult.data.chargeId,
      checkoutUrl: chargeResult.data.link,
      opToken: chargeResult.data.opToken
    })
  } catch (error) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// OBTENIR LE STATUT D'UN PAIEMENT
// Endpoint: GET /api/payments?orderId=xxx
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const paymentId = searchParams.get('paymentId')

    if (!orderId && !paymentId) {
      return NextResponse.json(
        { error: 'orderId or paymentId is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let query = supabase
      .from('payments')
      .select('*, orders(order_number, status)')

    if (paymentId) {
      query = query.eq('id', paymentId)
    } else if (orderId) {
      query = query.eq('order_id', orderId)
    }

    const { data: payment, error } = await query.single()

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Si le paiement est en cours, vérifier le statut auprès de Bictorys
    if (
      payment.status === 'pending' &&
      payment.bictorys_transaction_id
    ) {
      const statusResult = await bictorysService.getTransactionStatus(
        payment.bictorys_transaction_id
      )

      if (statusResult.success && statusResult.data) {
        // Le statut sera mis à jour par le webhook, mais on peut informer l'utilisateur
        return NextResponse.json({
          payment: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            paymentMethod: payment.payment_method,
            createdAt: payment.created_at
          },
          bictorysStatus: statusResult.data.status,
          order: payment.orders
        })
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        createdAt: payment.created_at,
        completedAt: payment.completed_at,
        failureReason: payment.failure_reason
      },
      order: payment.orders
    })
  } catch (error) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
