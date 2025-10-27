import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '../supabase/server'
import { cookies } from 'next/headers'

/**
 * Interface pour les données de session middleware
 */
interface SessionMiddlewareData {
  isValid: boolean
  userId?: string
  email?: string
  role?: string
  sessionId?: string
  expiresAt?: number
  needsRefresh?: boolean
}

/**
 * Middleware de gestion des sessions pour Next.js
 */
export class SessionMiddleware {
  private readonly SESSION_COOKIE_NAME = 'matix_session'
  private readonly REFRESH_COOKIE_NAME = 'matix_refresh'
  private readonly SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 heures
  private readonly REFRESH_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 jours

  /**
   * Vérification de la session dans les cookies
   */
  async verifySession(request: NextRequest): Promise<SessionMiddlewareData> {
    try {
      const cookieStore = cookies()
      const sessionCookie = cookieStore.get(this.SESSION_COOKIE_NAME)
      const refreshCookie = cookieStore.get(this.REFRESH_COOKIE_NAME)

      if (!sessionCookie || !refreshCookie) {
        return { isValid: false }
      }

      // Vérifier la session côté Supabase
      const supabase = createServerSupabaseClient(cookieStore)
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        return { isValid: false }
      }

      // Vérifier l'expiration
      const now = Date.now()
      const sessionData = JSON.parse(sessionCookie.value)
      
      if (now > sessionData.expiresAt) {
        // Tenter de rafraîchir avec le refresh token
        const refreshed = await this.refreshSession(supabase, refreshCookie.value)
        
        if (refreshed) {
          return {
            isValid: true,
            userId: session.user.id,
            email: session.user.email,
            role: sessionData.role,
            sessionId: sessionData.sessionId,
            expiresAt: sessionData.expiresAt,
            needsRefresh: true
          }
        } else {
          return { isValid: false }
        }
      }

      return {
        isValid: true,
        userId: session.user.id,
        email: session.user.email,
        role: sessionData.role,
        sessionId: sessionData.sessionId,
        expiresAt: sessionData.expiresAt,
        needsRefresh: false
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la session:', error)
      return { isValid: false }
    }
  }

  /**
   * Rafraîchissement de la session
   */
  private async refreshSession(supabase: any, refreshToken: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      })

      if (error || !data.session) {
        return false
      }

      // Mettre à jour les cookies
      await this.setSessionCookies(data.session, data.user)
      return true
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement:', error)
      return false
    }
  }

  /**
   * Définition des cookies de session
   */
  async setSessionCookies(session: any, user: any): Promise<void> {
    try {
      const cookieStore = cookies()
      const now = Date.now()
      const sessionId = `session_${now}_${Math.random().toString(36).substr(2, 9)}`

      // Données de session
      const sessionData = {
        sessionId,
        userId: user.id,
        email: user.email,
        role: user.user_metadata?.role || 'eleveur',
        createdAt: now,
        expiresAt: now + this.SESSION_DURATION
      }

      // Cookie de session (httpOnly, secure, SameSite)
      cookieStore.set(this.SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.SESSION_DURATION / 1000, // Convertir en secondes
        path: '/'
      })

      // Cookie de refresh (httpOnly, secure, SameSite)
      cookieStore.set(this.REFRESH_COOKIE_NAME, session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: this.REFRESH_DURATION / 1000, // Convertir en secondes
        path: '/'
      })

      console.log('✅ Cookies de session définis:', sessionId)
    } catch (error) {
      console.error('❌ Erreur lors de la définition des cookies:', error)
    }
  }

  /**
   * Suppression des cookies de session
   */
  async clearSessionCookies(): Promise<void> {
    try {
      const cookieStore = cookies()

      // Supprimer le cookie de session
      cookieStore.set(this.SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })

      // Supprimer le cookie de refresh
      cookieStore.set(this.REFRESH_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      })

      console.log('🗑️ Cookies de session supprimés')
    } catch (error) {
      console.error('❌ Erreur lors de la suppression des cookies:', error)
    }
  }

  /**
   * Middleware Next.js pour la vérification des sessions
   */
  async middleware(request: NextRequest): Promise<NextResponse> {
    try {
      const { pathname } = request.nextUrl

      // Routes publiques qui ne nécessitent pas d'authentification
      const publicRoutes = [
        '/',
        '/login',
        '/register',
        '/forgot-password',
        '/reset-password',
        '/api/auth',
        '/_next',
        '/favicon.ico'
      ]

      // Vérifier si la route est publique
      const isPublicRoute = publicRoutes.some(route => 
        pathname.startsWith(route)
      )

      if (isPublicRoute) {
        return NextResponse.next()
      }

      // Vérifier la session pour les routes protégées
      const sessionData = await this.verifySession(request)

      if (!sessionData.isValid) {
        // Rediriger vers la page de connexion
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // Ajouter les informations de session aux headers
      const response = NextResponse.next()
      response.headers.set('x-user-id', sessionData.userId || '')
      response.headers.set('x-user-email', sessionData.email || '')
      response.headers.set('x-user-role', sessionData.role || '')
      response.headers.set('x-session-id', sessionData.sessionId || '')

      // Si la session a besoin d'être rafraîchie, ajouter un header
      if (sessionData.needsRefresh) {
        response.headers.set('x-session-refresh', 'true')
      }

      return response
    } catch (error) {
      console.error('❌ Erreur dans le middleware de session:', error)
      
      // En cas d'erreur, rediriger vers la page de connexion
      const loginUrl = new URL('/login', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  /**
   * Vérification de l'autorisation pour une route spécifique
   */
  async checkRouteAuthorization(
    request: NextRequest, 
    requiredRole?: string
  ): Promise<{ authorized: boolean; reason?: string }> {
    try {
      const sessionData = await this.verifySession(request)

      if (!sessionData.isValid) {
        return { authorized: false, reason: 'Session invalide' }
      }

      if (requiredRole && sessionData.role !== requiredRole) {
        return { 
          authorized: false, 
          reason: `Rôle requis: ${requiredRole}, rôle actuel: ${sessionData.role}` 
        }
      }

      return { authorized: true }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification d\'autorisation:', error)
      return { authorized: false, reason: 'Erreur de vérification' }
    }
  }

  /**
   * Nettoyage des sessions expirées
   */
  async cleanupExpiredSessions(): Promise<number> {
    try {
      const cookieStore = cookies()
      const sessionCookie = cookieStore.get(this.SESSION_COOKIE_NAME)
      
      if (!sessionCookie) {
        return 0
      }

      const sessionData = JSON.parse(sessionCookie.value)
      const now = Date.now()

      if (now > sessionData.expiresAt) {
        await this.clearSessionCookies()
        return 1
      }

      return 0
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des sessions:', error)
      return 0
    }
  }

  /**
   * Statistiques des sessions
   */
  async getSessionStats(): Promise<{
    activeSessions: number
    expiredSessions: number
    totalSessions: number
  }> {
    try {
      // Cette méthode pourrait être étendue pour interroger une base de données
      // Pour l'instant, on retourne des statistiques basiques
      return {
        activeSessions: 0,
        expiredSessions: 0,
        totalSessions: 0
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error)
      return {
        activeSessions: 0,
        expiredSessions: 0,
        totalSessions: 0
      }
    }
  }
}

// Instance singleton du middleware de session
export const sessionMiddleware = new SessionMiddleware()

/**
 * Fonction middleware pour Next.js
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  return await sessionMiddleware.middleware(request)
}

/**
 * Configuration du middleware Next.js
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
