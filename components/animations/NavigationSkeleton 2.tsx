'use client';

import { motion } from 'framer-motion';

interface NavigationSkeletonProps {
  itemCount?: number;
}

export default function NavigationSkeleton({ itemCount = 6 }: NavigationSkeletonProps) {
  return (
    <div className="space-y-1">
      {Array.from({ length: itemCount }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: index * 0.1,
            ease: "easeOut"
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg"
        >
          {/* Icône skeleton */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="w-4 h-4 bg-gray-300 rounded"
          />
          
          {/* Texte skeleton */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: 0.2
            }}
            className="flex-1 h-4 bg-gray-300 rounded"
          />
          
          {/* Badge skeleton (optionnel) */}
          {index % 3 === 0 && (
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 0.4
              }}
              className="w-6 h-4 bg-gray-300 rounded-full"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
