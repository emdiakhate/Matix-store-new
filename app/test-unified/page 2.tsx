// Page de test simple pour le système unifié
// Vérification des fonctionnalités de base

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/lib/hooks/useProfile';
import { 
  User, 
  Building, 
  CheckCircle, 
  XCircle, 
  Loader2,
  ArrowRight,
  Home
} from 'lucide-react';
import Link from 'next/link';

export default function TestUnifiedPage() {
  const {
    user,
    isLoading,
    error,
    role,
    isProducer,
    isDistributor,
    roleLabel,
    roleIcon,
    roleColor,
    hasPermission,
    login,
    logout
  } = useProfile();

  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('123456');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleTestLogin = async (email: string) => {
    setIsLoggingIn(true);
    try {
      await login(email, testPassword);
    } catch (err) {
      console.error('Erreur de connexion:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const testUsers = [
    { email: 'amadou@example.com', name: 'Amadou Diallo', role: 'Producteur' },
    { email: 'fatou@enterprises.sn', name: 'Fatou Enterprises', role: 'Distributeur' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
            <Home className="h-4 w-4" />
            Retour à l'accueil
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Test du Système Unifié
          </h1>
          <p className="text-gray-600">
            Test des fonctionnalités de gestion des profils Producteur/Distributeur
          </p>
        </div>

        {/* État actuel */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">État Actuel</h2>
          
          {isLoading && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Chargement...
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <XCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                  roleColor === 'green' ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  {roleIcon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.full_name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Badge className={`${
                  roleColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {roleIcon} {roleLabel}
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informations de base</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• ID: {user.id}</li>
                    <li>• Rôle: {role}</li>
                    <li>• Vérifié: {user.is_verified ? 'Oui' : 'Non'}</li>
                    <li>• Région: {user.region || 'Non définie'}</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Permissions</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Producteur: {isProducer ? 'Oui' : 'Non'}</li>
                    <li>• Distributeur: {isDistributor ? 'Oui' : 'Non'}</li>
                    <li>• Gérer produits: {hasPermission('manage_products') ? 'Oui' : 'Non'}</li>
                    <li>• Rechercher: {hasPermission('search_producers') ? 'Oui' : 'Non'}</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={logout} variant="outline">
                  Déconnexion
                </Button>
                <Link href="/dashboard-unified">
                  <Button>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Aller au Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Aucun utilisateur connecté</p>
            </div>
          )}
        </Card>

        {/* Test de connexion */}
        {!user && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test de Connexion</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {testUsers.map((testUser) => (
                <div key={testUser.email} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      testUser.role === 'Producteur' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      {testUser.role === 'Producteur' ? '🌾' : '🏪'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{testUser.name}</h3>
                      <p className="text-sm text-gray-500">{testUser.role}</p>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Email: {testUser.email}</p>
                    <p>Mot de passe: 123456</p>
                  </div>
                  
                  <Button
                    onClick={() => handleTestLogin(testUser.email)}
                    disabled={isLoggingIn}
                    className={`w-full ${
                      testUser.role === 'Producteur' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white`}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Informations sur le système */}
        <Card className="p-6 bg-blue-50">
          <h3 className="font-semibold text-blue-900 mb-4">📋 Fonctionnalités Testées</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">✅ Fonctionnalités de base</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Authentification unifiée</li>
                <li>• Gestion des rôles (Producteur/Distributeur)</li>
                <li>• Système de permissions</li>
                <li>• Interface adaptative</li>
                <li>• Gestion d'état (loading, erreurs)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">🎯 Prochaines étapes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Migration des pages existantes</li>
                <li>• Intégration avec Supabase</li>
                <li>• Tests de performance</li>
                <li>• Documentation complète</li>
                <li>• Déploiement en production</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
