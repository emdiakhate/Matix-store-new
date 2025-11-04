import { secureStorage } from '../storage/secureStorage'
import { createClient } from '../../lib/supabase/client'

/**
 * Interface pour les données de session
 */
export interface SessionData {
  id: string
  userId: string
  email: string
  role: string
  createdAt: number
  lastActivity: number
  expiresAt: number
  refreshToken?: string
  isActive: boolean
}

/**
 * Interface pour les événements de session
 */
export interface SessionEvent {
  type: 'created' | 'refreshed' | 'expired' | 'destroyed'
  sessionId: string
  timestamp: number
}

/**
 * Service de gestion des sessions utilisateur
 */
export class SessionService {
  private readonly SESSION_KEY = 'user_session'
  private readonly ACTIVITY_KEY = 'user_activity'
  private readonly REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly WARNING_TIME = 5 * 60 * 1000 // 5 minutes avant expiration
  private readonly MAX_IDLE_TIME = 30 * 60 * 1000 // 30 minutes d'inactivité
  
  private refreshTimer: NodeJS.Timeout | null = null
  private warningTimer: NodeJS.Timeout | null = null
  private activityListeners: (() => void)[] = []
  private sessionCallbacks: ((event: SessionEvent) => void)[] = []

  constructor() {
    this.initializeActivityTracking()
    this.startSessionMonitoring()
  }

  /**
   * Création d'une nouvelle session
   */
  async createSession(userData: {
    id: string
    email: string
    role: string
    refreshToken?: string
  }): Promise<SessionData | null> {
    try {
      const now = Date.now()
      const sessionId = this.generateSessionId()
      const expiresAt = now + (2 * 60 * 60 * 1000) // 2 heures par défaut

      const sessionData: SessionData = {
        id: sessionId,
        userId: userData.id,
        email: userData.email,
        role: userData.role,
        createdAt: now,
        lastActivity: now,
        expiresAt,
        refreshToken: userData.refreshToken,
        isActive: true
      }

      // Sauvegarder la session de manière sécurisée
      const success = secureStorage.setItem(this.SESSION_KEY, sessionData, true)
      
      if (!success) {
        throw new Error('Échec de la sauvegarde de la session')
      }

      // Démarrer le monitoring de la session
      this.startSessionRefresh()
      this.startExpirationWarning()

      // Émettre l'événement de création
      this.emitSessionEvent({
        type: 'created',
        sessionId,
        timestamp: now
      })

      console.log('✅ Session créée avec succès:', sessionId)
      return sessionData
    } catch (error) {
      console.error('❌ Erreur lors de la création de la session:', error)
      return null
    }
  }

  /**
   * Récupération de la session actuelle
   */
  getSession(): SessionData | null {
    try {
      const session = secureStorage.getItem(this.SESSION_KEY, true)
      
      if (!session) {
        return null
      }

      // Vérifier si la session est expirée
      if (Date.now() > session.expiresAt) {
        this.destroySession()
        return null
      }

      // Vérifier l'inactivité
      const idleTime = Date.now() - session.lastActivity
      if (idleTime > this.MAX_IDLE_TIME) {
        this.destroySession()
        return null
      }

      return session
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la session:', error)
      return null
    }
  }

