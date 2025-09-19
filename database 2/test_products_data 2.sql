-- Données de test pour les produits avicoles
-- À exécuter dans l'éditeur SQL de Supabase après avoir appliqué la migration

-- Vérifier qu'il y a des utilisateurs producers et des catégories
-- Si pas d'utilisateurs, en créer quelques-uns
INSERT INTO public.users (id, user_type, business_name, coordinates, is_verified)
SELECT 
    gen_random_uuid(),
    'producer'::user_type,
    'Ferme Avicole Test',
    point(14.7167, -17.4677), -- Coordonnées de Dakar
    true
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE user_type = 'producer');

-- Créer quelques catégories si elles n'existent pas
INSERT INTO public.categories (id, name, name_fr, description, description_fr)
VALUES 
    (gen_random_uuid(), 'Poultry', 'Volaille', 'Poultry products including chickens, eggs, and feed', 'Produits avicoles incluant poulets, œufs et alimentation'),
    (gen_random_uuid(), 'Chickens', 'Poulets', 'Live chickens and chicken meat', 'Poulets vivants et viande de poulet'),
    (gen_random_uuid(), 'Eggs', 'Œufs', 'Fresh eggs from poultry', 'Œufs frais de volaille'),
    (gen_random_uuid(), 'Chicks', 'Poussins', 'Day-old chicks and young chickens', 'Poussins d\'un jour et jeunes poulets')
ON CONFLICT DO NOTHING;

-- Récupérer un producer_id et quelques category_ids pour les tests
WITH test_producer AS (
    SELECT id as producer_id FROM public.users WHERE user_type = 'producer' LIMIT 1
),
test_categories AS (
    SELECT 
        (SELECT id FROM public.categories WHERE name = 'Chickens' LIMIT 1) as chicken_cat,
        (SELECT id FROM public.categories WHERE name = 'Eggs' LIMIT 1) as egg_cat,
        (SELECT id FROM public.categories WHERE name = 'Chicks' LIMIT 1) as chick_cat
)

-- Insérer les produits de test
INSERT INTO public.products (
    producer_id, 
    category_id, 
    name, 
    specific_type, 
    description, 
    price, 
    distributor_price, 
    stock_quantity, 
    available_quantity, 
    unit_type, 
    age_weeks, 
    breed_race, 
    average_weight_kg, 
    is_vaccinated, 
    vaccination_details, 
    availability_date, 
    sale_end_date, 
    minimum_order_quantity, 
    farm_address,
    images
)
SELECT 
    tp.producer_id,
    tc.chicken_cat,
    'Poulet Fermier Bio Premium',
    'Poulet de chair',
    'Poulets élevés en plein air, nourris avec des aliments biologiques certifiés. Élevage traditionnel respectueux du bien-être animal.',
    3500,
    3000,
    50,
    50,
    'piece',
    12,
    'Cobb 500',
    2.2,
    true,
    'Vaccin Newcastle, Gumboro, Bronchite infectieuse',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    5,
    'Route de Rufisque, Sangalkam, Dakar',
    ARRAY['/images/poulet1.jpg', '/images/poulet2.jpg']
FROM test_producer tp, test_categories tc

UNION ALL

SELECT 
    tp.producer_id,
    tc.chicken_cat,
    'Poulet de Chair Standard',
    'Poulet de chair',
    'Poulets de chair élevés en parcours, croissance rapide, chair tendre et savoureuse.',
    2800,
    2500,
    100,
    100,
    'piece',
    8,
    'Ross 308',
    1.8,
    true,
    'Programme de vaccination complet selon normes vétérinaires',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '21 days',
    10,
    'Ferme Moderne, Thies, Sénégal',
    ARRAY['/images/poulet3.jpg']
FROM test_producer tp, test_categories tc

UNION ALL

SELECT 
    tp.producer_id,
    tc.egg_cat,
    'Œufs Frais de Poules Pondeuses',
    'Œufs de consommation',
    'Œufs frais pondus quotidiennement par nos poules élevées au sol. Qualité garantie, coquille solide.',
    150,
    130,
    500,
    500,
    'piece',
    NULL,
    'ISA Brown',
    NULL,
    true,
    'Poules vaccinées contre les principales maladies aviaires',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days',
    30,
    'Ferme des Œufs d\'Or, Kaolack',
    ARRAY['/images/oeufs1.jpg', '/images/oeufs2.jpg']
FROM test_producer tp, test_categories tc

UNION ALL

SELECT 
    tp.producer_id,
    tc.chick_cat,
    'Poussins d\'un Jour - Race Locale',
    'Poussin 1 jour',
    'Poussins d\'un jour de race locale sénégalaise, résistants aux conditions climatiques locales.',
    800,
    700,
    200,
    200,
    'piece',
    0,
    'Race Locale Sénégalaise',
    0.05,
    false,
    'Vaccination à prévoir selon programme d\'élevage',
    CURRENT_DATE + INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '7 days',
    20,
    'Couvoir Moderne, Mbour',
    ARRAY['/images/poussins1.jpg']
FROM test_producer tp, test_categories tc

UNION ALL

SELECT 
    tp.producer_id,
    tc.chicken_cat,
    'Poules Pondeuses Réformées',
    'Poule pondeuse',
    'Poules pondeuses en fin de cycle de ponte, idéales pour la consommation familiale ou la transformation.',
    2000,
    1800,
    30,
    30,
    'piece',
    72,
    'Lohmann Brown',
    1.5,
    true,
    'Historique vaccinal complet disponible',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '10 days',
    3,
    'Élevage Moderne, Saint-Louis',
    ARRAY['/images/poules1.jpg', '/images/poules2.jpg']
FROM test_producer tp, test_categories tc

UNION ALL

SELECT 
    tp.producer_id,
    tc.chicken_cat,
    'Coqs de Combat - Race Locale',
    'Coq d\'ornement',
    'Coqs de race locale, élevés pour la tradition et les concours. Plumage magnifique et tempérament combatif.',
    8000,
    7000,
    15,
    15,
    'piece',
    20,
    'Coq du Sénégal',
    3.5,
    true,
    'Vaccination préventive complète',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '45 days',
    1,
    'Élevage Traditionnel, Tambacounda',
    ARRAY['/images/coq1.jpg']
FROM test_producer tp, test_categories tc;








