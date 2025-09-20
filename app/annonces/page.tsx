"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, MapPin, DollarSign, Package, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import DemandCard from '@/components/DemandCard';
import SubmitOfferModal from '@/components/SubmitOfferModal';

interface Demand {
  id: number;
  title: string;
  description: string;
  distributor: {
    name: string;
    city: string;
    avatar?: string;
    rating: number;
  };
  product: string;
  quantity: number;
  unit: string;
  category: string;
  budgetMax: number;
  deadline: string;
  daysLeft: number;
  applicantsCount: number;
  isUrgent: boolean;
  requirements?: string[];
  location: string;
  publishedDate: string;
}

export default function AnnoncesPage() {
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const demands: Demand[] = [
    {
      id: 1,
      title: "Poulets fermiers pour restaurant",
      description: "Recherche poulets fermiers de qualité supérieure pour notre restaurant. Préférence pour des poulets élevés en plein air avec une alimentation naturelle.",
      distributor: {
        name: "Restaurant Le Dakar",
        city: "Dakar, Sénégal",
        avatar: "/avatars/restaurant.jpg",
        rating: 4.8
      },
      product: "Poulets fermiers",
      quantity: 50,
      unit: "pièces",
      category: "Volailles Vivantes",
      budgetMax: 2800,
      deadline: "25/09/2025",
      daysLeft: 6,
      applicantsCount: 8,
      isUrgent: false,
      requirements: ["Certificat sanitaire", "Livraison fraîche", "Poids minimum 1.5kg"],
      location: "Dakar Plateau",
      publishedDate: "10/09/2025"
    },
    {
      id: 2,
      title: "Œufs bio pour boulangerie",
      description: "Commande régulière d'œufs biologiques pour notre boulangerie artisanale. Nous recherchons un fournisseur fiable pour un approvisionnement hebdomadaire.",
      distributor: {
        name: "Boulangerie Sall",
        city: "Thiès, Sénégal",
        avatar: "/avatars/boulangerie.jpg",
        rating: 4.5
      },
      product: "Œufs biologiques",
      quantity: 200,
      unit: "pièces",
      category: "Œufs & Reproduction",
      budgetMax: 2000,
      deadline: "20/09/2025",
      daysLeft: 1,
      applicantsCount: 12,
      isUrgent: true,
      requirements: ["Certification bio", "Livraison hebdomadaire", "Œufs frais"],
      location: "Thiès Centre",
      publishedDate: "08/09/2025"
    },
    {
      id: 3,
      title: "Aliments pour volailles premium",
      description: "Besoin urgent d'aliments de qualité premium pour notre élevage de volailles. Recherche un fournisseur avec des produits certifiés et une livraison rapide.",
      distributor: {
        name: "Ferme Moderne",
        city: "Saint-Louis, Sénégal",
        avatar: "/avatars/ferme.jpg",
        rating: 4.2
      },
      product: "Aliments avicoles",
      quantity: 1000,
      unit: "kg",
      category: "Aliments Avicoles",
      budgetMax: 500,
      deadline: "15/09/2025",
      daysLeft: -5,
      applicantsCount: 5,
      isUrgent: false,
      requirements: ["Certification qualité", "Livraison sous 48h", "Stock disponible"],
      location: "Saint-Louis",
      publishedDate: "05/09/2025"
    },
    {
      id: 4,
      title: "Équipements d'élevage modernes",
      description: "Équipement complet pour moderniser notre ferme avicole. Recherche des équipements de dernière génération pour améliorer notre productivité.",
      distributor: {
        name: "Coopérative Agricole",
        city: "Kaolack, Sénégal",
        avatar: "/avatars/cooperative.jpg",
        rating: 4.7
      },
      product: "Mangeoires automatiques",
      quantity: 20,
      unit: "pièces",
      category: "Équipements",
      budgetMax: 18000,
      deadline: "10/09/2025",
      daysLeft: -10,
      applicantsCount: 3,
      isUrgent: false,
      requirements: ["Installation incluse", "Garantie 2 ans", "Formation utilisateur"],
      location: "Kaolack",
      publishedDate: "01/09/2025"
    },
    {
      id: 5,
      title: "Poulets de chair premium",
      description: "Commande importante de poulets de chair de qualité premium pour notre chaîne de supermarchés. Recherche un partenaire fiable pour un contrat à long terme.",
      distributor: {
        name: "Super Marché Plus",
        city: "Dakar, Sénégal",
        avatar: "/avatars/supermarche.jpg",
        rating: 4.6
      },
      product: "Poulets de chair",
      quantity: 100,
      unit: "pièces",
      category: "Volailles Vivantes",
      budgetMax: 3500,
      deadline: "30/09/2025",
      daysLeft: 11,
      applicantsCount: 5,
      isUrgent: false,
      requirements: ["Contrat long terme", "Qualité constante", "Livraison programmée"],
      location: "Dakar",
      publishedDate: "15/09/2025"
    },
    {
      id: 6,
      title: "Œufs de consommation frais",
      description: "Approvisionnement régulier en œufs de consommation pour notre marché. Recherche un fournisseur local avec des prix compétitifs.",
      distributor: {
        name: "Marché Central",
        city: "Thiès, Sénégal",
        avatar: "/avatars/marche.jpg",
        rating: 4.3
      },
      product: "Œufs de consommation",
      quantity: 500,
      unit: "pièces",
      category: "Œufs & Reproduction",
      budgetMax: 1500,
      deadline: "28/09/2025",
      daysLeft: 9,
      applicantsCount: 12,
      isUrgent: false,
      requirements: ["Prix compétitif", "Livraison quotidienne", "Œufs frais"],
      location: "Thiès",
      publishedDate: "12/09/2025"
    }
  ];

  const categories = [
    { value: 'all', label: 'Toutes catégories' },
    { value: 'Volailles Vivantes', label: 'Volailles Vivantes' },
    { value: 'Œufs & Reproduction', label: 'Œufs & Reproduction' },
    { value: 'Aliments Avicoles', label: 'Aliments Avicoles' },
    { value: 'Équipements', label: 'Équipements' }
  ];

  const filteredDemands = demands.filter(demand => {
    const matchesSearch = demand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demand.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demand.distributor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || demand.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitOffer = (demand: Demand) => {
    setSelectedDemand(demand);
    setShowSubmitModal(true);
  };

  const activeDemands = demands.filter(d => d.daysLeft > 0).length;
  const urgentDemands = demands.filter(d => d.isUrgent && d.daysLeft > 0).length;

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
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">Catégories</Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">À Propos</Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">Contact</Link>
            <Link href="/offres" className="text-gray-700 hover:text-matix-green-medium font-medium">Offres</Link>
            <Link href="/annonces" className="text-matix-yellow font-medium">Annonces</Link>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-100 to-green-100 py-16 overflow-hidden">
        {/* Images flottantes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4">
          <div className="grid grid-cols-2 gap-4 opacity-80">
            <img src="https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poulets" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poussins" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aliments" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Œufs" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
          <div className="grid grid-cols-2 gap-4 opacity-80">
            <img src="https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Équipements" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poulets fermiers" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poussins" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aliments" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">Annonces</h1>
          <p className="text-xl text-gray-600 mt-4">Découvrez les demandes des distributeurs et soumettez vos offres</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{activeDemands}</div>
            <div className="text-gray-600">Annonces actives</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{urgentDemands}</div>
            <div className="text-gray-600">Demandes urgentes</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{demands.length}</div>
            <div className="text-gray-600">Total des annonces</div>
          </Card>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une annonce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Liste des annonces */}
        <div className="space-y-6">
          {filteredDemands.length > 0 ? (
            filteredDemands.map((demand) => (
              <DemandCard
                key={demand.id}
                demand={demand}
                onSubmitOffer={handleSubmitOffer}
              />
            ))
          ) : (
            <Card className="p-12 text-center">
              <div className="text-gray-500 text-lg">Aucune annonce trouvée</div>
              <div className="text-gray-400 mt-2">Essayez de modifier vos critères de recherche</div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de soumission d'offre */}
      <SubmitOfferModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        demand={selectedDemand}
      />

      {/* Features Bar */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Produits Variés</div>
                <div className="text-sm text-gray-500">Tous types de produits</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Distributeurs Vérifiés</div>
                <div className="text-sm text-gray-500">Profils authentifiés</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Prix Transparents</div>
                <div className="text-sm text-gray-500">Budget clairement affiché</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Délais Respectés</div>
                <div className="text-sm text-gray-500">Échéances claires</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer identique */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">À Propos Matix</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Dernières Nouvelles</a></li>
              </ul>
            </div>

            {/* Latest News */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Dernières Nouvelles</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Volailles & Viande</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Aliments Avicoles</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Équipements</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Santé & Vétérinaire</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Mon Compte</h3>
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
                <div className="bg-white text-green-500 p-2 rounded-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">MATIX MART</h1>
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
                  Appelez-nous: <span className="text-green-400 font-bold text-xl">+221771234567</span>
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
                Copyright 2024 © <span className="text-green-400">MatixLover</span>. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
