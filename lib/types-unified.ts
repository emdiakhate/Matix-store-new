// Types unifiés pour la gestion des profils Producteur/Distributeur
// Abstraction du profil "Client" - Focus sur Producteur et Distributeur

export type UserRole = 'producer' | 'distributor';
export type SubscriptionStatus = 'active' | 'inactive' | 'expired';
export type SubscriptionType = 'producer_monthly' | 'distributor_monthly';

// Interface User unifiée pour Producteur et Distributeur
export interface UnifiedUser {
  // Champs de base (communs)
  id: string;
  email: string;
  phone: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Système de rôles unifié
  role: UserRole;                    // 'producer' | 'distributor'
  roles?: UserRole[];                // Rôles disponibles pour le switch
  subscription_status: SubscriptionStatus;
  subscription_type?: SubscriptionType;
  is_verified: boolean;
  
  // Géolocalisation (commune)
  coordinates?: { lat: number; lng: number };
  region?: string;
  city?: string;
  address?: string;
  
  // Champs spécifiques Producteur
  producer_fields?: {
    farm_name?: string;
    farm_address?: string;
    farm_latitude?: number;
    farm_longitude?: number;
    location_accuracy?: number;
    type_elevage?: string;           // "Poulets de chair", "Poules pondeuses", etc.
    superficie?: string;            // "2 hectares"
    capacite?: string;              // "500 têtes"
    certification_bio?: boolean;
    licence?: string;               // "AV-2024-DK-001245"
    radius_km?: number;             // Rayon de livraison
    delivery_settings?: {
      max_radius_km: number;
      cost_per_km: number;
      available_hours: { start: string; end: string };
      working_days: string[];
    };
  };
  
  // Champs spécifiques Distributeur
  distributor_fields?: {
    business_name?: string;
    business_license?: string;
    ninea?: string;
    zone?: string;
    specializations?: string[];      // ["Poulets", "Œufs", "Poussins"]
    target_regions?: string[];      // ["Dakar", "Thiès", "Kaolack"]
    budget_range?: {
      min: number;
      max: number;
    };
    preferred_suppliers?: string[]; // IDs des producteurs préférés
  };
  
  // Statistiques communes
  stats?: {
    rating?: number;
    response_time_hours?: number;
    total_orders?: number;
    total_revenue?: number;
    member_since?: string;
  };
  
  // Préférences utilisateur
  preferences?: {
    language?: 'fr' | 'en' | 'wo';
    notifications?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    theme?: 'light' | 'dark';
  };
}

// Types pour les fonctionnalités spécifiques
export interface ProducerCapabilities {
  can_create_products: boolean;
  can_manage_inventory: boolean;
  can_set_delivery_radius: boolean;
  can_verify_location: boolean;
  can_view_analytics: boolean;
  can_manage_orders: boolean;
}

export interface DistributorCapabilities {
  can_search_producers: boolean;
  can_create_requests: boolean;
  can_send_propositions: boolean;
  can_manage_alerts: boolean;
  can_view_marketplace: boolean;
  can_manage_purchases: boolean;
}

// Type union pour les capacités
export type UserCapabilities = ProducerCapabilities | DistributorCapabilities;

// Interface pour la navigation adaptative
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  roles: UserRole[];                 // Quels rôles peuvent accéder à cette page
  badge?: number;
  is_external?: boolean;
}

// Configuration des layouts
export interface LayoutConfig {
  role: UserRole;
  primary_color: string;
  secondary_color: string;
  logo_variant: 'producer' | 'distributor';
  navigation_items: NavigationItem[];
  dashboard_widgets: string[];
}

