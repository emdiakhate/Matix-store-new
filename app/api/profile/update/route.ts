import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateProfileSchema, validateData } from '@/lib/validation/schemas'
import { securityLogger } from '@/lib/logging/securityLogger'

/**
 * API Route pour mettre à jour le profil utilisateur
 * Nécessite authentification et ne permet pas de changer le rôle
 */
export async function PUT(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Vérifier l'authentification
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      securityLogger.log('UNAUTHORIZED_ACCESS', {
        endpoint: '/api/profile/update',
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'no_session'
      })
      
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Valider les données
    const body = await request.json()
    const validation = validateData(updateProfileSchema, body)
    
    if (!validation.success) {
      securityLogger.log('VALIDATION_ERROR', {
        endpoint: '/api/profile/update',
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        errors: validation.errors
      })
      
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: validation.errors,
          code: 'VALIDATION_ERROR' 
        },
        { status: 400 }
      )
    }

    const updateData = validation.data!

    // Vérifier que le profil existe
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !existingProfile) {
      securityLogger.log('PROFILE_NOT_FOUND', {
        endpoint: '/api/profile/update',
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent')
      })
      
      return NextResponse.json(
        { error: 'Profil non trouvé', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour
    const finalUpdateData = {
      ...updateData,
      updated_at: new Date().toISOString()
    }

    // Mettre à jour le profil
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(finalUpdateData)
      .eq('id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du profil:', updateError)
      
      securityLogger.log('DATABASE_ERROR', {
        endpoint: '/api/profile/update',
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        error: updateError.message
      })
      
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Log de succès
    securityLogger.log('PROFILE_UPDATED', {
      endpoint: '/api/profile/update',
      userId: session.user.id,
      ip,
      userAgent: request.headers.get('user-agent'),
      changes: Object.keys(finalUpdateData)
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      message: 'Profil mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    
    securityLogger.log('INTERNAL_ERROR', {
      endpoint: '/api/profile/update',
      ip: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent'),
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    })
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * Méthode GET pour récupérer le profil utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    // Vérifier l'authentification
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération du profil', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profil non trouvé', code: 'PROFILE_NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
