# 📊 État Actuel de la Base de Données MATIX

**Date de génération** : 2025-01-30

## 📋 Vue d'ensemble

La base de données MATIX utilise **PostgreSQL avec l'extension PostGIS** pour la géolocalisation. Elle est conçue pour une plateforme de marché de produits avicoles au Sénégal, avec support multilingue (anglais, français, wolof).

---

## 🔤 Types d'énumération

La base de données utilise **9 types d'énumération** pour garantir l'intégrité des données :

| Type                      | Valeurs possibles                                                     |
| ------------------------- | --------------------------------------------------------------------- |
| `user_type`               | `'producer'`, `'distributor'`, `'client'`                             |
| `subscription_status`     | `'active'`, `'inactive'`, `'expired'`                                 |
| `subscription_type`       | `'producer_monthly'`, `'distributor_monthly'`                         |
| `unit_type`               | `'piece'`, `'kg'`, `'lot'`, `'liter'`                                 |
| `order_status`            | `'pending'`, `'confirmed'`, `'shipped'`, `'delivered'`, `'cancelled'` |
| `payment_status`          | `'pending'`, `'paid'`, `'failed'`, `'refunded'`                       |
| `payment_method`          | `'orange_money'`, `'wave'`, `'free_money'`, `'bictorys'`, `'cash'`    |
| `quote_status`            | `'draft'`, `'sent'`, `'accepted'`, `'rejected'`                       |
| `delivery_request_status` | `'pending'`, `'quoted'`, `'accepted'`, `'in_progress'`, `'completed'` |

---

## 📦 Tables Principales (Schéma MATIX)

### 1. **`users`** - Utilisateurs de la plateforme

**Clé primaire** : `id` (UUID, référence `auth.users(id)`)  
**Colonnes principales** :

- `user_type` : Type d'utilisateur (producer, distributor, client)
- `subscription_status` : Statut d'abonnement
- `business_name` : Nom de l'entreprise
- `business_license` : Licence d'exploitation
- `coordinates` : POINT (PostGIS) - Coordonnées GPS
- `radius_km` : Rayon d'action en km (défaut: 50)
- `is_verified` : Vérification du compte
- `farm_latitude`, `farm_longitude` : Coordonnées précises de la ferme (ajoutées)
- `farm_address`, `farm_name`, `region` : Informations de localisation
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬇️ Référencée par : `products`, `delivery_requests`, `quotes`, `orders`, `brands`, `subscriptions`, `payments`

---

### 2. **`profiles`** - Profils utilisateur (Authentification Supabase)

**Clé primaire** : `id` (UUID, référence `auth.users(id)`)  
**Colonnes principales** :

- `email` : Email de l'utilisateur
- `nom`, `prenom` : Nom et prénom
- `telephone` : Numéro de téléphone
- `role` : Rôle (`'eleveur'`, `'acheteur'`, `'admin'`)
- `avatar_url` : URL de l'avatar
- `created_at`, `updated_at` : Timestamps

**Note** : Table séparée de `users`, utilisée pour l'authentification Supabase.

---

### 3. **`categories`** - Catégories de produits

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `name`, `name_fr`, `name_wo` : Nom en 3 langues
- `description`, `description_fr`, `description_wo` : Description multilingue
- `icon` : Icône de la catégorie
- `parent_id` : UUID (auto-référence) - Catégorie parente pour hiérarchie
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬇️ Auto-référence : `parent_id → categories(id)` (hiérarchie)
- ⬇️ Référencée par : `products`

**Données de base** :

- Poultry / Volaille / Ginaar
- Eggs / Œufs / Nee
- Feed / Aliments / Lekk
- Equipment / Équipements / Jëfandikukay

---

