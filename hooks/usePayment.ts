import { useState } from 'react';
import { useAuth } from './useSupabase';

export interface PaymentData {
  amount: number;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  orderId?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  success: boolean;
  transaction_id?: string;
  payment_url?: string;
  reference?: string;
  error?: string;
}

/**
 * Hook pour gérer les paiements avec Bictorys
 */
export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Initier un paiement
   */
  const initiatePayment = async (data: PaymentData): Promise<PaymentResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Créer la commande d'abord si orderId n'est pas fourni
      let orderId = data.orderId;

      if (!orderId) {
        const orderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            customer_name: data.customerName,
            total_amount: data.amount,
            user_id: user?.id,
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || 'Erreur lors de la création de la commande');
        }

        const orderData = await orderResponse.json();
        orderId = orderData.order_id;
      }

      // Initier le paiement via Bictorys
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount: data.amount,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          customerName: data.customerName,
          metadata: data.metadata,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Erreur lors de l'initiation du paiement");
      }

      setLoading(false);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  /**
   * Vérifier le statut d'un paiement
   */
  const verifyPayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/payments/verify?transaction_id=${transactionId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors de la vérification du paiement');
      }

      return result.transaction;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      return null;
    }
  };

  /**
   * Rediriger vers la page de paiement Bictorys
   */
  const redirectToPayment = (paymentUrl: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = paymentUrl;
    }
  };

  return {
    initiatePayment,
    verifyPayment,
    redirectToPayment,
    loading,
    error,
  };
}
