import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { bictorysService, mapBictorysStatus } from '@/lib/bictorys'
import { PaymentStatus } from '@/lib/types'

// ============================================================================
// WEBHOOK BICTORYS
// Endpoint: POST /api/webhooks/bictorys
// Reçoit les notifications de paiement de Bictorys
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Vérifier que supabaseAdmin est disponible
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Parser le payload
    const payload = await request.json()
    console.log('Bictorys webhook received:', JSON.stringify(payload, null, 2))

    // Parser le webhook avec notre service
    const webhook = bictorysService.parseWebhook(payload)
    if (!webhook) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const { event, data } = webhook

    // Traiter selon le type d'événement
    switch (event) {
      case 'charge.completed':
      case 'charge.success':
      case 'payment.completed':
        await handlePaymentCompleted(data)
        break

      case 'charge.failed':
      case 'payment.failed':
        await handlePaymentFailed(data)
        break

      case 'refund.completed':
        await handleRefundCompleted(data)
        break

      default:
        console.log(`Unhandled webhook event: ${event}`)
    }

    // Répondre 200 pour confirmer la réception
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// ============================================================================
// HANDLERS
// ============================================================================

async function handlePaymentCompleted(data: {
  transactionId: string
  chargeId: string
  status: string
  amount: number
  currency: string
  paymentMethod: string
  customerPhone?: string
  metadata?: Record<string, unknown>
  completedAt?: string
}) {
  if (!supabaseAdmin) return

  // Trouver le paiement par chargeId
  const { data: payment, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('*, orders(*)')
    .eq('bictorys_charge_id', data.chargeId)
    .single()

  if (paymentError || !payment) {
    // Essayer avec le transactionId
    const { data: paymentByTx } = await supabaseAdmin
      .from('payments')
      .select('*, orders(*)')
      .eq('bictorys_transaction_id', data.transactionId)
      .single()

    if (!paymentByTx) {
      console.error('Payment not found for charge:', data.chargeId)
      return
    }

    await processPaymentSuccess(paymentByTx, data)
    return
  }

  await processPaymentSuccess(payment, data)
}

async function processPaymentSuccess(
  payment: any,
  data: {
    transactionId: string
    chargeId: string
    amount: number
    completedAt?: string
  }
) {
  if (!supabaseAdmin) return

  // Mettre à jour le paiement
  await (supabaseAdmin as any)
    .from('payments')
    .update({
      status: 'completed' as PaymentStatus,
      bictorys_transaction_id: data.transactionId,
      completed_at: data.completedAt || new Date().toISOString(),
      bictorys_response: data as any
    })
    .eq('id', payment.id)

  // Mettre à jour la commande
  await (supabaseAdmin as any)
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', payment.order_id)

  // Enregistrer la transaction
  await (supabaseAdmin as any)
    .from('bictorys_transactions')
    .insert({
      payment_id: payment.id,
      charge_id: data.chargeId,
      transaction_id: data.transactionId,
      operation_type: 'charge',
      amount: data.amount,
      status: 'completed',
      response_data: data,
      webhook_data: data
    })

  // Créer des notifications
  const order = payment.orders

  // Notifier le producteur
  await (supabaseAdmin as any)
    .from('notifications')
    .insert({
      user_id: order.producer_id,
      type: 'payment_received',
      title: 'Paiement reçu',
      message: `Le paiement pour la commande #${order.order_number} a été reçu`,
      data: { order_id: order.id, payment_id: payment.id }
    })

  // Notifier le distributeur
  await (supabaseAdmin as any)
    .from('notifications')
    .insert({
      user_id: order.distributor_id,
      type: 'order_status',
      title: 'Paiement confirmé',
      message: `Votre paiement pour la commande #${order.order_number} a été confirmé`,
      data: { order_id: order.id, payment_id: payment.id }
    })

  console.log(`Payment ${payment.id} completed successfully`)
}

async function handlePaymentFailed(data: {
  transactionId: string
  chargeId: string
  status: string
  amount: number
  failureReason?: string
}) {
  if (!supabaseAdmin) return

  // Trouver le paiement
  const { data: paymentData } = await supabaseAdmin
    .from('payments')
    .select('*, orders(*)')
    .eq('bictorys_charge_id', data.chargeId)
    .single()

  const payment = paymentData as any

  if (!payment) {
    console.error('Payment not found for failed charge:', data.chargeId)
    return
  }

  // Mettre à jour le paiement
  await (supabaseAdmin as any)
    .from('payments')
    .update({
      status: 'failed' as PaymentStatus,
      bictorys_transaction_id: data.transactionId,
      failed_at: new Date().toISOString(),
      failure_reason: data.failureReason,
      bictorys_response: data as any
    })
    .eq('id', payment.id)

  // Enregistrer la transaction
  await (supabaseAdmin as any)
    .from('bictorys_transactions')
    .insert({
      payment_id: payment.id,
      charge_id: data.chargeId,
      transaction_id: data.transactionId,
      operation_type: 'charge',
      amount: data.amount,
      status: 'failed',
      response_data: data,
      webhook_data: data
    })

  // Notifier le distributeur
  const order = payment.orders
  await (supabaseAdmin as any)
    .from('notifications')
    .insert({
      user_id: order.distributor_id,
      type: 'payment_failed',
      title: 'Échec du paiement',
      message: `Le paiement pour la commande #${order.order_number} a échoué. ${data.failureReason || ''}`,
      data: { order_id: order.id, payment_id: payment.id }
    })

  console.log(`Payment ${payment.id} failed:`, data.failureReason)
}

async function handleRefundCompleted(data: {
  transactionId: string
  chargeId: string
  amount: number
  refundId?: string
}) {
  if (!supabaseAdmin) return

  // Trouver le remboursement
  const { data: refundData } = await supabaseAdmin
    .from('refunds')
    .select('*, payments(*), orders(*)')
    .eq('bictorys_refund_id', data.refundId || data.transactionId)
    .single()

  const refund = refundData as any

  if (!refund) {
    console.error('Refund not found:', data.refundId)
    return
  }

  // Mettre à jour le remboursement
  await (supabaseAdmin as any)
    .from('refunds')
    .update({
      status: 'completed' as PaymentStatus,
      completed_at: new Date().toISOString()
    })
    .eq('id', refund.id)

  // Mettre à jour le paiement si remboursement total
  const payment = refund.payments as any
  if (data.amount >= payment.amount) {
    await (supabaseAdmin as any)
      .from('payments')
      .update({ status: 'refunded' as PaymentStatus })
      .eq('id', payment.id)
  } else {
    await (supabaseAdmin as any)
      .from('payments')
      .update({ status: 'partially_refunded' as PaymentStatus })
      .eq('id', payment.id)
  }

  console.log(`Refund ${refund.id} completed`)
}

// ============================================================================
// GET - Vérification de l'endpoint
// ============================================================================

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'Bictorys webhook',
    timestamp: new Date().toISOString()
  })
}
