import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createProductSchema, validateData } from '@/lib/validation/schemas'
import { rateLimiter } from '@/lib/ratelimit/rateLimiter'
import { securityLogger } from '@/lib/logging/securityLogger'

/**
 * API Route pour créer un nouveau produit/annonce
 * Nécessite authentification et rôle éleveur
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimiter.checkLimit('product_create', ip)
    
    if (!rateLimitResult.allowed) {
      securityLogger.log('RATE_LIMIT_EXCEEDED', {
        endpoint: '/api/products/create',
        ip,
        userAgent: request.headers.get('user-agent')
      })
      
      return NextResponse.json(
        { 
          error: 'Trop de tentatives de création', 
          retryAfter: rateLimitResult.retryAfter,
          code: 'RATE_LIMIT_EXCEEDED' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter.toString()
          }
        }
      )
    }

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
        endpoint: '/api/products/create',
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'no_session'
      })
      
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Vérifier le rôle utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || (profile.role !== 'eleveur' && profile.role !== 'admin')) {
      securityLogger.log('INSUFFICIENT_ROLE', {
        endpoint: '/api/products/create',
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        requiredRole: 'eleveur',
        actualRole: profile?.role
      })
      
      return NextResponse.json(
        { error: 'Rôle insuffisant. Seuls les éleveurs peuvent créer des annonces.', code: 'INSUFFICIENT_ROLE' },
        { status: 403 }
      )
    }

    // Valider les données
    const body = await request.json()
    const validation = validateData(createProductSchema, body)
    
    if (!validation.success) {
      securityLogger.log('VALIDATION_ERROR', {
        endpoint: '/api/products/create',
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

    const productData = validation.data!

    // Créer le produit dans la base de données
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        ...productData,
        user_id: session.user.id,
        statut: 'actif',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (productError) {
      console.error('Erreur lors de la création du produit:', productError)
      
      securityLogger.log('DATABASE_ERROR', {
        endpoint: '/api/products/create',
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        error: productError.message
      })
      
      return NextResponse.json(
        { error: 'Erreur lors de la création du produit', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Log de succès
    securityLogger.log('PRODUCT_CREATED', {
      endpoint: '/api/products/create',
      userId: session.user.id,
      productId: product.id,
      ip,
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      product,
      message: 'Produit créé avec succès'
    }, { status: 201 })

  } catch (error) {
    console.error('Erreur lors de la création du produit:', error)
    
    securityLogger.log('INTERNAL_ERROR', {
      endpoint: '/api/products/create',
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
 * Méthode GET pour récupérer les produits de l'utilisateur
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Récupérer les produits de l'utilisateur
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (productsError) {
      console.error('Erreur lors de la récupération des produits:', productsError)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des produits', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      products,
      count: products.length
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
