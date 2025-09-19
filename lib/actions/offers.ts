// import { createClient } from '@/lib/supabase';
// import { revalidatePath } from 'next/cache';

export interface Offer {
  id: string;
  demand_id: string;
  producer_id: string;
  producer_name: string;
  product_name: string;
  proposed_price: number;
  quantity: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface Demand {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  budget?: number;
  location: string;
  due_date: string;
  status: 'active' | 'closed' | 'expired';
  created_at: string;
}

/**
 * Récupérer les offres pour une demande spécifique
 */
export async function getOffersForDemand(demandId: string): Promise<{
  demand: Demand;
  offers: Offer[];
}> {
  // Version mockée pour l'instant
  throw new Error('Fonction non implémentée - utilise les données mockées');
}

/**
 * Accepter une offre
 */
export async function acceptOffer(
  offerId: string,
  distributorId: string
): Promise<void> {
  // Version mockée pour l'instant
  console.log(`Acceptation de l'offre ${offerId} par le distributeur ${distributorId}`);
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Refuser une offre
 */
export async function rejectOffer(
  offerId: string,
  distributorId: string
): Promise<void> {
  // Version mockée pour l'instant
  console.log(`Refus de l'offre ${offerId} par le distributeur ${distributorId}`);
  // Simuler un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Marquer une offre comme lue
 */
export async function markOfferAsRead(offerId: string): Promise<void> {
  // Version mockée pour l'instant
  console.log(`Marquage de l'offre ${offerId} comme lue`);
}

/**
 * Récupérer le nombre d'offres pour une demande
 */
export async function getOffersCountForDemand(demandId: string): Promise<{
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  unread: number;
}> {
  // Version mockée pour l'instant
  return {
    total: 3,
    pending: 3,
    accepted: 0,
    rejected: 0,
    unread: 3
  };
}
