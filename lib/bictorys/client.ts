/**
 * Client Bictorys pour l'intégration des paiements
 * Documentation: https://docs.bictorys.com/reference/getting-started
 *
 * Moyens de paiement supportés au Sénégal:
 * - Orange Money
 * - Wave
 * - Free Money
 * - Cartes bancaires (Visa, Mastercard)
 */

// Types pour l'API Bictorys
export interface BictorysPaymentRequest {
  amount: number; // Montant en FCFA
  currency?: string; // XOF par défaut
  customer: {
    email: string;
    phone: string;
    name: string;
  };
  reference: string; // Référence unique de la commande
  description?: string;
  metadata?: Record<string, any>;
  return_url?: string;
  cancel_url?: string;
}

export interface BictorysPaymentResponse {
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  reference?: string;
  status?: 'pending' | 'success' | 'failed' | 'cancelled';
  amount?: number;
  error?: string;
  message?: string;
}

export interface BictorysTransactionStatus {
  transaction_id: string;
  reference: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * Client pour interagir avec l'API Bictorys
 */
class BictorysClient {
  private baseURL: string;
  private secretKey: string;

  constructor() {
    this.baseURL = process.env.BICTORYS_BASE_URL || 'https://api.bictorys.com';
    this.secretKey = process.env.BICTORYS_SECRET_KEY || '';

    if (!this.secretKey) {
      console.warn('⚠️  BICTORYS_SECRET_KEY non configurée');
    }
  }

  /**
   * Headers d'authentification pour les requêtes
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.secretKey}`,
    };
  }

  /**
   * Initier un paiement
   */
  async createPayment(data: BictorysPaymentRequest): Promise<BictorysPaymentResponse> {
    try {
      const payload = {
        amount: data.amount,
        currency: data.currency || 'XOF',
        customer: data.customer,
        reference: data.reference,
        description: data.description || `Commande ${data.reference}`,
        metadata: data.metadata || {},
        return_url: data.return_url || process.env.NEXT_PUBLIC_BICTORYS_RETURN_URL,
        cancel_url: data.cancel_url || process.env.NEXT_PUBLIC_BICTORYS_CANCEL_URL,
      };

      console.log('🔄 Initiation paiement Bictorys:', {
        reference: data.reference,
        amount: data.amount,
      });

      const response = await fetch(`${this.baseURL}/v1/payments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Erreur Bictorys:', result);
        return {
          success: false,
          error: result.error || result.message || "Erreur lors de l'initiation du paiement",
        };
      }

      console.log('✅ Paiement initié avec succès:', result.transaction_id);

      return {
        success: true,
        transaction_id: result.transaction_id || result.id,
        payment_url: result.payment_url || result.checkout_url,
        reference: result.reference,
        status: result.status || 'pending',
        amount: result.amount,
      };
    } catch (error) {
      console.error("❌ Exception lors de l'initiation du paiement:", error);
      return {
        success: false,
        error: 'Erreur de connexion à Bictorys',
      };
    }
  }

  /**
   * Vérifier le statut d'une transaction
   */
  async getTransactionStatus(transactionId: string): Promise<BictorysTransactionStatus | null> {
    try {
      console.log('🔍 Vérification statut transaction:', transactionId);

      const response = await fetch(`${this.baseURL}/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erreur récupération statut:', error);
        return null;
      }

      const result = await response.json();
      console.log('✅ Statut transaction récupéré:', result.status);

      return {
        transaction_id: result.transaction_id || result.id,
        reference: result.reference,
        status: result.status,
        amount: result.amount,
        currency: result.currency,
        payment_method: result.payment_method,
        created_at: result.created_at,
        updated_at: result.updated_at,
        metadata: result.metadata,
      };
    } catch (error) {
      console.error('❌ Exception lors de la vérification du statut:', error);
      return null;
    }
  }

  /**
   * Vérifier une transaction par référence
   */
  async getTransactionByReference(reference: string): Promise<BictorysTransactionStatus | null> {
    try {
      console.log('🔍 Recherche transaction par référence:', reference);

      const response = await fetch(`${this.baseURL}/v1/transactions?reference=${reference}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ Erreur recherche par référence:', error);
        return null;
      }

      const result = await response.json();

      // L'API peut retourner un tableau ou un objet unique
      const transaction = Array.isArray(result) ? result[0] : result;

      if (!transaction) {
        console.warn('⚠️  Aucune transaction trouvée pour la référence:', reference);
        return null;
      }

      console.log('✅ Transaction trouvée:', transaction.status);

      return {
        transaction_id: transaction.transaction_id || transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        payment_method: transaction.payment_method,
        created_at: transaction.created_at,
        updated_at: transaction.updated_at,
        metadata: transaction.metadata,
      };
    } catch (error) {
      console.error('❌ Exception lors de la recherche par référence:', error);
      return null;
    }
  }

  /**
   * Valider un webhook de Bictorys
   */
  validateWebhook(signature: string, payload: string): boolean {
    // TODO: Implémenter la validation de signature selon la doc Bictorys
    // Pour l'instant, on accepte tous les webhooks en sandbox
    if (this.secretKey.startsWith('test_')) {
      return true;
    }

    // En production, vérifier la signature HMAC
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.secretKey)
    //   .update(payload)
    //   .digest('hex');
    // return signature === expectedSignature;

    return false;
  }

  /**
   * Vérifier si on est en mode sandbox
   */
  isSandbox(): boolean {
    return this.secretKey.startsWith('test_');
  }
}

// Export de l'instance singleton
export const bictorysClient = new BictorysClient();
export default bictorysClient;
