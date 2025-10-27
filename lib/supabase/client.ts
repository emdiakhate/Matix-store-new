import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client Supabase côté client avec configuration sécurisée
 * - Utilise sessionStorage au lieu de localStorage pour les tokens
 * - Auto-refresh des tokens activé
 * - Persistence de session configurée
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Utiliser sessionStorage au lieu de localStorage pour plus de sécurité
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    
    // Auto-refresh des tokens pour maintenir la session active
    autoRefreshToken: true,
    
    // Persister la session dans sessionStorage
    persistSession: true,
    
    // Détecter la session depuis l'URL (pour les callbacks OAuth)
    detectSessionInUrl: true,
    
    // Durée de vie des tokens (en secondes)
    // 1 heure pour access token, 30 jours pour refresh token
    flowType: 'pkce'
  },
  
  // Configuration globale
  global: {
    headers: {
      'X-Client-Info': 'matix-store@1.0.0'
    }
  }
})

/**
 * Fonction utilitaire pour vérifier si Supabase est correctement configuré
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Fonction pour obtenir l'URL de base de l'application
 */
export const getSiteUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'
}

/**
 * Configuration des URLs de redirection pour l'authentification
 */
export const authUrls = {
  signIn: `${getSiteUrl()}/auth/signin`,
  signUp: `${getSiteUrl()}/auth/signup`,
  resetPassword: `${getSiteUrl()}/auth/reset-password`,
  callback: `${getSiteUrl()}/auth/callback`
} as const

export default supabase
