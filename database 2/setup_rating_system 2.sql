-- Système de Rating et Commentaires pour les produits
-- Création des tables et fonctions nécessaires

-- 1. Table pour les ratings des produits
CREATE TABLE IF NOT EXISTS product_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Contrainte d'unicité : un utilisateur ne peut noter qu'une fois le même produit
    UNIQUE(product_id, user_id)
);

-- 2. Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_user_id ON product_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_product_ratings_created_at ON product_ratings(created_at);

-- 3. Politiques RLS (Row Level Security)
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Allow read access to product ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to create their own ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to update their own ratings" ON product_ratings;
DROP POLICY IF EXISTS "Allow users to delete their own ratings" ON product_ratings;

-- Politique pour permettre la lecture des ratings
CREATE POLICY "Allow read access to product ratings" ON product_ratings
    FOR SELECT USING (true);

-- Politique pour permettre aux utilisateurs de créer leurs propres ratings
CREATE POLICY "Allow users to create their own ratings" ON product_ratings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de modifier leurs propres ratings
CREATE POLICY "Allow users to update their own ratings" ON product_ratings
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres ratings
CREATE POLICY "Allow users to delete their own ratings" ON product_ratings
    FOR DELETE USING (auth.uid() = user_id);

-- 4. Fonction pour calculer la note moyenne d'un produit
CREATE OR REPLACE FUNCTION get_product_average_rating(p_product_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
    v_avg_rating DECIMAL(3,2);
    v_total_ratings INTEGER;
BEGIN
    -- Calculer la note moyenne et le nombre total de ratings
    SELECT 
        ROUND(AVG(rating)::DECIMAL, 2),
        COUNT(*)
    INTO v_avg_rating, v_total_ratings
    FROM product_ratings
    WHERE product_id = p_product_id;

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'average_rating', COALESCE(v_avg_rating, 0),
        'total_ratings', COALESCE(v_total_ratings, 0)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 5. Fonction pour récupérer les ratings et commentaires d'un produit
CREATE OR REPLACE FUNCTION get_product_ratings(p_product_id UUID, p_limit INTEGER DEFAULT 10, p_offset INTEGER DEFAULT 0)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
    v_ratings JSON;
    v_avg_rating DECIMAL(3,2);
    v_total_ratings INTEGER;
BEGIN
    -- Calculer la note moyenne et le nombre total
    SELECT 
        ROUND(AVG(rating)::DECIMAL, 2),
        COUNT(*)
    INTO v_avg_rating, v_total_ratings
    FROM product_ratings
    WHERE product_id = p_product_id;

    -- Récupérer les ratings avec les informations utilisateur
    SELECT json_agg(
        json_build_object(
            'id', pr.id,
            'rating', pr.rating,
            'comment', pr.comment,
            'created_at', pr.created_at,
            'user', json_build_object(
                'id', u.id,
                'name', COALESCE(u.business_name, u.email),
                'avatar', u.avatar_url
            )
        ) ORDER BY pr.created_at DESC
    ) INTO v_ratings
    FROM product_ratings pr
    LEFT JOIN users u ON pr.user_id = u.id
    WHERE pr.product_id = p_product_id
    ORDER BY pr.created_at DESC
    LIMIT p_limit OFFSET p_offset;

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'average_rating', COALESCE(v_avg_rating, 0),
        'total_ratings', COALESCE(v_total_ratings, 0),
        'ratings', COALESCE(v_ratings, '[]'::json)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 6. Fonction pour créer ou mettre à jour un rating
CREATE OR REPLACE FUNCTION create_or_update_rating(
    p_product_id UUID,
    p_user_id UUID,
    p_rating INTEGER,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
    v_rating_id UUID;
BEGIN
    -- Vérifier que le rating est valide
    IF p_rating < 1 OR p_rating > 5 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Le rating doit être entre 1 et 5'
        );
    END IF;

    -- Insérer ou mettre à jour le rating
    INSERT INTO product_ratings (product_id, user_id, rating, comment)
    VALUES (p_product_id, p_user_id, p_rating, p_comment)
    ON CONFLICT (product_id, user_id)
    DO UPDATE SET
        rating = EXCLUDED.rating,
        comment = EXCLUDED.comment,
        updated_at = NOW()
    RETURNING id INTO v_rating_id;

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'rating_id', v_rating_id,
        'message', 'Rating créé/mis à jour avec succès'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 7. Fonction pour récupérer les ratings de tous les produits (pour la liste)
CREATE OR REPLACE FUNCTION get_all_products_ratings()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Récupérer les ratings de tous les produits
    SELECT json_agg(
        json_build_object(
            'product_id', p.id,
            'average_rating', COALESCE(avg_ratings.avg_rating, 0),
            'total_ratings', COALESCE(avg_ratings.total_ratings, 0)
        )
    ) INTO v_result
    FROM products p
    LEFT JOIN (
        SELECT 
            product_id,
            ROUND(AVG(rating)::DECIMAL, 2) as avg_rating,
            COUNT(*) as total_ratings
        FROM product_ratings
        GROUP BY product_id
    ) avg_ratings ON p.id = avg_ratings.product_id;

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'ratings', COALESCE(v_result, '[]'::json)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- 8. Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS update_product_ratings_updated_at ON product_ratings;

CREATE TRIGGER update_product_ratings_updated_at
    BEFORE UPDATE ON product_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Données de test (optionnel)
-- Insérer quelques ratings de test avec de vrais IDs de produits
-- Remplacer ces IDs par de vrais IDs de produits de votre base de données
-- INSERT INTO product_ratings (product_id, user_id, rating, comment) VALUES
--     ('real-product-id-1', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 5, 'Excellent produit, très satisfait de la qualité !'),
--     ('real-product-id-1', '303f243a-9129-4e94-8a6f-f8e247f0d15e', 4, 'Très bon produit, je recommande.'),
--     ('real-product-id-2', 'b9e68c20-60df-40d9-9a35-1df76838bc29', 3, 'Produit correct, mais peut être amélioré.')
-- ON CONFLICT (product_id, user_id) DO NOTHING;

-- Tester les fonctions (avec un ID de produit existant)
-- Remplacer par un vrai ID de produit de votre base de données
-- SELECT get_product_average_rating('real-product-id'::UUID);
-- SELECT get_product_ratings('real-product-id'::UUID, 5, 0);
SELECT get_all_products_ratings();
