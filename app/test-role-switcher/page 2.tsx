'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import RoleSwitcher from '@/components/RoleSwitcher';
import RoleBadgeAnimation from '@/components/animations/RoleBadgeAnimation';
import SidebarTransition from '@/components/animations/SidebarTransition';
import { mockUsers } from '@/lib/auth';

export default function TestRoleSwitcherPage() {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]); // Producteur par défaut
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleRoleSwitch = () => {
    setIsTransitioning(true);
    
    // Simuler un changement de rôle
    setTimeout(() => {
      const newRole = currentUser.role === 'producer' ? 'distributor' : 'producer';
      const newUser = { ...currentUser, role: newRole };
      setCurrentUser(newUser);
      setIsTransitioning(false);
    }, 1000);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard' },
    { id: 'products', label: 'Mes Produits', icon: 'Package', href: '/dashboard/products' },
    { id: 'orders', label: 'Commandes', icon: 'ShoppingCart', href: '/dashboard/orders' },
  ];

  const distributorItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'BarChart3', href: '/dashboard/distributor' },
    { id: 'search', label: 'Rechercher', icon: 'Search', href: '/dashboard/distributor/search' },
    { id: 'requests', label: 'Annonces', icon: 'Users', href: '/dashboard/distributor/requests' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test du RoleSwitcher avec Animations
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test du RoleSwitcher */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">RoleSwitcher</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-2">Utilisateur actuel :</h3>
                <p className="text-sm text-gray-600">
                  {currentUser.name} - {currentUser.role === 'producer' ? 'Producteur' : 'Distributeur'}
                </p>
              </div>
              
              <RoleSwitcher 
                size="md" 
                className="w-full"
              />
              
              <Button 
                onClick={handleRoleSwitch}
                disabled={isTransitioning}
                className="w-full"
              >
                {isTransitioning ? 'Changement...' : 'Simuler Switch'}
              </Button>
            </div>
          </Card>

          {/* Test des animations de badge */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Animation du Badge</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Producteur :</span>
                <RoleBadgeAnimation 
                  role="producer" 
                  isTransitioning={isTransitioning}
                >
                  🌾 Producteur
                </RoleBadgeAnimation>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Distributeur :</span>
                <RoleBadgeAnimation 
                  role="distributor" 
                  isTransitioning={isTransitioning}
                >
                  🏪 Distributeur
                </RoleBadgeAnimation>
              </div>
            </div>
          </Card>

          {/* Test de la navigation */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Animation de Navigation</h2>
            <div className="space-y-4">
              <SidebarTransition 
                isTransitioning={isTransitioning}
                currentRole={currentUser.role}
              >
                <nav className="space-y-2">
                  {(currentUser.role === 'producer' ? navigationItems : distributorItems).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </nav>
              </SidebarTransition>
            </div>
          </Card>

          {/* Informations sur les animations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Fonctionnalités des Animations</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Animation du bouton de switch avec loading</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Transition fluide de la navigation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Animation du badge de rôle</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Toast notification de confirmation</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
