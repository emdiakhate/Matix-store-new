-- Script pour réinitialiser complètement la base de données MATIX
-- ATTENTION : Ce script supprime toutes les données existantes !

-- Supprimer les tables existantes (dans l'ordre pour éviter les erreurs de dépendances)
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS brand_products CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS delivery_requests CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Supprimer les types d'énumération existants
DROP TYPE IF EXISTS user_type CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS subscription_type CASCADE;
DROP TYPE IF EXISTS unit_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS quote_status CASCADE;
DROP TYPE IF EXISTS delivery_request_status CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS calculate_distance CASCADE;
DROP FUNCTION IF EXISTS search_products_nearby CASCADE;
DROP FUNCTION IF EXISTS get_requests_in_zone CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Maintenant exécuter le schéma complet
-- Copier tout le contenu de database/schema.sql ici
