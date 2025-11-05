# 🚀 Guide d'Exécution Complet - Refonte Matix Store

## 📋 Vue d'Ensemble

Ce guide vous permet de refondre complètement la base de données et les données de test pour avoir un système propre et fonctionnel.

## ⚠️ IMPORTANT - À Faire dans l'Ordre

### Étape 1 : Sauvegarder (Optionnel)

Si vous avez des données importantes dans `profiles` ou ailleurs :

1. Allez dans Supabase → SQL Editor
2. Exécutez : `SELECT * FROM profiles;` et sauvegardez si nécessaire

### Étape 2 : Exécuter les Migrations SQL

**Dans Supabase SQL Editor, exécutez DANS CET ORDRE :**

#### 2.1 - Fix Authentication (5 min)

```sql
-- Copier-coller tout le contenu de:
-- supabase/migrations/fix_authentication.sql
```

**Ce que ça fait :**

- ✅ Supprime la table `profiles` (doublon)
- ✅ Garde uniquement la table `users`
- ✅ Ajoute les colonnes `roles[]` et `active_role`
- ✅ Crée le trigger `handle_new_user()` qui fonctionne
- ✅ Chaque utilisateur aura farmer + distributor

**Vérification :**

```sql
-- Vérifier que le trigger existe
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

#### 2.2 - Adapt Tables for Bictorys (Déjà fait ✅)

```sql
-- Vous avez déjà exécuté :
-- supabase/migrations/adapt_tables_for_bictorys.sql
```

**Si pas fait, exécutez-le maintenant !**

#### 2.3 - Seed Test Data (10 min)

```sql
-- Copier-coller tout le contenu de:
-- supabase/migrations/seed_test_data.sql
```

**Ce que ça fait :**

- ✅ Crée 2 utilisateurs de test (Amadou Diallo + Fatou Sow)
- ✅ Crée 3 catégories (Volailles, Œufs, Poussins)
- ✅ Crée 20 produits au total (10 par utilisateur)
- ✅ Avec de vraies photos depuis Pexels

**Vérification :**

```sql
-- Voir les utilisateurs créés
SELECT full_name, email, roles, active_role FROM users
WHERE email LIKE '%matix-test.com%';

-- Voir les produits créés
SELECT name, price, stock_quantity FROM products LIMIT 10;
```

### Étape 3 : Créer les Comptes d'Authentification

Les utilisateurs sont dans la table `users` mais pas encore dans `auth.users`.

**Option A - Via l'Interface (Recommandé) :**

1. Allez sur http://localhost:3001
2. Cliquez sur "Créer un compte"
3. Utilisez : `amadou@matix-test.com` / `Password123!`
4. Répétez pour : `fatou@matix-test.com` / `Password123!`

**Option B - Via Supabase Dashboard :**

1. Allez dans Supabase → Authentication → Add User
2. Email : `amadou@matix-test.com`
3. Password : `Password123!`
4. Confirm Email : ✅
5. Répétez pour Fatou

### Étape 4 : Tester l'Authentification

```
1. Allez sur http://localhost:3001
2. Essayez de créer un compte avec un nouveau email
3. Vérifiez qu'il n'y a PLUS d'erreur 500
4. Vérifiez dans Supabase que l'utilisateur apparaît dans la table users
```

**Si ça marche ✅ :**

```sql
-- Vous devriez voir le nouvel utilisateur avec roles = ['farmer', 'distributor']
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
```

### Étape 5 : Vérifier les Données

```sql
-- Total produits
SELECT COUNT(*) as total_produits FROM products;
-- Résultat attendu : 20

-- Produits par utilisateur
SELECT u.full_name, COUNT(p.id) as nb_produits
FROM users u
LEFT JOIN products p ON p.producer_id = u.id
GROUP BY u.id, u.full_name;
-- Résultat attendu : Amadou=10, Fatou=10

