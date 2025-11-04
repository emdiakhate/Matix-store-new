"use server";

import { createClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface PropositionFormData {
  productId: string;
  proposedPrice: number;
  quantity: number;
  message?: string;
}

export interface Proposition {
  id: string;
  distributor_id: string;
  producer_id: string;
  product_id: string;
  proposed_price: number;
  quantity: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    producer: {
      id: string;
      name: string;
    };
  };
}

/**
 * Créer une nouvelle proposition
 */
export async function createProposition(
  distributorId: string,
  propositionData: PropositionFormData
): Promise<Proposition> {
  const supabase = createClient();

  try {
    // Récupérer les informations du produit et du producteur
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        unit,
        producer_id,
        producer:users(
          id,
          name
        )
      `)
      .eq('id', propositionData.productId)
      .single();

    if (productError || !product) {
      throw new Error('Produit non trouvé');
    }

    // Vérifier qu'il n'y a pas déjà une proposition en cours pour ce produit
    const { data: existingProposition } = await supabase
      .from('propositions')
      .select('id')
      .eq('distributor_id', distributorId)
      .eq('product_id', propositionData.productId)
      .in('status', ['pending', 'accepted'])
      .single();

    if (existingProposition) {
      throw new Error('Vous avez déjà une proposition en cours pour ce produit');
    }

    // Créer la proposition
    const { data: proposition, error: propositionError } = await supabase
      .from('propositions')
      .insert({
        distributor_id: distributorId,
        producer_id: product.producer_id,
        product_id: propositionData.productId,
        proposed_price: propositionData.proposedPrice,
        quantity: propositionData.quantity,
        message: propositionData.message,
        status: 'pending'
      })
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          unit,
          producer:users(
            id,
            name
          )
        )
      `)
      .single();

    if (propositionError) {
      throw new Error('Erreur lors de la création de la proposition');
    }

    // Notifier le producteur
    await notifyProducer(
      product.producer.name,
      product.name,
      propositionData.proposedPrice,
      propositionData.quantity
    );

    revalidatePath('/dashboard/distributor/propositions');
    return proposition;
  } catch (error) {
    console.error('Erreur createProposition:', error);
    throw error;
  }
}

/**
 * Récupérer les propositions du distributeur
 */
export async function getDistributorPropositions(
  distributorId: string
): Promise<Proposition[]> {
  const supabase = createClient();

  try {
    const { data: propositions, error } = await supabase
      .from('propositions')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          unit,
          producer:users(
            id,
            name
          )
        )
      `)
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Erreur lors de la récupération des propositions');
    }

    return propositions || [];
  } catch (error) {
    console.error('Erreur getDistributorPropositions:', error);
    throw error;
  }
}

/**
 * Modifier une proposition existante
 */
export async function updateProposition(
  propositionId: string,
  distributorId: string,
  propositionData: Partial<PropositionFormData>
): Promise<Proposition> {
  const supabase = createClient();

  try {
    // Vérifier que la proposition appartient au distributeur et est modifiable
    const { data: existingProposition, error: fetchError } = await supabase
      .from('propositions')
      .select('*')
      .eq('id', propositionId)
      .eq('distributor_id', distributorId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !existingProposition) {
      throw new Error('Proposition non trouvée ou non modifiable');
    }

    // Mettre à jour la proposition
    const { data: proposition, error: updateError } = await supabase
      .from('propositions')
      .update({
        proposed_price: propositionData.proposedPrice || existingProposition.proposed_price,
        quantity: propositionData.quantity || existingProposition.quantity,
        message: propositionData.message !== undefined ? propositionData.message : existingProposition.message,
        updated_at: new Date().toISOString()
      })
      .eq('id', propositionId)
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          unit,
          producer:users(
            id,
            name
          )
        )
      `)
      .single();

    if (updateError) {
      throw new Error('Erreur lors de la mise à jour de la proposition');
    }

    revalidatePath('/dashboard/distributor/propositions');
    return proposition;
  } catch (error) {
    console.error('Erreur updateProposition:', error);
    throw error;
  }
}

/**
 * Annuler une proposition
 */
export async function cancelProposition(
  propositionId: string,
  distributorId: string
): Promise<void> {
  const supabase = createClient();

  try {
    // Vérifier que la proposition appartient au distributeur
    const { data: existingProposition, error: fetchError } = await supabase
      .from('propositions')
      .select('*')
      .eq('id', propositionId)
      .eq('distributor_id', distributorId)
      .eq('status', 'pending')
      .single();

    if (fetchError || !existingProposition) {
      throw new Error('Proposition non trouvée ou non annulable');
    }

    // Marquer la proposition comme annulée (rejected)
    const { error: updateError } = await supabase
      .from('propositions')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString()
      })
      .eq('id', propositionId);

    if (updateError) {
      throw new Error('Erreur lors de l\'annulation de la proposition');
    }

    revalidatePath('/dashboard/distributor/propositions');
  } catch (error) {
    console.error('Erreur cancelProposition:', error);
    throw error;
  }
}

/**
 * Notifier le producteur d'une nouvelle proposition
 */
async function notifyProducer(
  producerName: string,
  productName: string,
  proposedPrice: number,
  quantity: number
): Promise<void> {
  // TODO: Implémenter le système de notifications
  // - Email au producteur
  // - Notification in-app
  // - Webhook si nécessaire
  
  console.log(`Notification envoyée à ${producerName} pour la proposition sur ${productName} (${proposedPrice} FCFA x ${quantity})`);
}
