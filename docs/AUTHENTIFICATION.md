# 🔐 Documentation Authentification - Matix Store

## 📋 Vue d'ensemble

Cette documentation décrit le système d'authentification sécurisé implémenté avec Supabase Auth pour remplacer l'ancien système faible basé sur un mot de passe unique.

## 🏗️ Architecture

### Composants principaux

```
lib/supabase/
├── client.ts          # Client Supabase côté client (sécurisé)
└── server.ts          # Client Supabase côté serveur (admin)

services/auth/
├── authService.ts     # Service d'authentification principal
└── sessionService.ts  # Gestion des sessions sécurisées

services/storage/
└── secureStorage.ts   # Stockage sécurisé avec chiffrement

hooks/
├── useAuth.ts         # Hook d'authentification
└── useSession.ts      # Hook de gestion des sessions

types/
└── auth.types.ts      # Types TypeScript pour l'auth
```

## 🔧 Configuration

### Variables d'environnement requises

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# Sécurité (optionnel)
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key_here
NEXT_PUBLIC_SESSION_DURATION=120
```

### Configuration Supabase

1. **Créer un projet Supabase**
2. **Configurer l'authentification** :
   - Activer l'inscription par email
   - Configurer les URLs de redirection
   - Activer la confirmation d'email (recommandé)

3. **Appliquer la migration** :
   ```sql
   -- Exécuter le fichier supabase/migrations/001_initial_schema.sql
   ```

## 🚀 Utilisation

### Hook useAuth

```typescript
import { useAuth } from '@/hooks/useAuth'

function LoginComponent() {
  const {
    user, 
    profile, 
    loading, 
    error,
    signIn, 
    signUp, 
    signOut,
    isAuthenticated,
    hasRole 
  } = useAuth()

  const handleLogin = async () => {
    const result = await signIn(email, password)
    if (result.success) {
      // Connexion réussie
    } else {
      // Afficher l'erreur
      console.error(result.error?.message)
    }
  }

  return (
    <div>
      {loading && <div>Chargement...</div>}
      {error && <div>Erreur: {error.message}</div>}
      {isAuthenticated ? (
        <div>
          <p>Bonjour {profile?.prenom}!</p>
          <button onClick={signOut}>Déconnexion</button>
        </div>
      ) : (
        <LoginForm onSubmit={handleLogin} />
      )}
    </div>
  )
}
```

### Hook useSession

```typescript
import { useSession } from '@/hooks/useSession'

