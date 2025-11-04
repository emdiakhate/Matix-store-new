// Layout adaptatif unifié pour Producteur et Distributeur
// Remplace ProducerLayout et DistributorLayout par un système unifié

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Package,
  ShoppingCart,
  User as UserIcon,
  LogOut,
  MapPin,
  Star,
  Zap,
  FileText,
  Bell,
  Users,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Send,
  Inbox,
  Megaphone,
  TrendingUp,
  ShoppingBag,
  Home,
  Info,
} from 'lucide-react';
import RoleSwitcher from '@/components/RoleSwitcher';
import SidebarTransition from '@/components/animations/SidebarTransition';
import RoleBadge from '@/components/RoleBadge';
import NavigationSkeleton from '@/components/animations/NavigationSkeleton';
// import { useRolePrefetch } from '@/lib/hooks/useRolePrefetch';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  activePage?: string;
  className?: string;
}

export default function AdaptiveLayout({
  children,
  activePage = 'dashboard',
  className = '',
}: AdaptiveLayoutProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { activeRole, user, isLoading } = useAuth();

  // Gestion des erreurs et états
  const [error, setError] = useState<string | null>(null);

  // Déterminer les propriétés basées sur le rôle actif
  const isProducer = activeRole === 'farmer';
  const isDistributor = activeRole === 'distributor';
  const roleLabel = isProducer ? 'Producteur' : 'Distributeur';
  const roleIcon = isProducer ? '🌾' : '🏪';
  const roleColor = isProducer ? 'green' : 'blue';

  // Type pour les items de navigation
  type NavigationItem = {
    id: string;
    label: string;
    icon: string;
    href: string;
    badge?: string | number;
  };

  // Navigation items basés sur le rôle
  const navigationItems: NavigationItem[] = isProducer
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard' },
        { id: 'products', label: 'Mes Produits', icon: 'Package', href: '/dashboard/products' },
        {
          id: 'sent-propositions',
          label: 'Mes Propositions',
          icon: 'Send',
          href: '/dashboard/sent-propositions',
        },
        {
          id: 'received-offers',
          label: 'Mes Offres',
          icon: 'Inbox',
          href: '/dashboard/received-offers',
        },
        {
          id: 'announcements',
          label: 'Mes Annonces',
          icon: 'Megaphone',
          href: '/dashboard/announcements',
        },
        { id: 'orders', label: 'Commandes', icon: 'ShoppingCart', href: '/dashboard/orders' },
        { id: 'reviews', label: 'Avis', icon: 'Star', href: '/dashboard/reviews' },
        {
          id: 'geolocation',
          label: 'Géolocalisation',
          icon: 'MapPin',
          href: '/dashboard/geolocation',
        },
        { id: 'stats', label: 'Statistiques', icon: 'TrendingUp', href: '/dashboard/stats' },
        { id: 'profile', label: 'Profil', icon: 'User', href: '/dashboard/profile' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard/distributor' },
        {
          id: 'search',
          label: 'Rechercher',
          icon: 'Search',
          href: '/dashboard/distributor/search',
        },
        {
          id: 'requests',
          label: 'Annonces',
          icon: 'Users',
          href: '/dashboard/distributor/requests',
        },
        {
          id: 'propositions',
          label: 'Propositions',
          icon: 'FileText',
          href: '/dashboard/distributor/propositions',
        },
        {
          id: 'achats',
          label: 'Mes Achats',
          icon: 'ShoppingBag',
          href: '/dashboard/distributor/achats',
        },
        { id: 'alerts', label: 'Mes Alertes', icon: 'Bell', href: '/dashboard/distributor/alerts' },
        {
          id: 'my-reviews',
          label: 'Mes Avis',
          icon: 'Star',
          href: '/dashboard/distributor/my-reviews',
        },
        { id: 'profile', label: 'Profil', icon: 'User', href: '/dashboard/distributor/profile' },
      ];

  const hasPermission = (permission: string) => true; // Simplifié pour l'instant

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('active_role');
      window.location.href = '/';
    }
  };

  // Hook pour le prefetch des données (temporairement désactivé)
  // const { isPrefetching, prefetchStatus } = useRolePrefetch(user);

  // Gestion de la déconnexion
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Vérification si un lien est actif
  const isLinkActive = (href: string): boolean => {
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  // Fonction pour obtenir l'icône de navigation
  const getNavigationIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      BarChart3: <BarChart3 className="h-4 w-4" />,
      Package: <Package className="h-4 w-4" />,
      ShoppingCart: <ShoppingCart className="h-4 w-4" />,
      User: <UserIcon className="h-4 w-4" />,
      MapPin: <MapPin className="h-4 w-4" />,
      Star: <Star className="h-4 w-4" />,
      Zap: <Zap className="h-4 w-4" />,
      FileText: <FileText className="h-4 w-4" />,
      Bell: <Bell className="h-4 w-4" />,
      Users: <Users className="h-4 w-4" />,
      Search: <Search className="h-4 w-4" />,
      Settings: <Settings className="h-4 w-4" />,
      Home: <Home className="h-4 w-4" />,
      Send: <Send className="h-4 w-4" />,
      Inbox: <Inbox className="h-4 w-4" />,
      Megaphone: <Megaphone className="h-4 w-4" />,
      TrendingUp: <TrendingUp className="h-4 w-4" />,
      ShoppingBag: <ShoppingBag className="h-4 w-4" />,
    };
    return icons[iconName] || <BarChart3 className="h-4 w-4" />;
  };

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Veuillez vous connecter pour accéder au dashboard.'}
          </p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vérifier si l'utilisateur a plusieurs rôles
  const hasMultipleRoles = user && user.roles && user.roles.length > 1;

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header Mobile */}
      <div className="lg:hidden bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-900">MATIX</h1>
                <p className="text-xs text-gray-500">M A R T</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <RoleBadge role={activeRole} isTransitioning={false} size="sm" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden hover:bg-gray-100 transition-colors duration-150"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t animate-slide-down">
            <div className="p-4 space-y-4">
              {/* Role Switcher - Mobile */}
              {hasMultipleRoles && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <RoleSwitcher size="lg" className="w-full" />
                  <div className="mt-2 text-center">
                    <Badge variant="outline" className="text-xs text-gray-500 bg-gray-100">
                      👥 Profil multi-rôles
                    </Badge>
                  </div>
                </div>
              )}

              {/* Profil utilisateur */}
              <div className="text-center border-b pb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <RoleBadge role={activeRole} isTransitioning={false} size="md" />
              </div>

              {/* Navigation */}
              <SidebarTransition isTransitioning={false} currentRole={activeRole}>
                <nav className="space-y-1">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md ${
                        isLinkActive(item.href)
                          ? 'nav-link-active font-medium'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {getNavigationIcon(item.icon)}
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </SidebarTransition>

              {/* Déconnexion */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start mt-4 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-150 hover:translate-y-[-1px]"
              >
                <LogOut className="h-4 w-4 mr-3" />
                Déconnexion
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block lg:col-span-1">
            <Card
              className={`p-6 sticky top-8 sidebar theme-${activeRole === 'farmer' ? 'farmer' : 'distributor'} transition-all duration-500`}
            >
              {/* Profil utilisateur */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <RoleBadge role={activeRole} isTransitioning={false} size="md" />
              </div>

              {/* Role Switcher - Desktop */}
              {hasMultipleRoles && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <RoleSwitcher size="md" className="w-full" />
                  <div className="mt-2 text-center">
                    <Badge variant="outline" className="text-xs text-gray-500 bg-gray-100">
                      👥 Profil multi-rôles
                    </Badge>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <SidebarTransition isTransitioning={false} currentRole={activeRole}>
                <nav className="space-y-1">
                  {navigationItems.map((item, index) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 hover:translate-y-[-1px] hover:shadow-md focus:ring-2 focus:ring-offset-2 ${
                        activeRole === 'farmer' ? 'focus:ring-green-500' : 'focus:ring-blue-500'
                      } ${
                        isLinkActive(item.href)
                          ? 'nav-link-active font-medium'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {getNavigationIcon(item.icon)}
                      <span className="text-sm">{item.label}</span>
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </nav>
              </SidebarTransition>

              {/* Déconnexion */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-150 hover:translate-y-[-1px] focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Déconnexion
                </Button>
              </div>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="animate-fade-in">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
