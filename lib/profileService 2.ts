// Service de gestion des profils unifié
// Gestion centralisée des utilisateurs Producteur/Distributeur

import { UnifiedUser, UserRole, Permission, NavigationItem } from './types-unified';

// Données mockées unifiées
export const mockUnifiedUsers: UnifiedUser[] = [
  // Producteur
  {
    id: '1',
    email: 'amadou@example.com',
    phone: '+221 77 123 4567',
    full_name: 'Amadou Diallo',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    role: 'producer',
    subscription_status: 'active',
    subscription_type: 'producer_monthly',
    is_verified: true,
    coordinates: { lat: 14.7167, lng: -17.4677 },
    region: 'Dakar',
    city: 'Dakar',
    address: 'Marché Colobane, Dakar',
    producer_fields: {
      farm_name: 'Ferme Diallo',
      farm_address: 'Rufisque, Dakar',
      farm_latitude: 14.7167,
      farm_longitude: -17.4677,
      location_accuracy: 5,
      type_elevage: 'Poulets de chair',
      superficie: '2 hectares',
      capacite: '500 têtes',
      certification_bio: true,
      licence: 'AV-2024-DK-001245',
      radius_km: 25,
      delivery_settings: {
        max_radius_km: 25,
        cost_per_km: 200,
        available_hours: { start: '08:00', end: '18:00' },
        working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      }
    },
    stats: {
      rating: 4.8,
      response_time_hours: 2,
      total_orders: 89,
      total_revenue: 1847000,
      member_since: 'Janvier 2024'
    },
    preferences: {
      language: 'fr',
      notifications: { email: true, sms: true, push: true },
      theme: 'light'
    }
  },
  
  // Distributeur
  {
    id: '2',
    email: 'fatou@enterprises.sn',
    phone: '+221 76 234 5678',
    full_name: 'Fatou Enterprises',
    avatar_url: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2024-01-10T09:00:00Z',
    role: 'distributor',
    subscription_status: 'active',
    subscription_type: 'distributor_monthly',
    is_verified: true,
    coordinates: { lat: 14.7833, lng: -16.9167 },
    region: 'Thiès',
    city: 'Thiès',
    address: 'Zone industrielle, Thiès',
    distributor_fields: {
      business_name: 'Fatou Enterprises SARL',
      business_license: 'ENT-2024-TH-001',
      ninea: '123456789',
      zone: 'Thiès',
      specializations: ['Poulets', 'Œufs', 'Poussins'],
      target_regions: ['Dakar', 'Thiès', 'Kaolack'],
      budget_range: { min: 500000, max: 2000000 },
      preferred_suppliers: ['1', '3', '5']
    },
    stats: {
      rating: 4.6,
      response_time_hours: 1,
      total_orders: 156,
      total_revenue: 3200000,
      member_since: 'Décembre 2023'
    },
    preferences: {
      language: 'fr',
      notifications: { email: true, sms: false, push: true },
      theme: 'light'
    }
  },

  // Utilisateur avec double rôle (Producteur + Distributeur)
  {
    id: '3',
    email: 'mariama@hybrid.sn',
    phone: '+221 77 345 6789',
    full_name: 'Mariama Sarr',
    avatar_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-05T12:00:00Z',
    role: 'producer', // Rôle actif
    roles: ['producer', 'distributor'], // Rôles disponibles
    subscription_status: 'active',
    subscription_type: 'hybrid_monthly',
    is_verified: true,
    coordinates: { lat: 14.7167, lng: -17.4677 },
    region: 'Kaolack',
    city: 'Kaolack',
    address: 'Ferme Sarr, Kaolack',
    producer_fields: {
      farm_name: 'Ferme Sarr',
      farm_address: 'Kaolack, Sénégal',
      farm_latitude: 14.7167,
      farm_longitude: -17.4677,
      location_accuracy: 5,
      type_elevage: 'Poulets de chair',
      superficie: '5 hectares',
      capacite: '1000 têtes',
      certification_bio: true,
      licence: 'AV-2024-KL-002345',
      radius_km: 50,
      delivery_settings: {
        max_radius_km: 50,
        cost_per_km: 150,
        available_hours: { start: '06:00', end: '20:00' },
        working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      }
    },
    distributor_fields: {
      business_name: 'Sarr Distribution SARL',
      business_license: 'ENT-2024-KL-002',
      ninea: '987654321',
      zone: 'Kaolack',
      specializations: ['Poulets', 'Œufs', 'Légumes'],
      target_regions: ['Kaolack', 'Fatick', 'Kaffrine'],
      budget_range: { min: 100000, max: 1000000 },
      preferred_suppliers: ['1', '2']
    },
    stats: {
      rating: 4.7,
      response_time_hours: 3,
      total_orders: 234,
      total_revenue: 12500000,
      member_since: 'Novembre 2023'
    },
    preferences: {
      language: 'fr',
      notifications: { email: true, sms: true, push: true },
      theme: 'light'
    }
  }
];