### 4. **`products`** - Produits proposés

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `producer_id` : UUID → `users(id)` - Producteur
- `category_id` : UUID → `categories(id)` - Catégorie
- `title`, `title_fr`, `title_wo` : Titre multilingue
- `description`, `description_fr`, `description_wo` : Description multilingue
- `price`, `sale_price`, `cost_price` : Prix (DECIMAL)
- `discount_percentage` : Pourcentage de réduction
- `stock_quantity`, `available_quantity` : Quantités
- `unit_type` : Unité de mesure
- `harvest_date`, `expiry_date` : Dates importantes
- `is_organic`, `is_local_breed` : Caractéristiques
- `age_weeks`, `vaccination_status` : Infos volaille
- `distributor_price`, `retail_price` : Prix selon segment
- `location_coordinates` : POINT (PostGIS) - Localisation produit
- `images` : TABLEAU de TEXT (URLs images)
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `producer_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `category_id → categories(id)` (SET NULL)
- ⬇️ Référencée par : `brand_products`

---

### 5. **`delivery_requests`** - Demandes de livraison

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `client_id` : UUID → `users(id)` - Client demandeur
- `product_description` : Description du produit demandé
- `quantity` : Quantité demandée
- `budget_range` : JSONB `{min: number, max: number}` - Budget
- `pickup_address`, `pickup_coordinates` : Point de collecte
- `delivery_address`, `delivery_coordinates` : Point de livraison (POINT)
- `status` : Statut de la demande
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `client_id → users(id)` (CASCADE DELETE)
- ⬇️ Référencée par : `quotes`

---

### 6. **`quotes`** - Devis pour les demandes

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `distributor_id` : UUID → `users(id)` - Distributeur
- `client_id` : UUID → `users(id)` - Client
- `delivery_request_id` : UUID → `delivery_requests(id)` - Demande associée
- `products` : JSONB - `[{product_id, quantity, unit_price}]`
- `subtotal`, `delivery_fee`, `total_amount` : Montants (DECIMAL)
- `valid_until` : Date d'expiration du devis
- `status` : Statut du devis
- `payment_link` : Lien de paiement
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `distributor_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `client_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `delivery_request_id → delivery_requests(id)` (CASCADE DELETE)
- ⬇️ Référencée par : `orders`

---

### 7. **`orders`** - Commandes finalisées

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `seller_id` : UUID → `users(id)` - Vendeur (producer ou distributor)
- `seller_type` : Type de vendeur (CHECK: 'producer' ou 'distributor')
- `buyer_id` : UUID → `users(id)` - Acheteur
- `status` : Statut de la commande
- `payment_status` : Statut du paiement
- `payment_method` : Méthode de paiement
- `is_direct_sale` : Vente directe (sans distributeur)
- `commission_rate`, `commission_amount` : Commission distributeur
- `delivery_coordinates` : POINT - Point de livraison
- `delivery_distance_km` : Distance de livraison
- `quote_id` : UUID → `quotes(id)` - Devis associé (optionnel)
- `total_amount` : Montant total (DECIMAL)
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `seller_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `buyer_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `quote_id → quotes(id)` (SET NULL)
- ⬇️ Référencée par : `payments`

---

### 8. **`brands`** - Marques de distributeurs

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `distributor_id` : UUID → `users(id)` - Distributeur propriétaire
- `name` : Nom de la marque
- `description` : Description
- `logo_url` : URL du logo
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `distributor_id → users(id)` (CASCADE DELETE)
- ⬇️ Référencée par : `brand_products`

---

### 9. **`brand_products`** - Produits associés aux marques

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `brand_id` : UUID → `brands(id)` - Marque
- `product_id` : UUID → `products(id)` - Produit
- `custom_price` : Prix personnalisé pour la marque
- `custom_description` : Description personnalisée
- `created_at` : Timestamp

**Relations** :

- ⬆️ Référence : `brand_id → brands(id)` (CASCADE DELETE)
- ⬆️ Référence : `product_id → products(id)` (CASCADE DELETE)
- 🔒 **Contrainte UNIQUE** : `(brand_id, product_id)` - Un produit ne peut être lié qu'une fois à une marque

---

### 10. **`subscriptions`** - Abonnements utilisateurs

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `user_id` : UUID → `users(id)` - Utilisateur
- `subscription_type` : Type d'abonnement
- `status` : Statut de l'abonnement
- `start_date`, `end_date` : Période d'abonnement
- `amount` : Montant (DECIMAL)
- `payment_status` : Statut du paiement
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `user_id → users(id)` (CASCADE DELETE)
- ⬇️ Référencée par : `payments`

---

### 11. **`payments`** - Transactions de paiement

**Clé primaire** : `id` (UUID)  
**Colonnes principales** :

- `user_id` : UUID → `users(id)` - Utilisateur
- `order_id` : UUID → `orders(id)` - Commande associée (optionnel)
- `subscription_id` : UUID → `subscriptions(id)` - Abonnement associé (optionnel)
- `amount` : Montant (DECIMAL)
- `payment_method` : Méthode de paiement
- `status` : Statut du paiement
- `transaction_id` : ID de transaction externe
- `payment_data` : JSONB - Données complémentaires
- `created_at`, `updated_at` : Timestamps

**Relations** :

- ⬆️ Référence : `user_id → users(id)` (CASCADE DELETE)
- ⬆️ Référence : `order_id → orders(id)` (SET NULL)
- ⬆️ Référence : `subscription_id → subscriptions(id)` (SET NULL)

---

## 🔗 Diagramme des Relations

```
auth.users (Supabase)
    │
    ├─── profiles (1:1)
    │    └─── id (PK) → auth.users(id)
    │
    └─── users (1:1)
         └─── id (PK) → auth.users(id)
              │
              ├─── products (1:N)
              │    └─── producer_id → users(id)
              │
              ├─── delivery_requests (1:N)
              │    └─── client_id → users(id)
              │
              ├─── quotes (1:N)
              │    ├─── distributor_id → users(id)
              │    └─── client_id → users(id)
              │
              ├─── orders (1:N)
              │    ├─── seller_id → users(id)
              │    └─── buyer_id → users(id)
              │
              ├─── brands (1:N)
              │    └─── distributor_id → users(id)
              │
              ├─── subscriptions (1:N)
              │    └─── user_id → users(id)
              │
              └─── payments (1:N)
                   └─── user_id → users(id)

