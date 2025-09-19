"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Star, ShoppingCart, Heart, Share2, Plus, Minus, Phone, Truck, Clock, Shield, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const product = {
    name: "Poulet Fermier Bio Premium",
    price: "4,500",
    originalPrice: "5,200",
    rating: 4.8,
    reviews: 127,
    discount: "15% Off",
    producer: "Ferme Moussa Ba",
    location: "Thiès, Sénégal",
    category: "Poulets-Chair",
    images: [
      "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=600",
      "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=600"
    ],
    description: "Poulet fermier élevé en plein air selon les méthodes traditionnelles sénégalaises. Nourri avec des aliments naturels sans OGM, ce poulet offre une chair tendre et savoureuse. Élevage respectueux du bien-être animal dans la région de Thiès avec certification bio locale.",
    highlights: [
      { icon: <Truck className="h-4 w-4" />, text: "Livraison gratuite pour commandes +50,000 FCFA" },
      { icon: <Clock className="h-4 w-4" />, text: "Livraison à domicile sous 1 heure" },
      { icon: <Shield className="h-4 w-4" />, text: "Paiement à la livraison disponible" },
      { icon: <Award className="h-4 w-4" />, text: "Garantie retour sous 7 jours" },
      { icon: <Phone className="h-4 w-4" />, text: "Garantie non disponible pour cet article" },
      { icon: <Award className="h-4 w-4" />, text: "Garanti 100% produits bio naturels" }
    ]
  };

  const relatedProducts = [
    { name: "Poussin ISA Brown", price: "850", originalPrice: "1,200", discount: "15% Off", image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.8 },
    { name: "Poule Pondeuse", price: "6,500", originalPrice: "7,800", discount: "18% Off", image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.7 },
    { name: "Coq Reproducteur", price: "8,500", originalPrice: "10,200", discount: "20% Off", image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.6 },
    { name: "Poulet Bicyclette", price: "5,800", originalPrice: "6,900", discount: "16% Off", image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.9 },
    { name: "Œufs Fermiers", price: "2,500", originalPrice: "3,000", discount: "17% Off", image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.5 },
    { name: "Aliment Bio Ponte", price: "18,500", originalPrice: "22,000", discount: "16% Off", image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.7 },
    { name: "Vaccin Newcastle", price: "12,500", originalPrice: "15,000", discount: "17% Off", image: "https://images.pexels.com/photos/3786215/pexels-photo-3786215.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.8 },
    { name: "Cage Transport", price: "45,000", originalPrice: "55,000", discount: "18% Off", image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=300", rating: 4.4 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-green-600 text-white text-center py-2 text-sm">
        <p>📞 Nous sommes disponibles 24/7, Besoin d'aide? +221 77 123 45 67</p>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-green-600">Accueil</Link>
            <span className="mx-2">›</span>
            <Link href="#" className="hover:text-green-600">Poulets-Chair</Link>
            <span className="mx-2">›</span>
            <span className="text-green-600">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-96 object-contain"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`bg-gray-100 rounded-lg p-2 cursor-pointer border-2 ${
                    selectedImage === index ? 'border-green-600' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-16 object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span>🏷️ Stock: 425</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews} avis)</span>
              </div>

              <div className="text-4xl font-bold text-gray-900 mb-6">
                {product.price} FCFA
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">Catégorie:</span>
                <Link href="#" className="text-green-600 hover:underline">{product.category}</Link>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">Producteur:</span>
                <span className="text-gray-800">{product.producer}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-600">Région:</span>
                <span className="text-gray-800">{product.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">📞 Appeler pour commander:</span>
                <span className="text-green-600 font-bold">+221 77 123 45 67</span>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 border rounded min-w-[60px] text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Ajouter au Panier
                </Button>
              </div>
            </div>

            {/* Highlights */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 text-gray-900">Points Forts</h3>
              <div className="space-y-3">
                {product.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="text-green-600">{highlight.icon}</div>
                    <span>{highlight.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Share */}
            <div>
              <h4 className="font-medium mb-3 text-gray-900">Partager sur les réseaux sociaux</h4>
              <p className="text-sm text-gray-600 mb-3">Pour obtenir des infos de famille et amis, partagez ce produit</p>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full">
                  <span className="text-blue-600">f</span>
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full">
                  <span className="text-pink-600">📷</span>
                </Button>
                <Button variant="outline" size="sm" className="w-10 h-10 p-0 rounded-full">
                  <span className="text-blue-400">🐦</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <div className="border-b">
            <div className="flex gap-8">
              <button 
                className={`pb-4 px-2 font-medium ${activeTab === 'reviews' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('reviews')}
              >
                Avis Clients
              </button>
              <button 
                className={`pb-4 px-2 font-medium ${activeTab === 'description' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
            </div>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <p className="text-gray-700 leading-relaxed">
                  Dans un sens botanique, un fruit est le corps charnu ou sec mûri d'une plante à fleurs, 
                  enfermant la graine ou les graines. Abricots, bananes et raisins, ainsi que les haricots, 
                  le maïs et les tomates, les concombres et (dans leurs coquilles) même les amandes et les noix, 
                  sont tous techniquement des fruits.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Produits Similaires</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded z-10">
                  {product.discount}
                </div>
                <div className="aspect-square overflow-hidden bg-gray-100 p-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-medium mb-2 text-sm line-clamp-2">{product.name}</h4>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900">{product.price} FCFA</span>
                      <span className="text-xs text-gray-400 line-through ml-2">{product.originalPrice}</span>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 w-8 h-8 p-0 rounded-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* App Download Section */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Obtenez Vos Besoins Quotidiens Depuis Notre Boutique MatixBazar
              </h3>
              <p className="text-gray-600 mb-6">
                Il y a de nombreux produits que vous trouverez dans notre boutique. 
                Choisissez votre produit nécessaire quotidien dans notre boutique MatixBazar 
                et obtenez des offres spéciales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6 mr-2" />
                  Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6 mr-2" />
                  App Store
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl">🛒</div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Livraison Gratuite</div>
              <div className="text-xs text-gray-500">À partir de 50,000 FCFA</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Support 24/7</div>
              <div className="text-xs text-gray-500">À tout moment</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Paiement Sécurisé</div>
              <div className="text-xs text-gray-500">100% Sécurisé</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Dernières Offres</div>
              <div className="text-xs text-gray-500">Jusqu'à 20% de réduction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}