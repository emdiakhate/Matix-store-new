"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, XCircle, Clock, User, Package, DollarSign, Hash } from 'lucide-react';

interface Offer {
  id: string;
  producer_id: string;
  producer_name: string;
  product_name: string;
  proposed_price: number;
  quantity: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  is_read: boolean;
}

interface Demand {
  id: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  budget?: number;
  location: string;
  due_date: string;
}

interface OffersModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: Demand;
  offers: Offer[];
  onAcceptOffer: (offerId: string) => Promise<void>;
  onRejectOffer: (offerId: string) => Promise<void>;
}

export default function OffersModal({
  isOpen,
  onClose,
  demand,
  offers,
  onAcceptOffer,
  onRejectOffer
}: OffersModalProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a déjà une offre acceptée
    const acceptedOffer = offers.find(offer => offer.status === 'accepted');
    setHasAcceptedOffer(!!acceptedOffer);
  }, [offers]);

  const handleAcceptOffer = async (offerId: string) => {
    setLoading(offerId);
    try {
      await onAcceptOffer(offerId);
      setHasAcceptedOffer(true);
    } catch (error) {
      console.error('Erreur lors de l\'acceptation:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    setLoading(offerId);
    try {
      await onRejectOffer(offerId);
    } catch (error) {
      console.error('Erreur lors du refus:', error);
    } finally {
      setLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-SN', { 
      style: 'currency', 
      currency: 'XOF' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Il y a 1 jour';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'accepted': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pending': 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
      'accepted': 'Acceptée',
      'rejected': 'Refusée',
      'pending': 'En attente'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </span>
    );
  };

  const getBorderColor = (offer: Offer) => {
    if (offer.status === 'accepted') return 'border-l-green-500';
    if (offer.status === 'rejected') return 'border-l-red-500';
    if (hasAcceptedOffer && offer.status === 'pending') return 'border-l-gray-300';
    return 'border-l-green-500';
  };

  const isOfferDisabled = (offer: Offer) => {
    return hasAcceptedOffer && offer.status === 'pending';
  };

  if (!isOpen) return null;

  const totalOffers = offers.length;
  const unreadOffers = offers.filter(offer => !offer.is_read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold">Offres reçues pour "{demand.title}"</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span className="font-medium">{totalOffers} Total</span>
              {unreadOffers > 0 && (
                <span className="text-red-600 font-medium">{unreadOffers} Non lus</span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Demand Info */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Catégorie:</span>
              <span className="ml-2 text-gray-600">{demand.category}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Quantité demandée:</span>
              <span className="ml-2 text-gray-600">{demand.quantity} pièces</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Localisation:</span>
              <span className="ml-2 text-gray-600">{demand.location}</span>
            </div>
            {demand.budget && (
              <div>
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="ml-2 text-gray-600">{formatCurrency(demand.budget)}</span>
              </div>
            )}
            <div>
              <span className="font-medium text-gray-700">Échéance:</span>
              <span className="ml-2 text-gray-600">{demand.due_date}</span>
            </div>
          </div>
        </div>

        {/* Offers List */}
        <div className="p-6">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre reçue</h3>
              <p className="text-gray-600">Les producteurs n'ont pas encore répondu à cette demande.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`border-l-4 ${getBorderColor(offer)} bg-white border border-gray-200 rounded-lg p-6 transition-all duration-200 ${
                    isOfferDisabled(offer) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Nouvelle proposition reçue
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Proposée par:</span>
                          <span className="text-gray-600">{offer.producer_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Produit:</span>
                          <span className="text-gray-600">{offer.product_name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Prix proposé:</span>
                          <span className="text-gray-600 font-semibold">{formatCurrency(offer.proposed_price)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">Quantité souhaitée:</span>
                          <span className="text-gray-600">{offer.quantity} unités</span>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Message:</span> {offer.message}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {offer.status !== 'pending' && getStatusBadge(offer.status)}
                      <span className="text-xs text-gray-500">{formatDate(offer.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {offer.status === 'pending' && !isOfferDisabled(offer) && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAcceptOffer(offer.id)}
                        disabled={loading === offer.id}
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        {loading === offer.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Accepter
                      </Button>
                      
                      <Button
                        onClick={() => handleRejectOffer(offer.id)}
                        disabled={loading === offer.id}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        {loading === offer.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        Refuser
                      </Button>
                    </div>
                  )}

                  {isOfferDisabled(offer) && (
                    <div className="text-sm text-gray-500 italic">
                      Cette offre n'est plus disponible car une autre offre a été acceptée.
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
