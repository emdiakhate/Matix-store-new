"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import InvoiceModal from '@/components/InvoiceModal';
import { authService, User as UserType } from '@/lib/auth';
import { 
  BarChart3, 
  Package, 
  Star, 
  User as UserIcon, 
  Edit, 
  Lock, 
  LogOut,
  ShoppingCart,
  Clock,
  Settings,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DashboardPage() {
  const [activePage, setActivePage] = useState('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder au dashboard.</p>
          <Link href="/">
            <Button className="bg-matix-green-medium hover:bg-matix-green-dark text-white">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Produits Publiés",
      value: "45",
      icon: <ShoppingCart className="h-6 w-6" />,
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      title: "Commandes Reçues", 
      value: "23",
      icon: <Clock className="h-6 w-6" />,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Commandes en Cours",
      value: "8", 
      icon: <Settings className="h-6 w-6" />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Revenus du Mois",
      value: "450,000 FCFA",
      icon: <CheckCircle className="h-6 w-6" />,
      bgColor: "bg-green-100", 
      iconColor: "text-green-600"
    }
  ];

  const receivedOrders = [
    {
      id: "B9K2",
      client: "Amadou Diallo",
      product: "Poulet Fermier Bio",
      quantity: "2",
      total: "9000 FCFA",
      status: "En cours"
    },
    {
      id: "D185", 
      client: "Fatou Sall",
      product: "Poussins ISA Brown",
      quantity: "10",
      total: "8500 FCFA",
      status: "Confirmée"
    },
    {
      id: "B6B1",
      client: "Ibrahima Ba",
      product: "Œufs à Couver",
      quantity: "50",
      total: "6250 FCFA",
      status: "Livrée"
    },
    {
      id: "6230",
      client: "Aïcha Ndiaye",
      product: "Aliment Ponte Premium",
      quantity: "1",
      total: "18500 FCFA",
      status: "En cours"
    },
    {
      id: "CCFC",
      client: "Moussa Diop",
      product: "Poulet Chair Ross",
      quantity: "5",
      total: "22500 FCFA",
      status: "Confirmée"
    },
    {
      id: "112E",
      client: "Khadija Fall",
      product: "Mangeoire Automatique",
      quantity: "2",
      total: "31000 FCFA",
      status: "En cours"
    },
    {
      id: "D601",
      client: "Omar Sy",
      product: "Vaccin Newcastle",
      quantity: "3",
      total: "37500 FCFA",
      status: "Livrée"
    },
    {
      id: "0755",
      client: "Bineta Sarr",
      product: "Abreuvoir Nipple",
      quantity: "4",
      total: "12800 FCFA",
      status: "Livrée"
    },
    {
      id: "E58D",
      client: "Cheikh Ndiaye",
      product: "Couveuse 100 Œufs",
      quantity: "1",
      total: "89500 FCFA",
      status: "Confirmée"
    },
    {
      id: "2857",
      client: "Mariama Cissé",
      product: "Désinfectant Bio",
      quantity: "2",
      total: "17000 FCFA",
      status: "En cours"
    }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'products', label: 'Mes Produits', icon: <Package className="h-4 w-4" /> },
    { id: 'orders', label: 'Commandes Reçues', icon: <ShoppingCart className="h-4 w-4" /> },
    { id: 'stats', label: 'Statistiques', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'location', label: 'Géolocalisation', icon: <Star className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> }
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'En cours': 'bg-blue-100 text-blue-800',
      'Confirmée': 'bg-orange-100 text-orange-800', 
      'Livrée': 'bg-green-100 text-green-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-blue-100 text-blue-800'}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.ceil(receivedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = receivedOrders.slice(startIndex, endIndex);

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
                    src={currentUser.avatar} 
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-gray-900">{currentUser.name}</h3>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
                <p className="text-xs text-matix-green-medium capitalize">{currentUser.profile}</p>
              </div>

              {/* Menu Navigation */}
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.id === 'dashboard' ? '/dashboard' : `/dashboard/${item.id}`}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activePage === item.id 
                        ? 'bg-matix-green-pale text-matix-green-dark font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-matix-green-medium'
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
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <div className={stat.iconColor}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Commandes Reçues Récentes</h2>
              
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Prix Total</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map((order, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                        <td className="py-3 px-4 text-gray-600">{order.client}</td>
                        <td className="py-3 px-4 text-gray-600">{order.product}</td>
                        <td className="py-3 px-4 text-gray-600">{order.quantity}</td>
                        <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{order.total}</td>
                        <td className="py-3 px-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-matix-green-medium hover:text-matix-green-dark"
                            onClick={() => {
                              setSelectedOrderId(order.id);
                              setSelectedOrder(order);
                              setShowInvoice(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  SHOWING {startIndex + 1}-{Math.min(endIndex, receivedOrders.length)} OF {receivedOrders.length}
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
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-matix-green-medium text-white" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-400">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  
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
            </Card>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal 
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
        orderId={selectedOrderId}
        orderData={selectedOrder}
      />

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
                987 André Plain Suite High Street 838, Lake Hestertown, USA
              </p>
              <p className="text-gray-300 mb-2">Tel : +02 356 1666</p>
              <p className="text-gray-300">Email : ccruidk@test.com</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Follow Us</span>
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
                  Call Us: <span className="text-matix-yellow font-bold text-xl">+659988776</span>
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
                Copyright 2025 © <span className="text-matix-yellow">HtmlLover</span>. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}