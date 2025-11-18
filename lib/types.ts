// ============================================================================
// Types pour la base de données MATIX B2B Marketplace
// Marketplace avicole B2B au Sénégal
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export type UserRole = 'producer' | 'distributor'

export type UnitType = 'piece' | 'kg' | 'lot' | 'tray' | 'box' | 'bag'

export type ListingStatus = 'active' | 'sold' | 'expired' | 'cancelled'

export type RequestStatus = 'active' | 'fulfilled' | 'expired' | 'cancelled'

export type AlertStatus = 'active' | 'paused' | 'triggered' | 'expired'

export type ProposalType =
  | 'producer_to_request'     // Producteur répond à une demande
  | 'distributor_to_listing'  // Distributeur répond à une annonce
  | 'distributor_to_product'  // Distributeur fait une offre sur un produit

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'counter_offer'

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'disputed'

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'

export type PaymentMethod = 'orange_money' | 'wave' | 'card' | 'cash_on_delivery'

export type DeliveryMode = 'pickup' | 'producer_delivery' | 'matix_delivery'

export type NotificationType =
  | 'new_order'
  | 'order_status'
  | 'payment_received'
  | 'payment_failed'
  | 'proposal_received'
  | 'proposal_accepted'
  | 'proposal_rejected'
  | 'new_message'
  | 'alert_triggered'
  | 'listing_expired'
  | 'request_expired'
  | 'new_rating'
  | 'system'

export type MessageType = 'text' | 'image' | 'file' | 'product_link' | 'order_link'

// ============================================================================
// INTERFACES - UTILISATEURS
// ============================================================================

export interface User {
  id: string
  active_role: UserRole
  is_producer_enabled: boolean
  is_distributor_enabled: boolean
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  first_name?: string
  last_name?: string
  email: string
  phone: string
  avatar_url?: string
  business_name?: string
  business_description?: string
  ninea?: string
  address?: string
  city?: string
  region: string
  coordinates?: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  email_notifications: boolean
  sms_notifications: boolean
  push_notifications: boolean
  language: string
  currency: string
  service_radius_km?: number
  created_at: string
  updated_at: string
}

// Type combiné pour l'utilisateur complet
export interface FullUser extends User {
  profile?: UserProfile
  settings?: UserSettings
}

// ============================================================================
// INTERFACES - CATALOGUE
// ============================================================================

export interface Category {
  id: string
  slug: string
  name_fr: string
  name_wo?: string
  description_fr?: string
  icon?: string
  display_order: number
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  producer_id: string
  category_id: string
  name: string
  description?: string
  price: number
  unit_type: UnitType
  min_order_quantity: number
  stock_quantity: number
  is_available: boolean
  is_organic?: boolean
  is_local_breed?: boolean
  age_weeks?: number
  vaccination_status?: string
  origin?: string
  certifications?: string[]
  is_seasonal?: boolean
  season_start?: number
  season_end?: number
  image_url?: string
  location_coordinates?: {
    type: 'Point'
    coordinates: [number, number]
  }
  view_count: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  producer?: UserProfile
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  display_order: number
  created_at: string
}

// ============================================================================
// INTERFACES - ANNONCES & DEMANDES
// ============================================================================

export interface ProducerListing {
  id: string
  producer_id: string
  product_id: string
  title: string
  description?: string
  quantity_available: number
  unit_type: UnitType
  price_per_unit: number
  is_negotiable: boolean
  expires_at: string
  delivery_zones?: string[]
  status: ListingStatus
  view_count: number
  created_at: string
  updated_at: string
  // Relations
  product?: Product
  producer?: UserProfile
}

export interface DistributorRequest {
  id: string
  distributor_id: string
  category_id?: string
  title: string
  description?: string
  product_name?: string
  quantity_needed: number
  unit_type: UnitType
  budget_min?: number
  budget_max?: number
  needed_by?: string
  expires_at: string
  delivery_region?: string
  delivery_address?: string
  delivery_coordinates?: {
    type: 'Point'
    coordinates: [number, number]
  }
  status: RequestStatus
  proposals_count: number
  view_count: number
  created_at: string
  updated_at: string
  // Relations
  category?: Category
  distributor?: UserProfile
}

export interface DistributorAlert {
  id: string
  distributor_id: string
  category_id?: string
  product_keywords?: string[]
  max_price?: number
  min_quantity?: number
  regions?: string[]
  producer_id?: string
  name: string
  status: AlertStatus
  times_triggered: number
  last_triggered_at?: string
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  sender_id: string
  receiver_id: string
  proposal_type: ProposalType
  listing_id?: string
  request_id?: string
  product_id?: string
  proposed_price: number
  quantity: number
  unit_type: UnitType
  message?: string
  delivery_mode?: DeliveryMode
  delivery_date?: string
  validity_hours: number
  status: ProposalStatus
  expires_at: string
  response_message?: string
  responded_at?: string
  counter_price?: number
  counter_quantity?: number
  created_at: string
  updated_at: string
  // Relations
  sender?: UserProfile
  receiver?: UserProfile
  listing?: ProducerListing
  request?: DistributorRequest
  product?: Product
}

