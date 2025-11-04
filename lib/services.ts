import { supabase, supabaseAdmin } from './supabase';
import {
  Database,
  User,
  Product,
  DeliveryRequest,
  Quote,
  Order,
  Brand,
  Category,
  Proposition,
  DistributorRequest,
  ProducerOffer,
  DistributorAlert,
  AlertMatch,
  ProducerFollower,
  Notification,
  ChatRoom,
  ChatMessage,
  ChatParticipant,
  ProductReview,
  ProductReviewStats,
} from './types';

// Types pour les réponses
type SupabaseResponse<T> = {
  data: T | null;
  error: any;
};

// Service pour les utilisateurs
export const userService = {
  // Créer un profil utilisateur
  async createProfile(userId: string, userData: Partial<User>): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, ...userData }])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir le profil utilisateur
  async getProfile(userId: string): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    return { data, error };
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(userId: string, updates: Partial<User>): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Mettre à jour la géolocalisation de la ferme
  async updateFarmLocation(
    userId: string,
    locationData: {
      farm_latitude: number;
      farm_longitude: number;
      location_accuracy: number;
      farm_address: string;
      farm_name: string;
      region: string;
    }
  ): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .update(locationData)
      .eq('id', userId)
      .select()
      .single();

    return { data, error };
  },

  // Obtenir la géolocalisation de la ferme
  async getFarmLocation(
    userId: string
  ): Promise<
    SupabaseResponse<
      Pick<
        User,
        | 'farm_latitude'
        | 'farm_longitude'
        | 'location_accuracy'
        | 'farm_address'
        | 'farm_name'
        | 'region'
      >
    >
  > {
    const { data, error } = await supabase
      .from('users')
      .select('farm_latitude, farm_longitude, location_accuracy, farm_address, farm_name, region')
      .eq('id', userId)
      .single();

    return { data, error };
  },

  // Obtenir tous les utilisateurs (admin)
  async getAllUsers(): Promise<SupabaseResponse<User[]>> {
    if (!supabaseAdmin) {
      return {
        data: null,
        error: { message: 'Admin client not configured. SUPABASE_SERVICE_ROLE_KEY is required.' },
      };
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  },
};

// Service pour les produits
export const productService = {
  // Créer un produit
  async createProduct(
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase.from('products').insert([productData]).select().single();

    return { data, error };
  },

  // Obtenir tous les produits
  async getAllProducts(): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, users!products_producer_id_fkey(*)')
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les produits d'un producteur
  async getProductsByProducer(producerId: string): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir un produit par ID
  async getProductById(productId: string): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, users!products_producer_id_fkey(*)')
      .eq('id', productId)
      .single();

    return { data, error };
  },

  // Mettre à jour un produit
  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    return { data, error };
  },

  // Supprimer un produit
  async deleteProduct(productId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from('products').delete().eq('id', productId);

    return { data: null, error };
  },

  // Rechercher des produits par géolocalisation
  async searchProductsNearby(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase.rpc('search_products_nearby', {
      search_lat: lat,
      search_lng: lng,
      search_radius: radiusKm,
    });

    return { data, error };
  },
};

