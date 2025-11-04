'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Home,
  Package,
  FileText,
  Heart,
  User as UserIcon,
  LogOut,
  Edit,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  Plus,
  Trash2,
} from 'lucide-react';

export default function ClientProfilePage() {
  const [activePage, setActivePage] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

  const user = {
    name: 'Ibrahima Ba',
    email: 'ibrahima@gmail.com',
    phone: '+221 75 345 6789',
    address: 'Marché Colobane, Dakar',
    avatar:
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    // Adresses de livraison
    adressePrincipale: 'Marché Colobane, Dakar',
    adressesSecondaires: ['Quartier Randoulène, Pikine, Dakar', 'Zone industrielle, Rufisque'],
    // Préférences client
    preferences: {
      typesPreferences: ['Volailles', 'Bio', 'Local'],
      budgetMin: 10000,
      budgetMax: 50000,
      frequenceAchats: 'Hebdomadaire',
      modeLivraison: 'Express à domicile',
    },
    // Notifications
    notifications: {
      emailOffres: true,
      smsLivraison: true,
      alertesPrix: true,
      newsletter: false,
    },
    // Programme fidélité
    fidelite: {
      statut: 'Bronze',
      points: 287,
      pointsProchainNiveau: 213,
      avantages: 'Livraison gratuite à partir de 30,000 FCFA',
    },
    // Informations spécifiques client existantes
    typeClient: 'Particulier',
    // Statistiques client
    memberSince: 'Juin 2024',
    totalOrders: 23,
    totalSpent: '287,500',
    vendeurPrefere: 'Ferme Diallo',
    achatsVendeurPrefere: 8,
  };

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: <Home className="h-4 w-4" /> },
    { id: 'orders', label: 'Mes Commandes', icon: <Package className="h-4 w-4" /> },
    { id: 'requests', label: 'Demandes de Livraison', icon: <FileText className="h-4 w-4" /> },
    { id: 'favorites', label: 'Mes Favoris', icon: <Heart className="h-4 w-4" /> },
    { id: 'profile', label: 'Mon Profil', icon: <UserIcon className="h-4 w-4" /> },
    { id: 'logout', label: 'Déconnexion', icon: <LogOut className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>Nous sommes disponibles 24h/7j, Besoin d'aide ?</span>
            <span className="text-green-600 font-semibold">+221 77 123 45 67</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-green-600">
              À Propos
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">
              Nous Contacter
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">
              Mon Compte
            </a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600 flex items-center gap-1">
              🔒 Déconnexion
            </a>
          </div>
        </div>
      </div>

      <div className="bg-matix-green-dark text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-matix-green-dark p-2 rounded-lg mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-matix-yellow">MATIX</h1>
                <p className="text-xs text-matix-yellow opacity-90">M A R T</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-matix-green-medium font-medium">
              Accueil
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-matix-green-medium font-medium"
            >
              Catégories
            </Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">
              À Propos
            </Link>
            <Link href="#" className="text-gray-700 hover:text-matix-green-medium font-medium">
              Contact
            </Link>
            <Link href="/offres" className="text-matix-yellow font-medium">
              Offres
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              {/* Profile Section */}
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-purple-600">Client</p>
              </div>

              {/* Menu Navigation */}
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <Link
                    key={item.id}
                    href={
                      item.id === 'dashboard' ? '/dashboard/client' : `/dashboard/client/${item.id}`
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activePage === item.id
                        ? 'bg-purple-100 text-purple-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-purple-600'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil Client</h1>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="h-4 w-4" />
                {isEditing ? 'Annuler' : 'Modifier Profil'}
              </Button>
            </div>

            {/* Profile Information */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Informations Personnelles</h2>

              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <UserIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nom complet</p>
                        {isEditing ? (
                          <Input defaultValue={user.name} className="mt-1" />
                        ) : (
                          <p className="font-medium">{user.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        {isEditing ? (
                          <Input defaultValue={user.email} className="mt-1" />
                        ) : (
                          <p className="font-medium">{user.email}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        {isEditing ? (
                          <Input defaultValue={user.phone} className="mt-1" />
                        ) : (
                          <p className="font-medium">{user.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse de livraison</p>
                        {isEditing ? (
                          <Input defaultValue={user.adressePrincipale} className="mt-1" />
                        ) : (
                          <p className="font-medium">{user.adressePrincipale}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => setIsEditing(false)}
                      >
                        Sauvegarder
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Annuler
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Adresses de Livraison */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Adresses de Livraison</h2>

              <div className="space-y-4">
                {/* Adresse principale */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-purple-900">Adresse principale</p>
                        <p className="text-sm text-purple-700">{user.adressePrincipale}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-purple-600 border-purple-600 hover:bg-purple-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </div>
                </div>

                {/* Adresses secondaires */}
                {user.adressesSecondaires.map((adresse, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Adresse {index + 2}</p>
                          <p className="text-sm text-gray-600">{adresse}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Ajouter nouvelle adresse */}
                <Button
                  variant="outline"
                  className="w-full border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter nouvelle adresse
                </Button>
              </div>
            </Card>
            {/* Préférences */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Préférences Client</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Types de produits préférés
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.preferences.typesPreferences.map((pref, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Budget habituel</p>
                  <p className="text-purple-600 font-medium">
                    {user.preferences.budgetMin.toLocaleString()} -{' '}
                    {user.preferences.budgetMax.toLocaleString()} FCFA
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Fréquence d'achats</p>
                    <p className="text-gray-900">{user.preferences.frequenceAchats}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Mode de livraison préféré
                    </p>
                    <p className="text-gray-900">{user.preferences.modeLivraison}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Notifications */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Préférences de Notifications</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Email pour nouvelles offres</p>
                    <p className="text-sm text-gray-500">Recevez les promotions par email</p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.notifications.emailOffres ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.notifications.emailOffres ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">SMS pour suivi livraison</p>
                    <p className="text-sm text-gray-500">Notifications de livraison par SMS</p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.notifications.smsLivraison ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.notifications.smsLivraison ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Alertes prix favoris</p>
                    <p className="text-sm text-gray-500">Notifications baisse de prix</p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.notifications.alertesPrix ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.notifications.alertesPrix ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Newsletter hebdomadaire</p>
                    <p className="text-sm text-gray-500">Actualités et conseils avicoles</p>
                  </div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      user.notifications.newsletter ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        user.notifications.newsletter ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </Card>
            {/* Statistics */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Historique d'Achats</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Membre depuis</p>
                  <p className="font-bold text-lg">{user.memberSince}</p>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Commandes passées</p>
                  <p className="font-bold text-lg">{user.totalOrders}</p>
                </div>

                <div className="text-center">
                  <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Montant total dépensé</p>
                  <p className="font-bold text-lg">{user.totalSpent} FCFA</p>
                </div>

                <div className="text-center">
                  <div className="bg-orange-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">Vendeur préféré</p>
                  <p className="font-bold text-sm">{user.vendeurPrefere}</p>
                  <p className="text-xs text-gray-500">({user.achatsVendeurPrefere} achats)</p>
                </div>
              </div>
            </Card>

            {/* Programme Fidélité */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-6">Programme Fidélité</h2>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 text-white p-2 rounded-full">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-900">
                        Statut: Client {user.fidelite.statut}
                      </p>
                      <p className="text-sm text-purple-700">
                        {user.fidelite.points} points accumulés
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Progression vers Argent</p>
                    <p className="font-bold text-purple-600">
                      {user.fidelite.pointsProchainNiveau} points restants
                    </p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(user.fidelite.points / (user.fidelite.points + user.fidelite.pointsProchainNiveau)) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900 mb-2">Avantages actuels :</p>
                  <p className="text-sm text-gray-700">{user.fidelite.avantages}</p>
                </div>
              </div>
            </Card>
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Actions Rapides</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Modifier Profil
                </Button>

                <Link href="/dashboard/client/favorites">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Mes Favoris
                  </Button>
                </Link>

                <Link href="/categories">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Nouvelle Commande
                  </Button>
                </Link>

                <Link href="/dashboard/client/reviews">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Mes Évaluations
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Section App */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Obtenez Vos Besoins Quotidiens Depuis Notre Boutique Matix
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Il y a de nombreux produits que vous trouverez dans notre boutique. Choisissez votre
                produit nécessaire quotidien dans notre boutique Matix et obtenez des offres
                spéciales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play"
                    className="h-6"
                  />
                  Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="App Store"
                    className="h-6"
                  />
                  App Store
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl">🛒</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Livraison Gratuite</div>
                <div className="text-sm text-gray-500">À partir de 50,000 FCFA</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Support 24/7</div>
                <div className="text-sm text-gray-500">À tout moment</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Paiement Sécurisé</div>
                <div className="text-sm text-gray-500">100% Sécurisé</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Dernières Offres</div>
                <div className="text-sm text-gray-500">Jusqu'à 25% de réduction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-matix-footer-dark text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    À Propos Matix
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Carrières
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Dernières Nouvelles
                  </a>
                </li>
              </ul>
            </div>

            {/* Latest News */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">Latest News</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Volailles & Viande
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Aliments Avicoles
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Équipements
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Santé & Vétérinaire
                  </a>
                </li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="text-xl font-bold text-matix-yellow mb-6">My Account</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Mes Commandes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Commandes Récentes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">
                    Mettre à Jour Profil
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white text-matix-green-dark p-2 rounded-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-matix-yellow">MATIX MART</h1>
                </div>
              </div>
              <p className="text-gray-300 mb-4">Marché Colobane, Dakar, Sénégal</p>
              <p className="text-gray-300 mb-2">Tél : +221 77 123 45 67</p>
              <p className="text-gray-300">Email : contact@matix.sn</p>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Suivez-nous:</span>
                <div className="flex gap-3">
                  <div className="bg-blue-600 p-2 rounded-full">
                    <span className="text-white text-sm">f</span>
                  </div>
                  <div className="bg-black p-2 rounded-full">
                    <span className="text-white text-sm">X</span>
                  </div>
                  <div className="bg-red-500 p-2 rounded-full">
                    <span className="text-white text-sm">P</span>
                  </div>
                  <div className="bg-blue-700 p-2 rounded-full">
                    <span className="text-white text-sm">in</span>
                  </div>
                  <div className="bg-green-500 p-2 rounded-full">
                    <span className="text-white text-sm">W</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-400">
                  Appelez-nous:{' '}
                  <span className="text-matix-yellow font-bold text-xl">+221771234567</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg"
                  alt="Visa"
                  className="h-8"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-8"
                />
                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                  Orange Money
                </div>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Wave</div>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400">
                Copyright 2024 © <span className="text-matix-yellow">MatixLover</span>. Tous droits
                réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
