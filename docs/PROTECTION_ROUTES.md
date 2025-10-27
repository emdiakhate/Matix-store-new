# 🛡️ Documentation Protection des Routes - Matix Store

## 📋 Vue d'ensemble

Cette documentation décrit le système complet de protection des routes implémenté avec Supabase Auth, incluant la validation côté serveur, le rate limiting et le logging de sécurité.

## 🏗️ Architecture de sécurité

### Composants principaux

```
middleware.ts                    # Protection automatique des routes
├── app/api/auth/               # API routes d'authentification
│   ├── callback/route.ts       # Callback OAuth
│   ├── signout/route.ts        # Déconnexion serveur
│   └── session/route.ts        # Vérification session
├── app/api/products/           # API routes produits
│   ├── create/route.ts         # Création produit
│   └── update/[id]/route.ts    # Mise à jour produit
├── app/api/profile/            # API routes profil
│   └── update/route.ts         # Mise à jour profil
├── components/auth/            # Composants de protection
│   └── ProtectedRoute.tsx      # Protection côté client
├── lib/validation/            # Validation des données
│   └── schemas.ts             # Schémas Zod
├── lib/ratelimit/             # Rate limiting
│   └── rateLimiter.ts         # Limitation des requêtes
└── lib/logging/               # Logging de sécurité
    └── securityLogger.ts      # Logs de sécurité
```

## 🛣️ Routes et niveaux de protection

### Routes publiques (accès libre)
```
/                           # Page d'accueil
/annonces                   # Liste des annonces
/annonces/[id]              # Détail d'une annonce
/login                      # Page de connexion
/signup                     # Page d'inscription
/reset-password             # Réinitialisation mot de passe
/auth/callback              # Callback OAuth
/api/auth/callback          # API callback
/api/auth/session           # API vérification session
```

### Routes d'authentification (redirigent si connecté)
```
/login                      # → /dashboard si connecté
/signup                     # → /dashboard si connecté
/reset-password             # → /dashboard si connecté
```

### Routes protégées (nécessitent authentification)
```
/dashboard                  # Tableau de bord
/profile                    # Profil utilisateur
/chat                       # Chat
/favoris                    # Favoris
/commandes                  # Commandes
```

### Routes spécifiques aux éleveurs
```
/mes-annonces              # Mes annonces
/statistiques              # Statistiques
/annonces/create           # Créer une annonce
```

### Routes spécifiques aux admins
```
/admin                     # Administration
```

## 🔧 Configuration du middleware

### Variables d'environnement requises
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Configuration des routes
Le middleware vérifie automatiquement :
- **Authentification** : Session Supabase valide
- **Rôles** : Rôle utilisateur approprié
- **Redirections** : URLs de retour après connexion
- **Logging** : Événements de sécurité

## 🎣 Utilisation du composant ProtectedRoute

### Protection basique
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>Contenu protégé</div>
    </ProtectedRoute>
  )
}
```

### Protection avec rôle requis
```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

function MesAnnoncesPage() {
  return (
    <ProtectedRoute requiredRole="eleveur">
      <div>Contenu réservé aux éleveurs</div>
    </ProtectedRoute>
  )
}
```

### Protection avec fallback personnalisé
```tsx
import { ProtectedRoute, AccessDenied } from '@/components/auth/ProtectedRoute'

function AdminPage() {
  return (
    <ProtectedRoute 
      requiredRole="admin"
      fallback={<AccessDenied message="Accès admin requis" />}
    >
      <div>Contenu admin</div>
    </ProtectedRoute>
  )
}
```

### Hook de permissions
```tsx
import { usePermissions } from '@/components/auth/ProtectedRoute'

function MyComponent() {
  const { hasRole, isAdmin, canAccess } = usePermissions()

  return (
    <div>
      {hasRole('eleveur') && <EleveurContent />}
      {isAdmin() && <AdminContent />}
      {canAccess('acheteur') && <AcheteurContent />}
    </div>
  )
}
```

### Contenu conditionnel basé sur les rôles
```tsx
import { RoleBasedContent } from '@/components/auth/ProtectedRoute'

