import { User } from '@supabase/supabase-js'

/**
 * Profil utilisateur correspondant à la table profiles
 */
export interface UserProfile {
  id: string
  email: string
  nom: string
  prenom: string
  telephone: string
  role: 'eleveur' | 'acheteur' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Erreur d'authentification avec messages en français
 */
export interface AuthError {
  code: string
  message: string
  details?: string
}

/**
 * Données pour l'inscription
 */
export interface SignUpData {
  email: string
  password: string
  nom: string
  prenom: string
  telephone: string
  role?: 'eleveur' | 'acheteur' | 'admin'
}

/**
 * Données pour la connexion
 */
export interface SignInData {
  email: string
  password: string
}

/**
 * Données pour la réinitialisation de mot de passe
 */
export interface ResetPasswordData {
  email: string
}

/**
 * Données pour la mise à jour du mot de passe
 */
export interface UpdatePasswordData {
  newPassword: string
  currentPassword?: string
}

/**
 * État d'authentification pour le hook useAuth
 */
export interface AuthState {
  user: User | null
  session: any | null
  profile: UserProfile | null
  loading: boolean
  error: AuthError | null
}

/**
 * Données pour la mise à jour du profil
 */
export interface UpdateProfileData {
  nom?: string
  prenom?: string
  telephone?: string
  avatar_url?: string
}

/**
 * Configuration de session
 */
export interface SessionConfig {
  duration: number // en minutes
  warningTime: number // en minutes avant expiration
  autoRefresh: boolean
}

/**
 * État de la session pour le hook useSession
 */
export interface SessionState {
  isValid: boolean
  expiresAt: Date | null
  timeRemaining: number // en minutes
  isExpiring: boolean // true si < warningTime
  canRefresh: boolean
}

/**
 * Types d'erreurs d'authentification
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_EXISTS = 'email_already_exists',
  INVALID_EMAIL = 'invalid_email',
  INVALID_PHONE = 'invalid_phone',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}

/**
 * Messages d'erreur en français
 */
export const AuthErrorMessages: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
  [AuthErrorType.EMAIL_NOT_CONFIRMED]: 'Veuillez confirmer votre email avant de vous connecter',
  [AuthErrorType.WEAK_PASSWORD]: 'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre',
  [AuthErrorType.EMAIL_ALREADY_EXISTS]: 'Un compte avec cet email existe déjà',
  [AuthErrorType.INVALID_EMAIL]: 'Format d\'email invalide',
  [AuthErrorType.INVALID_PHONE]: 'Format de téléphone invalide (utilisez le format sénégalais)',
  [AuthErrorType.NETWORK_ERROR]: 'Erreur de connexion. Vérifiez votre internet',
  [AuthErrorType.UNKNOWN_ERROR]: 'Une erreur inattendue s\'est produite'
}

/**
 * Validation des données d'inscription
 */
export interface SignUpValidation {
  email: boolean
  password: boolean
  nom: boolean
  prenom: boolean
  telephone: boolean
}

/**
 * Résultat de l'inscription
 */
export interface SignUpResult {
  success: boolean
  user?: User
  error?: AuthError
  requiresConfirmation: boolean
}

/**
 * Résultat de la connexion
 */
export interface SignInResult {
  success: boolean
  user?: User
  session?: any
  profile?: UserProfile
  error?: AuthError
}

/**
 * Résultat de la réinitialisation de mot de passe
 */
export interface ResetPasswordResult {
  success: boolean
  error?: AuthError
}

/**
 * Résultat de la mise à jour du mot de passe
 */
export interface UpdatePasswordResult {
  success: boolean
  error?: AuthError
}

/**
 * Résultat de la mise à jour du profil
 */
export interface UpdateProfileResult {
  success: boolean
  profile?: UserProfile
  error?: AuthError
}
