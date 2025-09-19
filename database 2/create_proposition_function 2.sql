-- Fonction pour créer une proposition en contournant RLS
CREATE OR REPLACE FUNCTION create_proposition(
  p_distributor_id uuid,
  p_producer_id uuid,
  p_product_id uuid,
  p_proposed_price numeric,
  p_quantity integer,
  p_message text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_proposition_id uuid;
  v_product_name text;
  v_result json;
BEGIN
  -- Vérifier que le produit existe et appartient au producteur
  SELECT name INTO v_product_name
  FROM products
  WHERE id = p_product_id AND producer_id = p_producer_id;
  
  IF v_product_name IS NULL THEN
    RETURN json_build_object('error', 'Produit non trouvé ou ne correspond pas au producteur');
  END IF;
  
  -- Créer la proposition
  INSERT INTO propositions (
    distributor_id,
    producer_id,
    product_id,
    proposed_price,
    quantity,
    message
  ) VALUES (
    p_distributor_id,
    p_producer_id,
    p_product_id,
    p_proposed_price,
    p_quantity,
    p_message
  ) RETURNING id INTO v_proposition_id;
  
  -- Créer la notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data
  ) VALUES (
    p_producer_id,
    'proposition_received',
    'Nouvelle proposition reçue',
    'Vous avez reçu une nouvelle proposition pour ' || v_product_name,
    json_build_object(
      'proposition_id', v_proposition_id,
      'product_id', p_product_id,
      'distributor_id', p_distributor_id
    )
  );
  
  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'proposition_id', v_proposition_id,
    'message', 'Proposition créée avec succès'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;





