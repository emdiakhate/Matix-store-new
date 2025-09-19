"use server";

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface ReviewFormData {
  rating: number;
  comment?: string;
  image?: File;
}

export interface ProductReview {
  id: string;
  product_id: string;
  distributor_id: string;
  rating: number;
  comment?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    image_url?: string;
    price: number;
    producer: {
      name: string;
    };
  };
}

export interface PurchasedProduct {
  id: string;
  name: string;
  image_url?: string;
  price: number;
  producer: {
    name: string;
  };
  purchase_date: string;
}

/**
 * Créer un nouvel avis pour un produit
 */
export async function createReview(
  productId: string, 
  distributorId: string, 
  reviewData: ReviewFormData
): Promise<ProductReview> {
  const supabase = createClient();

  try {
    // Vérifier que le distributeur a bien acheté ce produit
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        id,
        order_items!inner(
          product_id
        )
      `)
      .eq('distributor_id', distributorId)
      .eq('order_items.product_id', productId)
      .eq('status', 'delivered')
      .single();

    if (orderError || !order) {
      throw new Error('Vous ne pouvez évaluer que les produits que vous avez achetés');
    }

    // Vérifier qu'il n'y a pas déjà un avis pour ce produit
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('distributor_id', distributorId)
      .single();

    if (existingReview) {
      throw new Error('Vous avez déjà donné un avis pour ce produit');
    }

    let imageUrl: string | undefined;

    // Upload de l'image si fournie
    if (reviewData.image) {
      const fileExt = reviewData.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, reviewData.image);

      if (uploadError) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    // Créer l'avis
    const { data: review, error: reviewError } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        distributor_id: distributorId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        image_url: imageUrl
      })
      .select(`
        *,
        product:products(
          id,
          name,
          image_url,
          price,
          producer:users(name)
        )
      `)
      .single();

    if (reviewError) {
      throw new Error('Erreur lors de la création de l\'avis');
    }

    // Notifier le producteur
    await notifyProducer(review.product.producer.name, review.product.name, reviewData.rating);

    revalidatePath('/dashboard/distributor/my-reviews');
    return review;
  } catch (error) {
    console.error('Erreur createReview:', error);
    throw error;
  }
}

/**
 * Modifier un avis existant
 */
export async function updateReview(
  reviewId: string,
  distributorId: string,
  reviewData: ReviewFormData
): Promise<ProductReview> {
  const supabase = createClient();

  try {
    // Vérifier que l'avis appartient au distributeur
    const { data: existingReview, error: fetchError } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('id', reviewId)
      .eq('distributor_id', distributorId)
      .single();

    if (fetchError || !existingReview) {
      throw new Error('Avis non trouvé ou non autorisé');
    }

    let imageUrl = existingReview.image_url;

    // Upload de la nouvelle image si fournie
    if (reviewData.image) {
      // Supprimer l'ancienne image si elle existe
      if (existingReview.image_url) {
        const oldFileName = existingReview.image_url.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('review-images')
            .remove([oldFileName]);
        }
      }

      const fileExt = reviewData.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('review-images')
        .upload(fileName, reviewData.image);

      if (uploadError) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('review-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrl;
    }

    // Mettre à jour l'avis
    const { data: review, error: updateError } = await supabase
      .from('product_reviews')
      .update({
        rating: reviewData.rating,
        comment: reviewData.comment,
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select(`
        *,
        product:products(
          id,
          name,
          image_url,
          price,
          producer:users(name)
        )
      `)
      .single();

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour de l\'avis');
    }

    revalidatePath('/dashboard/distributor/my-reviews');
    return review;
  } catch (error) {
    console.error('Erreur updateReview:', error);
    throw error;
  }
}

/**
 * Récupérer les produits achetés sans avis
 */
export async function getPurchasedProductsWithoutReview(
  distributorId: string
): Promise<PurchasedProduct[]> {
  const supabase = createClient();

  try {
    const { data: products, error } = await supabase
      .from('orders')
      .select(`
        order_items!inner(
          product:products(
            id,
            name,
            image_url,
            price,
            producer:users(name)
          )
        ),
        created_at
      `)
      .eq('distributor_id', distributorId)
      .eq('status', 'delivered')
      .not('order_items.product_id', 'in', `(
        SELECT product_id 
        FROM product_reviews 
        WHERE distributor_id = '${distributorId}'
      )`);

    if (error) {
      throw new Error('Erreur lors de la récupération des produits');
    }

    // Transformer les données
    const purchasedProducts: PurchasedProduct[] = products?.map(order => ({
      id: order.order_items.product.id,
      name: order.order_items.product.name,
      image_url: order.order_items.product.image_url,
      price: order.order_items.product.price,
      producer: {
        name: order.order_items.product.producer.name
      },
      purchase_date: order.created_at
    })) || [];

    return purchasedProducts;
  } catch (error) {
    console.error('Erreur getPurchasedProductsWithoutReview:', error);
    throw error;
  }
}

/**
 * Récupérer les avis du distributeur
 */
export async function getDistributorReviews(
  distributorId: string
): Promise<ProductReview[]> {
  const supabase = createClient();

  try {
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select(`
        *,
        product:products(
          id,
          name,
          image_url,
          price,
          producer:users(name)
        )
      `)
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erreur lors de la récupération des avis');
    }

    return reviews || [];
  } catch (error) {
    console.error('Erreur getDistributorReviews:', error);
    throw error;
  }
}

/**
 * Notifier le producteur d'un nouvel avis
 */
async function notifyProducer(
  producerName: string,
  productName: string,
  rating: number
): Promise<void> {
  // TODO: Implémenter le système de notifications
  // - Email au producteur
  // - Notification in-app
  // - Webhook si nécessaire
  
  console.log(`Notification envoyée à ${producerName} pour l'avis sur ${productName} (${rating}/5 étoiles)`);
}
