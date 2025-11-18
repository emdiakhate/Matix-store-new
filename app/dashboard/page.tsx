"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMatixUser } from '@/hooks/useSupabase';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, activeRole, loading, isAuthenticated } = useMatixUser();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // Rediriger vers l'accueil si non connecté
        router.push('/');
      } else {
        // Rediriger vers le dashboard approprié selon le rôle
        if (activeRole === 'producer') {
          router.push('/dashboard/producer');
        } else {
          router.push('/dashboard/distributor');
        }
      }
    }
  }, [loading, isAuthenticated, activeRole, router]);

  // Afficher un loader pendant la redirection
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
        <p className="text-gray-600">Chargement du dashboard...</p>
      </div>
    </div>
  );
}
