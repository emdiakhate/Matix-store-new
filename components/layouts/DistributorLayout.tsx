"use client";

import Link from 'next/link';
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
  Star
} from 'lucide-react';

interface DistributorLayoutProps {
  children: React.ReactNode;
  activePage?: string;
  currentUser?: any;
}

// Données utilisateur par défaut pour le distributeur
const defaultDistributorUser = {
  name: "Distributeur",
  email: "iantrepreneur221@gmail.com",
  avatar: null // Pas d'avatar par défaut, on utilisera l'icône
};

export default function DistributorLayout({ 
  children, 
  activePage = 'dashboard',
  currentUser 
}: DistributorLayoutProps) {
  // Utiliser les données par défaut si currentUser n'est pas fourni
  const user = currentUser || defaultDistributorUser;
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'search', label: 'Rechercher Producteurs', icon: <Search className="h-4 w-4" /> },
    { id: 'alerts', label: 'Mes Alertes', icon: <Bell className="h-4 w-4" /> },
    { id: 'requests', label: 'Mes Demandes', icon: <Users className="h-4 w-4" /> },
    { id: 'propositions', label: 'Mes Propositions', icon: <FileText className="h-4 w-4" /> },
    { id: 'my-reviews', label: 'Mes Avis', icon: <Star className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> }
  ];

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

      <div className="bg-green-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-green-800 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-yellow-400">MATIX</h1>
                <p className="text-xs text-yellow-400 opacity-90">M A R T</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">Accueil</Link>
            <Link href="/categories" className="text-gray-700 hover:text-green-600 font-medium">Catégories</Link>
            <Link href="#" className="text-gray-700 hover:text-green-600 font-medium">À Propos</Link>
            <Link href="#" className="text-gray-700 hover:text-green-600 font-medium">Contact</Link>
            <Link href="/offres" className="text-yellow-500 font-medium">Offres</Link>
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
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-gray-200 flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name || 'Distributeur'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  )}
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
                        ? 'bg-green-100 text-green-700 font-medium' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
