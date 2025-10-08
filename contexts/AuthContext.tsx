'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Role = 'producer' | 'distributor';

interface AuthContextType {
  activeRole: Role;
  switchRole: (newRole: Role) => void;
  user: any;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<Role>(() => {
    // Initialiser depuis localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('active_role');
      if (stored && (stored === 'producer' || stored === 'distributor')) {
        return stored as Role;
      }
    }
    return 'producer';
  });
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // Synchroniser le rôle avec l'utilisateur
          if (userData.role && userData.role !== activeRole) {
            setActiveRole(userData.role);
          }
        } catch (error) {
          console.error('Erreur lors du parsing de l\'utilisateur:', error);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const switchRole = (newRole: Role) => {
    console.log('🔄 Context - Switching to:', newRole);
    
    // Update state
    setActiveRole(newRole);
    
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_role', newRole);
      
      // Mettre à jour l'utilisateur dans localStorage
      if (user) {
        const updatedUser = { ...user, role: newRole };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    }
    
    // Dispatch event pour notifier les autres composants
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('roleChanged', { 
        detail: { newRole, user } 
      }));
    }
    
    // Force refresh de la page
    router.refresh();
    
    console.log('✅ Context - Role switched to:', newRole);
  };
  
  // Log à chaque changement
  useEffect(() => {
    console.log('🌍 Context - activeRole updated:', activeRole);
  }, [activeRole]);

  // Écouter les changements de rôle depuis d'autres composants
  useEffect(() => {
    const handleRoleChange = (event: CustomEvent) => {
      const { newRole } = event.detail;
      if (newRole !== activeRole) {
        setActiveRole(newRole);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('roleChanged', handleRoleChange as EventListener);
      return () => {
        window.removeEventListener('roleChanged', handleRoleChange as EventListener);
      };
    }
  }, [activeRole]);
  
  return (
    <AuthContext.Provider value={{ 
      activeRole, 
      switchRole, 
      user, 
      isLoading 
    }}>
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
