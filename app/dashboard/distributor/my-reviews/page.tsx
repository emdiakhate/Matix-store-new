'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import ReviewModal from '@/components/ReviewModal';
import StarRatingInput from '@/components/ui/StarRatingInput';
import Toast, { useToast } from '@/components/ui/toast';
import { Star, Edit, Calendar, Image as ImageIcon, Package, MessageSquare } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
  producer: string;
  purchaseDate: string;
}

interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  comment?: string;
  image?: string;
  created_at: string;
  updated_at: string;
  product: Product;
}

interface ReviewFormData {
  rating: number;
  comment?: string;
  image?: File;
}

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedReview, setSelectedReview] = useState<ProductReview | null>(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showSuccess, showError } = useToast();

  // Mock data - À remplacer par des appels API réels
  const [pendingProducts, setPendingProducts] = useState<Product[]>([
    {
      id: 'prod1',
      name: 'Poulets fermiers bio',
      image:
        'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 4500,
      producer: 'Ferme Diallo',
      purchaseDate: '2024-09-15',
    },
    {
      id: 'prod2',
      name: 'Œufs frais x30',
      image:
        'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 2500,
      producer: 'Ferme Sall',
      purchaseDate: '2024-09-12',
    },
    {
      id: 'prod3',
      name: 'Aliment ponte 25kg',
      image:
        'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300',
      price: 18500,
      producer: 'Ferme Ba',
      purchaseDate: '2024-09-10',
    },
  ]);

  const [reviews, setReviews] = useState<ProductReview[]>([
    {
      id: 'rev1',
      productId: 'prod4',
      rating: 5,
      comment: 'Excellent produit, très frais et de qualité. Je recommande vivement ce producteur.',
      image:
        'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300',
      created_at: '2024-09-08T10:00:00Z',
      updated_at: '2024-09-08T10:00:00Z',
      product: {
        id: 'prod4',
        name: 'Poussins x100',
        image:
          'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 8500,
        producer: 'Ferme Ndiaye',
        purchaseDate: '2024-09-05',
      },
    },
    {
      id: 'rev2',
      productId: 'prod5',
      rating: 4,
      comment:
        "Bon produit, livraison rapide. Petit bémol sur l'emballage mais le contenu est parfait.",
      created_at: '2024-09-03T14:30:00Z',
      updated_at: '2024-09-03T14:30:00Z',
      product: {
        id: 'prod5',
        name: 'Mangeoires automatiques',
        image:
          'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300',
        price: 15500,
        producer: 'Ferme Fall',
        purchaseDate: '2024-09-01',
      },
    },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Simuler un appel API
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleCreateReview = (product: Product) => {
    setSelectedProduct(product);
    setSelectedReview(null);
    setShowModal(true);
  };

  const handleEditReview = (review: ProductReview) => {
    setSelectedProduct(review.product);
    setSelectedReview(review);
    setShowModal(true);
  };

  const handleSubmitReview = async (reviewData: ReviewFormData) => {
    try {
      if (selectedReview) {
        // Modifier un avis existant
        console.log("Modification de l'avis:", selectedReview.id, reviewData);
        // TODO: Appel API pour modifier l'avis
      } else {
        // Créer un nouvel avis
        console.log("Création d'un nouvel avis pour:", selectedProduct?.id, reviewData);
        // TODO: Appel API pour créer l'avis
        // Retirer le produit de la liste des produits en attente
        if (selectedProduct) {
          setPendingProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
        }
      }

      // Afficher un toast de succès
      showSuccess(
        selectedReview ? 'Avis modifié avec succès !' : 'Avis publié avec succès !',
        'Votre avis a été enregistré et sera visible par les autres utilisateurs.'
      );
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      showError('Erreur lors de la soumission', 'Une erreur est survenue. Veuillez réessayer.');
      throw error;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
    }).format(amount);
  };

  if (loading) {
    return (
      <AdaptiveLayout activePage="my-reviews">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdaptiveLayout>
    );
  }

  return (
    <AdaptiveLayout activePage="my-reviews">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Avis</h1>
        <p className="text-gray-600 mt-1">
          Partagez votre expérience avec les produits que vous avez achetés
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          À Évaluer ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reviewed'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes Avis ({reviews.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pending' ? (
        <div className="space-y-4">
          {pendingProducts.length > 0 ? (
            pendingProducts.map(product => (
              <Card key={product.id} className="p-6">
                <div className="flex items-center gap-4">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-600">Producteur: {product.producer}</p>
                    <p className="text-sm text-gray-600">
                      Acheté le {formatDate(product.purchaseDate)}
                    </p>
                    <p className="text-lg font-bold text-green-600 mt-1">
                      {formatCurrency(product.price)}
                    </p>
                  </div>

                  <Button
                    onClick={() => handleCreateReview(product)}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <Star className="h-4 w-4" />
                    Donner un avis
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit à évaluer</h3>
              <p className="text-gray-600">
                Vous avez évalué tous vos achats récents. Continuez à acheter pour pouvoir donner de
                nouveaux avis !
              </p>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map(review => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  {review.product.image ? (
                    <img
                      src={review.product.image}
                      alt={review.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{review.product.name}</h3>
                      <Button
                        onClick={() => handleEditReview(review)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Producteur: {review.product.producer}
                    </p>

                    <div className="flex items-center gap-4 mb-3">
                      <StarRatingInput
                        rating={review.rating}
                        onRatingChange={() => {}}
                        readonly={true}
                        size="sm"
                      />
                      <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                    </div>

                    {review.comment && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    )}

                    {review.image && (
                      <div className="mt-3">
                        <img
                          src={review.image}
                          alt="Photo de l'avis"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-12 text-center">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun avis publié</h3>
              <p className="text-gray-600">
                Vous n'avez pas encore publié d'avis. Commencez par évaluer vos achats !
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedProduct && (
        <ReviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          product={selectedProduct}
          existingReview={selectedReview || undefined}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </AdaptiveLayout>
  );
}
