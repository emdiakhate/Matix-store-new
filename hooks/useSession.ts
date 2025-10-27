import { useState, useEffect, useCallback } from 'react'
import { sessionService, SessionData, SessionEvent } from '../services/auth/sessionService'

/**
 * Interface pour l'état de la session
 */
export interface SessionState {
  session: SessionData | null
  isLoading: boolean
  isAuthenticated: boolean
  timeRemaining: number
  idleTime: number
  needsRefresh: boolean
  error: string | null
}

/**
 * Hook personnalisé pour la gestion des sessions
 */
export function useSession() {
  const [state, setState] = useState<SessionState>({
    session: null,
    isLoading: true,
    isAuthenticated: false,
    timeRemaining: 0,
    idleTime: 0,
    needsRefresh: false,
    error: null
  })

  /**
   * Mise à jour de l'état de la session
   */
  const updateSessionState = useCallback(() => {
    try {
      const session = sessionService.getSession()
      const isAuthenticated = sessionService.isSessionValid()
      const timeRemaining = sessionService.getTimeRemaining()
      const idleTime = sessionService.getIdleTime()

      setState(prevState => ({
        ...prevState,
        session,
        isAuthenticated,
        timeRemaining,
        idleTime,
        isLoading: false,
        error: null
      }))
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'état de session:', error)
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }))
    }
  }, [])

  /**
   * Rafraîchissement de la session
   */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      setState(prevState => ({ ...prevState, isLoading: true, error: null }))
      
      const refreshedSession = await sessionService.refreshSession()
      
      if (refreshedSession) {
        setState(prevState => ({
          ...prevState,
          session: refreshedSession,
          isAuthenticated: true,
          timeRemaining: sessionService.getTimeRemaining(),
          idleTime: sessionService.getIdleTime(),
          needsRefresh: false,
          isLoading: false,
          error: null
        }))
        return true
      } else {
        setState(prevState => ({
          ...prevState,
          session: null,
          isAuthenticated: false,
          timeRemaining: 0,
          idleTime: 0,
          needsRefresh: false,
          isLoading: false,
          error: 'Session expirée'
        }))
        return false
      }
    } catch (error) {
      console.error('❌ Erreur lors du rafraîchissement de la session:', error)
      setState(prevState => ({
        ...prevState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erreur de rafraîchissement'
      }))
      return false
    }
  }, [])

  /**
   * Prolongation de la session
   */
  const extendSession = useCallback((duration?: number): boolean => {
    try {
      const success = sessionService.extendSession(duration)
      
      if (success) {
        updateSessionState()
        return true
      } else {
        setState(prevState => ({
          ...prevState,
          error: 'Échec de la prolongation de la session'
        }))
        return false
      }
    } catch (error) {
      console.error('❌ Erreur lors de la prolongation de la session:', error)
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Erreur de prolongation'
      }))
      return false
    }
  }, [updateSessionState])

  /**
   * Déconnexion
   */
  const signOut = useCallback((): boolean => {
    try {
      const success = sessionService.destroySession()
      
      if (success) {
        setState({
          session: null,
          isLoading: false,
          isAuthenticated: false,
          timeRemaining: 0,
          idleTime: 0,
          needsRefresh: false,
          error: null
        })
        return true
      } else {
        setState(prevState => ({
          ...prevState,
          error: 'Échec de la déconnexion'
        }))
        return false
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error)
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'Erreur de déconnexion'
      }))
      return false
    }
  }, [])

  /**
   * Mise à jour de l'activité
   */
  const updateActivity = useCallback(() => {
    try {
      sessionService.updateActivity()
      updateSessionState()
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'activité:', error)
    }
  }, [updateSessionState])

  /**
   * Gestion des événements de session
   */
  const handleSessionEvent = useCallback((event: SessionEvent) => {
    console.log('📡 Événement de session:', event.type, event.sessionId)
    
    switch (event.type) {
      case 'created':
        updateSessionState()
        break
      case 'refreshed':
        setState(prevState => ({
          ...prevState,
          needsRefresh: false
        }))
        break
      case 'expired':
        setState(prevState => ({
          ...prevState,
          session: null,
          isAuthenticated: false,
          timeRemaining: 0,
          idleTime: 0,
          needsRefresh: false,
          error: 'Session expirée'
        }))
        break
      case 'destroyed':
        setState({
          session: null,
          isLoading: false,
          isAuthenticated: false,
          timeRemaining: 0,
          idleTime: 0,
          needsRefresh: false,
          error: null
        })
        break
    }
  }, [updateSessionState])

  /**
   * Initialisation du hook
   */
  useEffect(() => {
    // Mise à jour initiale de l'état
    updateSessionState()

    // Abonnement aux événements de session
    const unsubscribe = sessionService.onSessionEvent(handleSessionEvent)

    // Mise à jour périodique de l'état
    const interval = setInterval(updateSessionState, 30000) // Toutes les 30 secondes

    // Nettoyage
    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [updateSessionState, handleSessionEvent])

  /**
   * Mise à jour automatique du temps restant
   */
  useEffect(() => {
    if (!state.isAuthenticated) return

    const timer = setInterval(() => {
      setState(prevState => ({
        ...prevState,
        timeRemaining: sessionService.getTimeRemaining(),
        idleTime: sessionService.getIdleTime()
      }))
    }, 1000) // Mise à jour chaque seconde

    return () => clearInterval(timer)
  }, [state.isAuthenticated])

  /**
   * Formatage du temps restant
   */
  const formatTimeRemaining = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }, [])

  /**
   * Formatage du temps d'inactivité
   */
  const formatIdleTime = useCallback((milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }, [])

  /**
   * Vérification si la session est sur le point d'expirer
   */
  const isExpiringSoon = useCallback((): boolean => {
    return state.timeRemaining < 5 * 60 * 1000 // 5 minutes
  }, [state.timeRemaining])

  /**
   * Vérification si l'utilisateur est inactif
   */
  const isIdle = useCallback((): boolean => {
    return state.idleTime > 30 * 60 * 1000 // 30 minutes
  }, [state.idleTime])

  return {
    // État de la session
    session: state.session,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    timeRemaining: state.timeRemaining,
    idleTime: state.idleTime,
    needsRefresh: state.needsRefresh,
    error: state.error,

    // Actions
    refreshSession,
    extendSession,
    signOut,
    updateActivity,

    // Utilitaires
    formatTimeRemaining: formatTimeRemaining(state.timeRemaining),
    formatIdleTime: formatIdleTime(state.idleTime),
    isExpiringSoon: isExpiringSoon(),
    isIdle: isIdle(),

    // Données utilisateur
    user: state.session ? {
      id: state.session.userId,
      email: state.session.email,
      role: state.session.role
    } : null
  }
}

export default useSession