// Types pour les permissions
export type Permission = 
  | 'view_dashboard'
  | 'manage_products'
  | 'manage_orders'
  | 'view_analytics'
  | 'manage_profile'
  | 'search_producers'
  | 'create_requests'
  | 'send_propositions'
  | 'manage_alerts'
  | 'view_marketplace'
  | 'manage_purchases'
  | 'verify_location'
  | 'manage_delivery_settings';

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Configuration des rôles
export const ROLE_CONFIG: Record<UserRole, LayoutConfig> = {
  producer: {
    role: 'producer',
    primary_color: 'green',
    secondary_color: 'emerald',
    logo_variant: 'producer',
    navigation_items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard', roles: ['producer'] },
      { id: 'products', label: 'Mes Produits', icon: 'Package', href: '/dashboard/products', roles: ['producer'] },
      { id: 'opportunities', label: 'Mes Opportunités', icon: 'Zap', href: '/dashboard/opportunities', roles: ['producer'] },
      { id: 'sent-propositions', label: 'Mes Propositions', icon: 'FileText', href: '/dashboard/sent-propositions', roles: ['producer'] },
      { id: 'received-offers', label: 'Mes Offres', icon: 'Bell', href: '/dashboard/received-offers', roles: ['producer'] },
      { id: 'announcements', label: 'Mes Annonces', icon: 'Users', href: '/dashboard/announcements', roles: ['producer'] },
      { id: 'reviews', label: 'Mes Avis', icon: 'Star', href: '/dashboard/reviews', roles: ['producer'] },
      { id: 'orders', label: 'Commandes', icon: 'ShoppingCart', href: '/dashboard/orders', roles: ['producer'] },
      { id: 'geolocation', label: 'Géolocalisation', icon: 'MapPin', href: '/dashboard/geolocation', roles: ['producer'] },
      { id: 'profile', label: 'Mon Profil', icon: 'User', href: '/dashboard/profile', roles: ['producer'] }
    ],
    dashboard_widgets: ['stats', 'recent_orders', 'verification_status', 'quick_actions']
  },
  distributor: {
    role: 'distributor',
    primary_color: 'blue',
    secondary_color: 'cyan',
    logo_variant: 'distributor',
    navigation_items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard/distributor', roles: ['distributor'] },
      { id: 'search', label: 'Rechercher Producteurs', icon: 'Search', href: '/dashboard/distributor/search', roles: ['distributor'] },
      { id: 'alerts', label: 'Mes Alertes', icon: 'Bell', href: '/dashboard/distributor/alerts', roles: ['distributor'] },
      { id: 'requests', label: 'Mes Annonces', icon: 'Users', href: '/dashboard/distributor/requests', roles: ['distributor'] },
      { id: 'propositions', label: 'Mes Propositions', icon: 'FileText', href: '/dashboard/distributor/propositions', roles: ['distributor'] },
      { id: 'purchases', label: 'Mes Achats', icon: 'ShoppingBag', href: '/dashboard/distributor/achats', roles: ['distributor'] },
      { id: 'reviews', label: 'Mes Avis', icon: 'Star', href: '/dashboard/distributor/my-reviews', roles: ['distributor'] },
      { id: 'profile', label: 'Mon Profil', icon: 'User', href: '/dashboard/distributor/profile', roles: ['distributor'] }
    ],
    dashboard_widgets: ['stats', 'recent_requests', 'marketplace', 'quick_actions']
  }
};

// Permissions par rôle
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'producer',
    permissions: [
      'view_dashboard',
      'manage_products',
      'manage_orders',
      'view_analytics',
      'manage_profile',
      'verify_location',
      'manage_delivery_settings'
    ]
  },
  {
    role: 'distributor',
    permissions: [
      'view_dashboard',
      'search_producers',
      'create_requests',
      'send_propositions',
      'manage_alerts',
      'view_marketplace',
      'manage_purchases',
      'manage_profile'
    ]
  }
];

// Fonctions utilitaires
export function getUserPermissions(user: UnifiedUser): Permission[] {
  const roleConfig = ROLE_PERMISSIONS.find(config => config.role === user.role);
  return roleConfig?.permissions || [];
}

export function hasPermission(user: UnifiedUser, permission: Permission): boolean {
  return getUserPermissions(user).includes(permission);
}

export function getLayoutConfig(user: UnifiedUser): LayoutConfig | undefined {
  if (!user || !user.role) {
    return undefined;
  }
  return ROLE_CONFIG[user.role];
}

export function getNavigationItems(user: UnifiedUser): NavigationItem[] {
  const config = getLayoutConfig(user);
  if (!config || !config.navigation_items) {
    return [];
  }
  return config.navigation_items.filter(item => item.roles.includes(user.role));
}

export function isProducer(user: UnifiedUser): boolean {
  return user.role === 'producer';
}

export function isDistributor(user: UnifiedUser): boolean {
  return user.role === 'distributor';
}

export function getRoleLabel(user: UnifiedUser): string {
  return user.role === 'producer' ? 'Producteur' : 'Distributeur';
}

export function getRoleIcon(user: UnifiedUser): string {
  return user.role === 'producer' ? '🌾' : '🏪';
}

export function getRoleColor(user: UnifiedUser): string {
  return user.role === 'producer' ? 'green' : 'blue';
}
