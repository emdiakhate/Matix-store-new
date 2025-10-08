"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import PropositionModal from '@/components/PropositionModal';
import { 
  MapPin, 
  Phone, 
  Filter, 
  RotateCcw,
  Plus,
  Minus,
  Eye,
  UserPlus,
  AlertTriangle,
  Package,
  CheckCircle,
  Clock
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  image?: string;
}

interface Producer {
  id: string;
  name: string;
  avatar: string;
  verified: boolean;
  distance: number;
  rating: number;
  responseTime: string;
  lastUpdate: string;
  products: Product[];
}

interface PropositionFormData {
  productId: string;
  proposedPrice: number;
  quantity: number;
  message?: string;
}

export default function SearchProducersPage() {
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    maxDistance: 50,
    maxPrice: '',
    minStock: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [followedProducers, setFollowedProducers] = useState<Set<string>>(new Set());

  // Données mockées basées sur la photo
  const producers: Producer[] = [
    {
      id: 'prod1',
      name: 'Ferme Avicole de Dakar',
      avatar: 'F',
      verified: true,
      distance: 27,
      rating: 5.4,
      responseTime: '4h',
      lastUpdate: '31/08/2025',
      products: [
        {
          id: 'p1',
          name: 'Malick Diakhate',
          price: 2,
          unit: 'piece',
          stock: 5,
          category: 'Équipements Elevage',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p2',
          name: 'Mangeoire',
          price: 4000,
          unit: 'piece',
          stock: 50,
          category: 'Équipements Élevage',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p3',
          name: 'Test modif (Copie)',
          price: 8,
          unit: 'piece',
          stock: 0,
          category: 'Médicaments',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300'
        }
      ]
    },
    {
      id: 'prod2',
      name: 'Élevage Traditionnel du Sénégal',
      avatar: 'É',
      verified: true,
      distance: 24,
      rating: 5.6,
      responseTime: '2h',
      lastUpdate: '02/09/2025',
      products: [
        {
          id: 'p4',
          name: 'Poulets de chair',
          description: 'Poulets de chair de qualité supérieure',
          price: 5200,
          unit: 'piece',
          stock: 60,
          category: 'Volailles Vivantes',
          image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p5',
          name: 'Pintades',
          description: 'Pintades locales, viande savoureuse',
          price: 7500,
          unit: 'piece',
          stock: 30,
          category: 'Volailles Vivantes',
          image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p6',
          name: 'Œufs bio',
          description: 'Œufs biologiques de poules élevées en plel..',
          price: 250,
          unit: 'piece',
          stock: 300,
          category: 'Œufs & Reproduction',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300'
        }
      ]
    },
    {
      id: 'prod3',
      name: 'Volaille Premium de Thiès',
      avatar: 'V',
      verified: true,
      distance: 27,
      rating: 5.7,
      responseTime: '4h',
      lastUpdate: '02/09/2025',
      products: [
        {
          id: 'p7',
          name: 'Cailles',
          description: 'Cailles d\'élevage, œufs et viande',
          price: 3000,
          unit: 'piece',
          stock: 100,
          category: 'Volailles Vivantes',
          image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p8',
          name: 'Cages d\'élevage',
          description: 'Cages d\'élevage pour volailles, dimensions...',
          price: 15000,
          unit: 'piece',
          stock: 20,
          category: 'Équipements Elevage',
          image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300'
        },
        {
          id: 'p9',
          name: 'Pintades',
          description: 'Pintades élevées en liberté, viande delicate',
          price: 6000,
          unit: 'piece',
          stock: 40,
          category: 'Volailles Vivantes',
          image: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=300'
        }
      ]
    }
  ];

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      maxDistance: 50,
      maxPrice: '',
      minStock: ''
    });
  };

  const handleProposition = (producer: Producer, product: Product) => {
    setSelectedProducer(producer);
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleSubmitProposition = async (propositionData: PropositionFormData) => {
    try {
      console.log('Proposition envoyée:', {
        producer: selectedProducer?.name,
        product: selectedProduct?.name,
        ...propositionData
      });
      
      // TODO: Appel API pour envoyer la proposition
      alert('Proposition envoyée avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la proposition:', error);
      throw error;
    }
  };

  const handleFollowProducer = (producerId: string) => {
    setFollowedProducers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(producerId)) {
        newSet.delete(producerId);
        console.log('Producteur non suivi:', producerId);
      } else {
        newSet.add(producerId);
        console.log('Producteur suivi:', producerId);
      }
      return newSet;
    });
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 20) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(amount);
  };

  return (
    <AdaptiveLayout activePage="search">
      {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Rechercher Producteurs</h1>
            </div>

      {/* Filtres de Recherche */}
            <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres de Recherche</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot-clé</label>
                  <Input
                    placeholder="ex: poulets, œufs"
                    value={filters.keyword}
                    onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
              <option value="">Toutes catégor</option>
                    <option value="volailles">Volailles</option>
              <option value="oeufs">Œufs</option>
              <option value="aliments">Aliments</option>
                    <option value="equipements">Équipements</option>
                  </select>
                </div>

                <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance max: {filters.maxDistance} km</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
              className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix max (FCFA)</label>
                  <Input
                    placeholder="Ex: 5000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock min</label>
                  <Input
                    placeholder="Ex: 10"
                    value={filters.minStock}
                    onChange={(e) => setFilters({...filters, minStock: e.target.value})}
                  />
                </div>
              </div>

        <div className="flex gap-2 mt-4">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filtrer
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>
            </Card>

      {/* Producteurs Trouvés */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Producteurs Trouvés ({producers.length})</h2>
        
        <div className="space-y-6">
          {producers.map((producer) => (
            <div key={producer.id} className="border border-gray-200 rounded-lg p-6">
              {/* Header du producteur */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {producer.avatar}
                      </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{producer.name}</h3>
                      {producer.verified && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          Vérifié
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm" 
                      onClick={() => handleFollowProducer(producer.id)}
                      className={`flex items-center gap-1 ${
                        followedProducers.has(producer.id)
                          ? 'text-green-600 hover:text-green-800 bg-green-50'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <UserPlus className="h-4 w-4" />
                      {followedProducers.has(producer.id) ? 'Suivi' : 'Suivre'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Distance: ~{producer.distance} km</span>
                    <span>Note: {producer.rating}/5</span>
                    <span>Réponse: {producer.responseTime}</span>
                      </div>
                    </div>
                  </div>

              <div className="text-sm text-gray-600 mb-4">
                {producer.products.length} produits disponibles • Dernière mise à jour: {producer.lastUpdate}
                  </div>

              {/* Liste des produits */}
              <div className="space-y-3">
                {producer.products.slice(0, 3).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      {product.description && (
                        <p className="text-sm text-gray-600">{product.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-500">{product.category}</span>
                        <span className="font-medium text-gray-900">
                          {formatCurrency(product.price)} / {product.unit}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockBadgeColor(product.stock)}`}>
                          {product.stock} dispo
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                            <Button 
                        onClick={() => handleProposition(producer, product)}
                        className="text-blue-600 hover:text-blue-800 bg-transparent hover:bg-blue-50"
                              variant="ghost" 
                              size="sm" 
                      >
                        Proposition
                              </Button>
                              <Button 
                        variant="ghost"
                                size="sm" 
                        className="text-orange-600 hover:text-orange-800"
                              >
                                Alerte
                              </Button>
                            </div>
                  </div>
                ))}
                
                {producer.products.length > 3 && (
                  <div className="text-sm text-gray-500 text-center py-2">
                    +{producer.products.length - 3} autres produits
                </div>
                )}
              </div>
            </div>
          ))}
            </div>
      </Card>

      {/* Carte des Producteurs */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Carte des Producteurs</h2>
        <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
          {/* Contrôles de zoom */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
              <Plus className="h-4 w-4" />
            </button>
            <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
              <Minus className="h-4 w-4" />
            </button>
      </div>

          {/* Légende */}
          <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Volailles</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Poussins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Œufs</span>
        </div>
      </div>

          {/* Pins de localisation simulés */}
          <div className="absolute top-1/4 left-1/4">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Ferme Avic - Malick D
            </div>
            </div>
          <div className="absolute top-1/3 right-1/3">
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Élevage Tr - Poulets
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/2">
            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Volaille P - Cailles
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de Proposition */}
      {showModal && selectedProducer && selectedProduct && (
        <PropositionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          producer={selectedProducer}
          selectedProduct={selectedProduct}
          onSubmit={handleSubmitProposition}
        />
      )}
    </AdaptiveLayout>
  );
}