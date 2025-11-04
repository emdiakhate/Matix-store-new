'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import QualitySection from '@/components/QualitySection';
import FeaturedCategories from '@/components/FeaturedCategories';
import PopularProducts from '@/components/PopularProducts';
import DeliverySection from '@/components/DeliverySection';
import DiscountedProducts from '@/components/DiscountedProducts';
import MobileAppSection from '@/components/MobileAppSection';
import Footer from '@/components/Footer';
import { MessageCircle } from 'lucide-react';

// Lazy load des composants lourds pour optimiser la performance
const HeroSection = dynamic(() => import('@/components/HeroSection'), {
  loading: () => (
    <div className="h-screen bg-gradient-to-r from-green-50 to-blue-50 animate-pulse" />
  ),
});

// ChatBot chargé uniquement quand l'utilisateur l'ouvre
const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
  loading: () => <div className="text-sm text-gray-500">Chargement du système vocal...</div>,
});

export default function Home() {
  const [showChatBot, setShowChatBot] = useState(false);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <QualitySection />
        <FeaturedCategories />
        <PopularProducts />
        <DeliverySection />
        <DiscountedProducts />
        <MobileAppSection />
      </main>
      <Footer />

      {/* Bouton flottant pour ouvrir le ChatBot vocal */}
      {!showChatBot && (
        <button
          onClick={() => setShowChatBot(true)}
          className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Ouvrir l'assistant vocal"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* ChatBot ne se charge que quand l'utilisateur clique */}
      {showChatBot && <ChatBot />}
    </div>
  );
}
