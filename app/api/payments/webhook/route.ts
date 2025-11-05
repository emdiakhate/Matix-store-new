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

    // Mapper les statuts Bictorys vers les valeurs ENUM de la DB
    // Bictorys: success, pending, failed, cancelled
    // DB payment_status: pending, paid, failed, refunded
    // DB order_status: pending, confirmed, shipped, delivered, cancelled
    const mapBictorysStatus = (bictorysStatus: string): string => {
      const statusMap: Record<string, string> = {
        success: 'paid',
        pending: 'pending',
        failed: 'failed',
        cancelled: 'failed', // Mapper cancelled vers failed pour payment_status
      };
      return statusMap[bictorysStatus] || 'pending';
    };

    // Récupérer le paiement existant
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

    // Traiter selon le type d'événement
    switch (eventType) {
      case 'payment.success':
      case 'payment_success':
        console.log('✅ Paiement réussi:', transactionId);

        // Mettre à jour le paiement avec payment_status = 'paid'
        await (supabase as any)
          .from('payments')
          .update({
            status: 'paid', // payment_status ENUM
            payment_method: payment_method || 'bictorys', // payment_method ENUM
            bictorys_status: 'success', // Garder le statut Bictorys original
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', transactionId);

        // Mettre à jour la commande avec order_status = 'confirmed'
        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              status: 'confirmed', // order_status ENUM
              payment_status: 'paid', // payment_status ENUM
              payment_method: 'bictorys', // payment_method ENUM
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);

          console.log('✅ Commande confirmée:', payment.order_id);
        }
        break;

      case 'payment.failed':
      case 'payment_failed':
        console.log('❌ Paiement échoué:', transactionId);

        await (supabase as any)
          .from('payments')
          .update({
            status: 'failed', // payment_status ENUM
            bictorys_status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', transactionId);

        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              payment_status: 'failed', // payment_status ENUM
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);
        }
        break;

      case 'payment.cancelled':
      case 'payment_cancelled':
        console.log('⚠️  Paiement annulé:', transactionId);

        await (supabase as any)
          .from('payments')
          .update({
            status: 'failed', // payment_status: mapper cancelled → failed
            bictorys_status: 'cancelled', // Garder le statut Bictorys original
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', transactionId);

        // Annuler la commande avec order_status = 'cancelled'
        if (payment.order_id) {
          await (supabase as any)
            .from('orders')
            .update({
              status: 'cancelled', // order_status ENUM
              payment_status: 'failed', // payment_status ENUM
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.order_id);

          console.log('⚠️  Commande annulée:', payment.order_id);
        }
        break;

      case 'payment.pending':
      case 'payment_pending':
        console.log('⏳ Paiement en attente:', transactionId);

        await (supabase as any)
          .from('payments')
          .update({
            status: 'pending', // payment_status ENUM
            bictorys_status: 'pending',
            updated_at: new Date().toISOString(),
          })
          .eq('transaction_id', transactionId);
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
