import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { updateProductSchema, validateData } from '@/lib/validation/schemas'
import { securityLogger } from '@/lib/logging/securityLogger'

/**
 * API Route pour mettre à jour un produit existant
 * Nécessite authentification et propriétaire du produit
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
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
        endpoint: `/api/products/update/${productId}`,
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'no_session'
      })
      
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Vérifier que le produit existe et appartient à l'utilisateur
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', session.user.id)
      .single()

    if (productError || !existingProduct) {
      securityLogger.log('PRODUCT_NOT_FOUND', {
        endpoint: `/api/products/update/${productId}`,
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'not_found_or_not_owner'
      })
      
      return NextResponse.json(
        { error: 'Produit non trouvé ou non autorisé', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Valider les données de mise à jour
    const body = await request.json()
    const updateData = { ...body, id: productId }
    
    const validation = validateData(updateProductSchema, updateData)
    
    if (!validation.success) {
      securityLogger.log('VALIDATION_ERROR', {
        endpoint: `/api/products/update/${productId}`,
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

    const validatedData = validation.data!

    // Préparer les données de mise à jour (exclure l'ID)
    const { id, ...updateFields } = validatedData
    const finalUpdateData = {
      ...updateFields,
      updated_at: new Date().toISOString()
    }

    // Mettre à jour le produit
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(finalUpdateData)
      .eq('id', productId)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Erreur lors de la mise à jour du produit:', updateError)
      
      securityLogger.log('DATABASE_ERROR', {
        endpoint: `/api/products/update/${productId}`,
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        error: updateError.message
      })
      
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du produit', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Log de succès
    securityLogger.log('PRODUCT_UPDATED', {
      endpoint: `/api/products/update/${productId}`,
      userId: session.user.id,
      productId,
      ip,
      userAgent: request.headers.get('user-agent'),
      changes: Object.keys(finalUpdateData)
    })

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Produit mis à jour avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    
    securityLogger.log('INTERNAL_ERROR', {
      endpoint: `/api/products/update/${params.id}`,
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
 * Méthode DELETE pour supprimer un produit
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id
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
        endpoint: `/api/products/delete/${productId}`,
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'no_session'
      })
      
      return NextResponse.json(
        { error: 'Non authentifié', code: 'UNAUTHENTICATED' },
        { status: 401 }
      )
    }

    // Vérifier que le produit existe et appartient à l'utilisateur
    const { data: existingProduct, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('user_id', session.user.id)
      .single()

    if (productError || !existingProduct) {
      securityLogger.log('PRODUCT_NOT_FOUND', {
        endpoint: `/api/products/delete/${productId}`,
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        reason: 'not_found_or_not_owner'
      })
      
      return NextResponse.json(
        { error: 'Produit non trouvé ou non autorisé', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Supprimer le produit
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('user_id', session.user.id)

    if (deleteError) {
      console.error('Erreur lors de la suppression du produit:', deleteError)
      
      securityLogger.log('DATABASE_ERROR', {
        endpoint: `/api/products/delete/${productId}`,
        userId: session.user.id,
        ip,
        userAgent: request.headers.get('user-agent'),
        error: deleteError.message
      })
      
      return NextResponse.json(
        { error: 'Erreur lors de la suppression du produit', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }

    // Log de succès
    securityLogger.log('PRODUCT_DELETED', {
      endpoint: `/api/products/delete/${productId}`,
      userId: session.user.id,
      productId,
      ip,
      userAgent: request.headers.get('user-agent')
    })

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    
    securityLogger.log('INTERNAL_ERROR', {
      endpoint: `/api/products/delete/${params.id}`,
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
