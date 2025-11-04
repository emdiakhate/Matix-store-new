import { NextRequest, NextResponse } from 'next/server';
import { bictorysClient } from '@/lib/bictorys/client';
import { createServerClient } from '@/lib/supabase/server';

/**
 * Webhook Bictorys pour recevoir les notifications de paiement
 * POST /api/payments/webhook
 *
 * Bictorys envoie des webhooks pour notifier des changements de statut:
 * - payment.pending: Paiement initié
 * - payment.success: Paiement réussi
 * - payment.failed: Paiement échoué
 * - payment.cancelled: Paiement annulé
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer la signature pour validation (si fournie par Bictorys)
    const signature = request.headers.get('x-bictorys-signature') || '';
    const rawBody = await request.text();

    // Valider la signature du webhook (important pour la sécurité)
    if (!bictorysClient.isSandbox()) {
      const isValid = bictorysClient.validateWebhook(signature, rawBody);
      if (!isValid) {
        console.error('❌ Signature webhook invalide');
        return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    console.log('📨 Webhook reçu:', payload.event || payload.type);

    const {
      event,
      type,
      transaction_id,
      reference,
      status,
      amount,
      currency,
      payment_method,
      metadata,
    } = payload;

    const eventType = event || type;
    const transactionId = transaction_id || payload.id;

    if (!transactionId) {
      console.error('❌ transaction_id manquant dans le webhook');
      return NextResponse.json({ error: 'transaction_id requis' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Mettre à jour le statut du paiement dans la DB
    const { data: payment, error: fetchError } = await (supabase as any)
      .from('payments')
      .select('*, orders(*)')
      .eq('transaction_id', transactionId)
      .single();

    if (fetchError || !payment) {
      console.error('⚠️  Paiement non trouvé dans la DB:', transactionId);
      // On retourne quand même 200 pour ne pas que Bictorys renvoie le webhook
      return NextResponse.json({ received: true });
    }

    // Mettre à jour le statut du paiement
    const { error: updateError } = await (supabase as any)
      .from('payments')
      .update({
        status: status || payment.status,
        payment_method: payment_method || payment.payment_method,
        webhook_data: payload,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionId);

    if (updateError) {
      console.error('❌ Erreur mise à jour paiement:', updateError);
    }

    // Traiter selon le type d'événement
    switch (eventType) {
      case 'payment.success':
        console.log('✅ Paiement réussi:', transactionId);

        // Mettre à jour la commande comme payée
        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              status: 'paid',
              payment_status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);

          // TODO: Envoyer email/SMS de confirmation au client
          // TODO: Notifier le vendeur de la nouvelle commande
        }
        break;

      case 'payment.failed':
        console.log('❌ Paiement échoué:', transactionId);

        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);

          // TODO: Notifier le client de l'échec
        }
        break;

      case 'payment.cancelled':
        console.log('⚠️  Paiement annulé:', transactionId);

        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              payment_status: 'cancelled',
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);
        }
        break;

      case 'payment.pending':
        console.log('⏳ Paiement en attente:', transactionId);
        break;

      default:
        console.log('ℹ️  Événement webhook non géré:', eventType);
    }

    // Toujours retourner 200 pour confirmer la réception
    return NextResponse.json({
      received: true,
      transaction_id: transactionId,
    });
  } catch (error) {
    console.error('❌ Erreur traitement webhook:', error);

    // Retourner 200 même en cas d'erreur pour éviter les renvois
    // On log l'erreur pour investigation
    return NextResponse.json({
      received: true,
      error: 'Erreur interne',
    });
  }
}

// Permettre GET pour tester que l'endpoint est accessible
export async function GET() {
  return NextResponse.json({
    message: 'Webhook Bictorys - Endpoint actif',
    status: 'ready',
  });
}
