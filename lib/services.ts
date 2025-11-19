import { supabase } from './supabase'
import {
  User,
  UserProfile,
  UserSettings,
  FullUser,
  Product,
  Category,
  ProducerListing,
  DistributorRequest,
  DistributorAlert,
  Proposal,
  Order,
  OrderItem,
  Payment,
  BictorysTransaction,
  Refund,
  Notification,
  ChatRoom,
  ChatMessage,
  Rating,
  FavoriteProduct,
  FollowedProducer,
  CreateProductInput,
  CreateListingInput,
  CreateRequestInput,
  CreateProposalInput,
  CreateOrderInput,
  UserRole,
  ProposalStatus,
  OrderStatus,
  PaymentStatus,
  NotificationType,
  toPostGISPoint,
  Coordinates
} from './types'

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

type SupabaseResponse<T> = {
  data: T | null
  error: Error | null
}

type PaginationParams = {
  page?: number
  perPage?: number
}

// ============================================================================
// SERVICE UTILISATEURS
// ============================================================================

export const userService = {
  // Créer un utilisateur complet (user + profile + settings)
  async createUser(
    userId: string,
    email: string,
    phone?: string,
    initialRole: UserRole = 'producer'
  ): Promise<SupabaseResponse<FullUser>> {
    // Créer l'entrée user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        active_role: initialRole,
        is_producer_enabled: true,
        is_distributor_enabled: initialRole === 'distributor'
      })
      .select()
      .single()

    if (userError) return { data: null, error: userError }

    // Créer le profil
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        email,
        phone: phone || '',
        region: 'Dakar'
      })
      .select()
      .single()

    if (profileError) return { data: null, error: profileError }

    // Créer les paramètres
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .insert({
        user_id: userId
      })
      .select()
      .single()

    if (settingsError) return { data: null, error: settingsError }

    return {
      data: { ...user, profile, settings },
      error: null
    }
  },

  // Obtenir l'utilisateur complet
  async getFullUser(userId: string): Promise<SupabaseResponse<FullUser>> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError) return { data: null, error: userError }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single()

    return {
      data: { ...user, profile: profile || undefined, settings: settings || undefined },
      error: null
    }
  },

  // Obtenir le profil utilisateur
  async getProfile(userId: string): Promise<SupabaseResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  },

  // Mettre à jour le profil
  async updateProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<SupabaseResponse<UserProfile>> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Mettre à jour les coordonnées GPS
  async updateCoordinates(
    userId: string,
    coords: Coordinates
  ): Promise<SupabaseResponse<UserProfile>> {
    const point = toPostGISPoint(coords)
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ coordinates: point })
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Changer le rôle actif
  async switchRole(userId: string, newRole: UserRole): Promise<SupabaseResponse<User>> {
    // Vérifier que le rôle est activé
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) return { data: null, error: fetchError }

    if (newRole === 'producer' && !user.is_producer_enabled) {
      return { data: null, error: new Error('Le rôle producteur n\'est pas activé') }
    }
    if (newRole === 'distributor' && !user.is_distributor_enabled) {
      return { data: null, error: new Error('Le rôle distributeur n\'est pas activé') }
    }

    const { data, error } = await supabase
      .from('users')
      .update({ active_role: newRole })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Activer le rôle distributeur
  async enableDistributorRole(userId: string): Promise<SupabaseResponse<User>> {
    const { data, error } = await supabase
      .from('users')
      .update({ is_distributor_enabled: true })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Mettre à jour les paramètres
  async updateSettings(
    userId: string,
    updates: Partial<UserSettings>
  ): Promise<SupabaseResponse<UserSettings>> {
    const { data, error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()

    return { data, error }
  },

  // Obtenir la note moyenne d'un utilisateur
  async getUserRating(userId: string): Promise<SupabaseResponse<number>> {
    const { data, error } = await supabase
      .rpc('get_user_average_rating', { user_uuid: userId })

    return { data, error }
  }
}

// ============================================================================
// SERVICE CATÉGORIES
// ============================================================================

export const categoryService = {
  // Obtenir toutes les catégories (alias)
  async getAll(): Promise<SupabaseResponse<Category[]>> {
    return this.getAllCategories()
  },

  // Obtenir toutes les catégories
  async getAllCategories(): Promise<SupabaseResponse<Category[]>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    return { data, error }
  },

  // Obtenir une catégorie par slug
  async getCategoryBySlug(slug: string): Promise<SupabaseResponse<Category>> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    return { data, error }
  }
}

