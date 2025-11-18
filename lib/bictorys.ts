// ============================================================================
// Service d'intégration Bictorys
// API de paiement pour Orange Money, Wave, Carte bancaire
// Documentation: https://docs.bictorys.com
// ============================================================================

import { BictorysChargeRequest, BictorysResponse, PaymentMethod } from './types'

// ============================================================================
// CONFIGURATION
// ============================================================================

const BICTORYS_API_URL = process.env.NEXT_PUBLIC_BICTORYS_API_URL || 'https://api.bictorys.com'
const BICTORYS_API_KEY = process.env.BICTORYS_API_KEY || ''
const BICTORYS_TEST_MODE = process.env.NEXT_PUBLIC_BICTORYS_TEST_MODE === 'true'

// URL de l'API (test ou production)
const API_BASE_URL = BICTORYS_TEST_MODE
  ? 'https://api.test.bictorys.com'
  : BICTORYS_API_URL

// ============================================================================
// TYPES
// ============================================================================

export interface BictorysCustomer {
  name: string
  email?: string
  phone: string
  address?: string
}

export interface BictorysChargeOptions {
  amount: number
  currency?: string
  description?: string
  customer: BictorysCustomer
  paymentType?: PaymentMethod
  metadata?: Record<string, unknown>
  callbackUrl?: string
  redirectUrl?: string
  invoiceId?: string
  orderId?: string
}

export interface BictorysChargeResponse {
  success: boolean
  data?: {
    type: string
    link?: string
    chargeId: string
    opToken?: string
    transactionId?: string
  }
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface BictorysTransactionStatus {
  success: boolean
  data?: {
    transactionId: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    amount: number
    currency: string
    paymentMethod: string
    customerPhone?: string
    createdAt: string
    completedAt?: string
    failureReason?: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface BictorysRefundOptions {
  transactionId: string
  amount?: number // Remboursement partiel si spécifié
  reason?: string
}

export interface BictorysRefundResponse {
  success: boolean
  data?: {
    refundId: string
    transactionId: string
    amount: number
    status: string
  }
  error?: {
    code: string
    message: string
  }
}

export interface BictorysWebhookPayload {
  event: string
  data: {
    transactionId: string
    chargeId: string
    status: string
    amount: number
    currency: string
    paymentMethod: string
    customerPhone?: string
    metadata?: Record<string, unknown>
    completedAt?: string
    failureReason?: string
  }
}

// ============================================================================
// SERVICE BICTORYS
// ============================================================================

export const bictorysService = {
  /**
   * Initier un paiement
   * Crée une charge et retourne un lien de paiement ou initie directement le paiement
   */
  async createCharge(options: BictorysChargeOptions): Promise<BictorysChargeResponse> {
    try {
      const payload: Record<string, unknown> = {
        amount: options.amount,
        currency: options.currency || 'XOF',
        description: options.description || 'Paiement MATIX',
        customer: {
          name: options.customer.name,
          email: options.customer.email,
          phone: options.customer.phone,
          address: options.customer.address
        },
        metadata: {
          ...options.metadata,
          orderId: options.orderId,
          platform: 'MATIX'
        }
      }

      // Ajouter les URLs de callback si fournies
      if (options.callbackUrl) {
        payload.callbackUrl = options.callbackUrl
      }
      if (options.redirectUrl) {
        payload.redirectUrl = options.redirectUrl
      }

      // Construire l'URL avec le type de paiement si spécifié
      let url = `${API_BASE_URL}/pay/v1/charges`
      if (options.paymentType && options.paymentType !== 'cash_on_delivery') {
        const paymentTypeMap: Record<string, string> = {
          orange_money: 'orange_money',
          wave: 'wave',
          card: 'card'
        }
        url += `?payment_type=${paymentTypeMap[options.paymentType]}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BICTORYS_API_KEY}`,
          'X-API-Key': BICTORYS_API_KEY
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.status || 'UNKNOWN_ERROR',
            message: data.title || 'Une erreur est survenue',
            details: data.details
          }
        }
      }

      // Réponse 201: Paiement initié (attente confirmation client)
      // Réponse 202: Lien de checkout généré
      return {
        success: true,
        data: {
          type: data.type || 'CheckoutLinkObject',
          link: data.link,
          chargeId: data.chargeId,
          opToken: data.opToken,
          transactionId: data.transactionId
        }
      }
    } catch (error) {
      console.error('Bictorys createCharge error:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion au service de paiement'
        }
      }
    }
  },

