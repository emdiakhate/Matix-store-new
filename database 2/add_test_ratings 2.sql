-- Script pour ajouter des données de test pour les ratings
-- À exécuter APRÈS avoir exécuté setup_rating_system.sql

-- 1. D'abord, récupérer les IDs des produits existants
-- Exécuter cette requête pour voir les produits disponibles :
-- SELECT id, name FROM products LIMIT 5;

-- 2. Remplacer les IDs ci-dessous par de vrais IDs de produits
-- Exemple avec des IDs fictifs (à remplacer par de vrais IDs) :

-- Insérer des ratings de test
INSERT INTO product_ratings (product_id, user_id, rating, comment) VALUES
    -- Remplacez 'REPLACE_WITH_REAL_PRODUCT_ID_1' par un vrai ID de produit
    ('REPLACE_WITH_REAL_PRODUCT_ID_1', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 5, 'Excellent produit, très satisfait de la qualité !'),
    ('REPLACE_WITH_REAL_PRODUCT_ID_1', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Très bon produit, je recommande.'),
    ('REPLACE_WITH_REAL_PRODUCT_ID_1', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 3, 'Produit correct, mais peut être amélioré.'),
    
    -- Ajouter des ratings pour d'autres produits
    ('REPLACE_WITH_REAL_PRODUCT_ID_2', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 4, 'Bon rapport qualité-prix.'),
    ('REPLACE_WITH_REAL_PRODUCT_ID_2', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 5, 'Produit de qualité supérieure !'),
    
    ('REPLACE_WITH_REAL_PRODUCT_ID_3', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 2, 'Pas satisfait, produit décevant.'),
    ('REPLACE_WITH_REAL_PRODUCT_ID_3', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Correct, mais il y a mieux.')
ON CONFLICT (product_id, user_id) DO NOTHING;

-- Tester les fonctions avec de vrais IDs
-- SELECT get_product_average_rating('REPLACE_WITH_REAL_PRODUCT_ID_1'::UUID);
-- SELECT get_product_ratings('REPLACE_WITH_REAL_PRODUCT_ID_1'::UUID, 5, 0);
-- SELECT get_all_products_ratings();
