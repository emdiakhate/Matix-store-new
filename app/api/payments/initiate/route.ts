import { NextRequest, NextResponse } from 'next/server';
import { bictorysClient } from '@/lib/bictorys/client';
import { createServerClient } from '@/lib/supabase/server';

/**
 * API Route pour initier un paiement Bictorys
 * POST /api/payments/initiate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, customerEmail, customerPhone, customerName } = body;

    // Validation des données requises
    if (!orderId || !amount || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: 'Données manquantes: orderId, amount, customerEmail, customerPhone requis' },
        { status: 400 }
      );
    }

    // Vérifier que le montant est valide
    if (amount <= 0) {
      return NextResponse.json({ error: 'Le montant doit être supérieur à 0' }, { status: 400 });
    }

    // Générer une référence unique
    const reference = `MATIX-${orderId}-${Date.now()}`;

    console.log('💳 Initiation paiement pour commande:', orderId);

    // Créer le paiement via Bictorys
    const paymentResult = await bictorysClient.createPayment({
      amount,
      currency: 'XOF',
      customer: {
        email: customerEmail,
        phone: customerPhone,
        name: customerName || 'Client Matix',
      },
      reference,
      description: `Paiement commande #${orderId} - Matix Store`,
      metadata: {
        order_id: orderId,
        platform: 'matix-store',
        environment: bictorysClient.isSandbox() ? 'sandbox' : 'production',
      },
    });

    if (!paymentResult.success) {
      console.error('❌ Échec initiation paiement:', paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error || "Erreur lors de l'initiation du paiement" },
        { status: 500 }
      );
    }

    // Enregistrer la transaction dans Supabase
    const supabase = createServerClient();
    const { error: dbError } = await (supabase as any).from('payments').insert({
      order_id: orderId,
      transaction_id: paymentResult.transaction_id,
      reference,
      amount,
      currency: 'XOF',
      status: 'pending',
      provider: 'bictorys',
      payment_url: paymentResult.payment_url,
      metadata: {
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_name: customerName,
      },
    });

    if (dbError) {
      console.error('⚠️  Erreur sauvegarde transaction dans DB:', dbError);
      // On continue quand même, le paiement est initié
    }

    console.log('✅ Paiement initié avec succès:', paymentResult.transaction_id);

    return NextResponse.json({
      success: true,
      transaction_id: paymentResult.transaction_id,
      payment_url: paymentResult.payment_url,
      reference,
      amount,
      message: 'Paiement initié avec succès',
    });
  } catch (error) {
    console.error('❌ Erreur API initiate payment:', error);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'initiation du paiement" },
      { status: 500 }
    );
  }
}
