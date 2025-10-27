import CryptoJS from 'crypto-js'

/**
 * Types de données par niveau de sécurité
 */
export enum DataSecurityLevel {
  CRITICAL = 'critical',    // Chiffrement obligatoire
  IMPORTANT = 'important',  // SessionStorage recommandé
  NORMAL = 'normal'         // localStorage acceptable
}

/**
 * Configuration de sécurité
 */
interface SecurityConfig {
  encryptionKey: string
  sessionDuration: number // en minutes
  maxRetries: number
}

/**
 * Service de stockage sécurisé avec chiffrement et gestion des sessions
 */
export class SecureStorage {
  private config: SecurityConfig
  private encryptionKey: string

  constructor() {
    this.config = {
      encryptionKey: process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'matix-default-key-2024',
      sessionDuration: parseInt(process.env.NEXT_PUBLIC_SESSION_DURATION || '120'), // 2 heures
      maxRetries: 3
    }
    this.encryptionKey = this.config.encryptionKey
  }

  /**
   * Génération d'une clé de chiffrement basée sur la session
   */
  private generateSessionKey(): string {
    if (typeof window === 'undefined') return this.encryptionKey
    
    // Utiliser l'ID de session ou un identifiant unique
    const sessionId = sessionStorage.getItem('session_id') || this.generateSessionId()
    return CryptoJS.SHA256(sessionId + this.encryptionKey).toString()
  }

  /**
   * Génération d'un ID de session unique
   */
  private generateSessionId(): string {
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('session_id', sessionId)
    return sessionId
  }

