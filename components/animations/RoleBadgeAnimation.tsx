'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { ReactNode } from 'react';

interface RoleBadgeAnimationProps {
  children: ReactNode;
  role: string;
  isTransitioning: boolean;
}

export default function RoleBadgeAnimation({ 
  children, 
  role, 
  isTransitioning 
}: RoleBadgeAnimationProps) {
  const getRoleColor = (role: string) => {
    return role === 'producer' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <motion.div
      key={role}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ 
        scale: isTransitioning ? 0.95 : 1, 
        opacity: 1 
      }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
    >
      <motion.div
        animate={{
          backgroundColor: role === 'producer' 
            ? 'rgb(220, 252, 231)' 
            : 'rgb(219, 234, 254)',
          borderColor: role === 'producer' 
            ? 'rgb(187, 247, 208)' 
            : 'rgb(191, 219, 254)'
        }}
        transition={{ duration: 0.3 }}
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-300 ${getRoleColor(role)}`}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
