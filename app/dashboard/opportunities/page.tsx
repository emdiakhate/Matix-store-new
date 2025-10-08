"use client";

import { useState } from 'react';
import AdaptiveLayout from '@/components/layouts/AdaptiveLayout';
import { Card } from '@/components/ui/card';
import TabButton from '@/components/ui/TabButton';
import OpportuniteRow from '@/components/OpportuniteRow';
import DetailsOpportuniteModal from '@/components/DetailsOpportuniteModal';

// Données mock pour les opportunités
const exampleOpportunites = [
  {
    id: 1,
    titreAnnonce: "Poulets fermiers pour restaurant",
    referenceAnnonce: "ANN-2024-001",
    datePublication: "10/09/2025",
    distributeur: {
      nom: "Restaurant Le Dakar",
      ville: "Dakar, Sénégal",
      avatar: "/avatars/restaurant.jpg",
      note: 4.8
    },
    produitDemande: "Poulets fermiers",
    quantiteDemandee: 50,
    uniteDemandee: "pièces",
    categorie: "Volailles Vivantes",
    monOffre: {
      prix: 2500,
      quantite: 50,
      unite: "pièces",
      dateOffre: "11/09/2025"
    },
    budgetMax: 2800,
    statut: "En cours" as const,
    echeance: "25/09/2025",
    joursRestants: 6,
    nombreCandidats: 8
  },
  {
    id: 2,
    titreAnnonce: "Œufs bio pour boulangerie",
    referenceAnnonce: "ANN-2024-002",
    datePublication: "08/09/2025",
    distributeur: {
      nom: "Boulangerie Sall",
      ville: "Thiès, Sénégal",
      avatar: "/avatars/boulangerie.jpg",
      note: 4.5
    },
    produitDemande: "Œufs biologiques",
    quantiteDemandee: 200,
    uniteDemandee: "pièces",
    categorie: "Œufs & Reproduction",
    monOffre: {
      prix: 1800,
      quantite: 200,
      unite: "pièces",
      dateOffre: "09/09/2025"
    },
    budgetMax: 2000,
    statut: "Acceptée" as const,
    dateAcceptation: "12/09/2025",
    echeance: "20/09/2025",
    joursRestants: 1
  },
  {
    id: 3,
    titreAnnonce: "Aliments pour volailles",
    referenceAnnonce: "ANN-2024-003",
    datePublication: "05/09/2025",
    distributeur: {
      nom: "Ferme Moderne",
      ville: "Saint-Louis, Sénégal",
      avatar: "/avatars/ferme.jpg",
      note: 4.2
    },
    produitDemande: "Aliments avicoles",
    quantiteDemandee: 1000,
    uniteDemandee: "kg",
    categorie: "Aliments Avicoles",
    monOffre: {
      prix: 450,
      quantite: 1000,
      unite: "kg",
      dateOffre: "06/09/2025"
    },
    budgetMax: 500,
    statut: "Refusée" as const,
    echeance: "15/09/2025",
    joursRestants: -5
  },
  {
    id: 4,
    titreAnnonce: "Équipements d'élevage",
    referenceAnnonce: "ANN-2024-004",
    datePublication: "01/09/2025",
    distributeur: {
      nom: "Coopérative Agricole",
      ville: "Kaolack, Sénégal",
      avatar: "/avatars/cooperative.jpg",
      note: 4.7
    },
    produitDemande: "Mangeoires automatiques",
    quantiteDemandee: 20,
    uniteDemandee: "pièces",
    categorie: "Équipements",
    monOffre: {
      prix: 15000,
      quantite: 20,
      unite: "pièces",
      dateOffre: "02/09/2025"
    },
    budgetMax: 18000,
    statut: "Expirée" as const,
    echeance: "10/09/2025",
    joursRestants: -10
  },
  {
    id: 5,
    titreAnnonce: "Poulets de chair premium",
    referenceAnnonce: "ANN-2024-005",
    datePublication: "15/09/2025",
    distributeur: {
      nom: "Super Marché Plus",
      ville: "Dakar, Sénégal",
      avatar: "/avatars/supermarche.jpg",
      note: 4.6
    },
    produitDemande: "Poulets de chair",
    quantiteDemandee: 100,
    uniteDemandee: "pièces",
    categorie: "Volailles Vivantes",
    monOffre: {
      prix: 3200,
      quantite: 100,
      unite: "pièces",
      dateOffre: "16/09/2025"
    },
    budgetMax: 3500,
    statut: "En cours" as const,
    echeance: "30/09/2025",
    joursRestants: 11,
    nombreCandidats: 5
  },
  {
    id: 6,
    titreAnnonce: "Œufs de consommation",
    referenceAnnonce: "ANN-2024-006",
    datePublication: "12/09/2025",
    distributeur: {
      nom: "Marché Central",
      ville: "Thiès, Sénégal",
      avatar: "/avatars/marche.jpg",
      note: 4.3
    },
    produitDemande: "Œufs de consommation",
    quantiteDemandee: 500,
    uniteDemandee: "pièces",
    categorie: "Œufs & Reproduction",
    monOffre: {
      prix: 1200,
      quantite: 500,
      unite: "pièces",
      dateOffre: "13/09/2025"
    },
    budgetMax: 1500,
    statut: "En cours" as const,
    echeance: "28/09/2025",
    joursRestants: 9,
    nombreCandidats: 12
  },
  {
    id: 7,
    titreAnnonce: "Aliments pour pondeuses",
    referenceAnnonce: "ANN-2024-007",
    datePublication: "14/09/2025",
    distributeur: {
      nom: "Ferme Avicole Moderne",
      ville: "Saint-Louis, Sénégal",
      avatar: "/avatars/ferme-avicole.jpg",
      note: 4.9
    },
    produitDemande: "Aliments pour pondeuses",
    quantiteDemandee: 2000,
    uniteDemandee: "kg",
    categorie: "Aliments Avicoles",
    monOffre: {
      prix: 900,
      quantite: 2000,
      unite: "kg",
      dateOffre: "15/09/2025"
    },
    budgetMax: 1000,
    statut: "En cours" as const,
    echeance: "02/10/2025",
    joursRestants: 13,
    nombreCandidats: 7
  },
  {
    id: 8,
    titreAnnonce: "Canards fermiers",
    referenceAnnonce: "ANN-2024-008",
    datePublication: "16/09/2025",
    distributeur: {
      nom: "Restaurant Traditionnel",
      ville: "Ziguinchor, Sénégal",
      avatar: "/avatars/restaurant-trad.jpg",
      note: 4.4
    },
    produitDemande: "Canards fermiers",
    quantiteDemandee: 30,
    uniteDemandee: "pièces",
    categorie: "Volailles Vivantes",
    monOffre: {
      prix: 4000,
      quantite: 30,
      unite: "pièces",
      dateOffre: "17/09/2025"
    },
    budgetMax: 4500,
    statut: "En cours" as const,
    echeance: "05/10/2025",
    joursRestants: 16,
    nombreCandidats: 3
  }
];

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState('en-cours');
  const [selectedOpportunite, setSelectedOpportunite] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [opportunites, setOpportunites] = useState(exampleOpportunites);

  const getFilteredOpportunites = (tab: string) => {
    switch (tab) {
      case 'en-cours':
        return opportunites.filter(opp => opp.statut === 'En cours');
      case 'acceptes':
        return opportunites.filter(opp => opp.statut === 'Acceptée');
      case 'refuses':
        return opportunites.filter(opp => opp.statut === 'Refusée');
      case 'expires':
        return opportunites.filter(opp => opp.statut === 'Expirée');
      default:
        return opportunites;
    }
  };

  const handleShowDetails = (opportunite: any) => {
    setSelectedOpportunite(opportunite);
    setShowDetailsModal(true);
  };

  const handleUpdateOffer = (opportuniteId: number, newOffer: { prix: number; quantite: number; unite: string }) => {
    setOpportunites(prev => prev.map(opp => 
      opp.id === opportuniteId 
        ? { 
            ...opp, 
            monOffre: { 
              ...opp.monOffre, 
              ...newOffer,
              dateOffre: new Date().toLocaleDateString('fr-FR')
            } 
          }
        : opp
    ));
    
    // Mettre à jour l'opportunité sélectionnée si c'est la même
    if (selectedOpportunite && selectedOpportunite.id === opportuniteId) {
      setSelectedOpportunite(prev => ({
        ...prev,
        monOffre: { 
          ...prev.monOffre, 
          ...newOffer,
          dateOffre: new Date().toLocaleDateString('fr-FR')
        }
      }));
    }
  };

  const currentOpportunites = getFilteredOpportunites(activeTab);

  return (
    <AdaptiveLayout activePage="opportunities">
      <div className="space-y-6">
        {/* Header avec titre et statistiques */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Opportunités</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos offres aux annonces des distributeurs et suivez leurs performances
            </p>
          </div>
          
          {/* Statistiques rapides */}
          <div className="flex gap-4 text-sm">
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
              <div className="text-gray-500">Taux d'acceptation</div>
              <div className="font-bold text-green-600 text-lg">73%</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg shadow-sm border">
              <div className="text-gray-500">Offres ce mois</div>
              <div className="font-bold text-blue-600 text-lg">28</div>
            </div>
          </div>
        </div>

        {/* Onglets de filtrage */}
        <div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <TabButton
              active={activeTab === 'en-cours'}
              onClick={() => setActiveTab('en-cours')}
              count={opportunites.filter(opp => opp.statut === 'En cours').length}
              color="blue"
            >
              En cours
            </TabButton>
            <TabButton
              active={activeTab === 'acceptes'}
              onClick={() => setActiveTab('acceptes')}
              count={opportunites.filter(opp => opp.statut === 'Acceptée').length}
              color="green"
            >
              Acceptées
            </TabButton>
            <TabButton
              active={activeTab === 'refuses'}
              onClick={() => setActiveTab('refuses')}
              count={opportunites.filter(opp => opp.statut === 'Refusée').length}
              color="red"
            >
              Refusées
            </TabButton>
            <TabButton
              active={activeTab === 'expires'}
              onClick={() => setActiveTab('expires')}
              count={opportunites.filter(opp => opp.statut === 'Expirée').length}
              color="gray"
            >
              Expirées
            </TabButton>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher une opportunité..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Toutes catégories</option>
            <option>Volailles Vivantes</option>
            <option>Œufs & Reproduction</option>
            <option>Aliments Avicoles</option>
            <option>Équipements</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Toutes les dates</option>
            <option>Cette semaine</option>
            <option>Ce mois</option>
            <option>3 derniers mois</option>
          </select>
        </div>

        {/* Tableau des opportunités */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-48">ANNONCE</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-40">DISTRIBUTEUR</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-36">PRODUIT</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-28">MON OFFRE</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-24">BUDGET</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-20">STATUT</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-24">ÉCHÉANCE</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-700 w-16">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {currentOpportunites.length > 0 ? (
                  currentOpportunites.map((opportunite) => (
                    <OpportuniteRow 
                      key={opportunite.id} 
                      opportunite={opportunite}
                      onShowDetails={handleShowDetails}
                      onUpdateOffer={handleUpdateOffer}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      Aucune opportunité trouvée pour ce filtre
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {currentOpportunites.length > 0 && (
          <div className="flex justify-center">
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Précédent
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de détails */}
      <DetailsOpportuniteModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        opportunite={selectedOpportunite}
        onUpdateOffer={handleUpdateOffer}
      />
    </AdaptiveLayout>
  );
}
