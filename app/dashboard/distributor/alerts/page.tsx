"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { categoryService, alertService } from '@/lib/services';
import { formatCurrency } from '@/lib/bictorys';
import {
  Bell,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Alert {
  id: string;
  category_id: string | null;
  category_name?: string;
  keywords?: string | null;
  max_price?: number | null;
  min_quantity?: number | null;
  is_active: boolean;
  created_at: string;
  matches_count?: number;
}

interface Category {
  id: string;
  name: string;
}

export default function AlertsPage() {
  const router = useRouter();
  const { user, activeRole, loading: userLoading, isAuthenticated } = useMatixUser();
  const supabase = useSupabase();

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    keywords: '',
    max_price: '',
    min_quantity: ''
  });
  const [saving, setSaving] = useState(false);

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

      const [categoriesResult, alertsResult] = await Promise.all([
        categoryService.getAll(),
        supabase
          .from('distributor_alerts')
          .select(`
            id,
            category_id,
            keywords,
            max_price,
            min_quantity,
            is_active,
            created_at,
            category:categories(name)
          `)
          .eq('distributor_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data.map((c: any) => ({ id: c.id, name: c.name_fr || c.name })));
      }

      if (alertsResult.data) {
        setAlerts((alertsResult.data as any[]).map(alert => ({
          ...alert,
          category_name: alert.category?.name || alert.category?.name_fr || 'Toutes catégories'
        })));
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const alertData = {
        distributor_id: user.id,
        category_id: formData.category_id || null,
        keywords: formData.keywords || null,
        max_price: formData.max_price ? parseFloat(formData.max_price) : null,
        min_quantity: formData.min_quantity ? parseInt(formData.min_quantity) : null,
        is_active: true
      };

      if (editingAlert) {
        const { error } = await (supabase as any)
          .from('distributor_alerts')
          .update(alertData)
          .eq('id', editingAlert.id);

        if (!error) {
          setAlerts(alerts.map(a =>
            a.id === editingAlert.id
              ? {
                  ...a,
                  ...alertData,
                  category_name: categories.find(c => c.id === formData.category_id)?.name || 'Toutes catégories'
                }
              : a
          ));
        }
      } else {
        const { data, error } = await (supabase as any)
          .from('distributor_alerts')
          .insert(alertData)
          .select(`
            id,
            category_id,
            keywords,
            max_price,
            min_quantity,
            is_active,
            created_at,
            category:categories(name_fr)
          `)
          .single();

        if (data) {
          setAlerts([{
            ...data,
            category_name: data.category?.name_fr || 'Toutes catégories'
          }, ...alerts]);
        }
      }

      closeModal();
    } catch (error) {
      console.error('Erreur sauvegarde alerte:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (alertId: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('distributor_alerts')
        .update({ is_active: !currentStatus })
        .eq('id', alertId);

      if (!error) {
        setAlerts(alerts.map(a =>
          a.id === alertId ? { ...a, is_active: !currentStatus } : a
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Supprimer cette alerte ?')) return;

    try {
      const { error } = await supabase
        .from('distributor_alerts')
        .delete()
        .eq('id', alertId);

      if (!error) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const openEditModal = (alert: Alert) => {
    setEditingAlert(alert);
    setFormData({
      category_id: alert.category_id || '',
      keywords: alert.keywords || '',
      max_price: alert.max_price?.toString() || '',
      min_quantity: alert.min_quantity?.toString() || ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAlert(null);
    setFormData({
      category_id: '',
      keywords: '',
      max_price: '',
      min_quantity: ''
    });
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Alertes</h1>
            <p className="text-gray-600 mt-1">
              Recevez des notifications pour les offres correspondantes
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle alerte
          </Button>
        </div>

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte</h3>
            <p className="text-gray-500 mb-6">
              Créez une alerte pour être notifié des nouvelles offres
            </p>
            <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Créer une alerte
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">
                        {alert.keywords || alert.category_name}
                      </h3>
                      {alert.is_active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 space-y-1">
                      {alert.category_name && <p>Catégorie: {alert.category_name}</p>}
                      {alert.max_price && <p>Prix max: {formatCurrency(alert.max_price)}</p>}
                      {alert.min_quantity && <p>Quantité min: {alert.min_quantity}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(alert)}
                      className="text-blue-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(alert.id, alert.is_active)}
                      className={alert.is_active ? 'text-orange-600' : 'text-green-600'}
                    >
                      {alert.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingAlert ? 'Modifier l\'alerte' : 'Nouvelle alerte'}
                </h2>
                <Button variant="ghost" size="sm" onClick={closeModal}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mots-clés
                  </label>
                  <Input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="Ex: poulet fermier, bio..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix maximum (FCFA)
                  </label>
                  <Input
                    type="number"
                    value={formData.max_price}
                    onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
                    placeholder="Ex: 5000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantité minimum
                  </label>
                  <Input
                    type="number"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                    placeholder="Ex: 10"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
