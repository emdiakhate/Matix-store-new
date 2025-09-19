-- Fonction pour récupérer les offres d'un producteur
-- Cette fonction permet aux producteurs de voir leurs offres

CREATE OR REPLACE FUNCTION get_producer_offers(p_producer_id UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
BEGIN
    -- Récupérer les offres du producteur avec les informations de la demande
    SELECT json_agg(
        json_build_object(
            'id', po.id,
            'request_id', po.request_id,
            'producer_id', po.producer_id,
            'price_per_unit', po.price_per_unit,
            'total_price', po.total_price,
            'available_quantity', po.available_quantity,
            'delivery_time_days', po.delivery_time_days,
            'message', po.message,
            'status', po.status,
            'created_at', po.created_at,
            'updated_at', po.updated_at,
            'request', json_build_object(
                'id', dr.id,
                'title', dr.title,
                'quantity', dr.quantity,
                'unit', dr.unit,
                'deadline', dr.deadline,
                'description', dr.description,
                'delivery_location', dr.delivery_location,
                'budget_max', dr.budget_max,
                'status', dr.status,
                'distributor_name', u.business_name
            )
        ) ORDER BY po.created_at DESC
    ) INTO v_result
    FROM producer_offers po
    LEFT JOIN distributor_requests dr ON po.request_id = dr.id
    LEFT JOIN users u ON dr.distributor_id = u.id
    WHERE po.producer_id = p_producer_id;

    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'offers', COALESCE(v_result, '[]'::json)
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
SELECT get_producer_offers('b9e68c20-60df-40d9-9a35-1df76838bc29'::UUID);