  /**
   * Rafraîchissement de la session
   */
  async refreshSession(): Promise<SessionData | null> {
    try {
      const currentSession = this.getSession()
      
      if (!currentSession) {
        return null
      }

      const supabase = createClient()
      
      // Vérifier la session côté serveur
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.warn('⚠️ Session Supabase invalide, destruction de la session locale')
        this.destroySession()
        return null
      }

      // Mettre à jour les données de session
      const updatedSession: SessionData = {
        ...currentSession,
        lastActivity: Date.now(),
        expiresAt: Date.now() + (2 * 60 * 60 * 1000) // Renouveler pour 2 heures
      }

      // Sauvegarder la session mise à jour
      const success = secureStorage.setItem(this.SESSION_KEY, updatedSession, true)
      
      if (!success) {
        throw new Error('Échec de la mise à jour de la session')
      }

      // Émettre l'événement de rafraîchissement
      this.emitSessionEvent({
        type: 'refreshed',
        sessionId: currentSession.id,
        timestamp: Date.now()
      })

      console.log('🔄 Session rafraîchie:', currentSession.id)
      return updatedSession
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement de la session:', error)
      this.destroySession()
      return null
    }
  }

  /**
   * Destruction de la session
   */
  destroySession(): boolean {
    try {
      const currentSession = this.getSession()
      
      if (currentSession) {
        // Émettre l'événement de destruction
        this.emitSessionEvent({
          type: 'destroyed',
          sessionId: currentSession.id,
          timestamp: Date.now()
        })
      }

      // Nettoyer le stockage
      secureStorage.removeItem(this.SESSION_KEY)
      secureStorage.removeItem(this.ACTIVITY_KEY)

      // Arrêter les timers
      this.stopSessionRefresh()
      this.stopExpirationWarning()

      // Nettoyer les listeners d'activité
      this.activityListeners = []

      console.log('🗑️ Session détruite')
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la destruction de la session:', error)
      return false
    }
  }

  /**
   * Vérification de la validité de la session
   */
  isSessionValid(): boolean {
    const session = this.getSession()
    return session !== null && session.isActive
  }

  /**
   * Mise à jour de l'activité utilisateur
   */
  updateActivity(): void {
    try {
      const session = this.getSession()
      
      if (!session) {
        return
      }

      // Mettre à jour le timestamp d'activité
      const updatedSession: SessionData = {
        ...session,
        lastActivity: Date.now()
      }

      secureStorage.setItem(this.SESSION_KEY, updatedSession, true)
      
      // Sauvegarder l'activité pour le monitoring
      const activity = {
        timestamp: Date.now(),
        sessionId: session.id
      }
      
      secureStorage.setItem(this.ACTIVITY_KEY, activity)
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'activité:', error)
    }
  }

  /**
   * Prolongation manuelle de la session
   */
  extendSession(duration: number = 2 * 60 * 60 * 1000): boolean {
    try {
      const session = this.getSession()
      
      if (!session) {
        return false
      }

      const updatedSession: SessionData = {
        ...session,
        expiresAt: Date.now() + duration,
        lastActivity: Date.now()
      }

      const success = secureStorage.setItem(this.SESSION_KEY, updatedSession, true)
      
      if (success) {
        console.log('⏰ Session prolongée de', duration / (60 * 1000), 'minutes')
      }

      return success
    } catch (error) {
      console.error('❌ Erreur lors de la prolongation de la session:', error)
      return false
    }
  }

  /**
   * Temps restant avant expiration
   */
  getTimeRemaining(): number {
    const session = this.getSession()
    
    if (!session) {
      return 0
    }

    return Math.max(0, session.expiresAt - Date.now())
  }

  /**
   * Temps d'inactivité
   */
  getIdleTime(): number {
    const session = this.getSession()
    
    if (!session) {
      return 0
    }

    return Date.now() - session.lastActivity
  }

  /**
   * Génération d'un ID de session unique
   */
  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `session_${timestamp}_${random}`
  }

  /**
   * Initialisation du tracking d'activité
   */
  private initializeActivityTracking(): void {
    if (typeof window === 'undefined') return

    // Événements à tracker
    const events = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart']
    
    const activityHandler = () => {
      this.updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, activityHandler, { passive: true })
      this.activityListeners.push(() => {
        document.removeEventListener(event, activityHandler)
      })
    })

    // Tracking périodique (toutes les 5 minutes)
    const periodicUpdate = setInterval(() => {
      this.updateActivity()
    }, this.REFRESH_INTERVAL)

    this.activityListeners.push(() => {
      clearInterval(periodicUpdate)
    })
  }

  /**
   * Démarrage du monitoring de session
   */
  private startSessionMonitoring(): void {
    if (typeof window === 'undefined') return

    // Vérification périodique de la session
    setInterval(() => {
      const session = this.getSession()
      
      if (!session) {
        return
      }

      // Vérifier l'expiration
      if (Date.now() > session.expiresAt) {
        this.emitSessionEvent({
          type: 'expired',
          sessionId: session.id,
          timestamp: Date.now()
        })
        this.destroySession()
      }
    }, 60000) // Vérifier toutes les minutes
  }

  /**
   * Démarrage du rafraîchissement automatique
   */
  private startSessionRefresh(): void {
    this.stopSessionRefresh()
    
    this.refreshTimer = setInterval(async () => {
      await this.refreshSession()
    }, this.REFRESH_INTERVAL)
  }

  /**
   * Arrêt du rafraîchissement automatique
   */
  private stopSessionRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Démarrage de l'avertissement d'expiration
   */
  private startExpirationWarning(): void {
    this.stopExpirationWarning()
    
    this.warningTimer = setTimeout(() => {
      const timeRemaining = this.getTimeRemaining()
      
      if (timeRemaining <= this.WARNING_TIME) {
        console.warn('⚠️ Session expire dans', Math.round(timeRemaining / 60000), 'minutes')
        // Ici on pourrait émettre un événement pour afficher une notification à l'utilisateur
      }
    }, this.WARNING_TIME)
  }

  /**
   * Arrêt de l'avertissement d'expiration
   */
  private stopExpirationWarning(): void {
    if (this.warningTimer) {
      clearTimeout(this.warningTimer)
      this.warningTimer = null
    }
  }

  /**
   * Émission d'événements de session
   */
  private emitSessionEvent(event: SessionEvent): void {
    this.sessionCallbacks.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('❌ Erreur dans le callback de session:', error)
      }
    })
  }

  /**
   * Abonnement aux événements de session
   */
  onSessionEvent(callback: (event: SessionEvent) => void): () => void {
    this.sessionCallbacks.push(callback)
    
    // Retourner une fonction de désabonnement
    return () => {
      const index = this.sessionCallbacks.indexOf(callback)
      if (index > -1) {
        this.sessionCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Nettoyage des ressources
   */
  cleanup(): void {
    this.activityListeners.forEach(cleanup => cleanup())
    this.activityListeners = []
    this.sessionCallbacks = []
    this.stopSessionRefresh()
    this.stopExpirationWarning()
  }
}

// Instance singleton du service de session
export const sessionService = new SessionService()
export default sessionService
