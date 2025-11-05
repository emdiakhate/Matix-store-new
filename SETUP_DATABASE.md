# Configuration de la Base de Données Supabase pour Bictorys

## 🎯 Objectif

Adapter les tables existantes `orders` et `payments` pour supporter les paiements Bictorys sans casser les fonctionnalités existantes.

## ⚠️ IMPORTANT

**NE PAS** exécuter `create_orders_and_payments_tables.sql` car les tables `orders` et `payments` existent déjà !

Utilisez plutôt le fichier `adapt_tables_for_bictorys.sql` qui modifie les tables existantes.

## 📋 Étapes à Suivre

### ÉTAPE 1: Adapter les Tables pour Bictorys

1. Ouvrez https://supabase.com/dashboard
2. Sélectionnez votre projet `Matix Store`
3. Cliquez sur **SQL Editor** dans le menu de gauche
4. Cliquez sur **New Query**
5. Copiez-collez le contenu du fichier `supabase/migrations/adapt_tables_for_bictorys.sql`
6. Cliquez sur **Run** pour exécuter la migration

#### Cette migration va :

**Table `orders` - Ajout de colonnes :**

- `customer_email` VARCHAR(255) - Email du client
- `customer_phone` VARCHAR(50) - Téléphone du client
- `customer_name` VARCHAR(255) - Nom complet du client
- `items` JSONB - Articles commandés
- `shipping_address` JSONB - Adresse de livraison
- `shipping_method` VARCHAR(100) - Méthode de livraison
- `payment_method_details` VARCHAR(100) - Détails du moyen de paiement

**Table `payments` - Ajout de colonnes :**

- `reference` VARCHAR(255) UNIQUE - Référence Bictorys (MATIX-{order_id}-{timestamp})
- `customer_email` VARCHAR(255) - Email du client
- `customer_phone` VARCHAR(50) - Téléphone du client
- `customer_name` VARCHAR(255) - Nom complet du client
- `metadata` JSONB - Métadonnées additionnelles
- `bictorys_transaction_id` VARCHAR(255) - ID transaction Bictorys
- `bictorys_status` VARCHAR(50) - Statut Bictorys
- `payment_url` TEXT - URL de paiement Bictorys

**Table `cart_items` - Nouvelle table créée :**

- Gestion du panier pour utilisateurs connectés et invités
- Support du session_id pour les utilisateurs non connectés
- Prix au moment de l'ajout pour éviter les changements de prix

### ÉTAPE 2: Vérifier les Types ENUM

Exécutez ces requêtes dans SQL Editor pour voir les valeurs actuelles :

```sql
-- Voir les valeurs de order_status
SELECT enum_range(NULL::order_status);

-- Voir les valeurs de payment_status
SELECT enum_range(NULL::payment_status);

-- Voir les valeurs de payment_method
SELECT enum_range(NULL::payment_method);

-- Voir les valeurs de user_type
SELECT enum_range(NULL::user_type);
```

**Notez les résultats** et envoyez-les moi pour que je puisse adapter le code si nécessaire.

### ÉTAPE 3: Vérifier la Migration

Après avoir exécuté la migration, vérifiez que les colonnes ont été ajoutées :

```sql
-- Voir la structure de orders
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Voir la structure de payments
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;

-- Voir la table cart_items
SELECT * FROM cart_items LIMIT 1;
```

### ÉTAPE 4: Corriger le Problème d'Authentification

Si vous avez encore l'erreur 500 lors de la création de compte, exécutez ce SQL :

```sql
-- Vérifier si le trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si le trigger n'existe pas, le créer
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, phone, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'telephone',
    CONCAT(NEW.raw_user_meta_data->>'prenom', ' ', NEW.raw_user_meta_data->>'nom')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger si pas existant
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### ÉTAPE 5: Tester la Base de Données

Une fois la migration exécutée, testez :

```sql
-- Test 1: Créer une commande test
INSERT INTO orders (
  seller_id, seller_type, buyer_id, total_amount,
  customer_email, customer_phone, customer_name,
  items, shipping_address
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'producer',
  '00000000-0000-0000-0000-000000000000',
  25000,
  'test@example.com',
  '+221771234567',
  'Test User',
  '[]'::jsonb,
  '{}'::jsonb
) RETURNING id;

-- Test 2: Vérifier la commande
SELECT id, customer_email, customer_name, total_amount, status
FROM orders
WHERE customer_email = 'test@example.com';

-- Test 3: Nettoyer le test
DELETE FROM orders WHERE customer_email = 'test@example.com';
```

## 🚀 Prochaines Étapes

Une fois la base de données configurée :

1. ✅ Redémarrez le serveur Next.js pour prendre en compte les changements
2. ✅ Testez la création de compte (l'erreur 500 devrait disparaître)
3. ✅ Testez la page checkout : http://localhost:3001/checkout
4. ✅ Testez le paiement avec Bictorys
5. ✅ Connectez le panier à la base de données (actuellement mocké)
6. ✅ Ajoutez des produits réels dans la base de données

## 📊 Schéma de Flux de Paiement

```
1. Utilisateur remplit le formulaire checkout
   ↓
2. Click "Confirmer la Commande"
   ↓
3. Création d'une commande dans table orders
   (avec customer_email, customer_phone, items, shipping_address)
   ↓
4. Appel à /api/payments/initiate
   ↓
5. Création de la transaction Bictorys via API
   ↓
6. Sauvegarde dans table payments
   (avec reference, bictorys_transaction_id, payment_url)
   ↓
7. Redirection vers payment_url Bictorys
   ↓
8. Utilisateur paie sur Bictorys
   ↓
9. Webhook Bictorys → /api/payments/webhook
   ↓
10. Mise à jour status = 'success' dans payments et orders
    ↓
11. Redirection vers /checkout/success
```

## 🐛 Problèmes Courants

### Erreur: "column does not exist"

➡️ La migration n'a pas été exécutée. Exécutez `adapt_tables_for_bictorys.sql`

### Erreur: "violates foreign key constraint"

➡️ Les seller_id et buyer_id doivent être des UUIDs valides ou NULL

### Erreur: "invalid input value for enum"

➡️ Les valeurs des ENUM doivent correspondre. Vérifiez avec les requêtes de l'ÉTAPE 2

### Erreur 500 lors de l'inscription

➡️ Le trigger `handle_new_user` n'existe pas. Exécutez le SQL de l'ÉTAPE 4

## 📝 Notes Importantes

- La table `profiles` semble faire doublon avec `users` - À vérifier en Phase 2
- Les champs ajoutés sont `NULL` par défaut pour ne pas casser les données existantes
- Les politiques RLS sont ouvertes en développement - À sécuriser en Phase 2
- Le panier actuel est mocké - Il faut le connecter à `cart_items`

## ✉️ Support

Si vous rencontrez des erreurs, envoyez-moi :

1. Le message d'erreur complet
2. Le résultat des requêtes ENUM (ÉTAPE 2)
3. Les logs du serveur Next.js