// Service de gestion des profils
export class ProfileService {
  private static currentUser: UnifiedUser | null = null;

  // Authentification
  static login(email: string, password: string): UnifiedUser | null {
    const user = mockUnifiedUsers.find(u => u.email === email);
    if (user && password === '123456') { // Mot de passe simple pour la démo
      this.currentUser = user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      return user;
    }
    return null;
  }

  static logout(): void {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
  }

  static getCurrentUser(): UnifiedUser | null {
    if (this.currentUser) return this.currentUser;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        try {
          this.currentUser = JSON.parse(stored);
          return this.currentUser;
        } catch (error) {
          console.error('Erreur lors du parsing de l\'utilisateur:', error);
          localStorage.removeItem('currentUser');
        }
      }
    }
    return null;
  }

  // Gestion des rôles
  static getUserRole(user: UnifiedUser): UserRole {
    return user.role;
  }

  static isProducer(user: UnifiedUser | null): boolean {
    return user?.role === 'producer';
  }

  static isDistributor(user: UnifiedUser | null): boolean {
    return user?.role === 'distributor';
  }

  // Permissions
  static hasPermission(user: UnifiedUser | null, permission: Permission): boolean {
    if (!user) return false;
    const permissions = this.getUserPermissions(user);
    return permissions.includes(permission);
  }

  static getUserPermissions(user: UnifiedUser | null): Permission[] {
    if (!user) return [];
    const { ROLE_PERMISSIONS } = require('./types-unified');
    const roleConfig = ROLE_PERMISSIONS.find(config => config.role === user.role);
    return roleConfig?.permissions || [];
  }

  // Navigation
  static getNavigationItems(user: UnifiedUser | null): NavigationItem[] {
    if (!user) return [];
    const { getNavigationItems } = require('./types-unified');
    return getNavigationItems(user);
  }

  // Profil spécifique
  static getProducerFields(user: UnifiedUser | null) {
    if (!user || user.role !== 'producer') return null;
    return user.producer_fields;
  }

  static getDistributorFields(user: UnifiedUser | null) {
    if (!user || user.role !== 'distributor') return null;
    return user.distributor_fields;
  }

  // Mise à jour du profil
  static updateProfile(userId: string, updates: Partial<UnifiedUser>): UnifiedUser | null {
    const userIndex = mockUnifiedUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return null;

    const updatedUser = { ...mockUnifiedUsers[userIndex], ...updates, updated_at: new Date().toISOString() };
    mockUnifiedUsers[userIndex] = updatedUser;

    // Mettre à jour l'utilisateur actuel si c'est lui
    if (this.currentUser?.id === userId) {
      this.currentUser = updatedUser;
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    }

    return updatedUser;
  }

  // Vérification de géolocalisation (pour les producteurs)
  static updateLocation(userId: string, locationData: {
    farm_latitude: number;
    farm_longitude: number;
    location_accuracy: number;
    farm_address: string;
    farm_name: string;
    region: string;
  }): UnifiedUser | null {
    const user = mockUnifiedUsers.find(u => u.id === userId);
    if (!user || user.role !== 'producer') return null;

    const updatedUser = {
      ...user,
      producer_fields: {
        ...user.producer_fields,
        ...locationData
      },
      is_verified: true,
      updated_at: new Date().toISOString()
    };

    return this.updateProfile(userId, updatedUser);
  }

  // Statistiques
  static getUserStats(user: UnifiedUser | null) {
    return user?.stats || {};
  }

  // Préférences
  static updatePreferences(userId: string, preferences: Partial<UnifiedUser['preferences']>): UnifiedUser | null {
    const user = mockUnifiedUsers.find(u => u.id === userId);
    if (!user) return null;

    const updatedUser = {
      ...user,
      preferences: { ...user.preferences, ...preferences },
      updated_at: new Date().toISOString()
    };

    return this.updateProfile(userId, updatedUser);
  }

  // Recherche d'utilisateurs (pour les distributeurs)
  static searchProducers(filters: {
    region?: string;
    type_elevage?: string;
    max_distance?: number;
    min_rating?: number;
  }): UnifiedUser[] {
    return mockUnifiedUsers.filter(user => {
      if (user.role !== 'producer') return false;
      
      // Filtres
      if (filters.region && user.region !== filters.region) return false;
      if (filters.type_elevage && user.producer_fields?.type_elevage !== filters.type_elevage) return false;
      if (filters.min_rating && (user.stats?.rating || 0) < filters.min_rating) return false;
      
      return true;
    });
  }

  // Validation des données
  static validateUser(user: Partial<UnifiedUser>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user.email || !user.email.includes('@')) {
      errors.push('Email invalide');
    }

    if (!user.phone || user.phone.length < 10) {
      errors.push('Numéro de téléphone invalide');
    }

    if (!user.full_name || user.full_name.length < 2) {
      errors.push('Nom complet requis');
    }

    if (!user.role || !['producer', 'distributor'].includes(user.role)) {
      errors.push('Rôle invalide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export du service par défaut
export default ProfileService;
