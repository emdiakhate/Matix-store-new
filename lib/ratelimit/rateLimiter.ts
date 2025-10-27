/**
 * Interface pour les limites de rate limiting
 */
interface RateLimit {
  requests: number
  windowMs: number
  blockDurationMs: number
}

/**
 * Interface pour le résultat du rate limiting
 */
interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter: number
}

/**
 * Configuration des limites par endpoint
 */
const RATE_LIMITS: Record<string, RateLimit> = {
  // Authentification
  'auth_signin': {
    requests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  },
  
  'auth_signup': {
    requests: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 60 * 60 * 1000 // 1 heure
  },
  
  'auth_reset': {
    requests: 3,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 60 * 60 * 1000 // 1 heure
  },
  
  // Produits
  'product_create': {
    requests: 10,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 30 * 60 * 1000 // 30 minutes
  },
  
  'product_update': {
    requests: 50,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  },
  
  // Profil
  'profile_update': {
    requests: 20,
    windowMs: 60 * 60 * 1000, // 1 heure
    blockDurationMs: 15 * 60 * 1000 // 15 minutes
  },
  
  // API générales
  'api_general': {
    requests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000 // 5 minutes
  }
}

/**
 * Stockage en mémoire pour le rate limiting
 * En production, utiliser Redis ou une base de données
 */
class InMemoryStore {
  private store = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>()

  get(key: string) {
    return this.store.get(key)
  }

  set(key: string, value: { count: number; resetTime: number; blockedUntil?: number }) {
    this.store.set(key, value)
  }

  delete(key: string) {
    this.store.delete(key)
  }

  // Nettoyage périodique des entrées expirées
  cleanup() {
    const now = Date.now()
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now && (!value.blockedUntil || value.blockedUntil < now)) {
        this.store.delete(key)
      }
    }
  }
}

/**
 * Service de rate limiting
 */
export class RateLimiter {
  private store: InMemoryStore
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    this.store = new InMemoryStore()
    
    // Nettoyage automatique toutes les 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.store.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Vérifier si une requête est autorisée
   */
  async checkLimit(endpoint: string, identifier: string): Promise<RateLimitResult> {
    const limit = RATE_LIMITS[endpoint] || RATE_LIMITS['api_general']
    const key = `${endpoint}:${identifier}`
    const now = Date.now()
    
    const existing = this.store.get(key)
    
    // Si l'utilisateur est bloqué
    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil((existing.blockedUntil - now) / 1000)
      }
    }
    
    // Si c'est une nouvelle fenêtre de temps ou première requête
    if (!existing || existing.resetTime <= now) {
      const newEntry = {
        count: 1,
        resetTime: now + limit.windowMs
      }
      this.store.set(key, newEntry)
      
      return {
        allowed: true,
        remaining: limit.requests - 1,
        resetTime: newEntry.resetTime,
        retryAfter: 0
      }
    }
    
    // Vérifier si la limite est atteinte
    if (existing.count >= limit.requests) {
      // Bloquer l'utilisateur
      const blockedUntil = now + limit.blockDurationMs
      this.store.set(key, {
        ...existing,
        blockedUntil
      })
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.resetTime,
        retryAfter: Math.ceil(limit.blockDurationMs / 1000)
      }
    }
    
    // Incrémenter le compteur
    const updatedEntry = {
      ...existing,
      count: existing.count + 1
    }
    this.store.set(key, updatedEntry)
    
    return {
      allowed: true,
      remaining: limit.requests - updatedEntry.count,
      resetTime: existing.resetTime,
      retryAfter: 0
    }
  }

  /**
   * Réinitialiser les limites pour un identifiant
   */
  async resetLimit(endpoint: string, identifier: string): Promise<boolean> {
    const key = `${endpoint}:${identifier}`
    this.store.delete(key)
    return true
  }

  /**
   * Obtenir les statistiques de rate limiting
   */
  getStats(): {
    totalKeys: number
    activeBlocks: number
    endpoints: Record<string, { active: number; blocked: number }>
  } {
    const now = Date.now()
    const stats = {
      totalKeys: 0,
      activeBlocks: 0,
      endpoints: {} as Record<string, { active: number; blocked: number }>
    }
    
    for (const [key, value] of this.store.store.entries()) {
      stats.totalKeys++
      
      const [endpoint] = key.split(':')
      if (!stats.endpoints[endpoint]) {
        stats.endpoints[endpoint] = { active: 0, blocked: 0 }
      }
      
      if (value.blockedUntil && value.blockedUntil > now) {
        stats.activeBlocks++
        stats.endpoints[endpoint].blocked++
      } else {
        stats.endpoints[endpoint].active++
      }
    }
    
    return stats
  }

  /**
   * Nettoyage des ressources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.store.store.clear()
  }
}

// Instance singleton du rate limiter
export const rateLimiter = new RateLimiter()

/**
 * Middleware de rate limiting pour les API routes
 */
export function withRateLimit(endpoint: string) {
  return function(handler: Function) {
    return async function(request: Request, ...args: any[]) {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
      
      const result = await rateLimiter.checkLimit(endpoint, ip)
      
      if (!result.allowed) {
        return new Response(
          JSON.stringify({
            error: 'Trop de requêtes',
            retryAfter: result.retryAfter,
            code: 'RATE_LIMIT_EXCEEDED'
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': result.retryAfter.toString(),
              'X-RateLimit-Limit': RATE_LIMITS[endpoint]?.requests.toString() || '100',
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString()
            }
          }
        )
      }
      
      // Ajouter les headers de rate limiting à la réponse
      const response = await handler(request, ...args)
      
      if (response instanceof Response) {
        response.headers.set('X-RateLimit-Limit', RATE_LIMITS[endpoint]?.requests.toString() || '100')
        response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
        response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
      }
      
      return response
    }
  }
}

/**
 * Fonction utilitaire pour vérifier le rate limit
 */
export async function checkRateLimit(endpoint: string, identifier: string): Promise<RateLimitResult> {
  return await rateLimiter.checkLimit(endpoint, identifier)
}

/**
 * Fonction utilitaire pour réinitialiser le rate limit
 */
export async function resetRateLimit(endpoint: string, identifier: string): Promise<boolean> {
  return await rateLimiter.resetLimit(endpoint, identifier)
}

/**
 * Fonction utilitaire pour obtenir les statistiques
 */
export function getRateLimitStats() {
  return rateLimiter.getStats()
}

export default rateLimiter
