-- Script de nettoyage pour supprimer complètement le système de rating
-- À utiliser en cas de problème ou pour recommencer

-- 1. Supprimer les triggers
DROP TRIGGER IF EXISTS update_product_ratings_updated_at ON product_ratings;

-- 2. Supprimer les fonctions
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS get_product_average_rating(UUID);
DROP FUNCTION IF EXISTS get_product_ratings(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS create_or_update_rating(UUID, UUID, INTEGER, TEXT);
DROP FUNCTION IF EXISTS get_all_products_ratings();

-- 3. Supprimer les politiques RLS
DROP POLICY IF EXISTS "Allow read access to product ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to create their own ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to update their own ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to delete their own ratings" ON product_ratings;

-- 4. Désactiver RLS
ALTER TABLE product_ratings DISABLE ROW LEVEL SECURITY;

-- 5. Supprimer les index
DROP INDEX IF EXISTS idx_product_ratings_product_id;
DROP INDEX IF EXISTS idx_product_ratings_user_id;
DROP INDEX IF EXISTS idx_product_ratings_created_at;

-- 6. Supprimer la table (ATTENTION: cela supprimera toutes les données)
-- DROP TABLE IF EXISTS product_ratings;

-- Note: Décommentez la ligne ci-dessus seulement si vous voulez supprimer complètement la table
-- et toutes les données de rating existantes
