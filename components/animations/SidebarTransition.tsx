'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SidebarTransitionProps {
  children: ReactNode;
  isTransitioning: boolean;
  currentRole: string;
}

export default function SidebarTransition({ 
  children, 
  isTransitioning, 
  currentRole 
}: SidebarTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentRole}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          ease: "easeInOut",
          delay: isTransitioning ? 0.2 : 0
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
