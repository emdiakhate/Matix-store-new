import { secureStorage } from '../../services/storage/secureStorage'
import { sessionService } from '../../services/auth/sessionService'
import { localStorageMigrator } from '../../utils/migrateLocalStorage'

/**
 * Tests de sécurité pour le stockage et les sessions
 */
describe('Security Tests', () => {
  beforeEach(() => {
    // Nettoyer le stockage avant chaque test
    if (typeof window !== 'undefined') {
      sessionStorage.clear()
      localStorage.clear()
    }
  })

  describe('SecureStorage', () => {
    test('should encrypt critical data', () => {
      const testData = { 
        email: 'test@example.com',
        id: '123',
        password: 'secret123'
      }

      // Stocker avec chiffrement
      const success = secureStorage.setItem('test_critical', testData, true)
      expect(success).toBe(true)

      // Récupérer et vérifier
      const retrieved = secureStorage.getItem('test_critical', true)
      expect(retrieved).toEqual(testData)
      
      // Vérifier que les données ne sont pas en clair dans le stockage
      const rawData = sessionStorage.getItem('test_critical')
      expect(rawData).not.toContain('test@example.com')
      expect(rawData).not.toContain('secret123')
    })

    test('should store important data in sessionStorage', () => {
      const testData = { preferences: { theme: 'dark' } }
      
      const success = secureStorage.setItem('user_preferences', testData)
      expect(success).toBe(true)
      
      const retrieved = secureStorage.getItem('user_preferences')
      expect(retrieved).toEqual(testData)
      
      // Vérifier que c'est en sessionStorage
      const rawData = sessionStorage.getItem('user_preferences')
      expect(rawData).toBeTruthy()
    })

    test('should store normal data in localStorage', () => {
      const testData = { theme: 'light' }
      
      const success = secureStorage.setItem('theme_preferences', testData)
      expect(success).toBe(true)
      
      const retrieved = secureStorage.getItem('theme_preferences')
      expect(retrieved).toEqual(testData)
      
      // Vérifier que c'est en localStorage
      const rawData = localStorage.getItem('theme_preferences')
      expect(rawData).toBeTruthy()
    })

    test('should handle encryption errors gracefully', () => {
      // Tester avec des données invalides
      const invalidData = { circular: {} }
      invalidData.circular = invalidData // Référence circulaire
      
      const success = secureStorage.setItem('invalid_data', invalidData, true)
      expect(success).toBe(false)
    })

    test('should validate data integrity', () => {
      const validUser = { email: 'test@example.com', id: '123' }
      const invalidUser = { email: 'invalid', id: null }
      
      secureStorage.setItem('valid_user', validUser, true)
      secureStorage.setItem('invalid_user', invalidUser, true)
      
      expect(secureStorage.validateData('valid_user')).toBe(true)
      expect(secureStorage.validateData('invalid_user')).toBe(false)
    })

    test('should cleanup expired data', () => {
      // Simuler des données expirées
      const expiredData = { test: 'data' }
      secureStorage.setItem('expired_data', expiredData, true)
      
      // Modifier manuellement les métadonnées pour simuler l'expiration
      const metaKey = 'expired_data_meta'
      const expiredMeta = {
        timestamp: Date.now() - (3 * 60 * 60 * 1000), // 3 heures
        securityLevel: 'critical',
        encrypted: true
      }
      sessionStorage.setItem(metaKey, JSON.stringify(expiredMeta))

      const cleanedCount = secureStorage.cleanupExpiredData()
      expect(cleanedCount).toBeGreaterThan(0)
      
      // Vérifier que les données expirées sont supprimées
      const retrieved = secureStorage.getItem('expired_data', true)
      expect(retrieved).toBeNull()
    })
  })

  describe('SessionService', () => {
    test('should create and manage sessions', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }

      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      expect(session?.userId).toBe(userData.id)
      expect(session?.email).toBe(userData.email)
      expect(session?.isActive).toBe(true)
      
      // Récupérer la session
      const retrievedSession = sessionService.getSession()
      expect(retrievedSession).toEqual(session)
      
      // Vérifier la validité
      expect(sessionService.isSessionValid()).toBe(true)
    })

    test('should handle session expiration', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }

      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      
      // Simuler l'expiration en modifiant la date d'expiration
      if (session) {
        const expiredSession = {
          ...session,
          expiresAt: Date.now() - 1000 // Expiré il y a 1 seconde
        }
        
        // Forcer la mise à jour (simulation)
        secureStorage.setItem('user_session', expiredSession, true)
        
        // Vérifier que la session est considérée comme expirée
        const retrievedSession = sessionService.getSession()
        expect(retrievedSession).toBeNull()
        expect(sessionService.isSessionValid()).toBe(false)
      }
    })

    test('should handle idle timeout', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }

      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      
      // Simuler l'inactivité
      if (session) {
        const idleSession = {
          ...session,
          lastActivity: Date.now() - (31 * 60 * 1000) // Inactif depuis 31 minutes
        }
        
        // Forcer la mise à jour (simulation)
        secureStorage.setItem('user_session', idleSession, true)
        
        // Vérifier que la session est considérée comme expirée
        const retrievedSession = sessionService.getSession()
        expect(retrievedSession).toBeNull()
      }
    })

    test('should refresh sessions', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }
      
      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      
      // Rafraîchir la session
      const refreshedSession = await sessionService.refreshSession()
      expect(refreshedSession).toBeTruthy()
      expect(refreshedSession?.userId).toBe(userData.id)
      
      // Vérifier que la date d'expiration est mise à jour
      if (refreshedSession && session) {
        expect(refreshedSession.expiresAt).toBeGreaterThan(session.expiresAt)
      }
    })

    test('should destroy sessions properly', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }

      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      
      // Détruire la session
      const destroyed = sessionService.destroySession()
      expect(destroyed).toBe(true)
      
      // Vérifier que la session est supprimée
      const retrievedSession = sessionService.getSession()
      expect(retrievedSession).toBeNull()
      expect(sessionService.isSessionValid()).toBe(false)
    })

    test('should track user activity', async () => {
      const userData = {
        id: 'user123',
        email: 'test@example.com',
        role: 'acheteur'
      }
      
      // Créer une session
      const session = await sessionService.createSession(userData)
      expect(session).toBeTruthy()
      
      // Mettre à jour l'activité
      sessionService.updateActivity()
      
      // Vérifier que l'activité est mise à jour
      const updatedSession = sessionService.getSession()
      expect(updatedSession).toBeTruthy()
      
      if (updatedSession && session) {
        expect(updatedSession.lastActivity).toBeGreaterThan(session.lastActivity)
      }
    })
  })

  describe('LocalStorageMigrator', () => {
    test('should migrate critical data', async () => {
      // Préparer des données de test
      const testUser = { email: 'test@example.com', id: '123' }
      localStorage.setItem('currentUser', JSON.stringify(testUser))
      
      // Migrer
      const result = await localStorageMigrator.migrateAll()
      
      expect(result.total).toBeGreaterThan(0)
      expect(result.migrated).toBeGreaterThan(0)
      
      // Vérifier que les données sont migrées
      const migratedUser = secureStorage.getItem('currentUser', true)
      expect(migratedUser).toEqual(testUser)
      
      // Vérifier que les données originales sont supprimées
      const originalUser = localStorage.getItem('currentUser')
      expect(originalUser).toBeNull()
    })

    test('should handle migration errors gracefully', async () => {
      // Créer des données invalides
      localStorage.setItem('invalid_data', 'invalid json')
      
      // Migrer
      const result = await localStorageMigrator.migrateAll()
      
      // Vérifier que les erreurs sont gérées
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.failed).toBeGreaterThan(0)
    })

    test('should restore from backup', async () => {
      // Préparer des données de test
      const testData = { test: 'data' }
      localStorage.setItem('test_key', JSON.stringify(testData))
      
      // Migrer
      await localStorageMigrator.migrateAll()
      
      // Restaurer
      const restored = await localStorageMigrator.restoreFromBackup()
      expect(restored).toBe(true)
      
      // Vérifier que les données sont restaurées
      const restoredData = localStorage.getItem('test_key')
      expect(restoredData).toBe(JSON.stringify(testData))
    })

    test('should validate migration integrity', async () => {
      // Préparer des données de test
      const testUser = { email: 'test@example.com', id: '123' }
      localStorage.setItem('currentUser', JSON.stringify(testUser))
      
      // Migrer
      await localStorageMigrator.migrateAll()
      
      // Valider
      const validation = await localStorageMigrator.validateMigration()
      expect(validation.valid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })
  })

  describe('XSS Protection', () => {
    test('should prevent XSS in stored data', () => {
      const maliciousData = {
        name: '<script>alert("XSS")</script>',
        email: 'test@example.com'
      }
      
      // Stocker les données malveillantes
      const success = secureStorage.setItem('malicious_data', maliciousData, true)
      expect(success).toBe(true)
      
      // Récupérer et vérifier que le script n'est pas exécuté
      const retrieved = secureStorage.getItem('malicious_data', true)
      expect(retrieved).toEqual(maliciousData)
      
      // Vérifier que le script est bien échappé dans le stockage
      const rawData = sessionStorage.getItem('malicious_data')
      expect(rawData).toContain('&lt;script&gt;')
    })

    test('should sanitize user input', () => {
      const userInput = {
        name: 'John<script>alert("XSS")</script>Doe',
        email: 'john@example.com'
      }
      
      // Stocker les données utilisateur
      const success = secureStorage.setItem('user_input', userInput)
      expect(success).toBe(true)
      
      // Récupérer et vérifier
      const retrieved = secureStorage.getItem('user_input')
      expect(retrieved).toEqual(userInput)
    })
  })

  describe('Performance Tests', () => {
    test('should handle large data efficiently', () => {
      const largeData = {
        items: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          data: 'x'.repeat(100)
        }))
      }
      
      const startTime = performance.now()
      const success = secureStorage.setItem('large_data', largeData, true)
      const endTime = performance.now()
      
      expect(success).toBe(true)
      expect(endTime - startTime).toBeLessThan(1000) // Moins de 1 seconde
      
      // Vérifier que les données sont récupérables
      const retrieved = secureStorage.getItem('large_data', true)
      expect(retrieved).toEqual(largeData)
    })

    test('should handle multiple operations efficiently', () => {
      const operations = 100
      const startTime = performance.now()
      
      for (let i = 0; i < operations; i++) {
        const data = { id: i, value: `data_${i}` }
        secureStorage.setItem(`test_${i}`, data)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(5000) // Moins de 5 secondes pour 100 opérations
      
      // Vérifier que toutes les données sont récupérables
      for (let i = 0; i < operations; i++) {
        const retrieved = secureStorage.getItem(`test_${i}`)
        expect(retrieved).toEqual({ id: i, value: `data_${i}` })
      }
    })
  })
})

/**
 * Tests d'intégration
 */
describe('Integration Tests', () => {
  test('should work with real authentication flow', async () => {
    // Simuler un flux d'authentification complet
    const userData = {
      id: 'user123',
      email: 'test@example.com',
      role: 'acheteur'
    }

    // 1. Créer une session
    const session = await sessionService.createSession(userData)
    expect(session).toBeTruthy()

    // 2. Stocker des données utilisateur
    const userProfile = {
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+221771234567'
    }
    secureStorage.setItem('user_profile', userProfile, true)
    
    // 3. Vérifier que tout fonctionne ensemble
    const retrievedSession = sessionService.getSession()
    const retrievedProfile = secureStorage.getItem('user_profile', true)

    expect(retrievedSession).toBeTruthy()
    expect(retrievedProfile).toEqual(userProfile)
    
    // 4. Nettoyer
    sessionService.destroySession()
    secureStorage.removeItem('user_profile')
  })
})