"use client";

import StarRating from '@/components/ui/StarRating';
import { ProductReview } from '@/lib/types';

interface ReviewCardProps {
  review: ProductReview;
  className?: string;
}

export default function ReviewCard({ review, className = '' }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {review.distributor_name?.charAt(0) || 'D'}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {review.distributor_name || 'Distributeur anonyme'}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(review.created_at)}
            </div>
          </div>
        </div>
        
        <StarRating rating={review.rating} size="sm" />
      </div>
      
      {review.comment && (
        <div className="text-gray-700 leading-relaxed">
          {review.comment}
        </div>
      )}
    </div>
  );
}