function ProductCard() {
  return (
    <div>
      <h3>Produit</h3>
      
      <RoleBasedContent roles={['eleveur', 'admin']}>
        <button>Modifier</button>
      </RoleBasedContent>
      
      <RoleBasedContent roles={['acheteur', 'admin']}>
        <button>Acheter</button>
      </RoleBasedContent>
    </div>
  )
}
```

## 📝 Schémas de validation

### Schémas disponibles
- `signUpSchema` - Inscription utilisateur
- `signInSchema` - Connexion utilisateur
- `resetPasswordSchema` - Réinitialisation mot de passe
- `updatePasswordSchema` - Mise à jour mot de passe
- `updateProfileSchema` - Mise à jour profil
- `createProductSchema` - Création produit
- `updateProductSchema` - Mise à jour produit
- `createOrderSchema` - Création commande
- `contactSchema` - Message de contact

### Utilisation des schémas
```typescript
import { validateData, signUpSchema } from '@/lib/validation/schemas'

const userData = {
  email: 'user@example.com',
  password: 'SecurePass123!',
  nom: 'Dupont',
  prenom: 'Jean',
  telephone: '+221771234567'
}

const result = validateData(signUpSchema, userData)

if (result.success) {
  // Données valides
  console.log('Utilisateur valide:', result.data)
} else {
  // Erreurs de validation
  console.error('Erreurs:', result.errors)
}
```

### Validation sécurisée
```typescript
import { safeValidate, createProductSchema } from '@/lib/validation/schemas'

try {
  const productData = safeValidate(createProductSchema, requestBody)
  // Données validées et sécurisées
} catch (error) {
  // Erreur de validation
  return NextResponse.json({ error: error.message }, { status: 400 })
}
```

## 🚦 Rate Limiting

### Limites par endpoint
```typescript
const RATE_LIMITS = {
  'auth_signin': {
    requests: 5,           // 5 tentatives
    windowMs: 15 * 60 * 1000,  // en 15 minutes
    blockDurationMs: 15 * 60 * 1000  // blocage 15 minutes
  },
  'auth_signup': {
    requests: 3,           // 3 inscriptions
    windowMs: 60 * 60 * 1000,  // par heure
    blockDurationMs: 60 * 60 * 1000  // blocage 1 heure
  },
  'product_create': {
    requests: 10,          // 10 créations
    windowMs: 60 * 60 * 1000,  // par heure
    blockDurationMs: 30 * 60 * 1000  // blocage 30 minutes
  }
}
```

### Utilisation du rate limiter
```typescript
import { rateLimiter } from '@/lib/ratelimit/rateLimiter'

// Vérifier la limite
const result = await rateLimiter.checkLimit('auth_signin', ip)

if (!result.allowed) {
  return NextResponse.json(
    { error: 'Trop de tentatives', retryAfter: result.retryAfter },
    { status: 429, headers: { 'Retry-After': result.retryAfter.toString() } }
  )
}
```

### Middleware de rate limiting
```typescript
import { withRateLimit } from '@/lib/ratelimit/rateLimiter'

