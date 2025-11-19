"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { formatCurrency } from '@/lib/bictorys';
import {
  Eye,
  Search,
  Loader2,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  distributor_id: string;
  distributor_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  delivery_mode: string;
  created_at: string;
  items_count: number;
}

const ORDER_STATUSES = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending_payment', label: 'En attente de paiement' },
  { value: 'paid', label: 'Payée' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'shipped', label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' }
];

export default function OrdersPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
          distributor_id,
          total_amount,
          status,
          payment_status,
          delivery_mode,
          created_at,
          distributor:user_profiles!orders_distributor_id_fkey(first_name, last_name, business_name),
          order_items(id)
        `)
        .eq('producer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setOrders((data as any[]).map(order => ({
          id: order.id,
          order_number: order.order_number,
          distributor_id: order.distributor_id,
          distributor_name: order.distributor?.business_name ||
            `${order.distributor?.first_name || ''} ${order.distributor?.last_name || ''}`.trim() ||
            'Client',
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

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (!error) {
        setOrders(orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string; icon: any }> = {
      pending_payment: { label: 'Attente paiement', class: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { label: 'Payée', class: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      confirmed: { label: 'Confirmée', class: 'bg-indigo-100 text-indigo-800', icon: CheckCircle },
      preparing: { label: 'Préparation', class: 'bg-purple-100 text-purple-800', icon: Package },
      ready: { label: 'Prête', class: 'bg-cyan-100 text-cyan-800', icon: Package },
      shipped: { label: 'Expédiée', class: 'bg-orange-100 text-orange-800', icon: Truck },
      delivered: { label: 'Livrée', class: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800', icon: XCircle },
      disputed: { label: 'Litige', class: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const statusConfig = config[status] || config.pending_payment;
    const Icon = statusConfig.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </span>
    );
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      paid: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'shipped',
      shipped: 'delivered'
    };
    return flow[currentStatus] || null;
  };

  const getNextStatusLabel = (currentStatus: string): string | null => {
    const labels: Record<string, string> = {
      paid: 'Confirmer',
      confirmed: 'Préparer',
      preparing: 'Marquer prête',
      ready: 'Expédier',
      shipped: 'Marquer livrée'
    };
    return labels[currentStatus] || null;
  };

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.distributor_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600 mt-1">
            {orders.length} commande{orders.length !== 1 ? 's' : ''} au total
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher par n° ou client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {orders.length === 0 ? 'Aucune commande' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500">
              {orders.length === 0
                ? 'Les commandes des distributeurs apparaîtront ici'
                : 'Aucune commande ne correspond à votre recherche'}
            </p>
          </Card>
        ) : (
          <>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">N° Commande</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Montant</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">#{order.order_number}</span>
                          <br />
                          <span className="text-xs text-gray-500">{order.items_count} article(s)</span>
                        </td>
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
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="text-blue-600">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/messages?order=${order.id}`}>
                              <Button variant="ghost" size="sm" className="text-green-600">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </Link>
                            {getNextStatus(order.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                                className="text-xs"
                              >
                                {getNextStatusLabel(order.status)}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredOrders.length)} sur {filteredOrders.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
