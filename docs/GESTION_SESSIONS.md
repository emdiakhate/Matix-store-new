# 🔐 Documentation Gestion des Sessions - Matix Store

## 📋 Vue d'ensemble

Cette documentation décrit le système de gestion des sessions sécurisées implémenté pour remplacer le stockage non sécurisé en localStorage.

## 🏗️ Architecture de sécurité

### Composants principaux

```
services/storage/
└── secureStorage.ts      # Stockage sécurisé avec chiffrement

services/auth/
└── sessionService.ts     # Gestion des sessions

hooks/
└── useSession.ts        # Hook de gestion des sessions

utils/
└── migrateLocalStorage.ts # Migration des données
```

## 🔒 Niveaux de sécurité des données

### 1. **CRITICAL** (Critique)
*Chiffrement AES + sessionStorage*

- **Données** : Tokens d'authentification, mots de passe, données sensibles
- **Stockage** : sessionStorage avec chiffrement AES-256
- **Durée** : 2 heures maximum
- **Exemples** : `currentUser`, `active_role`, `user_tokens`, `auth_data`

### 2. **IMPORTANT** (Important)
*sessionStorage sans chiffrement*

- **Données** : Profil utilisateur, préférences, données de session
- **Stockage** : sessionStorage
- **Durée** : Session du navigateur
- **Exemples** : `user_preferences`, `cart_data`, `search_history`

### 3. **NORMAL** (Normal)
*localStorage (acceptable)*

- **Données** : Préférences UI, thème, langue
- **Stockage** : localStorage
- **Durée** : Persistant
- **Exemples** : `theme_preferences`, `ui_state`, `language`

## 🚀 Utilisation

### Hook useSession

```typescript
import { useSession } from '@/hooks/useSession'

function SessionManager() {
  const {
    isAuthenticated,
    timeRemaining,
    idleTime,
    refreshSession,
    extendSession,
    isExpiringSoon,
    formatTimeRemaining
  } = useSession()

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Temps restant: {formatTimeRemaining}</p>
          <p>Temps d'inactivité: {idleTime}</p>
          
          {isExpiringSoon() && (
            <div className="warning">
              <p>⚠️ Session expire bientôt!</p>
              <button onClick={() => extendSession()}>
                Prolonger la session
              </button>
            </div>
          )}
          
          <button onClick={refreshSession}>
            Rafraîchir la session
          </button>
        </div>
      ) : (
        <p>Non connecté</p>
      )}
    </div>
  )
}
```

### Service de stockage sécurisé

```typescript
import { secureStorage } from '@/services/storage/secureStorage'

// Stockage avec chiffrement automatique
secureStorage.setItem('user_data', userData, true) // Chiffré
const userData = secureStorage.getItem('user_data', true)

// Stockage selon le niveau de sécurité
secureStorage.setItem('user_preferences', preferences) // SessionStorage
secureStorage.setItem('theme', 'dark') // localStorage

// Validation des données
const isValid = secureStorage.validateData('user_data')

// Nettoyage des données expirées
const cleanedCount = secureStorage.cleanupExpiredData()
```

### Service de session

```typescript
import { sessionService } from '@/services/auth/sessionService'

// Créer une session
const session = await sessionService.createSession({
  id: 'user123',
  email: 'user@example.com',
  role: 'acheteur'
})

// Récupérer la session
const currentSession = sessionService.getSession()

// Rafraîchir la session
const refreshedSession = await sessionService.refreshSession()

// Prolonger la session
sessionService.extendSession(2 * 60 * 60 * 1000) // 2 heures

// Détruire la session
sessionService.destroySession()
```

## ⏰ Gestion du temps

### Durée de vie des sessions

- **Durée par défaut** : 2 heures
- **Inactivité maximale** : 30 minutes
- **Avertissement** : 5 minutes avant expiration
- **Rafraîchissement automatique** : Toutes les 5 minutes

### Détection d'activité

