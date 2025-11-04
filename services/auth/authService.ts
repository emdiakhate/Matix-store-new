import { supabase } from '@/lib/supabase/client';
import {
  SignUpData,
  SignInData,
  ResetPasswordData,
  UpdatePasswordData,
  UpdateProfileData,
  SignUpResult,
  SignInResult,
  ResetPasswordResult,
  UpdatePasswordResult,
  UpdateProfileResult,
  UserProfile,
  AuthError,
  AuthErrorType,
  AuthErrorMessages,
} from '@/types/auth.types';

/**
 * Service d'authentification sécurisé avec Supabase
 * Gère l'inscription, connexion, réinitialisation et gestion des profils
 */
export class AuthService {
  /**
   * Validation de l'email
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation du mot de passe (min 8 caractères, 1 majuscule, 1 chiffre)
   */
  private validatePassword(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validation du téléphone sénégalais
   */
  private validatePhone(phone: string): boolean {
    // Format sénégalais : +221 ou 77/78/76/70 suivi de 7 chiffres
    const phoneRegex = /^(\+221|221)?(77|78|76|70)\d{7}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  /**
   * Création d'une erreur d'authentification
   */
  private createError(type: AuthErrorType, details?: string): AuthError {
    return {
      code: type,
      message: AuthErrorMessages[type],
      details,
    };
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(data: SignUpData): Promise<SignUpResult> {
    try {
      // Validation des données
      if (!this.validateEmail(data.email)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_EMAIL),
          requiresConfirmation: false,
        };
      }

      if (!this.validatePassword(data.password)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.WEAK_PASSWORD),
          requiresConfirmation: false,
        };
      }

      if (!this.validatePhone(data.telephone)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_PHONE),
          requiresConfirmation: false,
        };
      }

      if (!data.nom.trim() || !data.prenom.trim()) {
        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, 'Nom et prénom requis'),
          requiresConfirmation: false,
        };
      }

      // Inscription avec Supabase
      // Le trigger handle_new_user_signup() créera automatiquement l'entrée dans 'users'
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nom: data.nom.trim(),
            prenom: data.prenom.trim(),
            telephone: data.telephone.replace(/\s/g, ''),
            // Note: Les rôles sont créés automatiquement par le trigger (farmer + distributor)
          },
        },
      });

      if (error) {
        // Gestion des erreurs spécifiques
        if (error.message.includes('already registered')) {
          return {
            success: false,
            error: this.createError(AuthErrorType.EMAIL_ALREADY_EXISTS),
            requiresConfirmation: false,
          };
        }

        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, error.message),
          requiresConfirmation: false,
        };
      }

      return {
        success: true,
        user: authData.user ?? undefined,
        requiresConfirmation: !authData.session,
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      return {
        success: false,
        error: this.createError(AuthErrorType.NETWORK_ERROR),
        requiresConfirmation: false,
      };
    }
  }

  /**
   * Connexion d'un utilisateur
   */
  async signIn(data: SignInData): Promise<SignInResult> {
    try {
      // Validation des données
      if (!this.validateEmail(data.email)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_EMAIL),
        };
      }

      if (!data.password.trim()) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_CREDENTIALS),
        };
      }

      // Connexion avec Supabase
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        // Gestion des erreurs spécifiques
        if (error.message.includes('Invalid login credentials')) {
          return {
            success: false,
            error: this.createError(AuthErrorType.INVALID_CREDENTIALS),
          };
        }

        if (error.message.includes('Email not confirmed')) {
          return {
            success: false,
            error: this.createError(AuthErrorType.EMAIL_NOT_CONFIRMED),
          };
        }

        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      // Récupération du profil utilisateur
      const profile = await this.getUserProfile(authData.user.id);

      return {
        success: true,
        user: authData.user,
        session: authData.session,
        profile: profile || undefined,
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        error: this.createError(AuthErrorType.NETWORK_ERROR),
      };
    }
  }

  /**
   * Déconnexion de l'utilisateur
   */
  async signOut(): Promise<boolean> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        return false;
      }

      // Nettoyage du sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return false;
    }
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResult> {
    try {
      if (!this.validateEmail(data.email)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_EMAIL),
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      return {
        success: false,
        error: this.createError(AuthErrorType.NETWORK_ERROR),
      };
    }
  }

  /**
   * Mise à jour du mot de passe
   */
  async updatePassword(data: UpdatePasswordData): Promise<UpdatePasswordResult> {
    try {
      if (!this.validatePassword(data.newPassword)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.WEAK_PASSWORD),
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du mot de passe:', error);
      return {
        success: false,
        error: this.createError(AuthErrorType.NETWORK_ERROR),
      };
    }
  }

  /**
   * Récupération de la session active
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Erreur lors de la récupération de la session:', error);
        return null;
      }

      return session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Récupération du profil utilisateur depuis la table 'users'
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }
  }

  /**
   * Mise à jour du profil utilisateur
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UpdateProfileResult> {
    try {
      // Validation du téléphone si fourni
      if (data.telephone && !this.validatePhone(data.telephone)) {
        return {
          success: false,
          error: this.createError(AuthErrorType.INVALID_PHONE),
        };
      }

      const { data: profile, error } = await (supabase as any)
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          error: this.createError(AuthErrorType.UNKNOWN_ERROR, error.message),
        };
      }

      return {
        success: true,
        profile,
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return {
        success: false,
        error: this.createError(AuthErrorType.NETWORK_ERROR),
      };
    }
  }

  /**
   * Vérification si l'utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return !!session;
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error);
      return false;
    }
  }

  /**
   * Changer de rôle actif (farmer ↔ distributor)
   */
  async switchRole(userId: string, newRole: 'farmer' | 'distributor'): Promise<boolean> {
    try {
      // Vérifier d'abord que l'utilisateur a ce rôle dans sa liste de rôles
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Utilisateur non trouvé');
      }

      // Type guard pour vérifier si profile a les propriétés nécessaires
      const userProfile = profile as any;
      if (!userProfile.roles || !Array.isArray(userProfile.roles)) {
        throw new Error("Les rôles de l'utilisateur ne sont pas définis");
      }

      if (!userProfile.roles.includes(newRole)) {
        throw new Error(`Le rôle ${newRole} n'est pas disponible pour cet utilisateur`);
      }

      // Mettre à jour le rôle actif
      const { error } = await (supabase as any)
        .from('users')
        .update({
          active_role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors du changement de rôle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      return false;
    }
  }

  /**
   * Récupérer le rôle actif de l'utilisateur
   */
  async getActiveRole(userId: string): Promise<string | null> {
    try {
      const { data, error } = await (supabase as any)
        .from('users')
        .select('active_role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération du rôle actif:', error);
        return null;
      }

      return data?.active_role || null;
    } catch (error) {
      console.error('Erreur lors de la récupération du rôle actif:', error);
      return null;
    }
  }
}

// Instance singleton du service d'authentification
export const authService = new AuthService();
export default authService;
