"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import DistributorLayout from '@/components/layouts/DistributorLayout';
import { 
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function DistributorDashboardPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const stats = [
    {
      title: "Producteurs Suivis",
      value: "127",
      icon: "👥",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Alertes Actives", 
      value: "8",
      icon: "🔔",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      title: "Devis Envoyés",
      value: "15", 
      icon: "📄",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      title: "CA du Mois",
      value: "2,350,000 FCFA",
      icon: "📈",
      bgColor: "bg-green-100", 
      iconColor: "text-green-600"
    }
  ];

  const recentAlerts = [
    {
      id: "AL001",
      producteur: "Amadou Diallo",
      produit: "Poulets fermiers",
      quantite: "50",
      prix: "4,500 FCFA",
      status: "Nouveau"
    },
    {
      id: "AL002", 
      producteur: "Fatou Sall",
      produit: "Œufs bio x100",
      quantite: "5 lots",
      prix: "3,000 FCFA",
      status: "Vu"
    },
    {
      id: "AL003",
      producteur: "Moussa Ba",
      produit: "Poussins x200",
      quantite: "2 lots",
      prix: "850 FCFA",
      status: "Contacté"
    },
    {
      id: "AL004",
      producteur: "Aïcha Ndiaye",
      produit: "Aliment ponte 25kg",
      quantite: "20 sacs",
      prix: "18,500 FCFA",
      status: "Nouveau"
    },
    {
      id: "AL005",
      producteur: "Ibrahima Fall",
      produit: "Mangeoires auto",
      quantite: "10",
      prix: "15,500 FCFA",
      status: "Vu"
    },
    {
      id: "AL006",
      producteur: "Khadija Diop",
      produit: "Vaccins Newcastle",
      quantite: "50 doses",
      prix: "12,500 FCFA",
      status: "Contacté"
    },
    {
      id: "AL007",
      producteur: "Omar Sy",
      produit: "Cages transport",
      quantite: "5",
      prix: "45,000 FCFA",
      status: "Nouveau"
    },
    {
      id: "AL008",
      producteur: "Bineta Sarr",
      produit: "Abreuvoirs 5L",
      quantite: "15",
      prix: "3,200 FCFA",
      status: "Vu"
    },
    {
      id: "AL009",
      producteur: "Cheikh Ndiaye",
      produit: "Couveuse 100 œufs",
      quantite: "3",
      prix: "89,500 FCFA",
      status: "Contacté"
    },
    {
      id: "AL010",
      producteur: "Mariama Cissé",
      produit: "Désinfectant bio",
      quantite: "8 bidons",
      prix: "8,500 FCFA",
      status: "Nouveau"
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'Nouveau': 'bg-green-100 text-green-800',
      'Vu': 'bg-blue-100 text-blue-800', 
      'Contacté': 'bg-orange-100 text-orange-800',
      'Fermé': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const totalPages = Math.ceil(recentAlerts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAlerts = recentAlerts.slice(startIndex, endIndex);

  return (
    <DistributorLayout activePage="dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Distributeur</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <div className={`text-2xl ${stat.iconColor}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Alerts */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Alertes Récentes</h2>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Alert ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Producteur</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Produit</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Quantité</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Prix</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentAlerts.map((alert, index) => (
                <tr key={alert.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-900">{alert.id}</td>
                  <td className="py-3 px-4 text-gray-600">{alert.producteur}</td>
                  <td className="py-3 px-4 text-gray-600">{alert.produit}</td>
                  <td className="py-3 px-4 text-gray-600">{alert.quantite}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{alert.prix}</td>
                  <td className="py-3 px-4">{getStatusBadge(alert.status)}</td>
                  <td className="py-3 px-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 hover:text-blue-800"
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
            SHOWING {startIndex + 1}-{Math.min(endIndex, recentAlerts.length)} OF {recentAlerts.length}
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
            
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? "bg-blue-600 text-white" : ""}
                >
                  {pageNum}
                </Button>
              );
            })}
            
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
    </DistributorLayout>
  );
}
