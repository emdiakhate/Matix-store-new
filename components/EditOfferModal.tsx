'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Opportunite } from '@/types/opportunities';

interface EditOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunite: Opportunite | null;
  onSave: (
    opportuniteId: number,
    newOffer: { prix: number; quantite: number; unite: string }
  ) => void;
}

export default function EditOfferModal({
  isOpen,
  onClose,
  opportunite,
  onSave,
}: EditOfferModalProps) {
  const [formData, setFormData] = useState({
    prix: 0,
    quantite: 0,
    unite: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Initialiser les données du formulaire quand l'opportunité change
  useEffect(() => {
    if (opportunite) {
      setFormData({
        prix: opportunite.monOffre.prix,
        quantite: opportunite.monOffre.quantite,
        unite: opportunite.monOffre.unite,
      });
      setErrors({});
    }
  }, [opportunite]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (formData.prix <= 0) {
      newErrors.prix = 'Le prix doit être supérieur à 0';
    }

    if (formData.quantite <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0';
    }

    if (!formData.unite.trim()) {
      newErrors.unite = "L'unité est requise";
    }

    if (opportunite && formData.prix > opportunite.budgetMax) {
      newErrors.prix = `Le prix dépasse le budget maximum de ${opportunite.budgetMax.toLocaleString()} XOF`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !opportunite) return;

    setIsLoading(true);

    try {
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));

      onSave(opportunite.id, {
        prix: formData.prix,
        quantite: formData.quantite,
        unite: formData.unite,
      });

      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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

  if (!isOpen || !opportunite) return null;

  const isOverBudget = formData.prix > opportunite.budgetMax;
  const budgetDifference = formData.prix - opportunite.budgetMax;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-5/6 overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifier mon offre</h2>
              <p className="text-gray-500">{opportunite.titreAnnonce}</p>
              <p className="text-sm text-gray-400">Réf: #{opportunite.referenceAnnonce}</p>
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
          {/* Informations de l'annonce */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Détails de l'annonce</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div>
                  <span className="text-gray-500">Produit:</span> {opportunite.produitDemande}
                </div>
                <div>
                  <span className="text-gray-500">Quantité demandée:</span>{' '}
                  {opportunite.quantiteDemandee} {opportunite.uniteDemandee}
                </div>
              </div>
              <div>
                <div>
                  <span className="text-gray-500">Budget maximum:</span>{' '}
                  {opportunite.budgetMax.toLocaleString()} XOF
                </div>
                <div>
                  <span className="text-gray-500">Échéance:</span> {opportunite.echeance}
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de modification */}
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
                  onChange={e => handleInputChange('prix', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.prix ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez le prix"
                />
                {errors.prix && <p className="text-red-500 text-xs mt-1">{errors.prix}</p>}
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
                  onChange={e => handleInputChange('quantite', parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantite ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Entrez la quantité"
                />
                {errors.quantite && <p className="text-red-500 text-xs mt-1">{errors.quantite}</p>}
              </div>
            </div>

            {/* Unité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unité *</label>
              <select
                value={formData.unite}
                onChange={e => handleInputChange('unite', e.target.value)}
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
              {errors.unite && <p className="text-red-500 text-xs mt-1">{errors.unite}</p>}
            </div>

            {/* Résumé de l'offre */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Résumé de votre nouvelle offre</h3>
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
                <Save className="w-4 h-4" />
                {isLoading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
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