categories
    │
    ├─── categories (auto-référence 1:N)
    │    └─── parent_id → categories(id)
    │
    └─── products (1:N)
         └─── category_id → categories(id)

delivery_requests
    └─── quotes (1:N)
         └─── delivery_request_id → delivery_requests(id)

quotes
    └─── orders (1:N)
         └─── quote_id → quotes(id)

brands
    └─── brand_products (1:N)
         └─── brand_id → brands(id)

products
    └─── brand_products (1:N)
         └─── product_id → products(id)

orders
    └─── payments (1:N)
         └─── order_id → orders(id)

subscriptions
    └─── payments (1:N)
         └─── subscription_id → subscriptions(id)
```

---

## 🗺️ Fonctions de Géolocalisation

### 1. **`calculate_distance(lat1, lng1, lat2, lng2)`**

Calcule la distance entre deux points GPS en kilomètres (formule Haversine).

### 2. **`search_products_nearby(search_lat, search_lng, search_radius)`**

Retourne les produits dans un rayon donné depuis un point GPS.

### 3. **`get_requests_in_zone(search_lat, search_lng, search_radius)`**

Retourne les demandes de livraison en attente dans une zone donnée.

### 4. **`get_lat(point_coord)` / `get_lng(point_coord)`**

Extrait la latitude/longitude d'un POINT PostgreSQL.

---

## 📊 Index de Performance

| Table               | Index                             | Type                                         |
| ------------------- | --------------------------------- | -------------------------------------------- |
| `users`             | `idx_users_user_type`             | B-tree sur `user_type`                       |
| `users`             | `idx_users_coordinates`           | GIST sur `coordinates` (PostGIS)             |
| `users`             | `idx_users_farm_location`         | B-tree sur `(farm_latitude, farm_longitude)` |
| `users`             | `idx_users_region`                | B-tree sur `region`                          |
| `products`          | `idx_products_producer_id`        | B-tree sur `producer_id`                     |
| `products`          | `idx_products_category_id`        | B-tree sur `category_id`                     |
| `products`          | `idx_products_location`           | GIST sur `location_coordinates`              |
| `products`          | `idx_products_price`              | B-tree sur `price`                           |
| `delivery_requests` | `idx_delivery_requests_client_id` | B-tree sur `client_id`                       |
| `delivery_requests` | `idx_delivery_requests_status`    | B-tree sur `status`                          |
| `quotes`            | `idx_quotes_distributor_id`       | B-tree sur `distributor_id`                  |
| `quotes`            | `idx_quotes_client_id`            | B-tree sur `client_id`                       |
| `orders`            | `idx_orders_seller_id`            | B-tree sur `seller_id`                       |
| `orders`            | `idx_orders_buyer_id`             | B-tree sur `buyer_id`                        |
| `orders`            | `idx_orders_status`               | B-tree sur `status`                          |
| `profiles`          | `profiles_email_idx`              | B-tree sur `email`                           |
| `profiles`          | `profiles_role_idx`               | B-tree sur `role`                            |
| `profiles`          | `profiles_telephone_idx`          | B-tree sur `telephone`                       |

---

## 🔒 Sécurité (Row Level Security - RLS)

Toutes les tables principales ont **RLS activé** avec des politiques spécifiques :

### Politiques principales :

- **`users`** : Utilisateurs peuvent voir/modifier leur propre profil
- **`products`** : Consultation publique, modification uniquement par le producteur
- **`delivery_requests`** : Clients voient leurs demandes, distributeurs voient celles dans leur zone
- **`quotes`** : Distributeurs et clients voient leurs devis respectifs
- **`orders`** : Vendeurs et acheteurs voient leurs commandes
- **`brands`** : Distributeurs gèrent leurs propres marques
- **`subscriptions`** : Utilisateurs voient leurs abonnements
- **`payments`** : Utilisateurs voient leurs paiements

---

## ⚙️ Triggers Automatiques

### 1. **`update_updated_at_column()`**

Met à jour automatiquement le champ `updated_at` lors de modifications sur :

- `users`
- `products`
- `delivery_requests`
- `quotes`
- `orders`
- `brands`
- `categories`
- `subscriptions`
- `payments`

### 2. **`handle_new_user()`** (Supabase)

Crée automatiquement un profil dans `profiles` après inscription dans `auth.users`.

### 3. **`handle_user_deleted()`** (Supabase)

Supprime automatiquement le profil lors de la suppression d'un utilisateur.

---

## 📈 Statistiques

| Métrique                           | Valeur                     |
| ---------------------------------- | -------------------------- |
| **Nombre de tables principales**   | 11                         |
| **Nombre de tables d'énumération** | 9                          |
| **Nombre d'index**                 | 17+                        |
| **Nombre de fonctions**            | 6+                         |
| **Nombre de triggers**             | 11+                        |
| **Extension PostGIS**              | ✅ Activée                 |
| **RLS activé**                     | ✅ Oui (toutes les tables) |
| **Support multilingue**            | ✅ Oui (EN, FR, WO)        |

---

## 🎯 Cas d'Usage Principaux

### 1. **Gestion des Produits**

- Producteurs créent des produits avec géolocalisation
- Produits organisés par catégories hiérarchiques
- Support multilingue (titre, description)

### 2. **Demandes et Devis**

- Clients créent des demandes de livraison
- Distributeurs proposent des devis
- Géolocalisation pour trouver distributeurs à proximité

### 3. **Commandes et Paiements**

- Commandes directes ou via devis
- Support multi-méthodes de paiement (mobile money, cash)
- Calcul automatique de commissions

### 4. **Marques et Produits**

- Distributeurs créent des marques
- Association produits-marques avec prix personnalisés

### 5. **Abonnements**

- Gestion des abonnements producteurs/distributeurs
- Suivi des paiements d'abonnement

---

## 🚀 Prochaines Étapes Recommandées

1. ✅ **Migration complète** : Appliquer le schéma sur Supabase
2. 📊 **Seed data** : Ajouter des données de test
3. 🔍 **Optimisation** : Analyser les performances des requêtes
4. 📝 **Documentation API** : Documenter les endpoints utilisant ces tables
5. 🧪 **Tests** : Tester les politiques RLS avec différents rôles

---

**Document généré automatiquement à partir des fichiers SQL du projet.**
