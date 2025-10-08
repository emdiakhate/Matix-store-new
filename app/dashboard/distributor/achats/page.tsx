"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import AchatRow from '@/components/AchatRow';
import FactureModal from '@/components/FactureModal';
import { Search, Download } from 'lucide-react';

interface Achat {
  id: number;
  numeroCommande: string;
  referenceInterne: string;
  producteur: {
    nom: string;
    ville: string;
    avatar?: string;
  };
  produitPrincipal: string;
  quantite: number;
  unite: string;
  autresProduits: number;
  montantTotal: number;
  montantTTC: number;
  dateAchat: string;
  heureAchat: string;
  statut: 'Livré' | 'En transit' | 'Préparation' | 'Annulé';
  factureDisponible: boolean;
  numeroFacture?: string;
  factureUrl?: string;
}

export default function AchatsPage() {
  const [achats, setAchats] = useState<Achat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [selectedAchat, setSelectedAchat] = useState<Achat | null>(null);

  // Données mockées
  useEffect(() => {
    const mockAchats: Achat[] = [
      {
        id: 1,
        numeroCommande: "CMD-2024-001",
        referenceInterne: "REF-001",
        producteur: {
          nom: "Ferme Diallo",
          ville: "Thiès, Sénégal"
        },
        produitPrincipal: "Poulets fermiers",
        quantite: 50,
        unite: "pièces",
        autresProduits: 2,
        montantTotal: 125000,
        montantTTC: 125000,
        dateAchat: "15/09/2025",
        heureAchat: "14:30",
        statut: "Livré",
        factureDisponible: true,
        numeroFacture: "FAC-2024-001",
        factureUrl: "/factures/fac-2024-001.html"
      },
      {
        id: 2,
        numeroCommande: "CMD-2024-002",
        referenceInterne: "REF-002",
        producteur: {
          nom: "Élevage Sall",
          ville: "Kaolack, Sénégal"
        },
        produitPrincipal: "Œufs bio x100",
        quantite: 5,
        unite: "lots",
        autresProduits: 0,
        montantTotal: 15000,
        montantTTC: 15000,
        dateAchat: "12/09/2025",
        heureAchat: "10:15",
        statut: "En transit",
        factureDisponible: true,
        numeroFacture: "FAC-2024-002",
        factureUrl: "/factures/fac-2024-002.html"
      },
      {
        id: 3,
        numeroCommande: "CMD-2024-003",
        referenceInterne: "REF-003",
        producteur: {
          nom: "Bio Sénégal",
          ville: "Dakar, Sénégal"
        },
        produitPrincipal: "Aliments bio",
        quantite: 100,
        unite: "kg",
        autresProduits: 1,
        montantTotal: 45000,
        montantTTC: 45000,
        dateAchat: "10/09/2025",
        heureAchat: "16:45",
        statut: "Préparation",
        factureDisponible: false
      },
      {
        id: 4,
        numeroCommande: "CMD-2024-004",
        referenceInterne: "REF-004",
        producteur: {
          nom: "Ferme Avicole de Dakar",
          ville: "Dakar, Sénégal"
        },
        produitPrincipal: "Équipements d'élevage",
        quantite: 10,
        unite: "pièces",
        autresProduits: 0,
        montantTotal: 75000,
        montantTTC: 75000,
        dateAchat: "08/09/2025",
        heureAchat: "09:20",
        statut: "Livré",
        factureDisponible: true,
        numeroFacture: "FAC-2024-004",
        factureUrl: "/factures/fac-2024-004.html"
      },
      {
        id: 5,
        numeroCommande: "CMD-2024-005",
        referenceInterne: "REF-005",
        producteur: {
          nom: "Élevage Traditionnel",
          ville: "Mbour, Sénégal"
        },
        produitPrincipal: "Poussins d'un jour",
        quantite: 200,
        unite: "pièces",
        autresProduits: 0,
        montantTotal: 60000,
        montantTTC: 60000,
        dateAchat: "05/09/2025",
        heureAchat: "11:30",
        statut: "Livré",
        factureDisponible: true,
        numeroFacture: "FAC-2024-005",
        factureUrl: "/factures/fac-2024-005.html"
      }
    ];

    setAchats(mockAchats);
    setLoading(false);
  }, []);

  // Calcul des statistiques
  const totalAchats = achats.reduce((sum, achat) => sum + achat.montantTotal, 0);
  const achatsCeMois = achats
    .filter(achat => {
      const achatDate = new Date(achat.dateAchat.split('/').reverse().join('-'));
      const now = new Date();
      return achatDate.getMonth() === now.getMonth() && achatDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, achat) => sum + achat.montantTotal, 0);

  // Filtrage des achats
  const filteredAchats = achats.filter(achat => {
    if (searchTerm && !achat.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achat.producteur.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !achat.produitPrincipal.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Handlers
  const handleViewFacture = (achat: Achat) => {
    setSelectedAchat(achat);
    setShowFactureModal(true);
  };

  const handleDownloadFacture = async (factureUrl: string) => {
    try {
      // Simulation du téléchargement
      console.log('Téléchargement de la facture:', factureUrl);
      alert('Téléchargement de la facture en cours...');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement de la facture');
    }
  };


  if (loading) {
    return (
      <AdaptiveLayout activePage="achats">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdaptiveLayout>
    );
  }

  return (
    <AdaptiveLayout activePage="achats">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Achats</h1>
        
        {/* Statistiques rapides */}
        <div className="flex gap-4 text-sm">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-gray-500">Total achats:</span>
            <span className="font-semibold text-green-600 ml-1">
              {totalAchats.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-gray-500">Ce mois:</span>
            <span className="font-semibold text-blue-600 ml-1">
              {achatsCeMois.toLocaleString('fr-FR')} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un achat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          value={periodFilter}
          onChange={(e) => setPeriodFilter(e.target.value)}
        >
          <option value="all">Toutes les périodes</option>
          <option value="month">Ce mois</option>
          <option value="quarter">3 derniers mois</option>
          <option value="year">Cette année</option>
        </select>
        <select 
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Toutes catégories</option>
          <option value="volailles">Volailles Vivantes</option>
          <option value="equipements">Équipements Élevage</option>
          <option value="aliments">Aliments & Nutrition</option>
        </select>
      </div>

      {/* Tableau des achats */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">COMMANDE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">PRODUCTEUR</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">PRODUITS</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">MONTANT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">DATE</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">STATUT</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">FACTURE</th>
              </tr>
            </thead>
            <tbody>
              {filteredAchats.map(achat => (
                <AchatRow
                  key={achat.id}
                  achat={achat}
                  onViewFacture={handleViewFacture}
                  onDownloadFacture={handleDownloadFacture}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredAchats.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun achat trouvé</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Aucun achat ne correspond à votre recherche.'
                : 'Vous n\'avez pas encore effectué d\'achats.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de visualisation des factures */}
      <FactureModal
        isOpen={showFactureModal}
        onClose={() => setShowFactureModal(false)}
        achat={selectedAchat}
        onDownloadFacture={handleDownloadFacture}
      />
    </AdaptiveLayout>
  );
}
