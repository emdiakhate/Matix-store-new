'use client';

import { useState } from 'react';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import TabButton from '@/components/ui/TabButton';

// Types
type AnnouncementStatus = 'draft' | 'active' | 'closed' | 'expired';

interface Announcement {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  availabilityDate: string;
  status: AnnouncementStatus;
  createdAt: string;
  updatedAt: string;
  images: string[];
  location: string;
  minimumOrder: number;
  deliveryAvailable: boolean;
  deliveryRadius: number;
}

// Mock data pour les annonces du producteur
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Poulets de chair disponibles pour le réveillon',
    description: '150 poulets de chair de 3kg disponibles pour le 31 décembre. Élevés en plein air, nourris aux céréales locales.',
    category: 'Volaille',
    quantity: 150,
    unit: 'pièces',
    price: 2500,
    availabilityDate: '2024-12-31',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    images: ['/images/products/poulets.jpg'],
    location: 'Thiès, Sénégal',
    minimumOrder: 10,
    deliveryAvailable: true,
    deliveryRadius: 50
  },
  {
    id: '2',
    title: 'Œufs frais - Livraison hebdomadaire',
    description: 'Œufs frais de nos poules pondeuses. Livraison tous les mardis dans la région de Dakar.',
    category: 'Volaille',
    quantity: 1000,
    unit: 'pièces',
    price: 150,
    availabilityDate: '2024-01-23',
    status: 'active',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z',
    images: ['/images/products/oeufs.jpg'],
    location: 'Dakar, Sénégal',
    minimumOrder: 50,
    deliveryAvailable: true,
    deliveryRadius: 30
  },
  {
    id: '3',
    title: 'Légumes bio de saison',
    description: 'Tomates, carottes, épinards et salades cultivés en agriculture biologique. Récolte prévue dans 2 semaines.',
    category: 'Légumes',
    quantity: 200,
    unit: 'kg',
    price: 800,
    availabilityDate: '2024-02-01',
    status: 'draft',
    createdAt: '2024-01-13T16:45:00Z',
    updatedAt: '2024-01-13T16:45:00Z',
    images: ['/images/products/legumes.jpg'],
    location: 'Saint-Louis, Sénégal',
    minimumOrder: 5,
    deliveryAvailable: false,
    deliveryRadius: 0
  },
  {
    id: '4',
    title: 'Agneau de Pâques',
    description: 'Agneaux de race locale, élevés en plein air. Disponibles pour la période de Pâques.',
    category: 'Viande',
    quantity: 25,
    unit: 'pièces',
    price: 45000,
    availabilityDate: '2024-03-31',
    status: 'closed',
    createdAt: '2024-01-12T08:15:00Z',
    updatedAt: '2024-01-16T12:00:00Z',
    images: ['/images/products/agneau.jpg'],
    location: 'Kaolack, Sénégal',
    minimumOrder: 1,
    deliveryAvailable: true,
    deliveryRadius: 100
  }
];

const statusLabels: Record<AnnouncementStatus, string> = {
  draft: 'Brouillon',
  active: 'Active',
  closed: 'Fermée',
  expired: 'Expirée'
};

const statusColors: Record<AnnouncementStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800'
};

