"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { useMatixUser } from '@/hooks/useSupabase';
import { UserRole } from '@/lib/types';
import {
  BarChart3,
  Package,
  ShoppingCart,
  MapPin,
  User as UserIcon,
  LogOut,
  MessageSquare,
  FileText,
  Settings,
  Lock,
  Star,
  Search,
  Bell,
  Store,
  Users,
  ClipboardList,
  Send,
  ArrowLeftRight,
  Loader2
} from 'lucide-react';

interface DashboardSidebarProps {
  activePage: string;
}

// Menu items pour Producteur
const producerMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
  { id: 'products', label: 'Mes Produits', icon: Package, href: '/dashboard/products' },
  { id: 'listings', label: 'Mes Annonces', icon: FileText, href: '/dashboard/listings' },
  { id: 'orders', label: 'Commandes Reçues', icon: ShoppingCart, href: '/dashboard/orders' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/messages' },
  { id: 'stats', label: 'Statistiques', icon: BarChart3, href: '/dashboard/stats' },
  { id: 'location', label: 'Géolocalisation', icon: MapPin, href: '/dashboard/location' },
  { id: 'reviews', label: 'Avis Clients', icon: Star, href: '/dashboard/reviews' },
  { id: 'profile', label: 'Mon Profil', icon: UserIcon, href: '/dashboard/profile' },
  { id: 'account', label: 'Paramètres', icon: Settings, href: '/dashboard/account' },
  { id: 'password', label: 'Mot de passe', icon: Lock, href: '/dashboard/password' },
];

// Menu items pour Distributeur
const distributorMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/dashboard/distributor' },
  { id: 'search', label: 'Rechercher Producteurs', icon: Search, href: '/dashboard/distributor/search' },
  { id: 'requests', label: 'Mes Demandes', icon: ClipboardList, href: '/dashboard/distributor/requests' },
  { id: 'propositions', label: 'Propositions Reçues', icon: Send, href: '/dashboard/distributor/propositions' },
  { id: 'orders', label: 'Mes Commandes', icon: ShoppingCart, href: '/dashboard/distributor/orders' },
  { id: 'alerts', label: 'Mes Alertes', icon: Bell, href: '/dashboard/distributor/alerts' },
  { id: 'quotes', label: 'Mes Devis', icon: FileText, href: '/dashboard/distributor/quotes' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, href: '/messages' },
  { id: 'brand', label: 'Ma Marque', icon: Store, href: '/dashboard/distributor/brand' },
  { id: 'clients', label: 'Mes Clients', icon: Users, href: '/dashboard/distributor/clients' },
  { id: 'profile', label: 'Mon Profil', icon: UserIcon, href: '/dashboard/distributor/profile' },
];

export default function DashboardSidebar({ activePage }: DashboardSidebarProps) {
  const router = useRouter();
  const { user, profile, activeRole, switchRole, signOut } = useMatixUser();
  const [switchingRole, setSwitchingRole] = useState(false);

  const menuItems = activeRole === 'producer' ? producerMenuItems : distributorMenuItems;

  const handleSwitchRole = async () => {
    if (switchingRole) return;

    setSwitchingRole(true);
    try {
      const newRole: UserRole = activeRole === 'producer' ? 'distributor' : 'producer';
      await switchRole(newRole);

      // Rediriger vers le dashboard approprié
      if (newRole === 'producer') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/distributor');
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const displayName = profile?.business_name ||
    `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
    'Utilisateur';

  const roleLabel = activeRole === 'producer' ? 'Producteur' : 'Distributeur';
  const roleColor = activeRole === 'producer' ? 'text-green-600' : 'text-blue-600';
  const activeColor = activeRole === 'producer'
    ? 'bg-matix-green-pale text-matix-green-dark'
    : 'bg-blue-100 text-blue-700';
  const hoverColor = activeRole === 'producer'
    ? 'hover:bg-gray-50 hover:text-matix-green-medium'
    : 'hover:bg-gray-50 hover:text-blue-600';

  return (
    <Card className="p-6">
      {/* Profile Section */}
      <div className="text-center mb-6">
        <div className={`w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 flex items-center justify-center ${
          activeRole === 'producer' ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          <UserIcon className={`h-8 w-8 ${activeRole === 'producer' ? 'text-green-600' : 'text-blue-600'}`} />
        </div>
        <h3 className="font-semibold text-gray-900">{displayName}</h3>
        <p className="text-sm text-gray-500">{user?.email}</p>
        <p className={`text-xs ${roleColor} font-medium`}>{roleLabel}</p>
      </div>

      {/* Switch Role Button */}
      <button
        onClick={handleSwitchRole}
        disabled={switchingRole}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 mb-4 rounded-lg text-sm font-medium transition-colors ${
          activeRole === 'producer'
            ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            : 'bg-green-50 text-green-600 hover:bg-green-100'
        } disabled:opacity-50`}
      >
        {switchingRole ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowLeftRight className="h-4 w-4" />
        )}
        <span>
          {switchingRole
            ? 'Changement...'
            : `Passer en ${activeRole === 'producer' ? 'Distributeur' : 'Producteur'}`
          }
        </span>
      </button>

      {/* Menu Navigation */}
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                isActive
                  ? `${activeColor} font-medium`
                  : `text-gray-600 ${hoverColor}`
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-600 ${hoverColor}`}
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </nav>
    </Card>
  );
}

// Export des menu items pour utilisation dans d'autres composants
export { producerMenuItems, distributorMenuItems };
