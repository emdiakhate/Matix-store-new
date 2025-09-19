"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import { 
  MapPin, 
  Phone, 
  Filter, 
  RotateCcw,
  Plus,
  Minus,
  Eye,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

export default function SearchProducersPage() {
  const [activePage, setActivePage] = useState('search');
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    product: '',
    maxDistance: 50,
    maxPrice: '',
    minStock: ''
  });

  const user = {
    name: "Fatou Enterprises",
    email: "fatou@enterprises.sn",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100"
  };

  const producers = [
    {
      id: 1,
      name: "Ferme Diallo",
      product: "Poulets fermiers", 
      price: "4,500 FCFA/unité",
      distance: "12 km",
      stock: "45 dispo",
      contact: "+221 77 123 456",
      location: "Thiès",
      category: "volailles"
    },
    {
      id: 2,
      name: "Élevage Thiès",
      product: "Poussins pondeuses",
      price: "2,800 FCFA/unité",
      distance: "25 km",
      stock: "120 dispo",
      contact: "+221 76 987 654",
      location: "Thiès",
      category: "volailles"
    },
    {
      id: 3,
      name: "Bio Sénégal",
      product: "Œufs bio",
      price: "200 FCFA/unité",
      distance: "8 km",
      stock: "500 dispo",
      contact: "+221 78 444 567",
      location: "Rufisque",
      category: "oeufs"
    },
    {
      id: 4,
      name: "Nutrition Plus",
      product: "Aliment ponte premium",
      price: "18,500 FCFA/sac",
      distance: "15 km",
      stock: "30 sacs",
      contact: "+221 77 555 888",
      location: "Pikine",
      category: "aliments"
    },
    {
      id: 5,
      name: "Équip Avicole",
      product: "Mangeoires automatiques",
      price: "15,500 FCFA/unité",
      distance: "18 km",
      stock: "15 unités",
      contact: "+221 76 333 999",
      location: "Guédiawaye",
      category: "equipements"
    }
  ];


  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      product: '',
      maxDistance: 50,
      maxPrice: '',
      minStock: ''
    });
  };

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
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">À Propos</Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">Contact</Link>
            <Link href="/offres" className="text-matix-yellow font-medium">Offres</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-blue-600">Distributeur</p>
              </div>

              {/* Menu Navigation */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.id === 'dashboard' ? '/dashboard/distributor' : `/dashboard/distributor/${item.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activePage === item.id 
                        ? 'bg-blue-100 text-blue-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Rechercher Producteurs</h1>
            </div>

            {/* Filtres */}
            <Card className="p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Filtres de Recherche</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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
                    <option value="">Toutes catégories</option>
                    <option value="volailles">Volailles</option>
                    <option value="equipements">Équipements</option>
                    <option value="aliments">Aliments</option>
                    <option value="soins">Soins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance max: {filters.maxDistance} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix max (FCFA)</label>
                  <Input
                    type="number"
                    placeholder="Ex: 5000"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock min</label>
                  <Input
                    type="number"
                    placeholder="Ex: 10"
                    value={filters.minStock}
                    onChange={(e) => setFilters({...filters, minStock: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3">
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

            {/* Carte et Liste - Split 50/50 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* GAUCHE - Carte Interactive */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Carte des Producteurs</h2>
                <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-80 overflow-hidden">
                  {/* Simulation Google Maps */}
                  <div className="absolute inset-0 bg-gray-200 opacity-50"></div>
                  
                  {/* Pins producteurs */}
                  <div className="absolute top-1/4 left-1/3">
                    <div className="relative">
                      <MapPin className="h-6 w-6 text-green-500 drop-shadow-lg" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
                        Ferme D. - Poulets
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-1/2 left-1/2">
                    <div className="relative">
                      <MapPin className="h-6 w-6 text-blue-500 drop-shadow-lg" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
                        Élevage T. - Poussins
                      </div>
                    </div>
                  </div>

                  <div className="absolute top-3/4 left-2/3">
                    <div className="relative">
                      <MapPin className="h-6 w-6 text-orange-500 drop-shadow-lg" />
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap">
                        Bio S. - Œufs
                      </div>
                    </div>
                  </div>

                  {/* Contrôles zoom */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button size="sm" className="w-8 h-8 p-0 bg-white text-gray-700 hover:bg-gray-100">
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button size="sm" className="w-8 h-8 p-0 bg-white text-gray-700 hover:bg-gray-100">
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Légende */}
                  <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Volailles</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Poussins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Œufs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* DROITE - Liste Producteurs */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Producteurs Trouvés ({producers.length})</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Producteur</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Produit</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Prix</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Distance</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Stock</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Contact</th>
                        <th className="text-left py-3 px-2 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {producers.map((producer, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-2">
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{producer.name}</p>
                              <p className="text-xs text-gray-500">{producer.location}</p>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-600 text-sm">{producer.product}</td>
                          <td className="py-3 px-2 font-medium text-gray-900 text-sm">{producer.price}</td>
                          <td className="py-3 px-2 text-gray-600 text-sm">{producer.distance}</td>
                          <td className="py-3 px-2 text-gray-600 text-sm">{producer.stock}</td>
                          <td className="py-3 px-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-800 text-xs p-1"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {producer.contact}
                            </Button>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1"
                              >
                                Contacter
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="text-green-600 border-green-600 hover:bg-green-50 text-xs px-2 py-1"
                              >
                                <UserPlus className="h-3 w-3 mr-1" />
                                Suivre
                              </Button>
                              <Button 
                                variant="outline"
                                size="sm" 
                                className="text-orange-600 border-orange-600 hover:bg-orange-50 text-xs px-2 py-1"
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Alerte
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
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
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Latest News</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Volailles & Viande</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Aliments Avicoles</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Équipements</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Santé & Vétérinaire</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">My Account</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Dashboard</a></li>
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