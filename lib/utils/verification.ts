import { User } from '@/lib/types';

/**
 * Vérifie si un producteur est vérifié basé sur ses coordonnées GPS
 * @param user - L'objet utilisateur à vérifier
 * @returns boolean - true si le producteur est vérifié, false sinon
 */
export function isProducerVerified(user: User): boolean {
  if (!user) return false;
  
  // Vérifier si l'utilisateur est un producteur
  if (user.user_type !== 'producer') return false;
  
  // Vérifier si les coordonnées GPS existent et sont valides
  const hasValidCoordinates = 
    user.farm_latitude !== null && 
    user.farm_latitude !== undefined &&
    user.farm_longitude !== null && 
    user.farm_longitude !== undefined &&
    user.farm_latitude !== 0 &&
    user.farm_longitude !== 0;

  return hasValidCoordinates;
}

/**
 * Vérifie si un producteur a des coordonnées GPS valides
 * @param latitude - Latitude de la ferme
 * @param longitude - Longitude de la ferme
 * @returns boolean - true si les coordonnées sont valides, false sinon
 */
export function hasValidGPSCoordinates(latitude: number | null | undefined, longitude: number | null | undefined): boolean {
  if (latitude === null || latitude === undefined || longitude === null || longitude === undefined) {
    return false;
  }
  
  // Vérifier que les coordonnées sont dans des plages valides
  const isValidLatitude = latitude >= -90 && latitude <= 90;
  const isValidLongitude = longitude >= -180 && longitude <= 180;
  
  return isValidLatitude && isValidLongitude;
}

/**
 * Obtient le statut de vérification d'un producteur
 * @param user - L'objet utilisateur à vérifier
 * @returns string - "verified" | "unverified" | "not_producer"
 */
export function getProducerVerificationStatus(user: User): 'verified' | 'unverified' | 'not_producer' {
  if (!user) return 'unverified';
  
  if (user.user_type !== 'producer') return 'not_producer';
  
  return isProducerVerified(user) ? 'verified' : 'unverified';
}

