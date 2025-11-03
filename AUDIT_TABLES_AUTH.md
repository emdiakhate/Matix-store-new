# 🔍 Audit - Tables d'Authentification

**Date** : 2025-01-30  
**Mission** : Migration de `profiles` vers `users` avec système multi-rôles

---

## 📊 Résumé

### Table actuelle : `profiles` ❌

- **État** : Utilisée partout, mais incompatible avec le système multi-rôles
- **Structure** : Un seul rôle (`role` ENUM : 'eleveur', 'acheteur', 'admin')
- **Localisation** : Créée dans `supabase/migrations/001_initial_schema.sql`

### Table cible : `users` ✅

- **État** : Existe dans le schéma principal mais sans colonnes `roles`/`active_role`
- **Structure attendue** :
  - `roles` TEXT[] DEFAULT ARRAY['farmer', 'distributor']
  - `active_role` TEXT DEFAULT 'farmer'
  - `user_type` user_type (producer, distributor, client)
- **Localisation** : `database/schema.sql`

---

## 📁 Fichiers Utilisant `profiles` (À Migrer)

### 1. Services

- ✅ **`services/auth/authService.ts`** (lignes 325, 356)
  - `getUserProfile()` : Lit depuis `profiles`
  - `updateProfile()` : Met à jour `profiles`

### 2. Hooks

- ✅ **`hooks/useAuth.ts`** (ligne 25)
  - Utilise `authService.getUserProfile()` qui lit `profiles`
  - Vérifie `profile.role` (ligne 292)

### 3. API Routes

- ✅ **`app/api/auth/session/route.ts`** (ligne 75)
  - Lit le profil depuis `profiles`
- ✅ **`app/api/profile/update/route.ts`** (lignes 78, 105, 198)
  - Lit et met à jour `profiles`

### 4. Autres

- ✅ **`scripts/verify-supabase-setup.ts`** (vérifie `profiles`)
- ✅ **`middleware.ts`** (probablement vérifie `profiles`)
- ✅ **`docs/PROTECTION_ROUTES.md`** (documentation)
- ✅ **`docs/AUTHENTIFICATION.md`** (documentation)

---

## 📁 Fichiers Utilisant `users` (Déjà OK)

### 1. Services

- ✅ **`lib/services.ts`**
  - Utilise déjà `users`

### 2. Pages

- ✅ **`app/dashboard/geolocation/page.tsx`**
  - Utilise `users`

---

## 🔄 Système Multi-Rôles Actuel

### AuthContext (`contexts/AuthContext.tsx`)

- Utilise `localStorage` pour `active_role`
- Pas de synchronisation avec la base de données
- **Problème** : Le rôle n'est pas persisté en DB

### RoleSwitcher (`components/RoleSwitcher.tsx`)

- Utilise `AuthContext` (localStorage)
- Pas de mise à jour en base de données
- **Problème** : Changement de rôle non persisté

---

## 📋 Plan de Migration

### Phase 1 : Migration SQL ✅

1. Créer `supabase/migrations/003_use_users_table.sql`
   - Ajouter colonnes `roles` et `active_role` à `users` (si absentes)
   - Créer trigger auto-création `users` après signup
   - Remplacer trigger `profiles`

### Phase 2 : Adaptation Services ✅

1. Modifier `services/auth/authService.ts`
   - Remplacer `profiles` par `users`
   - Ajouter `switchRole()` pour changer `active_role`
   - Adapter `getUserProfile()` et `updateProfile()`

### Phase 3 : Adaptation Hooks ✅

1. Modifier `hooks/useAuth.ts`
   - Utiliser `users` au lieu de `profiles`
   - Ajouter support `roles` et `active_role`

### Phase 4 : Adaptation API Routes ✅

1. Modifier `app/api/auth/session/route.ts`
   - Lire depuis `users`
2. Modifier `app/api/profile/update/route.ts`
   - Utiliser `users`

### Phase 5 : Adaptation Composants ✅

1. Modifier `contexts/AuthContext.tsx`
   - Synchroniser avec `users.active_role` en DB
2. Modifier `components/RoleSwitcher.tsx`
   - Utiliser `AuthService.switchRole()` pour persister en DB

### Phase 6 : Pages Signup/Login ✅

1. Trouver/créer pages signup/login
2. Adapter pour utiliser `users` via `AuthService`

---

## ⚠️ Points d'Attention

1. **Colonnes manquantes** : Vérifier que `users` a bien `roles` et `active_role`
   - Si non, les ajouter dans la migration

2. **Données existantes** : Utilisateurs existants dans `profiles`
   - Option 1 : Migration de données `profiles` → `users`
   - Option 2 : Créer les entrées `users` manuellement
   - Option 3 : Créer via trigger (re-signup)

3. **RLS Policies** : Vérifier que les politiques RLS sur `users` sont correctes
   - `users` doit être accessible pour lecture/mise à jour par l'utilisateur

4. **Compatibilité** : Le système actuel utilise `farmer`/`distributor`
   - Le schéma SQL utilise `producer`/`distributor`
   - **Décision** : Utiliser `farmer` (producteur) et `distributor` pour correspondre au contexte

---

## ✅ Checklist Migration

- [ ] Créer migration SQL `003_use_users_table.sql`
- [ ] Exécuter migration dans Supabase
- [ ] Adapter `authService.ts`
- [ ] Adapter `useAuth.ts`
- [ ] Adapter `AuthContext.tsx`
- [ ] Adapter `RoleSwitcher.tsx`
- [ ] Adapter `app/api/auth/session/route.ts`
- [ ] Adapter `app/api/profile/update/route.ts`
- [ ] Tester signup → vérifier création dans `users`
- [ ] Tester login → vérifier lecture depuis `users`
- [ ] Tester switch rôle → vérifier mise à jour `active_role`
- [ ] Créer rapport final

---

**Note** : Après migration complète, la table `profiles` pourra être supprimée (mais pas dans cette phase pour sécurité).
