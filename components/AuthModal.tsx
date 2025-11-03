'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useSupabase';
import { authService } from '@/services/auth/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const { signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    telephone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(formData.email, formData.password);
      if (error) {
        setError('Email ou mot de passe incorrect');
      } else if (data.user) {
        onLogin(data.user);
        onClose();
        resetForm();
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation basique
      if (
        !formData.email ||
        !formData.password ||
        !formData.nom ||
        !formData.prenom ||
        !formData.telephone
      ) {
        setError('Veuillez remplir tous les champs obligatoires');
        setLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError('Le mot de passe doit contenir au moins 8 caractères');
        setLoading(false);
        return;
      }

      // Utiliser authService.signUp() qui gère automatiquement la création dans 'users'
      const result = await authService.signUp({
        email: formData.email,
        password: formData.password,
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        telephone: formData.telephone.replace(/\s/g, ''),
      });

      if (!result.success) {
        setError(result.error?.message || "Erreur lors de l'inscription");
        setLoading(false);
        return;
      }

      if (result.user) {
        // Succès - l'utilisateur est créé automatiquement dans 'users' par le trigger
        onLogin(result.user);
        onClose();
        resetForm();
      }
    } catch (err: any) {
      console.error('Erreur inscription:', err);
      setError(err.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      telephone: '',
    });
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Onglets */}
        <div className="flex mb-6">
          <Button
            variant={activeTab === 'login' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('login')}
            className="flex-1"
          >
            Connexion
          </Button>
          <Button
            variant={activeTab === 'register' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('register')}
            className="flex-1"
          >
            Inscription
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Message informatif sur les rôles (uniquement pour l'inscription) */}
        {activeTab === 'register' && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>2 profils en 1 compte !</strong>
                  <br />
                  Vous aurez accès aux profils <strong>Producteur</strong> et{' '}
                  <strong>Distributeur</strong>. Basculez entre les deux dans votre espace.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister}>
          {activeTab === 'register' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleInputChange}
                  required
                  placeholder="Amadou"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  required
                  placeholder="Diop"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <Input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleInputChange}
                  required
                  placeholder="+221771234567"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={8}
              placeholder="Minimum 8 caractères"
            />
            {activeTab === 'register' && (
              <p className="text-xs text-gray-500 mt-1">Minimum 8 caractères</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {activeTab === 'login' ? 'Connexion...' : 'Inscription...'}
              </span>
            ) : activeTab === 'login' ? (
              'Se connecter'
            ) : (
              "S'inscrire"
            )}
          </Button>
        </form>

        {activeTab === 'login' && (
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setActiveTab('register')} className="text-sm">
              Pas encore de compte ? S'inscrire
            </Button>
          </div>
        )}

        {activeTab === 'register' && (
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => setActiveTab('login')} className="text-sm">
              Déjà un compte ? Se connecter
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
