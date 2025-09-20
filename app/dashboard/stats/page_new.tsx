"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProducerLayout from '@/components/layouts/ProducerLayout';
import { 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Target,
  Package
} from 'lucide-react';

export default function StatsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'quarter', label: 'Ce trimestre' },
    { value: 'year', label: 'Cette année' }
  ];

  const stats = [
    {
      title: "Revenus du Mois",
      value: "485,000 FCFA",
      icon: <DollarSign className="h-6 w-6" />,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      change: "+12%"
    },
    {
      title: "Produits Vendus", 
      value: "127 unités",
      icon: <Package className="h-6 w-6" />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      change: "+8%"
    },
    {
      title: "Commandes Traitées",
      value: "23", 
      icon: <ShoppingCart className="h-6 w-6" />,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      change: "+15%"
    },
    {
      title: "Taux Conversion",
      value: "68%",
      icon: <Target className="h-6 w-6" />,
      bgColor: "bg-orange-100", 
      iconColor: "text-orange-600",
      change: "+5%"
    }
  ];

  const productPerformance = [
    {
      product: "Poulets Fermiers",
      sales: "45 vendus",
      revenue: "202,500 FCFA",
      stock: "12 restants",
      performance: "Excellente",
      performanceColor: "text-green-600 bg-green-100"
    },
    {
      product: "Œufs Bio",
      sales: "156 vendus", 
      revenue: "93,600 FCFA",
      stock: "24 restants",
      performance: "Bonne",
      performanceColor: "text-blue-600 bg-blue-100"
    },
    {
      product: "Poussins Pondeuses",
      sales: "78 vendus",
      revenue: "156,000 FCFA", 
      stock: "5 restants",
      performance: "Très Bonne",
      performanceColor: "text-green-600 bg-green-100"
    },
    {
      product: "Aliment Ponte",
      sales: "32 vendus",
      revenue: "592,000 FCFA",
      stock: "8 restants",
      performance: "Bonne",
      performanceColor: "text-blue-600 bg-blue-100"
    }
  ];

  return (
    <ProducerLayout activePage="stats">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <div className="flex gap-2">
          {periods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className={selectedPeriod === period.value ? "bg-matix-green-medium hover:bg-matix-green-dark text-white" : ""}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                </div>
              </div>
              <div className={`p-3 ${stat.bgColor} rounded-full`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Product Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance des Produits</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Ventes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Revenus</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Performance</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((product, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{product.product}</td>
                  <td className="py-3 px-4 text-gray-600">{product.sales}</td>
                  <td className="py-3 px-4 text-gray-600">{product.revenue}</td>
                  <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.performanceColor}`}>
                      {product.performance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ProducerLayout>
  );
}
