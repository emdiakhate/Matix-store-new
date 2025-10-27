import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware de protection des routes avec Supabase Auth
 * Vérifie l'authentification et les rôles sur chaque requête
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Créer le client Supabase pour le middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Récupérer la session utilisateur
  const { data: { session }, error } = await supabase.auth.getSession()
  
  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Définir les routes par niveau de protection
  const publicRoutes = [
    '/',
    '/annonces',
    '/annonces/[^/]+$', // Détail produit (regex)
    '/login',
    '/signup',
    '/reset-password',
    '/auth/callback',
    '/api/auth/callback',
    '/api/auth/session'
  ]

  const authRoutes = [
    '/login',
    '/signup',
    '/reset-password'
  ]

  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/chat',
    '/annonces/create',
    '/mes-annonces',
    '/favoris',
    '/commandes',
    '/statistiques',
    '/admin'
  ]

  const eleveurRoutes = [
    '/mes-annonces',
    '/statistiques',
    '/annonces/create'
  ]

  const adminRoutes = [
    '/admin'
  ]

  // Fonction pour vérifier si une route correspond à un pattern
  const matchesRoute = (path: string, patterns: string[]): boolean => {
    return patterns.some(pattern => {
      if (pattern.includes('[') && pattern.includes(']')) {
        // Convertir le pattern Next.js en regex
        const regex = pattern
          .replace(/\[([^\]]+)\]/g, '[^/]+')
          .replace(/\$/g, '$')
        return new RegExp(`^${regex}$`).test(path)
      }
      return path.startsWith(pattern)
    })
  }

  // Fonction pour vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!session && !error

  // Fonction pour récupérer le rôle utilisateur
  const getUserRole = async (): Promise<string | null> => {
    if (!session?.user?.id) return null
    
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      return profile?.role || null
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle:', error)
      return null
    }
  }

  // Logging de sécurité
  const logSecurityEvent = (event: string, details: any) => {
    console.log(`🔒 [SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      path: pathname,
      user: session?.user?.id || 'anonymous',
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
      details
    })
  }

  // 1. Routes publiques - Accès libre
  if (matchesRoute(pathname, publicRoutes)) {
    return response
  }

  // 2. Routes d'authentification - Rediriger si déjà connecté
  if (matchesRoute(pathname, authRoutes)) {
    if (isAuthenticated) {
      logSecurityEvent('REDIRECT_AUTH_ROUTE', { reason: 'already_authenticated' })
      
      // Récupérer l'URL de redirection depuis les paramètres
      const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
      url.pathname = redirectTo
      url.searchParams.delete('redirectTo')
      
      return NextResponse.redirect(url)
    }
    return response
  }

  // 3. Routes protégées - Vérifier l'authentification
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!isAuthenticated) {
      logSecurityEvent('ACCESS_DENIED', { reason: 'not_authenticated' })
      
      // Rediriger vers login avec l'URL de retour
      url.pathname = '/login'
      url.searchParams.set('redirectTo', pathname)
      
      return NextResponse.redirect(url)
    }

    // Vérifier les rôles spécifiques
    const userRole = await getUserRole()
    
    // Routes spécifiques aux éleveurs
    if (matchesRoute(pathname, eleveurRoutes)) {
      if (userRole !== 'eleveur' && userRole !== 'admin') {
        logSecurityEvent('ACCESS_DENIED', { 
          reason: 'insufficient_role', 
          required: 'eleveur', 
          actual: userRole 
        })
        
        url.pathname = '/dashboard'
        url.searchParams.set('error', 'role_required')
        
        return NextResponse.redirect(url)
      }
    }

    // Routes spécifiques aux admins
    if (matchesRoute(pathname, adminRoutes)) {
      if (userRole !== 'admin') {
        logSecurityEvent('ACCESS_DENIED', { 
          reason: 'insufficient_role', 
          required: 'admin', 
          actual: userRole 
        })
        
        url.pathname = '/dashboard'
        url.searchParams.set('error', 'admin_required')
        
        return NextResponse.redirect(url)
      }
    }

    // Log de l'accès autorisé
    logSecurityEvent('ACCESS_GRANTED', { role: userRole })
  }

  // 4. API Routes - Protection supplémentaire
  if (pathname.startsWith('/api/')) {
    // Routes API publiques
    const publicApiRoutes = [
      '/api/auth/callback',
      '/api/auth/session',
      '/api/health'
    ]

    if (publicApiRoutes.some(route => pathname.startsWith(route))) {
      return response
    }

    // Routes API protégées
    if (!isAuthenticated) {
      logSecurityEvent('API_ACCESS_DENIED', { reason: 'not_authenticated' })
      
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Vérifier les rôles pour les API spécifiques
    if (pathname.startsWith('/api/products/create') || 
        pathname.startsWith('/api/products/update')) {
      const userRole = await getUserRole()
      
      if (userRole !== 'eleveur' && userRole !== 'admin') {
        logSecurityEvent('API_ACCESS_DENIED', { 
          reason: 'insufficient_role', 
          required: 'eleveur', 
          actual: userRole 
        })
        
        return NextResponse.json(
          { error: 'Rôle insuffisant', code: 'INSUFFICIENT_ROLE' },
          { status: 403 }
        )
      }
    }

    if (pathname.startsWith('/api/admin/')) {
      const userRole = await getUserRole()
      
      if (userRole !== 'admin') {
        logSecurityEvent('API_ACCESS_DENIED', { 
          reason: 'insufficient_role', 
          required: 'admin', 
          actual: userRole 
        })
        
        return NextResponse.json(
          { error: 'Accès admin requis', code: 'ADMIN_REQUIRED' },
          { status: 403 }
        )
      }
    }
  }

  return response
}

/**
 * Configuration du middleware
 */
export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico (favicon)
     * - public (fichiers publics)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
