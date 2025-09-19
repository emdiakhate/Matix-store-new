-- Fonction pour créer une offre de producteur
-- Cette fonction permet aux producteurs de faire des offres sur les demandes des distributeurs

CREATE OR REPLACE FUNCTION create_producer_offer(
    p_request_id UUID,
    p_producer_id UUID,
    p_price_per_unit DECIMAL(10,2),
    p_available_quantity INTEGER,
    p_delivery_time_days INTEGER,
    p_message TEXT DEFAULT NULL
)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
    v_result JSON;
    v_total_price DECIMAL(12,2);
    v_offer_id UUID;
    v_request_data RECORD;
BEGIN
    -- Vérifier que la demande existe et est active
    SELECT * INTO v_request_data
    FROM distributor_requests
    WHERE id = p_request_id AND status = 'active';
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Demande non trouvée ou non active'
        );
    END IF;
    
    -- Calculer le prix total
    v_total_price := p_price_per_unit * p_available_quantity;
    
    -- Créer l'offre
    INSERT INTO producer_offers (
        request_id,
        producer_id,
        price_per_unit,
        total_price,
        available_quantity,
        delivery_time_days,
        message,
        status
    ) VALUES (
        p_request_id,
        p_producer_id,
        p_price_per_unit,
        v_total_price,
        p_available_quantity,
        p_delivery_time_days,
        p_message,
        'pending'
    ) RETURNING id INTO v_offer_id;
    
    -- Créer une notification pour le distributeur
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        is_read
    ) VALUES (
        v_request_data.distributor_id,
        'offer_received',
        'Nouvelle offre reçue',
        'Vous avez reçu une nouvelle offre pour votre demande "' || v_request_data.title || '"',
        json_build_object(
            'request_id', p_request_id,
            'offer_id', v_offer_id,
            'producer_id', p_producer_id,
            'request_title', v_request_data.title
        ),
        false
    );
    
    -- Retourner le résultat
    RETURN json_build_object(
        'success', true,
        'offer_id', v_offer_id,
        'total_price', v_total_price,
        'message', 'Offre créée avec succès'
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
SELECT create_producer_offer(
    'fd54c43b-a2c2-44bc-9acf-058e9a598d71'::UUID,
    'b9e68c20-60df-40d9-9a35-1df76838bc29'::UUID,
    1500.00,
    20,
    3,
    'Test offre via fonction RPC'
);
