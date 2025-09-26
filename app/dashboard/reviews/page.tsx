'use client';

import { useState } from 'react';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, X, Upload } from 'lucide-react';

export default function ProducerReviewsPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [rating, setRating] = useState(0);

  // Mock data pour les avis reçus par le producteur
  const receivedReviews = [
    {
      id: '1',
      product: {
        name: "Poulets de chair",
        image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=200"
      },
      distributor: {
        name: "Super Marché Dakar",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 5,
      comment: "Excellent produit, très frais et de bonne qualité. Livraison rapide.",
      date: "2024-01-15T10:30:00Z",
      images: []
    },
    {
      id: '2',
      product: {
        name: "Œufs frais",
        image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=200"
      },
      distributor: {
        name: "Restaurant Le Terroir",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 4,
      comment: "Très bon produit, je recommande. Petit bémol sur l'emballage.",
      date: "2024-01-14T14:20:00Z",
      images: []
    },
    {
      id: '3',
      product: {
        name: "Légumes bio",
        image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=200"
      },
      distributor: {
        name: "Épicerie Moderne",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 5,
      comment: "Produits bio de qualité exceptionnelle. Service client impeccable.",
      date: "2024-01-13T16:45:00Z",
      images: []
    },
    {
      id: '4',
      product: {
        name: "Poulets de chair",
        image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=200"
      },
      distributor: {
        name: "Marché Central",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 3,
      comment: "Produit correct mais livraison un peu tardive.",
      date: "2024-01-12T08:15:00Z",
      images: []
    }
  ];

  // Mock data pour les avis donnés par le producteur (sur les distributeurs)
  const givenReviews = [
    {
      id: '1',
      distributor: {
        name: "Super Marché Dakar",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 5,
      comment: "Excellent partenaire commercial, paiement rapide et communication fluide.",
      date: "2024-01-15T10:30:00Z"
    },
    {
      id: '2',
      distributor: {
        name: "Restaurant Le Terroir",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
      },
      rating: 4,
      comment: "Bon client, commandes régulières. Parfois un peu exigeant sur les délais.",
      date: "2024-01-14T14:20:00Z"
    }
  ];

  const stats = {
    totalReceived: receivedReviews.length,
    averageRating: receivedReviews.reduce((sum, review) => sum + review.rating, 0) / receivedReviews.length,
    totalGiven: givenReviews.length
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= currentRating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const openReviewModal = (distributorName: string) => {
    setSelectedProduct(distributorName);
    setIsModalOpen(true);
    setRating(0);
  };

  return (
    <ProducerLayout activePage="reviews">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Avis</h1>
            <p className="text-gray-600">Gérez les avis reçus et donnés</p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.totalReceived}</div>
            <div className="text-sm text-gray-600">Avis reçus</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Note moyenne</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.totalGiven}</div>
            <div className="text-sm text-gray-600">Avis donnés</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50'
            }`}
            onClick={() => setActiveTab('received')}
          >
            Avis reçus ({stats.totalReceived})
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              activeTab === 'given'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50'
            }`}
            onClick={() => setActiveTab('given')}
          >
            Avis donnés ({stats.totalGiven})
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'received' ? (
          <div className="space-y-4">
            {receivedReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{review.product.name}</h3>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <img
                          src={review.distributor.avatar}
                          alt={review.distributor.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm text-gray-600">{review.distributor.name}</span>
                      </div>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {givenReviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={review.distributor.avatar}
                      alt={review.distributor.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{review.distributor.name}</h3>
                      <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                    </div>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReviewModal(review.distributor.name)}
                      >
                        Modifier l'avis
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Bouton pour donner un nouvel avis */}
            <Card className="p-6 border-dashed border-2 border-gray-300">
              <div className="text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="font-medium text-gray-900 mb-2">Donner un avis</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Partagez votre expérience avec un distributeur
                </p>
                <Button
                  onClick={() => openReviewModal('Nouveau distributeur')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Donner un avis
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Modal d'avis */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Avis pour {selectedProduct}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                {renderStars(rating, true)}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Photos (optionnel)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">Glissez vos images ici</p>
                  <p className="text-xs text-gray-400">(Seuls les fichiers *.jpeg et *.png sont acceptés)</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none"
                  placeholder="Partagez votre expérience..."
                />
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setIsModalOpen(false)}
              >
                Publier l'avis
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProducerLayout>
  );
}