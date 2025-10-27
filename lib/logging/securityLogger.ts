/**
 * Interface pour les événements de sécurité
 */
interface SecurityEvent {
  type: string
  timestamp: string
  userId?: string
  ip: string
  userAgent: string
  endpoint?: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Interface pour les logs de sécurité
 */
interface SecurityLog {
  id: string
  event: SecurityEvent
  processed: boolean
  createdAt: string
}

/**
 * Types d'événements de sécurité
 */
export enum SecurityEventType {
  // Authentification
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  SIGNUP_SUCCESS = 'SIGNUP_SUCCESS',
  SIGNUP_FAILED = 'SIGNUP_FAILED',
  
  // Accès
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INSUFFICIENT_ROLE = 'INSUFFICIENT_ROLE',
  ACCESS_GRANTED = 'ACCESS_GRANTED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  
  // Base de données
  DATABASE_ERROR = 'DATABASE_ERROR',
  
  // Produits
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  
  // Profil
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  
  // Erreurs
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Suspicious activity
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  MULTIPLE_FAILED_ATTEMPTS = 'MULTIPLE_FAILED_ATTEMPTS'
}

/**
 * Niveaux de sévérité par type d'événement
 */
const SEVERITY_LEVELS: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
  [SecurityEventType.LOGIN_SUCCESS]: 'low',
  [SecurityEventType.LOGIN_FAILED]: 'medium',
  [SecurityEventType.LOGOUT]: 'low',
  [SecurityEventType.SIGNUP_SUCCESS]: 'low',
  [SecurityEventType.SIGNUP_FAILED]: 'medium',
  
  [SecurityEventType.UNAUTHORIZED_ACCESS]: 'high',
  [SecurityEventType.INSUFFICIENT_ROLE]: 'medium',
  [SecurityEventType.ACCESS_GRANTED]: 'low',
  [SecurityEventType.ACCESS_DENIED]: 'medium',
  
  [SecurityEventType.RATE_LIMIT_EXCEEDED]: 'medium',
  [SecurityEventType.VALIDATION_ERROR]: 'low',
  [SecurityEventType.DATABASE_ERROR]: 'high',
  
  [SecurityEventType.PRODUCT_CREATED]: 'low',
  [SecurityEventType.PRODUCT_UPDATED]: 'low',
  [SecurityEventType.PRODUCT_DELETED]: 'medium',
  [SecurityEventType.PRODUCT_NOT_FOUND]: 'low',
  
  [SecurityEventType.PROFILE_UPDATED]: 'low',
  [SecurityEventType.PROFILE_NOT_FOUND]: 'low',
  
  [SecurityEventType.INTERNAL_ERROR]: 'high',
  [SecurityEventType.SUSPICIOUS_ACTIVITY]: 'critical',
  [SecurityEventType.MULTIPLE_FAILED_ATTEMPTS]: 'critical'
}

/**
 * Service de logging de sécurité
 */
export class SecurityLogger {
  private logs: SecurityLog[] = []
  private maxLogs = 10000 // Maximum de logs en mémoire
  private suspiciousIPs = new Map<string, { count: number; lastSeen: number }>()
  private failedAttempts = new Map<string, { count: number; lastAttempt: number }>()

  /**
   * Logger un événement de sécurité
   */
  log(type: string, details: Record<string, any> = {}): void {
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: details.userId,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
      endpoint: details.endpoint,
      details,
      severity: SEVERITY_LEVELS[type] || 'medium'
    }

    const log: SecurityLog = {
      id: this.generateLogId(),
      event,
      processed: false,
      createdAt: new Date().toISOString()
    }

    // Ajouter le log
    this.logs.push(log)

    // Nettoyer les anciens logs si nécessaire
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    // Traitement spécial selon le type d'événement
    this.processEvent(event)

    // Log dans la console pour le développement
    this.logToConsole(event)

