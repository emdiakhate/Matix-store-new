"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function MarquesPage() {
  const [selectedBrand, setSelectedBrand] = useState(0);
  const [sortBy, setSortBy] = useState('name');

  const brandCards = [
    {
      title: "Partenaire de",
      subtitle: "FermeModerne SA",
      description: "Leader en équipements avicoles",
      bgColor: "bg-gradient-to-r from-teal-500 to-blue-500",
      logo: "🏭"
    },
    {
      title: "Partenaire de",
      subtitle: "AvicSénégal Pro",
      description: "Spécialiste nutrition animale",
      bgColor: "bg-gradient-to-r from-orange-500 to-red-500",
      logo: "🌾"
    },
    {
      title: "Partenaire de",
      subtitle: "MatEquip Plus",
      description: "Solutions techniques avancées",
      bgColor: "bg-gradient-to-r from-green-500 to-emerald-500",
      logo: "⚡"
    }
  ];

  const brands = [
    { logo: "🏭", name: "FermeModerne SA", id: "ferme-moderne" },
    { logo: "🌾", name: "AvicSénégal Pro", id: "avic-senegal" },
    { logo: "⚡", name: "MatEquip Plus", id: "mat-equip" },
    { logo: "🔬", name: "VetSen Laboratoire", id: "vet-sen" },
    { logo: "🏢", name: "Nutrition Plus", id: "nutrition-plus" },
    { logo: "🚚", name: "Transport Solutions", id: "transport-sol" },
    { logo: "💊", name: "PharmAvic", id: "pharm-avic" },
    { logo: "🧪", name: "BioClean Sénégal", id: "bio-clean" }
  ];

  const products = [
    {
      id: 1,
      name: "Poulet Fermier Bio Premium",
      price: "4,500",
      rating: 4.8,
      reviews: 127,
      image: "/poussins.jpg",
      brand: "FermeModerne SA"
    },
    {
      id: 2,
      name: "Poussins ISA Brown",
      price: "850",
      rating: 4.9,
      reviews: 89,
      image: "/poussins.jpg",
      brand: "AvicSénégal Pro"
    },
    {
      id: 3,
      name: "Cage Élevage 20 Poules",
      price: "125,000",
      rating: 4.7,
      reviews: 45,
      image: "/poultry-equipment.webp",
      brand: "MatEquip Plus"
    },
    {
      id: 4,
      name: "Couveuse Automatique 100 Œufs",
      price: "89,500",
      rating: 4.6,
      reviews: 67,
      image: "/couveuse.webp",
      brand: "MatEquip Plus"
    },
    {
      id: 5,
      name: "Aliment Ponte Premium",
      price: "18,500",
      rating: 4.8,
      reviews: 156,
      image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "Nutrition Plus"
    },
    {
      id: 6,
      name: "Mangeoire Automatique",
      price: "15,500",
      rating: 4.5,
      reviews: 78,
      image: "/poultry-equipment.webp",
      brand: "MatEquip Plus"
    },
    {
      id: 7,
      name: "Abreuvoir Nipple 5L",
      price: "3,200",
      rating: 4.7,
      reviews: 92,
      image: "/poultry-equipment.webp",
      brand: "MatEquip Plus"
    },
    {
      id: 8,
      name: "Vaccin Newcastle",
      price: "12,500",
      rating: 4.9,
      reviews: 134,
      image: "https://images.pexels.com/photos/3786215/pexels-photo-3786215.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "VetSen Laboratoire"
    },
    {
      id: 9,
      name: "Désinfectant Virkon 5L",
      price: "8,500",
      rating: 4.6,
      reviews: 56,
      image: "https://images.pexels.com/photos/4207707/pexels-photo-4207707.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "BioClean Sénégal"
    },
    {
      id: 10,
      name: "Œufs à Couver Fertiles",
      price: "125",
      rating: 4.8,
      reviews: 203,
      image: "/oeufs.jpg",
      brand: "FermeModerne SA"
    },
    {
      id: 11,
      name: "Poussin Chair Ross 308",
      price: "750",
      rating: 4.7,
      reviews: 98,
      image: "/poussins.jpg",
      brand: "AvicSénégal Pro"
    },
    {
      id: 12,
      name: "Cage Transport Volailles",
      price: "45,000",
      rating: 4.4,
      reviews: 34,
      image: "/poultry-equipment.webp",
      brand: "Transport Solutions"
    },
    {
      id: 13,
      name: "Aliment Chair Croissance",
      price: "19,500",
      rating: 4.8,
      reviews: 167,
      image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "Nutrition Plus"
    },
    {
      id: 14,
      name: "Vitamines AD3E",
      price: "6,500",
      rating: 4.6,
      reviews: 89,
      image: "https://images.pexels.com/photos/3786215/pexels-photo-3786215.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "PharmAvic"
    },
    {
      id: 15,
      name: "Thermomètre Digital",
      price: "12,500",
      rating: 4.5,
      reviews: 45,
      image: "https://images.pexels.com/photos/4207707/pexels-photo-4207707.jpeg?auto=compress&cs=tinysrgb&w=300",
      brand: "MatEquip Plus"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>Nous sommes disponibles 24h/7j, Besoin d'aide ?</span>
            <span className="text-green-600 font-semibold">+221 77 123 45 67</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-green-600">À Propos</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Nous Contacter</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Mon Compte</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600 flex items-center gap-1">
              🔒 Déconnexion
            </a>
          </div>
        </div>
      </div>

      <div className="bg-matix-green-dark text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-matix-green-dark p-2 rounded-lg mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-matix-yellow">MATIX</h1>
                <p className="text-xs text-matix-yellow opacity-90">M A R T</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-matix-green-medium font-medium">Accueil</Link>
            <Link href="/categories" className="text-gray-700 hover:text-matix-green-medium font-medium">Catégories</Link>
            <Link href="/marques" className="text-matix-green-medium font-medium">Marques Distributeurs</Link>
            <Link href="/offres" className="text-matix-yellow font-medium">Offres</Link>
          </nav>
        </div>
      </div>

      {/* Header Marques - 3 Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {brandCards.map((card, index) => (
            <Card key={index} className={`${card.bgColor} text-white p-6 relative overflow-hidden`}>
              <div className="relative z-10">
                <h3 className="text-lg font-medium mb-1">{card.title}</h3>
                <h2 className="text-2xl font-bold mb-2">{card.subtitle}</h2>
                <p className="text-sm opacity-90 mb-4">{card.description}</p>
                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                  Voir Produits
                </Button>
              </div>
              <div className="absolute right-4 top-4 text-4xl opacity-20">
                {card.logo}
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation Marques - Slider */}
        <div className="relative mb-8">
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="mr-4 rounded-full w-10 h-10 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-6">
                {brands.map((brand, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center cursor-pointer transition-all ${
                      selectedBrand === index ? 'text-matix-green-medium' : 'text-gray-600 hover:text-matix-green-medium'
                    }`}
                    onClick={() => setSelectedBrand(index)}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-2 ${
                      selectedBrand === index ? 'bg-matix-green-pale' : 'bg-gray-100'
                    }`}>
                      {brand.logo}
                    </div>
                    <span className="text-sm font-medium text-center whitespace-nowrap">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" size="sm" className="ml-4 rounded-full w-10 h-10 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Section Résultats */}
        <div className="bg-matix-yellow/20 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-matix-green-dark">
              Total {products.length} Produits Trouvés
            </h2>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Trier par Nom</option>
              <option value="price">Trier par Prix</option>
              <option value="rating">Trier par Note</option>
              <option value="brand">Trier par Marque</option>
            </select>
          </div>
        </div>

        {/* Grille Produits - 5 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="relative overflow-hidden hover:shadow-matix-lg transition-all hover:scale-105 cursor-pointer bg-white">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{product.brand}</p>
                
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">({product.reviews})</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-matix-green-dark">{product.price} FCFA</span>
                  <Button size="sm" className="bg-matix-green-light hover:bg-matix-green-medium text-white rounded-full w-8 h-8 p-0">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Section App */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Obtenez Vos Besoins Quotidiens Depuis Notre Boutique Matix
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Il y a de nombreux produits que vous trouverez dans notre boutique. 
                Choisissez votre produit nécessaire quotidien dans notre boutique Matix 
                et obtenez des offres spéciales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6" />
                  Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6" />
                  App Store
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl">🛒</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Livraison Gratuite</div>
                <div className="text-sm text-gray-500">À partir de 50,000 FCFA</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Support 24/7</div>
                <div className="text-sm text-gray-500">À tout moment</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Paiement Sécurisé</div>
                <div className="text-sm text-gray-500">100% Sécurisé</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Dernières Offres</div>
                <div className="text-sm text-gray-500">Jusqu'à 25% de réduction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-matix-footer-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">À Propos Matix</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Dernières Nouvelles</a></li>
              </ul>
            </div>

            {/* Latest News */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Dernières Nouvelles</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Volailles & Viande</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Aliments Avicoles</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Équipements</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Santé & Vétérinaire</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Mon Compte</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tableau de Bord</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mes Commandes</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Commandes Récentes</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mettre à Jour Profil</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white text-matix-green-dark p-2 rounded-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-matix-yellow">MATIX MART</h1>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Marché Colobane, Dakar, Sénégal
              </p>
              <p className="text-gray-300 mb-2">Tél : +221 77 123 45 67</p>
              <p className="text-gray-300">Email : contact@matix.sn</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Suivez-nous:</span>
                <div className="flex gap-3">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <span className="text-white text-sm">f</span>
                  </div>
                  <div className="bg-black p-2 rounded-full">
                    <span className="text-white text-sm">X</span>
                  </div>
                  <div className="bg-red-500 p-2 rounded-full">
                    <span className="text-white text-sm">P</span>
                  </div>
                  <div className="bg-blue-700 p-2 rounded-full">
                    <span className="text-white text-sm">in</span>
                  </div>
                  <div className="bg-green-500 p-2 rounded-full">
                    <span className="text-white text-sm">W</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400">
                  Appelez-nous: <span className="text-matix-yellow font-bold text-xl">+221771234567</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Orange Money</div>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Wave</div>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400">
                Copyright 2024 © <span className="text-matix-yellow">MatixLover</span>. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}