"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Package, Send } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
}

interface Producer {
  id: string;
  name: string;
  products: Product[];
}

interface PropositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  producer: Producer;
  selectedProduct: Product;
  onSubmit: (propositionData: PropositionFormData) => Promise<void>;
}

interface PropositionFormData {
  productId: string;
  proposedPrice: number;
  quantity: number;
  message?: string;
}

export default function PropositionModal({
  isOpen,
  onClose,
  producer,
  selectedProduct,
  onSubmit
}: PropositionModalProps) {
  const [proposedPrice, setProposedPrice] = useState(selectedProduct.price);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedPrice <= 0 || quantity <= 0) {
      alert('Veuillez saisir un prix et une quantité valides');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        productId: selectedProduct.id,
        proposedPrice,
        quantity,
        message: message.trim() || undefined
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la proposition:', error);
      alert('Erreur lors de l\'envoi de la proposition');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            Faire une proposition à {producer.name}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="h-6 w-6 text-gray-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{selectedProduct.name}</h4>
              <p className="text-sm text-gray-600">
                {new Intl.NumberFormat('fr-SN', { 
                  style: 'currency', 
                  currency: 'XOF' 
                }).format(selectedProduct.price)} / {selectedProduct.unit}
              </p>
              <p className="text-xs text-gray-500">
                {selectedProduct.stock} disponibles
              </p>
            </div>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <Package className="h-4 w-4 inline mr-1" />
              Produit *
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={selectedProduct.id}
              disabled
            >
              <option value={selectedProduct.id}>{selectedProduct.name}</option>
            </select>
          </div>

          {/* Proposed Price */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Prix proposé * $
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quantité souhaitée *
            </label>
            <input
              type="number"
              min="1"
              max={selectedProduct.stock}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="1"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Message (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ajoutez des détails sur votre proposition, conditions de livraison, etc..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {message.length}/500 caractères
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white flex items-center gap-2"
              disabled={isSubmitting || proposedPrice <= 0 || quantity <= 0}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Envoi...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer la proposition
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
