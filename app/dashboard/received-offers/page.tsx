'use client';

import { useState } from 'react';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import TabButton from '@/components/ui/TabButton';

// Mock data pour les offres reçues
const mockReceivedOffers = [
  {
    id: '1',
    distributor: {
      id: '1',
      name: 'Super Marché Dakar',
      avatar: '/images/distributors/super-marche-dakar.jpg',
      rating: 4.8,
      location: 'Dakar, Sénégal'
    },
    product: {
      id: '1',
      name: 'Poulets de chair',
      image: '/images/products/poulets.jpg',
      category: 'Volaille'
    },
    proposedPrice: 2500,
    quantity: 100,
    message: 'Nous sommes intéressés par votre lot de poulets. Pouvez-vous nous proposer un prix pour 100 unités ?',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    expiresAt: '2024-01-22T10:30:00Z'
  },
  {
    id: '2',
    distributor: {
      id: '2',
      name: 'Restaurant Le Terroir',
      avatar: '/images/distributors/restaurant-terroir.jpg',
      rating: 4.6,
      location: 'Thiès, Sénégal'
    },
    product: {
      id: '2',
      name: 'Œufs frais',
      image: '/images/products/oeufs.jpg',
      category: 'Volaille'
    },
    proposedPrice: 150,
    quantity: 500,
    message: 'Nous cherchons des œufs frais pour notre restaurant. Livraison hebdomadaire souhaitée.',
    status: 'accepted',
    createdAt: '2024-01-14T14:20:00Z',
    expiresAt: '2024-01-21T14:20:00Z',
    respondedAt: '2024-01-15T09:15:00Z',
    responseMessage: 'Offre acceptée. Livraison prévue pour demain.'
  },
  {
    id: '3',
    distributor: {
      id: '3',
      name: 'Épicerie Moderne',
      avatar: '/images/distributors/epicerie-moderne.jpg',
      rating: 4.4,
      location: 'Saint-Louis, Sénégal'
    },
    product: {
      id: '3',
      name: 'Légumes bio',
      image: '/images/products/legumes.jpg',
      category: 'Légumes'
    },
    proposedPrice: 800,
    quantity: 50,
    message: 'Nous aimerions commander vos légumes bio pour notre épicerie.',
    status: 'rejected',
    createdAt: '2024-01-13T16:45:00Z',
    expiresAt: '2024-01-20T16:45:00Z',
    respondedAt: '2024-01-14T11:30:00Z',
    responseMessage: 'Désolé, nous n\'avons plus de stock disponible.'
  },
  {
    id: '4',
    distributor: {
      id: '4',
      name: 'Marché Central',
      avatar: '/images/distributors/marche-central.jpg',
      rating: 4.7,
      location: 'Kaolack, Sénégal'
    },
    product: {
      id: '1',
      name: 'Poulets de chair',
      image: '/images/products/poulets.jpg',
      category: 'Volaille'
    },
    proposedPrice: 2400,
    quantity: 200,
    message: 'Nous cherchons un fournisseur régulier pour notre marché. Prix négociable.',
    status: 'pending',
    createdAt: '2024-01-12T08:15:00Z',
    expiresAt: '2024-01-19T08:15:00Z'
  }
];

const statusLabels = {
  pending: 'En attente',
  accepted: 'Acceptée',
  rejected: 'Refusée',
  expired: 'Expirée'
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800'
};

export default function ReceivedOffersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffer, setSelectedOffer] = useState(null);

  const filteredOffers = mockReceivedOffers.filter(offer => {
    const matchesSearch = offer.distributor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && offer.status === activeTab;
  });

  const stats = {
    total: mockReceivedOffers.length,
    pending: mockReceivedOffers.filter(o => o.status === 'pending').length,
    accepted: mockReceivedOffers.filter(o => o.status === 'accepted').length,
    rejected: mockReceivedOffers.filter(o => o.status === 'rejected').length
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

  const handleAcceptOffer = (offerId: string) => {
    // Logique pour accepter une offre
    console.log('Accepter offre:', offerId);
  };

  const handleRejectOffer = (offerId: string) => {
    // Logique pour refuser une offre
    console.log('Refuser offre:', offerId);
  };

  return (
    <ProducerLayout activePage="received-offers">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes offres reçues</h1>
            <p className="text-gray-600">Gérez les propositions des distributeurs</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total des offres</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.accepted}</div>
            <div className="text-sm text-gray-600">Acceptées</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Refusées</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
          >
            Toutes ({stats.total})
          </TabButton>
          <TabButton
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          >
            En attente ({stats.pending})
          </TabButton>
          <TabButton
            active={activeTab === 'accepted'}
            onClick={() => setActiveTab('accepted')}
          >
            Acceptées ({stats.accepted})
          </TabButton>
          <TabButton
            active={activeTab === 'rejected'}
            onClick={() => setActiveTab('rejected')}
          >
            Refusées ({stats.rejected})
          </TabButton>
        </div>

        {/* Barre de recherche */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par distributeur ou produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tableau des offres */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distributeur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix proposé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={offer.distributor.avatar}
                            alt={offer.distributor.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {offer.distributor.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {offer.distributor.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <img
                            className="h-8 w-8 rounded object-cover"
                            src={offer.product.image}
                            alt={offer.product.name}
                          />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {offer.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {offer.product.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {offer.proposedPrice.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[offer.status]}`}>
                        {statusLabels[offer.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(offer.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOffer(offer)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </button>
                        {offer.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Accepter
                            </button>
                            <button
                              onClick={() => handleRejectOffer(offer.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Refuser
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de détails */}
        {selectedOffer && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de l'offre
                  </h3>
                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Distributeur</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOffer.distributor.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Produit</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOffer.product.name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOffer.quantity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix proposé</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOffer.proposedPrice.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOffer.message}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de création</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOffer.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expire le</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedOffer.expiresAt)}</p>
                    </div>
                  </div>

                  {selectedOffer.respondedAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Réponse</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOffer.responseMessage}</p>
                      <p className="mt-1 text-xs text-gray-500">Répondu le {formatDate(selectedOffer.respondedAt)}</p>
                    </div>
                  )}

                  {selectedOffer.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => {
                          handleRejectOffer(selectedOffer.id);
                          setSelectedOffer(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Refuser
                      </button>
                      <button
                        onClick={() => {
                          handleAcceptOffer(selectedOffer.id);
                          setSelectedOffer(null);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Accepter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProducerLayout>
  );
}
