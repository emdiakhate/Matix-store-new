'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';

export default function PopularProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/popular');
        const data = await response.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produits Populaires pour l'Élevage Quotidien
            </h2>
            <p className="text-xl text-gray-600">
              Découvrez nos produits les plus demandés par les éleveurs sénégalais
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(15)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Produits Populaires pour l'Élevage Quotidien
            </h2>
            <p className="text-xl text-gray-600 mb-8">Aucun produit disponible pour le moment</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Produits Populaires pour l'Élevage Quotidien
          </h2>
          <p className="text-xl text-gray-600">
            Découvrez nos produits les plus demandés par les éleveurs sénégalais
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {products.map((product, index) => (
            <Link key={index} href={`/product/${product.id}`}>
              <Card className="relative overflow-hidden hover:shadow-matix-lg transition-all hover:scale-105 cursor-pointer bg-white border-matix-green-pale">
                {product.discount && (
                  <div className="absolute top-2 left-2 bg-matix-yellow text-black px-2 py-1 text-xs rounded-md z-10 font-bold">
                    {product.discount}
                  </div>
                )}

                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{product.producer}</p>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">({product.rating})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-matix-green-dark">{product.price} FCFA</span>
                    <Button
                      size="sm"
                      className="bg-matix-button hover:bg-matix-yellow text-black p-2 transition-all"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
