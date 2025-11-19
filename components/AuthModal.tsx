"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useSupabase';
import { userService } from '@/lib/services';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const { signUp, signIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { user, error } = await signIn(formData.email, formData.password);
      if (error) {
        setError('Email ou mot de passe incorrect');
      } else if (user) {
        onLogin(user);
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

    if (!formData.firstName || !formData.lastName) {
      setError('Veuillez renseigner votre nom complet');
      setLoading(false);
      return;
    }

    try {
      // Créer le compte Supabase Auth
      const { user, error } = await signUp(formData.email, formData.password, {
        first_name: formData.firstName,
        last_name: formData.lastName
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (user) {
        // Créer l'utilisateur avec les deux profils activés (producteur par défaut)
        const { error: userError } = await userService.createUser(
          user.id,
          formData.email,
          formData.phone || undefined,
          'producer' // Rôle actif par défaut
        );

        if (userError) {
          console.error('Erreur lors de la création de l\'utilisateur:', userError);
        }

        // Mettre à jour le profil avec les infos
        await userService.updateProfile(user.id, {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone || undefined
        });

        // Activer le rôle distributeur pour avoir les deux profils
        await userService.enableDistributorRole(user.id);

        onLogin(user);
        onClose();
        resetForm();
      }
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setError('');
    setActiveTab('login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'login' ? 'Connexion' : 'Inscription'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Onglets */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
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

        <form onSubmit={activeTab === 'login' ? handleLogin : handleRegister}>
          {activeTab === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <Input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder="Prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder="Nom"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+221 77 000 00 00"
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              placeholder="Minimum 6 caractères"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Chargement...' : (activeTab === 'login' ? 'Se connecter' : 'S\'inscrire')}
          </Button>
        </form>

        {activeTab === 'login' && (
          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => {/* TODO: Forgot password */}}
              className="text-sm text-gray-500"
            >
              Mot de passe oublié ?
            </Button>
            <div>
              <span className="text-sm text-gray-500">Pas encore de compte ? </span>
              <Button
                variant="link"
                onClick={() => setActiveTab('register')}
                className="text-sm p-0"
              >
                S'inscrire
              </Button>
            </div>
          </div>
        )}

        {activeTab === 'register' && (
          <>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-500">Déjà un compte ? </span>
              <Button
                variant="link"
                onClick={() => setActiveTab('login')}
                className="text-sm p-0"
              >
                Se connecter
              </Button>
            </div>
            <p className="mt-4 text-xs text-gray-500 text-center">
              En vous inscrivant, vous acceptez nos conditions d'utilisation.
              Votre compte vous permettra d'être à la fois producteur et distributeur.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
