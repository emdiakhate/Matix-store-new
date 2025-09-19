-- Script pour ajouter des données de test avec de vrais IDs de produits
-- Basé sur les IDs retournés par l'API

-- Insérer des ratings de test avec de vrais IDs de produits
INSERT INTO product_ratings (product_id, user_id, rating, comment) VALUES
    -- Produit 1: cac4b206-2498-409e-86e1-30c907b73686
    ('cac4b206-2498-409e-86e1-30c907b73686', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 5, 'Excellent produit, très satisfait de la qualité !'),
    ('cac4b206-2498-409e-86e1-30c907b73686', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Très bon produit, je recommande.'),
    
    -- Produit 2: 7200b0b0-1a5b-4982-a4af-375bd1dbc956
    ('7200b0b0-1a5b-4982-a4af-375bd1dbc956', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 4, 'Bon rapport qualité-prix.'),
    ('7200b0b0-1a5b-4982-a4af-375bd1dbc956', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 5, 'Produit de qualité supérieure !'),
    
    -- Produit 3: d4b29f74-8ae4-4e7e-bce6-7c59e44f65b3
    ('d4b29f74-8ae4-4e7e-bce6-7c59e44f65b3', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 3, 'Produit correct, mais peut être amélioré.'),
    ('d4b29f74-8ae4-4e7e-bce6-7c59e44f65b3', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Satisfait de mon achat.'),
    
    -- Produit 4: 811123a6-5420-4851-b165-85ad7ef26efa
    ('811123a6-5420-4851-b165-85ad7ef26efa', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 2, 'Pas satisfait, produit décevant.'),
    ('811123a6-5420-4851-b165-85ad7ef26efa', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Correct, mais il y a mieux.'),
    
    -- Produit 5: ee7ffce9-6158-431e-a9d7-7c987cbc8b45
    ('ee7ffce9-6158-431e-a9d7-7c987cbc8b45', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 5, 'Parfait ! Exactement ce que je cherchais.'),
    ('ee7ffce9-6158-431e-a9d7-7c987cbc8b45', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Très bon produit, livraison rapide.')
ON CONFLICT (product_id, user_id) DO NOTHING;

-- Tester les fonctions avec de vrais IDs
SELECT get_product_average_rating('cac4b206-2498-409e-86e1-30c907b73686'::UUID);
SELECT get_product_ratings('cac4b206-2498-409e-86e1-30c907b73686'::UUID, 5, 0);
SELECT get_all_products_ratings();
