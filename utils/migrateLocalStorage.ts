import { secureStorage } from './secureStorage'

/**
 * Interface pour les données de migration
 */
export interface MigrationData {
  key: string
  value: any
  securityLevel: 'critical' | 'important' | 'normal'
  migrated: boolean
  error?: string
}

/**
 * Interface pour les résultats de migration
 */
export interface MigrationResult {
  total: number
  migrated: number
  failed: number
  skipped: number
  errors: string[]
}

/**
 * Clés à migrer par niveau de sécurité
 */
const MIGRATION_KEYS = {
  critical: [
    'currentUser',
    'active_role', 
    'user_tokens',
    'auth_data'
  ],
  important: [
    'user_preferences',
    'cart_data',
    'search_history',
    'user_location',
    'producer_verification'
  ],
  normal: [
    'theme_preferences',
    'ui_state',
    'language',
    'sidebar_collapsed'
  ]
}

/**
 * Utilitaire de migration des données localStorage vers le stockage sécurisé
 */
export class LocalStorageMigrator {
  private migrationLog: MigrationData[] = []
  private isMigrationCompleted = false

  /**
   * Vérification si la migration a déjà été effectuée
   */
  private isAlreadyMigrated(): boolean {
    if (typeof window === 'undefined') return true
    
    const migrationFlag = localStorage.getItem('migration_completed')
    return migrationFlag === 'true'
  }

