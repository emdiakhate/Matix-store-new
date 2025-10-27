import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * API Route pour gérer le callback OAuth de Supabase
 * Échange le code d'autorisation contre une session utilisateur
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
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

    try {
      // Échanger le code contre une session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Erreur lors de l\'échange du code:', error)
        return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
      }

      if (data.session) {
        console.log('✅ Session créée avec succès:', data.session.user.id)
        
        // Log de sécurité
        console.log('🔒 [SECURITY] AUTH_SUCCESS:', {
          timestamp: new Date().toISOString(),
          userId: data.session.user.id,
          email: data.session.user.email,
          ip: request.ip || request.headers.get('x-forwarded-for'),
          userAgent: request.headers.get('user-agent')
        })
      }

      // Rediriger vers la page demandée
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Erreur lors du callback OAuth:', error)
      return NextResponse.redirect(`${origin}/login?error=callback_error`)
    }
  }

  // Retourner une erreur si pas de code
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
