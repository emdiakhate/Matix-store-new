import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Créer une nouvelle commande e-commerce
 * POST /api/orders/create
 *
 * Compatible avec le schéma existant de la table orders
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await request.json();
    const {
      customer_email,
      customer_phone,
      customer_name,
      total_amount,
      user_id,
      items,
      shipping_address,
      shipping_method,
      payment_method,
    } = body;

    // Validation des champs requis
    if (!customer_email || !customer_phone || !customer_name || !total_amount) {
      return NextResponse.json(
        {
          success: false,
          error: 'Champs requis manquants: email, phone, name, total_amount',
        },
        { status: 400 }
      );
    }

    // Créer la commande compatible avec le schéma existant
    // Note: seller_id et buyer_id sont requis dans le schéma
    // Pour une commande e-commerce, on peut utiliser un seller_id générique
    // ou le user_id du client comme buyer_id
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        // Champs obligatoires du schéma existant
        seller_id: user_id || '00000000-0000-0000-0000-000000000000', // UUID temporaire si pas d'utilisateur
        seller_type: 'producer', // Type par défaut
        buyer_id: user_id || '00000000-0000-0000-0000-000000000000',
        total_amount,
        status: 'pending',
        payment_status: 'pending',

        // Nouveaux champs pour e-commerce
        customer_email,
        customer_phone,
        customer_name,
        items: items || [],
        shipping_address: shipping_address || {},
        shipping_method: shipping_method || null,
        payment_method_details: payment_method || null,

        // Champs facultatifs
        is_direct_sale: true,
        commission_rate: 0,
        commission_amount: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur création commande:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la création de la commande',
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ Commande créée:', order.id);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order,
    });
  } catch (error) {
    console.error('❌ Exception création commande:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur serveur lors de la création de la commande',
      },
      { status: 500 }
    );
  }
}
