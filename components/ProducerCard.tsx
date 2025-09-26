'use client';

import { Card } from '@/components/ui/card';
import BadgeVerification from '@/components/BadgeVerification';
import { isProducerVerified } from '@/lib/utils/verification';
import { User } from '@/lib/types';
import { MapPin, Phone, Mail } from 'lucide-react';

interface ProducerCardProps {
  producer: User;
  showVerification?: boolean;
  onFollow?: (producerId: string) => void;
  isFollowing?: boolean;
}

export default function ProducerCard({ 
  producer, 
  showVerification = true,
  onFollow,
  isFollowing = false
}: ProducerCardProps) {
  const isVerified = isProducerVerified(producer);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden">
            <img 
              src={producer.avatar_url || '/default-avatar.png'} 
              alt={producer.full_name || 'Producteur'}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {producer.business_name || producer.full_name || 'Producteur'}
            </h3>
            <p className="text-sm text-gray-500">Producteur</p>
          </div>
        </div>
        
        {onFollow && (
          <button
            onClick={() => onFollow(producer.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              isFollowing 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
            }`}
          >
            {isFollowing ? 'Suivi' : 'Suivre'}
          </button>
        )}
      </div>

      {/* Badge de vérification */}
      {showVerification && (
        <div className="mb-4">
          <BadgeVerification 
            isVerified={isVerified} 
            size="sm" 
            showText={true}
          />
        </div>
      )}

      {/* Informations de contact */}
      <div className="space-y-2 text-sm text-gray-600">
        {producer.phone && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{producer.phone}</span>
          </div>
        )}
        
        {producer.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{producer.email}</span>
          </div>
        )}
        
        {producer.farm_address && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">{producer.farm_address}</span>
          </div>
        )}
      </div>

      {/* Informations de vérification */}
      {isVerified && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-700">
            ✅ Ferme vérifiée par géolocalisation GPS
          </p>
        </div>
      )}
    </Card>
  );
}

