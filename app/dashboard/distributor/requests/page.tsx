"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import OffersModal from '@/components/OffersModal';
import CreateRequestModal, { NewRequestData } from '@/components/CreateRequestModal';
import { 
  Plus,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Package
} from 'lucide-react';
import { useAuth } from '@/hooks/useSupabase';
import { deliveryRequestService } from '@/lib/services';
import { getOffersForDemand, acceptOffer, rejectOffer } from '@/lib/actions/offers';

interface Request {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  category: string;
  status: 'active' | 'draft' | 'closed' | 'expired';
  created_at: string;
  deadline: string;
  budget?: number;
  location: string;
  offers_count: number;
  tags: string[];
}

export default function RequestsPage() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('requests');
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [offersData, setOffersData] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Le layout utilisera les données par défaut du distributeur

  useEffect(() => {
    loadRequests();
  }, []);

  const handleViewOffers = async (request: Request) => {
    setSelectedRequest(request);
    
    try {
      // Charger les offres pour cette demande
      const data = await getOffersForDemand(request.id);
      setOffersData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      // Utiliser des données mockées en cas d'erreur
      setOffersData({
        demand: {
          id: request.id,
          title: request.title,
          description: request.description,
          category: request.category,
          quantity: request.quantity,
          budget: request.budget,
          location: request.location,
          due_date: request.deadline
        },
        offers: [
          {
            id: '1',
            producer_id: 'prod1',
            producer_name: 'Ferme Avicole de Dakar',
            product_name: 'Poulets fermiers',
            proposed_price: 4500,
            quantity: 30,
            message: 'Nous pouvons fournir des poulets de qualité supérieure avec livraison rapide.',
            status: 'pending',
            created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            is_read: false
          },
          {
            id: '2',
            producer_id: 'prod2',
            producer_name: 'Élevage Traditionnel du Sénégal',
            product_name: 'Poulets fermiers',
            proposed_price: 4200,
            quantity: 25,
            message: 'Poulets élevés en liberté, prix compétitif.',
            status: 'pending',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            is_read: false
          },
          {
            id: '3',
            producer_id: 'prod3',
            producer_name: 'Bio Sénégal',
            product_name: 'Poulets bio',
            proposed_price: 5000,
            quantity: 20,
            message: 'Poulets biologiques certifiés, qualité premium.',
            status: 'pending',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            is_read: false
          }
        ]
      });
    }
    
    setShowOffersModal(true);
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      await acceptOffer(offerId, user?.id || '');
      
      // Marquer la demande comme "expired" (offre acceptée)
      if (selectedRequest) {
        setRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === selectedRequest.id 
              ? { ...request, status: 'expired' as const }
              : request
          )
        );
      }
      
      alert('Offre acceptée avec succès ! La demande a été marquée comme expirée.');
      setShowOffersModal(false);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
      alert('Erreur lors de l\'acceptation de l\'offre');
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId, user?.id || '');
      alert('Offre refusée');
      // Recharger les demandes pour mettre à jour les compteurs
      loadRequests();
    } catch (error) {
      console.error('Erreur lors du refus:', error);
      alert('Erreur lors du refus de l\'offre');
    }
  };

  const handleCreateRequest = (requestData: NewRequestData) => {
    // Générer un ID unique pour la nouvelle demande
    const newId = (requests.length + 1).toString();
    
    // Créer la nouvelle demande
    const newRequest: Request = {
      id: newId,
      title: requestData.title,
      description: requestData.description,
      quantity: requestData.quantity,
      unit: requestData.unit,
      category: requestData.category,
      status: 'active',
      created_at: new Date().toISOString().split('T')[0],
      deadline: requestData.deadline,
      budget: requestData.budget,
      location: requestData.location,
      offers_count: 0,
      tags: requestData.tags
    };

    // Ajouter la nouvelle demande à la liste
    setRequests(prevRequests => [newRequest, ...prevRequests]);
    
    alert('Demande créée avec succès !');
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      // Données mockées basées sur la photo
      const mockRequests: Request[] = [
        {
          id: '1',
          title: 'Test Demande Intégrée',
          description: 'Demande de test pour l\'intégration du système',
          quantity: 30,
          unit: 'pièces',
          category: 'Volailles Vivantes',
          status: 'active',
          created_at: '2025-09-13',
          deadline: '2025-09-20',
          budget: 150000,
          location: 'Dakar, Sénégal',
          offers_count: 3,
          tags: ['Volailles Vivantes']
        },
        {
          id: '2',
          title: 'poussins',
          description: 'Achat de poussins pour élevage',
          quantity: 34,
          unit: 'pièces (2.5kg/unité)',
          category: 'Volailles Vivantes',
          status: 'active',
          created_at: '2025-09-13',
          deadline: '2025-09-14',
          budget: 225000,
          location: 'Thiès, Sénégal',
          offers_count: 3,
          tags: ['Volailles Vivantes']
        },
        {
          id: '3',
          title: 'Commande de poulets fermiers',
          description: 'Commande de poulets fermiers de qualité',
          quantity: 500,
          unit: 'pièces',
          category: 'Volailles Vivantes',
          status: 'active',
          created_at: '2025-09-13',
          deadline: '2025-09-20',
          location: 'Kaolack, Sénégal',
          offers_count: 3,
          tags: ['Volailles Vivantes']
        },
        {
          id: '4',
          title: 'Achat d\'œufs frais',
          description: 'Achat d\'œufs frais pour consommation',
          quantity: 200,
          unit: 'pièces',
          category: 'Œufs & Reproduction',
          status: 'active',
          created_at: '2025-09-13',
          deadline: '2025-09-18',
          location: 'Dakar, Sénégal',
          offers_count: 3,
          tags: ['Œufs & Reproduction']
        },
        {
          id: '5',
          title: 'Équipements d\'élevage',
          description: 'Achat d\'équipements pour l\'élevage avicole',
          quantity: 50,
          unit: 'pièces',
          category: 'Équipements',
          status: 'active',
          created_at: '2025-09-13',
          deadline: '2025-09-25',
          location: 'Thiès, Sénégal',
          offers_count: 3,
          tags: ['Équipements']
        },
        {
          id: '6',
          title: 'Poulets fermiers - Offre acceptée',
          description: 'Commande de poulets fermiers de qualité (offre acceptée)',
          quantity: 100,
          unit: 'pièces',
          category: 'Volailles Vivantes',
          status: 'expired',
          created_at: '2025-09-10',
          deadline: '2025-09-15',
          location: 'Dakar, Sénégal',
          offers_count: 5,
          tags: ['Volailles Vivantes', 'Acceptée']
        },
        {
          id: '7',
          title: 'Œufs frais - Offre acceptée',
          description: 'Approvisionnement en œufs frais (offre acceptée)',
          quantity: 500,
          unit: 'unités',
          category: 'Œufs',
          status: 'expired',
          created_at: '2025-09-08',
          deadline: '2025-09-12',
          location: 'Thiès, Sénégal',
          offers_count: 3,
          tags: ['Œufs', 'Acceptée']
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Erreur lors du chargement des demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Actif
          </Badge>
        );
      case 'expired':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Expiré
          </Badge>
        );
      case 'draft':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            Brouillon
          </Badge>
        );
      case 'closed':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Fermé
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
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'active' && request.status !== 'active') return false;
    if (activeTab === 'draft' && request.status !== 'draft') return false;
    if (activeTab === 'closed' && request.status !== 'closed') return false;
    if (activeTab === 'expired' && request.status !== 'expired') return false;
    
    if (searchTerm && !request.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    return true;
  });

  const activeRequests = requests.filter(r => r.status === 'active').length;
  const expiredRequests = requests.filter(r => r.status === 'expired').length;
  const totalOffers = requests.reduce((sum, r) => sum + r.offers_count, 0);
  const totalRequests = requests.length;

  if (loading) {
    return (
      <DistributorLayout activePage="requests">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout activePage="requests">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Demandes</h1>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
            <Plus className="h-4 w-4" />
          Nouvelle Demande
          </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{activeRequests}</div>
          <div className="text-sm text-gray-600">Demandes actives</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalOffers}</div>
          <div className="text-sm text-gray-600">Offres reçues</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{expiredRequests}</div>
          <div className="text-sm text-gray-600">Demandes expirées</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalRequests}</div>
          <div className="text-sm text-gray-600">Total demandes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'active', label: 'Demandes Actives' },
          { id: 'draft', label: 'Brouillons' },
          { id: 'closed', label: 'Fermées' },
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

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
            <Input
              placeholder="Rechercher une demande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
        </div>
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actif</option>
          <option value="draft">Brouillon</option>
          <option value="closed">Fermé</option>
          <option value="expired">Expiré</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="space-y-4 mb-8">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white p-6 rounded-lg border hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.title}</h3>
                    {getStatusBadge(request.status)}
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        <span>{request.quantity} {request.unit}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Créée le {formatDate(request.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Offres:</span>
                    <button
                      onClick={() => handleViewOffers(request)}
                      className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {request.offers_count} offre{request.offers_count > 1 ? 's' : ''}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Échéance: {formatDate(request.deadline)}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{request.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {request.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {request.budget && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Budget: {formatCurrency(request.budget)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{request.location}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                      <Eye className="h-4 w-4" />
                    </Button>
                
                  <Button
                    variant="outline"
                    size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-600">Aucune demande ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </div>


      {/* Modal des Offres */}
      {showOffersModal && selectedRequest && offersData && (
        <OffersModal
          isOpen={showOffersModal}
          onClose={() => setShowOffersModal(false)}
          demand={offersData.demand}
          offers={offersData.offers}
          onAcceptOffer={handleAcceptOffer}
          onRejectOffer={handleRejectOffer}
        />
      )}

      {/* Modal de Création de Demande */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRequest}
      />
    </DistributorLayout>
  );
}