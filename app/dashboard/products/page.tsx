"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { productService, categoryService } from '@/lib/services';
import { formatCurrency } from '@/lib/bictorys';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Loader2,
  Package,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category_id: string;
  category_name?: string;
  unit: string;
  min_order_quantity: number;
  is_active: boolean;
  images: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
      loadData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Charger les catégories et les produits en parallèle
      const [categoriesResult, productsResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('products')
          .select(`
            id,
            name,
            description,
            category_id,
            unit,
            min_order_quantity,
            is_active,
            images,
            created_at,
            category:categories(name)
          `)
          .eq('producer_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (productsResult.data) {
        setProducts(productsResult.data.map(p => ({
          ...p,
          category_name: p.category?.name || 'Non catégorisé'
        })));
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (!error) {
        setProducts(products.map(p =>
          p.id === productId ? { ...p, is_active: !currentStatus } : p
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (!error) {
        setProducts(products.filter(p => p.id !== productId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des produits...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Mes Produits</h1>
            <p className="text-gray-600 mt-1">
              {products.length} produit{products.length !== 1 ? 's' : ''} au total
            </p>
          </div>
          <Link href="/dashboard/products/add">
            <Button className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
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
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {products.length === 0 ? 'Aucun produit' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-500 mb-6">
              {products.length === 0
                ? 'Commencez par ajouter votre premier produit'
                : 'Aucun produit ne correspond à votre recherche'}
            </p>
            {products.length === 0 && (
              <Link href="/dashboard/products/add">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {product.images && product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      {product.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{product.category_name}</p>
                    <p className="text-sm text-gray-600">
                      Min. {product.min_order_quantity} {product.unit}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button variant="ghost" size="sm" className="text-blue-600">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/products/${product.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(product.id, product.is_active)}
                      className={product.is_active ? 'text-orange-600' : 'text-green-600'}
                    >
                      {product.is_active ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>

                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600"
                        >
                          Oui
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          Non
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(product.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick action to create listing */}
        {products.length > 0 && (
          <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Créer une annonce</h3>
                <p className="text-sm text-gray-600">Publiez vos produits pour les distributeurs</p>
              </div>
              <Link href="/dashboard/listings/new">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Nouvelle annonce
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
