import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { authService } from '@/services/auth/authService';
import { AuthState, UserProfile, AuthError } from '@/types/auth.types';

/**
 * Hook personnalisé pour la gestion de l'authentification
 * Fournit l'état d'authentification, les méthodes et la gestion des erreurs
 */
export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  /**
   * Chargement du profil utilisateur
   */
  const loadUserProfile = useCallback(async (user: User) => {
    try {
      const profile = await authService.getUserProfile(user.id);
      setState(prev => ({
        ...prev,
        profile,
        loading: false,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 'profile_load_error',
          message: 'Erreur lors du chargement du profil',
        },
      }));
    }
  }, []);

  /**
   * Mise à jour de l'état d'authentification
   */
  const updateAuthState = useCallback(
    async (user: User | null, session: any | null) => {
      setState(prev => ({
        ...prev,
        user,
        session,
        loading: false,
        error: null,
      }));

      if (user) {
        await loadUserProfile(user);
      } else {
        setState(prev => ({
          ...prev,
          profile: null,
        }));
      }
    },
    [loadUserProfile]
  );

  /**
   * Initialisation de l'état d'authentification
   */
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Erreur lors de l'initialisation de l'auth:", error);
          if (mounted) {
            setState(prev => ({
              ...prev,
              loading: false,
              error: {
                code: 'init_error',
                message: "Erreur lors de l'initialisation",
              },
            }));
          }
          return;
        }

        if (mounted) {
          await updateAuthState(session?.user || null, session);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'auth:", error);
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: {
              code: 'init_error',
              message: "Erreur lors de l'initialisation",
            },
          }));
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [updateAuthState]);

  /**
   * Écoute des changements d'état d'authentification
   */
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session?.user) {
        await updateAuthState(session.user, session);
      } else if (event === 'SIGNED_OUT') {
        await updateAuthState(null, null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        await updateAuthState(session.user, session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  /**
   * Connexion
   */
  const signIn = useCallback(
    async (email: string, password: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await authService.signIn({ email, password });

      if (result.success) {
        await updateAuthState(result.user!, result.session);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error!,
        }));
      }

      return result;
    },
    [updateAuthState]
  );

  /**
   * Inscription
   */
  const signUp = useCallback(
    async (data: any) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await authService.signUp(data);

      if (result.success && result.user) {
        await updateAuthState(result.user, null);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error!,
        }));
      }

      return result;
    },
    [updateAuthState]
  );

  /**
   * Déconnexion
   */
  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const success = await authService.signOut();

    if (success) {
      await updateAuthState(null, null);
    } else {
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 'signout_error',
          message: 'Erreur lors de la déconnexion',
        },
      }));
    }

    return success;
  }, [updateAuthState]);

  /**
   * Réinitialisation du mot de passe
   */
  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await authService.resetPassword({ email });

    setState(prev => ({
      ...prev,
      loading: false,
      error: result.error || null,
    }));

    return result;
  }, []);

  /**
   * Mise à jour du mot de passe
   */
  const updatePassword = useCallback(async (newPassword: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const result = await authService.updatePassword({ newPassword });

    setState(prev => ({
      ...prev,
      loading: false,
      error: result.error || null,
    }));

    return result;
  }, []);

  /**
   * Mise à jour du profil
   */
  const updateProfile = useCallback(
    async (data: any) => {
      if (!state.user) {
        return {
          success: false,
          error: {
            code: 'no_user',
            message: 'Aucun utilisateur connecté',
          },
        };
      }

      setState(prev => ({ ...prev, loading: true, error: null }));

      const result = await authService.updateProfile(state.user.id, data);

      if (result.success && result.profile) {
        setState(prev => ({
          ...prev,
          profile: result.profile!,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.error!,
        }));
      }

      return result;
    },
    [state.user]
  );

  /**
   * Nettoyage des erreurs
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Vérification si l'utilisateur est connecté
   */
  const isAuthenticated = useCallback(() => {
    return !!state.user && !!state.session;
  }, [state.user, state.session]);

  /**
   * Vérification du rôle utilisateur
   */
  const hasRole = useCallback(
    (role: string) => {
      const profile = state.profile as any;
      if (!profile) return false;
      // Vérifier si le rôle est dans la liste des rôles ou si c'est le rôle actif
      return (
        profile.active_role === role ||
        (Array.isArray(profile.roles) && profile.roles.includes(role))
      );
    },
    [state.profile]
  );

  /**
   * Vérification si l'utilisateur est admin
   */
  const isAdmin = useCallback(() => {
    return hasRole('admin');
  }, [hasRole]);

  return {
    // État
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    error: state.error,

    // Méthodes
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    clearError,

    // Utilitaires
    isAuthenticated: isAuthenticated(),
    hasRole,
    isAdmin: isAdmin(),

    // État dérivé
    isLoggedIn: isAuthenticated(),
    isFarmer: hasRole('farmer'),
    isDistributor: hasRole('distributor'),
    // Compatibilité avec l'ancien système
    isEleveur: hasRole('farmer'),
    isAcheteur: hasRole('distributor'),
    // Rôles et rôle actif
    activeRole: (state.profile as any)?.active_role || null,
    roles: (state.profile as any)?.roles || [],
  };
};

export default useAuth;
