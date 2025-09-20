"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import AlertCard from '@/components/AlertCard';
import NotificationsSidebar from '@/components/NotificationsSidebar';
import CreateAlertModal, { NewAlertData } from '@/components/CreateAlertModal';
import { 
  Plus,
  Search,
  Filter,
  Bell
} from 'lucide-react';

interface Alert {
  id: string;
  name: string;
  criteria: string;
  category: string;
  priceRange?: number;
  stockMinimum?: number;
  distance: number;
  frequency: 'immediate' | 'daily' | 'weekly';
  status: 'active' | 'paused';
  matches: number;
  lastNotification: string;
  created_at: string;
}

interface Notification {
  id: string;
  type: 'match' | 'alert' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  alertName?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Données mockées
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        name: 'Poulets < 4000 FCFA',
        criteria: 'Poulets fermiers, qualité bio',
        category: 'Volailles & Viandes',
        priceRange: 4000,
        stockMinimum: 50,
        distance: 30,
        frequency: 'immediate',
        status: 'active',
      matches: 3,
        lastNotification: 'Il y a 2h',
        created_at: '2025-09-15'
      },
      {
        id: '2',
        name: 'Stock Œufs > 200',
        criteria: 'Œufs frais, catégorie A',
        category: 'Œufs & Reproduction',
        stockMinimum: 200,
        distance: 25,
        frequency: 'daily',
        status: 'active',
      matches: 1,
        lastNotification: 'Hier',
        created_at: '2025-09-14'
      },
      {
        id: '3',
        name: 'Équipements Neufs',
        criteria: 'Mangeoires, abreuvoirs automatiques',
        category: 'Équipements',
        priceRange: 15000,
        distance: 50,
        frequency: 'weekly',
        status: 'paused',
      matches: 0,
        lastNotification: 'Il y a 5j',
        created_at: '2025-09-10'
      },
      {
        id: '4',
        name: 'Aliments Bio',
        criteria: 'Aliments biologiques, sans OGM',
        category: 'Aliments Avicoles',
        priceRange: 8000,
        stockMinimum: 100,
        distance: 40,
        frequency: 'immediate',
        status: 'active',
        matches: 2,
        lastNotification: 'Il y a 1h',
        created_at: '2025-09-12'
      }
    ];

    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'match',
        title: 'Nouveau match trouvé !',
        message: '3 poulets fermiers correspondent à vos critères',
        time: 'Il y a 2h',
        isRead: false,
        alertName: 'Poulets < 4000 FCFA'
      },
      {
        id: '2',
        type: 'alert',
        title: 'Alerte activée',
        message: 'Votre alerte "Stock Œufs > 200" est maintenant active',
        time: 'Hier',
        isRead: true,
        alertName: 'Stock Œufs > 200'
      },
      {
        id: '3',
        type: 'match',
        title: 'Nouveau match trouvé !',
        message: '2 aliments bio disponibles dans votre zone',
        time: 'Il y a 1h',
        isRead: false,
        alertName: 'Aliments Bio'
      },
      {
        id: '4',
        type: 'system',
        title: 'Mise à jour système',
        message: 'Nouvelles fonctionnalités disponibles',
        time: 'Il y a 3j',
        isRead: true
      }
    ];

    setAlerts(mockAlerts);
    setNotifications(mockNotifications);
    setLoading(false);
  }, []);

  const handleCreateAlert = (alertData: NewAlertData) => {
    // Générer un ID unique pour la nouvelle alerte
    const newId = (alerts.length + 1).toString();
    
    // Créer la nouvelle alerte
    const newAlert: Alert = {
      id: newId,
      name: alertData.name,
      criteria: alertData.criteria,
      category: alertData.category,
      priceRange: alertData.priceRange,
      stockMinimum: alertData.stockMinimum,
      distance: alertData.distance,
      frequency: alertData.frequency,
      status: 'active',
      matches: 0,
      lastNotification: 'Maintenant',
      created_at: new Date().toISOString().split('T')[0]
    };

    // Ajouter la nouvelle alerte à la liste (optimistic update)
    setAlerts(prev => [newAlert, ...prev]);
    
    // Ajouter une notification
    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      type: 'alert',
      title: 'Alerte créée',
      message: `Votre alerte "${alertData.name}" a été créée avec succès`,
      time: 'Maintenant',
      isRead: false,
      alertName: alertData.name
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Animation d'apparition (simulée avec une classe CSS)
    setTimeout(() => {
      const newCard = document.querySelector(`[data-alert-id="${newId}"]`);
      if (newCard) {
        newCard.classList.add('animate-pulse-green');
        setTimeout(() => {
          newCard.classList.remove('animate-pulse-green');
        }, 2000);
      }
    }, 100);
  };

  const handleEditAlert = (alert: Alert) => {
    // TODO: Implémenter l'édition d'alerte
    console.log('Édition de l\'alerte:', alert);
  };

  const handleToggleStatus = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: alert.status === 'active' ? 'paused' : 'active',
              lastNotification: 'Maintenant'
            }
          : alert
      )
    );
  };

  const handleDeleteAlert = (alertId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const handleViewMatches = (alert: Alert) => {
    // TODO: Implémenter la vue des matches
    console.log('Voir les matches pour:', alert);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleClearAllNotifications = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  // Filtrage des alertes
  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
    if (searchTerm && !alert.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !alert.criteria.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active').length;
  const totalMatches = alerts.reduce((sum, a) => sum + a.matches, 0);
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (loading) {
  return (
      <DistributorLayout activePage="alerts">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </DistributorLayout>
    );
  }

  return (
    <DistributorLayout activePage="alerts">
      <div className="flex gap-6">
        {/* Zone principale des alertes */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
              <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Alertes Personnalisées</h1>
              <p className="text-gray-600 mt-1">
                {activeAlerts} alertes actives • {totalMatches} nouveaux matches
              </p>
            </div>
              <Button 
              onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
              <Plus className="w-5 h-5" />
                Créer Nouvelle Alerte
              </Button>
            </div>

          {/* Filtres et recherche */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                placeholder="Rechercher une alerte..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                />
              </div>
                <select 
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actives</option>
              <option value="paused">En pause</option>
                </select>
              </div>

          {/* Grille de cards pour les alertes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAlerts.map(alert => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onEdit={handleEditAlert}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeleteAlert}
                onViewMatches={handleViewMatches}
              />
            ))}
              </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune alerte trouvée</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucune alerte ne correspond à vos critères de recherche.'
                  : 'Créez votre première alerte pour recevoir des notifications personnalisées.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Créer ma première alerte
                </Button>
              )}
            </div>
          )}
      </div>

        {/* Sidebar notifications - plus compact */}
        <div className="w-80">
          <NotificationsSidebar
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onClearAll={handleClearAllNotifications}
          />
        </div>
      </div>

      {/* Modal de Création */}
      <CreateAlertModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAlert}
      />

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        .animate-pulse-green {
          animation: pulseGreen 2s ease-in-out;
        }
        
        @keyframes pulseGreen {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
          }
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #059669;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </DistributorLayout>
  );
}