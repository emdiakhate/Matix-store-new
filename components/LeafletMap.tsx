'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface LeafletMapProps {
  latitude: number;
  longitude: number;
  farmName?: string;
  address?: string;
}

export default function LeafletMap({ latitude, longitude, farmName, address }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapRef.current) return;

    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Charger Leaflet dynamiquement
        const L = (await import('leaflet')).default as any;

        // Importer les images de marqueurs
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        // Créer la carte
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);

        // Ajouter les tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Créer un marqueur personnalisé
        const farmIcon = L.divIcon({
          html: `
            <div style="
              background-color: #dc2626;
              width: 30px;
              height: 30px;
              border-radius: 50% 50% 50% 0;
              border: 3px solid white;
              transform: rotate(-45deg);
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">
              <div style="
                transform: rotate(45deg);
                color: white;
                font-size: 14px;
                font-weight: bold;
              ">🏠</div>
            </div>
          `,
          className: 'custom-farm-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
          popupAnchor: [0, -30],
        });

        // Ajouter le marqueur
        const marker = L.marker([latitude, longitude], { icon: farmIcon }).addTo(map);

        // Ajouter le popup
        const popupContent = `
          <div style="padding: 8px;">
            <h4 style="font-weight: 600; color: #111827; margin-bottom: 4px;">
              ${farmName || 'Votre ferme'}
            </h4>
            ${address ? `<p style="font-size: 14px; color: #4b5563; margin-bottom: 8px;">${address}</p>` : ''}
            <p style="font-size: 12px; color: #6b7280;">
              Coordonnées: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}
            </p>
          </div>
        `;
        marker.bindPopup(popupContent);

        // Désactiver les interactions
        map.dragging.disable();
        map.touchZoom.disable();
        map.doubleClickZoom.disable();
        map.scrollWheelZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();

        mapInstance.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error("Erreur lors de l'initialisation de la carte:", err);
        setError('Erreur lors du chargement de la carte');
        setIsLoading(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [isClient, latitude, longitude, farmName, address]);

  // Ne pas rendre sur le serveur
  if (!isClient) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Position de votre ferme sur la carte
        </h3>
        <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Chargement de la carte...</span>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Position de votre ferme sur la carte
        </h3>

        <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">{farmName || 'Votre ferme'}</h4>
            {address && <p className="text-sm text-gray-600 mb-2">{address}</p>}
            <p className="text-xs text-gray-500">
              Coordonnées: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
            <p className="text-xs text-red-400 mt-2">{error}</p>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500 text-center">
          Position GPS confirmée • Carte interactive en cours de chargement
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-green-600" />
        Position de votre ferme sur la carte
      </h3>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Initialisation de la carte...</span>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="h-[300px] rounded-lg border border-gray-200"
          style={{ minHeight: '300px' }}
        />
      </div>

      <div className="mt-3 text-xs text-gray-500 text-center">
        Carte en lecture seule • Données fournies par OpenStreetMap
      </div>
    </Card>
  );
}
