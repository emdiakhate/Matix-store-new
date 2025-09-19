"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (alertData: NewAlertData) => void;
}

export interface NewAlertData {
  name: string;
  criteria: string;
  category: string;
  priceRange?: number;
  stockMinimum?: number;
  distance: number;
  frequency: 'immediate' | 'daily' | 'weekly';
}

const categories = [
  { value: 'Volailles & Viandes', label: '🐓 Volailles & Viandes' },
  { value: 'Œufs & Reproduction', label: '🥚 Œufs & Reproduction' },
  { value: 'Aliments Avicoles', label: '🌾 Aliments Avicoles' },
  { value: 'Équipements', label: '🏥 Équipements' }
];

const frequencyOptions = [
  { value: 'immediate', label: 'Immédiate', description: 'Dès qu\'un match est trouvé' },
  { value: 'daily', label: 'Quotidienne', description: 'Résumé quotidien' },
  { value: 'weekly', label: 'Hebdomadaire', description: 'Résumé hebdomadaire' }
];

export default function CreateAlertModal({ isOpen, onClose, onSubmit }: CreateAlertModalProps) {
  const [formData, setFormData] = useState<NewAlertData>({
    name: '',
    criteria: '',
    category: '',
    priceRange: undefined,
    stockMinimum: undefined,
    distance: 25,
    frequency: 'immediate'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFrequency, setSelectedFrequency] = useState('immediate');

  const handleInputChange = (field: keyof NewAlertData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'alerte est requis';
    }

    if (!formData.criteria.trim()) {
      newErrors.criteria = 'Les critères de recherche sont requis';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (formData.priceRange && formData.priceRange <= 0) {
      newErrors.priceRange = 'Le prix doit être supérieur à 0';
    }

    if (formData.stockMinimum && formData.stockMinimum <= 0) {
      newErrors.stockMinimum = 'Le stock minimum doit être supérieur à 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        ...formData,
        frequency: selectedFrequency as 'immediate' | 'daily' | 'weekly'
      });
      
      // Reset form
      setFormData({
        name: '',
        criteria: '',
        category: '',
        priceRange: undefined,
        stockMinimum: undefined,
        distance: 25,
        frequency: 'immediate'
      });
      setSelectedFrequency('immediate');
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      criteria: '',
      category: '',
      priceRange: undefined,
      stockMinimum: undefined,
      distance: 25,
      frequency: 'immediate'
    });
    setSelectedFrequency('immediate');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Créer une Nouvelle Alerte</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom de l'alerte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'alerte *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Poulets pas chers"
              className={`px-4 py-3 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Critères de recherche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Critères de recherche *
            </label>
            <Input
              type="text"
              value={formData.criteria}
              onChange={(e) => handleInputChange('criteria', e.target.value)}
              placeholder="Ex: Poulets fermiers, qualité bio"
              className={`px-4 py-3 ${errors.criteria ? 'border-red-500' : ''}`}
            />
            {errors.criteria && (
              <p className="text-red-500 text-sm mt-1">{errors.criteria}</p>
            )}
          </div>

          {/* Catégorie avec icônes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie produit *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category}</p>
            )}
          </div>

          {/* Prix avec design moderne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prix maximum (FCFA)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={formData.priceRange || ''}
                onChange={(e) => handleInputChange('priceRange', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="4000"
                className={`pl-12 pr-4 py-3 ${errors.priceRange ? 'border-red-500' : ''}`}
              />
              <div className="absolute left-4 top-3 text-gray-500 font-medium">FCFA</div>
            </div>
            {errors.priceRange && (
              <p className="text-red-500 text-sm mt-1">{errors.priceRange}</p>
            )}
          </div>

          {/* Stock minimum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock minimum requis
            </label>
            <Input
              type="number"
              value={formData.stockMinimum || ''}
              onChange={(e) => handleInputChange('stockMinimum', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="50"
              className={`px-4 py-3 ${errors.stockMinimum ? 'border-red-500' : ''}`}
            />
            {errors.stockMinimum && (
              <p className="text-red-500 text-sm mt-1">{errors.stockMinimum}</p>
            )}
          </div>

          {/* Distance avec slider moderne */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Distance maximum: <span className="text-green-600 font-semibold">{formData.distance} km</span>
            </label>
            <input
              type="range"
              min="5"
              max="100"
              value={formData.distance}
              onChange={(e) => handleInputChange('distance', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5 km</span>
              <span>100 km</span>
            </div>
          </div>

          {/* Fréquence avec options visuelles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence notifications
            </label>
            <div className="grid grid-cols-1 gap-2">
              {frequencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedFrequency(option.value)}
                  className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors text-left ${
                    selectedFrequency === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 py-3"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white"
            >
              Créer Alerte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
