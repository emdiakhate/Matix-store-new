'use client';

import { useState, useEffect, useCallback } from 'react';
import { useProfile } from './useProfile';

interface PrefetchStatus {
  isPrefetching: boolean;
  isCached: boolean;
  lastPrefetch: number | null;
  targetRole: string | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const PREFETCH_DELAY = 500; // 500ms après le chargement

export function useRolePrefetch(user: any) {
  const [prefetchStatus, setPrefetchStatus] = useState<PrefetchStatus>({
    isPrefetching: false,
    isCached: false,
    lastPrefetch: null,
    targetRole: null
  });

  const { switchRole } = useProfile();

  // Fonction pour vérifier si les données sont en cache
  const checkCache = useCallback((targetRole: string) => {
    const cacheKey = `role_data_${targetRole}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const { timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (!isExpired) {
        return true;
      } else {
        localStorage.removeItem(cacheKey);
      }
    }
    
    return false;
  }, []);

  // Fonction pour précharger les données d'un rôle
  const prefetchRoleData = useCallback(async (targetRole: string) => {
    if (prefetchStatus.isPrefetching) return;
    
    setPrefetchStatus(prev => ({
      ...prev,
      isPrefetching: true,
      targetRole
    }));

    try {
      // Simuler le chargement des données du rôle cible
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Stocker en cache
      const cacheKey = `role_data_${targetRole}`;
      const cacheData = {
        role: targetRole,
        timestamp: Date.now(),
        data: {
          navigationItems: getNavigationItemsForRole(targetRole),
          permissions: getPermissionsForRole(targetRole),
          stats: getStatsForRole(targetRole)
        }
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      setPrefetchStatus(prev => ({
        ...prev,
        isPrefetching: false,
        isCached: true,
        lastPrefetch: Date.now()
      }));
      
    } catch (error) {
      console.error('Erreur lors du prefetch:', error);
      setPrefetchStatus(prev => ({
        ...prev,
        isPrefetching: false
      }));
    }
  }, [prefetchStatus.isPrefetching]);

  // Fonction pour obtenir les données de navigation selon le rôle
  const getNavigationItemsForRole = (role: string) => {
    if (role === 'producer') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard' },
        { id: 'products', label: 'Mes Produits', icon: 'Package', href: '/dashboard/products' },
        { id: 'orders', label: 'Commandes', icon: 'ShoppingCart', href: '/dashboard/orders' },
        { id: 'geolocation', label: 'Géolocalisation', icon: 'MapPin', href: '/dashboard/geolocation' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard/distributor' },
        { id: 'search', label: 'Rechercher', icon: 'Search', href: '/dashboard/distributor/search' },
        { id: 'requests', label: 'Annonces', icon: 'Users', href: '/dashboard/distributor/requests' },
        { id: 'propositions', label: 'Propositions', icon: 'FileText', href: '/dashboard/distributor/propositions' }
      ];
    }
  };

  // Fonction pour obtenir les permissions selon le rôle
  const getPermissionsForRole = (role: string) => {
    if (role === 'producer') {
      return ['manage_products', 'view_orders', 'verify_location'];
    } else {
      return ['search_producers', 'create_requests', 'send_propositions'];
    }
  };

  // Fonction pour obtenir les statistiques selon le rôle
  const getStatsForRole = (role: string) => {
    if (role === 'producer') {
      return {
        totalProducts: 12,
        totalOrders: 45,
        revenue: 12500
      };
    } else {
      return {
        totalRequests: 8,
        totalPropositions: 23,
        budget: 50000
      };
    }
  };

  // Fonction pour switcher de rôle avec cache
  const switchRoleWithCache = useCallback(async (targetRole: string) => {
    const isCached = checkCache(targetRole);
    
    if (isCached) {
      // Switch instantané si les données sont en cache
      await switchRole(targetRole);
      return { isInstant: true };
    } else {
      // Affichage du loading pendant le fetch
      await switchRole(targetRole);
      return { isInstant: false };
    }
  }, [checkCache, switchRole]);

  // Effet pour précharger les données après le chargement
  useEffect(() => {
    if (!user || !user.roles || user.roles.length < 2) return;

    const timer = setTimeout(() => {
      const targetRole = user.role === 'producer' ? 'distributor' : 'producer';
      const isCached = checkCache(targetRole);
      
      if (!isCached) {
        prefetchRoleData(targetRole);
      } else {
        setPrefetchStatus(prev => ({
          ...prev,
          isCached: true,
          lastPrefetch: Date.now()
        }));
      }
    }, PREFETCH_DELAY);

    return () => clearTimeout(timer);
  }, [user, checkCache, prefetchRoleData]);

  // Nettoyer le cache au logout
  const clearCache = useCallback(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('role_data_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  return {
    prefetchStatus,
    switchRoleWithCache,
    clearCache,
    isPrefetching: prefetchStatus.isPrefetching,
    isCached: prefetchStatus.isCached
  };
}
