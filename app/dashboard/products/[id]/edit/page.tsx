"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { categoryService } from '@/lib/services';
import {
  ArrowLeft,
  Upload,
  Loader2,
  X
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    unit: 'pièce',
    min_order_quantity: '1',
    is_active: true
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

    if (user && activeRole === 'producer' && productId) {
      loadData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router, productId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [categoriesResult, productResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .eq('producer_id', user.id)
          .single()
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (productResult.data) {
        setFormData({
          name: productResult.data.name,
          category_id: productResult.data.category_id,
          description: productResult.data.description || '',
          unit: productResult.data.unit,
          min_order_quantity: productResult.data.min_order_quantity.toString(),
          is_active: productResult.data.is_active
        });
        setImages(productResult.data.images || []);
      } else {
        router.push('/dashboard/products');
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      router.push('/dashboard/products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      if (images.length >= 5) break;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (!error && data) {
        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);

        setImages(prev => [...prev, publicUrl.publicUrl]);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.category_id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          category_id: formData.category_id,
          description: formData.description || null,
          unit: formData.unit,
          min_order_quantity: parseInt(formData.min_order_quantity) || 1,
          images: images,
          is_active: formData.is_active
        })
        .eq('id', productId)
        .eq('producer_id', user.id);

      if (error) throw error;

      router.push('/dashboard/products');
    } catch (error) {
      console.error('Erreur mise à jour produit:', error);
      alert('Erreur lors de la mise à jour du produit');
    } finally {
      setSaving(false);
    }
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du produit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du produit *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Poulet de chair"
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Décrivez votre produit..."
              />
            </div>

            {/* Unité et quantité minimum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité de mesure
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pièce">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="lot">Lot</option>
                  <option value="sac">Sac</option>
                  <option value="plateau">Plateau</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité minimum
                </label>
                <Input
                  type="number"
                  value={formData.min_order_quantity}
                  onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                  min="1"
                />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Produit actif</span>
              </label>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos du produit
              </label>

              {/* Images preview */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload zone */}
              {images.length < 5 && (
                <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Cliquez pour ajouter des images ({5 - images.length} restantes)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Formats: JPEG, PNG
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Link href="/dashboard/products" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving || !formData.name || !formData.category_id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
