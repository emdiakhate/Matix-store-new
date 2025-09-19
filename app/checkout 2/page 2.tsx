"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Minus, Plus, Trash2, Truck, Phone, Shield, Award } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('ups');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [couponCode, setCouponCode] = useState('');
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Poulet Fermier Race Locale",
      price: 25000,
      quantity: 1,
      image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=120"
    },
    {
      id: 2,
      name: "Poussins Pondeuses ISA",
      price: 2500,
      quantity: 10,
      image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=120"
    }
  ]);

  const shippingOptions = [
    { id: 'ups', name: 'UPS', delivery: 'Livraison Aujourd\'hui', cost: 2500, icon: '📦' },
    { id: 'dhl', name: 'DHL', delivery: 'Livraison 2 Jours', cost: 1500, icon: '📦' }
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Espèces', icon: '💰', color: '#6B7280' },
    { id: 'card', name: 'Carte bancaire', icon: '💳', color: '#6B7280' },
    { id: 'orange', name: 'Orange Money', icon: '📱', color: '#FF6600' },
    { id: 'wave', name: 'Wave', icon: '📱', color: '#1E40AF' },
    { id: 'free', name: 'Free Money', icon: '📱', color: '#10B981' }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingOptions.find(option => option.id === shippingMethod)?.cost || 0;
  const discount = 0;
  const totalCost = subtotal + shippingCost - discount;

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header identique à la page principale */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>Nous sommes disponibles 24h/7j, Besoin d'aide ?</span>
            <span className="text-green-600 font-semibold">+221 77 123 45 67</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm">
            <a href="#" className="hover:text-green-600">À Propos</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Nous Contacter</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600">Mon Compte</a>
            <span className="text-gray-400">|</span>
            <a href="#" className="hover:text-green-600 flex items-center gap-1">
              🔒 Déconnexion
            </a>
          </div>
        </div>
      </div>

      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <div className="bg-white text-green-500 p-2 rounded-lg mr-3">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">MATIX</h1>
                <p className="text-xs opacity-90">M A R T</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux achats
            </Link>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Colonne Gauche - Formulaire (60%) */}
          <div className="lg:col-span-3">
            {/* Toggle Adresse par défaut */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">Utiliser l'Adresse de Livraison par Défaut</span>
                <div className="flex items-center">
                  <span className="mr-2 text-sm text-gray-600">Oui</span>
                  <button
                    onClick={() => setUseDefaultAddress(!useDefaultAddress)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      useDefaultAddress ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        useDefaultAddress ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* 01. Personal Details */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">01. Détails Personnels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <Input defaultValue="Amadou" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <Input defaultValue="Diallo" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse Email</label>
                  <Input defaultValue="amadou@example.com" className="w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de Téléphone</label>
                  <Input defaultValue="+221771234567" className="w-full" />
                </div>
              </div>
            </div>

            {/* 02. Shipping Details */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">02. Détails de Livraison</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <Input defaultValue="Marché Colobane, Dakar" className="w-full" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <Input defaultValue="Dakar" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                    <Input defaultValue="Sénégal" className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code Postal</label>
                    <Input defaultValue="10200" className="w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Cost */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-4">Coût de Livraison</h4>
              <div className="space-y-3">
                {shippingOptions.map((option) => (
                  <div key={option.id} className="flex items-center p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={option.id}
                      name="shipping"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={(e) => setShippingMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center flex-1">
                      <span className="text-xl mr-3">{option.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-600">{option.delivery}</div>
                      </div>
                      <div className="font-semibold">Coût: {option.cost.toLocaleString()} FCFA</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 03. Payment Method */}
            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">03. Méthode de Paiement</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center p-3 border rounded-lg">
                    <input
                      type="radio"
                      id={method.id}
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex items-center">
                      <span className="text-xl mr-3" style={{ color: method.color }}>{method.icon}</span>
                      <span className="font-medium" style={{ color: method.color }}>{method.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Boutons Action */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 border-purple-500 text-purple-500 hover:bg-purple-50">
                Continuer les Achats
              </Button>
              <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                Confirmer la Commande →
              </Button>
            </div>
          </div>

          {/* Colonne Droite - Order Summary (40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé de Commande</h3>
              
              {/* Produits */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500">Prix Unitaire {item.price.toLocaleString()} FCFA</p>
                      <p className="font-bold text-green-600">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 py-1 bg-white border rounded text-sm min-w-[30px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Champ Coupon */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Code Coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-6">
                    Appliquer
                  </Button>
                </div>
              </div>

              {/* Calculs */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Coût de Livraison</span>
                  <span className="font-semibold">{shippingCost.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span>Réduction</span>
                  <span className="font-semibold text-orange-500">{discount.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>COÛT TOTAL</span>
                  <span>{totalCost.toLocaleString()} FCFA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section App */}
        <div className="mt-16 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Obtenez Vos Besoins Quotidiens Depuis Notre Boutique Matix
              </h3>
              <p className="text-gray-600 mb-6">
                Il y a de nombreux produits que vous trouverez dans notre boutique. 
                Choisissez votre produit nécessaire quotidien dans notre boutique Matix 
                et obtenez des offres spéciales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6 mr-2" />
                  Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6 mr-2" />
                  App Store
                </Button>
              </div>
            </div>
            <div className="text-center">
              <div className="text-8xl">🛒</div>
            </div>
          </div>
        </div>

        {/* Features Bar */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Truck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Livraison Gratuite</div>
              <div className="text-xs text-gray-500">À partir de 50,000 FCFA</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Support 24/7</div>
              <div className="text-xs text-gray-500">À tout moment</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Paiement Sécurisé</div>
              <div className="text-xs text-gray-500">100% Sécurisé</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-sm">Dernières Offres</div>
              <div className="text-xs text-gray-500">Jusqu'à 25% de réduction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}