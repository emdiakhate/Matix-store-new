import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API Route pour vérifier la session active
 * Rafraîchit le token si nécessaire et retourne les infos utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()

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

    // Récupérer la session actuelle
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError)
      return NextResponse.json(
        { error: 'Erreur de session', authenticated: false },
        { status: 401 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null, profile: null },
        { status: 200 }
      )
    }

    // Vérifier si le token est expiré et le rafraîchir si nécessaire
    const now = Math.floor(Date.now() / 1000)
    const tokenExpiry = session.expires_at || 0
    
    if (tokenExpiry <= now + 300) { // Rafraîchir si expire dans moins de 5 minutes
      console.log('🔄 Rafraîchissement du token...')
      
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('Erreur lors du rafraîchissement:', refreshError)
        return NextResponse.json(
          { error: 'Erreur de rafraîchissement', authenticated: false },
          { status: 401 }
        )
      }

      if (refreshData.session) {
        console.log('✅ Token rafraîchi avec succès')
      }
    }

    // Récupérer le profil utilisateur
    let profile = null
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Erreur lors de la récupération du profil:', profileError)
      } else {
        profile = profileData
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
    }

    // Log de sécurité pour les accès fréquents
    const userAgent = request.headers.get('user-agent') || ''
    const isApiCall = userAgent.includes('fetch') || userAgent.includes('axios')
    
    if (!isApiCall) {
      console.log('🔒 [SECURITY] SESSION_CHECK:', {
        timestamp: new Date().toISOString(),
        userId: session.user.id,
        email: session.user.email,
        role: profile?.role || 'unknown',
        ip: request.ip || request.headers.get('x-forwarded-for'),
        userAgent: userAgent.substring(0, 100)
      })
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at
      },
      profile: profile ? {
        id: profile.id,
        email: profile.email,
        nom: profile.nom,
        prenom: profile.prenom,
        telephone: profile.telephone,
        role: profile.role,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      } : null,
      session: {
        expires_at: session.expires_at,
        refresh_token: session.refresh_token ? '***' : null // Masquer le token
      }
    })

  } catch (error) {
    console.error('Erreur lors de la vérification de session:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', authenticated: false },
      { status: 500 }
    )
  }
}

/**
 * Méthode POST pour forcer le rafraîchissement de la session
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

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

    // Forcer le rafraîchissement de la session
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('Erreur lors du rafraîchissement forcé:', error)
      return NextResponse.json(
        { error: 'Erreur de rafraîchissement', authenticated: false },
        { status: 401 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Session non trouvée', authenticated: false },
        { status: 401 }
      )
    }

    console.log('✅ Session rafraîchie avec succès:', data.session.user.id)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: data.session.user.id,
        email: data.session.user.email
      },
      session: {
        expires_at: data.session.expires_at
      }
    })

  } catch (error) {
    console.error('Erreur lors du rafraîchissement forcé:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
