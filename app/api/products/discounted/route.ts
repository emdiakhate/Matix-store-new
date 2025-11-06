import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer les produits avec prix distributeur (simulant une promotion)
    // Limités à 15 produits
    const { data: products, error } = await supabase
      .from('products')
      .select(
        `
        id,
        name,
        price,
        distributor_price,
        images,
        stock_quantity,
        producer:producer_id (
          id,
          business_name,
          farm_name,
          full_name
        )
      `
      )
      .not('distributor_price', 'is', null)
      .gte('stock_quantity', 1)
      .order('stock_quantity', { ascending: false })
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
        const discountedPrice = product.distributor_price || product.price;
        const discountPercentage =
          product.distributor_price && product.distributor_price < product.price
            ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
            : 0;

        return {
          id: product.id,
          name: product.name,
          price: discountedPrice.toString(),
          originalPrice: originalPrice.toString(),
          discount: discountPercentage > 0 ? `-${discountPercentage}%` : '',
          rating: 4.5, // Rating par défaut
          image:
            product.images?.[0] ||
            'https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=400',
          producer:
            product.producer?.business_name ||
            product.producer?.farm_name ||
            product.producer?.full_name ||
            'Producteur Matix',
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
