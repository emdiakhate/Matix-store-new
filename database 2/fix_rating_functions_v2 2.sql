-- Script pour corriger la fonction get_product_ratings
-- Corrige l'erreur de colonne email qui n'existe pas

-- Recréer la fonction get_product_ratings avec la correction
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
                'name', COALESCE(u.business_name, 'Utilisateur'),
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
