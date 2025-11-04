import { NextRequest, NextResponse } from 'next/server';
import { bictorysClient } from '@/lib/bictorys/client';
import { createServerClient } from '@/lib/supabase/server';

/**
 * API Route pour vérifier le statut d'un paiement
 * GET /api/payments/verify?transaction_id=xxx
 * ou
 * GET /api/payments/verify?reference=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transaction_id');
    const reference = searchParams.get('reference');

    if (!transactionId && !reference) {
      return NextResponse.json({ error: 'transaction_id ou reference requis' }, { status: 400 });
    }

    console.log('🔍 Vérification paiement:', { transactionId, reference });

    // Récupérer le statut depuis Bictorys
    let transactionStatus;
    if (transactionId) {
      transactionStatus = await bictorysClient.getTransactionStatus(transactionId);
    } else if (reference) {
      transactionStatus = await bictorysClient.getTransactionByReference(reference);
    }

    if (!transactionStatus) {
      return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 });
    }

    // Mettre à jour le statut dans Supabase
    const supabase = createServerClient();
    const { error: updateError } = await (supabase as any)
      .from('payments')
      .update({
        status: transactionStatus.status,
        payment_method: transactionStatus.payment_method,
        updated_at: new Date().toISOString(),
      })
      .eq('transaction_id', transactionStatus.transaction_id);

    if (updateError) {
      console.error('⚠️  Erreur mise à jour statut dans DB:', updateError);
    }

    // Si le paiement est réussi, mettre à jour le statut de la commande
    if (transactionStatus.status === 'success') {
      const { data: payment } = await (supabase as any)
        .from('payments')
        .select('order_id')
        .eq('transaction_id', transactionStatus.transaction_id)
        .single();

      if (payment?.order_id) {
        await (supabase as any)
          .from('orders')
          .update({
            status: 'paid',
            payment_status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.order_id);

        console.log('✅ Commande marquée comme payée:', payment.order_id);
      }
    }

    console.log('✅ Statut vérifié:', transactionStatus.status);

    return NextResponse.json({
      success: true,
      transaction: transactionStatus,
    });
  } catch (error) {
    console.error('❌ Erreur API verify payment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la vérification du paiement' },
      { status: 500 }
    );
  }
}
