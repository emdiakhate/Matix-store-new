'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Upload, Plus, Minus } from 'lucide-react';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductData) => void;
}

interface ProductData {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  unitType: string;
  ageWeeks?: string;
  vaccinationStatus: string;
  isVaccinated: boolean;
  vaccinationDetails: string;
  averageWeight: string;
  breedRace: string;
  availabilityDate: string;
  saleEndDate: string;
  minimumOrder: string;
  images: string[];
}

const categories = [
  'Poulets de Chair',
  'Poussins',
  'Œufs',
  'Aliments',
  'Équipements',
  'Médicaments',
  'Autres'
];

const unitTypes = [
  'pièces',
  'kg',
  'litres',
  'sacs',
  'boîtes'
];

export default function AddProductModal({ isOpen, onClose, onSave }: AddProductModalProps) {
  const [formData, setFormData] = useState<ProductData>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    unitType: 'pièces',
    ageWeeks: '',
    vaccinationStatus: 'Non vacciné',
    isVaccinated: false,
    vaccinationDetails: '',
    averageWeight: '',
    breedRace: '',
    availabilityDate: '',
    saleEndDate: '',
    minimumOrder: '1',
    images: []
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof ProductData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulation d'une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(formData);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        unitType: 'pièces',
        ageWeeks: '',
        vaccinationStatus: 'Non vacciné',
        isVaccinated: false,
        vaccinationDetails: '',
        averageWeight: '',
        breedRace: '',
        availabilityDate: '',
        saleEndDate: '',
        minimumOrder: '1',
        images: []
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Ajouter un Nouveau Produit</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informations de base */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du produit *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Ex: Poulet Fermier Bio Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (FCFA) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="4500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock disponible *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="25"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité de mesure
                </label>
                <select
                  value={formData.unitType}
                  onChange={(e) => handleInputChange('unitType', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  {unitTypes.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commande minimum
                </label>
                <input
                  type="number"
                  value={formData.minimumOrder}
                  onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                rows={3}
                placeholder="Décrivez votre produit en détail..."
                required
              />
            </div>
          </Card>

          {/* Informations spécifiques pour animaux */}
          {(formData.category === 'Poulets de Chair' || formData.category === 'Poussins') && (
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Informations spécifiques</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge (semaines)
                  </label>
                  <input
                    type="number"
                    value={formData.ageWeeks}
                    onChange={(e) => handleInputChange('ageWeeks', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="6"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Race/Souche
                  </label>
                  <input
                    type="text"
                    value={formData.breedRace}
                    onChange={(e) => handleInputChange('breedRace', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="Ex: ISA Brown, Cobb 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids moyen (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.averageWeight}
                    onChange={(e) => handleInputChange('averageWeight', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    placeholder="2.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut de vaccination
                  </label>
                  <select
                    value={formData.vaccinationStatus}
                    onChange={(e) => handleInputChange('vaccinationStatus', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="Non vacciné">Non vacciné</option>
                    <option value="Partiellement vacciné">Partiellement vacciné</option>
                    <option value="Complètement vacciné">Complètement vacciné</option>
                  </select>
                </div>
              </div>

              {formData.vaccinationStatus !== 'Non vacciné' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Détails de vaccination
                  </label>
                  <textarea
                    value={formData.vaccinationDetails}
                    onChange={(e) => handleInputChange('vaccinationDetails', e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    rows={2}
                    placeholder="Listez les vaccins administrés et les dates..."
                  />
                </div>
              )}
            </Card>
          )}

          {/* Dates de disponibilité */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Disponibilité</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de disponibilité
                </label>
                <input
                  type="date"
                  value={formData.availabilityDate}
                  onChange={(e) => handleInputChange('availabilityDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin de vente
                </label>
                <input
                  type="date"
                  value={formData.saleEndDate}
                  onChange={(e) => handleInputChange('saleEndDate', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Images du produit</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ajouter des images
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Vous pouvez sélectionner plusieurs images (max 5)
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Produit ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer le produit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

