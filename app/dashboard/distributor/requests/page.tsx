"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { categoryService } from '@/lib/services';
import { formatCurrency } from '@/lib/bictorys';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Package,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';

interface Request {
  id: string;
  category_id: string;
  category_name?: string;
  quantity_needed: number;
  unit: string;
  max_price?: number;
  delivery_location?: string;
  deadline?: string;
  description?: string;
  status: string;
  created_at: string;
  proposals_count: number;
}

interface Category {
  id: string;
  name: string;
}

export default function RequestsPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [requests, setRequests] = useState<Request[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      loadData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [categoriesResult, requestsResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('distributor_requests')
          .select(`
            id,
            category_id,
            quantity_needed,
            unit,
            max_price,
            delivery_location,
            deadline,
            description,
            status,
            created_at,
            category:categories(name),
            proposals(id)
          `)
          .eq('distributor_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data.map((c: any) => ({ id: c.id, name: c.name_fr || c.name })));
      }

      if (requestsResult.data) {
        setRequests((requestsResult.data as any[]).map(req => ({
          id: req.id,
          category_id: req.category_id,
          category_name: req.category?.name || req.category?.name_fr || 'Non catégorisé',
          quantity_needed: req.quantity_needed,
          unit: req.unit,
          max_price: req.max_price,
          delivery_location: req.delivery_location,
          deadline: req.deadline,
          description: req.description,
          status: req.status,
          created_at: req.created_at,
          proposals_count: req.proposals?.length || 0
        })));
      }
    } catch (error) {
      console.error('Erreur chargement demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('distributor_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (!error) {
        setRequests(requests.map(r =>
          r.id === requestId ? { ...r, status: newStatus } : r
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('Supprimer cette demande ?')) return;

    try {
      const { error } = await supabase
        .from('distributor_requests')
        .delete()
        .eq('id', requestId);

      if (!error) {
        setRequests(requests.filter(r => r.id !== requestId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      fulfilled: { label: 'Satisfaite', class: 'bg-blue-100 text-blue-800' },
      cancelled: { label: 'Annulée', class: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirée', class: 'bg-gray-100 text-gray-800' }
    };

    const statusConfig = config[status] || config.active;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
        {statusConfig.label}
      </span>
    );
  };

  // Filtrer les demandes
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Demandes</h1>
            <p className="text-gray-600 mt-1">
              {requests.length} demande{requests.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/dashboard/distributor/requests/new">
            <Button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle demande
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="fulfilled">Satisfaite</option>
              <option value="cancelled">Annulée</option>
              <option value="expired">Expirée</option>
            </select>
          </div>
        </Card>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {requests.length === 0 ? 'Aucune demande' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-6">
              {requests.length === 0
                ? 'Créez une demande pour trouver des producteurs'
                : 'Aucune demande ne correspond à votre recherche'}
            </p>
            {requests.length === 0 && (
              <Link href="/dashboard/distributor/requests/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une demande
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {request.category_name}
                      </h3>
                      {getStatusBadge(request.status)}
                      {request.proposals_count > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {request.proposals_count} proposition{request.proposals_count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        {request.quantity_needed} {request.unit}
                      </div>
                      {request.max_price && (
                        <div className="flex items-center">
                          Budget max: {formatCurrency(request.max_price)}
                        </div>
                      )}
                      {request.delivery_location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          {request.delivery_location}
                        </div>
                      )}
                      {request.deadline && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(request.deadline).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>

                    {request.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {request.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {request.proposals_count > 0 && (
                      <Link href={`/dashboard/distributor/requests/${request.id}/proposals`}>
                        <Button variant="outline" size="sm" className="text-blue-600">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Voir
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/distributor/requests/${request.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {request.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(request.id, 'cancelled')}
                        className="text-orange-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    ) : request.status === 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(request.id, 'active')}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