-- Panier (devrait être vide)
SELECT COUNT(*) FROM cart_items;
-- Résultat attendu : 0
```

## 🔧 Étape 6 : Corriger le Code

Maintenant que la base de données est propre, il faut adapter le code.

### 6.1 - Vérifier l'Erreur 404

L'erreur vient probablement du bouton "Confirmer la Commande". Vérifions :

```bash
# Voir les logs du serveur
# Les logs vous montreront quelle URL retourne 404
```

### 6.2 - Supprimer les Mocks de la Homepage

**À FAIRE :** Charger les produits depuis la DB au lieu des données mockées.

### 6.3 - Supprimer les Mocks du Checkout

**À FAIRE :** Le panier doit venir de `cart_items` au lieu d'être mocké.

## 📊 Résumé des Tables Après Migration

### ✅ Tables Principales

- **users** : Utilisateurs avec roles[] et active_role
- **products** : 20 produits de test avec vraies photos
- **categories** : 3 catégories
- **orders** : Commandes (colonnes Bictorys ajoutées)
- **payments** : Paiements (colonnes Bictorys ajoutées)
- **cart_items** : Panier d'achat (nouvelle table)

### ❌ Tables Supprimées

- **profiles** : Supprimée (doublon avec users)

## 🎯 Prochaines Étapes

Après avoir exécuté toutes les migrations :

### 1. Tester l'Authentification

- [ ] Créer un compte → Doit marcher sans erreur 500
- [ ] Login → Doit fonctionner
- [ ] Vérifier que l'utilisateur a bien roles = ['farmer', 'distributor']

### 2. Tester les Produits

- [ ] Voir la liste des produits sur la homepage
- [ ] Cliquer sur un produit
- [ ] Ajouter au panier

### 3. Tester le Panier

- [ ] Voir le panier
- [ ] Modifier les quantités
- [ ] Aller au checkout

### 4. Tester Bictorys

- [ ] Remplir le formulaire checkout
- [ ] Cliquer "Confirmer la Commande"
- [ ] Vérifier la requête Bictorys dans les logs
- [ ] Corriger si nécessaire avec les infos de la documentation

## 🐛 Dépannage

### Erreur : "column does not exist"

➡️ Vous n'avez pas exécuté `adapt_tables_for_bictorys.sql`

### Erreur : "trigger does not exist"

➡️ Vous n'avez pas exécuté `fix_authentication.sql`

### Erreur 500 lors de l'inscription

➡️ Vérifiez que le trigger existe :

```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

### Aucun produit affiché

➡️ Vérifiez que les produits sont créés :

```sql
SELECT COUNT(*) FROM products;
```

### Erreur 404 sur "Confirmer la Commande"

➡️ Envoyez-moi les logs du serveur pour voir quelle URL est appelée

## 📸 Pour la Documentation Bictorys

Pendant que vous exécutez les migrations, vous pouvez :

1. Aller sur https://docs.bictorys.com/reference/getting-started
2. Copier-coller les informations dans `BICTORYS_INFO_NEEDED.md`
3. Ou me décrire simplement ce que vous voyez

## ✅ Checklist Finale

Avant de tester le paiement, vérifiez :

- [ ] fix_authentication.sql exécuté ✅
- [ ] adapt_tables_for_bictorys.sql exécuté ✅
- [ ] seed_test_data.sql exécuté ✅
- [ ] Trigger `on_auth_user_created` existe ✅
- [ ] Table `profiles` supprimée ✅
- [ ] 2 utilisateurs de test créés ✅
- [ ] 20 produits créés ✅
- [ ] Authentification fonctionne (pas d'erreur 500) ✅
- [ ] Les produits s'affichent sur la homepage ⏳
- [ ] Le panier fonctionne ⏳
- [ ] Bictorys API configurée ⏳

---

**Commencez par l'ÉTAPE 1 et exécutez dans l'ordre. Tenez-moi au courant de chaque étape !** 🚀
