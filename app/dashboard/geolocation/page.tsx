"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import { Save } from 'lucide-react';

export default function GeolocationPage() {
  const [selectedLocation, setSelectedLocation] = useState({
    region: '',
    department: '',
    commune: '',
    details: ''
  });

  const [deliverySettings, setDeliverySettings] = useState({
    maxRadius: '25',
    costPerKm: '200'
  });

  const [availability, setAvailability] = useState({
    days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
    startTime: '08:00',
    endTime: '18:00'
  });

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 
    'Fatick', 'Kaolack', 'Kaffrine', 'Tambacounda', 
    'Kédougou', 'Kolda', 'Sédhiou', 'Ziguinchor', 'Matam'
  ];

  const departments = {
    'Dakar': ['Dakar', 'Pikine', 'Guédiawaye', 'Keur Massar'],
    'Thiès': ['Thiès', 'Mbour', 'Tivaouane'],
    'Saint-Louis': ['Saint-Louis', 'Dagana', 'Podor'],
    'Diourbel': ['Diourbel', 'Bambey', 'Mbacké'],
    'Louga': ['Louga', 'Kébémer', 'Linguère'],
    'Fatick': ['Fatick', 'Foundiougne', 'Gossas'],
    'Kaolack': ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
    'Kaffrine': ['Kaffrine', 'Birkilane', 'Malem Hodar'],
    'Tambacounda': ['Tambacounda', 'Bakel', 'Goudiry'],
    'Kédougou': ['Kédougou', 'Salémata', 'Saraya'],
    'Kolda': ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
    'Sédhiou': ['Sédhiou', 'Bounkiling', 'Goudomp'],
    'Ziguinchor': ['Ziguinchor', 'Bignona', 'Oussouye'],
    'Matam': ['Matam', 'Kanel', 'Ranérou Ferlo']
  };

  const handleSave = async () => {
    if (!selectedLocation.region || !selectedLocation.department) {
      alert('Veuillez sélectionner au moins la région et le département');
      return;
    }

    const locationData = {
      location: selectedLocation,
      delivery: deliverySettings,
      availability: availability
    };

    console.log('Sauvegarde des paramètres:', locationData);
    
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">📍 Géolocalisation</h1>
      </div>
            <div className="space-y-6">
              {/* Sélection de localisation */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sélectionnez votre localisation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Région */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Région *
                    </label>
                    <select 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      value={selectedLocation.region}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation, 
                        region: e.target.value,
                        department: '',
                        commune: ''
                      })}
                    >
                      <option value="">Sélectionner une région</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>

                  {/* Département */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Département *
                    </label>
                    <select 
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 disabled:bg-gray-100"
                      value={selectedLocation.department}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation, 
                        department: e.target.value,
                        commune: ''
                      })}
                      disabled={!selectedLocation.region}
                    >
                      <option value="">Sélectionner un département</option>
                      {selectedLocation.region && departments[selectedLocation.region as keyof typeof departments]?.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commune/Ville
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Ex: Dakar Plateau, Pikine, etc."
                      value={selectedLocation.commune}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation,
                        commune: e.target.value
                      })}
                    />
                  </div>

                  {/* Détails */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Détails (optionnel)
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      placeholder="Ex: Près du marché, Route de..."
                      value={selectedLocation.details}
                      onChange={(e) => setSelectedLocation({
                        ...selectedLocation,
                        details: e.target.value
                      })}
                    />
                  </div>
                </div>

                {/* Aperçu de l'adresse */}
                {selectedLocation.region && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800">Adresse de votre ferme:</h4>
                    <p className="text-green-700">
                      {[
                        selectedLocation.details,
                        selectedLocation.commune,
                        selectedLocation.department,
                        selectedLocation.region
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </Card>

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
                  onClick={handleSave}
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