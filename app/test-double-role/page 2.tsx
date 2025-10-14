'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProfileService } from '@/lib/profileService';
import { useRouter } from 'next/navigation';

export default function TestDoubleRolePage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string) => {
    setIsLoading(true);
    try {
      const user = ProfileService.login(email, '123456');
      if (user) {
        // Rediriger vers le dashboard
        router.push('/dashboard');
      } else {
        alert('Erreur de connexion');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const testUsers = [
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou@example.com',
      role: 'Producteur',
      roles: ['Producteur'],
      description: 'Utilisateur avec un seul rôle'
    },
    {
      id: '2', 
      name: 'Fatou Enterprises',
      email: 'fatou@enterprises.sn',
      role: 'Distributeur',
      roles: ['Distributeur'],
      description: 'Utilisateur avec un seul rôle'
    },
    {
      id: '3',
      name: 'Mariama Sarr',
      email: 'mariama@hybrid.sn',
      role: 'Producteur + Distributeur',
      roles: ['Producteur', 'Distributeur'],
      description: 'Utilisateur avec double rôle - BOUTON DE SWITCH VISIBLE'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Test du Système de Double Rôle
            </h1>
            <p className="text-gray-600">
              Sélectionnez un utilisateur pour tester le système de switch de rôle
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testUsers.map((user) => (
              <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {user.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {user.email}
                  </p>
                  
                  <div className="mb-4">
                    <Badge 
                      variant={user.roles.length > 1 ? "default" : "outline"}
                      className={user.roles.length > 1 ? "bg-green-100 text-green-700" : ""}
                    >
                      {user.role}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-500 mb-4">
                    {user.description}
                  </p>
                  
                  <Button
                    onClick={() => handleLogin(user.email)}
                    disabled={isLoading}
                    className={`w-full ${
                      user.roles.length > 1 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Instructions de Test
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• <strong>Utilisateur 1 & 2 :</strong> Un seul rôle → Pas de bouton de switch</li>
              <li>• <strong>Utilisateur 3 :</strong> Double rôle → Bouton de switch visible</li>
              <li>• Le bouton de switch apparaît uniquement si l'utilisateur a plusieurs rôles</li>
              <li>• Testez le switch entre Producteur et Distributeur</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
