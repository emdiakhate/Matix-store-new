-- Script pour corriger les permissions RLS sur les tables propositions et notifications

-- 1. Vérifier l'état actuel des politiques RLS
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('propositions', 'notifications')
ORDER BY tablename, policyname;

-- 2. Supprimer toutes les politiques existantes pour les recréer
DROP POLICY IF EXISTS "Users can view their own propositions" ON propositions;
DROP POLICY IF EXISTS "Users can create propositions" ON propositions;
DROP POLICY IF EXISTS "Users can update their own propositions" ON propositions;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;

-- 3. Recréer les politiques RLS pour propositions
CREATE POLICY "Users can view their own propositions" ON propositions
  FOR SELECT
  USING (
    auth.uid() = distributor_id OR 
    auth.uid() = producer_id
  );

CREATE POLICY "Users can create propositions" ON propositions
  FOR INSERT
  WITH CHECK (
    auth.uid() = distributor_id
  );

CREATE POLICY "Users can update their own propositions" ON propositions
  FOR UPDATE
  USING (
    auth.uid() = producer_id
  )
  WITH CHECK (
    auth.uid() = producer_id
  );

-- 4. Recréer les politiques RLS pour notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can create notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- 5. Vérifier que les politiques ont été créées
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('propositions', 'notifications')
ORDER BY tablename, policyname;

-- 6. Test d'insertion avec un utilisateur mock (pour les tests)
-- Note: En production, cela devrait être fait avec un vrai utilisateur authentifié
INSERT INTO propositions (
  distributor_id, 
  producer_id, 
  product_id, 
  proposed_price, 
  quantity, 
  message
) VALUES (
  'b9e68c20-60df-40d9-9a35-1df76838bc29',
  '267060b0-13d5-4fa9-a414-dbc1e533f05b',
  '9105134f-e9c6-4c72-b2ec-b5593f3e9219',
  4500,
  10,
  'Test proposition directe'
) ON CONFLICT DO NOTHING;

-- 7. Vérifier que l'insertion a fonctionné
SELECT * FROM propositions 
WHERE distributor_id = 'b9e68c20-60df-40d9-9a35-1df76838bc29'
ORDER BY created_at DESC
LIMIT 1;





