'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { 
  MapPin, 
  Navigation, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  region?: string;
}

interface GeolocationComponentProps {
  userId?: string;
  onLocationUpdate?: (data: GeolocationData) => void;
  onVerificationUpdate?: () => void;
  initialData?: {
    farmName?: string;
    farmAddress?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  };
}

export default function GeolocationComponent({ 
  userId,
  onLocationUpdate,
  onVerificationUpdate,
  initialData 
}: GeolocationComponentProps) {
  const {
    location,
    isLoading,
    error,
    success,
    isSaving,
    getCurrentLocation,
    saveFarmLocation,
    clearMessages
  } = useGeolocation(userId);

  // Formulaire ferme
  const [farmData, setFarmData] = useState({
    farmName: initialData?.farmName || '',
    farmAddress: initialData?.farmAddress || '',
    region: initialData?.region || ''
  });

  const regions = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 
    'Fatick', 'Kaolack', 'Kaffrine', 'Tambacounda', 
    'Kédougou', 'Kolda', 'Sédhiou', 'Ziguinchor', 'Matam'
  ];

  const handleSave = async () => {
    if (!location) {
      return;
    }

    if (!farmData.farmName) {
      return;
    }

    try {
      await saveFarmLocation({
        ...location,
        farmName: farmData.farmName,
        farmAddress: farmData.farmAddress,
        region: farmData.region
      });
      
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
      
      // Rafraîchir le badge de vérification après sauvegarde réussie
      if (onVerificationUpdate) {
        // Délai pour s'assurer que localStorage est mis à jour
        setTimeout(() => {
          onVerificationUpdate();
        }, 100);
      }
    } catch (err) {
      console.error('Erreur de sauvegarde:', err);
    }
  };

  // Auto-remplir les champs avec les données GPS si disponibles
  const handleLocationUpdate = (newLocation: GeolocationData) => {
    setFarmData(prev => ({
      ...prev,
      // Toujours remplir l'adresse si disponible
      farmAddress: newLocation.address || prev.farmAddress,
      // Toujours remplir la région si disponible
      region: newLocation.region || prev.region
    }));
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const getAccuracyDescription = (accuracy: number) => {
    if (accuracy <= 5) return 'Très précise';
    if (accuracy <= 10) return 'Précise';
    if (accuracy <= 20) return 'Moyennement précise';
    return 'Peu précise';
  };

  // Auto-remplir les champs quand la localisation est récupérée
  useEffect(() => {
    if (location) {
      handleLocationUpdate(location);
    }
  }, [location]);

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📍 Géolocalisation de votre Ferme
        </h2>
        <p className="text-gray-600">
          Localisez précisément votre ferme pour permettre aux distributeurs de vous trouver facilement
        </p>
      </div>

      {/* Messages d'état */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Informations de la ferme */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Informations de votre ferme
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la ferme *
            </label>
            <input
              type="text"
              value={farmData.farmName}
              onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Ex: Ferme Avicole de Dakar"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Région *
            </label>
            <input
              type="text"
              value={farmData.region}
              readOnly
              className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
              placeholder="Région détectée automatiquement"
            />
            <p className="text-xs text-gray-500 mt-1">
              Remplie automatiquement lors de la localisation GPS
            </p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Adresse complète de la ferme *
          </label>
          <input
            type="text"
            value={farmData.farmAddress}
            readOnly
            className="w-full rounded-md border-gray-300 shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
            placeholder="Adresse détectée automatiquement"
          />
          <p className="text-xs text-gray-500 mt-1">
            Remplie automatiquement lors de la localisation GPS
          </p>
        </div>
      </Card>

      {/* Localisation GPS */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-600" />
          Localisation GPS
        </h3>

        <div className="text-center space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <AlertCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 text-sm">
              <strong>Important :</strong> Pour une localisation précise, assurez-vous d'être à l'extérieur 
              et d'avoir activé le GPS sur votre appareil.
            </p>
          </div>

          <Button
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Localisation en cours...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5 mr-2" />
                Localiser ma ferme
              </>
            )}
          </Button>
        </div>

        {/* Affichage des coordonnées */}
        {location && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Position GPS récupérée
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">Coordonnées :</span>
                <p className="text-green-600 font-mono">
                  {formatCoordinates(location.latitude, location.longitude)}
                </p>
              </div>
              
              <div>
                <span className="font-medium text-green-700">Précision :</span>
                <p className="text-green-600">
                  {location.accuracy.toFixed(1)}m ({getAccuracyDescription(location.accuracy)})
                </p>
              </div>
            </div>

            {location.address && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="font-medium text-blue-700">Adresse détectée :</span>
                <p className="text-blue-600 mt-1">{location.address}</p>
                {location.city && (
                  <p className="text-blue-500 text-sm mt-1">Ville: {location.city}</p>
                )}
              </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
              Heure: {new Date(location.timestamp).toLocaleString('fr-FR')}
            </div>
          </div>
        )}
      </Card>

      {/* Bouton de sauvegarde */}
      {location && (
        <div className="space-y-4">
          {/* Message d'aide si le bouton est désactivé */}
          {!farmData.farmName && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-700 text-sm">
                  <strong>Pour sauvegarder :</strong> Veuillez renseigner le nom de votre ferme.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={isSaving || !farmData.farmName}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Sauvegarder la position
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
