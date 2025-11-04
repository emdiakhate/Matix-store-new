'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import InvoiceModal from '@/components/InvoiceModal';
import { authService, User as UserType } from '@/lib/auth';
import {
  ShoppingCart,
  Clock,
  Settings,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
          <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder au dashboard.</p>
          <Link href="/">
            <Button className="bg-matix-green-medium hover:bg-matix-green-dark text-white">
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Produits Publiés',
      value: '45',
      icon: <ShoppingCart className="h-6 w-6 text-matix-green-medium" />,
    },
    {
      title: 'Commandes Reçues',
      value: '23',
      icon: <Clock className="h-6 w-6 text-matix-green-medium" />,
    },
    {
      title: 'Commandes en Cours',
      value: '8',
      icon: <Settings className="h-6 w-6 text-matix-green-medium" />,
    },
    {
      title: 'Revenus du Mois',
      value: '450,000 FCFA',
      icon: <CheckCircle className="h-6 w-6 text-matix-green-medium" />,
    },
  ];

  const receivedOrders = [
    {
      id: 'B9K2',
      client: 'Amadou Diallo',
      product: 'Poulet Fermier Bio',
      quantity: '2',
      status: 'En cours',
      totalPrice: '9000 FCFA',
    },
    {
      id: 'D185',
      client: 'Fatou Sall',
      product: 'Poussins ISA Brown',
      quantity: '10',
      status: 'Confirmée',
      totalPrice: '8500 FCFA',
    },
    {
      id: 'B6B1',
      client: 'Ibrahima Ba',
      product: 'Œufs à Couver',
      quantity: '50',
      status: 'Livrée',
      totalPrice: '6250 FCFA',
    },
    {
      id: 'C3F7',
      client: 'Aïcha Diop',
      product: 'Poulets de Chair',
      quantity: '5',
      status: 'En cours',
      totalPrice: '12000 FCFA',
    },
    {
      id: 'E8G2',
      client: 'Moussa Fall',
      product: 'Poussins Hubbard',
      quantity: '20',
      status: 'Confirmée',
      totalPrice: '15000 FCFA',
    },
    {
      id: 'F1H9',
      client: 'Khadija Ndiaye',
      product: 'Œufs Frais',
      quantity: '100',
      status: 'Livrée',
      totalPrice: '8000 FCFA',
    },
    {
      id: 'G4J5',
      client: 'Ousmane Sarr',
      product: 'Poulets Locaux',
      quantity: '3',
      status: 'En cours',
      totalPrice: '7500 FCFA',
    },
    {
      id: 'H7K8',
      client: 'Mariama Diallo',
      product: 'Poussins Ross',
      quantity: '15',
      status: 'Confirmée',
      totalPrice: '11250 FCFA',
    },
    {
      id: 'I2L3',
      client: 'Cheikh Mbaye',
      product: 'Œufs Bio',
      quantity: '75',
      status: 'Livrée',
      totalPrice: '9000 FCFA',
    },
    {
      id: 'J5M6',
      client: 'Aminata Ba',
      product: 'Poulets Fermiers',
      quantity: '4',
      status: 'En cours',
      totalPrice: '10000 FCFA',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'En cours': 'bg-blue-100 text-blue-800',
      Confirmée: 'bg-orange-100 text-orange-800',
      Livrée: 'bg-green-100 text-green-800',
      Annulée: 'bg-red-100 text-red-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-blue-100 text-blue-800'}`}
      >
        {status}
      </span>
    );
  };

  const totalPages = Math.ceil(receivedOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = receivedOrders.slice(startIndex, endIndex);

  return (
    <AdaptiveLayout activePage="dashboard">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="p-3 bg-matix-green-pale rounded-full">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Commandes Reçues Récentes</h2>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              Voir toutes
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Order ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Prix Total</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-gray-600">{order.client}</td>
                  <td className="py-3 px-4 text-gray-600">{order.product}</td>
                  <td className="py-3 px-4 text-gray-600">{order.quantity}</td>
                  <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{order.totalPrice}</td>
                  <td className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowInvoice(true);
                      }}
                      className="text-matix-green-medium hover:text-matix-green-dark"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600">
            SHOWING {startIndex + 1}-{Math.min(endIndex, receivedOrders.length)} OF{' '}
            {receivedOrders.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Invoice Modal */}
      {showInvoice && selectedOrder && (
        <InvoiceModal
          isOpen={showInvoice}
          onClose={() => setShowInvoice(false)}
          orderId={selectedOrder.id}
          orderData={{
            id: selectedOrder.id,
            orderTime: new Date().toLocaleString('fr-FR'),
            method: 'Orange Money',
            status: selectedOrder.status,
            shipping: 'Livraison standard',
            shippingCost: '1000 FCFA',
            total: selectedOrder.totalPrice,
          }}
        />
      )}
    </AdaptiveLayout>
  );
}
