'use client';

import { CheckCircle, XCircle } from 'lucide-react';

interface BadgeVerificationProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function BadgeVerification({ 
  isVerified, 
  size = 'md', 
  showText = true,
  className = ''
}: BadgeVerificationProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (isVerified) {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-green-100 text-green-800 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
        <CheckCircle className={`${iconSizes[size]} flex-shrink-0`} />
        {showText && <span>Ferme vérifiée</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-gray-100 text-gray-600 rounded-full font-medium ${sizeClasses[size]} ${className}`}>
      <XCircle className={`${iconSizes[size]} flex-shrink-0`} />
      {showText && <span>Ferme non vérifiée</span>}
    </div>
  );
}

