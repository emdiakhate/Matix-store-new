"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { formatCurrency } from '@/lib/bictorys';
import DashboardSidebar from '@/components/DashboardSidebar';
import {
  Eye,
  Search,
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  CreditCard,
  MessageSquare
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  producer_id: string;
  producer_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  delivery_mode: string;
  created_at: string;
  items_count: number;
}

export default function DistributorOrdersPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!userLoading && activeRole !== 'distributor') {
      router.push('/dashboard');
      return;
    }

    if (user && activeRole === 'distributor') {
      loadOrders();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          producer_id,
          total_amount,
          status,
          payment_status,
          delivery_mode,
          created_at,
          producer:user_profiles!orders_producer_id_fkey(first_name, last_name, business_name),
          order_items(id)
        `)
        .eq('distributor_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders((data as any[]).map(order => ({
          id: order.id,
          order_number: order.order_number,
          producer_id: order.producer_id,
          producer_name: order.producer?.business_name ||
            `${order.producer?.first_name || ''} ${order.producer?.last_name || ''}`.trim() ||
            'Producteur',
          total_amount: order.total_amount,
          status: order.status,
          payment_status: order.payment_status,
          delivery_mode: order.delivery_mode,
          created_at: order.created_at,
          items_count: order.order_items?.length || 0
        })));
      }
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> = {
      pending_payment: { label: 'Attente paiement', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Payée', class: 'bg-green-100 text-green-800', icon: CreditCard },
      confirmed: { label: 'Confirmée', class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      preparing: { label: 'En préparation', class: 'bg-purple-100 text-purple-800', icon: Package },
      ready: { label: 'Prête', class: 'bg-indigo-100 text-indigo-800', icon: Package },
      shipped: { label: 'Expédiée', class: 'bg-cyan-100 text-cyan-800', icon: Truck },
      delivered: { label: 'Livrée', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const statusConfig = config[status] || { label: status, class: 'bg-gray-100 text-gray-800', icon: Clock };
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
        <Icon className="h-3 w-3" />
        {statusConfig.label}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.producer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-100 text-gray-700 text-sm py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">📞</span>
            <span>Nous sommes disponibles 24h/7j</span>
            <span className="text-green-600 font-semibold">+221 77 123 45 67</span>
          </div>
        </div>
      </div>

      <div className="bg-matix-green-dark text-white py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <div className="bg-white text-matix-green-dark p-2 rounded-lg mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-matix-yellow">MATIX</h1>
              <p className="text-xs text-matix-yellow opacity-90">M A R T</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <DashboardSidebar activePage="orders" />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
            </div>

            {/* Filtres */}
            <Card className="p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher une commande..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  className="px-3 py-2 border rounded-md text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="pending_payment">Attente paiement</option>
                  <option value="paid">Payée</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="preparing">En préparation</option>
                  <option value="shipped">Expédiée</option>
                  <option value="delivered">Livrée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
            </Card>

            {/* Liste des commandes */}
            <Card className="p-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune commande trouvée</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">N° Commande</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Producteur</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {order.producer_name}
                          </td>
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
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/messages?producer=${order.producer_id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
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
      </div>
    </div>
  );
}
