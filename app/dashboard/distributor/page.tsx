"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { formatCurrency } from '@/lib/bictorys';
import {
  Search,
  Bell,
  FileText,
  Users,
  Eye,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Heart,
  ShoppingCart,
  TrendingUp
} from 'lucide-react';

interface DashboardStats {
  followedProducers: number;
  activeAlerts: number;
  pendingRequests: number;
  pendingOrders: number;
  totalFavorites: number;
  monthlySpending: number;
}

interface RecentListing {
  id: string;
  producer_name: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  status: string;
  created_at: string;
}

export default function DistributorDashboardPage() {
  const router = useRouter();
  const { user, profile, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [stats, setStats] = useState<DashboardStats>({
    followedProducers: 0,
    activeAlerts: 0,
    pendingRequests: 0,
    pendingOrders: 0,
    totalFavorites: 0,
    monthlySpending: 0
  });
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!userLoading && activeRole !== 'distributor') {
      router.push('/dashboard/producer');
      return;
    }

    if (user && activeRole === 'distributor') {
      loadDashboardData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les statistiques en parallèle
      const [
        followsResult,
        alertsResult,
        requestsResult,
        ordersResult,
        favoritesResult
      ] = await Promise.all([
        // Producteurs suivis
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', user.id),

        // Alertes actives
        supabase
          .from('distributor_alerts')
          .select('id', { count: 'exact', head: true })
          .eq('distributor_id', user.id)
          .eq('is_active', true),

        // Demandes en cours
        supabase
          .from('distributor_requests')
          .select('id', { count: 'exact', head: true })
          .eq('distributor_id', user.id)
          .eq('status', 'active'),

        // Commandes en cours
        supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('distributor_id', user.id),

        // Favoris
        supabase
          .from('favorites')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      // Calculer les stats des commandes
      const orders = (ordersResult.data || []) as any[];
      const pendingOrders = orders.filter(o =>
        ['pending_payment', 'paid', 'confirmed', 'preparing', 'ready', 'shipped'].includes(o.status)
      ).length;

      // Dépenses du mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('distributor_id', user.id)
        .in('status', ['delivered', 'paid', 'confirmed', 'preparing', 'ready', 'shipped'])
        .gte('created_at', startOfMonth.toISOString());

      const monthlySpending = ((monthlyOrders || []) as any[]).reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        followedProducers: followsResult.count || 0,
        activeAlerts: alertsResult.count || 0,
        pendingRequests: requestsResult.count || 0,
        pendingOrders,
        totalFavorites: favoritesResult.count || 0,
        monthlySpending
      });

      // Charger les annonces récentes des producteurs suivis
      const { data: listingsData } = await supabase
        .from('producer_listings')
        .select(`
          id,
          quantity_available,
          unit_price,
          status,
          created_at,
          product:products(name, unit),
          producer:user_profiles!producer_listings_producer_id_fkey(first_name, last_name, business_name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (listingsData) {
        setRecentListings((listingsData as any[]).map(listing => ({
          id: listing.id,
          producer_name: listing.producer?.business_name ||
            `${listing.producer?.first_name || ''} ${listing.producer?.last_name || ''}`.trim() ||
            'Producteur',
          product_name: listing.product?.name || 'Produit',
          quantity: listing.quantity_available,
          unit: listing.product?.unit || 'unité',
          unit_price: listing.unit_price,
          status: listing.status,
          created_at: listing.created_at
        })));
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Bonjour, {profile?.first_name || 'Distributeur'} !
          </h1>
          <p className="text-gray-600 mt-1">
            Découvrez les meilleures offres des producteurs
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Producteurs suivis</p>
                <p className="text-2xl font-bold text-gray-900">{stats.followedProducers}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link href="/dashboard/distributor/search" className="text-sm text-blue-600 hover:underline mt-2 block">
              Rechercher des producteurs
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertes actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAlerts}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Link href="/dashboard/distributor/alerts" className="text-sm text-orange-600 hover:underline mt-2 block">
              Gérer les alertes
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Demandes en cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link href="/dashboard/distributor/requests" className="text-sm text-purple-600 hover:underline mt-2 block">
              Voir mes demandes
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dépenses du mois</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlySpending)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link href="/dashboard/distributor/orders" className="text-sm text-green-600 hover:underline mt-2 block">
              Voir les commandes
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/distributor/requests/new">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Créer une demande</p>
                  <p className="text-sm text-gray-500">Rechercher un produit spécifique</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/distributor/alerts/new">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Créer une alerte</p>
                  <p className="text-sm text-gray-500">Être notifié des nouvelles offres</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/distributor/search">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Search className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Explorer les offres</p>
                  <p className="text-sm text-gray-500">Parcourir les annonces</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Pending Orders Alert */}
        {stats.pendingOrders > 0 && (
          <Card className="p-4 mb-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{stats.pendingOrders} commande(s) en cours</p>
                  <p className="text-sm text-gray-500">Suivez l'état de vos commandes</p>
                </div>
              </div>
              <Link href="/dashboard/distributor/orders">
                <Button variant="outline" size="sm">
                  Voir les commandes
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Recent Listings */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Offres récentes</h2>
            <Link href="/dashboard/distributor/search">
              <Button variant="outline" size="sm">
                Voir toutes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentListings.length === 0 ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune offre disponible pour le moment</p>
              <p className="text-sm text-gray-400">Suivez des producteurs pour voir leurs offres</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Producteur</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Prix unitaire</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentListings.map((listing) => (
                    <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">{listing.producer_name}</td>
                      <td className="py-3 px-4 text-gray-600">{listing.product_name}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {listing.quantity} {listing.unit}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatCurrency(listing.unit_price)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/listings/${listing.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
