import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js'
import { Database } from './types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validation des variables d'environnement
if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// ============================================================================
// CLIENTS SUPABASE
// ============================================================================

// Client public pour le navigateur (utilise la clé anon)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Client admin pour le serveur (utilise la clé service_role)
// À utiliser uniquement côté serveur (API routes, Server Components)
export const supabaseAdmin = supabaseServiceRoleKey
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// ============================================================================
// HELPERS AUTHENTIFICATION
// ============================================================================

/**
 * Obtenir l'utilisateur actuellement connecté
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Obtenir la session actuelle
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Inscription avec email et mot de passe
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: Record<string, unknown>
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })

  return { user: data.user, session: data.session, error }
}

/**
 * Connexion avec email et mot de passe
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  return { user: data.user, session: data.session, error }
}

/**
 * Connexion avec téléphone (OTP)
 */
export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone
  })

  return { data, error }
}

/**
 * Vérifier OTP téléphone
 */
export async function verifyPhoneOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms'
  })

  return { user: data.user, session: data.session, error }
}

/**
 * Connexion avec provider OAuth (Google, Facebook, etc.)
 */
export async function signInWithProvider(provider: 'google' | 'facebook' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })

  return { data, error }
}

/**
 * Déconnexion
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Réinitialisation de mot de passe
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })

  return { data, error }
}

/**
 * Mettre à jour le mot de passe
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  return { user: data.user, error }
}

/**
 * Écouter les changements d'authentification
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}

// ============================================================================
// HELPERS STOCKAGE
// ============================================================================

/**
 * Upload un fichier dans un bucket
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) {
    return { url: null, error }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return { url: publicUrl, error: null }
}

/**
 * Supprimer un fichier
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path])
  return { error }
}

/**
 * Obtenir l'URL publique d'un fichier
 */
export function getPublicUrl(bucket: string, path: string): string {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

/**
 * Upload un avatar utilisateur
 */
export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/avatar.${fileExt}`

  return uploadFile('avatars', fileName, file)
}

/**
 * Upload une image produit
 */
export async function uploadProductImage(producerId: string, productId: string, file: File) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${producerId}/${productId}/${Date.now()}.${fileExt}`

  return uploadFile('products', fileName, file)
}

// ============================================================================
// HELPERS REALTIME
// ============================================================================

/**
 * S'abonner aux changements d'une table
 */
export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    new: Database['public']['Tables'][T]['Row'] | null
    old: Database['public']['Tables'][T]['Row'] | null
  }) => void,
  filter?: string
) {
  let channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table as string,
        filter
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Database['public']['Tables'][T]['Row'] | null,
          old: payload.old as Database['public']['Tables'][T]['Row'] | null
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * S'abonner aux notifications d'un utilisateur
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: Database['public']['Tables']['notifications']['Row']) => void
) {
  return subscribeToTable(
    'notifications',
    (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        callback(payload.new)
      }
    },
    `user_id=eq.${userId}`
  )
}

/**
 * S'abonner aux messages d'un chat room
 */
export function subscribeToChatMessages(
  roomId: string,
  callback: (message: Database['public']['Tables']['chat_messages']['Row']) => void
) {
  return subscribeToTable(
    'chat_messages',
    (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        callback(payload.new)
      }
    },
    `room_id=eq.${roomId}`
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { User, Session, SupabaseClient }
export default supabase