  /**
   * Marquage de la migration comme terminée
   */
  private markMigrationCompleted(): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('migration_completed', 'true')
    localStorage.setItem('migration_date', new Date().toISOString())
    this.isMigrationCompleted = true
  }

  /**
   * Sauvegarde des données avant migration
   */
  private backupData(): string {
    if (typeof window === 'undefined') return ''
    
    const backup: Record<string, any> = {}
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (!key.startsWith('migration_')) {
        try {
          const value = localStorage.getItem(key)
          if (value) {
            backup[key] = JSON.parse(value)
          }
        } catch (error) {
          console.warn(`Impossible de sauvegarder ${key}:`, error)
        }
      }
    })
    
    const backupJson = JSON.stringify(backup, null, 2)
    localStorage.setItem('migration_backup', backupJson)
    
    return backupJson
  }

  /**
   * Migration d'une clé spécifique
   */
  private migrateKey(key: string, securityLevel: 'critical' | 'important' | 'normal'): MigrationData {
    const migrationData: MigrationData = {
      key,
      value: null,
      securityLevel,
      migrated: false
    }

    try {
      // Récupérer la donnée depuis localStorage
      const rawValue = localStorage.getItem(key)
      if (!rawValue) {
        migrationData.migrated = true // Pas de donnée à migrer
        return migrationData
      }

      // Parser la valeur
      const value = JSON.parse(rawValue)
      migrationData.value = value

      // Migrer vers le stockage sécurisé
      let success = false
      
      if (securityLevel === 'critical') {
        // Données critiques : sessionStorage + chiffrement
        success = secureStorage.setItem(key, value, true)
      } else if (securityLevel === 'important') {
        // Données importantes : sessionStorage
        success = secureStorage.setItem(key, value)
      } else {
        // Données normales : restent en localStorage
        success = true
      }

      if (success) {
        // Supprimer de localStorage si migré
        if (securityLevel !== 'normal') {
          localStorage.removeItem(key)
        }
        migrationData.migrated = true
      } else {
        migrationData.error = 'Échec de la migration'
      }

    } catch (error) {
      migrationData.error = error instanceof Error ? error.message : 'Erreur inconnue'
    }

    return migrationData
  }

  /**
   * Migration complète des données
   */
  async migrateAll(): Promise<MigrationResult> {
    if (typeof window === 'undefined') {
      return {
        total: 0,
        migrated: 0,
        failed: 0,
        skipped: 0,
        errors: ['Migration impossible côté serveur']
      }
    }

    // Vérifier si déjà migré
    if (this.isAlreadyMigrated()) {
      console.log('✅ Migration déjà effectuée')
      return {
        total: 0,
        migrated: 0,
        failed: 0,
        skipped: 0,
        errors: []
      }
    }

    console.log('🚀 Début de la migration des données localStorage...')

    // Sauvegarde des données
    const backup = this.backupData()
    console.log('💾 Sauvegarde créée:', backup.length, 'caractères')

    const result: MigrationResult = {
      total: 0,
      migrated: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }

    // Migration par niveau de sécurité
    const allKeys = [
      ...MIGRATION_KEYS.critical.map(key => ({ key, level: 'critical' as const })),
      ...MIGRATION_KEYS.important.map(key => ({ key, level: 'important' as const })),
      ...MIGRATION_KEYS.normal.map(key => ({ key, level: 'normal' as const }))
    ]

    for (const { key, level } of allKeys) {
      result.total++
      
      const migrationData = this.migrateKey(key, level)
      this.migrationLog.push(migrationData)

      if (migrationData.migrated) {
        result.migrated++
        console.log(`✅ ${key} migré (${level})`)
      } else if (migrationData.error) {
        result.failed++
        result.errors.push(`${key}: ${migrationData.error}`)
        console.error(`❌ ${key} échec:`, migrationData.error)
      } else {
        result.skipped++
        console.log(`⏭️ ${key} ignoré`)
      }
    }

    // Marquage de la migration comme terminée
    if (result.failed === 0) {
      this.markMigrationCompleted()
      console.log('🎉 Migration terminée avec succès!')
    } else {
      console.warn(`⚠️ Migration terminée avec ${result.failed} erreurs`)
    }

    return result
  }

  /**
   * Migration d'une clé spécifique
   */
  async migrateKey(key: string): Promise<boolean> {
    if (typeof window === 'undefined') return false

    // Déterminer le niveau de sécurité
    let securityLevel: 'critical' | 'important' | 'normal' = 'normal'
    
    if (MIGRATION_KEYS.critical.includes(key)) {
      securityLevel = 'critical'
    } else if (MIGRATION_KEYS.important.includes(key)) {
      securityLevel = 'important'
    }

    const migrationData = this.migrateKey(key, securityLevel)
    this.migrationLog.push(migrationData)

    return migrationData.migrated
  }

  /**
   * Restauration depuis la sauvegarde
   */
  async restoreFromBackup(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    try {
      const backupJson = localStorage.getItem('migration_backup')
      if (!backupJson) {
        console.error('❌ Aucune sauvegarde trouvée')
        return false
      }

      const backup = JSON.parse(backupJson)
      
      // Restaurer chaque clé
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value))
      })

      // Supprimer le flag de migration
      localStorage.removeItem('migration_completed')
      localStorage.removeItem('migration_date')
      
      console.log('🔄 Données restaurées depuis la sauvegarde')
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error)
      return false
    }
  }

  /**
   * Nettoyage des données migrées
   */
  async cleanup(): Promise<number> {
    if (typeof window === 'undefined') return 0

    let cleanedCount = 0
    
    try {
      // Nettoyer les données migrées avec succès
      this.migrationLog.forEach(migration => {
        if (migration.migrated && migration.securityLevel !== 'normal') {
          localStorage.removeItem(migration.key)
          cleanedCount++
        }
      })

      // Nettoyer les métadonnées de migration
      localStorage.removeItem('migration_backup')
      
      console.log(`🧹 ${cleanedCount} éléments nettoyés`)
      return cleanedCount
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error)
      return cleanedCount
    }
  }

  /**
   * Obtenir le statut de la migration
   */
  getMigrationStatus(): {
    completed: boolean
    date?: string
    totalKeys: number
    migratedKeys: number
    failedKeys: number
  } {
    const completed = this.isMigrationCompleted || this.isAlreadyMigrated()
    const date = completed ? localStorage.getItem('migration_date') || undefined : undefined
    
    return {
      completed,
      date,
      totalKeys: this.migrationLog.length,
      migratedKeys: this.migrationLog.filter(m => m.migrated).length,
      failedKeys: this.migrationLog.filter(m => !m.migrated && m.error).length
    }
  }

  /**
   * Obtenir le log de migration
   */
  getMigrationLog(): MigrationData[] {
    return [...this.migrationLog]
  }

  /**
   * Validation de l'intégrité des données migrées
   */
  async validateMigration(): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    try {
      // Vérifier les données critiques
      MIGRATION_KEYS.critical.forEach(key => {
        const migrated = secureStorage.getItem(key, true)
        const original = localStorage.getItem(key)
        
        if (original && !migrated) {
          errors.push(`Donnée critique ${key} non migrée`)
        }
      })

      // Vérifier les données importantes
      MIGRATION_KEYS.important.forEach(key => {
        const migrated = secureStorage.getItem(key)
        const original = localStorage.getItem(key)
        
        if (original && !migrated) {
          errors.push(`Donnée importante ${key} non migrée`)
        }
      })

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Erreur de validation']
      }
    }
  }
}

// Instance singleton du migrator
export const localStorageMigrator = new LocalStorageMigrator()

/**
 * Fonction utilitaire pour migration rapide
 */
export const migrateLocalStorage = async (): Promise<MigrationResult> => {
  return await localStorageMigrator.migrateAll()
}

/**
 * Fonction utilitaire pour migration d'une clé
 */
export const migrateKey = async (key: string): Promise<boolean> => {
  return await localStorageMigrator.migrateKey(key)
}

export default localStorageMigrator