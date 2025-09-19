// Types pour la base de données MATIX

export type UserType = 'producer' | 'distributor' | 'client'
export type SubscriptionStatus = 'active' | 'inactive' | 'expired'
export type SubscriptionType = 'producer_monthly' | 'distributor_monthly'
export type UnitType = 'piece' | 'kg' | 'lot' | 'liter'
export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'orange_money' | 'wave' | 'free_money' | 'bictorys' | 'cash'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'
export type DeliveryRequestStatus = 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed'

export interface User {
  id: string
  user_type: UserType
  subscription_status: SubscriptionStatus
  business_name?: string
  business_license?: string
  coordinates?: { lat: number; lng: number }
  radius_km?: number
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  producer_id: string
  title: string
  title_fr?: string
  title_wo?: string
  description: string
  description_fr?: string
  description_wo?: string
  price: number
  sale_price?: number
  cost_price?: number
  discount_percentage?: number
  stock_quantity: number
  available_quantity: number
  unit_type: UnitType
  harvest_date?: string
  expiry_date?: string
  is_organic: boolean
  is_local_breed: boolean
  age_weeks?: number
  vaccination_status?: string
  distributor_price?: number
  retail_price?: number
  location_coordinates?: { lat: number; lng: number }
  created_at: string
  updated_at: string
}

export interface DeliveryRequest {
  id: string
  client_id: string
  product_description: string
  quantity: number
  budget_range: { min: number; max: number }
  pickup_address?: string
  pickup_coordinates?: { lat: number; lng: number }
  delivery_address?: string
  delivery_coordinates?: { lat: number; lng: number }
  status: DeliveryRequestStatus
  created_at: string
  updated_at: string
}

export interface Quote {
  id: string
  distributor_id: string
  client_id: string
  delivery_request_id: string
  products: Array<{
    product_id: string
    quantity: number
    unit_price: number
  }>
  subtotal: number
  delivery_fee: number
  total_amount: number
  valid_until: string
  status: QuoteStatus
  payment_link?: string
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  seller_id: string
  seller_type: 'producer' | 'distributor'
  buyer_id: string
  status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  is_direct_sale: boolean
  commission_rate?: number
  commission_amount?: number
  delivery_coordinates?: { lat: number; lng: number }
  delivery_distance_km?: number
  quote_id?: string
  total_amount: number
  created_at: string
  updated_at: string
}

export interface Brand {
  id: string
  distributor_id: string
  name: string
  description?: string
  logo_url?: string
  created_at: string
  updated_at: string
}

export interface BrandProduct {
  id: string
  brand_id: string
  product_id: string
  custom_price?: number
  custom_description?: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  name_fr?: string
  name_wo?: string
  description?: string
  description_fr?: string
  description_wo?: string
  icon?: string
  parent_id?: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>
      }
      delivery_requests: {
        Row: DeliveryRequest
        Insert: Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DeliveryRequest, 'id' | 'created_at' | 'updated_at'>>
      }
      quotes: {
        Row: Quote
        Insert: Omit<Quote, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Quote, 'id' | 'created_at' | 'updated_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'updated_at'>>
      }
      brands: {
        Row: Brand
        Insert: Omit<Brand, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>
      }
      brand_products: {
        Row: BrandProduct
        Insert: Omit<BrandProduct, 'id' | 'created_at'>
        Update: Partial<Omit<BrandProduct, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
