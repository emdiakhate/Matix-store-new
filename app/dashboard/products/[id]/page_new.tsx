"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import StarRating from '@/components/ui/StarRating';
import ReviewStats from '@/components/ReviewStats';
import ReviewCard from '@/components/ReviewCard';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { ProductReview, ProductReviewStats } from '@/lib/types';

interface Product {
  id: number;
  name: string;
  price: string;
  stock: number;
  status: string;
  image: string;
  category: string;
  rating: number;
  reviewCount: number;
  description?: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Données mockées des produits
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Poulet Fermier Bio Premium",
      price: "4500",
      stock: 25,
      status: "Actif",
      image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Poulets de Chair",
      rating: 4.2,
      reviewCount: 12,
      description: "Poulets fermiers élevés en liberté, nourris avec des aliments biologiques. Qualité premium garantie."
    },
    {
      id: 2,
      name: "Poussins ISA Brown",
      price: "850",
      stock: 50,
      status: "Actif",
      image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Poussins",
      rating: 4.8,
      reviewCount: 8,
      description: "Poussins de race ISA Brown, excellente pondeuse. Livraison dans les 24h."
    },
    {
      id: 3,
      name: "Œufs à Couver Fertiles",
      price: "125",
      stock: 200,
      status: "Actif",
      image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Œufs",
      rating: 3.9,
      reviewCount: 15,
      description: "Œufs fertiles de qualité supérieure, taux d'éclosion élevé."
    },
    {
      id: 4,
      name: "Aliment Ponte Premium",
      price: "18500",
      stock: 0,
      status: "Rupture",
      image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Aliments",
      rating: 4.5,
      reviewCount: 6,
      description: "Aliment complet pour poules pondeuses, enrichi en vitamines et minéraux."
    },
    {
      id: 5,
      name: "Mangeoire Automatique 5L",
      price: "15500",
      stock: 12,
      status: "Actif",
      image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Équipements",
      rating: 4.7,
      reviewCount: 9,
      description: "Mangeoire automatique avec distributeur d'aliment, capacité 5 litres."
    }
  ];

  // Données mockées des avis
  const mockReviews: ProductReview[] = [
    {
      id: 1,
      product_id: 1,
      distributor_id: 1,
      rating: 5,
      comment: "Excellent produit ! Les poulets sont vraiment de qualité supérieure. Je recommande vivement.",
      created_at: "2024-01-15T10:30:00Z",
      distributor_name: "Fatou Sall"
    },
    {
      id: 2,
      product_id: 1,
      distributor_id: 2,
      rating: 4,
      comment: "Très bon rapport qualité-prix. Les poulets sont frais et bien conditionnés.",
      created_at: "2024-01-12T14:20:00Z",
      distributor_name: "Ibrahima Ba"
    },
    {
      id: 3,
      product_id: 1,
      distributor_id: 3,
      rating: 5,
      comment: "Service impeccable et produits de qualité. Je suis très satisfait de mon achat.",
      created_at: "2024-01-10T09:15:00Z",
      distributor_name: "Aïcha Ndiaye"
    },
    {
      id: 4,
      product_id: 1,
      distributor_id: 4,
      rating: 3,
      comment: "Bon produit mais la livraison a pris plus de temps que prévu.",
      created_at: "2024-01-08T16:45:00Z",
      distributor_name: "Moussa Fall"
    },
    {
      id: 5,
      product_id: 1,
      distributor_id: 5,
      rating: 4,
      comment: "Qualité correcte, prix raisonnable. Je recommande ce producteur.",
      created_at: "2024-01-05T11:30:00Z",
      distributor_name: "Khadija Diop"
    },
    {
      id: 6,
      product_id: 1,
      distributor_id: 6,
      rating: 5,
      comment: "Parfait ! Les poulets sont exactement comme décrits. Très professionnel.",
      created_at: "2024-01-03T13:20:00Z",
      distributor_name: "Omar Sy"
    },
    {
      id: 7,
      product_id: 1,
      distributor_id: 7,
      rating: 4,
      comment: "Bon produit, bon service. Je reviendrai certainement.",
      created_at: "2024-01-01T08:10:00Z",
      distributor_name: "Mariama Ba"
    },
    {
      id: 8,
      product_id: 1,
      distributor_id: 8,
      rating: 5,
      comment: "Excellent ! Qualité premium comme annoncé. Je suis très satisfait.",
      created_at: "2023-12-28T15:30:00Z",
      distributor_name: "Cheikh Mbaye"
    }
  ];

  // Statistiques des avis mockées
  const mockReviewStats: ProductReviewStats = {
    average_rating: 4.2,
    total_reviews: 12,
    rating_distribution: {
      5: 5,
      4: 4,
      3: 2,
      2: 1,
      1: 0
    }
  };

  useEffect(() => {
    const productId = params.id ? parseInt(params.id as string) : 1;
    const foundProduct = mockProducts.find(p => p.id === productId);
    setProduct(foundProduct || null);
    
    // Simuler le chargement des avis
    setReviews(mockReviews);
    setReviewStats(mockReviewStats);
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Actif': 'bg-green-100 text-green-800',
      'Inactif': 'bg-gray-100 text-gray-800',
      'Rupture': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (!product) {
    return (
      <ProducerLayout activePage="products">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <p className="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas.</p>
          <Link href="/dashboard/products">
            <Button className="bg-matix-green-medium hover:bg-matix-green-dark text-white">
              Retour aux produits
            </Button>
          </Link>
        </div>
      </ProducerLayout>
    );
  }

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  return (
    <ProducerLayout activePage="products">
      <div className="mb-6">
        <Link href="/dashboard/products" className="inline-flex items-center text-matix-green-medium hover:text-matix-green-dark mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux produits
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations du produit */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                  {getStatusBadge(product.status)}
                </div>
                
                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Catégorie:</span>
                    <span className="ml-2 text-gray-900">{product.category}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Prix:</span>
                    <span className="ml-2 text-xl font-bold text-matix-green-medium">{product.price} FCFA</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Stock:</span>
                    <span className="ml-2 text-gray-900">{product.stock} unités</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 mr-2">Note:</span>
                    <StarRating rating={product.rating} />
                    <span className="ml-2 text-sm text-gray-600">({product.reviewCount} avis)</span>
                  </div>
                </div>

                {product.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Description:</h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Statistiques des avis */}
        <div className="lg:col-span-1">
          {reviewStats && (
            <ReviewStats 
              averageRating={reviewStats.average_rating}
              totalReviews={reviewStats.total_reviews}
              ratingDistribution={reviewStats.rating_distribution}
            />
          )}
        </div>
      </div>

      {/* Liste des avis */}
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Avis clients</h2>
        
        {currentReviews.length > 0 ? (
          <div className="space-y-4">
            {currentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                comment={review.comment}
                distributorName={review.distributor_name}
                createdAt={review.created_at}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun avis pour ce produit.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Affichage {startIndex + 1}-{Math.min(endIndex, reviews.length)} sur {reviews.length} avis
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </ProducerLayout>
  );
}