// ============================================================================
// SERVICE PRODUITS
// ============================================================================

export const productService = {
  // Créer un produit
  async createProduct(
    producerId: string,
    productData: CreateProductInput
  ): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        producer_id: producerId,
        ...productData
      })
      .select('*, category:categories(*)')
      .single()

    return { data, error }
  },

  // Obtenir tous les produits disponibles
  async getAllProducts(params?: PaginationParams): Promise<SupabaseResponse<Product[]>> {
    let query = supabase
      .from('products')
      .select('*, category:categories(*), producer:user_profiles!products_producer_id_fkey(*)')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (params?.page && params?.perPage) {
      const from = (params.page - 1) * params.perPage
      const to = from + params.perPage - 1
      query = query.range(from, to)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Obtenir les produits d'un producteur
  async getProductsByProducer(producerId: string): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*)')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir les produits par catégorie
  async getProductsByCategory(categoryId: string): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), producer:user_profiles!products_producer_id_fkey(*)')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir un produit par ID
  async getProductById(productId: string): Promise<SupabaseResponse<Product>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), producer:user_profiles!products_producer_id_fkey(*)')
      .eq('id', productId)
      .single()

    // Incrémenter le compteur de vues
    if (data) {
      await supabase
        .from('products')
        .update({ view_count: data.view_count + 1 })
        .eq('id', productId)
    }

    return { data, error }
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
      .select('*, category:categories(*)')
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

  // Rechercher des produits
  async searchProducts(query: string): Promise<SupabaseResponse<Product[]>> {
    const { data, error } = await supabase
      .from('products')
      .select('*, category:categories(*), producer:user_profiles!products_producer_id_fkey(*)')
      .eq('is_available', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    return { data, error }
  }
}

// ============================================================================
// SERVICE ANNONCES PRODUCTEUR
// ============================================================================