export default function ProducerAnnouncementsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredAnnouncements = mockAnnouncements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && announcement.status === activeTab;
  });

  const stats = {
    total: mockAnnouncements.length,
    active: mockAnnouncements.filter(a => a.status === 'active').length,
    draft: mockAnnouncements.filter(a => a.status === 'draft').length,
    closed: mockAnnouncements.filter(a => a.status === 'closed').length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateAnnouncement = () => {
    setShowCreateModal(true);
  };

  const handleEditAnnouncement = (announcementId: string) => {
    // Logique pour éditer une annonce
    console.log('Éditer annonce:', announcementId);
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    // Logique pour supprimer une annonce
    console.log('Supprimer annonce:', announcementId);
  };

  const handleToggleStatus = (announcementId: string) => {
    // Logique pour changer le statut d'une annonce
    console.log('Changer statut:', announcementId);
  };

  return (
    <AdaptiveLayout activePage="announcements">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes annonces</h1>
            <p className="text-gray-600">Gérez vos annonces de produits futurs</p>
          </div>
          <button
            onClick={handleCreateAnnouncement}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Créer une annonce
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total des annonces</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">Actives</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Brouillons</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-red-600">{stats.closed}</div>
            <div className="text-sm text-gray-600">Fermées</div>
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
            active={activeTab === 'active'}
            onClick={() => setActiveTab('active')}
          >
            Actives ({stats.active})
          </TabButton>
          <TabButton
            active={activeTab === 'draft'}
            onClick={() => setActiveTab('draft')}
          >
            Brouillons ({stats.draft})
          </TabButton>
          <TabButton
            active={activeTab === 'closed'}
            onClick={() => setActiveTab('closed')}
          >
            Fermées ({stats.closed})
          </TabButton>
        </div>

        {/* Barre de recherche */}
        <div className="flex justify-between items-center">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher par titre, description ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tableau des annonces */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Annonce
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disponibilité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnouncements.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={announcement.images[0]}
                            alt={announcement.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {announcement.title}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {announcement.description}
                          </div>
                          <div className="text-xs text-gray-400">
                            {announcement.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {announcement.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {announcement.quantity} {announcement.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {announcement.price.toLocaleString()} FCFA
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(announcement.availabilityDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[announcement.status as AnnouncementStatus] || statusColors.draft}`}>
                        {statusLabels[announcement.status as AnnouncementStatus] || statusLabels.draft}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedAnnouncement(announcement)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </button>
                        <button
                          onClick={() => handleEditAnnouncement(announcement.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Éditer
                        </button>
                        {announcement.status === 'active' && (
                          <button
                            onClick={() => handleToggleStatus(announcement.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Fermer
                          </button>
                        )}
                        {announcement.status === 'draft' && (
                          <button
                            onClick={() => handleToggleStatus(announcement.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Publier
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de détails */}
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Détails de l'annonce
                  </h3>
                  <button
                    onClick={() => setSelectedAnnouncement(null)}
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
                      <label className="block text-sm font-medium text-gray-700">Titre</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.category}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.quantity} {selectedAnnouncement.unit}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.price.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de disponibilité</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAnnouncement.availabilityDate)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commande minimum</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.minimumOrder} {selectedAnnouncement.unit}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Localisation</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Livraison</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedAnnouncement.deliveryAvailable 
                          ? `Disponible (rayon: ${selectedAnnouncement.deliveryRadius}km)`
                          : 'Non disponible'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Créée le</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAnnouncement.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Modifiée le</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedAnnouncement.updatedAt)}</p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => {
                        handleEditAnnouncement(selectedAnnouncement.id);
                        setSelectedAnnouncement(null);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Éditer
                    </button>
                    {selectedAnnouncement.status === 'active' && (
                      <button
                        onClick={() => {
                          handleToggleStatus(selectedAnnouncement.id);
                          setSelectedAnnouncement(null);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
                      >
                        Fermer
                      </button>
                    )}
                    {selectedAnnouncement.status === 'draft' && (
                      <button
                        onClick={() => {
                          handleToggleStatus(selectedAnnouncement.id);
                          setSelectedAnnouncement(null);
                        }}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                      >
                        Publier
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de création */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Créer une nouvelle annonce
                  </h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre de l'annonce</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Poulets de chair disponibles pour le réveillon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Décrivez votre produit en détail..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Volaille</option>
                        <option>Viande</option>
                        <option>Légumes</option>
                        <option>Fruits</option>
                        <option>Céréales</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantité</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unité</label>
                      <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>pièces</option>
                        <option>kg</option>
                        <option>litres</option>
                        <option>tonnes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prix (FCFA)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="2500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de disponibilité</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Commande minimum</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Localisation</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Dakar, Sénégal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rayon de livraison (km)</label>
                      <input
                        type="number"
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="deliveryAvailable"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-gray-900">
                      Livraison disponible
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Créer l'annonce
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdaptiveLayout>
  );
}
