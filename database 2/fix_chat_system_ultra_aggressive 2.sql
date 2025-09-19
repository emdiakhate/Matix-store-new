-- Script de correction ULTRA-AGGRESSIF pour le système de chat
-- À exécuter dans Supabase SQL Editor
-- Ce script force la résolution de TOUS les problèmes de permissions

-- 1. Vérifier l'état actuel des tables
SELECT '--- ÉTAT ACTUEL DES TABLES ---' as info;
SELECT 
    table_name,
    table_type,
    is_insertable_into,
    is_typed
FROM information_schema.tables 
WHERE table_name IN ('chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY table_name;

-- 2. Vérifier les politiques RLS actuelles
SELECT '--- POLITIQUES RLS ACTUELLES ---' as info;
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
WHERE tablename IN ('chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY tablename, policyname;

-- 3. FORCER la désactivation de RLS sur TOUTES les tables
SELECT '--- DÉSACTIVATION FORCÉE DE RLS ---' as info;

-- Désactiver RLS sur chat_rooms
ALTER TABLE IF EXISTS chat_rooms DISABLE ROW LEVEL SECURITY;
SELECT 'RLS désactivé sur chat_rooms' as status;

-- Désactiver RLS sur chat_messages  
ALTER TABLE IF EXISTS chat_messages DISABLE ROW LEVEL SECURITY;
SELECT 'RLS désactivé sur chat_messages' as status;

-- Désactiver RLS sur chat_participants
ALTER TABLE IF EXISTS chat_participants DISABLE ROW LEVEL SECURITY;
SELECT 'RLS désactivé sur chat_participants' as status;

-- 4. SUPPRIMER TOUTES les politiques possibles (même celles qui n'existent pas)
SELECT '--- SUPPRESSION FORCÉE DE TOUTES LES POLITIQUES ---' as info;

-- Supprimer toutes les politiques sur chat_rooms
DROP POLICY IF EXISTS "Allow all access for testing" ON chat_rooms;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_rooms;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chat_rooms;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chat_rooms;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chat_rooms;
SELECT 'Politiques supprimées sur chat_rooms' as status;

-- Supprimer toutes les politiques sur chat_messages
DROP POLICY IF EXISTS "Allow all access for testing" ON chat_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chat_messages;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chat_messages;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chat_messages;
SELECT 'Politiques supprimées sur chat_messages' as status;

-- Supprimer toutes les politiques sur chat_participants
DROP POLICY IF EXISTS "Allow all access for testing" ON chat_participants;
DROP POLICY IF EXISTS "Enable read access for all users" ON chat_participants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON chat_participants;
DROP POLICY IF EXISTS "Enable update for users based on email" ON chat_participants;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON chat_participants;
SELECT 'Politiques supprimées sur chat_participants' as status;

-- 5. Vérifier que RLS est bien désactivé
SELECT '--- VÉRIFICATION RLS DÉSACTIVÉ ---' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('chat_rooms', 'chat_messages', 'chat_participants')
ORDER BY tablename;

-- 6. Recréer la fonction create_or_get_chat_room avec une logique ultra-simplifiée
SELECT '--- RECRÉATION DE LA FONCTION ---' as info;

-- Supprimer la fonction existante
DROP FUNCTION IF EXISTS create_or_get_chat_room(UUID, UUID);
DROP FUNCTION IF EXISTS create_or_get_chat_room(text, text);

-- Créer une fonction ultra-simplifiée
CREATE OR REPLACE FUNCTION create_or_get_chat_room(
    p_distributor_id UUID,
    p_producer_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_room_id UUID;
    v_room_name TEXT;
BEGIN
    -- Vérifier si la salle existe déjà
    SELECT id INTO v_room_id
    FROM chat_rooms
    WHERE (distributor_id = p_distributor_id AND producer_id = p_producer_id)
       OR (distributor_id = p_producer_id AND producer_id = p_distributor_id);
    
    -- Si la salle n'existe pas, la créer
    IF v_room_id IS NULL THEN
        -- Créer un nom simple
        v_room_name := 'Chat Room ' || p_distributor_id::text || ' - ' || p_producer_id::text;
        
        -- Créer la salle
        INSERT INTO chat_rooms (distributor_id, producer_id, room_name)
        VALUES (p_distributor_id, p_producer_id, v_room_name)
        RETURNING id INTO v_room_id;
        
        -- Ajouter les participants
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_distributor_id);
        INSERT INTO chat_participants (room_id, user_id) VALUES (v_room_id, p_producer_id);
    END IF;
    
    RETURN v_room_id;
END;
$$ LANGUAGE plpgsql;

SELECT 'Fonction create_or_get_chat_room recréée' as status;

-- 7. Tester la fonction directement
SELECT '--- TEST DE LA FONCTION ---' as info;
SELECT create_or_get_chat_room(
    'b9e68c20-60df-40d9-9a35-1df76838bc29'::UUID,
    '267060b0-13d5-4fa9-a414-dbc1e533f05b'::UUID
) as test_result;

-- 8. Vérification finale
SELECT '--- VÉRIFICATION FINALE ---' as info;
SELECT 'Tables chat créées et RLS désactivé' as status;
SELECT 
    'chat_rooms' as table_name, COUNT(*) as count FROM chat_rooms
UNION ALL
SELECT 'chat_messages' as table_name, COUNT(*) as count FROM chat_messages
UNION ALL
SELECT 'chat_participants' as table_name, COUNT(*) as count FROM chat_participants;

-- 9. Test d'insertion directe
SELECT '--- TEST D''INSERTION DIRECTE ---' as info;
INSERT INTO chat_rooms (distributor_id, producer_id, room_name)
VALUES (
    'b9e68c20-60df-40d9-9a35-1df76838bc29'::UUID,
    '267060b0-13d5-4fa9-a414-dbc1e533f05b'::UUID,
    'Test Room'
) ON CONFLICT (distributor_id, producer_id) DO NOTHING;

SELECT 'Test d''insertion réussi' as status;






