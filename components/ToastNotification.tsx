'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

interface ToastNotificationProps {
  isVisible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function ToastNotification({ 
  isVisible, 
  message, 
  type = 'success',
  duration = 2500,
  onClose 
}: ToastNotificationProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          return Math.max(0, newProgress);
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [isVisible, duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: <Check className="h-5 w-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          textColor: 'text-green-800'
        };
      case 'error':
        return {
          icon: <X className="h-5 w-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <Check className="h-5 w-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30 
          }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className={`
            ${config.bgColor} ${config.borderColor} ${config.textColor}
            border rounded-lg shadow-lg backdrop-blur-sm
            overflow-hidden
          `}>
            {/* Progress bar */}
            <motion.div
              className={`h-1 ${config.iconColor.replace('text-', 'bg-')}`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
            
            <div className="p-4">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${config.iconColor.replace('text-', 'bg-').replace('-600', '-100')}`}
                >
                  {config.icon}
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {message}
                  </p>
                  <p className="text-xs opacity-75">
                    Interface mise à jour
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
