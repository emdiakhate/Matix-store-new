"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import { 
  Plus,
  Edit,
  X
} from 'lucide-react';

export default function AlertsPage() {
  const [showModal, setShowModal] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: '',
    category: '',
    maxPrice: '',
    minStock: '',
    maxDistance: 50,
    frequency: 'immediate'
  });

  const alerts = [
    {
      name: "Poulets < 4000 FCFA",
      criteria: "Volailles, max 4000F, rayon 30km",
      lastNotification: "Il y a 2h",
      matches: 3,
      status: "Active"
    },
    {
      name: "Stock Œufs > 200",
      criteria: "Œufs, stock min 200, max 25km",
      lastNotification: "Hier",
      matches: 1,
      status: "Active"
    },
    {
      name: "Équipements Neufs",
      criteria: "Catégorie équipements, état neuf",
      lastNotification: "Il y a 5j",
      matches: 0,
      status: "Pause"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Active': 'bg-green-100 text-green-800',
      'Pause': 'bg-orange-100 text-orange-800',
      'Fermée': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Nouvelle alerte créée:', newAlert);
    setShowModal(false);
    setNewAlert({
      name: '',
      category: '',
      maxPrice: '',
      minStock: '',
      maxDistance: 50,
      frequency: 'immediate'
    });
  };

  return (
    <DistributorLayout activePage="alerts">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Alertes Personnalisées</h1>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus className="h-4 w-4" />
          Créer Nouvelle Alerte
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Tableau Alertes - 75% */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Nom Alerte</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Critères</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Dernière Notification</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Matches Trouvés</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{alert.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{alert.criteria}</td>
                      <td className="py-3 px-4 text-gray-600">{alert.lastNotification}</td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${alert.matches > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                          {alert.matches} {alert.matches > 0 ? 'nouveaux' : ''}
                        </span>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(alert.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-800">
                            {alert.status === 'Active' ? 'Pause' : 'Activer'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Panel Notifications - 25% */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Notifications Récentes</h3>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-1">3 nouveaux poulets</p>
                <p className="text-xs text-green-600">correspondent à vos critères</p>
                <Button size="sm" className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                  Voir matches
                </Button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 mb-1">Stock œufs bio</p>
                <p className="text-xs text-blue-600">disponible chez Ferme Diallo</p>
                <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs">
                  Contacter
                </Button>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm font-medium text-orange-800 mb-1">Nouveau équipement</p>
                <p className="text-xs text-orange-600">mangeoire automatique disponible</p>
                <Button size="sm" className="mt-2 bg-orange-600 hover:bg-orange-700 text-white text-xs">
                  Voir détails
                </Button>
              </div>
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-sm">
              Voir tous les matches
            </Button>
          </Card>
        </div>
      </div>

      {/* Modal Nouvelle Alerte */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Créer une Nouvelle Alerte</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateAlert} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'alerte
                </label>
                <Input
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                  placeholder="Ex: Poulets pas chers"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie produit
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={newAlert.category}
                  onChange={(e) => setNewAlert({...newAlert, category: e.target.value})}
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="volailles">Volailles</option>
                  <option value="equipements">Équipements</option>
                  <option value="aliments">Aliments</option>
                  <option value="soins">Soins</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix maximum (FCFA)
                </label>
                <Input
                  type="number"
                  value={newAlert.maxPrice}
                  onChange={(e) => setNewAlert({...newAlert, maxPrice: e.target.value})}
                  placeholder="Ex: 4000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock minimum requis
                </label>
                <Input
                  type="number"
                  value={newAlert.minStock}
                  onChange={(e) => setNewAlert({...newAlert, minStock: e.target.value})}
                  placeholder="Ex: 50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distance maximum: {newAlert.maxDistance} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={newAlert.maxDistance}
                  onChange={(e) => setNewAlert({...newAlert, maxDistance: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence notifications
                </label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                  value={newAlert.frequency}
                  onChange={(e) => setNewAlert({...newAlert, frequency: e.target.value})}
                  required
                >
                  <option value="immediate">Immédiate</option>
                  <option value="daily">Quotidienne</option>
                  <option value="weekly">Hebdomadaire</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Créer Alerte
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DistributorLayout>
  );
}
