"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import AddProductModal from '@/components/AddProductModal';
import { 
  Plus,
  Eye,
  Copy,
  Power
} from 'lucide-react';
import StarRating from '@/components/ui/StarRating';

export default function MyProductsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Poulet Fermier Bio Premium",
      price: "4500",
      stock: 25,
      status: "Actif",
      image: "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Poulets de Chair",
      rating: 4.2,
      reviewCount: 12
    },
    {
      id: 2,
      name: "Poussins ISA Brown",
      price: "850",
      stock: 50,
      status: "Actif",
      image: "https://images.pexels.com/photos/1267697/pexels-photo-1267697.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Poussins",
      rating: 4.8,
      reviewCount: 8
    },
    {
      id: 3,
      name: "Œufs à Couver Fertiles",
      price: "125",
      stock: 200,
      status: "Actif",
      image: "https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Œufs",
      rating: 3.9,
      reviewCount: 15
    },
    {
      id: 4,
      name: "Aliment Ponte Premium",
      price: "18500",
      stock: 0,
      status: "Rupture",
      image: "https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Aliments",
      rating: 4.5,
      reviewCount: 6
    },
    {
      id: 5,
      name: "Mangeoire Automatique 5L",
      price: "15500",
      stock: 12,
      status: "Actif",
      image: "https://images.pexels.com/photos/1300357/pexels-photo-1300357.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: "Équipements",
      rating: 4.7,
      reviewCount: 9
    }
  ]);

  const handleAddProduct = (newProduct: any) => {
    const product = {
      id: products.length + 1,
      name: newProduct.name,
      price: newProduct.price,
      stock: parseInt(newProduct.stock),
      status: "Actif",
      image: newProduct.images[0] || "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=120",
      category: newProduct.category,
      rating: 0,
      reviewCount: 0
    };
    
    setProducts(prev => [...prev, product]);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Actif': 'bg-green-100 text-green-800',
      'Inactif': 'bg-gray-100 text-gray-800',
      'Rupture': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };


  return (
    <ProducerLayout activePage="products">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-matix-green-medium hover:bg-matix-green-dark text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter Produit
                </Button>
            </div>

            {/* Products Table */}
      <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{product.price} FCFA</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{product.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <StarRating rating={product.rating} />
                      <span className="text-sm text-gray-500">({product.reviewCount} avis)</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(product.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/dashboard/products/${product.id}`}
                        className="text-matix-green-medium hover:text-matix-green-dark"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Power className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
                </table>
              </div>
            </Card>

            {/* Modal d'ajout de produit */}
            <AddProductModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSave={handleAddProduct}
            />
    </ProducerLayout>
  );
}
