import { supabase, supabaseAdmin } from './supabase'
import { Database, User, Product, DeliveryRequest, Quote, Order, Brand, Category } from './types'

// Types pour les réponses
type SupabaseResponse<T> = {
  data: T | null
  error: any
}

// Service pour les utilisateurs
export const userService = {
  // Créer un profil utilisateur
  async createProfile(userId: string, userData: Partial<User>): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, ...userData }])
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir le profil utilisateur
  async getProfile(userId: string): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    return { data, error }
  },

  // Mettre à jour le profil utilisateur
  async updateProfile(userId: string, updates: Partial<User>): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir tous les utilisateurs (admin)
  async getAllUsers(): Promise<SupabaseResponse<User[]>> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Service pour les produits
export const productService = {
  // Créer un produit
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir tous les produits
  async getAllProducts(): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, users!products_producer_id_fkey(*)')
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Obtenir les produits d'un producteur
  async getProductsByProducer(producerId: string): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Obtenir un produit par ID
  async getProductById(productId: string): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, users!products_producer_id_fkey(*)')
      .eq('id', productId)
      .single()
    
    return { data, error }
  },

  // Mettre à jour un produit
  async updateProduct(productId: string, updates: Partial<Product>): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()
    
    return { data, error }
  },

  // Supprimer un produit
  async deleteProduct(productId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
    
    return { data: null, error }
  },

  // Rechercher des produits par géolocalisation
  async searchProductsNearby(lat: number, lng: number, radiusKm: number = 50): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .rpc('search_products_nearby', {
        search_lat: lat,
        search_lng: lng,
        search_radius: radiusKm
      })
    
    return { data, error }
  }
}

// Service pour les demandes de livraison
export const deliveryRequestService = {
  // Créer une demande de livraison
  async createRequest(requestData: Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<DeliveryRequest>> {
    const { data, error } = await supabase
      .from('delivery_requests')
      .insert([requestData])
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir les demandes d'un client
  async getClientRequests(clientId: string): Promise<SupabaseResponse<DeliveryRequest[]>> {
    const { data, error } = await supabase
      .from('delivery_requests')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Obtenir les demandes dans une zone (pour distributeurs)
  async getRequestsInZone(lat: number, lng: number, radiusKm: number = 50): Promise<SupabaseResponse<DeliveryRequest[]>> {
    const { data, error } = await supabase
      .rpc('get_requests_in_zone', {
        search_lat: lat,
        search_lng: lng,
        search_radius: radiusKm
      })
    
    return { data, error }
  }
}

// Service pour les devis
export const quoteService = {
  // Créer un devis
  async createQuote(quoteData: Omit<Quote, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<Quote>> {
    const { data, error } = await supabase
      .from('quotes')
      .insert([quoteData])
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir les devis d'un distributeur
  async getDistributorQuotes(distributorId: string): Promise<SupabaseResponse<Quote[]>> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, delivery_requests(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Obtenir les devis d'un client
  async getClientQuotes(clientId: string): Promise<SupabaseResponse<Quote[]>> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*, delivery_requests(*)')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Service pour les commandes
export const orderService = {
  // Créer une commande
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()
    
    return { data, error }
  },

  // Obtenir les commandes d'un vendeur
  async getSellerOrders(sellerId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Obtenir les commandes d'un acheteur
  async getBuyerOrders(buyerId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Service pour les catégories
export const categoryService = {
  // Obtenir toutes les catégories
  async getAllCategories(): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    return { data, error }
  },

  // Obtenir les catégories parentes
  async getParentCategories(): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .order('name', { ascending: true })
    
    return { data, error }
  },

  // Obtenir les sous-catégories
  async getSubCategories(parentId: string): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true })
    
    return { data, error }
  }
}