export const listingService = {
  // Créer une annonce
  async createListing(
    producerId: string,
    listingData: CreateListingInput
  ): Promise<SupabaseResponse<ProducerListing>> {
    const { data, error } = await supabase
      .from('producer_listings')
      .insert({
        producer_id: producerId,
        ...listingData
      })
      .select('*, product:products(*)')
      .single()

    return { data, error }
  },

  // Obtenir toutes les annonces actives
  async getActiveListings(params?: PaginationParams): Promise<SupabaseResponse<ProducerListing[]>> {
    let query = supabase
      .from('producer_listings')
      .select('*, product:products(*), producer:user_profiles!producer_listings_producer_id_fkey(*)')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (params?.page && params?.perPage) {
      const from = (params.page - 1) * params.perPage
      const to = from + params.perPage - 1
      query = query.range(from, to)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Obtenir les annonces d'un producteur
  async getProducerListings(producerId: string): Promise<SupabaseResponse<ProducerListing[]>> {
    const { data, error } = await supabase
      .from('producer_listings')
      .select('*, product:products(*)')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir une annonce par ID
  async getListingById(listingId: string): Promise<SupabaseResponse<ProducerListing>> {
    const { data, error } = await supabase
      .from('producer_listings')
      .select('*, product:products(*), producer:user_profiles!producer_listings_producer_id_fkey(*)')
      .eq('id', listingId)
      .single()

    return { data, error }
  },

  // Mettre à jour une annonce
  async updateListing(
    listingId: string,
    updates: Partial<ProducerListing>
  ): Promise<SupabaseResponse<ProducerListing>> {
    const { data, error } = await supabase
      .from('producer_listings')
      .update(updates)
      .eq('id', listingId)
      .select('*, product:products(*)')
      .single()

    return { data, error }
  },

  // Annuler une annonce
  async cancelListing(listingId: string): Promise<SupabaseResponse<ProducerListing>> {
    return this.updateListing(listingId, { status: 'cancelled' })
  }
}

// ============================================================================
// SERVICE DEMANDES DISTRIBUTEUR
// ============================================================================

export const requestService = {
  // Créer une demande
  async createRequest(
    distributorId: string,
    requestData: CreateRequestInput
  ): Promise<SupabaseResponse<DistributorRequest>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .insert({
        distributor_id: distributorId,
        ...requestData
      })
      .select('*, category:categories(*)')
      .single()

    return { data, error }
  },

  // Obtenir toutes les demandes actives (opportunités pour producteurs)
  async getActiveRequests(params?: PaginationParams): Promise<SupabaseResponse<DistributorRequest[]>> {
    let query = supabase
      .from('distributor_requests')
      .select('*, category:categories(*), distributor:user_profiles!distributor_requests_distributor_id_fkey(*)')
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (params?.page && params?.perPage) {
      const from = (params.page - 1) * params.perPage
      const to = from + params.perPage - 1
      query = query.range(from, to)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Obtenir les demandes d'un distributeur
  async getDistributorRequests(distributorId: string): Promise<SupabaseResponse<DistributorRequest[]>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .select('*, category:categories(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir une demande par ID
  async getRequestById(requestId: string): Promise<SupabaseResponse<DistributorRequest>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .select('*, category:categories(*), distributor:user_profiles!distributor_requests_distributor_id_fkey(*)')
      .eq('id', requestId)
      .single()

    return { data, error }
  },

  // Mettre à jour une demande
  async updateRequest(
    requestId: string,
    updates: Partial<DistributorRequest>
  ): Promise<SupabaseResponse<DistributorRequest>> {
    const { data, error } = await supabase
      .from('distributor_requests')
      .update(updates)
      .eq('id', requestId)
      .select('*, category:categories(*)')
      .single()

    return { data, error }
  },

  // Annuler une demande
  async cancelRequest(requestId: string): Promise<SupabaseResponse<DistributorRequest>> {
    return this.updateRequest(requestId, { status: 'cancelled' })
  }
}

// ============================================================================
// SERVICE ALERTES DISTRIBUTEUR
// ============================================================================

export const alertService = {
  // Créer une alerte
  async createAlert(
    distributorId: string,
    alertData: Omit<DistributorAlert, 'id' | 'distributor_id' | 'created_at' | 'updated_at' | 'times_triggered'>
  ): Promise<SupabaseResponse<DistributorAlert>> {
    const { data, error } = await supabase
      .from('distributor_alerts')
      .insert({
        distributor_id: distributorId,
        ...alertData
      })
      .select()
      .single()

    return { data, error }
  },

  // Obtenir les alertes d'un distributeur
  async getDistributorAlerts(distributorId: string): Promise<SupabaseResponse<DistributorAlert[]>> {
    const { data, error } = await supabase
      .from('distributor_alerts')
      .select('*')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })

    return { data, error }
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
      .single()

    return { data, error }
  },

  // Supprimer une alerte
  async deleteAlert(alertId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('distributor_alerts')
      .delete()
      .eq('id', alertId)

    return { data: null, error }
  }
}

// ============================================================================
// SERVICE PROPOSITIONS
// ============================================================================

export const proposalService = {
  // Créer une proposition
  async createProposal(
    senderId: string,
    proposalData: CreateProposalInput
  ): Promise<SupabaseResponse<Proposal>> {
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + (proposalData.validity_hours || 48))

    const { data, error } = await supabase
      .from('proposals')
      .insert({
        sender_id: senderId,
        ...proposalData,
        expires_at: expiresAt.toISOString()
      })
      .select('*, sender:user_profiles!proposals_sender_id_fkey(*), receiver:user_profiles!proposals_receiver_id_fkey(*)')
      .single()

    // Créer une notification pour le destinataire
    if (data) {
      await notificationService.createNotification(
        proposalData.receiver_id,
        'proposal_received',
        'Nouvelle proposition reçue',
        `Vous avez reçu une nouvelle proposition`,
        { proposal_id: data.id }
      )
    }

    return { data, error }
  },

  // Obtenir les propositions envoyées
  async getSentProposals(userId: string): Promise<SupabaseResponse<Proposal[]>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, receiver:user_profiles!proposals_receiver_id_fkey(*), product:products(*)')
      .eq('sender_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir les propositions reçues
  async getReceivedProposals(userId: string): Promise<SupabaseResponse<Proposal[]>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, sender:user_profiles!proposals_sender_id_fkey(*), product:products(*)')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir une proposition par ID
  async getProposalById(proposalId: string): Promise<SupabaseResponse<Proposal>> {
    const { data, error } = await supabase
      .from('proposals')
      .select('*, sender:user_profiles!proposals_sender_id_fkey(*), receiver:user_profiles!proposals_receiver_id_fkey(*), product:products(*)')
      .eq('id', proposalId)
      .single()

    return { data, error }
  },

  // Répondre à une proposition
  async respondToProposal(
    proposalId: string,
    status: ProposalStatus,
    responseMessage?: string
  ): Promise<SupabaseResponse<Proposal>> {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status,
        response_message: responseMessage,
        responded_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .select('*, sender:user_profiles!proposals_sender_id_fkey(*)')
      .single()

    // Notifier l'expéditeur
    if (data) {
      const notifType = status === 'accepted' ? 'proposal_accepted' : 'proposal_rejected'
      const notifTitle = status === 'accepted' ? 'Proposition acceptée' : 'Proposition refusée'

      await notificationService.createNotification(
        data.sender_id,
        notifType,
        notifTitle,
        responseMessage || `Votre proposition a été ${status === 'accepted' ? 'acceptée' : 'refusée'}`,
        { proposal_id: proposalId }
      )
    }

    return { data, error }
  },

  // Faire une contre-offre
  async makeCounterOffer(
    proposalId: string,
    counterPrice: number,
    counterQuantity?: number,
    message?: string
  ): Promise<SupabaseResponse<Proposal>> {
    const { data, error } = await supabase
      .from('proposals')
      .update({
        status: 'counter_offer',
        counter_price: counterPrice,
        counter_quantity: counterQuantity,
        response_message: message,
        responded_at: new Date().toISOString()
      })
      .eq('id', proposalId)
      .select()
      .single()

    return { data, error }
  }
}

// ============================================================================
// SERVICE COMMANDES
// ============================================================================

export const orderService = {
  // Créer une commande
  async createOrder(
    distributorId: string,
    orderData: CreateOrderInput
  ): Promise<SupabaseResponse<Order>> {
    // Calculer les montants
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    )
    const platformFee = subtotal * 0.02 // 2% de frais plateforme
    const deliveryFee = 0 // À calculer selon le mode de livraison

    // Créer la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        producer_id: orderData.producer_id,
        distributor_id: distributorId,
        proposal_id: orderData.proposal_id,
        status: 'pending_payment',
        subtotal,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        total_amount: subtotal + deliveryFee + platformFee,
        delivery_mode: orderData.delivery_mode,
        delivery_address: orderData.delivery_address,
        delivery_region: orderData.delivery_region,
        distributor_notes: orderData.distributor_notes
      })
      .select()
      .single()

    if (orderError) return { data: null, error: orderError }

    // Créer les lignes de commande
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_name: '', // Sera récupéré
      quantity: item.quantity,
      unit_type: 'piece' as const, // À récupérer du produit
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }))

    // Récupérer les noms des produits
    for (const item of orderItems) {
      const { data: product } = await supabase
        .from('products')
        .select('name, unit_type')
        .eq('id', item.product_id)
        .single()

      if (product) {
        item.product_name = product.name
        item.unit_type = product.unit_type
      }
    }

    await supabase.from('order_items').insert(orderItems)

    // Notifier le producteur
    await notificationService.createNotification(
      orderData.producer_id,
      'new_order',
      'Nouvelle commande',
      `Vous avez reçu une nouvelle commande #${order.order_number}`,
      { order_id: order.id }
    )

    return { data: order, error: null }
  },

  // Obtenir les commandes d'un producteur
  async getProducerOrders(producerId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), distributor:user_profiles!orders_distributor_id_fkey(*)')
      .eq('producer_id', producerId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir les commandes d'un distributeur
  async getDistributorOrders(distributorId: string): Promise<SupabaseResponse<Order[]>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), producer:user_profiles!orders_producer_id_fkey(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Obtenir une commande par ID
  async getOrderById(orderId: string): Promise<SupabaseResponse<Order>> {
    const { data, error } = await supabase
      .from('orders')
      .select('*, items:order_items(*), producer:user_profiles!orders_producer_id_fkey(*), distributor:user_profiles!orders_distributor_id_fkey(*), payment:payments(*)')
      .eq('id', orderId)
      .single()

    return { data, error }
  },

  // Mettre à jour le statut d'une commande
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<SupabaseResponse<Order>> {
    const updates: Partial<Order> = { status }

    if (status === 'delivered') {
      updates.actual_delivery_date = new Date().toISOString()
    }
    if (notes) {
      updates.producer_notes = notes
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*, distributor:user_profiles!orders_distributor_id_fkey(*)')
      .single()

    // Notifier le distributeur
    if (data) {
      await notificationService.createNotification(
        data.distributor_id,
        'order_status',
        'Statut de commande mis à jour',
        `Votre commande #${data.order_number} est maintenant: ${status}`,
        { order_id: orderId }
      )
    }

    return { data, error }
  }
}

// ============================================================================
// SERVICE PAIEMENTS
// ============================================================================

export const paymentService = {
  // Créer un paiement
  async createPayment(
    orderId: string,
    amount: number,
    paymentMethod: Payment['payment_method']
  ): Promise<SupabaseResponse<Payment>> {
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        amount,
        payment_method: paymentMethod,
        status: 'pending'
      })
      .select()
      .single()

    return { data, error }
  },

  // Obtenir le paiement d'une commande
  async getPaymentByOrder(orderId: string): Promise<SupabaseResponse<Payment>> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .single()

    return { data, error }
  },

  // Mettre à jour le statut du paiement (après webhook Bictorys)
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    bictorysData?: {
      charge_id?: string
      transaction_id?: string
      response?: Record<string, unknown>
    }
  ): Promise<SupabaseResponse<Payment>> {
    const updates: Partial<Payment> = {
      status,
      bictorys_charge_id: bictorysData?.charge_id,
      bictorys_transaction_id: bictorysData?.transaction_id,
      bictorys_response: bictorysData?.response as Payment['bictorys_response']
    }

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    } else if (status === 'failed') {
      updates.failed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', paymentId)
      .select()
      .single()

    // Si le paiement est complété, mettre à jour la commande
    if (data && status === 'completed') {
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', data.order_id)
    }

    return { data, error }
  },

  // Enregistrer une transaction Bictorys
  async logBictorysTransaction(
    paymentId: string,
    transactionData: Omit<BictorysTransaction, 'id' | 'payment_id' | 'created_at'>
  ): Promise<SupabaseResponse<BictorysTransaction>> {
    const { data, error } = await supabase
      .from('bictorys_transactions')
      .insert({
        payment_id: paymentId,
        ...transactionData
      })
      .select()
      .single()

    return { data, error }
  },

  // Créer un remboursement
  async createRefund(
    paymentId: string,
    orderId: string,
    amount: number,
    reason: string,
    initiatedBy: string
  ): Promise<SupabaseResponse<Refund>> {
    const { data, error } = await supabase
      .from('refunds')
      .insert({
        payment_id: paymentId,
        order_id: orderId,
        amount,
        reason,
        initiated_by: initiatedBy,
        status: 'pending'
      })
      .select()
      .single()

    return { data, error }
  }
}

