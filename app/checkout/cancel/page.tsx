'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const txId = searchParams.get('transaction_id');
    const ref = searchParams.get('reference');

    setTransactionId(txId);
    setReference(ref);
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
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

      {/* Cancel Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Cancel Icon */}
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-12 w-12 text-orange-500" />
            </div>

            {/* Cancel Message */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Paiement Annulé</h1>
            <p className="text-gray-600 mb-8">
              Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
            </p>

            {/* Transaction Info (if available) */}
            {(transactionId || reference) && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                <h2 className="font-semibold text-gray-900 mb-4">Informations de la Transaction</h2>
                <div className="space-y-3 text-sm">
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence :</span>
                      <span className="font-medium">{reference}</span>
                    </div>
                  )}
                  {transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID :</span>
                      <span className="font-mono text-xs">{transactionId}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Statut :</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      Annulé
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Reasons */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-blue-900 mb-2">
                Pourquoi mon paiement a été annulé ?
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vous avez cliqué sur "Annuler" sur la page de paiement</li>
                <li>• Vous avez fermé la fenêtre de paiement</li>
                <li>• Le temps de paiement a expiré</li>
                <li>• Il y a eu une erreur lors du processus de paiement</li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Que faire maintenant ?</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Vos articles sont toujours dans votre panier</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Vous pouvez réessayer le paiement à tout moment</span>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Contactez notre support si vous avez besoin d'aide</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/checkout" className="flex-1">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Réessayer le Paiement
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Besoin d'aide ? Contactez notre support au{' '}
                <a
                  href="tel:+221771234567"
                  className="text-green-600 font-semibold hover:underline"
                >
                  +221 77 123 45 67
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