export const POST = withRateLimit('product_create')(async (request) => {
  // Handler protégé par rate limiting
})
```

## 📊 Logging de sécurité

### Types d'événements loggés
```typescript
enum SecurityEventType {
  // Authentification
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  
  // Accès
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_ROLE = 'INSUFFICIENT_ROLE',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Produits
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  
  // Erreurs
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### Utilisation du logger
```typescript
import { securityLogger } from '@/lib/logging/securityLogger'

// Logger un événement
securityLogger.log('LOGIN_FAILED', {
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  endpoint: '/api/auth/signin',
  reason: 'invalid_credentials'
})

// Logger une erreur
securityLogger.log('INTERNAL_ERROR', {
  ip: '192.168.1.1',
  endpoint: '/api/products/create',
  error: error.message,
  stack: error.stack
})
```

### Récupération des logs
```typescript
// Tous les logs
const allLogs = securityLogger.getLogs()

// Logs par type
const failedLogins = securityLogger.getLogs({ type: 'LOGIN_FAILED' })

// Logs par sévérité
const criticalLogs = securityLogger.getLogs({ severity: 'critical' })

// Logs par utilisateur
const userLogs = securityLogger.getLogs({ userId: 'user123' })

// Statistiques
const stats = securityLogger.getStats()
```

## 🔒 API Routes sécurisées

### Structure des API routes
```typescript
// Exemple: app/api/products/create/route.ts
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = await rateLimiter.checkLimit('product_create', ip)
    if (!rateLimitResult.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // 2. Vérification authentification
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // 3. Vérification rôle
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single()
    if (profile?.role !== 'eleveur' && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Rôle insuffisant' }, { status: 403 })
    }

    // 4. Validation données
    const validation = validateData(createProductSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: 'Données invalides', details: validation.errors }, { status: 400 })
    }

    // 5. Traitement métier
    const { data: product } = await supabase.from('products').insert(validation.data).select().single()

    // 6. Logging succès
    securityLogger.log('PRODUCT_CREATED', { userId: session.user.id, productId: product.id })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    // 7. Logging erreur
    securityLogger.log('INTERNAL_ERROR', { error: error.message })
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
```

### Codes de réponse standardisés
```typescript
// Succès
200 OK                    // Requête réussie
201 Created              // Ressource créée
204 No Content           // Suppression réussie

// Erreurs client
400 Bad Request          // Données invalides
401 Unauthorized         // Non authentifié
403 Forbidden           // Rôle insuffisant
404 Not Found           // Ressource non trouvée
429 Too Many Requests   // Rate limit dépassé

// Erreurs serveur
500 Internal Server Error // Erreur interne
```

## 🧪 Tests de sécurité

### Tests de rate limiting
```typescript
test('should block requests exceeding limit', async () => {
  const ip = '192.168.1.1'
  
  // Faire 5 requêtes (limite)
  for (let i = 0; i < 5; i++) {
    await rateLimiter.checkLimit('auth_signin', ip)
  }
  
  // La 6ème requête devrait être bloquée
  const result = await rateLimiter.checkLimit('auth_signin', ip)
  expect(result.allowed).toBe(false)
})
```

### Tests de validation
```typescript
test('should reject weak passwords', () => {
  const weakPasswordData = {
    email: 'test@example.com',
    password: '123456', // Trop faible
    nom: 'Dupont',
    prenom: 'Jean',
    telephone: '+221771234567'
  }
  
  const result = validateData(signUpSchema, weakPasswordData)
  expect(result.success).toBe(false)
  expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères')
})
```

### Tests de logging
```typescript
test('should log security events', () => {
  securityLogger.log('LOGIN_FAILED', {
    ip: '192.168.1.1',
    userAgent: 'test-agent',
    endpoint: '/api/auth/signin'
  })
  
  const logs = securityLogger.getLogs()
  expect(logs).toHaveLength(1)
  expect(logs[0].event.type).toBe('LOGIN_FAILED')
})
```

## 🚨 Gestion des erreurs

### Types d'erreurs de sécurité
```typescript
// Erreurs d'authentification
UNAUTHENTICATED          // Non authentifié
INSUFFICIENT_ROLE        // Rôle insuffisant
INVALID_CREDENTIALS      // Identifiants invalides

// Erreurs de validation
VALIDATION_ERROR         // Données invalides
WEAK_PASSWORD           // Mot de passe faible
INVALID_EMAIL           // Email invalide

// Erreurs de rate limiting
RATE_LIMIT_EXCEEDED     // Trop de requêtes
BLOCKED_IP              // IP bloquée

// Erreurs de base de données
DATABASE_ERROR          // Erreur DB
PRODUCT_NOT_FOUND       // Produit non trouvé
PROFILE_NOT_FOUND       // Profil non trouvé
```

### Messages d'erreur en français
```typescript
const ERROR_MESSAGES = {
  UNAUTHENTICATED: 'Vous devez être connecté pour accéder à cette ressource',
  INSUFFICIENT_ROLE: 'Vous n\'avez pas les permissions nécessaires',
  RATE_LIMIT_EXCEEDED: 'Trop de tentatives. Veuillez réessayer plus tard',
  VALIDATION_ERROR: 'Les données fournies sont invalides',
  WEAK_PASSWORD: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre'
}
```

## 📈 Monitoring et alertes

### Métriques importantes
- **Tentatives de connexion échouées** par IP
- **Tentatives d'accès non autorisé** par utilisateur
- **Rate limiting** par endpoint
- **Erreurs de validation** par type
- **Activités suspectes** détectées

### Alertes automatiques
- **5+ tentatives de connexion échouées** en 5 minutes → Blocage IP
- **3+ activités suspectes** en 10 minutes → Alerte sécurité
- **Erreurs critiques** → Notification immédiate
- **Rate limiting dépassé** → Log et monitoring

## 🔧 Configuration et déploiement

### Variables d'environnement
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Sécurité
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key
NEXT_PUBLIC_SESSION_DURATION=120

# Monitoring (optionnel)
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Configuration de production
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
        ]
      }
    ]
  }
}
```

## 📚 Ressources

- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zod Validation](https://zod.dev/)
- [Rate Limiting Best Practices](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)

---

**Dernière mise à jour** : 2024-12-19  
**Version** : 1.0.0  
**Auteur** : Assistant IA
