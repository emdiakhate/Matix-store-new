'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: 'producer' | 'distributor';
  isTransitioning?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function RoleBadge({ 
  role, 
  isTransitioning = false, 
  size = 'md',
  className = '' 
}: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    if (role === 'producer') {
      return {
        icon: '🌾',
        label: 'Producteur',
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-200',
        accentColor: 'text-green-600'
      };
    } else {
      return {
        icon: '🏪',
        label: 'Distributeur',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200',
        accentColor: 'text-blue-600'
      };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-4 py-1.5';
      default:
        return 'text-xs px-3 py-1';
    }
  };

  const config = getRoleConfig(role);

  return (
    <motion.div
      key={role}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isTransitioning ? 1.05 : 1, 
        opacity: 1 
      }}
      transition={{ 
        duration: 0.5, 
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={className}
    >
      <motion.div
        animate={{
          backgroundColor: role === 'producer' 
            ? 'rgb(220, 252, 231)' 
            : 'rgb(219, 234, 254)',
          borderColor: role === 'producer' 
            ? 'rgb(187, 247, 208)' 
            : 'rgb(191, 219, 254)',
          color: role === 'producer' 
            ? 'rgb(21, 128, 61)' 
            : 'rgb(29, 78, 216)'
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`
          inline-flex items-center gap-1 rounded-full border font-medium
          ${getSizeClasses()}
          ${config.bgColor} ${config.textColor} ${config.borderColor}
          transition-colors duration-500
          ${isTransitioning ? 'animate-pulse' : ''}
        `}
      >
        <motion.span
          animate={{ 
            rotate: isTransitioning ? [0, 10, -10, 0] : 0 
          }}
          transition={{ 
            duration: 0.6, 
            ease: "easeInOut",
            repeat: isTransitioning ? 1 : 0
          }}
          className="text-sm"
        >
          {config.icon}
        </motion.span>
        <span>{config.label}</span>
      </motion.div>
    </motion.div>
  );
}
