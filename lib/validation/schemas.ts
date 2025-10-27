import { z } from 'zod'

/**
 * Schémas de validation Zod pour la sécurité des données
 * Validation stricte côté serveur pour prévenir les attaques
 */

// ===== SCHÉMAS D'AUTHENTIFICATION =====

/**
 * Schéma d'inscription avec validation stricte
 */
export const signUpSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .min(5, 'Email trop court')
    .max(255, 'Email trop long')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le mot de passe ne peut pas dépasser 128 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial'),
  
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim(),
  
  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim(),
  
  telephone: z.string()
    .regex(/^(\+221|0)?[7][0678]\d{7}$/, 'Format de téléphone sénégalais invalide (ex: +221771234567)')
    .transform(val => {
      // Normaliser le format du téléphone
      const cleaned = val.replace(/\s/g, '')
      if (cleaned.startsWith('0')) {
        return '+221' + cleaned.substring(1)
      }
      if (!cleaned.startsWith('+221')) {
        return '+221' + cleaned
      }
      return cleaned
    }),
  
  role: z.enum(['eleveur', 'acheteur'], {
    errorMap: () => ({ message: 'Le rôle doit être "eleveur" ou "acheteur"' })
  }).optional().default('acheteur')
})

/**
 * Schéma de connexion
 */
export const signInSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .toLowerCase()
    .trim(),
  
  password: z.string()
    .min(1, 'Le mot de passe est requis')
    .max(128, 'Le mot de passe est trop long')
})

/**
 * Schéma de réinitialisation de mot de passe
 */
export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Format d\'email invalide')
    .toLowerCase()
    .trim()
})

/**
 * Schéma de mise à jour de mot de passe
 */
export const updatePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Le mot de passe actuel est requis'),
  
  newPassword: z.string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Le nouveau mot de passe ne peut pas dépasser 128 caractères')
    .regex(/[A-Z]/, 'Le nouveau mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le nouveau mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le nouveau mot de passe doit contenir au moins un chiffre')
    .regex(/[^A-Za-z0-9]/, 'Le nouveau mot de passe doit contenir au moins un caractère spécial')
})

// ===== SCHÉMAS DE PROFIL =====

/**
 * Schéma de mise à jour de profil
 */
export const updateProfileSchema = z.object({
  nom: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim()
    .optional(),
  
  prenom: z.string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes')
    .trim()
    .optional(),
  
  telephone: z.string()
    .regex(/^(\+221|0)?[7][0678]\d{7}$/, 'Format de téléphone sénégalais invalide')
    .transform(val => {
      const cleaned = val.replace(/\s/g, '')
      if (cleaned.startsWith('0')) {
        return '+221' + cleaned.substring(1)
      }
      if (!cleaned.startsWith('+221')) {
        return '+221' + cleaned
      }
      return cleaned
    })
    .optional(),
  
  avatar_url: z.string()
    .url('URL d\'avatar invalide')
    .max(500, 'URL d\'avatar trop longue')
    .optional()
    .nullable()
})

// ===== SCHÉMAS DE PRODUITS/ANNONCES =====

/**
 * Schéma de création d'annonce
 */
export const createProductSchema = z.object({
  titre: z.string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .trim(),
  
  description: z.string()
    .min(20, 'La description doit contenir au moins 20 caractères')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .trim(),
  
  prix: z.number()
    .positive('Le prix doit être positif')
    .max(10000000, 'Le prix ne peut pas dépasser 10,000,000 FCFA'),
  
  quantite: z.number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être positive')
    .max(10000, 'La quantité ne peut pas dépasser 10,000'),
  
  unite: z.enum(['kg', 'litre', 'piece', 'sac', 'tonne'], {
    errorMap: () => ({ message: 'Unité invalide' })
  }),
  
  categorie: z.string()
    .min(2, 'La catégorie est requise')
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères')
    .trim(),
  
  images: z.array(z.string().url('URL d\'image invalide'))
    .min(1, 'Au moins une image est requise')
    .max(10, 'Maximum 10 images autorisées'),
  
  localisation: z.object({
    region: z.string().min(2, 'Région requise').max(50).trim(),
    ville: z.string().min(2, 'Ville requise').max(50).trim(),
    adresse: z.string().min(5, 'Adresse requise').max(200).trim().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional()
  }),
  
  disponibilite: z.object({
    debut: z.string().datetime('Date de début invalide'),
    fin: z.string().datetime('Date de fin invalide')
  }).refine(data => new Date(data.debut) < new Date(data.fin), {
    message: 'La date de fin doit être après la date de début',
    path: ['fin']
  }),
  
  conditions: z.object({
    livraison: z.boolean().default(false),
    paiement_comptant: z.boolean().default(true),
    paiement_credit: z.boolean().default(false),
    negociation: z.boolean().default(true)
  }).optional()
})

