"use client";

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Pause, 
  Play, 
  Trash2, 
  Bell,
  MapPin,
  DollarSign,
  Package
} from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  criteria: string;
  category: string;
  priceRange?: number;
  stockMinimum?: number;
  distance: number;
  frequency: 'immediate' | 'daily' | 'weekly';
  status: 'active' | 'paused';
  matches: number;
  lastNotification: string;
  created_at: string;
}

interface AlertCardProps {
  alert: Alert;
  onEdit: (alert: Alert) => void;
  onToggleStatus: (alertId: string) => void;
  onDelete: (alertId: string) => void;
  onViewMatches: (alert: Alert) => void;
}

export default function AlertCard({ 
  alert, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onViewMatches 
}: AlertCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusBadge = () => {
    if (alert.status === 'active') {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          Active
        </Badge>
      );
    }
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
        <Pause className="w-3 h-3 mr-1" />
        En pause
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Volailles & Viandes':
        return '🐓';
      case 'Œufs & Reproduction':
        return '🥚';
      case 'Aliments Avicoles':
        return '🌾';
      case 'Équipements':
        return '🏥';
      default:
        return '📦';
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'immediate':
        return 'Immédiate';
      case 'daily':
        return 'Quotidienne';
      case 'weekly':
        return 'Hebdomadaire';
      default:
        return frequency;
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 ${
        isHovered ? 'border-green-200' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-alert-id={alert.id}
    >
      {/* Header avec nom et statut */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(alert.category)}</span>
          <h3 className="font-semibold text-gray-900 text-lg">{alert.name}</h3>
        </div>
        {getStatusBadge()}
      </div>

      {/* Critères en chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
          {alert.criteria}
        </div>
        {alert.priceRange && (
          <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            Max: {alert.priceRange.toLocaleString('fr-FR')} FCFA
          </div>
        )}
        {alert.stockMinimum && (
          <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Stock min: {alert.stockMinimum}
          </div>
        )}
      </div>

      {/* Détails de l'alerte */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>Rayon: {alert.distance} km</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>Notifications: {getFrequencyText(alert.frequency)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span>Catégorie: {alert.category}</span>
        </div>
      </div>

      {/* Matches et dernière notification */}
      <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">
            <span className="font-semibold text-green-600">{alert.matches}</span> nouveaux matches
          </span>
        </div>
        <span className="text-xs text-gray-500">{alert.lastNotification}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {alert.matches > 0 && (
          <button 
            onClick={() => onViewMatches(alert)}
            className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Voir matches ({alert.matches})
          </button>
        )}
        
        <button 
          onClick={() => onEdit(alert)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          title="Modifier"
        >
          <Edit className="w-4 h-4" />
        </button>
        
        <button 
          onClick={() => onToggleStatus(alert.id)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          title={alert.status === 'active' ? 'Mettre en pause' : 'Activer'}
        >
          {alert.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        
        <button 
          onClick={() => onDelete(alert.id)}
          className="px-3 py-2 border border-red-300 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
