-- Migration pour adapter la table products aux champs du formulaire
-- Supprime les anciens champs et ajoute les nouveaux champs correspondant au formulaire

BEGIN;

-- Supprimer les anciens champs qui ne correspondent plus au formulaire
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

-- Renommer les champs existants pour correspondre au formulaire
ALTER TABLE public.products 
RENAME COLUMN title TO name;

-- Modifier les champs existants
ALTER TABLE public.products
ALTER COLUMN description SET NOT NULL,
ALTER COLUMN price SET NOT NULL,
ALTER COLUMN stock_quantity SET NOT NULL,
ALTER COLUMN available_quantity SET NOT NULL,
ALTER COLUMN age_weeks DROP NOT NULL,
ALTER COLUMN vaccination_status DROP NOT NULL;

-- Ajouter les nouveaux champs du formulaire
ALTER TABLE public.products
ADD COLUMN specific_type TEXT, -- Type Spécifique (Ex: Poulet de chair, Pondeuses, etc.)
ADD COLUMN breed_race TEXT, -- Race/Souche
ADD COLUMN average_weight_kg NUMERIC, -- Poids Moyen en kg
ADD COLUMN is_vaccinated BOOLEAN DEFAULT false, -- Vaccination Oui/Non
ADD COLUMN vaccination_details TEXT, -- Détails vaccination (optionnel)
ADD COLUMN availability_date DATE, -- Date de Disponibilité
ADD COLUMN sale_end_date DATE, -- Date Limite de Vente
ADD COLUMN minimum_order_quantity INTEGER DEFAULT 1, -- Quantité Minimum Commande
ADD COLUMN farm_address TEXT; -- Adresse de la Ferme

-- Ajouter des commentaires pour clarifier les champs
COMMENT ON COLUMN public.products.name IS 'Nom du produit (Ex: Poulet Fermier Bio Premium)';
COMMENT ON COLUMN public.products.specific_type IS 'Type spécifique (Ex: Poulet de chair, Pondeuses, Poussin 1 jour)';
COMMENT ON COLUMN public.products.description IS 'Description détaillée du produit (méthode d''élevage, alimentation, etc.)';
COMMENT ON COLUMN public.products.price IS 'Prix unitaire en FCFA';
COMMENT ON COLUMN public.products.distributor_price IS 'Prix distributeur en FCFA (prix de gros)';
COMMENT ON COLUMN public.products.stock_quantity IS 'Stock disponible';
COMMENT ON COLUMN public.products.unit_type IS 'Unité de mesure (pièce, kg, etc.)';
COMMENT ON COLUMN public.products.breed_race IS 'Race/Souche (Ex: ISA Brown, Ross 308, Locale...)';
COMMENT ON COLUMN public.products.age_weeks IS 'Âge en semaines (pour volailles)';
COMMENT ON COLUMN public.products.average_weight_kg IS 'Poids moyen en kilogrammes';
COMMENT ON COLUMN public.products.is_vaccinated IS 'Statut de vaccination (Oui/Non)';
COMMENT ON COLUMN public.products.vaccination_details IS 'Détails sur les vaccins administrés (optionnel)';
COMMENT ON COLUMN public.products.availability_date IS 'Date de disponibilité du produit';
COMMENT ON COLUMN public.products.sale_end_date IS 'Date limite de vente';
COMMENT ON COLUMN public.products.minimum_order_quantity IS 'Quantité minimum de commande';
COMMENT ON COLUMN public.products.farm_address IS 'Adresse de la ferme (Ex: Route de Rufisque, Sangalkam, Dakar)';
COMMENT ON COLUMN public.products.images IS 'Tableau d''URLs des images du produit (max 5 photos)';

-- Mettre à jour la contrainte sur les images pour limiter à 5 photos maximum
ALTER TABLE public.products 
ADD CONSTRAINT products_images_max_5 CHECK (array_length(images, 1) <= 5);

COMMIT;

-- Afficher la nouvelle structure de la table
\d public.products;








