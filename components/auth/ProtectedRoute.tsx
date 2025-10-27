'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, Shield, AlertTriangle } from 'lucide-react'

/**
 * Props du composant ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'eleveur' | 'acheteur' | 'admin'
  fallback?: React.ReactNode
  redirectTo?: string
  showLoader?: boolean
}

/**
 * Composant de protection des routes côté client
 * Vérifie l'authentification et les rôles avant d'afficher le contenu
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
  redirectTo = '/login',
  showLoader = true
}: ProtectedRouteProps) {
  const { user, profile, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Attendre que l'authentification soit chargée
        if (loading) {
          return
        }

        // Vérifier l'authentification
        if (!isAuthenticated || !user) {
          console.log('🔒 Accès refusé: utilisateur non authentifié')
          
          // Construire l'URL de redirection avec le paramètre redirectTo
          const redirectUrl = new URL(redirectTo, window.location.origin)
          redirectUrl.searchParams.set('redirectTo', pathname)
          
          router.push(redirectUrl.toString())
          return
        }

        // Vérifier le rôle si requis
        if (requiredRole && profile?.role !== requiredRole) {
          const hasAdminAccess = profile?.role === 'admin'
          const hasRequiredAccess = profile?.role === requiredRole
          
          if (!hasRequiredAccess && !hasAdminAccess) {
            console.log(`🔒 Accès refusé: rôle insuffisant (requis: ${requiredRole}, actuel: ${profile?.role})`)
            setError(`Accès refusé. Rôle requis: ${requiredRole}`)
            
            // Rediriger vers le dashboard avec un message d'erreur
            const dashboardUrl = new URL('/dashboard', window.location.origin)
            dashboardUrl.searchParams.set('error', 'insufficient_role')
            dashboardUrl.searchParams.set('required', requiredRole)
            
            router.push(dashboardUrl.toString())
            return
          }
        }

        // Accès autorisé
        console.log('✅ Accès autorisé:', {
          user: user.id,
          role: profile?.role,
          requiredRole,
          path: pathname
        })

        setIsChecking(false)
      } catch (error) {
        console.error('Erreur lors de la vérification d\'accès:', error)
        setError('Erreur lors de la vérification des permissions')
        setIsChecking(false)
      }
    }

    checkAccess()
  }, [user, profile, loading, isAuthenticated, requiredRole, router, pathname, redirectTo])

  // Afficher le loader pendant la vérification
  if (loading || isChecking) {
    if (showLoader) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Vérification des permissions...</p>
          </div>
        </div>
      )
    }
    return null
  }

  // Afficher l'erreur si présente
  if (error) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès refusé
          </h2>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    )
  }

  // Vérifier une dernière fois l'authentification
  if (!isAuthenticated || !user) {
    return null
  }

  // Vérifier le rôle une dernière fois
  if (requiredRole && profile?.role !== requiredRole && profile?.role !== 'admin') {
    return null
  }

  // Afficher le contenu protégé
  return <>{children}</>
}

/**
 * Composant pour afficher un message d'accès refusé personnalisé
 */
export function AccessDenied({ 
  message = "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
  showBackButton = true 
}: {
  message?: string
  showBackButton?: boolean
}) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Accès refusé
        </h2>
        <p className="text-gray-600 mb-4">
          {message}
        </p>
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook pour vérifier les permissions dans un composant
 */
export function usePermissions() {
  const { user, profile, isAuthenticated } = useAuth()

  const hasRole = (role: string) => {
    return profile?.role === role || profile?.role === 'admin'
  }

  const hasAnyRole = (roles: string[]) => {
    return roles.includes(profile?.role || '') || profile?.role === 'admin'
  }

  const isAdmin = () => {
    return profile?.role === 'admin'
  }

  const isEleveur = () => {
    return profile?.role === 'eleveur' || profile?.role === 'admin'
  }

  const isAcheteur = () => {
    return profile?.role === 'acheteur' || profile?.role === 'admin'
  }

  const canAccess = (requiredRole?: string) => {
    if (!isAuthenticated || !user) return false
    if (!requiredRole) return true
    return hasRole(requiredRole)
  }

  return {
    user,
    profile,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    isAdmin,
    isEleveur,
    isAcheteur,
    canAccess
  }
}

/**
 * Composant pour afficher du contenu conditionnel basé sur les rôles
 */
export function RoleBasedContent({ 
  children, 
  roles, 
  fallback = null 
}: {
  children: React.ReactNode
  roles: string[]
  fallback?: React.ReactNode
}) {
  const { hasAnyRole } = usePermissions()

  if (hasAnyRole(roles)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

export default ProtectedRoute
