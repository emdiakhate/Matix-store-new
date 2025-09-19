-- Fonction RPC pour marquer une notification comme lue (même technique que create_proposition)
CREATE OR REPLACE FUNCTION mark_notification_read_rpc(
  p_notification_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  -- Marquer la notification comme lue
  UPDATE notifications 
  SET is_read = true 
  WHERE id = p_notification_id;
  
  -- Vérifier si la mise à jour a réussi
  IF FOUND THEN
    SELECT json_build_object(
      'success', true,
      'message', 'Notification marquée comme lue'
    ) INTO v_result;
  ELSE
    SELECT json_build_object(
      'success', false,
      'message', 'Notification non trouvée'
    ) INTO v_result;
  END IF;
  
  RETURN v_result;
END;
$$;

-- Fonction RPC pour marquer toutes les notifications comme lues
CREATE OR REPLACE FUNCTION mark_all_notifications_read_rpc(
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
  v_result json;
BEGIN
  -- Marquer toutes les notifications non lues comme lues
  UPDATE notifications 
  SET is_read = true 
  WHERE user_id = p_user_id AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  SELECT json_build_object(
    'success', true,
    'updated_count', v_count,
    'message', v_count || ' notifications marquées comme lues'
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;





