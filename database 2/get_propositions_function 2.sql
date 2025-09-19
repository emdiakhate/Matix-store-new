-- Fonction pour récupérer les propositions reçues
CREATE OR REPLACE FUNCTION get_received_propositions(
  p_producer_id uuid,
  p_status text DEFAULT 'all'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_propositions json;
BEGIN
  -- Récupérer les propositions avec les données jointes
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'distributor_id', p.distributor_id,
      'producer_id', p.producer_id,
      'product_id', p.product_id,
      'proposed_price', p.proposed_price,
      'quantity', p.quantity,
      'message', p.message,
      'status', p.status,
      'expires_at', p.expires_at,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'responded_at', p.responded_at,
      'response_message', p.response_message,
      'product', json_build_object(
        'id', prod.id,
        'name', prod.name,
        'description', prod.description,
        'price', prod.price,
        'unit_type', prod.unit_type,
        'stock_quantity', prod.stock_quantity,
        'images', prod.images
      ),
      'distributor', json_build_object(
        'id', u.id,
        'business_name', u.business_name,
        'email', u.email,
        'phone', u.phone,
        'is_verified', u.is_verified
      )
    )
  ) INTO v_propositions
  FROM propositions p
  LEFT JOIN products prod ON p.product_id = prod.id
  LEFT JOIN users u ON p.distributor_id = u.id
  WHERE p.producer_id = p_producer_id
    AND (p_status = 'all' OR p.status = p_status)
  ORDER BY p.created_at DESC;
  
  RETURN COALESCE(v_propositions, '[]'::json);
END;
$$;

-- Fonction pour récupérer les propositions envoyées
CREATE OR REPLACE FUNCTION get_sent_propositions(
  p_distributor_id uuid,
  p_status text DEFAULT 'all'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_propositions json;
BEGIN
  -- Récupérer les propositions avec les données jointes
  SELECT json_agg(
    json_build_object(
      'id', p.id,
      'distributor_id', p.distributor_id,
      'producer_id', p.producer_id,
      'product_id', p.product_id,
      'proposed_price', p.proposed_price,
      'quantity', p.quantity,
      'message', p.message,
      'status', p.status,
      'expires_at', p.expires_at,
      'created_at', p.created_at,
      'updated_at', p.updated_at,
      'responded_at', p.responded_at,
      'response_message', p.response_message,
      'product', json_build_object(
        'id', prod.id,
        'name', prod.name,
        'description', prod.description,
        'price', prod.price,
        'unit_type', prod.unit_type,
        'stock_quantity', prod.stock_quantity,
        'images', prod.images
      ),
      'producer', json_build_object(
        'id', u.id,
        'business_name', u.business_name,
        'email', u.email,
        'phone', u.phone,
        'is_verified', u.is_verified
      )
    )
  ) INTO v_propositions
  FROM propositions p
  LEFT JOIN products prod ON p.product_id = prod.id
  LEFT JOIN users u ON p.producer_id = u.id
  WHERE p.distributor_id = p_distributor_id
    AND (p_status = 'all' OR p.status = p_status)
  ORDER BY p.created_at DESC;
  
  RETURN COALESCE(v_propositions, '[]'::json);
END;
$$;





