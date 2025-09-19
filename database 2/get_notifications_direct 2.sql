-- Script pour récupérer directement les notifications
-- Utilisez ce script pour tester la récupération des notifications

SELECT 
  n.id,
  n.user_id,
  n.type,
  n.title,
  n.message,
  n.data,
  n.is_read,
  n.created_at,
  u.business_name as user_name
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
WHERE n.user_id = '267060b0-13d5-4fa9-a414-dbc1e533f05b'
ORDER BY n.created_at DESC
LIMIT 10;





