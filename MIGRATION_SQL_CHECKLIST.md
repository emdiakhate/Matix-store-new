# ✅ Checklist Migration SQL Supabase

## Avant la migration
- [ ] J'ai lu `docs/INSTRUCTIONS_MIGRATION_SQL.md`
- [ ] Je suis connecté au dashboard Supabase
- [ ] J'ai accès au projet Matix Store
- [ ] J'ai le fichier `supabase/migrations/001_initial_schema.sql`
- [ ] J'ai installé les dépendances : `npm install -D tsx dotenv`

## Pendant la migration
- [ ] J'ai ouvert SQL Editor dans Supabase
- [ ] J'ai copié le contenu de `001_initial_schema.sql`
- [ ] J'ai collé dans l'éditeur SQL
- [ ] J'ai cliqué sur "Run"
- [ ] J'ai vu un message de succès

## Après la migration
- [ ] La table "profiles" apparaît dans Table Editor
- [ ] L'icône de cadenas 🔒 est visible (RLS actif)
- [ ] Le type "user_role" est créé avec les valeurs : eleveur, acheteur, admin
- [ ] J'ai exécuté `npm run verify-supabase`
- [ ] Le script de vérification montre 5/5 tests réussis

## Vérification des colonnes de la table profiles
- [ ] `id` (UUID, clé primaire)
- [ ] `email` (TEXT, non null)
- [ ] `nom` (TEXT, non null)
- [ ] `prenom` (TEXT, non null)
- [ ] `telephone` (TEXT, non null)
- [ ] `role` (user_role, défaut 'acheteur')
- [ ] `avatar_url` (TEXT, nullable)
- [ ] `created_at` (TIMESTAMP WITH TIME ZONE)
- [ ] `updated_at` (TIMESTAMP WITH TIME ZONE)

## Vérification des policies RLS
- [ ] "Users can read their own profile" (SELECT)
- [ ] "Users can update their own profile" (UPDATE)
- [ ] "Users can insert their own profile" (INSERT)
- [ ] "Public profiles are viewable by everyone" (SELECT)

## Vérification des triggers
- [ ] `handle_updated_at_profiles` (mise à jour automatique)
- [ ] `on_auth_user_created` (création automatique de profil)
- [ ] `on_auth_user_deleted` (suppression automatique de profil)

## Vérification des fonctions
- [ ] `handle_updated_at()` (mise à jour timestamp)
- [ ] `handle_new_user()` (création profil)
- [ ] `handle_user_deleted()` (suppression profil)

## Vérification des index
- [ ] `profiles_email_idx` (index sur email)
- [ ] `profiles_role_idx` (index sur role)
- [ ] `profiles_telephone_idx` (index sur telephone)

## En cas de problème
- [ ] J'ai copié le message d'erreur complet
- [ ] J'ai vérifié `docs/INSTRUCTIONS_MIGRATION_SQL.md` section "En cas de problème"
- [ ] J'ai exécuté `npm run verify-supabase` pour diagnostiquer
- [ ] J'ai partagé l'erreur si besoin d'aide

## Tests fonctionnels
- [ ] Je peux créer un nouvel utilisateur via l'interface
- [ ] Le profil est créé automatiquement dans la table profiles
- [ ] Les données du profil correspondent aux données d'inscription
- [ ] Le rôle par défaut est 'acheteur'
- [ ] Les timestamps created_at et updated_at sont corrects

---

**Date de migration** : __________  
**Exécuté par** : __________  
**Statut** : ⬜ Réussie  ⬜ En cours  ⬜ Problème

## Notes
```
[Espace pour noter les observations, erreurs rencontrées, etc.]
```

---

## 🎯 Prochaines étapes après migration réussie

1. **Tester l'inscription d'un utilisateur**
   - Aller sur la page d'inscription
   - Créer un compte avec des données valides
   - Vérifier que le profil apparaît dans la table profiles

2. **Vérifier la sécurité**
   - Tenter d'accéder aux données sans authentification
   - Vérifier que RLS bloque l'accès

3. **Continuer le développement**
   - Migrer l'ancien système d'authentification
   - Tester les API routes sécurisées
   - Valider le rate limiting

4. **Documentation**
   - Mettre à jour la documentation
   - Noter les changements apportés
   - Partager les bonnes pratiques

---

**Félicitations ! Votre base de données Supabase est maintenant sécurisée ! 🎉**
