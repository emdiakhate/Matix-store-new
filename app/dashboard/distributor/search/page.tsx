"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import { 
  MapPin, 
  Phone, 
  Filter, 
  RotateCcw,
  Plus,
  Minus,
  Eye,
  UserPlus,
  AlertTriangle
} from 'lucide-react';

export default function SearchProducersPage() {
  const [activePage, setActivePage] = useState('search');
  const [filters, setFilters] = useState({
    keyword: '',
    category: '',
    product: '',
    maxDistance: 50,
    maxPrice: '',
    minStock: ''
  });

  // Le layout utilisera les données par défaut du distributeur

  const producers = [
    {
      id: 1,
      name: "Ferme Diallo",
      product: "Poulets fermiers", 
      price: "4,500 FCFA/unité",
      distance: "12 km",
      stock: "45 dis.",
      location: "Thiès",
      category: "volailles"
    },
    {
      id: 2,
      name: "Élevage Thiès",
      product: "Poussins pondeuses",
      price: "2,800 FCFA/unité", 
      distance: "25 km",
      stock: "12 dis.",
      location: "Thiès",
      category: "poussins"
    },
    {
      id: 3,
      name: "Bio Sénégal",
      product: "Œufs bio",
      price: "200 FCFA/unité",
      distance: "8 km", 
      stock: "50 dis.",
      location: "Rufisque",
      category: "oeufs"
    },
    {
      id: 4,
      name: "Nutrition Plus",
      product: "Aliment ponte premium",
      price: "18,500 FCFA/sac",
      distance: "15 km",
      stock: "30 sa.",
      location: "Pikine",
      category: "aliments"
    },
    {
      id: 5,
      name: "Équip Avicole",
      product: "Mangeoires automatiques",
      price: "15,500 FCFA/unité",
      distance: "18 km",
      stock: "15 un.",
      location: "Guédiawaye",
      category: "equipements"
    }
  ];

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      product: '',
      maxDistance: 50,
      maxPrice: '',
      minStock: ''
    });
  };

  return (
    <DistributorLayout activePage="search">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Rechercher Producteurs</h1>
        <p className="text-gray-600">Trouvez des producteurs près de chez vous et gérez vos relations commerciales</p>
      </div>

      {/* Filtres de Recherche */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtres de Recherche</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mot-clé</label>
            <Input
              placeholder="ex: poulets, œufs"
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">Toutes catégories</option>
              <option value="volailles">Volailles</option>
              <option value="oeufs">Œufs</option>
              <option value="aliments">Aliments</option>
              <option value="equipements">Équipements</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Distance max: {filters.maxDistance} km</label>
            <input
              type="range"
              min="5"
              max="100"
              value={filters.maxDistance}
              onChange={(e) => setFilters({...filters, maxDistance: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prix max (FCFA)</label>
            <Input
              placeholder="Ex: 5000"
              value={filters.maxPrice}
              onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stock min</label>
            <Input
              placeholder="Ex: 10"
              value={filters.minStock}
              onChange={(e) => setFilters({...filters, minStock: e.target.value})}
            />
          </div>

          <div className="flex items-end gap-2">
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Carte des Producteurs */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Carte des Producteurs</h2>
        <div className="relative bg-gray-100 rounded-lg h-96 overflow-hidden">
          {/* Contrôles de zoom */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
              <Plus className="h-4 w-4" />
            </button>
            <button className="bg-white p-2 rounded shadow-md hover:bg-gray-50">
              <Minus className="h-4 w-4" />
            </button>
          </div>

          {/* Légende */}
          <div className="absolute bottom-4 left-4 z-10 bg-white p-3 rounded shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm">Volailles</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm">Poussins</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm">Œufs</span>
            </div>
          </div>

          {/* Pins de localisation simulés */}
          <div className="absolute top-1/4 left-1/4">
            <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Ferme D. - Poulets
            </div>
          </div>
          <div className="absolute top-1/3 right-1/3">
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
              Élevage T. - Poussins
            </div>
          </div>
          <div className="absolute bottom-1/3 left-1/2">
            <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
              Bio S. - Œufs
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des Producteurs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Producteurs Trouvés ({producers.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Producteur</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Produit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Prix</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Distance</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">St</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {producers.map((producer) => (
                <tr key={producer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{producer.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {producer.location}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{producer.product}</td>
                  <td className="py-3 px-4 text-gray-700">{producer.price}</td>
                  <td className="py-3 px-4 text-gray-700">{producer.distance}</td>
                  <td className="py-3 px-4 text-gray-700">{producer.stock}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Voir
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                      >
                        <UserPlus className="h-3 w-3" />
                        Contacter
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DistributorLayout>
  );
}
