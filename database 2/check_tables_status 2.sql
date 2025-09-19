-- Script de vérification des tables nécessaires
-- À exécuter dans Supabase SQL Editor

-- 1. Vérifier les tables existantes
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('producer_followers', 'distributor_alerts', 'distributor_messages', 'chat_rooms', 'chat_messages', 'chat_participants') 
    THEN '✅ REQUISE'
    ELSE 'ℹ️ OPTIONNELLE'
  END as statut
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('producer_followers', 'distributor_alerts', 'distributor_messages', 'chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY table_name;

-- 2. Vérifier les fonctions
SELECT 
  routine_name,
  CASE 
    WHEN routine_name = 'create_or_get_chat_room' 
    THEN '✅ REQUISE'
    ELSE 'ℹ️ OPTIONNELLE'
  END as statut
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_or_get_chat_room';

-- 3. Vérifier les politiques RLS
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
WHERE tablename IN ('producer_followers', 'distributor_alerts', 'distributor_messages', 'chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY tablename, policyname;

-- 4. Vérifier les contraintes de clés étrangères
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('producer_followers', 'distributor_alerts', 'distributor_messages', 'chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY tc.table_name, kcu.column_name;






