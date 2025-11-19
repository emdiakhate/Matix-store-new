"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCart, useMatixUser, useSupabase } from '@/hooks/useSupabase';
import { initiateOrderPayment } from '@/lib/bictorys';
import { PaymentMethod } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { user, profile, loading: userLoading } = useMatixUser();
  const { items, total, itemCount, isEmpty, updateQuantity, removeItem, clearCart } = useCart();

  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('orange_money');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Dakar',
    region: 'Dakar'
  });

  // Charger les données du profil
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || 'Dakar',
        region: profile.region || 'Dakar'
      });
    }
  }, [profile]);

  const deliveryFee = deliveryMode === 'delivery' ? 2500 : 0;
  const platformFee = Math.round(total * 0.02);
  const totalAmount = total + deliveryFee + platformFee;

  const paymentMethods = [
    { id: 'orange_money' as PaymentMethod, name: 'Orange Money', icon: '📱', color: '#FF6600' },
    { id: 'wave' as PaymentMethod, name: 'Wave', icon: '📱', color: '#1E40AF' },
    { id: 'card' as PaymentMethod, name: 'Carte bancaire', icon: '💳', color: '#6B7280' },
    { id: 'cash_on_delivery' as PaymentMethod, name: 'Paiement à la livraison', icon: '💰', color: '#10B981' }
  ];

  const handleSubmit = async () => {
    if (!user) {
      setError('Veuillez vous connecter pour continuer');
      return;
    }

    if (isEmpty) {
      setError('Votre panier est vide');
      return;
    }

    if (!formData.phone) {
      setError('Le numéro de téléphone est requis');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // Grouper les articles par producteur
      const itemsByProducer: Record<string, typeof items> = {};
      items.forEach(item => {
        if (!itemsByProducer[item.producerId]) {
          itemsByProducer[item.producerId] = [];
        }
        itemsByProducer[item.producerId].push(item);
      });

      // Créer une commande pour chaque producteur
      for (const [producerId, producerItems] of Object.entries(itemsByProducer)) {
        const orderSubtotal = producerItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
        const orderPlatformFee = Math.round(orderSubtotal * 0.02);
        const orderDeliveryFee = deliveryMode === 'delivery' ? Math.round(deliveryFee / Object.keys(itemsByProducer).length) : 0;
        const orderTotal = orderSubtotal + orderPlatformFee + orderDeliveryFee;

        // Créer la commande
        const { data: order, error: orderError } = await (supabase as any)
          .from('orders')
          .insert({
            producer_id: producerId,
            distributor_id: user.id,
            status: paymentMethod === 'cash_on_delivery' ? 'confirmed' : 'pending_payment',
            subtotal: orderSubtotal,
            delivery_fee: orderDeliveryFee,
            platform_fee: orderPlatformFee,
            total_amount: orderTotal,
            delivery_mode: deliveryMode === 'delivery' ? 'producer_delivery' : 'pickup',
            delivery_address: formData.address,
            delivery_region: formData.region
          })
          .select()
          .single();

        if (orderError) {
          throw new Error(`Erreur création commande: ${orderError.message}`);
        }

        // Créer les lignes de commande
        const orderItems = producerItems.map(item => ({
          order_id: order.id,
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_type: 'piece',
          unit_price: item.unitPrice,
          total_price: item.quantity * item.unitPrice
        }));

        await (supabase as any).from('order_items').insert(orderItems);

        // Initier le paiement si ce n'est pas cash on delivery
        if (paymentMethod !== 'cash_on_delivery') {
          const paymentResult = await initiateOrderPayment(
            order.id,
            orderTotal,
            {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone
            },
            paymentMethod,
            `${window.location.origin}/api/webhooks/bictorys`,
            `${window.location.origin}/orders/${order.id}/success`
          );

          if (!paymentResult.success) {
            throw new Error(paymentResult.error?.message || 'Erreur de paiement');
          }

          // Créer l'entrée payment
          await (supabase as any).from('payments').insert({
            order_id: order.id,
            amount: orderTotal,
            payment_method: paymentMethod,
            status: 'pending',
            bictorys_charge_id: paymentResult.data?.chargeId
          });

          // Si un lien de paiement est retourné, rediriger
          if (paymentResult.data?.link) {
            window.location.href = paymentResult.data.link;
            return;
          }
        }
      }

      // Vider le panier
      clearCart();

      // Rediriger vers la page de succès
      router.push('/dashboard/distributor?order=success');

    } catch (err: any) {
      console.error('Erreur checkout:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setProcessing(false);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8">Ajoutez des produits pour passer commande</p>
          <Link href="/">
            <Button className="bg-green-600 hover:bg-green-700">
              Voir les produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié */}
      <div className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white text-green-600 p-2 rounded-lg">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">MATIX</h1>
              <p className="text-xs opacity-90">Checkout</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-green-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux achats
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">1. Informations personnelles</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Mode de livraison */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">2. Mode de livraison</h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMode === 'pickup'}
                    onChange={() => setDeliveryMode('pickup')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Retrait sur place</div>
                    <div className="text-sm text-gray-500">Gratuit - Récupérez chez le producteur</div>
                  </div>
                  <span className="font-semibold text-green-600">Gratuit</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMode === 'delivery'}
                    onChange={() => setDeliveryMode('delivery')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Livraison à domicile</div>
                    <div className="text-sm text-gray-500">Livraison sous 24-48h</div>
                  </div>
                  <span className="font-semibold">2,500 FCFA</span>
                </label>
              </div>

              {deliveryMode === 'delivery' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Rue, quartier..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                      <Input
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Région</label>
                      <Input
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Méthode de paiement */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">3. Méthode de paiement</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="mr-3"
                    />
                    <span className="text-xl mr-3">{method.icon}</span>
                    <span className="font-medium" style={{ color: method.color }}>{method.name}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>

          {/* Résumé de commande */}
          <div>
            <Card className="p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Résumé ({itemCount} articles)</h3>

              {/* Liste des produits */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">{item.unitPrice.toLocaleString()} FCFA</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded ml-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Calculs */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span>{deliveryFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Frais plateforme (2%)</span>
                  <span>{platformFee.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{totalAmount.toLocaleString()} FCFA</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={processing || isEmpty}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  `Confirmer la commande`
                )}
              </Button>

              {!user && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Vous devez être connecté pour commander
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
