"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  BarChart3,
  Search,
  Bell,
  FileText,
  Store,
  Users,
  User as UserIcon,
  LogOut,
  Eye,
  Check,
  X,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Package,
  Clock,
  Loader2
} from 'lucide-react';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';

interface Proposition {
  id: string;
  date: string;
  producer: string;
  producerId: string;
  products: string;
  total: string;
  validity: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  producerInfo?: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items?: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

export default function PropositionsPage() {
  const router = useRouter();
  const { user, profile, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [activePage] = useState('propositions');
  const [activeTab, setActiveTab] = useState('pending');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProposition, setSelectedProposition] = useState<Proposition | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - will be replaced with Supabase data
  const mockPropositions: Proposition[] = [
    {
      id: "PROP001",
      date: "28/08/25",
      producer: "Ferme Diallo",
      producerId: "prod1",
      products: "50 poulets fermiers",
      total: "225,000",
      validity: "5 jours",
      status: "pending",
      producerInfo: {
        name: "Ferme Diallo",
        phone: "+221 77 123 45 67",
        email: "ferme.diallo@gmail.com",
        address: "Thiès, Sénégal"
      },
      items: [
        { product: "Poulets fermiers premium", quantity: 50, unitPrice: 4500, total: 225000 }
      ]
    },
    {
      id: "PROP002",
      date: "27/08/25",
      producer: "Elevage Sow",
      producerId: "prod2",
      products: "100 œufs + 20 poulets",
      total: "145,000",
      validity: "3 jours",
      status: "pending",
      producerInfo: {
        name: "Elevage Sow",
        phone: "+221 77 234 56 78",
        email: "elevage.sow@gmail.com",
        address: "Kaolack, Sénégal"
      },
      items: [
        { product: "Œufs fermiers", quantity: 100, unitPrice: 550, total: 55000 },
        { product: "Poulets fermiers", quantity: 20, unitPrice: 4500, total: 90000 }
      ]
    },
    {
      id: "PROP003",
      date: "25/08/25",
      producer: "Ferme Ndiaye",
      producerId: "prod3",
      products: "30 poulets bio",
      total: "150,000",
      validity: "Accepté",
      status: "accepted",
      producerInfo: {
        name: "Ferme Ndiaye",
        phone: "+221 77 345 67 89",
        email: "ferme.ndiaye@gmail.com",
        address: "Saint-Louis, Sénégal"
      },
      items: [
        { product: "Poulets bio", quantity: 30, unitPrice: 5000, total: 150000 }
      ]
    },
    {
      id: "PROP004",
      date: "20/08/25",
      producer: "Aviculture Fall",
      producerId: "prod4",
      products: "40 poulets",
      total: "180,000",
      validity: "Expiré",
      status: "expired"
    },
    {
      id: "PROP005",
      date: "18/08/25",
      producer: "Ferme Mbaye",
      producerId: "prod5",
      products: "25 poulets fermiers",
      total: "112,500",
      validity: "Refusé",
      status: "rejected"
    }
  ];

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!userLoading && activeRole !== 'distributor') {
      router.push('/dashboard');
      return;
    }