// ============================================================================
// INTERFACES - COMMANDES & PAIEMENTS
// ============================================================================

export interface Order {
  id: string
  order_number: string
  producer_id: string
  distributor_id: string
  proposal_id?: string
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  platform_fee: number
  total_amount: number
  delivery_mode: DeliveryMode
  delivery_address?: string
  delivery_region?: string
  delivery_coordinates?: {
    type: 'Point'
    coordinates: [number, number]
  }
  estimated_delivery_date?: string
  actual_delivery_date?: string
  producer_notes?: string
  distributor_notes?: string
  created_at: string
  updated_at: string
  // Relations
  producer?: UserProfile
  distributor?: UserProfile
  items?: OrderItem[]
  payment?: Payment
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_type: UnitType
  unit_price: number
  total_price: number
  created_at: string
  // Relations
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  amount: number
  currency: string
  payment_method: PaymentMethod
  status: PaymentStatus
  bictorys_charge_id?: string
  bictorys_transaction_id?: string
  bictorys_response?: BictorysResponse
  initiated_at: string
  completed_at?: string
  failed_at?: string
  failure_reason?: string
  created_at: string
  updated_at: string
}

export interface BictorysTransaction {
  id: string
  payment_id?: string
  charge_id?: string
  transaction_id?: string
  operation_type: string
  amount: number
  fees?: number
  net_amount?: number
  status: string
  request_data?: Record<string, unknown>
  response_data?: Record<string, unknown>
  webhook_data?: Record<string, unknown>
  created_at: string
}

export interface Refund {
  id: string
  payment_id: string
  order_id: string
  amount: number
  reason?: string
  bictorys_refund_id?: string
  status: PaymentStatus
  initiated_by: string
  created_at: string
  completed_at?: string
}

// Types Bictorys API
export interface BictorysResponse {
  type?: string
  link?: string
  chargeId?: string
  opToken?: string
  transactionId?: string
  status?: string
  [key: string]: unknown
}

export interface BictorysChargeRequest {
  amount: number
  currency?: string
  description?: string
  customer?: {
    name: string
    email?: string
    phone: string
  }
  metadata?: Record<string, unknown>
  callbackUrl?: string
  redirectUrl?: string
}

// ============================================================================
// INTERFACES - COMMUNICATION
// ============================================================================

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  order_id?: string
  proposal_id?: string
  listing_id?: string
  request_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
}

export interface ChatRoom {
  id: string
  producer_id: string
  distributor_id: string
  last_message_at?: string
  last_message_preview?: string
  producer_unread_count: number
  distributor_unread_count: number
  created_at: string
  updated_at: string
  // Relations
  producer?: UserProfile
  distributor?: UserProfile
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  room_id: string
  sender_id: string
  message_type: MessageType
  content: string
  metadata?: Record<string, unknown>
  is_read: boolean
  read_at?: string
  created_at: string
  // Relations
  sender?: UserProfile
}

// ============================================================================
// INTERFACES - ÉVALUATIONS & FAVORIS
// ============================================================================

export interface Rating {
  id: string
  rater_id: string
  rated_user_id: string
  order_id: string
  rating: number
  comment?: string
  response?: string
  responded_at?: string
  created_at: string
  updated_at: string
  // Relations
  rater?: UserProfile
  rated_user?: UserProfile
  order?: Order
}

export interface FavoriteProduct {
  id: string
  user_id: string
  product_id: string
  created_at: string
  // Relations
  product?: Product
}

