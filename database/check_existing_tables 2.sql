-- Script pour vérifier les tables existantes dans votre base Supabase

-- Lister toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Lister tous les types d'énumération
SELECT typname 
FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;

-- Lister toutes les fonctions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
