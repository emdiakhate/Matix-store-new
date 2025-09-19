-- Test pour vérifier les notifications créées
SELECT 
  n.id,
  n.user_id,
  n.type,
  n.title,
  n.message,
  n.is_read,
  n.created_at,
  u.business_name as user_name
FROM notifications n
LEFT JOIN users u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 10;

-- Vérifier les propositions récentes
SELECT 
  p.id,
  p.distributor_id,
  p.producer_id,
  p.status,
  p.created_at,
  u1.business_name as distributor_name,
  u2.business_name as producer_name
FROM propositions p
LEFT JOIN users u1 ON p.distributor_id = u1.id
LEFT JOIN users u2 ON p.producer_id = u2.id
ORDER BY p.created_at DESC
LIMIT 5;





