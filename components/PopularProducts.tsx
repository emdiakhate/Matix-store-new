"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { useSupabase, useCart } from '@/hooks/useSupabase';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  producer_id: string;
  producer_name?: string;
  category_name?: string;
}

export default function PopularProducts() {
  const supabase = useSupabase();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Charger les produits avec les informations du producteur
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image_url,
          producer_id,
          producer:user_profiles!products_producer_id_fkey(
            first_name,
            last_name,
            business_name
          ),
          category:categories(name_fr)
        `)
        .eq('is_available', true)
        .order('view_count', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Erreur chargement produits:', error);
        return;
      }

      if (data) {
        const formattedProducts = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          producer_id: p.producer_id,
          producer_name: p.producer?.business_name ||
            `${p.producer?.first_name || ''} ${p.producer?.last_name || ''}`.trim() ||
            'Producteur',
          category_name: p.category?.name_fr || ''
        }));
        setProducts(formattedProducts);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      productId: product.id,
      quantity: 1,
      unitPrice: product.price,
      productName: product.name,
      producerId: product.producer_id
    });

    // Feedback visuel
    const button = e.currentTarget as HTMLButtonElement;
    button.classList.add('bg-green-600');
    setTimeout(() => {
      button.classList.remove('bg-green-600');
    }, 500);
  };

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
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <span className="ml-2 text-gray-600">Chargement des produits...</span>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
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
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
            <p className="text-sm text-gray-400 mt-2">Les producteurs ajouteront bientôt leurs produits.</p>
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
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-all hover:scale-105 cursor-pointer bg-white">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingCart className="h-12 w-12" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2 h-10">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 truncate">{product.producer_name}</p>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">(4.0)</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-green-700">{product.price.toLocaleString()} FCFA</span>
                    <Button
                      size="sm"
                      className="bg-yellow-400 hover:bg-yellow-500 text-black p-2 transition-all"
                      onClick={(e) => handleAddToCart(e, product)}
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
