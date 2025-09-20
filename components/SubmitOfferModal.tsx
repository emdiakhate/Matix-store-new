"use client";

import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Demand {
  id: number;
  title: string;
  description: string;
  distributor: {
    name: string;
    city: string;
    avatar?: string;
    rating: number;
  };
  product: string;
  quantity: number;
  unit: string;
  category: string;
  budgetMax: number;
  deadline: string;
  daysLeft: number;
  applicantsCount: number;
  isUrgent: boolean;
  requirements?: string[];
  location: string;
  publishedDate: string;
}

interface SubmitOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: Demand | null;
}

export default function SubmitOfferModal({ isOpen, onClose, demand }: SubmitOfferModalProps) {
  const [formData, setFormData] = useState({
    prix: 0,
    quantite: 0,
    unite: '',
    message: '',
    delaiLivraison: '',
    conditions: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialiser les données du formulaire quand la demande change
  useEffect(() => {
    if (demand) {
      setFormData({
        prix: 0,
        quantite: demand.quantity,
        unite: demand.unit,
        message: '',
        delaiLivraison: '',
        conditions: ''
      });
      setErrors({});
      setIsSubmitted(false);
    }
  }, [demand]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.prix <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    }

    if (formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }

    if (!formData.unite.trim()) {
      newErrors.unite = 'L\'unité est requise';
    }

    if (!formData.delaiLivraison.trim()) {
      newErrors.delaiLivraison = 'Le délai de livraison est requis';
    }

    if (demand && formData.prix > demand.budgetMax) {
      newErrors.prix = `Le prix dépasse le budget maximum de ${demand.budgetMax.toLocaleString()} XOF`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !demand) return;

    setIsLoading(true);
    
    try {
      // Simuler une soumission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsSubmitted(true);
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen || !demand) return null;

  const isOverBudget = formData.prix > demand.budgetMax;
  const budgetDifference = formData.prix - demand.budgetMax;

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl my-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offre soumise !</h2>
          <p className="text-gray-600 mb-4">
            Votre offre a été envoyée avec succès au distributeur <strong>{demand.distributor.name}</strong>.
          </p>
          <p className="text-sm text-gray-500">
            Vous recevrez une notification dès qu'il y aura une réponse.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Soumettre une offre
              </h2>
              <p className="text-gray-500">{demand.title}</p>
              <p className="text-sm text-gray-400">Distributeur: {demand.distributor.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Informations de la demande */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Détails de la demande</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div><span className="text-gray-500">Produit:</span> {demand.product}</div>
                <div><span className="text-gray-500">Quantité demandée:</span> {demand.quantity} {demand.unit}</div>
                <div><span className="text-gray-500">Budget max:</span> {demand.budgetMax.toLocaleString()} XOF</div>
              </div>
              <div>
                <div><span className="text-gray-500">Échéance:</span> {demand.deadline}</div>
                <div><span className="text-gray-500">Localisation:</span> {demand.location}</div>
                <div><span className="text-gray-500">Candidats:</span> {demand.applicantsCount}</div>
              </div>
            </div>
          </div>

          {/* Formulaire de soumission */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix proposé (XOF) *
                </label>
                <input
                  type="number"
                  value={formData.prix}
                  onChange={(e) => handleInputChange('prix', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.prix ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez votre prix"
                />
                {errors.prix && (
                  <p className="text-red-500 text-xs mt-1">{errors.prix}</p>
                )}
                {isOverBudget && (
                  <div className="flex items-center gap-2 mt-2 text-orange-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Dépassement de {budgetDifference.toLocaleString()} XOF</span>
                  </div>
                )}
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité proposée *
                </label>
                <input
                  type="number"
                  value={formData.quantite}
                  onChange={(e) => handleInputChange('quantite', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantite ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez la quantité"
                />
                {errors.quantite && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantite}</p>
                )}
              </div>
            </div>

            {/* Unité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unité *
              </label>
              <select
                value={formData.unite}
                onChange={(e) => handleInputChange('unite', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.unite ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner une unité</option>
                <option value="pièces">Pièces</option>
                <option value="kg">Kilogrammes</option>
                <option value="tonnes">Tonnes</option>
                <option value="litres">Litres</option>
                <option value="mètres">Mètres</option>
                <option value="m²">Mètres carrés</option>
                <option value="m³">Mètres cubes</option>
                <option value="douzaines">Douzaines</option>
                <option value="centaines">Centaines</option>
              </select>
              {errors.unite && (
                <p className="text-red-500 text-xs mt-1">{errors.unite}</p>
              )}
            </div>

            {/* Délai de livraison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Délai de livraison *
              </label>
              <input
                type="text"
                value={formData.delaiLivraison}
                onChange={(e) => handleInputChange('delaiLivraison', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.delaiLivraison ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 3-5 jours, 1 semaine, etc."
              />
              {errors.delaiLivraison && (
                <p className="text-red-500 text-xs mt-1">{errors.delaiLivraison}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optionnel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ajoutez des détails sur votre offre, vos conditions, etc."
              />
            </div>

            {/* Conditions spéciales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conditions spéciales (optionnel)
              </label>
              <textarea
                value={formData.conditions}
                onChange={(e) => handleInputChange('conditions', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Paiement à la livraison, garantie, etc."
              />
            </div>

            {/* Résumé de l'offre */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre offre</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formData.prix.toLocaleString()} XOF
                  </div>
                  <div className="text-gray-500">Prix total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formData.quantite} {formData.unite}
                  </div>
                  <div className="text-gray-500">Quantité</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formData.quantite > 0 ? Math.round(formData.prix / formData.quantite) : 0} XOF
                  </div>
                  <div className="text-gray-500">Prix unitaire</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isLoading ? 'Envoi en cours...' : 'Soumettre l\'offre'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
