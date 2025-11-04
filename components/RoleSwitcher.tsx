'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Check, Store, Wheat, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// import { useRolePrefetch } from '@/lib/hooks/useRolePrefetch';
import ToastNotification from '@/components/ToastNotification';
import Tooltip from '@/components/Tooltip';

interface RoleSwitcherProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RoleSwitcher({ size = 'md', className = '' }: RoleSwitcherProps) {
  const { activeRole, switchRole, user, isLoading } = useAuth();
  // const { switchRoleWithCache, isCached, isPrefetching } = useRolePrefetch(user);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAttention, setShowAttention] = useState(false);

  // Animation d'attention au premier affichage
  useEffect(() => {
    if (user && user.roles && user.roles.length > 1) {
      setShowAttention(true);
      setTimeout(() => setShowAttention(false), 2000);
    }
  }, [user?.roles]);

  if (!user) return null;

  // Si l'utilisateur n'a qu'un seul rôle, afficher un badge info
  if (user.roles && user.roles.length === 1) {
    return (
      <div className={`mt-4 ${className}`}>
        <Badge variant="outline" className="w-full justify-center text-xs text-gray-500 bg-gray-50">
          Rôle unique : {activeRole === 'farmer' ? 'Producteur' : 'Distributeur'}
        </Badge>
      </div>
    );
  }

  // Si l'utilisateur n'a pas de rôles multiples, ne rien afficher
  if (!user.roles || user.roles.length < 2) {
    return null;
  }

  const handleRoleSwitch = async () => {
    if (isLoading || isTransitioning || !user?.id) return;

    // Haptic feedback si supporté
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    setIsTransitioning(true);

    try {
      // Convertir farmer ↔ distributor
      const newRole = activeRole === 'farmer' ? 'distributor' : 'farmer';

      // Appeler switchRole qui mettra à jour en DB
      await switchRole(newRole);

      // Animation de succès
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);

      // Afficher le toast de confirmation
      setToastMessage(
        `Vous êtes maintenant en mode ${newRole === 'farmer' ? 'Producteur' : 'Distributeur'}`
      );
      setShowToast(true);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      setToastMessage('Erreur lors du changement de rôle');
      setShowToast(true);
    } finally {
      // Délai pour l'animation de transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }
  };

  const getButtonContent = () => {
    if (showSuccess) {
      return (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2"
        >
          <Check className="h-4 w-4 text-green-600" />
          <span>✓ Passé en {activeRole === 'farmer' ? 'Producteur' : 'Distributeur'}</span>
        </motion.div>
      );
    }

    if (isTransitioning) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Loader2
            className={`h-4 w-4 animate-spin ${activeRole === 'farmer' ? 'text-green-600' : 'text-blue-600'}`}
          />
          <span>Changement...</span>
        </motion.div>
      );
    }

    if (activeRole === 'farmer') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Store className="h-4 w-4" />
          <span>Passer en Distributeur</span>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <Wheat className="h-4 w-4" />
          <span>Passer en Producteur</span>
        </motion.div>
      );
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2.5 text-sm';
    }
  };

  return (
    <>
      <motion.div
        className={`mt-4 ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          variant="outline"
          onClick={handleRoleSwitch}
          disabled={isLoading || isTransitioning}
          className={`
            role-switcher-button w-full justify-start
            ${getSizeClasses()}
            font-medium
            rounded-lg
            border-2
            transition-all duration-150
            hover:bg-green-50 hover:border-green-200 hover:text-green-700
            hover:translate-y-[-1px] hover:shadow-lg
            active:scale-95 active:duration-100
            disabled:opacity-50 disabled:cursor-not-allowed
            focus:ring-2 focus:ring-offset-2 focus:ring-green-500
            ${isTransitioning ? 'bg-green-50 border-green-200' : ''}
            ${showAttention ? 'animate-bounce-attention' : ''}
            ${activeRole === 'farmer' ? 'farmer-theme' : 'distributor-theme'}
          `}
        >
          {getButtonContent()}
        </Button>
      </motion.div>

      {/* Indicateur de double rôle */}
      {user.roles && user.roles.length > 1 && (
        <div className="mt-2 text-center">
          <Tooltip content="Vous pouvez basculer entre Producteur et Distributeur">
            <Badge
              variant="outline"
              className={`
                multi-role-badge text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded
                transition-all duration-300 hover:scale-105 hover:shadow-md
                ${showAttention ? 'animate-bounce-attention' : ''}
              `}
            >
              👥 Profil multi-rôles
            </Badge>
          </Tooltip>
        </div>
      )}

      {/* Toast Notification */}
      <ToastNotification
        isVisible={showToast}
        message={toastMessage}
        type="success"
        duration={2500}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}
