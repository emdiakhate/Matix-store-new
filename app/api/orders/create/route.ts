import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Créer une nouvelle commande
 * POST /api/orders/create
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

    // Créer la commande
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user_id || null,
        customer_email,
        customer_phone,
        customer_name,
        total_amount,
        status: 'pending',
        items: items || [],
        shipping_address: shipping_address || {},
        shipping_method: shipping_method || null,
        payment_method: payment_method || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
