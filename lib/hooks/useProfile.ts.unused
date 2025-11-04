// Hook unifié pour la gestion des profils
// Gestion centralisée des utilisateurs Producteur/Distributeur

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UnifiedUser, UserRole, Permission, NavigationItem } from '../types-unified';
import ProfileService from '../profileService';

interface UseProfileResult {
  // Utilisateur actuel
  user: UnifiedUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Informations sur le rôle
  role: UserRole | null;
  isProducer: boolean;
  isDistributor: boolean;
  roleLabel: string;
  roleIcon: string;
  roleColor: string;
  
  // Permissions
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  
  // Navigation
  navigationItems: NavigationItem[];
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => Promise<void>;
  updateProfile: (updates: Partial<UnifiedUser>) => Promise<boolean>;
  updateLocation: (locationData: any) => Promise<boolean>;
  updatePreferences: (preferences: any) => Promise<boolean>;
  
  // Données spécifiques au rôle
  producerFields: any;
  distributorFields: any;
  userStats: any;
  
  // Recherche (pour distributeurs)
  searchProducers: (filters: any) => UnifiedUser[];
}

export function useProfile(): UseProfileResult {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger l'utilisateur au montage
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = ProfileService.getCurrentUser();
        setUser(currentUser);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement de l\'utilisateur');
        console.error('Erreur useProfile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Informations sur le rôle
  const role = user?.role || null;
  const isProducer = user ? ProfileService.isProducer(user) : false;
  const isDistributor = user ? ProfileService.isDistributor(user) : false;
  const roleLabel = user ? (user.role === 'producer' ? 'Producteur' : 'Distributeur') : '';
  const roleIcon = user ? (user.role === 'producer' ? '🌾' : '🏪') : '';
  const roleColor = user ? (user.role === 'producer' ? 'green' : 'blue') : '';

  // Permissions
  const permissions = user ? ProfileService.getUserPermissions(user) : [];
  const hasPermission = useCallback((permission: Permission): boolean => {
    return user ? ProfileService.hasPermission(user, permission) : false;
  }, [user]);

  // Navigation
  const navigationItems = user && user.role ? ProfileService.getNavigationItems(user) : [];

  // Données spécifiques au rôle
  const producerFields = user ? ProfileService.getProducerFields(user) : null;
  const distributorFields = user ? ProfileService.getDistributorFields(user) : null;
  const userStats = user ? ProfileService.getUserStats(user) : {};

  // Actions
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loggedInUser = ProfileService.login(email, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      } else {
        setError('Email ou mot de passe incorrect');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
      console.error('Erreur login:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    ProfileService.logout();
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UnifiedUser>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = ProfileService.updateProfile(user.id, updates);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('Erreur lors de la mise à jour');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Erreur updateProfile:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateLocation = useCallback(async (locationData: any): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = ProfileService.updateLocation(user.id, locationData);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('Erreur lors de la mise à jour de la localisation');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour de la localisation');
      console.error('Erreur updateLocation:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updatePreferences = useCallback(async (preferences: any): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedUser = ProfileService.updatePreferences(user.id, preferences);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('Erreur lors de la mise à jour des préférences');
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour des préférences');
      console.error('Erreur updatePreferences:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const searchProducers = useCallback((filters: any): UnifiedUser[] => {
    return ProfileService.searchProducers(filters);
  }, []);

  return {
    // Utilisateur actuel
    user,
    isLoading,
    error,
    
    // Informations sur le rôle
    role,
    isProducer,
    isDistributor,
    roleLabel,
    roleIcon,
    roleColor,
    
    // Permissions
    permissions,
    hasPermission,
    
    // Navigation
    navigationItems,
    
  // Actions
  login,
  logout,
  switchRole: async (newRole: UserRole) => {
    if (!user) return;
    
    // Mettre à jour le rôle dans localStorage
    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
    
    // Simuler un délai pour l'animation
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  updateProfile,
  updateLocation,
  updatePreferences,
    
    // Données spécifiques au rôle
    producerFields,
    distributorFields,
    userStats,
    
    // Recherche
    searchProducers
  };
}

// Hook spécialisé pour les producteurs
export function useProducerProfile() {
  const profile = useProfile();
  
  return {
    ...profile,
    // Fonctionnalités spécifiques aux producteurs
    canVerifyLocation: profile.hasPermission('verify_location'),
    canManageProducts: profile.hasPermission('manage_products'),
    canSetDeliveryRadius: profile.hasPermission('manage_delivery_settings'),
    farmLocation: profile.producerFields,
    isVerified: profile.user?.is_verified || false
  };
}

// Hook spécialisé pour les distributeurs
export function useDistributorProfile() {
  const profile = useProfile();
  
  return {
    ...profile,
    // Fonctionnalités spécifiques aux distributeurs
    canSearchProducers: profile.hasPermission('search_producers'),
    canCreateRequests: profile.hasPermission('create_requests'),
    canSendPropositions: profile.hasPermission('send_propositions'),
    canManageAlerts: profile.hasPermission('manage_alerts'),
    businessInfo: profile.distributorFields,
    specializations: profile.distributorFields?.specializations || []
  };
}

export default useProfile;