    // En production, envoyer vers un service de monitoring
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(event)
    }
  }

  /**
   * Traitement spécial des événements
   */
  private processEvent(event: SecurityEvent): void {
    switch (event.type) {
      case SecurityEventType.LOGIN_FAILED:
        this.trackFailedAttempt(event.ip)
        break
      
      case SecurityEventType.UNAUTHORIZED_ACCESS:
        this.trackSuspiciousActivity(event.ip)
        break
      
      case SecurityEventType.RATE_LIMIT_EXCEEDED:
        this.trackSuspiciousActivity(event.ip)
        break
      
      case SecurityEventType.MULTIPLE_FAILED_ATTEMPTS:
        this.blockSuspiciousIP(event.ip)
        break
    }
  }

  /**
   * Tracker les tentatives échouées
   */
  private trackFailedAttempt(ip: string): void {
    const now = Date.now()
    const existing = this.failedAttempts.get(ip)
    
    if (existing) {
      const timeDiff = now - existing.lastAttempt
      
      // Si moins de 5 minutes entre les tentatives
      if (timeDiff < 5 * 60 * 1000) {
        existing.count++
        existing.lastAttempt = now
        
        // Si plus de 5 tentatives en 5 minutes
        if (existing.count >= 5) {
          this.log(SecurityEventType.MULTIPLE_FAILED_ATTEMPTS, {
            ip,
            attempts: existing.count,
            timeWindow: '5 minutes'
          })
        }
      } else {
        // Reset le compteur si plus de 5 minutes
        this.failedAttempts.set(ip, { count: 1, lastAttempt: now })
      }
    } else {
      this.failedAttempts.set(ip, { count: 1, lastAttempt: now })
    }
  }

  /**
   * Tracker les activités suspectes
   */
  private trackSuspiciousActivity(ip: string): void {
    const now = Date.now()
    const existing = this.suspiciousIPs.get(ip)
    
    if (existing) {
      const timeDiff = now - existing.lastSeen
      
      // Si moins de 10 minutes entre les activités suspectes
      if (timeDiff < 10 * 60 * 1000) {
        existing.count++
        existing.lastSeen = now
        
        // Si plus de 3 activités suspectes en 10 minutes
        if (existing.count >= 3) {
          this.log(SecurityEventType.SUSPICIOUS_ACTIVITY, {
            ip,
            activities: existing.count,
            timeWindow: '10 minutes'
          })
        }
      } else {
        // Reset le compteur si plus de 10 minutes
        this.suspiciousIPs.set(ip, { count: 1, lastSeen: now })
      }
    } else {
      this.suspiciousIPs.set(ip, { count: 1, lastSeen: now })
    }
  }

  /**
   * Bloquer une IP suspecte
   */
  private blockSuspiciousIP(ip: string): void {
    // En production, ajouter l'IP à une liste de blocage
    console.warn(`🚨 IP suspecte bloquée: ${ip}`)
    
    // Log l'événement de blocage
    this.log('IP_BLOCKED', {
      ip,
      reason: 'multiple_failed_attempts',
      blockedAt: new Date().toISOString()
    })
  }

  /**
   * Logger dans la console avec formatage
   */
  private logToConsole(event: SecurityEvent): void {
    const emoji = this.getSeverityEmoji(event.severity)
    const message = `${emoji} [SECURITY] ${event.type}`
    
    console.log(message, {
      timestamp: event.timestamp,
      userId: event.userId || 'anonymous',
      ip: event.ip,
      endpoint: event.endpoint,
      severity: event.severity,
      details: event.details
    })
  }

  /**
   * Obtenir l'emoji selon la sévérité
   */
  private getSeverityEmoji(severity: string): string {
    switch (severity) {
      case 'low': return 'ℹ️'
      case 'medium': return '⚠️'
      case 'high': return '🚨'
      case 'critical': return '🔥'
      default: return '📝'
    }
  }

  /**
   * Envoyer vers un service de monitoring (ex: Sentry, LogRocket, etc.)
   */
  private sendToMonitoring(event: SecurityEvent): void {
    // En production, intégrer avec un service de monitoring
    // Exemple avec Sentry:
    // Sentry.captureMessage(`Security Event: ${event.type}`, {
    //   level: event.severity,
    //   tags: {
    //     security: true,
    //     eventType: event.type,
    //     severity: event.severity
    //   },
    //   extra: event.details
    // })
  }

  /**
   * Générer un ID unique pour le log
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Récupérer les logs par critères
   */
  getLogs(filters: {
    type?: string
    severity?: string
    userId?: string
    ip?: string
    startDate?: string
    endDate?: string
    limit?: number
  } = {}): SecurityLog[] {
    let filteredLogs = [...this.logs]

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.event.type === filters.type)
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.event.severity === filters.severity)
    }

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.event.userId === filters.userId)
    }

    if (filters.ip) {
      filteredLogs = filteredLogs.filter(log => log.event.ip === filters.ip)
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.event.timestamp >= filters.startDate!)
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.event.timestamp <= filters.endDate!)
    }

    // Trier par timestamp décroissant
    filteredLogs.sort((a, b) => new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime())

    if (filters.limit) {
      filteredLogs = filteredLogs.slice(0, filters.limit)
    }

    return filteredLogs
  }

  /**
   * Obtenir les statistiques de sécurité
   */
  getStats(): {
    totalLogs: number
    logsByType: Record<string, number>
    logsBySeverity: Record<string, number>
    suspiciousIPs: number
    blockedIPs: number
    failedAttempts: number
  } {
    const stats = {
      totalLogs: this.logs.length,
      logsByType: {} as Record<string, number>,
      logsBySeverity: {} as Record<string, number>,
      suspiciousIPs: this.suspiciousIPs.size,
      blockedIPs: 0, // À implémenter avec une vraie liste de blocage
      failedAttempts: this.failedAttempts.size
    }

    // Compter par type et sévérité
    this.logs.forEach(log => {
      const type = log.event.type
      const severity = log.event.severity

      stats.logsByType[type] = (stats.logsByType[type] || 0) + 1
      stats.logsBySeverity[severity] = (stats.logsBySeverity[severity] || 0) + 1
    })

    return stats
  }

  /**
   * Nettoyer les logs anciens
   */
  cleanup(daysToKeep: number = 30): number {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)
    const cutoffTime = cutoffDate.getTime()

    const initialCount = this.logs.length
    this.logs = this.logs.filter(log => new Date(log.event.timestamp).getTime() > cutoffTime)
    
    return initialCount - this.logs.length
  }

  /**
   * Exporter les logs pour analyse
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['timestamp', 'type', 'severity', 'userId', 'ip', 'endpoint', 'details']
      const rows = this.logs.map(log => [
        log.event.timestamp,
        log.event.type,
        log.event.severity,
        log.event.userId || '',
        log.event.ip,
        log.event.endpoint || '',
        JSON.stringify(log.event.details)
      ])
      
      return [headers, ...rows].map(row => row.join(',')).join('\n')
    }
    
    return JSON.stringify(this.logs, null, 2)
  }
}

// Instance singleton du logger de sécurité
export const securityLogger = new SecurityLogger()

/**
 * Fonction utilitaire pour logger rapidement
 */
export function logSecurityEvent(type: string, details: Record<string, any> = {}): void {
  securityLogger.log(type, details)
}

/**
 * Fonction utilitaire pour logger les erreurs de sécurité
 */
export function logSecurityError(type: string, error: Error, details: Record<string, any> = {}): void {
  securityLogger.log(type, {
    ...details,
    error: error.message,
    stack: error.stack
  })
}

export default securityLogger
