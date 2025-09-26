'use client';

import { useState, useEffect } from 'react';
import { userService } from '../services';
import { geocodingService, formatAddress } from '../geocoding';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
  city?: string;
  region?: string;
}

interface FarmLocationData {
  farmName: string;
  farmAddress: string;
  region: string;
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: GeolocationData | null;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  isSaving: boolean;
  getCurrentLocation: () => void;
  saveFarmLocation: (data: FarmLocationData) => Promise<void>;
  clearMessages: () => void;
}

export function useGeolocation(userId?: string): UseGeolocationReturn {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };

        // Géocodage inverse pour obtenir l'adresse
        try {
          const geocodingResult = await geocodingService.reverseGeocode(
            position.coords.latitude, 
            position.coords.longitude
          );
          
          if (geocodingResult) {
            locationData.address = formatAddress(geocodingResult);
            locationData.city = geocodingResult.city;
            // Utiliser la région retournée par l'API Nominatim, ou la ville si la région n'est pas disponible
            locationData.region = geocodingResult.region || geocodingResult.city || 'Région non détectée';
          }
        } catch (error) {
          console.error('Erreur lors du géocodage inverse:', error);
        }

        setLocation(locationData);
        setSuccess('Position GPS récupérée avec succès !');
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Permission de géolocalisation refusée. Veuillez autoriser l\'accès à votre position dans les paramètres de votre navigateur.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Position indisponible. Vérifiez que votre GPS est activé et que vous êtes en extérieur.');
            break;
          case error.TIMEOUT:
            setError('Délai d\'attente dépassé. Veuillez réessayer.');
            break;
          default:
            setError('Une erreur inconnue s\'est produite lors de la récupération de votre position.');
            break;
        }
      },
      options
    );
  };

  const saveFarmLocation = async (data: FarmLocationData) => {
    if (!userId) {
      // Mode démo : simuler la sauvegarde et stocker en localStorage
      setIsSaving(true);
      setError(null);

      try {
        // Simulation d'une sauvegarde
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sauvegarder les données en localStorage pour le mode démo
        const locationData = {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          farmName: data.farmName,
          farmAddress: data.farmAddress,
          region: data.region,
          timestamp: Date.now()
        };
        
        localStorage.setItem('demo-farm-location', JSON.stringify(locationData));
        
        // Émettre un événement personnalisé pour notifier la mise à jour
        window.dispatchEvent(new CustomEvent('farmLocationUpdated', { 
          detail: locationData 
        }));
        
        setSuccess('Informations de la ferme sauvegardées avec succès ! (Mode démo)');
      } catch (err: any) {
        setError('Erreur lors de la sauvegarde. Veuillez réessayer.');
        console.error('Erreur de sauvegarde:', err);
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: result, error } = await userService.updateFarmLocation(userId, {
        farm_latitude: data.latitude,
        farm_longitude: data.longitude,
        location_accuracy: data.accuracy,
        farm_address: data.farmAddress,
        farm_name: data.farmName,
        region: data.region
      });

      if (error) {
        throw error;
      }

      setSuccess('Informations de la ferme sauvegardées avec succès !');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde. Veuillez réessayer.');
      console.error('Erreur de sauvegarde:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Charger la géolocalisation existante au montage du composant
  useEffect(() => {
    const loadExistingLocation = async () => {
      if (!userId) return;

      try {
        const { data, error } = await userService.getFarmLocation(userId);
        
        if (error) {
          console.error('Erreur lors du chargement de la géolocalisation:', error);
          return;
        }

        if (data && data.farm_latitude && data.farm_longitude) {
          setLocation({
            latitude: data.farm_latitude,
            longitude: data.farm_longitude,
            accuracy: data.location_accuracy || 0,
            timestamp: Date.now()
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement de la géolocalisation:', err);
      }
    };

    loadExistingLocation();
  }, [userId]);

  return {
    location,
    isLoading,
    error,
    success,
    isSaving,
    getCurrentLocation,
    saveFarmLocation,
    clearMessages
  };
}