export interface FollowedProducer {
  id: string
  distributor_id: string
  producer_id: string
  created_at: string
  // Relations
  producer?: UserProfile
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

// Coordonnées géographiques simplifiées
export interface Coordinates {
  latitude: number
  longitude: number
}

// Conversion PostGIS vers coordonnées simples
export function parseCoordinates(point: { type: 'Point'; coordinates: [number, number] } | null): Coordinates | null {
  if (!point) return null
  return {
    longitude: point.coordinates[0],
    latitude: point.coordinates[1]
  }
}

// Conversion coordonnées simples vers PostGIS
export function toPostGISPoint(coords: Coordinates): string {
  return `POINT(${coords.longitude} ${coords.latitude})`
}

// ============================================================================
// TYPES POUR SUPABASE DATABASE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      user_profiles: {
        Row: UserProfile
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
      }
      user_settings: {
        Row: UserSettings
        Insert: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'view_count'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      product_images: {
        Row: ProductImage
        Insert: Omit<ProductImage, 'id' | 'created_at'>
        Update: Partial<Omit<ProductImage, 'id' | 'created_at'>>
      }
      producer_listings: {
        Row: ProducerListing
        Insert: Omit<ProducerListing, 'id' | 'created_at' | 'updated_at' | 'view_count'>
        Update: Partial<Omit<ProducerListing, 'id' | 'created_at' | 'updated_at'>>
      }
      distributor_requests: {
        Row: DistributorRequest
        Insert: Omit<DistributorRequest, 'id' | 'created_at' | 'updated_at' | 'proposals_count' | 'view_count'>
        Update: Partial<Omit<DistributorRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      distributor_alerts: {
        Row: DistributorAlert
        Insert: Omit<DistributorAlert, 'id' | 'created_at' | 'updated_at' | 'times_triggered'>
        Update: Partial<Omit<DistributorAlert, 'id' | 'created_at' | 'updated_at'>>
      }
      proposals: {
        Row: Proposal
        Insert: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Proposal, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>>
      }
      order_items: {
        Row: OrderItem
        Insert: Omit<OrderItem, 'id' | 'created_at'>
        Update: Partial<Omit<OrderItem, 'id' | 'created_at'>>
      }
      payments: {
        Row: Payment
        Insert: Omit<Payment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Payment, 'id' | 'created_at' | 'updated_at'>>
      }
      bictorys_transactions: {
        Row: BictorysTransaction
        Insert: Omit<BictorysTransaction, 'id' | 'created_at'>
        Update: Partial<Omit<BictorysTransaction, 'id' | 'created_at'>>
      }
      refunds: {
        Row: Refund
        Insert: Omit<Refund, 'id' | 'created_at'>
        Update: Partial<Omit<Refund, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
      chat_rooms: {
        Row: ChatRoom
        Insert: Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'>>
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<ChatMessage, 'id' | 'created_at'>
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>
      }
      ratings: {
        Row: Rating
        Insert: Omit<Rating, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Rating, 'id' | 'created_at' | 'updated_at'>>
      }
      favorite_products: {
        Row: FavoriteProduct
        Insert: Omit<FavoriteProduct, 'id' | 'created_at'>
        Update: Partial<Omit<FavoriteProduct, 'id' | 'created_at'>>
      }
      followed_producers: {
        Row: FollowedProducer
        Insert: Omit<FollowedProducer, 'id' | 'created_at'>
        Update: Partial<Omit<FollowedProducer, 'id' | 'created_at'>>
      }
    }
    Functions: {
      calculate_distance: {
        Args: { point1: unknown; point2: unknown }
        Returns: number
      }
      get_user_average_rating: {
        Args: { user_uuid: string }
        Returns: number
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: NotificationType
          p_title: string
          p_message: string
          p_data?: Record<string, unknown>
          p_order_id?: string
          p_proposal_id?: string
        }
        Returns: string
      }
    }
  }
}

// ============================================================================
// TYPES POUR LES FORMULAIRES
// ============================================================================

export interface CreateProductInput {
  category_id: string
  name: string
  description?: string
  price: number
  unit_type: UnitType
  min_order_quantity?: number
  stock_quantity: number
  is_organic?: boolean
  is_local_breed?: boolean
  age_weeks?: number
  vaccination_status?: string
  origin?: string
  certifications?: string[]
  image_url?: string
}

export interface CreateListingInput {
  product_id: string
  title: string
  description?: string
  quantity_available: number
  unit_type: UnitType
  price_per_unit: number
  is_negotiable?: boolean
  expires_at: string
  delivery_zones?: string[]
}

export interface CreateRequestInput {
  category_id?: string
  title: string
  description?: string
  product_name?: string
  quantity_needed: number
  unit_type: UnitType
  budget_min?: number
  budget_max?: number
  needed_by?: string
  expires_at: string
  delivery_region?: string
  delivery_address?: string
}

export interface CreateProposalInput {
  receiver_id: string
  proposal_type: ProposalType
  listing_id?: string
  request_id?: string
  product_id?: string
  proposed_price: number
  quantity: number
  unit_type: UnitType
  message?: string
  delivery_mode?: DeliveryMode
  delivery_date?: string
  validity_hours?: number
}

export interface CreateOrderInput {
  producer_id: string
  proposal_id?: string
  items: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  delivery_mode: DeliveryMode
  delivery_address?: string
  delivery_region?: string
  distributor_notes?: string
}

// ============================================================================
// TYPES POUR LES RÉPONSES API
// ============================================================================

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const REGIONS_SENEGAL = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Diourbel',
  'Louga',
  'Fatick',
  'Kaolack',
  'Matam',
  'Kaffrine',
  'Kédougou',
  'Kolda',
  'Sédhiou',
  'Tambacounda',
  'Ziguinchor'
] as const

export type RegionSenegal = typeof REGIONS_SENEGAL[number]

export const UNIT_LABELS: Record<UnitType, { fr: string; wo: string }> = {
  piece: { fr: 'Pièce', wo: 'Bennoo' },
  kg: { fr: 'Kilogramme', wo: 'Kilo' },
  lot: { fr: 'Lot', wo: 'Lot' },
  tray: { fr: 'Plateau', wo: 'Palato' },
  box: { fr: 'Carton', wo: 'Karton' },
  bag: { fr: 'Sac', wo: 'Saket' }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'En attente de paiement',
  paid: 'Payée',
  confirmed: 'Confirmée',
  preparing: 'En préparation',
  ready: 'Prête',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  disputed: 'En litige'
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'En attente',
  processing: 'En cours',
  completed: 'Complété',
  failed: 'Échoué',
  refunded: 'Remboursé',
  partially_refunded: 'Partiellement remboursé'
}

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  expired: 'Expirée',
  counter_offer: 'Contre-offre'
}