// Service pour les demandes de livraison
export const deliveryRequestService = {
  // Créer une demande de livraison
  async createRequest(
    requestData: Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<DeliveryRequest>> {
    const { data, error } = await supabase
      .from('delivery_requests')
      .insert([requestData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les demandes d'un client
  async getClientRequests(clientId: string): Promise<SupabaseResponse<DeliveryRequest[]>> {
    const { data, error } = await supabase
      .from('delivery_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les demandes dans une zone (pour distributeurs)
  async getRequestsInZone(
    lat: number,
    lng: number,
    radiusKm: number = 50
  ): Promise<SupabaseResponse<DeliveryRequest[]>> {
    const { data, error } = await supabase.rpc('get_requests_in_zone', {
      search_lat: lat,
      search_lng: lng,
      search_radius: radiusKm,
    });

    return { data, error };
  },
};

// Service pour les devis
export const quoteService = {
  // Créer un devis
  async createQuote(
    quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Quote>> {
    const { data, error } = await supabase.from('quotes').insert([quoteData]).select().single();

    return { data, error };
  },

  // Obtenir les devis d'un distributeur
  async getDistributorQuotes(distributorId: string): Promise<SupabaseResponse<Quote[]>> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, delivery_requests(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les devis d'un client
  async getClientQuotes(clientId: string): Promise<SupabaseResponse<Quote[]>> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, delivery_requests(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    return { data, error };
  },
};

// Service pour les commandes
export const orderService = {
  // Créer une commande
  async createOrder(
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Order>> {
    const { data, error } = await supabase.from('orders').insert([orderData]).select().single();

    return { data, error };
  },

  // Obtenir les commandes d'un vendeur
  async getSellerOrders(sellerId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les commandes d'un acheteur
  async getBuyerOrders(buyerId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },
};

// Service pour les catégories
export const categoryService = {
  // Obtenir toutes les catégories
  async getAllCategories(): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    return { data, error };
  },

  // Obtenir les catégories parentes
  async getParentCategories(): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name', { ascending: true });

    return { data, error };
  },

  // Obtenir les sous-catégories
  async getSubCategories(parentId: string): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true });

    return { data, error };
  },
};

// Service pour les propositions
export const propositionService = {
  // Créer une proposition
  async createProposition(
    propositionData: Omit<Proposition, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<Proposition>> {
    const { data, error } = await supabase
      .from('propositions')
      .insert([propositionData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les propositions d'un distributeur
  async getDistributorPropositions(
    distributorId: string
  ): Promise<SupabaseResponse<Proposition[]>> {
    const { data, error } = await supabase
      .from('propositions')
      .select('*, products(*), users!propositions_producer_id_fkey(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les propositions reçues par un producteur
  async getProducerPropositions(producerId: string): Promise<SupabaseResponse<Proposition[]>> {
    const { data, error } = await supabase
      .from('propositions')
      .select('*, products(*), users!propositions_distributor_id_fkey(*)')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Mettre à jour le statut d'une proposition
  async updatePropositionStatus(
    propositionId: string,
    status: string,
    responseMessage?: string
  ): Promise<SupabaseResponse<Proposition>> {
    const { data, error } = await supabase
      .from('propositions')
      .update({
        status,
        responded_at: new Date().toISOString(),
        response_message: responseMessage,
      })
      .eq('id', propositionId)
      .select()
      .single();

    return { data, error };
  },
};

// Service pour les demandes des distributeurs
export const distributorRequestService = {
  // Créer une demande
  async createRequest(
    requestData: Omit<DistributorRequest, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<DistributorRequest>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .insert([requestData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les demandes d'un distributeur
  async getDistributorRequests(
    distributorId: string
  ): Promise<SupabaseResponse<DistributorRequest[]>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .select('*, categories(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir toutes les demandes actives (pour les producteurs)
  async getActiveRequests(): Promise<SupabaseResponse<DistributorRequest[]>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .select('*, categories(*), users!distributor_requests_distributor_id_fkey(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    return { data, error };
  },
};

// Service pour les offres des producteurs
export const producerOfferService = {
  // Créer une offre
  async createOffer(
    offerData: Omit<ProducerOffer, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<ProducerOffer>> {
    const { data, error } = await supabase
      .from('producer_offers')
      .insert([offerData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les offres d'un producteur
  async getProducerOffers(producerId: string): Promise<SupabaseResponse<ProducerOffer[]>> {
    const { data, error } = await supabase
      .from('producer_offers')
      .select('*, distributor_requests(*), users!producer_offers_producer_id_fkey(*)')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les offres pour une demande
  async getOffersForRequest(requestId: string): Promise<SupabaseResponse<ProducerOffer[]>> {
    const { data, error } = await supabase
      .from('producer_offers')
      .select('*, users!producer_offers_producer_id_fkey(*)')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    return { data, error };
  },
};

// Service pour les alertes
export const alertService = {
  // Créer une alerte
  async createAlert(
    alertData: Omit<DistributorAlert, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SupabaseResponse<DistributorAlert>> {
    const { data, error } = await supabase
      .from('distributor_alerts')
      .insert([alertData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les alertes d'un utilisateur
  async getUserAlerts(userId: string): Promise<SupabaseResponse<DistributorAlert[]>> {
    const { data, error } = await supabase
      .from('distributor_alerts')
      .select('*, categories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Mettre à jour une alerte
  async updateAlert(
    alertId: string,
    updates: Partial<DistributorAlert>
  ): Promise<SupabaseResponse<DistributorAlert>> {
    const { data, error } = await supabase
      .from('distributor_alerts')
      .update(updates)
      .eq('id', alertId)
      .select()
      .single();

    return { data, error };
  },

  // Supprimer une alerte
  async deleteAlert(alertId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase.from('distributor_alerts').delete().eq('id', alertId);

    return { data: null, error };
  },
};

// Service pour le suivi des producteurs
export const followService = {
  // Suivre un producteur
  async followProducer(
    distributorId: string,
    producerId: string
  ): Promise<SupabaseResponse<ProducerFollower>> {
    const { data, error } = await supabase
      .from('producer_followers')
      .insert([{ distributor_id: distributorId, producer_id: producerId }])
      .select()
      .single();

    return { data, error };
  },

  // Arrêter de suivre un producteur
  async unfollowProducer(
    distributorId: string,
    producerId: string
  ): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('producer_followers')
      .delete()
      .eq('distributor_id', distributorId)
      .eq('producer_id', producerId);

    return { data: null, error };
  },

  // Vérifier si un producteur est suivi
  async isFollowing(distributorId: string, producerId: string): Promise<SupabaseResponse<boolean>> {
    const { data, error } = await supabase
      .from('producer_followers')
      .select('id')
      .eq('distributor_id', distributorId)
      .eq('producer_id', producerId)
      .single();

    return { data: !!data, error };
  },

  // Obtenir les producteurs suivis
  async getFollowedProducers(distributorId: string): Promise<SupabaseResponse<User[]>> {
    const { data, error } = await supabase
      .from('producer_followers')
      .select('users!producer_followers_producer_id_fkey(*)')
      .eq('distributor_id', distributorId);

    return { data: data?.map((item: any) => item.users as User) ?? null, error };
  },
};

// Service pour les avis sur les produits
export const reviewService = {
  // Créer un avis
  async createReview(
    reviewData: Omit<ProductReview, 'id' | 'created_at'>
  ): Promise<SupabaseResponse<ProductReview>> {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([reviewData])
      .select()
      .single();

    return { data, error };
  },

  // Obtenir les avis d'un produit
  async getProductReviews(productId: string): Promise<SupabaseResponse<ProductReview[]>> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*, users!product_reviews_distributor_id_fkey(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Obtenir les statistiques d'avis d'un produit
  async getProductReviewStats(productId: string): Promise<SupabaseResponse<ProductReviewStats>> {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId);

    if (error) return { data: null, error };

    if (!data || data.length === 0) {
      return {
        data: {
          average_rating: 0,
          total_reviews: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
        error: null,
      };
    }

    const totalReviews = data.length;
    const averageRating = data.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = data.reduce(
      (dist, review) => {
        dist[review.rating as keyof typeof dist]++;
        return dist;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    return {
      data: {
        average_rating: Math.round(averageRating * 10) / 10,
        total_reviews: totalReviews,
        rating_distribution: ratingDistribution,
      },
      error: null,
    };
  },
};

// Service pour les notifications
export const notificationService = {
  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(userId: string): Promise<SupabaseResponse<Notification[]>> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<SupabaseResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    return { data, error };
  },

  // Créer une notification
  async createNotification(
    notificationData: Omit<Notification, 'id' | 'created_at'>
  ): Promise<SupabaseResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select()
      .single();

    return { data, error };
  },
};
