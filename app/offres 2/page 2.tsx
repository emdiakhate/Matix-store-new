"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, Truck, Phone, Shield, Award } from 'lucide-react';
import Link from 'next/link';

interface Coupon {
  id: number;
  name: string;
  discount: string;
  code: string;
  isActive: boolean;
  minAmount: number;
  image: string;
  timeLeft?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: 1,
      name: "Promo Ramadan",
      discount: "25% Off",
      code: "RAMADAN25",
      isActive: true,
      minAmount: 50000,
      image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=200",
      timeLeft: { days: 2, hours: 20, minutes: 15, seconds: 30 }
    },
    {
      id: 2,
      name: "Offre Nouveau Client",
      discount: "5000 FCFA Off",
      code: "NEWBIRD50",
      isActive: false,
      minAmount: 25000,
      image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: 3,
      name: "Offre Équipements",
      discount: "15000 FCFA Off",
      code: "EQUIPMT15",
      isActive: false,
      minAmount: 100000,
      image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      id: 4,
      name: "Promo Aliments",
      discount: "20% Off",
      code: "ALIMENT20",
      isActive: true,
      minAmount: 30000,
      image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=200",
      timeLeft: { days: 17, hours: 6, minutes: 9, seconds: 8 }
    }
  ]);

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCoupons(prevCoupons =>
        prevCoupons.map(coupon => {
          if (coupon.isActive && coupon.timeLeft) {
            const { days, hours, minutes, seconds } = coupon.timeLeft;
            
            if (seconds > 0) {
              return {
                ...coupon,
                timeLeft: { ...coupon.timeLeft, seconds: seconds - 1 }
              };
            } else if (minutes > 0) {
              return {
                ...coupon,
                timeLeft: { ...coupon.timeLeft, minutes: minutes - 1, seconds: 59 }
              };
            } else if (hours > 0) {
              return {
                ...coupon,
                timeLeft: { ...coupon.timeLeft, hours: hours - 1, minutes: 59, seconds: 59 }
              };
            } else if (days > 0) {
              return {
                ...coupon,
                timeLeft: { ...coupon.timeLeft, days: days - 1, hours: 23, minutes: 59, seconds: 59 }
              };
            } else {
              return { ...coupon, isActive: false, timeLeft: undefined };
            }
          }
          return coupon;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

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
                <h1 className="text-2xl font-bold">MATIX MART</h1>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-green-600 font-medium">Accueil</Link>
            <Link href="#" className="text-gray-700 hover:text-green-600 font-medium">Catégories</Link>
            <Link href="#" className="text-gray-700 hover:text-green-600 font-medium">À Propos</Link>
            <Link href="#" className="text-gray-700 hover:text-green-600 font-medium">Contact</Link>
            <Link href="/offres" className="text-red-500 font-medium">Offres</Link>
          </nav>
        </div>
      </div>

      {/* Hero Section avec image de fond */}
      <div className="relative bg-gradient-to-r from-orange-100 to-green-100 py-16 overflow-hidden">
        {/* Images flottantes gauche */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/4">
          <div className="grid grid-cols-2 gap-4 opacity-80">
            <img src="https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poulets" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poussins" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aliments" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Œufs" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        {/* Images flottantes droite */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4">
          <div className="grid grid-cols-2 gap-4 opacity-80">
            <img src="https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Équipements" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poulets fermiers" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Poussins" className="w-16 h-16 rounded-full object-cover" />
            <img src="https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=100" alt="Aliments" className="w-16 h-16 rounded-full object-cover" />
          </div>
        </div>

        {/* Titre centré */}
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900">Méga Offres</h1>
        </div>
      </div>

      {/* Liste des coupons */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {coupons.map((coupon) => (
            <Card key={coupon.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="grid grid-cols-12 gap-6 items-center">
                {/* Image produit */}
                <div className="col-span-2">
                  <img 
                    src={coupon.image} 
                    alt={coupon.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                </div>

                {/* Section centrale */}
                <div className="col-span-6">
                  {/* Compteur dégressif */}
                  <div className="flex items-center gap-1 mb-3">
                    {coupon.isActive && coupon.timeLeft ? (
                      <>
                        <div className="bg-green-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">
                          {String(coupon.timeLeft.days * 24 + coupon.timeLeft.hours).padStart(2, '0')}
                        </div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-green-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">
                          {String(coupon.timeLeft.minutes).padStart(2, '0')}
                        </div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-green-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">
                          {String(coupon.timeLeft.seconds).padStart(2, '0')}
                        </div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-green-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">
                          00
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-red-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">00</div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-red-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">00</div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-red-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">00</div>
                        <span className="text-gray-600 font-bold text-lg">:</span>
                        <div className="bg-red-500 text-white px-3 py-2 rounded text-lg font-bold min-w-[50px] text-center">00</div>
                      </>
                    )}
                  </div>

                  {/* Nom du coupon */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{coupon.name}</h3>
                  
                  {/* Réduction */}
                  <div className="text-2xl font-bold text-red-500">{coupon.discount}</div>
                </div>

                {/* Section droite */}
                <div className="col-span-4">
                  {/* Badge statut */}
                  <div className="mb-4">
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      coupon.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      Coupon {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Code coupon */}
                  <div className="mb-4">
                    <button
                      onClick={() => copyCode(coupon.code)}
                      className="bg-green-50 border-2 border-dashed border-green-300 px-4 py-3 rounded-lg w-full text-center hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-green-700 font-mono text-lg font-bold">{coupon.code}</span>
                        {copiedCode === coupon.code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Condition */}
                  <p className="text-sm text-gray-500">
                    * Ce code coupon s'applique pour des achats de plus de {coupon.minAmount.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </Card>
          ))}
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
                Il y a de nombreux produits que vous trouverez dans notre boutique. 
                Choisissez votre produit nécessaire quotidien dans notre boutique Matix 
                et obtenez des offres spéciales.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-6" />
                  Google Play
                </Button>
                <Button className="bg-black hover:bg-gray-800 text-white flex items-center gap-2">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-6" />
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
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Livraison Gratuite</div>
                <div className="text-sm text-gray-500">À partir de 50,000 FCFA</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Support 24/7</div>
                <div className="text-sm text-gray-500">À tout moment</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold">Paiement Sécurisé</div>
                <div className="text-sm text-gray-500">100% Sécurisé</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-green-600" />
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
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">À Propos Matix</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Dernières Nouvelles</a></li>
              </ul>
            </div>

            {/* Latest News */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Dernières Nouvelles</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Volailles & Viande</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Aliments Avicoles</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Équipements</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Santé & Vétérinaire</a></li>
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="text-xl font-bold text-green-400 mb-6">Mon Compte</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Tableau de Bord</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mes Commandes</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Commandes Récentes</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mettre à Jour Profil</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-white text-green-500 p-2 rounded-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">MATIX MART</h1>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Marché Colobane, Dakar, Sénégal
              </p>
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
                  Appelez-nous: <span className="text-green-400 font-bold text-xl">+221771234567</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-8" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8" />
                <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs">Orange Money</div>
                <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Wave</div>
              </div>
            </div>

            <div className="text-center mt-8 pt-6 border-t border-gray-800">
              <p className="text-gray-400">
                Copyright 2024 © <span className="text-green-400">MatixLover</span>. Tous droits réservés.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}