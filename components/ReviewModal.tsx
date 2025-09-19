"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload, Image as ImageIcon, Star } from 'lucide-react';
import StarRatingInput from '@/components/ui/StarRatingInput';

interface Product {
  id: string;
  name: string;
  image?: string;
  price: number;
}

interface ProductReview {
  id: string;
  rating: number;
  comment?: string;
  image?: string;
  created_at: string;
}

interface ReviewFormData {
  rating: number;
  comment?: string;
  image?: File;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  existingReview?: ProductReview;
  onSubmit: (reviewData: ReviewFormData) => Promise<void>;
}

export default function ReviewModal({
  isOpen,
  onClose,
  product,
  existingReview,
  onSubmit
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(existingReview?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Veuillez sélectionner une note');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        rating,
        comment: comment.trim() || undefined,
        image: image || undefined
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'avis:', error);
      alert('Erreur lors de la soumission de l\'avis');
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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            Avis pour {product.name}
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
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h4 className="font-medium text-gray-900">{product.name}</h4>
              <p className="text-sm text-gray-600">
                {new Intl.NumberFormat('fr-SN', { 
                  style: 'currency', 
                  currency: 'XOF' 
                }).format(product.price)}
              </p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Note *
            </label>
            <div className="flex items-center gap-2">
              <StarRatingInput
                rating={rating}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-gray-600">
                {rating > 0 && `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Commentaire
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience avec ce produit..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 text-right">
              {comment.length}/500 caractères
            </p>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Photo (optionnel)
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Cliquez pour ajouter une photo
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG jusqu'à 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
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
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Publication...
                </div>
              ) : (
                existingReview ? 'Modifier l\'avis' : 'Publier l\'avis'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
