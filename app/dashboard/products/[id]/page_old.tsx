"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StarRating from '@/components/ui/StarRating';
import ReviewStats from '@/components/ReviewStats';
import ReviewCard from '@/components/ReviewCard';
import { 
  BarChart3, 
  Package, 
  Star, 
  User as UserIcon, 
  Edit, 
  Lock, 
  LogOut,
  Plus,
  Eye,
  Copy,
  Power,
  ShoppingCart,
  MapPin,
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
  const [activePage, setActivePage] = useState('products');
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const user = {
    name: "Amadou Diallo",
    email: "amadou@gmail.com",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100"
  };

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
      description: "Mangeoire automatique de 5 litres, système anti-gaspi, facile à nettoyer."
    }
  ];

  // Données mockées des reviews
  const mockReviews: ProductReview[] = [
    {
      id: '1',
      product_id: '1',
      distributor_id: 'dist1',
      rating: 5,
      comment: 'Excellent produit ! Les poulets sont de très bonne qualité et le service de livraison est impeccable.',
      created_at: '2025-09-15T10:30:00Z',
      distributor_name: 'Ferme Diallo'
    },
    {
      id: '2',
      product_id: '1',
      distributor_id: 'dist2',
      rating: 4,
      comment: 'Très bon produit, je recommande. La qualité est au rendez-vous.',
      created_at: '2025-09-12T14:20:00Z',
      distributor_name: 'Élevage Sall'
    },
    {
      id: '3',
      product_id: '1',
      distributor_id: 'dist3',
      rating: 4,
      comment: 'Produit conforme à mes attentes. Livraison rapide et emballage soigné.',
      created_at: '2025-09-10T09:15:00Z',
      distributor_name: 'Bio Sénégal'
    },
    {
      id: '4',
      product_id: '1',
      distributor_id: 'dist4',
      rating: 3,
      comment: 'Correct mais pourrait être mieux. Le prix est un peu élevé.',
      created_at: '2025-09-08T16:45:00Z',
      distributor_name: 'Ferme Avicole'
    },
    {
      id: '5',
      product_id: '1',
      distributor_id: 'dist5',
      rating: 5,
      comment: 'Parfait ! Je commande régulièrement et je suis toujours satisfait.',
      created_at: '2025-09-05T11:30:00Z',
      distributor_name: 'Élevage Traditionnel'
    },
    {
      id: '6',
      product_id: '1',
      distributor_id: 'dist6',
      rating: 4,
      comment: 'Bon produit, bonne qualité. Je recommande ce producteur.',
      created_at: '2025-09-03T13:20:00Z',
      distributor_name: 'Ferme Moderne'
    }
  ];

  useEffect(() => {
    const productId = params.id as string;
    const foundProduct = mockProducts.find(p => p.id.toString() === productId);
    
    if (foundProduct) {
      setProduct(foundProduct);
      
      // Filtrer les reviews pour ce produit
      const productReviews = mockReviews.filter(r => r.product_id === productId);
      setReviews(productReviews);
      
      // Calculer les statistiques
      const stats: ProductReviewStats = {
        average_rating: foundProduct.rating,
        total_reviews: foundProduct.reviewCount,
        rating_distribution: {
          5: productReviews.filter(r => r.rating === 5).length,
          4: productReviews.filter(r => r.rating === 4).length,
          3: productReviews.filter(r => r.rating === 3).length,
          2: productReviews.filter(r => r.rating === 2).length,
          1: productReviews.filter(r => r.rating === 1).length,
        }
      };
      setReviewStats(stats);
    }
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Actif': 'bg-green-100 text-green-800 border-green-200',
      'Rupture': 'bg-red-100 text-red-800 border-red-200',
      'Inactif': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
        statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'products', label: 'Mes Produits', icon: <Package className="h-4 w-4" /> },
    { id: 'orders', label: 'Commandes Reçues', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> }
  ];

  // Pagination des reviews
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouvé</h1>
          <Link href="/dashboard/products">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Retour aux produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>📞 +221 77 123 45 67</span>
            <span>✉️ contact@matix.sn</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🌍 Dakar, Sénégal</span>
            <span>🕒 Lun-Ven: 8h-18h</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-green-600">MATIX</Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-gray-700 hover:text-green-600">Accueil</Link>
                <Link href="/categories" className="text-gray-700 hover:text-green-600">Catégories</Link>
                <Link href="/about" className="text-gray-700 hover:text-green-600">À Propos</Link>
                <Link href="/contact" className="text-gray-700 hover:text-green-600">Contact</Link>
                <Link href="/offers" className="text-gray-700 hover:text-green-600">Offres</Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <UserIcon className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.id === 'products' ? '/dashboard/products' : `/dashboard/${item.id}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activePage === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 mb-6">
              <Link href="/dashboard/products" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-gray-400">/</span>
              <Link href="/dashboard/products" className="text-gray-600 hover:text-gray-900">
                Mes Produits
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </div>

            {/* Product Details */}
            <Card className="p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Catégorie:</span>
                      <span className="text-gray-600">{product.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Prix:</span>
                      <span className="text-green-600 font-bold">{product.price} FCFA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Stock:</span>
                      <span className="text-gray-600">{product.stock} unités</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Statut:</span>
                      {getStatusBadge(product.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-700">Rating:</span>
                      <StarRating rating={product.rating} size="md" showNumber={true} />
                      <span className="text-sm text-gray-500">({product.reviewCount} avis)</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Modifier
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4 mr-2" />
                      Dupliquer
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Review Stats */}
              <div className="lg:col-span-1">
                {reviewStats && <ReviewStats stats={reviewStats} />}
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Avis Clients</h3>
                  
                  {currentReviews.length > 0 ? (
                    <div className="space-y-4">
                      {currentReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} />
                      ))}
                      
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, reviews.length)} sur {reviews.length} avis
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun avis pour le moment</h4>
                      <p className="text-gray-600">Ce produit n'a pas encore reçu d'avis de la part des distributeurs.</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
