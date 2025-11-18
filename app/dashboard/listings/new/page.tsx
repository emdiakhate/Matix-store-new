"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import {
  ArrowLeft,
  Loader2,
  Package
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  unit: string;
  images: string[];
}

export default function NewListingPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    product_id: '',
    quantity_available: '',
    unit_price: '',
    min_order_quantity: '1',
    description: '',
    expires_at: ''
  });

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
      loadProducts();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('products')
        .select('id, name, unit, images')
        .eq('producer_id', user.id)
        .eq('is_active', true)
        .order('name');

      if (data) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');

    if (!formData.product_id) {
      setError('Veuillez sélectionner un produit');
      return;
    }

    if (!formData.quantity_available || parseFloat(formData.quantity_available) <= 0) {
      setError('Veuillez indiquer une quantité valide');
      return;
    }

    if (!formData.unit_price || parseFloat(formData.unit_price) <= 0) {
      setError('Veuillez indiquer un prix valide');
      return;
    }

    setSaving(true);
    try {
      const { error: insertError } = await supabase
        .from('producer_listings')
        .insert({
          producer_id: user.id,
          product_id: formData.product_id,
          quantity_available: parseFloat(formData.quantity_available),
          unit_price: parseFloat(formData.unit_price),
          min_order_quantity: parseInt(formData.min_order_quantity) || 1,
          description: formData.description || null,
          expires_at: formData.expires_at || null,
          status: 'active'
        });

      if (insertError) throw insertError;

      router.push('/dashboard/listings');
    } catch (error) {
      console.error('Erreur création annonce:', error);
      setError('Une erreur est survenue lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/listings" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux annonces
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle annonce</h1>
          <p className="text-gray-600 mt-1">Publiez une offre pour vos produits</p>
        </div>

        {products.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit</h3>
            <p className="text-gray-500 mb-6">
              Vous devez d'abord créer des produits avant de publier une annonce
            </p>
            <Link href="/dashboard/products/add">
              <Button className="bg-green-600 hover:bg-green-700">
                Créer un produit
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Produit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produit *
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité et Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité disponible *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.quantity_available}
                      onChange={(e) => setFormData({ ...formData, quantity_available: e.target.value })}
                      placeholder="100"
                      min="1"
                      required
                    />
                    {selectedProduct && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        {selectedProduct.unit}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix unitaire (FCFA) *
                  </label>
                  <Input
                    type="number"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="5000"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Quantité minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité minimum de commande
                </label>
                <Input
                  type="number"
                  value={formData.min_order_quantity}
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                  placeholder="1"
                  min="1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Informations supplémentaires sur cette offre..."
                />
              </div>

              {/* Date d'expiration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'expiration (optionnel)
                </label>
                <Input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/dashboard/listings" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Annuler
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Publication...' : 'Publier l\'annonce'}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