function SessionStatus() {
  const {
    isAuthenticated,
    timeRemaining,
    idleTime,
    refreshSession,
    extendSession,
    isExpiringSoon
  } = useSession()

  return (
    <div>
      {isAuthenticated && (
        <div>
          <p>Temps restant: {timeRemaining}</p>
          <p>Temps d'inactivité: {idleTime}</p>
          
          {isExpiringSoon() && (
            <div>
              <p>⚠️ Session expire bientôt!</p>
              <button onClick={() => extendSession()}>
                Prolonger la session
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

### Service d'authentification direct

```typescript
import { authService } from '@/services/auth/authService'

// Inscription
const signUpResult = await authService.signUp({
  email: 'user@example.com',
  password: 'SecurePass123',
  nom: 'Dupont',
  prenom: 'Jean',
  telephone: '+221771234567',
  role: 'acheteur'
})

// Connexion
const signInResult = await authService.signIn({
  email: 'user@example.com',
  password: 'SecurePass123'
})

// Vérification de session
const isAuth = await authService.isAuthenticated()
```

## 🔒 Sécurité

### Niveaux de sécurité des données

1. **CRITICAL** : Tokens, données d'auth
   - Stockage : sessionStorage + chiffrement AES
   - Durée : 2 heures maximum

2. **IMPORTANT** : Profil utilisateur, préférences
   - Stockage : sessionStorage
   - Durée : Session du navigateur

3. **NORMAL** : Préférences UI, thème
   - Stockage : localStorage
   - Durée : Persistant

### Validation des données

- **Email** : Format RFC 5322
- **Mot de passe** : Min 8 caractères, 1 majuscule, 1 chiffre
- **Téléphone** : Format sénégalais (+221 ou 77/78/76/70 + 7 chiffres)

### Row Level Security (RLS)

```sql
-- Les utilisateurs ne peuvent voir que leur propre profil
CREATE POLICY "Users can read their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Les profils publics sont visibles par tous (nom, prenom, role uniquement)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
```

## 📊 Gestion des sessions

### Durée de vie des sessions

- **Durée par défaut** : 2 heures
- **Inactivité maximale** : 30 minutes
- **Avertissement** : 5 minutes avant expiration
- **Rafraîchissement automatique** : Toutes les 5 minutes

### Événements de session

```typescript
// Écouter les événements de session
const unsubscribe = sessionService.onSessionEvent((event) => {
  switch (event.type) {
    case 'created':
      console.log('Nouvelle session créée')
      break
    case 'refreshed':
      console.log('Session rafraîchie')
      break
    case 'expired':
      console.log('Session expirée')
      break
    case 'destroyed':
      console.log('Session détruite')
      break
  }
})
```

## 🛠️ Migration depuis l'ancien système

### Étapes de migration

1. **Sauvegarder les données existantes**
2. **Appliquer la nouvelle authentification**
3. **Migrer les utilisateurs** (si nécessaire)
4. **Tester les fonctionnalités**

### Script de migration

```typescript
import { secureStorage } from '@/services/storage/secureStorage'

// Migration des données localStorage
const keysToMigrate = ['currentUser', 'active_role', 'user_preferences']
const result = secureStorage.migrateFromLocalStorage(keysToMigrate)

console.log(`Migration: ${result.migrated} succès, ${result.failed} échecs`)
```

## 🧪 Tests

### Tests de sécurité

```typescript
// Test du chiffrement
const testData = { email: 'test@example.com', id: '123' }
secureStorage.setItem('test', testData, true)
const retrieved = secureStorage.getItem('test', true)
console.assert(JSON.stringify(testData) === JSON.stringify(retrieved))

// Test de l'expiration
const session = sessionService.getSession()
console.assert(session !== null, 'Session devrait être valide')
```

### Tests d'authentification

```typescript
// Test d'inscription
const signUpResult = await authService.signUp({
  email: 'test@example.com',
  password: 'TestPass123',
  nom: 'Test',
  prenom: 'User',
  telephone: '+221771234567'
})
console.assert(signUpResult.success, 'Inscription devrait réussir')

// Test de connexion
const signInResult = await authService.signIn({
  email: 'test@example.com',
  password: 'TestPass123'
})
console.assert(signInResult.success, 'Connexion devrait réussir')
```

## 🚨 Gestion des erreurs

### Types d'erreurs

```typescript
enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  INVALID_EMAIL = 'invalid_email',
  INVALID_PHONE = 'invalid_phone',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}
```

### Messages d'erreur en français

Tous les messages d'erreur sont traduits en français pour une meilleure expérience utilisateur.

## 📈 Monitoring et logs

### Logs de sécurité

```typescript
// Les événements critiques sont loggés
console.log('✅ Session créée avec succès:', sessionId)
console.warn('⚠️ Session expire dans', minutes, 'minutes')
console.error('❌ Erreur lors de la connexion:', error)
```

### Métriques de session

```typescript
// Statistiques du stockage
const stats = secureStorage.getStorageStats()
console.log('Taille totale:', stats.totalSize, 'bytes')
console.log('Clés sessionStorage:', stats.sessionStorage.keys)
console.log('Clés localStorage:', stats.localStorage.keys)
```

## 🔄 Maintenance

### Nettoyage des données expirées

```typescript
// Nettoyage automatique
const cleanedCount = secureStorage.cleanupExpiredData()
console.log(`${cleanedCount} éléments expirés supprimés`)
```

### Mise à jour des sessions

```typescript
// Rafraîchissement manuel
const refreshed = await sessionService.refreshSession()
if (!refreshed) {
  // Rediriger vers la page de connexion
  window.location.href = '/login'
}
```

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Crypto-JS Documentation](https://cryptojs.gitbook.io/docs/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

**Dernière mise à jour** : 2024-12-19  
**Version** : 1.0.0  
**Auteur** : Assistant IA