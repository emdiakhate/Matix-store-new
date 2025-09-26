"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import GeolocationComponent from '@/components/GeolocationComponent';
import LeafletMap from '@/components/LeafletMap';
import { useProducerVerification } from '@/lib/hooks/useProducerVerification';
import { Save } from 'lucide-react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  region?: string;
}

export default function GeolocationPage() {
  const [deliverySettings, setDeliverySettings] = useState({
    maxRadius: '25',
    costPerKm: '200'
  });

  const [availability, setAvailability] = useState({
    days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    startTime: '08:00',
    endTime: '18:00'
  });

  const [currentLocation, setCurrentLocation] = useState<GeolocationData | null>(null);
  
  // Hook pour la vérification du producteur
  const { refreshVerification } = useProducerVerification('demo-producer-id');

  const handleLocationUpdate = (data: GeolocationData) => {
    setCurrentLocation(data);
    console.log('Position GPS mise à jour:', data);
  };

  const handleSaveLocation = async (data: GeolocationData & { farmName: string; farmAddress: string; region: string }) => {
    try {
      // Ici vous pouvez ajouter l'appel à votre service Supabase
      console.log('Sauvegarde des données de géolocalisation:', data);
      
      // Simulation d'une sauvegarde en base
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implémenter la sauvegarde en base Supabase
      // await supabase
      //   .from('users')
      //   .update({
      //     farm_latitude: data.latitude,
      //     farm_longitude: data.longitude,
      //     location_accuracy: data.accuracy,
      //     farm_address: data.farmAddress,
      //     farm_name: data.farmName,
      //     region: data.region
      //   })
      //   .eq('id', userId);
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleSaveSettings = async () => {
    const settingsData = {
      delivery: deliverySettings,
      availability: availability
    };

    console.log('Sauvegarde des paramètres:', settingsData);
    
    // Simulation d'une sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert('Paramètres sauvegardés avec succès !');
  };

  const toggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  return (
    <ProducerLayout activePage="geolocation">
      <div className="space-y-6">
        {/* Composant de géolocalisation GPS */}
        <GeolocationComponent
          onLocationUpdate={handleLocationUpdate}
          onVerificationUpdate={refreshVerification}
        />

        {/* Carte interactive */}
        {currentLocation && (
          <LeafletMap
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            farmName="Votre ferme"
            address={currentLocation.address}
          />
        )}

        {/* Paramètres de livraison */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Zone de livraison</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rayon de livraison maximum
              </label>
              <select 
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={deliverySettings.maxRadius}
                onChange={(e) => setDeliverySettings({
                  ...deliverySettings,
                  maxRadius: e.target.value
                })}
              >
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coût de livraison par kilomètre
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={deliverySettings.costPerKm}
                  onChange={(e) => setDeliverySettings({
                    ...deliverySettings,
                    costPerKm: e.target.value
                  })}
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">FCFA/km</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Horaires de disponibilité */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Horaires de livraison</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jours de livraison
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => (
                  <label key={jour} className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mr-2 text-green-600 focus:ring-green-500"
                      checked={availability.days.includes(jour)}
                      onChange={() => toggleDay(jour)}
                    />
                    <span className="text-sm">{jour}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début
                </label>
                <input 
                  type="time" 
                  value={availability.startTime}
                  onChange={(e) => setAvailability({
                    ...availability,
                    startTime: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin
                </label>
                <input 
                  type="time" 
                  value={availability.endTime}
                  onChange={(e) => setAvailability({
                    ...availability,
                    endTime: e.target.value
                  })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Bouton sauvegarder */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </ProducerLayout>
  );
}