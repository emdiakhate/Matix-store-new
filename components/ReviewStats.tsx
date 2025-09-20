"use client";

import StarRating from '@/components/ui/StarRating';
import { ProductReviewStats } from '@/lib/types';

interface ReviewStatsProps {
  stats: ProductReviewStats;
  className?: string;
}

export default function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const getPercentage = (count: number) => {
    if (stats.total_reviews === 0) return 0;
    return Math.round((count / stats.total_reviews) * 100);
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Avis</h3>
      
      {/* Moyenne et nombre total */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {stats.average_rating.toFixed(1)}
          </div>
          <StarRating rating={stats.average_rating} size="lg" />
          <div className="text-sm text-gray-600 mt-1">
            {stats.total_reviews} avis
          </div>
        </div>
      </div>

      {/* Répartition des étoiles */}
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats.rating_distribution[stars as keyof typeof stats.rating_distribution];
          const percentage = getPercentage(count);
          
          return (
            <div key={stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm text-gray-600">{stars}</span>
                <StarRating rating={1} size="sm" />
              </div>
              
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              <div className="text-sm text-gray-600 w-12 text-right">
                {count}
              </div>
              
              <div className="text-sm text-gray-500 w-10 text-right">
                {percentage}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
