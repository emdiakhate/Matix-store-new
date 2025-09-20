"use client";

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, DollarSign, Package, Users, Calendar, AlertTriangle, Star } from 'lucide-react';

interface Demand {
  id: number;
  title: string;
  description: string;
  distributor: {
    name: string;
    city: string;
    avatar?: string;
    rating: number;
  };
  product: string;
  quantity: number;
  unit: string;
  category: string;
  budgetMax: number;
  deadline: string;
  daysLeft: number;
  applicantsCount: number;
  isUrgent: boolean;
  requirements?: string[];
  location: string;
  publishedDate: string;
}

interface DemandCardProps {
  demand: Demand;
  onSubmitOffer: (demand: Demand) => void;
}

export default function DemandCard({ demand, onSubmitOffer }: DemandCardProps) {
  const getStatusColor = () => {
    if (demand.daysLeft <= 0) return 'text-red-600 bg-red-100';
    if (demand.daysLeft <= 2) return 'text-orange-600 bg-orange-100';
    if (demand.isUrgent) return 'text-red-600 bg-red-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusText = () => {
    if (demand.daysLeft <= 0) return 'Expirée';
    if (demand.daysLeft <= 2) return 'Bientôt expirée';
    if (demand.isUrgent) return 'Urgente';
    return 'Active';
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Section gauche - Informations principales */}
        <div className="col-span-8">
          {/* Header avec titre et statut */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{demand.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{demand.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </span>
              {demand.isUrgent && (
                <div className="flex items-center gap-1 text-red-600 text-xs">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Urgent</span>
                </div>
              )}
            </div>
          </div>

          {/* Informations du produit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">{demand.product}</span> - {demand.quantity} {demand.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Budget max: <span className="font-medium text-green-600">{demand.budgetMax.toLocaleString()} XOF</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{demand.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Publiée le {demand.publishedDate}
              </span>
            </div>
          </div>

          {/* Exigences */}
          {demand.requirements && demand.requirements.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Exigences :</h4>
              <div className="flex flex-wrap gap-2">
                {demand.requirements.map((requirement, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {requirement}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section droite - Distributeur et actions */}
        <div className="col-span-4">
          {/* Informations du distributeur */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Distributeur</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {demand.distributor.name.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900 text-sm">{demand.distributor.name}</div>
                <div className="text-xs text-gray-500">{demand.distributor.city}</div>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{demand.distributor.rating}/5</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations temporelles */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Échéance</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{demand.deadline}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Candidats</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{demand.applicantsCount}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Temps restant</span>
              <span className={`text-sm font-medium ${
                demand.daysLeft <= 0 
                  ? 'text-red-600' 
                  : demand.daysLeft <= 2 
                  ? 'text-orange-600' 
                  : 'text-green-600'
              }`}>
                {demand.daysLeft > 0 ? `${demand.daysLeft} jours` : 'Expirée'}
              </span>
            </div>
          </div>

          {/* Bouton d'action */}
          <Button
            onClick={() => onSubmitOffer(demand)}
            disabled={demand.daysLeft <= 0}
            className={`w-full ${
              demand.daysLeft <= 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {demand.daysLeft <= 0 ? 'Expirée' : 'Soumettre une offre'}
          </Button>

          {demand.daysLeft <= 0 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Cette annonce a expiré
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