  /**
   * Chiffrement des données sensibles
   */
  private encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data)
      const sessionKey = this.generateSessionKey()
      const encrypted = CryptoJS.AES.encrypt(jsonString, sessionKey).toString()
      return encrypted
    } catch (error) {
      console.error('Erreur lors du chiffrement:', error)
      throw new Error('Échec du chiffrement des données')
    }
  }

  /**
   * Déchiffrement des données sensibles
   */
  private decrypt(encryptedData: string): any {
    try {
      const sessionKey = this.generateSessionKey()
      const decrypted = CryptoJS.AES.decrypt(encryptedData, sessionKey)
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!jsonString) {
        throw new Error('Données chiffrées invalides')
      }
      
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Erreur lors du déchiffrement:', error)
      throw new Error('Échec du déchiffrement des données')
    }
  }

  /**
   * Détermination du niveau de sécurité d'une clé
   */
  private getSecurityLevel(key: string): DataSecurityLevel {
    const criticalKeys = ['currentUser', 'active_role', 'user_tokens', 'auth_data']
    const importantKeys = ['user_preferences', 'cart_data', 'search_history', 'user_location']
    
    if (criticalKeys.some(k => key.includes(k))) {
      return DataSecurityLevel.CRITICAL
    }
    
    if (importantKeys.some(k => key.includes(k))) {
      return DataSecurityLevel.IMPORTANT
    }
    
    return DataSecurityLevel.NORMAL
  }

  /**
   * Stockage sécurisé avec chiffrement optionnel
   */
  setItem(key: string, value: any, encrypted: boolean = false): boolean {
    try {
      const securityLevel = this.getSecurityLevel(key)
      let dataToStore: string

      // Préparer les données selon le niveau de sécurité
      if (securityLevel === DataSecurityLevel.CRITICAL || encrypted) {
        dataToStore = this.encrypt(value)
      } else {
        dataToStore = JSON.stringify(value)
      }

      // Choisir le stockage selon le niveau de sécurité
      if (securityLevel === DataSecurityLevel.CRITICAL) {
        sessionStorage.setItem(key, dataToStore)
      } else if (securityLevel === DataSecurityLevel.IMPORTANT) {
        sessionStorage.setItem(key, dataToStore)
      } else {
        localStorage.setItem(key, dataToStore)
      }

      // Ajouter des métadonnées de sécurité
      const metadata = {
        timestamp: Date.now(),
        securityLevel,
        encrypted: securityLevel === DataSecurityLevel.CRITICAL || encrypted
      }
      
      const storageKey = securityLevel === DataSecurityLevel.CRITICAL ? 'sessionStorage' : 'localStorage'
      const metaKey = `${key}_meta`
      
      if (storageKey === 'sessionStorage') {
        sessionStorage.setItem(metaKey, JSON.stringify(metadata))
      } else {
        localStorage.setItem(metaKey, JSON.stringify(metadata))
      }

      return true
    } catch (error) {
      console.error(`Erreur lors du stockage de ${key}:`, error)
      return false
    }
  }

  /**
   * Récupération sécurisée avec déchiffrement automatique
   */
  getItem(key: string, encrypted: boolean = false): any {
    try {
      const securityLevel = this.getSecurityLevel(key)
      let storedData: string | null

      // Récupérer depuis le bon stockage
      if (securityLevel === DataSecurityLevel.CRITICAL) {
        storedData = sessionStorage.getItem(key)
      } else if (securityLevel === DataSecurityLevel.IMPORTANT) {
        storedData = sessionStorage.getItem(key)
      } else {
        storedData = localStorage.getItem(key)
      }

      if (!storedData) {
        return null
      }

      // Vérifier les métadonnées
      const metaKey = `${key}_meta`
      const storageKey = securityLevel === DataSecurityLevel.CRITICAL ? 'sessionStorage' : 'localStorage'
      const metadata = storageKey === 'sessionStorage' 
        ? sessionStorage.getItem(metaKey)
        : localStorage.getItem(metaKey)

      if (metadata) {
        const meta = JSON.parse(metadata)
        
        // Vérifier l'expiration pour les données critiques
        if (securityLevel === DataSecurityLevel.CRITICAL) {
          const age = Date.now() - meta.timestamp
          const maxAge = this.config.sessionDuration * 60 * 1000 // Convertir en ms
          
          if (age > maxAge) {
            this.removeItem(key)
            return null
          }
        }
      }

      // Déchiffrer si nécessaire
      if (securityLevel === DataSecurityLevel.CRITICAL || encrypted) {
        return this.decrypt(storedData)
      } else {
        return JSON.parse(storedData)
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error)
      return null
    }
  }

  /**
   * Suppression sécurisée d'un élément
   */
  removeItem(key: string): boolean {
    try {
      const securityLevel = this.getSecurityLevel(key)
      const metaKey = `${key}_meta`

      if (securityLevel === DataSecurityLevel.CRITICAL) {
        sessionStorage.removeItem(key)
        sessionStorage.removeItem(metaKey)
      } else if (securityLevel === DataSecurityLevel.IMPORTANT) {
        sessionStorage.removeItem(key)
        sessionStorage.removeItem(metaKey)
      } else {
        localStorage.removeItem(key)
        localStorage.removeItem(metaKey)
      }

      return true
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error)
      return false
    }
  }

  /**
   * Nettoyage complet du stockage
   */
  clear(): boolean {
    try {
      // Nettoyer sessionStorage
      sessionStorage.clear()
      
      // Nettoyer localStorage (garder seulement les préférences non sensibles)
      const keysToKeep = ['theme_preferences', 'ui_state', 'language']
      const allKeys = Object.keys(localStorage)
      
      allKeys.forEach(key => {
        if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
          localStorage.removeItem(key)
        }
      })

      return true
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error)
      return false
    }
  }

  /**
   * Nettoyage des données expirées
   */
  cleanupExpiredData(): number {
    let cleanedCount = 0
    
    try {
      // Nettoyer sessionStorage (toutes les données expirent à la fermeture)
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.endsWith('_meta')) {
          const metadata = sessionStorage.getItem(key)
          if (metadata) {
            const meta = JSON.parse(metadata)
            const age = Date.now() - meta.timestamp
            const maxAge = this.config.sessionDuration * 60 * 1000
            
            if (age > maxAge) {
              const dataKey = key.replace('_meta', '')
              sessionStorage.removeItem(dataKey)
              sessionStorage.removeItem(key)
              cleanedCount++
            }
          }
        }
      })

      // Nettoyer localStorage (garder seulement les données non sensibles)
      const localKeys = Object.keys(localStorage)
      localKeys.forEach(key => {
        if (key.endsWith('_meta')) {
          const metadata = localStorage.getItem(key)
          if (metadata) {
            const meta = JSON.parse(metadata)
            const age = Date.now() - meta.timestamp
            const maxAge = 24 * 60 * 60 * 1000 // 24 heures pour localStorage
            
            if (age > maxAge && meta.securityLevel !== 'normal') {
              const dataKey = key.replace('_meta', '')
              localStorage.removeItem(dataKey)
              localStorage.removeItem(key)
              cleanedCount++
            }
          }
        }
      })

      return cleanedCount
    } catch (error) {
      console.error('Erreur lors du nettoyage des données expirées:', error)
      return cleanedCount
    }
  }

  /**
   * Vérification de l'intégrité des données
   */
  validateData(key: string): boolean {
    try {
      const securityLevel = this.getSecurityLevel(key)
      const data = this.getItem(key)
      
      if (!data) {
        return false
      }

      // Vérifications spécifiques selon le type de données
      if (key.includes('currentUser')) {
        return data && typeof data === 'object' && data.email && data.id
      }
      
      if (key.includes('active_role')) {
        return ['eleveur', 'acheteur', 'admin'].includes(data)
      }

      return true
    } catch (error) {
      console.error(`Erreur lors de la validation de ${key}:`, error)
      return false
    }
  }

  /**
   * Migration des données depuis localStorage vers le stockage sécurisé
   */
  migrateFromLocalStorage(keys: string[]): { migrated: number; failed: number } {
    let migrated = 0
    let failed = 0

    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key)
        if (data) {
          const parsedData = JSON.parse(data)
          const success = this.setItem(key, parsedData)
          
          if (success) {
            localStorage.removeItem(key)
            migrated++
          } else {
            failed++
          }
        }
      } catch (error) {
        console.error(`Erreur lors de la migration de ${key}:`, error)
        failed++
      }
    })

    return { migrated, failed }
  }

  /**
   * Statistiques du stockage
   */
  getStorageStats(): {
    sessionStorage: { keys: number; size: number }
    localStorage: { keys: number; size: number }
    totalSize: number
  } {
    const sessionKeys = Object.keys(sessionStorage)
    const localKeys = Object.keys(localStorage)
    
    const sessionSize = sessionKeys.reduce((size, key) => {
      return size + (sessionStorage.getItem(key)?.length || 0)
    }, 0)
    
    const localSize = localKeys.reduce((size, key) => {
      return size + (localStorage.getItem(key)?.length || 0)
    }, 0)

    return {
      sessionStorage: { keys: sessionKeys.length, size: sessionSize },
      localStorage: { keys: localKeys.length, size: localSize },
      totalSize: sessionSize + localSize
    }
  }
}

// Instance singleton du service de stockage sécurisé
export const secureStorage = new SecureStorage()
export default secureStorage