    // Load propositions
    setPropositions(mockPropositions);
    setLoading(false);
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'search', label: 'Rechercher Producteurs', icon: <Search className="h-4 w-4" /> },
    { id: 'alerts', label: 'Mes Alertes', icon: <Bell className="h-4 w-4" /> },
    { id: 'quotes', label: 'Mes Devis', icon: <FileText className="h-4 w-4" /> },
    { id: 'brand', label: 'Ma Marque', icon: <Store className="h-4 w-4" /> },
    { id: 'clients', label: 'Mes Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> }
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      'pending': 'bg-orange-100 text-orange-800',
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };

    const statusLabels: Record<string, string> = {
      'pending': 'En attente',
      'accepted': 'Accepté',
      'rejected': 'Refusé',
      'expired': 'Expiré'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const handleAction = (action: string, propositionId: string) => {
    if (action === 'view') {
      const proposition = propositions.find(p => p.id === propositionId);
      setSelectedProposition(proposition || null);
      setShowDetailsModal(true);
    } else if (action === 'accept') {
      setPropositions(prev =>
        prev.map(p => p.id === propositionId ? { ...p, status: 'accepted' as const } : p)
      );
    } else if (action === 'reject') {
      setPropositions(prev =>
        prev.map(p => p.id === propositionId ? { ...p, status: 'rejected' as const } : p)
      );
    }
    setOpenDropdown(null);
  };

  const getFilteredPropositions = () => {
    if (activeTab === 'all') return propositions;
    return propositions.filter(p => p.status === activeTab);
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-blue-100 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {profile?.business_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Distributeur'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
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
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Propositions des Producteurs</h1>
            </div>

            {/* Onglets */}
            <div className="mb-6">
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'pending'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('pending')}
                >
                  En Attente
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'accepted'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('accepted')}
                >
                  Acceptées
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'rejected'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('rejected')}
                >
                  Refusées
                </button>
                <button
                  className={`px-6 py-3 font-medium text-sm ${
                    activeTab === 'all'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('all')}
                >
                  Toutes
                </button>
              </div>
            </div>

            {/* Tableau Propositions */}
            <Card className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">N° Prop.</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Producteur</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Produits</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPropositions().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          Aucune proposition trouvée
                        </td>
                      </tr>
                    ) : (
                      getFilteredPropositions().map((proposition) => (
                        <tr key={proposition.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900">{proposition.id}</td>
                          <td className="py-3 px-4 text-gray-600">{proposition.date}</td>
                          <td className="py-3 px-4 text-gray-600">{proposition.producer}</td>
                          <td className="py-3 px-4 text-gray-600">{proposition.products}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{proposition.total} FCFA</td>
                          <td className="py-3 px-4">{getStatusBadge(proposition.status)}</td>
                          <td className="py-3 px-4">
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => setOpenDropdown(openDropdown === proposition.id ? null : proposition.id)}
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>

                              {/* Actions Dropdown */}
                              {openDropdown === proposition.id && (
                                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                  <button
                                    onClick={() => handleAction('view', proposition.id)}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="text-sm">Voir détails</span>
                                  </button>
                                  {proposition.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAction('accept', proposition.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-green-700 hover:bg-green-50 transition-colors"
                                      >
                                        <Check className="h-4 w-4" />
                                        <span className="text-sm">Accepter</span>
                                      </button>
                                      <button
                                        onClick={() => handleAction('reject', proposition.id)}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-red-700 hover:bg-red-50 transition-colors"
                                      >
                                        <X className="h-4 w-4" />
                                        <span className="text-sm">Refuser</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal Détails Proposition */}
      {showDetailsModal && selectedProposition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Détails Proposition #{selectedProposition.id}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations Producteur */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Informations Producteur
                </h4>
                {selectedProposition.producerInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span>{selectedProposition.producerInfo.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{selectedProposition.producerInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{selectedProposition.producerInfo.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{selectedProposition.producerInfo.address}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Produits */}
              <div>
                <h4 className="font-medium mb-3">Produits Proposés</h4>
                {selectedProposition.items && (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Produit</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Qté</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Prix Unit.</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-600">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProposition.items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-100">
                            <td className="py-2 px-3 text-sm">{item.product}</td>
                            <td className="py-2 px-3 text-sm">{item.quantity}</td>
                            <td className="py-2 px-3 text-sm">{item.unitPrice.toLocaleString()} FCFA</td>
                            <td className="py-2 px-3 text-sm font-medium">{item.total.toLocaleString()} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Résumé */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Montant Total</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{selectedProposition.total} FCFA</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Validité</span>
                  </div>
                  <span className="text-sm">{selectedProposition.validity}</span>
                </div>
              </div>

              {/* Actions */}
              {selectedProposition.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => {
                      handleAction('reject', selectedProposition.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Refuser
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => {
                      handleAction('accept', selectedProposition.id);
                      setShowDetailsModal(false);
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Accepter
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-matix-footer-dark text-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400">
              Copyright 2024 © <span className="text-matix-yellow">MatixLover</span>. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
