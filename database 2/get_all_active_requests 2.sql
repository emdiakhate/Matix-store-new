-- Fonction pour récupérer toutes les demandes actives (pour les producteurs)
-- Cette fonction permet aux producteurs de voir toutes les opportunités disponibles

CREATE OR REPLACE FUNCTION get_all_requests_for_producers()
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Récupérer toutes les demandes actives avec les informations du distributeur
    SELECT json_agg(
        json_build_object(
            'id', dr.id,
            'title', dr.title,
            'category', CASE 
                WHEN c.id IS NOT NULL THEN json_build_object(
                    'id', c.id,
                    'name', c.name,
                    'name_fr', c.name_fr,
                    'icon', c.icon
                )
                ELSE NULL
            END,
            'quantity', dr.quantity,
            'weight', dr.weight,
            'unit', dr.unit,
            'deadline', dr.deadline,
            'description', dr.description,
            'delivery_location', dr.delivery_location,
            'budget_max', dr.budget_max,
            'status', dr.status,
            'created_at', dr.created_at,
            'updated_at', dr.updated_at,
            'distributor_id', dr.distributor_id,
            'distributor_name', u.business_name,
            'offers_count', COALESCE(offers_count.count, 0)
        ) ORDER BY dr.created_at DESC
    ) INTO v_result
    FROM distributor_requests dr
    LEFT JOIN users u ON dr.distributor_id = u.id
    LEFT JOIN categories c ON dr.category_id = c.id
    LEFT JOIN (
        SELECT 
            request_id,
            COUNT(*) as count
        FROM producer_offers
        GROUP BY request_id
    ) offers_count ON dr.id = offers_count.request_id
    WHERE dr.status = 'active';

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'requests', COALESCE(v_result, '[]'::json)
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Tester la fonction
SELECT get_all_requests_for_producers();

