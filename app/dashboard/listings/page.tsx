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
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Calendar,
  Tag
} from 'lucide-react';

interface Listing {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity_available: number;
  unit: string;
  unit_price: number;
  min_order_quantity: number;
  status: string;
  expires_at?: string;
  created_at: string;
}

export default function ListingsPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
      loadListings();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadListings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('producer_listings')
        .select(`
          id,
          product_id,
          quantity_available,
          unit_price,
          min_order_quantity,
          status,
          expires_at,
          created_at,
          product:products(name, unit, images)
        `)
        .eq('producer_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setListings((data as any[]).map(listing => ({
          id: listing.id,
          product_id: listing.product_id,
          product_name: listing.product?.name || 'Produit',
          product_image: listing.product?.images?.[0],
          quantity_available: listing.quantity_available,
          unit: listing.product?.unit || 'unité',
          unit_price: listing.unit_price,
          min_order_quantity: listing.min_order_quantity,
          status: listing.status,
          expires_at: listing.expires_at,
          created_at: listing.created_at
        })));
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (listingId: string, newStatus: string) => {
    try {
      const { error } = await (supabase as any)
        .from('producer_listings')
        .update({ status: newStatus })
        .eq('id', listingId);

      if (!error) {
        setListings(listings.map(l =>
          l.id === listingId ? { ...l, status: newStatus } : l
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Supprimer cette annonce ?')) return;

    try {
      const { error } = await supabase
        .from('producer_listings')
        .delete()
        .eq('id', listingId);

      if (!error) {
        setListings(listings.filter(l => l.id !== listingId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      active: { label: 'Active', class: 'bg-green-100 text-green-800' },
      paused: { label: 'En pause', class: 'bg-yellow-100 text-yellow-800' },
      sold_out: { label: 'Épuisée', class: 'bg-red-100 text-red-800' },
      expired: { label: 'Expirée', class: 'bg-gray-100 text-gray-800' }
    };

    const statusConfig = config[status] || config.active;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.class}`}>
        {statusConfig.label}
      </span>
    );
  };

  // Filtrer les annonces
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des annonces...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mes Annonces</h1>
            <p className="text-gray-600 mt-1">
              {listings.length} annonce{listings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle annonce
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
                placeholder="Rechercher une annonce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Active</option>
              <option value="paused">En pause</option>
              <option value="sold_out">Épuisée</option>
              <option value="expired">Expirée</option>
            </select>
          </div>
        </Card>

        {/* Listings */}
        {filteredListings.length === 0 ? (
          <Card className="p-12 text-center">
            <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {listings.length === 0 ? 'Aucune annonce' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-6">
              {listings.length === 0
                ? 'Publiez vos produits pour attirer les distributeurs'
                : 'Aucune annonce ne correspond à votre recherche'}
            </p>
            {listings.length === 0 && (
              <Link href="/dashboard/listings/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une annonce
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.product_image ? (
                      <img
                        src={listing.product_image}
                        alt={listing.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{listing.product_name}</h3>
                      {getStatusBadge(listing.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium text-green-600">
                        {formatCurrency(listing.unit_price)} / {listing.unit}
                      </span>
                      <span>
                        {listing.quantity_available} {listing.unit} dispo.
                      </span>
                      <span>
                        Min. {listing.min_order_quantity}
                      </span>
                    </div>
                    {listing.expires_at && (
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expire le {new Date(listing.expires_at).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/listings/${listing.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/listings/${listing.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    {listing.status === 'active' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(listing.id, 'paused')}
                        className="text-orange-600"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateStatus(listing.id, 'active')}
                        className="text-green-600"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteListing(listing.id)}
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
