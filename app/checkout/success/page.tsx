'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, Package, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface PaymentDetails {
  transaction_id: string;
  reference: string;
  amount: number;
  status: string;
  order_id?: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get('transaction_id');
      const reference = searchParams.get('reference');

      if (!transactionId && !reference) {
        setError('Aucune référence de transaction fournie');
        setLoading(false);
        return;
      }

      try {
        const queryParam = transactionId
          ? `transaction_id=${transactionId}`
          : `reference=${reference}`;

        const response = await fetch(`/api/payments/verify?${queryParam}`);
        const data = await response.json();

        if (data.success) {
          setPaymentDetails(data.payment);
        } else {
          setError(data.message || 'Erreur lors de la vérification du paiement');
        }
      } catch (err) {
        console.error('Erreur de vérification:', err);
        setError('Une erreur est survenue lors de la vérification du paiement');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">Vérification du paiement en cours...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur de Vérification</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-500 text-white py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center">
            <div className="bg-white text-green-500 p-2 rounded-lg mr-3">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">MATIX</h1>
              <p className="text-xs opacity-90">M A R T</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Success Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Success Icon */}
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement Réussi !</h1>
            <p className="text-gray-600 mb-8">
              Merci pour votre commande. Votre paiement a été traité avec succès.
            </p>

            {/* Payment Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="mr-2 h-5 w-5 text-green-500" />
                Détails de la Transaction
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence :</span>
                  <span className="font-medium">{paymentDetails.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID :</span>
                  <span className="font-mono text-sm">{paymentDetails.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant :</span>
                  <span className="font-bold text-green-600">
                    {paymentDetails.amount.toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut :</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {paymentDetails.status === 'paid' || paymentDetails.status === 'success'
                      ? 'Payé'
                      : paymentDetails.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Prochaines Étapes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Votre commande est confirmée</li>
                <li>✓ Un email de confirmation vous a été envoyé</li>
                <li>✓ Votre commande sera préparée sous peu</li>
                <li>✓ Vous serez notifié lors de l'expédition</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
              <Link href="/orders" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-500 hover:bg-green-50"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Mes Commandes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
