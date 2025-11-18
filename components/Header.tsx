"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  Search, Heart, ShoppingCart, User as UserIcon, Menu, X, Mic, Bell,
  ChevronDown, BarChart3, Package, Lock, TrendingUp, Store, Users,
  FileText, Home, ArrowLeftRight, AlertCircle, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CartSidebar from './CartSidebar';
import AuthModal from './AuthModal';
import { useMatixUser, useCart, useNotifications } from '@/hooks/useSupabase';
import { UserRole } from '@/lib/types';

export default function Header() {
  const {
    user,
    profile,
    activeRole,
    loading,
    isAuthenticated,
    canSwitchToDistributor,
    switchRole,
    enableDistributorRole
  } = useMatixUser();

  const { itemCount, total } = useCart();
  const { unreadCount } = useNotifications();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleLogin = () => {
    setIsAuthModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { signOut } = await import('@/hooks/useSupabase').then(m => {
        const supabase = m.createClient();
        return { signOut: () => supabase.auth.signOut() };
      });
      await signOut();
      setIsProfileDropdownOpen(false);
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleSwitchRole = async () => {
    if (switchingRole) return;

    setSwitchingRole(true);
    try {
      const newRole: UserRole = activeRole === 'producer' ? 'distributor' : 'producer';

      // Si on veut passer en distributeur et ce n'est pas encore activé
      if (newRole === 'distributor' && !canSwitchToDistributor) {
        await enableDistributorRole();
      }

      await switchRole(newRole);
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
    } finally {
      setSwitchingRole(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    return role === 'producer' ? 'text-green-600' : 'text-blue-600';
  };

  const getRoleLabel = (role: UserRole) => {
    return role === 'producer' ? 'Producteur' : 'Distributeur';
  };

  const getRoleBgColor = (role: UserRole) => {
    return role === 'producer' ? 'bg-green-100' : 'bg-blue-100';
  };

  // Navigation selon le rôle actif
  const getNavigationItems = () => {
    if (!isAuthenticated) {
      return [
        { href: '/categories', label: 'Catégories' },
        { href: '/producteurs', label: 'Producteurs' },
        { href: '/offres', label: 'Offres', isSpecial: true }
      ];
    }

    if (activeRole === 'producer') {
      return [
        { href: '/', label: 'Accueil' },
        { href: '/dashboard/products', label: 'Mes Produits' },
        { href: '/dashboard/orders', label: 'Commandes' },
        { href: '/dashboard/stats', label: 'Statistiques' }
      ];
    } else {
      return [
        { href: '/', label: 'Accueil' },
        { href: '/dashboard/distributor/search', label: 'Producteurs' },
        { href: '/dashboard/distributor/requests', label: 'Mes Demandes' },
        { href: '/dashboard/distributor/alerts', label: 'Alertes' }
      ];
    }
  };

  // Menu dropdown selon le rôle
  const getProfileMenuItems = () => {
    if (!isAuthenticated) return [];

    if (activeRole === 'producer') {
      return [
        { href: '/dashboard/profile', label: 'Mon Profil', icon: UserIcon },
        { href: '/dashboard/products', label: 'Mes Produits', icon: Package },
        { href: '/dashboard/orders', label: 'Commandes', icon: FileText },
        { href: '/dashboard/stats', label: 'Statistiques', icon: BarChart3 },
        { href: '/dashboard/location', label: 'Ma Zone', icon: TrendingUp },
        { href: '/messages', label: 'Messages', icon: MessageSquare }
      ];
    } else {
      return [
        { href: '/dashboard/distributor/profile', label: 'Mon Profil', icon: UserIcon },
        { href: '/dashboard/distributor/search', label: 'Rechercher', icon: Search },
        { href: '/dashboard/distributor/requests', label: 'Mes Demandes', icon: FileText },
        { href: '/dashboard/distributor/alerts', label: 'Alertes', icon: AlertCircle },
        { href: '/dashboard/distributor/favorites', label: 'Favoris', icon: Heart },
        { href: '/messages', label: 'Messages', icon: MessageSquare }
      ];
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
              {getNavigationItems().map((item) => (
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
                    placeholder="Rechercher..."
                    className="pl-10 w-48"
                  />
                </div>
              </div>

              {/* Notifications */}
              {isAuthenticated && (
                <Link href="/notifications">
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Cart - only for distributors */}
              {isAuthenticated && activeRole === 'distributor' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(true)}
                  className="relative"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </Button>
              )}

              {/* User Menu */}
              {isAuthenticated && profile ? (
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden md:block text-sm">
                      {profile.business_name || profile.first_name || user?.email}
                    </span>
                    <span className={`hidden md:block text-xs px-2 py-0.5 rounded-full ${getRoleBgColor(activeRole)} ${getRoleColor(activeRole)}`}>
                      {getRoleLabel(activeRole)}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border">
                      {/* Profile Header */}
                      <div className="px-4 py-3 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {profile.business_name || `${profile.first_name} ${profile.last_name}`}
                        </p>
                        <p className={`text-xs ${getRoleColor(activeRole)}`}>
                          {getRoleLabel(activeRole)}
                        </p>
                        {profile.email && (
                          <p className="text-xs text-gray-500 truncate">{profile.email}</p>
                        )}
                      </div>

                      {/* Switch Role Button */}
                      <button
                        onClick={handleSwitchRole}
                        disabled={switchingRole}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b"
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-3" />
                        {switchingRole ? 'Changement...' : `Passer en ${activeRole === 'producer' ? 'Distributeur' : 'Producteur'}`}
                      </button>

                      {/* Menu Items */}
                      {getProfileMenuItems().map((item) => (
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
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t"
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
              {/* Role indicator mobile */}
              {isAuthenticated && (
                <div className="px-3 py-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleBgColor(activeRole)} ${getRoleColor(activeRole)}`}>
                    Mode {getRoleLabel(activeRole)}
                  </span>
                  <button
                    onClick={handleSwitchRole}
                    disabled={switchingRole}
                    className="ml-2 text-xs text-blue-600"
                  >
                    Changer
                  </button>
                </div>
              )}

              <nav className="space-y-2">
                {getNavigationItems().map((item) => (
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
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </>
  );
}
