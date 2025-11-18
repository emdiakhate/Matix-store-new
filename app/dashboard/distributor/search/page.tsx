"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { formatCurrency } from '@/lib/bictorys';
import { categoryService } from '@/lib/services';
import {
  Search,
  Loader2,
  MapPin,
  Phone,
  Filter,
  Eye,
  Heart,
  MessageSquare,
  Package,
  Star,
  UserPlus
} from 'lucide-react';

interface Listing {
  id: string;
  producer_id: string;
  producer_name: string;
  producer_phone: string;
  producer_city: string;
  producer_rating: number;
  product_name: string;
  product_id: string;
  category_name: string;
  quantity_available: number;
  unit: string;
  unit_price: number;
  min_order_quantity: number;
  description: string;
  images: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function SearchPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

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

      // Charger les catégories, les annonces et les favoris en parallèle
      const [categoriesResult, listingsResult, favoritesResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('producer_listings')
          .select(`
            id,
            producer_id,
            quantity_available,
            unit_price,
            min_order_quantity,
            description,
            created_at,
            product:products(id, name, unit, images, category:categories(name)),
            producer:user_profiles!producer_listings_producer_id_fkey(
              first_name, last_name, business_name, phone, city, average_rating
            )
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
        supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', user.id)
          .eq('favorite_type', 'listing')
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (favoritesResult.data) {
        setFavorites(new Set(favoritesResult.data.map(f => f.listing_id)));
      }

      if (listingsResult.data) {
        setListings(listingsResult.data.map(listing => ({
          id: listing.id,
          producer_id: listing.producer_id,
          producer_name: listing.producer?.business_name ||
            `${listing.producer?.first_name || ''} ${listing.producer?.last_name || ''}`.trim() ||
            'Producteur',
          producer_phone: listing.producer?.phone || '',
          producer_city: listing.producer?.city || '',
          producer_rating: listing.producer?.average_rating || 0,
          product_name: listing.product?.name || 'Produit',
          product_id: listing.product?.id || '',
          category_name: listing.product?.category?.name || '',
          quantity_available: listing.quantity_available,
          unit: listing.product?.unit || 'unité',
          unit_price: listing.unit_price,
          min_order_quantity: listing.min_order_quantity,
          description: listing.description || '',
          images: listing.product?.images || [],
          created_at: listing.created_at
        })));
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) return;

    const isFavorite = favorites.has(listingId);

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(listingId);
          return newSet;
        });
      } else {
        await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: listingId,
            favorite_type: 'listing'
          });

        setFavorites(prev => new Set(prev).add(listingId));
      }
    } catch (error) {
      console.error('Erreur favoris:', error);
    }
  };

  // Filtrer les annonces
  const filteredListings = listings.filter(listing => {
    const matchesSearch =
      listing.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.producer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.producer_city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || listing.category_name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rechercher des offres</h1>
          <p className="text-gray-600 mt-1">
            {listings.length} offre{listings.length !== 1 ? 's' : ''} disponible{listings.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Rechercher produit, producteur, ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Results */}
        {filteredListings.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {listings.length === 0 ? 'Aucune offre disponible' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500">
              {listings.length === 0
                ? 'Les producteurs n\'ont pas encore publié d\'offres'
                : 'Aucune offre ne correspond à votre recherche'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-100 relative">
                  {listing.images && listing.images[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.product_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={() => toggleFavorite(listing.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.has(listing.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                  <span className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded text-xs font-medium">
                    {listing.category_name}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{listing.product_name}</h3>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span className="font-medium text-gray-700">{listing.producer_name}</span>
                    {listing.producer_rating > 0 && (
                      <span className="ml-2 flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{listing.producer_rating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>

                  {listing.producer_city && (
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {listing.producer_city}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(listing.unit_price)}
                      </p>
                      <p className="text-xs text-gray-500">/ {listing.unit}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {listing.quantity_available} {listing.unit}
                      </p>
                      <p className="text-xs text-gray-500">disponible</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Min. commande: {listing.min_order_quantity} {listing.unit}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/listings/${listing.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </Link>
                    <Link href={`/messages?producer=${listing.producer_id}`}>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </Link>
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
