import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les produits en promotion (avec discount)
    // Limités à 15 produits
    const { data: products, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        price,
        discount_price,
        discount_percentage,
        images,
        average_rating,
        producer:producer_id (
          id,
          business_name,
          farm_name
        )
      `
      )
      .eq('is_active', true)
      .eq('is_on_sale', true)
      .not('discount_price', 'is', null)
      .gte('stock_quantity', 1)
      .order('discount_percentage', { ascending: false })
      .limit(15);

    if (error) {
      console.error('Erreur Supabase:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits' },
        { status: 500 }
      );
    }

    // Formater les données pour le frontend
    const formattedProducts =
      products?.map((product: any) => {
        const originalPrice = product.price;
        const discountedPrice = product.discount_price || product.price;
        const discountPercentage =
          product.discount_percentage ||
          Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

        return {
          id: product.id,
          name: product.name,
          price: discountedPrice.toString(),
          originalPrice: originalPrice.toString(),
          discount: `-${discountPercentage}%`,
          rating: product.average_rating || 4.5,
          image:
            product.images?.[0] ||
            'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400',
          producer:
            product.producer?.business_name || product.producer?.farm_name || 'Producteur Matix',
        };
      }) || [];

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la récupération des produits en promotion:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des produits' },
      { status: 500 }
    );
  }
}
