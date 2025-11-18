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
  Loader2
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function EditRequestPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.id as string;
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    quantity_needed: '',
    unit: 'pièce',
    max_price: '',
    delivery_location: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    if (!userLoading && !isAuthenticated) {
      router.push('/');
      return;
    }

    if (!userLoading && activeRole !== 'distributor') {
      router.push('/dashboard/producer');
      return;
    }

    if (user && activeRole === 'distributor' && requestId) {
      loadData();
    }
  }, [user, activeRole, userLoading, isAuthenticated, router, requestId]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [categoriesResult, requestResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('distributor_requests')
          .select('*')
          .eq('id', requestId)
          .eq('distributor_id', user.id)
          .single()
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (requestResult.data) {
        setFormData({
          category_id: requestResult.data.category_id,
          quantity_needed: requestResult.data.quantity_needed.toString(),
          unit: requestResult.data.unit,
          max_price: requestResult.data.max_price?.toString() || '',
          delivery_location: requestResult.data.delivery_location || '',
          deadline: requestResult.data.deadline ? requestResult.data.deadline.split('T')[0] : '',
          description: requestResult.data.description || ''
        });
      } else {
        router.push('/dashboard/distributor/requests');
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
      router.push('/dashboard/distributor/requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.category_id || !formData.quantity_needed) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('distributor_requests')
        .update({
          category_id: formData.category_id,
          quantity_needed: parseFloat(formData.quantity_needed),
          unit: formData.unit,
          max_price: formData.max_price ? parseFloat(formData.max_price) : null,
          delivery_location: formData.delivery_location || null,
          deadline: formData.deadline || null,
          description: formData.description || null
        })
        .eq('id', requestId)
        .eq('distributor_id', user.id);

      if (error) throw error;

      router.push('/dashboard/distributor/requests');
    } catch (error) {
      console.error('Erreur mise à jour demande:', error);
      alert('Erreur lors de la mise à jour de la demande');
    } finally {
      setSaving(false);
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/distributor/requests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Modifier la demande</h1>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie de produit *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Quantité et unité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité souhaitée *
                </label>
                <Input
                  type="number"
                  value={formData.quantity_needed}
                  onChange={(e) => setFormData({ ...formData, quantity_needed: e.target.value })}
                  placeholder="Ex: 100"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unité
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pièce">Pièce</option>
                  <option value="kg">Kilogramme</option>
                  <option value="lot">Lot</option>
                  <option value="sac">Sac</option>
                  <option value="plateau">Plateau</option>
                </select>
              </div>
            </div>

            {/* Budget max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget maximum (FCFA)
              </label>
              <Input
                type="number"
                value={formData.max_price}
                onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                placeholder="Ex: 500000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide si vous n'avez pas de budget défini
              </p>
            </div>

            {/* Lieu de livraison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lieu de livraison
              </label>
              <Input
                type="text"
                value={formData.delivery_location}
                onChange={(e) => setFormData({ ...formData, delivery_location: e.target.value })}
                placeholder="Ex: Marché Sandaga, Dakar"
              />
            </div>

            {/* Date limite */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date limite souhaitée
              </label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez vos besoins en détail (qualité souhaitée, spécifications, etc.)"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Link href="/dashboard/distributor/requests" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving || !formData.category_id || !formData.quantity_needed}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
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
