'use client';

import { useState, useEffect } from 'react';
import { userService } from '@/lib/services';

interface ProducerVerificationData {
  farm_latitude: number | null;
  farm_longitude: number | null;
  location_accuracy: number | null;
}

export const useProducerVerification = (userId?: string) => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkVerification = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Mode démo : vérifier les données stockées localement
      if (userId === 'demo-producer-id' || userId === 'mock-user-id') {
        const savedLocation = localStorage.getItem('demo-farm-location');
        if (savedLocation) {
          const locationData = JSON.parse(savedLocation);
          const hasCoordinates = locationData.latitude && locationData.longitude;
          setIsVerified(hasCoordinates);
        } else {
          setIsVerified(false);
        }
        setIsLoading(false);
        return;
      }

      // Mode production : vérifier en base de données
      const { data, error: dbError } = await userService.getFarmLocation(userId);

      if (dbError) {
        throw new Error(dbError.message);
      }

      // Vérifier si les coordonnées GPS existent
      const hasCoordinates = !!(
        data &&
        data.farm_latitude !== null &&
        data.farm_longitude !== null &&
        data.farm_latitude !== undefined &&
        data.farm_longitude !== undefined
      );

      setIsVerified(hasCoordinates);
    } catch (err: any) {
      console.error('Erreur lors de la vérification:', err);
      setError(err.message || 'Erreur lors de la vérification');
      setIsVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshVerification = () => {
    if (userId) {
      checkVerification(userId);
    }
  };

  useEffect(() => {
    if (userId) {
      checkVerification(userId);
    }
  }, [userId]);

  // Écouter les changements dans localStorage pour le mode démo
  useEffect(() => {
    if (userId === 'demo-producer-id' || userId === 'mock-user-id') {
      const handleStorageChange = () => {
        checkVerification(userId);
      };

      const handleFarmLocationUpdate = () => {
        checkVerification(userId);
      };

      // Écouter les changements de localStorage
      window.addEventListener('storage', handleStorageChange);

      // Écouter l'événement personnalisé de mise à jour de la ferme
      window.addEventListener('farmLocationUpdated', handleFarmLocationUpdate);

      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('farmLocationUpdated', handleFarmLocationUpdate);
      };
    }
  }, [userId]);

  return {
    isVerified,
    isLoading,
    error,
    refreshVerification,
  };
};
