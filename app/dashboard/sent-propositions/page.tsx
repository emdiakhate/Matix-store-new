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

interface Proposition {
  id: string;
  producer_id: string;
  distributor_id: string;
  announcement_id: string;
  proposed_price: number;
  quantity: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  response_message?: string;
  created_at: string;
  responded_at?: string;
  expires_at?: string;
  announcements: {
    id: string;
    title: string;
    description: string;
    category: string;
    quantity: number;
    unit: string;
    budget?: number;
    deadline: string;
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

export default function SentPropositionsPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState<PropositionCounts>({
    all: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    expired: 0
  });

  useEffect(() => {
    loadPropositions();
  }, []);

  const loadPropositions = async () => {
    try {
      setLoading(true);
      
      // Données mockées pour les propositions envoyées par le producteur
      const mockPropositions: Proposition[] = [
        {
          id: '1',
          producer_id: 'prod1',
          distributor_id: 'dist1',
          announcement_id: 'ann1',
          proposed_price: 4500,
          quantity: 100,
          message: 'Je peux fournir 100 poulets fermiers de qualité supérieure pour le 31 décembre. Prix compétitif et livraison garantie.',
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z',
          expires_at: '2024-01-25T10:30:00Z',
          announcements: {
            id: 'ann1',
            title: 'Commande poulets pour réveillon',
            description: 'Recherche 150 poulets fermiers pour le réveillon du 31 décembre',
            category: 'Volailles Vivantes',
            quantity: 150,
            unit: 'pièces',
            budget: 500000,
            deadline: '2024-01-30'
          },
          users: {
            id: 'dist1',
            business_name: 'Super Marché Dakar',
            is_verified: true
          }
        },
        {
          id: '2',
          producer_id: 'prod1',
          distributor_id: 'dist2',
          announcement_id: 'ann2',
          proposed_price: 3800,
          quantity: 50,
          message: 'Poulets fermiers disponibles, prix attractif pour commande groupée.',
          status: 'accepted',
          response_message: 'Parfait ! Nous acceptons votre proposition. Contactez-nous pour finaliser.',
          created_at: '2024-01-10T14:20:00Z',
          responded_at: '2024-01-12T09:15:00Z',
          announcements: {
            id: 'ann2',
            title: 'Achat poulets fermiers',
            description: 'Commande régulière de poulets fermiers',
            category: 'Volailles Vivantes',
            quantity: 50,
            unit: 'pièces',
            budget: 200000,
            deadline: '2024-01-20'
          },
          users: {
            id: 'dist2',
            business_name: 'Boucherie Moderne',
            is_verified: false
          }
        },
        {
          id: '3',
          producer_id: 'prod1',
          distributor_id: 'dist3',
          announcement_id: 'ann3',
          proposed_price: 4200,
          quantity: 75,
          message: 'Poulets bio disponibles, qualité premium garantie.',
          status: 'rejected',
          response_message: 'Merci pour votre proposition, mais nous avons choisi un autre fournisseur.',
          created_at: '2024-01-08T16:45:00Z',
          responded_at: '2024-01-10T11:30:00Z',
          announcements: {
            id: 'ann3',
            title: 'Poulets bio premium',
            description: 'Recherche poulets biologiques de qualité premium',
            category: 'Volailles Vivantes',
            quantity: 75,
            unit: 'pièces',
            budget: 350000,
            deadline: '2024-01-15'
          },
          users: {
            id: 'dist3',
            business_name: 'Bio Market',
            is_verified: true
          }
        },
        {
          id: '4',
          producer_id: 'prod1',
          distributor_id: 'dist4',
          announcement_id: 'ann4',
          proposed_price: 4000,
          quantity: 200,
          message: 'Grande quantité disponible, prix dégressif pour commande importante.',
          status: 'expired',
          created_at: '2024-01-05T08:10:00Z',
          expires_at: '2024-01-12T08:10:00Z',
          announcements: {
            id: 'ann4',
            title: 'Commande importante poulets',
            description: 'Commande de 200 poulets pour événement',
            category: 'Volailles Vivantes',
            quantity: 200,
            unit: 'pièces',
            budget: 800000,
            deadline: '2024-01-18'
          },
          users: {
            id: 'dist4',
            business_name: 'Restaurant Le Gourmet',
            is_verified: true
          }
        }
      ];

      setPropositions(mockPropositions);
      
      // Calculer les compteurs
      const newCounts = {
        all: mockPropositions.length,
        pending: mockPropositions.filter(p => p.status === 'pending').length,
        accepted: mockPropositions.filter(p => p.status === 'accepted').length,
        rejected: mockPropositions.filter(p => p.status === 'rejected').length,
        expired: mockPropositions.filter(p => p.status === 'expired').length
      };
      setCounts(newCounts);
      
    } catch (error) {
      console.error('Erreur lors du chargement des propositions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Acceptée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Refusée
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <Clock className="h-3 w-3 mr-1" />
            Expirée
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredPropositions = propositions.filter(proposition => {
    if (activeTab === 'all') return true;
    return proposition.status === activeTab;
  });

  if (loading) {
    return (
      <AdaptiveLayout activePage="sent-propositions">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdaptiveLayout>
    );
  }

  return (
    <AdaptiveLayout activePage="sent-propositions">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Propositions Envoyées</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos propositions envoyées aux distributeurs
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-xl font-bold text-gray-900 mb-1">{counts.all}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-xl font-bold text-yellow-600 mb-1">{counts.pending}</div>
          <div className="text-sm text-gray-600">En attente</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-xl font-bold text-green-600 mb-1">{counts.accepted}</div>
          <div className="text-sm text-gray-600">Acceptées</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-xl font-bold text-red-600 mb-1">{counts.rejected}</div>
          <div className="text-sm text-gray-600">Refusées</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-xl font-bold text-gray-600 mb-1">{counts.expired}</div>
          <div className="text-sm text-gray-600">Expirées</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'all', label: 'Toutes' },
          { id: 'pending', label: 'En attente' },
          { id: 'accepted', label: 'Acceptées' },
          { id: 'rejected', label: 'Refusées' },
          { id: 'expired', label: 'Expirées' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Propositions List */}
      <div className="space-y-4">
        {filteredPropositions.map((proposition) => (
          <div key={proposition.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {proposition.announcements.title}
                  </h3>
                  {getStatusBadge(proposition.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Distributeur:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span>{proposition.users.business_name}</span>
                      {proposition.users.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Vérifié
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Prix proposé:</span>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(proposition.proposed_price)} / unité
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Quantité:</span>
                    <div>{proposition.quantity} {proposition.announcements.unit}</div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Total:</span>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(proposition.proposed_price * proposition.quantity)}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-medium">Envoyée le:</span>
                    <div>{formatDate(proposition.created_at)}</div>
                  </div>
                  
                  {proposition.expires_at && (
                    <div>
                      <span className="font-medium">Expire le:</span>
                      <div>{formatDate(proposition.expires_at)}</div>
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <span className="font-medium text-gray-700">Message envoyé:</span>
                  <p className="text-gray-600 mt-1">{proposition.message}</p>
                </div>

                {proposition.response_message && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Réponse du distributeur:</span>
                    <p className="text-gray-600 mt-1">{proposition.response_message}</p>
                    {proposition.responded_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Répondu le {formatDate(proposition.responded_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Voir
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPropositions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune proposition trouvée</h3>
            <p className="text-gray-600">Vous n'avez pas encore envoyé de propositions aux distributeurs.</p>
          </div>
        )}
      </div>
    </AdaptiveLayout>
  );
}
