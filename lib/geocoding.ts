// Service de géocodage inverse pour convertir les coordonnées GPS en adresse

interface GeocodingResult {
  address: string;
  city: string;
  region: string;
  country: string;
  formatted_address: string;
}

// Service de géocodage utilisant l'API Nominatim (OpenStreetMap)
export const geocodingService = {
  // Géocodage inverse : coordonnées -> adresse
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'MATIX-MART/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage inverse');
      }

      const data = await response.json();
      
      if (!data || !data.display_name) {
        return null;
      }

      // Extraire les informations de l'adresse
      const address = data.address || {};
      
      return {
        address: address.road || address.hamlet || address.village || '',
        city: address.city || address.town || address.municipality || address.county || '',
        region: address.state || address.region || '',
        country: address.country || '',
        formatted_address: data.display_name
      };
    } catch (error) {
      console.error('Erreur de géocodage inverse:', error);
      return null;
    }
  },

  // Géocodage direct : adresse -> coordonnées
  async geocode(address: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'MATIX-MART/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage');
      }

      const data = await response.json();
      
      if (!data || data.length === 0) {
        return null;
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      return null;
    }
  }
};

// Fonction utilitaire pour formater l'adresse
export const formatAddress = (result: GeocodingResult): string => {
  const parts = [
    result.address,
    result.city,
    result.region,
    result.country
  ].filter(Boolean);
  
  return parts.join(', ');
};

// Fonction pour déterminer la région du Sénégal basée sur les coordonnées
export const getSenegalRegion = (latitude: number, longitude: number): string => {
  // Coordonnées approximatives des régions du Sénégal
  const regions = [
    { name: 'Dakar', lat: 14.6928, lng: -17.4467, radius: 50 },
    { name: 'Thiès', lat: 14.7886, lng: -16.9260, radius: 80 },
    { name: 'Saint-Louis', lat: 16.0179, lng: -16.4896, radius: 60 },
    { name: 'Diourbel', lat: 14.6558, lng: -16.2306, radius: 70 },
    { name: 'Louga', lat: 15.6186, lng: -16.2246, radius: 80 },
    { name: 'Fatick', lat: 14.3390, lng: -16.4110, radius: 70 },
    { name: 'Kaolack', lat: 14.1519, lng: -16.0726, radius: 80 },
    { name: 'Kaffrine', lat: 14.1059, lng: -15.5418, radius: 70 },
    { name: 'Tambacounda', lat: 13.7689, lng: -13.6673, radius: 100 },
    { name: 'Kédougou', lat: 12.5556, lng: -12.1806, radius: 80 },
    { name: 'Kolda', lat: 12.8837, lng: -14.9506, radius: 80 },
    { name: 'Sédhiou', lat: 12.7081, lng: -15.5569, radius: 70 },
    { name: 'Ziguinchor', lat: 12.5833, lng: -16.2719, radius: 80 },
    { name: 'Matam', lat: 15.6559, lng: -13.2554, radius: 80 }
  ];

  // Calculer la distance et trouver la région la plus proche
  let closestRegion = regions[0];
  let minDistance = calculateDistance(latitude, longitude, regions[0].lat, regions[0].lng);

  for (const region of regions) {
    const distance = calculateDistance(latitude, longitude, region.lat, region.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = region;
    }
  }

  // Vérifier si la distance est dans le rayon acceptable
  if (minDistance <= closestRegion.radius) {
    return closestRegion.name;
  }

  return 'Dakar'; // Par défaut
};

// Fonction pour calculer la distance entre deux points (formule de Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