```typescript
// Événements trackés automatiquement
const trackedEvents = [
  'click',      // Clics de souris
  'scroll',     // Défilement
  'keydown',    // Frappe clavier
  'mousemove',  // Mouvement souris
  'touchstart'  // Toucher (mobile)
]

// Mise à jour manuelle de l'activité
sessionService.updateActivity()
```

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
      // Rediriger vers la page de connexion
      break
    case 'destroyed':
      console.log('Session détruite')
      break
  }
})

// Nettoyer l'écoute
unsubscribe()
```

## 🔐 Chiffrement des données

### Configuration du chiffrement

```typescript
// Clé de chiffrement (à définir dans .env)
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key_here

// Durée de session (en minutes)
NEXT_PUBLIC_SESSION_DURATION=120
```

### Algorithme de chiffrement

- **Algorithme** : AES-256
- **Mode** : CBC
- **Clé** : Dérivée de la session + clé secrète
- **IV** : Généré automatiquement

### Exemple de chiffrement

```typescript
// Données à chiffrer
const sensitiveData = {
  email: 'user@example.com',
  password: 'secret123',
  tokens: ['token1', 'token2']
}

// Chiffrement automatique
secureStorage.setItem('sensitive_data', sensitiveData, true)

// Les données sont automatiquement chiffrées
const encrypted = sessionStorage.getItem('sensitive_data')
console.log(encrypted) // "U2FsdGVkX1+vupppZksvRf5pq5g5XjFRlipRkwB0K1Y=..."

// Déchiffrement automatique
const decrypted = secureStorage.getItem('sensitive_data', true)
console.log(decrypted) // { email: 'user@example.com', password: 'secret123', ... }
```

## 🔄 Migration des données

### Migration automatique

```typescript
import { migrateLocalStorage } from '@/utils/migrateLocalStorage'

// Migration complète
const result = await migrateLocalStorage()
console.log(`Migration: ${result.migrated} succès, ${result.failed} échecs`)

// Migration d'une clé spécifique
const success = await migrateKey('currentUser')
```

### Clés migrées automatiquement

```typescript
const MIGRATION_KEYS = {
  critical: [
    'currentUser',      // → sessionStorage + chiffrement
    'active_role',      // → sessionStorage + chiffrement
    'user_tokens',      // → sessionStorage + chiffrement
    'auth_data'         // → sessionStorage + chiffrement
  ],
  important: [
    'user_preferences',    // → sessionStorage
    'cart_data',           // → sessionStorage
    'search_history',      // → sessionStorage
    'user_location',       // → sessionStorage
    'producer_verification' // → sessionStorage
  ],
  normal: [
    'theme_preferences',   // → localStorage (OK)
    'ui_state',           // → localStorage (OK)
    'language',           // → localStorage (OK)
    'sidebar_collapsed'    // → localStorage (OK)
  ]
}
```

### Validation de la migration

```typescript
// Vérifier l'intégrité de la migration
const validation = await localStorageMigrator.validateMigration()
if (validation.valid) {
  console.log('✅ Migration réussie')
} else {
  console.error('❌ Erreurs de migration:', validation.errors)
}
```

## 🧪 Tests de sécurité

### Tests de chiffrement

```typescript
// Test du chiffrement/déchiffrement
const testData = { email: 'test@example.com', id: '123' }
secureStorage.setItem('test', testData, true)
const retrieved = secureStorage.getItem('test', true)
console.assert(JSON.stringify(testData) === JSON.stringify(retrieved))

// Test de la protection XSS
const maliciousData = { name: '<script>alert("XSS")</script>' }
secureStorage.setItem('malicious', maliciousData, true)
const rawData = sessionStorage.getItem('malicious')
console.assert(rawData.includes('&lt;script&gt;'))
```

### Tests de session

```typescript
// Test de création de session
const session = await sessionService.createSession({
  id: 'user123',
  email: 'test@example.com',
  role: 'acheteur'
})
console.assert(session !== null)

