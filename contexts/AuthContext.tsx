'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth/authService';
import { supabase } from '@/lib/supabase/client';

type Role = 'farmer' | 'distributor'; // Utiliser farmer au lieu de producer pour correspondre à la DB

interface AuthContextType {
  activeRole: Role;
  switchRole: (newRole: Role) => Promise<void>;
  user: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<Role>('farmer');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis Supabase
  useEffect(() => {
    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Charger le profil depuis la table 'users'
          const profile = await authService.getUserProfile(session.user.id);

          if (profile) {
            const userProfile = profile as any;
            setUser({
              ...userProfile,
              id: session.user.id,
              email: session.user.email,
            });

            // Synchroniser le rôle actif depuis la DB
            if (userProfile.active_role) {
              setActiveRole(userProfile.active_role as Role);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Écouter les changements d'auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await authService.getUserProfile(session.user.id);
        if (profile) {
          const userProfile = profile as any;
          setUser({
            ...userProfile,
            id: session.user.id,
            email: session.user.email,
          });
          if (userProfile.active_role) {
            setActiveRole(userProfile.active_role as Role);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveRole('farmer');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const switchRole = async (newRole: Role) => {
    if (!user?.id) {
      console.error("❌ Pas d'utilisateur pour changer de rôle");
      return;
    }

    console.log('🔄 Context - Switching to:', newRole);

    try {
      // Mettre à jour en base de données
      const success = await authService.switchRole(user.id, newRole);

      if (success) {
        // Update state local
        setActiveRole(newRole);

        // Mettre à jour l'objet user
        setUser((prev: any) => ({
          ...prev,
          active_role: newRole,
        }));

        // Dispatch event pour notifier les autres composants
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('roleChanged', {
              detail: { newRole, user },
            })
          );
        }

        console.log('✅ Context - Role switched to:', newRole);

        // Refresh pour recharger les données
        router.refresh();
      } else {
        console.error('❌ Échec du changement de rôle en DB');
      }
    } catch (error) {
      console.error('❌ Erreur lors du changement de rôle:', error);
    }
  };

  // Log à chaque changement
  useEffect(() => {
    console.log('🌍 Context - activeRole updated:', activeRole);
  }, [activeRole]);

  return (
    <AuthContext.Provider
      value={{
        activeRole,
        switchRole,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
