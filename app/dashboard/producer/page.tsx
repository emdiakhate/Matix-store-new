"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { formatCurrency } from '@/lib/bictorys';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  activeListings: number;
  pendingOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
  totalProposals: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  distributor_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function ProducerDashboardPage() {
  const router = useRouter();
  const { user, profile, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeListings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    totalProposals: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!userLoading && activeRole !== 'producer') {
      router.push('/dashboard/distributor');
      return;
    }

    if (user && activeRole === 'producer') {
      loadDashboardData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les statistiques en parallèle
      const [
        productsResult,
        listingsResult,
        ordersResult,
        proposalsResult
      ] = await Promise.all([
        // Nombre de produits
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('producer_id', user.id),

        // Annonces actives
        supabase
          .from('producer_listings')
          .select('id', { count: 'exact', head: true })
          .eq('producer_id', user.id)
          .eq('status', 'active'),

        // Commandes
        supabase
          .from('orders')
          .select('id, status, total_amount')
          .eq('producer_id', user.id),

        // Propositions reçues
        supabase
          .from('proposals')
          .select('id', { count: 'exact', head: true })
          .eq('producer_id', user.id)
          .eq('status', 'pending')
      ]);

      // Calculer les stats
      const orders = (ordersResult.data || []) as any[];
      const pendingOrders = orders.filter(o =>
        ['pending_payment', 'paid', 'confirmed', 'preparing', 'ready', 'shipped'].includes(o.status)
      ).length;
      const completedOrders = orders.filter(o => o.status === 'delivered').length;

      // Revenus du mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('producer_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyRevenue = ((monthlyOrders || []) as any[]).reduce((sum, o) => sum + (o.total_amount || 0), 0);

      setStats({
        totalProducts: productsResult.count || 0,
        activeListings: listingsResult.count || 0,
        pendingOrders,
        completedOrders,
        monthlyRevenue,
        totalProposals: proposalsResult.count || 0
      });

      // Charger les commandes récentes
      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          distributor:user_profiles!orders_distributor_id_fkey(first_name, last_name, business_name)
        `)
        .eq('producer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentOrdersData) {
        setRecentOrders((recentOrdersData as any[]).map(order => ({
          id: order.id,
          order_number: order.order_number,
          distributor_name: order.distributor?.business_name ||
            `${order.distributor?.first_name || ''} ${order.distributor?.last_name || ''}`.trim() ||
            'Client',
          total_amount: order.total_amount,
          status: order.status,
          created_at: order.created_at
        })));
      }
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string; icon: any }> = {
      pending_payment: { label: 'En attente', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Payée', class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      confirmed: { label: 'Confirmée', class: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
      preparing: { label: 'Préparation', class: 'bg-purple-100 text-purple-800', icon: Package },
      ready: { label: 'Prête', class: 'bg-cyan-100 text-cyan-800', icon: Package },
      shipped: { label: 'Expédiée', class: 'bg-orange-100 text-orange-800', icon: TrendingUp },
      delivered: { label: 'Livrée', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
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
            Bonjour, {profile?.first_name || 'Producteur'} !
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Produits</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link href="/dashboard/products" className="text-sm text-green-600 hover:underline mt-2 block">
              Gérer les produits
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Annonces actives</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link href="/dashboard/listings" className="text-sm text-blue-600 hover:underline mt-2 block">
              Voir les annonces
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commandes en cours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <Link href="/dashboard/orders" className="text-sm text-orange-600 hover:underline mt-2 block">
              Gérer les commandes
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenus du mois</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-full">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <Link href="/dashboard/stats" className="text-sm text-emerald-600 hover:underline mt-2 block">
              Voir les statistiques
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard/products/add">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-green-500">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Ajouter un produit</p>
                  <p className="text-sm text-gray-500">Créer une nouvelle fiche produit</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link href="/dashboard/listings/new">
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Créer une annonce</p>
                  <p className="text-sm text-gray-500">Publier une offre de vente</p>
                </div>
              </div>
            </Card>
          </Link>

          {stats.totalProposals > 0 && (
            <Link href="/dashboard/proposals">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-yellow-50 border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{stats.totalProposals} proposition(s)</p>
                    <p className="text-sm text-gray-500">En attente de réponse</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Commandes récentes</h2>
            <Link href="/dashboard/orders">
              <Button variant="outline" size="sm">
                Voir toutes
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Aucune commande pour le moment</p>
              <p className="text-sm text-gray-400">Les commandes des distributeurs apparaîtront ici</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">N° Commande</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Distributeur</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">#{order.order_number}</td>
                      <td className="py-3 px-4 text-gray-600">{order.distributor_name}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/dashboard/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
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
