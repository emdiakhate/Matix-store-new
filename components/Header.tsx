'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Heart,
  ShoppingCart,
  User as UserIcon,
  Menu,
  X,
  Mic,
  Bell,
  ChevronDown,
  BarChart3,
  Package,
  Edit,
  Lock,
  TrendingUp,
  Store,
  Users,
  FileText,
  DollarSign,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CartSidebar from './CartSidebar';
import AuthModal from './AuthModal';
import { useAuth } from '@/hooks/useSupabase';
import { userService } from '@/lib/services';

export default function Header() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        try {
          const { data: profile } = await userService.getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      }
      setLoading(false);
    };

    loadUserProfile();
  }, [user]);

  const handleLogin = (user: any) => {
    // Le profil sera chargé automatiquement par useEffect
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setUserProfile(null);
      setIsProfileDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getProfileColor = (userType: string) => {
    switch (userType) {
      case 'producer':
        return 'text-green-600';
      case 'distributor':
        return 'text-blue-600';
      case 'client':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getProfileLabel = (userType: string) => {
    switch (userType) {
      case 'producer':
        return 'Producteur';
      case 'distributor':
        return 'Distributeur';
      case 'client':
        return 'Client';
      default:
        return '';
    }
  };

  // Navigation selon le profil
  const getNavigationItems = () => {
    if (!userProfile) {
      return [
        { href: '/categories', label: 'Catégories' },
        { href: '/marques', label: 'Marques Distributeurs' },
        { href: '/offres', label: 'Offres', isSpecial: true },
        { href: '/annonces', label: 'Annonces', isSpecial: true },
      ];
    }

    switch (userProfile.user_type) {
      case 'producer':
        return [
          { href: '/', label: 'Accueil' },
          { href: '/dashboard/products', label: 'Mes Produits' },
          { href: '/dashboard/orders', label: 'Commandes' },
          { href: '/dashboard/stats', label: 'Statistiques' },
        ];
      case 'distributor':
        return [
          { href: '/', label: 'Accueil' },
          { href: '/dashboard/distributor/search', label: 'Producteurs' },
          { href: '/dashboard/distributor/clients', label: 'Clients' },
          { href: '/dashboard/distributor/brand', label: 'Ma Marque' },
          { href: '/dashboard/distributor/alerts', label: 'Alertes' },
        ];
      case 'client':
        return [
          { href: '/', label: 'Accueil' },
          { href: '/categories', label: 'Catégories' },
          { href: '/dashboard/client/orders', label: 'Mes Commandes' },
          { href: '/dashboard/client/requests', label: 'Demandes' },
          { href: '/dashboard/client/favorites', label: 'Favoris' },
        ];
      default:
        return [];
    }
  };

  // Menu dropdown selon le profil
  const getProfileMenuItems = () => {
    if (!userProfile) return [];

    switch (userProfile.user_type) {
      case 'producer':
        return [
          { href: '/dashboard/profile', label: 'Mon Profil', icon: UserIcon },
          { href: '/dashboard/products', label: 'Mes Produits', icon: Package },
          { href: '/dashboard/orders', label: 'Commandes', icon: FileText },
          { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3 },
          { href: '/dashboard/location', label: 'Ma Zone', icon: TrendingUp },
        ];
      case 'distributor':
        return [
          { href: '/dashboard/profile', label: 'Mon Profil', icon: UserIcon },
          { href: '/dashboard/distributor/search', label: 'Rechercher', icon: Search },
          { href: '/dashboard/distributor/clients', label: 'Mes Clients', icon: Users },
          { href: '/dashboard/distributor/brand', label: 'Ma Marque', icon: Store },
          { href: '/dashboard/distributor/alerts', label: 'Alertes', icon: Bell },
        ];
      case 'client':
        return [
          { href: '/dashboard/client/profile', label: 'Mon Profil', icon: UserIcon },
          { href: '/dashboard/client/orders', label: 'Mes Commandes', icon: FileText },
          { href: '/dashboard/client/requests', label: 'Mes Demandes', icon: Package },
          { href: '/dashboard/client/favorites', label: 'Favoris', icon: Heart },
          { href: '/dashboard/client/reviews', label: 'Avis', icon: Edit },
        ];
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="flex space-x-4">
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
              <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">MATIX</span>
              </Link>
            </div>

            {/* Navigation Desktop */}
            <nav className="hidden md:flex space-x-8">
              {getNavigationItems().map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    item.isSpecial
                      ? 'text-green-600 hover:text-green-700'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher des produits..."
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="ghost" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>

              {/* Cart */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCartOpen(true)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </Button>

              {/* User Menu */}
              {userProfile ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden md:block text-sm">
                      {userProfile.business_name || user?.email || 'Utilisateur'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50">
                      {/* Profile Header */}
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {userProfile.business_name || user?.email || 'Utilisateur'}
                        </p>
                        <p className={`text-xs ${getProfileColor(userProfile.user_type)}`}>
                          {getProfileLabel(userProfile.user_type)}
                        </p>
                      </div>

                      {/* Menu Items */}
                      {getProfileMenuItems().map(item => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileDropdownOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Lock className="h-4 w-4 mr-3" />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Se connecter
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="space-y-2">
                {getNavigationItems().map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${
                      item.isSpecial
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