/**
 * Schéma de mise à jour d'annonce
 */
export const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().uuid('ID de produit invalide'),
  statut: z.enum(['actif', 'inactif', 'vendu', 'expire']).optional()
})

// ===== SCHÉMAS DE COMMANDES =====

/**
 * Schéma de création de commande
 */
export const createOrderSchema = z.object({
  product_id: z.string().uuid('ID de produit invalide'),
  quantite: z.number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être positive')
    .max(1000, 'La quantité ne peut pas dépasser 1,000'),
  
  prix_unitaire: z.number()
    .positive('Le prix unitaire doit être positif')
    .max(1000000, 'Le prix unitaire trop élevé'),
  
  adresse_livraison: z.object({
    nom: z.string().min(2, 'Nom requis').max(50).trim(),
    telephone: z.string().regex(/^(\+221|0)?[7][0678]\d{7}$/, 'Téléphone invalide'),
    adresse: z.string().min(10, 'Adresse requise').max(200).trim(),
    ville: z.string().min(2, 'Ville requise').max(50).trim(),
    region: z.string().min(2, 'Région requise').max(50).trim()
  }),
  
  mode_paiement: z.enum(['comptant', 'credit', 'mobile_money'], {
    errorMap: () => ({ message: 'Mode de paiement invalide' })
  }),
  
  date_livraison_souhaitee: z.string()
    .datetime('Date de livraison invalide')
    .refine(date => new Date(date) > new Date(), {
      message: 'La date de livraison doit être dans le futur'
    }),
  
  commentaires: z.string()
    .max(500, 'Commentaires trop longs')
    .trim()
    .optional()
})

// ===== SCHÉMAS DE VALIDATION GÉNÉRAUX =====

/**
 * Schéma pour les IDs UUID
 */
export const uuidSchema = z.string().uuid('Format UUID invalide')

/**
 * Schéma pour les paginations
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sort: z.string().max(50).optional(),
  order: z.enum(['asc', 'desc']).default('desc')
})

/**
 * Schéma pour les recherches
 */
export const searchSchema = z.object({
  query: z.string().min(2, 'Recherche trop courte').max(100).trim(),
  categorie: z.string().max(50).optional(),
  region: z.string().max(50).optional(),
  prix_min: z.number().positive().optional(),
  prix_max: z.number().positive().optional(),
  ...paginationSchema.shape
})

// ===== SCHÉMAS DE CONTACT =====

/**
 * Schéma de message de contact
 */
export const contactSchema = z.object({
  nom: z.string().min(2, 'Nom requis').max(50).trim(),
  email: z.string().email('Email invalide').toLowerCase().trim(),
  telephone: z.string().regex(/^(\+221|0)?[7][0678]\d{7}$/, 'Téléphone invalide').optional(),
  sujet: z.string().min(5, 'Sujet requis').max(100).trim(),
  message: z.string().min(20, 'Message trop court').max(1000, 'Message trop long').trim()
})

// ===== UTILITAIRES DE VALIDATION =====

/**
 * Fonction pour valider les données avec gestion d'erreurs
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Erreur de validation inconnue'] }
  }
}

/**
 * Fonction pour valider les données de manière sécurisée
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    throw new Error(`Validation échouée: ${errors.join(', ')}`)
  }
  
  return result.data
}

// ===== TYPES EXPORTÉS =====

export type SignUpData = z.infer<typeof signUpSchema>
export type SignInData = z.infer<typeof signInSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordData = z.infer<typeof updatePasswordSchema>
export type UpdateProfileData = z.infer<typeof updateProfileSchema>
export type CreateProductData = z.infer<typeof createProductSchema>
export type UpdateProductData = z.infer<typeof updateProductSchema>
export type CreateOrderData = z.infer<typeof createOrderSchema>
export type ContactData = z.infer<typeof contactSchema>
export type SearchData = z.infer<typeof searchSchema>
export type PaginationData = z.infer<typeof paginationSchema>
