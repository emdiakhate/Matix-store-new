import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API Route pour la déconnexion côté serveur
 * Supprime tous les cookies et nettoie la session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const origin = new URL(request.url).origin

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    // Récupérer la session avant déconnexion pour le logging
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Log de sécurité
      console.log('🔒 [SECURITY] LOGOUT:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        email: session.user.email,
        ip: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      })
    }

    // Déconnexion côté serveur
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion', details: error.message },
        { status: 500 }
      )
    }

    // Nettoyer tous les cookies de session
    const response = NextResponse.json(
      { message: 'Déconnexion réussie' },
      { status: 200 }
    )

    // Supprimer tous les cookies Supabase
    const cookieNames = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
      'supabase-auth-token-code-verifier'
    ]

    cookieNames.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
    })

    // Rediriger vers la page d'accueil
    response.headers.set('Location', `${origin}/`)
    
    return response
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

/**
 * Méthode GET pour rediriger vers la déconnexion
 */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  return NextResponse.redirect(`${origin}/api/auth/signout`, { status: 302 })
}