// Test d'expiration
const expiredSession = { ...session, expiresAt: Date.now() - 1000 }
secureStorage.setItem('user_session', expiredSession, true)
const retrieved = sessionService.getSession()
console.assert(retrieved === null)
```

## 📊 Monitoring et métriques

### Statistiques du stockage

```typescript
// Obtenir les statistiques
const stats = secureStorage.getStorageStats()
console.log('Taille totale:', stats.totalSize, 'bytes')
console.log('Clés sessionStorage:', stats.sessionStorage.keys)
console.log('Clés localStorage:', stats.localStorage.keys)
```

### Logs de sécurité

```typescript
// Les événements critiques sont loggés
console.log('✅ Session créée avec succès:', sessionId)
console.warn('⚠️ Session expire dans', minutes, 'minutes')
console.error('❌ Erreur lors de la connexion:', error)
```

### Métriques de session

```typescript
// Temps restant avant expiration
const timeRemaining = sessionService.getTimeRemaining()
console.log('Temps restant:', timeRemaining, 'ms')

// Temps d'inactivité
const idleTime = sessionService.getIdleTime()
console.log('Temps d\'inactivité:', idleTime, 'ms')

// Statut de la session
const isValid = sessionService.isSessionValid()
console.log('Session valide:', isValid)
```

## 🛠️ Maintenance

### Nettoyage automatique

```typescript
// Nettoyage des données expirées
const cleanedCount = secureStorage.cleanupExpiredData()
console.log(`${cleanedCount} éléments expirés supprimés`)

// Nettoyage manuel
secureStorage.clear() // Nettoyage complet
```

### Sauvegarde et restauration

```typescript
// Sauvegarde avant migration
const backup = localStorageMigrator.backupData()

// Restauration en cas de problème
const restored = await localStorageMigrator.restoreFromBackup()
if (restored) {
  console.log('✅ Données restaurées')
}
```

## ⚠️ Bonnes pratiques

### Sécurité

1. **Jamais stocker de mots de passe en clair**
2. **Utiliser le chiffrement pour les données sensibles**
3. **Implémenter l'expiration automatique**
4. **Valider toutes les données utilisateur**

### Performance

1. **Éviter les opérations de chiffrement fréquentes**
2. **Utiliser le cache local quand possible**
3. **Nettoyer régulièrement les données expirées**
4. **Optimiser la taille des données stockées**

### Maintenance

1. **Monitorer les logs de sécurité**
2. **Tester régulièrement les migrations**
3. **Mettre à jour les clés de chiffrement**
4. **Documenter les changements**

## 🚨 Dépannage

### Problèmes courants

#### Session expirée prématurément
```typescript
// Vérifier la configuration
const sessionDuration = process.env.NEXT_PUBLIC_SESSION_DURATION
console.log('Durée de session:', sessionDuration, 'minutes')

// Vérifier l'activité
const idleTime = sessionService.getIdleTime()
console.log('Temps d\'inactivité:', idleTime, 'ms')
```

#### Données non chiffrées
```typescript
// Vérifier la clé de chiffrement
const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY
if (!encryptionKey) {
  console.error('❌ Clé de chiffrement manquante')
}

// Vérifier le niveau de sécurité
const securityLevel = secureStorage.getSecurityLevel('user_data')
console.log('Niveau de sécurité:', securityLevel)
```

#### Migration échouée
```typescript
// Vérifier le statut de migration
const status = localStorageMigrator.getMigrationStatus()
console.log('Migration terminée:', status.completed)
console.log('Clés migrées:', status.migratedKeys)

// Restaurer depuis la sauvegarde
const restored = await localStorageMigrator.restoreFromBackup()
```

## 📚 Ressources

- [Documentation Crypto-JS](https://cryptojs.gitbook.io/docs/)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [Session Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)
- [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

**Dernière mise à jour** : 2024-12-19  
**Version** : 1.0.0  
**Auteur** : Assistant IA