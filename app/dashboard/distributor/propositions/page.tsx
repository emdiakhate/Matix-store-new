'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import { 
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { authService } from '@/lib/auth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Proposition {
  id: string;
  distributor_id: string;
  producer_id: string;
  product_id: string;
  proposed_price: number;
  quantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  response_message?: string;
  created_at: string;
  responded_at?: string;
  expires_at?: string;
  products: {
    id: string;
    name: string;
    description: string;
    price: number;
    unit_type: string;
    images: string[];
  };
  users: {
    id: string;
    business_name: string;
    is_verified: boolean;
  };
}

interface PropositionCounts {
  all: number;
  pending: number;
  accepted: number;
  rejected: number;
  expired: number;
}

export default function DistributorPropositionsPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  // Le layout utilisera les données par défaut du distributeur
  const currentUser = {
    id: '303f243a-9129-4e94-8a6f-f8e247f0d15e'
  };
  const [counts, setCounts] = useState<PropositionCounts>({
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    expired: 0
  });
  const [highlightedProposition, setHighlightedProposition] = useState<string | null>(null);

  useEffect(() => {
    fetchPropositions();
  }, [filter]);

  const fetchPropositions = async () => {
    // Utiliser l'ID de l'utilisateur connecté ou un ID de test
    const distributorId = currentUser?.id || '303f243a-9129-4e94-8a6f-f8e247f0d15e'; // ID du distributeur pour les tests
    
    try {
      setLoading(true);
      console.log('🔍 Récupération des propositions pour distributeur:', distributorId);
      
      const response = await fetch(`/api/distributors/propositions?distributorId=${distributorId}&filter=${filter}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API propositions:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la récupération des propositions');
      }
      
      const data = await response.json();
      console.log('✅ Propositions récupérées:', data);
      setPropositions(data.propositions || []);
      setCounts(data.counts || counts);
    } catch (err) {
      console.error('❌ Erreur fetchPropositions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      accepted: { label: 'Acceptée', color: 'bg-green-100 text-green-800 border-green-200' },
      rejected: { label: 'Refusée', color: 'bg-red-100 text-red-800 border-red-200' },
      expired: { label: 'Expirée', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getFilterBadge = (filterType: string, count: number) => {
    const filterConfig = {
      all: { label: 'Toutes', color: 'bg-blue-100 text-blue-800' },
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Acceptées', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Refusées', color: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirées', color: 'bg-gray-100 text-gray-800' }
    };
    
    const config = filterConfig[filterType as keyof typeof filterConfig] || filterConfig.all;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label} ({count})
      </span>
    );
  };

  const renderPropositionActions = (proposition: Proposition) => {
    switch (proposition.status) {
      case 'accepted':
        return (
          <div className="flex gap-2 mt-4">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Procéder au paiement
            </Button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              📞 Contacter Producteur
            </button>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              📝 Nouvelle Proposition
            </button>
            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              📞 Contacter Producteur
            </button>
          </div>
        );
      case 'pending':
        return (
          <div className="flex gap-2 mt-4">
            <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              ✏️ Modifier Proposition
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              ❌ Annuler
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderPropositionContent = (proposition: Proposition) => {
    const totalPrice = proposition.proposed_price * proposition.quantity;
    
    const isHighlighted = highlightedProposition === proposition.id;
    
    return (
      <div className={`bg-white rounded-lg border p-6 hover:shadow-md transition-all duration-500 ${
        isHighlighted 
          ? 'border-green-500 shadow-lg ring-2 ring-green-200 bg-green-50' 
          : 'border-gray-200'
      }`}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {getStatusBadge(proposition.status)}
            <h3 className="text-lg font-semibold text-gray-900">
              PROPOSITION À {proposition.users.business_name.toUpperCase()}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(proposition.created_at), { addSuffix: true, locale: fr })}
            </div>
            <button className="text-gray-400 hover:text-gray-600 mt-1">
              ⋯
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 font-medium">
            Produit : {proposition.products.name}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <span className="text-sm text-gray-600">
              Quantité demandée : <strong>{proposition.quantity}</strong> {proposition.products.unit_type}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">💰</span>
            <span className="text-sm text-gray-600">
              Prix proposé : <strong>{proposition.proposed_price.toLocaleString()} FCFA</strong>
            </span>
          </div>
        </div>

        {proposition.message && (
          <div className="mb-4">
            <div className="flex items-start gap-2">
              <span className="text-lg">💬</span>
              <div>
                <span className="text-sm text-gray-600">Votre message :</span>
                <p className="text-sm text-gray-800 mt-1 bg-gray-50 p-3 rounded-lg">
                  {proposition.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {proposition.status === 'accepted' && proposition.responded_at && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-medium text-green-800">
                Acceptée le {formatDistanceToNow(new Date(proposition.responded_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
            {proposition.response_message && (
              <div className="flex items-start gap-2">
                <span className="text-green-600">💬</span>
                <div>
                  <span className="text-sm text-green-700">Réponse :</span>
                  <p className="text-sm text-green-800 mt-1">
                    {proposition.response_message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {proposition.status === 'rejected' && proposition.responded_at && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600">❌</span>
              <span className="text-sm font-medium text-red-800">
                Refusée le {formatDistanceToNow(new Date(proposition.responded_at), { addSuffix: true, locale: fr })}
              </span>
            </div>
            {proposition.response_message && (
              <div className="flex items-start gap-2">
                <span className="text-red-600">💬</span>
                <div>
                  <span className="text-sm text-red-700">Raison :</span>
                  <p className="text-sm text-red-800 mt-1">
                    {proposition.response_message}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {proposition.status === 'pending' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⏳</span>
              <span className="text-sm font-medium text-yellow-800">
                En attente de réponse
              </span>
            </div>
          </div>
        )}

        {renderPropositionActions(proposition)}
      </div>
    );
  };

  if (loading) {
    return (
      <AdaptiveLayout activePage="propositions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdaptiveLayout>
    );
  }

  if (error) {
    return (
      <AdaptiveLayout activePage="propositions">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={fetchPropositions}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </AdaptiveLayout>
    );
  }

  return (
    <AdaptiveLayout activePage="propositions">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Propositions Envoyées</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos propositions envoyées aux producteurs
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(counts).map(([filterType, count]) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === filterType
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {getFilterBadge(filterType, count)}
          </button>
        ))}
      </div>

      {/* Liste des propositions */}
      {propositions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune proposition {filter !== 'all' ? `(${filter})` : ''}
          </h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Vous n\'avez pas encore envoyé de propositions aux producteurs.'
              : `Aucune proposition avec le statut "${filter}".`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {propositions.map((proposition) => (
            <div key={proposition.id}>
              {renderPropositionContent(proposition)}
            </div>
          ))}
        </div>
      )}
    </AdaptiveLayout>
  );
}