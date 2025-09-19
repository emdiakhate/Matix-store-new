-- Migration pour Supabase : Adapter la table products aux champs du formulaire
-- À exécuter dans l'éditeur SQL de Supabase

-- Étape 1: Supprimer les anciens champs qui ne correspondent plus au formulaire
ALTER TABLE public.products 
DROP COLUMN IF EXISTS title_fr,
DROP COLUMN IF EXISTS title_wo,
DROP COLUMN IF EXISTS description_fr,
DROP COLUMN IF EXISTS description_wo,
DROP COLUMN IF EXISTS sale_price,
DROP COLUMN IF EXISTS cost_price,
DROP COLUMN IF EXISTS discount_percentage,
DROP COLUMN IF EXISTS harvest_date,
DROP COLUMN IF EXISTS expiry_date,
DROP COLUMN IF EXISTS is_organic,
DROP COLUMN IF EXISTS is_local_breed,
DROP COLUMN IF EXISTS retail_price,
DROP COLUMN IF EXISTS location_coordinates;

-- Étape 2: Renommer les champs existants pour correspondre au formulaire
ALTER TABLE public.products 
RENAME COLUMN title TO name;

-- Étape 3: Ajouter les nouveaux champs du formulaire
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS specific_type TEXT, -- Type Spécifique (Ex: Poulet de chair, Pondeuses, etc.)
ADD COLUMN IF NOT EXISTS breed_race TEXT, -- Race/Souche
ADD COLUMN IF NOT EXISTS average_weight_kg NUMERIC, -- Poids Moyen en kg
ADD COLUMN IF NOT EXISTS is_vaccinated BOOLEAN DEFAULT false, -- Vaccination Oui/Non
ADD COLUMN IF NOT EXISTS vaccination_details TEXT, -- Détails vaccination (optionnel)
ADD COLUMN IF NOT EXISTS availability_date DATE, -- Date de Disponibilité
ADD COLUMN IF NOT EXISTS sale_end_date DATE, -- Date Limite de Vente
ADD COLUMN IF NOT EXISTS minimum_order_quantity INTEGER DEFAULT 1, -- Quantité Minimum Commande
ADD COLUMN IF NOT EXISTS farm_address TEXT; -- Adresse de la Ferme

-- Étape 4: Ajouter une contrainte pour limiter les images à 5 maximum
DO $$
BEGIN
    -- Supprimer la contrainte si elle existe déjà
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_images_max_5') THEN
        ALTER TABLE public.products DROP CONSTRAINT products_images_max_5;
    END IF;
    
    -- Ajouter la nouvelle contrainte
    ALTER TABLE public.products 
    ADD CONSTRAINT products_images_max_5 CHECK (array_length(images, 1) <= 5 OR images IS NULL);
END $$;

-- Étape 5: Mettre à jour les contraintes NOT NULL
ALTER TABLE public.products
ALTER COLUMN age_weeks DROP NOT NULL,
ALTER COLUMN vaccination_status DROP NOT NULL;