// ============================================================================
// SERVICE NOTIFICATIONS
// ============================================================================

export const notificationService = {
  // Créer une notification
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<SupabaseResponse<Notification>> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || {}
      })
      .select()
      .single()

    return { data: notification, error }
  },

  // Obtenir les notifications d'un utilisateur
  async getUserNotifications(
    userId: string,
    unreadOnly: boolean = false
  ): Promise<SupabaseResponse<Notification[]>> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query
    return { data, error }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<SupabaseResponse<Notification>> {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single()

    return { data, error }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(userId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('is_read', false)

    return { data: null, error }
  },

  // Compter les notifications non lues
  async getUnreadCount(userId: string): Promise<SupabaseResponse<number>> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    return { data: count || 0, error }
  }
}

// ============================================================================
// SERVICE CHAT
// ============================================================================

export const chatService = {
  // Obtenir ou créer une conversation
  async getOrCreateRoom(
    producerId: string,
    distributorId: string
  ): Promise<SupabaseResponse<ChatRoom>> {
    // Vérifier si la room existe
    const { data: existing } = await supabase
      .from('chat_rooms')
      .select('*')
      .eq('producer_id', producerId)
      .eq('distributor_id', distributorId)
      .single()

    if (existing) {
      return { data: existing, error: null }
    }

    // Créer la room
    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        producer_id: producerId,
        distributor_id: distributorId
      })
      .select()
      .single()

    return { data, error }
  },

  // Obtenir les conversations d'un utilisateur
  async getUserRooms(userId: string): Promise<SupabaseResponse<ChatRoom[]>> {
    const { data, error } = await supabase
      .from('chat_rooms')
      .select('*, producer:user_profiles!chat_rooms_producer_id_fkey(*), distributor:user_profiles!chat_rooms_distributor_id_fkey(*)')
      .or(`producer_id.eq.${userId},distributor_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })

    return { data, error }
  },

  // Obtenir les messages d'une conversation
  async getRoomMessages(
    roomId: string,
    limit: number = 50
  ): Promise<SupabaseResponse<ChatMessage[]>> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, sender:user_profiles!chat_messages_sender_id_fkey(*)')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(limit)

    return { data: data?.reverse() || null, error }
  },

  // Envoyer un message
  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    messageType: ChatMessage['message_type'] = 'text',
    metadata?: Record<string, unknown>
  ): Promise<SupabaseResponse<ChatMessage>> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        message_type: messageType,
        content,
        metadata: metadata || {}
      })
      .select()
      .single()

    // Mettre à jour la room
    if (data) {
      await supabase
        .from('chat_rooms')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: content.substring(0, 100)
        })
        .eq('id', roomId)
    }

    return { data, error }
  },

  // Marquer les messages comme lus
  async markMessagesAsRead(
    roomId: string,
    userId: string
  ): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('chat_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('room_id', roomId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    return { data: null, error }
  }
}

// ============================================================================
// SERVICE ÉVALUATIONS
// ============================================================================

export const ratingService = {
  // Créer une évaluation
  async createRating(
    raterId: string,
    ratedUserId: string,
    orderId: string,
    rating: number,
    comment?: string
  ): Promise<SupabaseResponse<Rating>> {
    const { data, error } = await supabase
      .from('ratings')
      .insert({
        rater_id: raterId,
        rated_user_id: ratedUserId,
        order_id: orderId,
        rating,
        comment
      })
      .select()
      .single()

    // Notifier l'utilisateur évalué
    if (data) {
      await notificationService.createNotification(
        ratedUserId,
        'new_rating',
        'Nouvelle évaluation',
        `Vous avez reçu une évaluation de ${rating}/5`,
        { rating_id: data.id }
      )
    }

    return { data, error }
  },

  // Obtenir les évaluations d'un utilisateur
  async getUserRatings(userId: string): Promise<SupabaseResponse<Rating[]>> {
    const { data, error } = await supabase
      .from('ratings')
      .select('*, rater:user_profiles!ratings_rater_id_fkey(*), order:orders(*)')
      .eq('rated_user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Répondre à une évaluation
  async respondToRating(
    ratingId: string,
    response: string
  ): Promise<SupabaseResponse<Rating>> {
    const { data, error } = await supabase
      .from('ratings')
      .update({
        response,
        responded_at: new Date().toISOString()
      })
      .eq('id', ratingId)
      .select()
      .single()

    return { data, error }
  }
}

// ============================================================================
// SERVICE FAVORIS & SUIVIS
// ============================================================================

export const favoriteService = {
  // Ajouter un produit aux favoris
  async addFavorite(
    userId: string,
    productId: string
  ): Promise<SupabaseResponse<FavoriteProduct>> {
    const { data, error } = await supabase
      .from('favorite_products')
      .insert({
        user_id: userId,
        product_id: productId
      })
      .select()
      .single()

    return { data, error }
  },

  // Retirer des favoris
  async removeFavorite(userId: string, productId: string): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('favorite_products')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId)

    return { data: null, error }
  },

  // Obtenir les favoris
  async getUserFavorites(userId: string): Promise<SupabaseResponse<FavoriteProduct[]>> {
    const { data, error } = await supabase
      .from('favorite_products')
      .select('*, product:products(*, category:categories(*), producer:user_profiles!products_producer_id_fkey(*))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Vérifier si un produit est en favori
  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const { data } = await supabase
      .from('favorite_products')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    return !!data
  }
}

export const followService = {
  // Suivre un producteur
  async followProducer(
    distributorId: string,
    producerId: string
  ): Promise<SupabaseResponse<FollowedProducer>> {
    const { data, error } = await supabase
      .from('followed_producers')
      .insert({
        distributor_id: distributorId,
        producer_id: producerId
      })
      .select()
      .single()

    return { data, error }
  },

  // Ne plus suivre
  async unfollowProducer(
    distributorId: string,
    producerId: string
  ): Promise<SupabaseResponse<null>> {
    const { error } = await supabase
      .from('followed_producers')
      .delete()
      .eq('distributor_id', distributorId)
      .eq('producer_id', producerId)

    return { data: null, error }
  },

  // Obtenir les producteurs suivis
  async getFollowedProducers(distributorId: string): Promise<SupabaseResponse<FollowedProducer[]>> {
    const { data, error } = await supabase
      .from('followed_producers')
      .select('*, producer:user_profiles!followed_producers_producer_id_fkey(*)')
      .eq('distributor_id', distributorId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Vérifier si on suit un producteur
  async isFollowing(distributorId: string, producerId: string): Promise<boolean> {
    const { data } = await supabase
      .from('followed_producers')
      .select('id')
      .eq('distributor_id', distributorId)
      .eq('producer_id', producerId)
      .single()

    return !!data
  },

  // Obtenir le nombre de followers d'un producteur
  async getFollowerCount(producerId: string): Promise<SupabaseResponse<number>> {
    const { count, error } = await supabase
      .from('followed_producers')
      .select('*', { count: 'exact', head: true })
      .eq('producer_id', producerId)

    return { data: count || 0, error }
  }
}
