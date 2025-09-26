-- Script pour ajouter les colonnes de géolocalisation à la table users
-- Exécuter ce script dans Supabase SQL Editor

-- Ajouter les colonnes de géolocalisation de la ferme
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS farm_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS farm_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_accuracy DECIMAL(8, 2),
ADD COLUMN IF NOT EXISTS farm_address TEXT,
ADD COLUMN IF NOT EXISTS farm_name TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Ajouter des commentaires pour documenter les colonnes
COMMENT ON COLUMN public.users.farm_latitude IS 'Latitude GPS de la ferme du producteur';
COMMENT ON COLUMN public.users.farm_longitude IS 'Longitude GPS de la ferme du producteur';
COMMENT ON COLUMN public.users.location_accuracy IS 'Précision de la localisation GPS en mètres';
COMMENT ON COLUMN public.users.farm_address IS 'Adresse complète de la ferme';
COMMENT ON COLUMN public.users.farm_name IS 'Nom de la ferme';
COMMENT ON COLUMN public.users.region IS 'Région où se trouve la ferme';

-- Créer un index pour optimiser les requêtes de géolocalisation
CREATE INDEX IF NOT EXISTS idx_users_farm_location 
ON public.users (farm_latitude, farm_longitude) 
WHERE farm_latitude IS NOT NULL AND farm_longitude IS NOT NULL;

-- Créer un index pour les recherches par région
CREATE INDEX IF NOT EXISTS idx_users_region 
ON public.users (region) 
WHERE region IS NOT NULL;

-- Ajouter des contraintes de validation
ALTER TABLE public.users 
ADD CONSTRAINT check_farm_latitude 
CHECK (farm_latitude IS NULL OR (farm_latitude >= -90 AND farm_latitude <= 90));

ALTER TABLE public.users 
ADD CONSTRAINT check_farm_longitude 
CHECK (farm_longitude IS NULL OR (farm_longitude >= -180 AND farm_longitude <= 180));

ALTER TABLE public.users 
ADD CONSTRAINT check_location_accuracy 
CHECK (location_accuracy IS NULL OR location_accuracy >= 0);

-- Mettre à jour les politiques RLS si nécessaire
-- (Les politiques existantes devraient déjà couvrir ces colonnes)

-- Exemple de données de test (optionnel)
-- UPDATE public.users 
-- SET 
--   farm_latitude = 14.6928,
--   farm_longitude = -17.4467,
--   location_accuracy = 5.0,
--   farm_address = 'Route de Rufisque, Pikine, Dakar',
--   farm_name = 'Ferme Avicole de Dakar',
--   region = 'Dakar'
-- WHERE user_type = 'producer' AND id = 'your-user-id-here';
