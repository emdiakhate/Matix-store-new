// Page de connexion pour tester le système unifié
// Permet de se connecter avec différents profils

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/hooks/useProfile';
import { ArrowLeft, User, Building, MapPin, Star, CheckCircle } from 'lucide-react';

export default function UnifiedLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useProfile();
  const router = useRouter();

  // Utilisateurs de test
  const testUsers = [
    {
      id: '1',
      name: 'Amadou Diallo',
      email: 'amadou@example.com',
      role: 'producer',
      roleLabel: 'Producteur',
      roleIcon: '🌾',
      roleColor: 'green',
      description: 'Producteur de poulets fermiers',
      location: 'Dakar',
      verified: true,
      stats: { products: 45, orders: 23, rating: 4.8 }
    },
    {
      id: '2',
      name: 'Fatou Enterprises',
      email: 'fatou@enterprises.sn',
      role: 'distributor',
      roleLabel: 'Distributeur',
      roleIcon: '🏪',
      roleColor: 'blue',
      description: 'Distributeur spécialisé en volaille',
      location: 'Thiès',
      verified: true,
      stats: { requests: 12, partners: 35, budget: '2.5M FCFA' }
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        router.push('/dashboard-unified');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = async (testEmail: string) => {
    setEmail(testEmail);
    setPassword('123456');
    
    setIsLoading(true);
    setError('');

    try {
      const success = await login(testEmail, '123456');
      if (success) {
        router.push('/dashboard-unified');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-green-600 text-white p-3 rounded-lg">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">MATIX MART</h1>
              <p className="text-gray-600">Système de Gestion des Profils Unifié</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulaire de connexion */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Connexion</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              
              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Mot de passe de démo : <code className="bg-gray-100 px-2 py-1 rounded">123456</code>
              </p>
            </div>
          </Card>

          {/* Utilisateurs de test */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Utilisateurs de Test</h2>
            
            <div className="space-y-4">
              {testUsers.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                        user.roleColor === 'green' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        {user.roleIcon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${
                        user.roleColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.roleIcon} {user.roleLabel}
                      </Badge>
                      {user.verified && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {user.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {user.stats.rating || 'N/A'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {user.email}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleTestUserLogin(user.email)}
                      disabled={isLoading}
                      className={`${
                        user.roleColor === 'green' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                    >
                      Se connecter
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🧪 Mode Test</h3>
              <p className="text-sm text-blue-800">
                Cliquez sur "Se connecter" pour tester le système avec des données pré-configurées.
                Le système s'adaptera automatiquement selon le type d'utilisateur.
              </p>
            </div>
          </Card>
        </div>

        {/* Informations sur le système */}
        <Card className="mt-8 p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">📋 Fonctionnalités du Système Unifié</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🌾 Producteur</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gestion des produits</li>
                <li>• Géolocalisation de la ferme</li>
                <li>• Badge de vérification</li>
                <li>• Statistiques de vente</li>
                <li>• Gestion des commandes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🏪 Distributeur</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recherche de producteurs</li>
                <li>• Gestion des alertes</li>
                <li>• Création d'annonces</li>
                <li>• Suivi des propositions</li>
                <li>• Gestion des achats</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
