"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import { 
  Search,
  Filter,
  RotateCcw,
  Eye,
  CheckCircle,
  Truck,
  Phone,
  Printer,
  ChevronDown
} from 'lucide-react';

export default function ProducerOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const orders = [
    {
      id: "CM001",
      date: "28/08/25",
      client: "Fatou Sall",
      contact: "+221 76 987 654",
      product: "Poulets fermiers",
      quantity: "5",
      unitPrice: "4,500",
      total: "22,500",
      status: "Nouvelle"
    },
    {
      id: "CM002", 
      date: "27/08/25",
      client: "Ibrahima Ba",
      contact: "+221 78 444 567",
      product: "Œufs bio x30",
      quantity: "2",
      unitPrice: "3,000",
      total: "6,000",
      status: "Confirmée"
    },
    {
      id: "CM003",
      date: "26/08/25",
      client: "Distributeur Thiès",
      contact: "+221 77 123 456", 
      product: "Poussins x50",
      quantity: "1",
      unitPrice: "125,000",
      total: "125,000",
      status: "En préparation"
    },
    {
      id: "CM004",
      date: "25/08/25",
      client: "Aïcha Ndiaye",
      contact: "+221 70 555 888",
      product: "Aliment ponte 25kg",
      quantity: "3",
      unitPrice: "18,500",
      total: "55,500",
      status: "Expédiée"
    },
    {
      id: "CM005",
      date: "24/08/25",
      client: "Moussa Diop",
      contact: "+221 76 333 222",
      product: "Poulets chair x10",
      quantity: "1",
      unitPrice: "45,000",
      total: "45,000",
      status: "Nouvelle"
    },
    {
      id: "CM006",
      date: "23/08/25",
      client: "Khadija Fall",
      contact: "+221 75 777 999",
      product: "Mangeoires auto",
      quantity: "2",
      unitPrice: "15,500",
      total: "31,000",
      status: "Confirmée"
    },
    {
      id: "CM007",
      date: "22/08/25",
      client: "Omar Sy",
      contact: "+221 78 111 333",
      product: "Vaccins Newcastle",
      quantity: "10",
      unitPrice: "2,500",
      total: "25,000",
      status: "Livrée"
    },
    {
      id: "CM008",
      date: "21/08/25",
      client: "Mariama Ba",
      contact: "+221 76 444 666",
      product: "Cages transport",
      quantity: "5",
      unitPrice: "8,000",
      total: "40,000",
      status: "En préparation"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Nouvelle': 'bg-blue-100 text-blue-800',
      'Confirmée': 'bg-green-100 text-green-800',
      'En préparation': 'bg-yellow-100 text-yellow-800',
      'Expédiée': 'bg-purple-100 text-purple-800',
      'Livrée': 'bg-gray-100 text-gray-800',
      'Annulée': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <AdaptiveLayout activePage="orders">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commandes Reçues</h1>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-matix-green-medium"
            >
              <option value="all">Tous les statuts</option>
              <option value="Nouvelle">Nouvelle</option>
              <option value="Confirmée">Confirmée</option>
              <option value="En préparation">En préparation</option>
              <option value="Expédiée">Expédiée</option>
              <option value="Livrée">Livrée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <Input
            type="date"
            placeholder="Date de début"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />

          <Input
            type="date"
            placeholder="Date de fin"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix Unitaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.client}</div>
                      <div className="text-sm text-gray-500">{order.contact}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.product}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.unitPrice} FCFA</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.total} FCFA</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-matix-green-medium hover:text-matix-green-dark"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Truck className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdaptiveLayout>
  );
}