  /**
   * Obtenir le statut d'une transaction
   */
  async getTransactionStatus(transactionId: string): Promise<BictorysTransactionStatus> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pay/v1/transactions/${transactionId}/status`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BICTORYS_API_KEY}`,
            'X-API-Key': BICTORYS_API_KEY
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.status || 'UNKNOWN_ERROR',
            message: data.title || 'Impossible de récupérer le statut'
          }
        }
      }

      return {
        success: true,
        data: {
          transactionId: data.transactionId,
          status: data.status,
          amount: data.amount,
          currency: data.currency,
          paymentMethod: data.paymentMethod,
          customerPhone: data.customerPhone,
          createdAt: data.createdAt,
          completedAt: data.completedAt,
          failureReason: data.failureReason
        }
      }
    } catch (error) {
      console.error('Bictorys getTransactionStatus error:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion au service de paiement'
        }
      }
    }
  },

  /**
   * Obtenir les détails d'une charge
   */
  async getChargeDetails(chargeId: string, opToken?: string): Promise<BictorysChargeResponse> {
    try {
      let url = `${API_BASE_URL}/pay/v1/charges/${chargeId}`
      if (opToken) {
        url += `?opToken=${opToken}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${BICTORYS_API_KEY}`,
          'X-API-Key': BICTORYS_API_KEY
        }
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.status || 'UNKNOWN_ERROR',
            message: data.title || 'Impossible de récupérer les détails'
          }
        }
      }

      return {
        success: true,
        data: {
          type: data.type,
          chargeId: data.chargeId,
          transactionId: data.transactionId
        }
      }
    } catch (error) {
      console.error('Bictorys getChargeDetails error:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion au service de paiement'
        }
      }
    }
  },

  /**
   * Effectuer un remboursement
   */
  async refundTransaction(options: BictorysRefundOptions): Promise<BictorysRefundResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pay/v1/transactions/${options.transactionId}/refund`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BICTORYS_API_KEY}`,
            'X-API-Key': BICTORYS_API_KEY
          },
          body: JSON.stringify({
            amount: options.amount,
            reason: options.reason
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: data.status || 'UNKNOWN_ERROR',
            message: data.title || 'Impossible d\'effectuer le remboursement'
          }
        }
      }

      return {
        success: true,
        data: {
          refundId: data.refundId,
          transactionId: options.transactionId,
          amount: data.amount,
          status: data.status
        }
      }
    } catch (error) {
      console.error('Bictorys refundTransaction error:', error)
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion au service de paiement'
        }
      }
    }
  },

  /**
   * Valider et parser un webhook Bictorys
   */
  parseWebhook(payload: unknown): BictorysWebhookPayload | null {
    try {
      const webhook = payload as BictorysWebhookPayload

      if (!webhook.event || !webhook.data || !webhook.data.transactionId) {
        console.error('Invalid webhook payload')
        return null
      }

      return webhook
    } catch (error) {
      console.error('Bictorys parseWebhook error:', error)
      return null
    }
  },

  /**
   * Vérifier la signature d'un webhook (si Bictorys le supporte)
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implémenter la vérification de signature si Bictorys le supporte
    // Pour l'instant, on fait confiance au payload
    return true
  },

  /**
   * Obtenir les méthodes de paiement disponibles pour le marchand
   */
  async getPaymentMethods(): Promise<{ success: boolean; methods?: string[]; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pay/v1/settings/payment-methods`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BICTORYS_API_KEY}`,
            'X-API-Key': BICTORYS_API_KEY
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.title || 'Impossible de récupérer les méthodes de paiement'
        }
      }

      return {
        success: true,
        methods: data.methods || []
      }
    } catch (error) {
      console.error('Bictorys getPaymentMethods error:', error)
      return {
        success: false,
        error: 'Erreur de connexion'
      }
    }
  },

  /**
   * Obtenir le solde du marchand
   */
  async getMerchantBalance(): Promise<{ success: boolean; balance?: number; currency?: string; error?: string }> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pay/v1/balance`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${BICTORYS_API_KEY}`,
            'X-API-Key': BICTORYS_API_KEY
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.title || 'Impossible de récupérer le solde'
        }
      }

      return {
        success: true,
        balance: data.balance,
        currency: data.currency || 'XOF'
      }
    } catch (error) {
      console.error('Bictorys getMerchantBalance error:', error)
      return {
        success: false,
        error: 'Erreur de connexion'
      }
    }
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

/**
 * Formater un montant en XOF
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Calculer les frais de plateforme (2%)
 */
export function calculatePlatformFee(amount: number): number {
  return Math.round(amount * 0.02)
}

/**
 * Mapper le statut Bictorys vers notre statut interne
 */
export function mapBictorysStatus(bictorysStatus: string): 'pending' | 'processing' | 'completed' | 'failed' {
  const statusMap: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {
    'pending': 'pending',
    'processing': 'processing',
    'initiated': 'processing',
    'completed': 'completed',
    'success': 'completed',
    'paid': 'completed',
    'failed': 'failed',
    'cancelled': 'failed',
    'expired': 'failed',
    'rejected': 'failed'
  }

  return statusMap[bictorysStatus.toLowerCase()] || 'pending'
}

/**
 * Obtenir le label français pour une méthode de paiement
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  const labels: Record<PaymentMethod, string> = {
    orange_money: 'Orange Money',
    wave: 'Wave',
    card: 'Carte bancaire',
    cash_on_delivery: 'Paiement à la livraison'
  }

  return labels[method] || method
}

/**
 * Obtenir l'icône pour une méthode de paiement
 */
export function getPaymentMethodIcon(method: PaymentMethod): string {
  const icons: Record<PaymentMethod, string> = {
    orange_money: '/icons/orange-money.png',
    wave: '/icons/wave.png',
    card: '/icons/card.png',
    cash_on_delivery: '/icons/cash.png'
  }

  return icons[method] || '/icons/payment.png'
}

// ============================================================================
// HOOK POUR LE CHECKOUT
// ============================================================================

/**
 * Créer un paiement pour une commande MATIX
 */
export async function initiateOrderPayment(
  orderId: string,
  amount: number,
  customer: BictorysCustomer,
  paymentMethod: PaymentMethod,
  callbackUrl: string,
  redirectUrl: string
): Promise<BictorysChargeResponse> {
  // Ne pas utiliser Bictorys pour le paiement à la livraison
  if (paymentMethod === 'cash_on_delivery') {
    return {
      success: true,
      data: {
        type: 'CashOnDelivery',
        chargeId: `COD-${orderId}`,
        transactionId: `COD-${Date.now()}`
      }
    }
  }

  return bictorysService.createCharge({
    amount,
    customer,
    paymentType: paymentMethod,
    orderId,
    description: `Commande MATIX #${orderId}`,
    callbackUrl,
    redirectUrl,
    metadata: {
      orderId,
      platform: 'MATIX',
      environment: BICTORYS_TEST_MODE ? 'test' : 'production'
    }
  })
}

export default bictorysService
