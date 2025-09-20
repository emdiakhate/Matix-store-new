"use client";

import { useState } from 'react';
import { Eye, Edit, MessageCircle, X } from 'lucide-react';
import EditOfferModal from './EditOfferModal';

interface Opportunite {
  id: number;
  titreAnnonce: string;
  referenceAnnonce: string;
  datePublication: string;
  distributeur: {
    nom: string;
    ville: string;
    avatar?: string;
    note: number;
  };
  produitDemande: string;
  quantiteDemandee: number;
  uniteDemandee: string;
  categorie: string;
  monOffre: {
    prix: number;
    quantite: number;
    unite: string;
    dateOffre: string;
  };
  budgetMax: number;
  statut: 'En cours' | 'Acceptée' | 'Refusée' | 'Expirée';
  dateAcceptation?: string;
  echeance: string;
  joursRestants: number;
  nombreCandidats?: number;
}

interface OpportuniteRowProps {
  opportunite: Opportunite;
  onShowDetails: (opportunite: Opportunite) => void;
  onUpdateOffer: (opportuniteId: number, newOffer: { prix: number; quantite: number; unite: string }) => void;
}

export default function OpportuniteRow({ opportunite, onShowDetails, onUpdateOffer }: OpportuniteRowProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditOffer = () => {
    setShowEditModal(true);
  };

  const handleSaveOffer = (opportuniteId: number, newOffer: { prix: number; quantite: number; unite: string }) => {
    onUpdateOffer(opportuniteId, newOffer);
    setShowEditModal(false);
  };

  return (
    <>
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Annonce */}
      <td className="py-3 px-2">
        <div className="truncate">
          <div className="font-semibold text-gray-900 text-sm truncate" title={opportunite.titreAnnonce}>
            {opportunite.titreAnnonce}
          </div>
          <div className="text-xs text-gray-500 truncate">
            #{opportunite.referenceAnnonce}
          </div>
          <div className="text-xs text-gray-400">
            {opportunite.datePublication}
          </div>
        </div>
      </td>

      {/* Distributeur */}
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-gray-600">
              {opportunite.distributeur.nom.charAt(0)}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 text-sm truncate" title={opportunite.distributeur.nom}>
              {opportunite.distributeur.nom}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {opportunite.distributeur.ville}
            </div>
            <div className="text-xs text-yellow-600">
              ⭐ {opportunite.distributeur.note}
            </div>
          </div>
        </div>
      </td>

      {/* Produit demandé */}
      <td className="py-3 px-2">
        <div>
          <div className="font-medium text-gray-900 text-sm truncate" title={opportunite.produitDemande}>
            {opportunite.produitDemande}
          </div>
          <div className="text-xs text-gray-600">
            {opportunite.quantiteDemandee} {opportunite.uniteDemandee}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {opportunite.categorie}
          </div>
        </div>
      </td>

      {/* Mon offre */}
      <td className="py-3 px-2">
        <div>
          <div className="font-semibold text-blue-600 text-sm">
            {opportunite.monOffre.prix.toLocaleString()} XOF
          </div>
          <div className="text-xs text-gray-600">
            {opportunite.monOffre.quantite} {opportunite.monOffre.unite}
          </div>
          <div className="text-xs text-gray-500">
            {opportunite.monOffre.dateOffre}
          </div>
        </div>
      </td>

      {/* Budget max */}
      <td className="py-3 px-2">
        <div className="font-medium text-gray-900 text-sm">
          {opportunite.budgetMax.toLocaleString()} XOF
        </div>
        <div className={`text-xs ${
          opportunite.monOffre.prix <= opportunite.budgetMax 
            ? 'text-green-600' 
            : 'text-red-600'
        }`}>
          {opportunite.monOffre.prix <= opportunite.budgetMax 
            ? '✓ OK' 
            : '✗ Hors budget'
          }
        </div>
      </td>

      {/* Statut */}
      <td className="py-3 px-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          opportunite.statut === 'Acceptée' 
            ? 'bg-green-100 text-green-700'
            : opportunite.statut === 'En cours'
            ? 'bg-blue-100 text-blue-700'
            : opportunite.statut === 'Refusée'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {opportunite.statut === 'En cours' ? 'En cours' : 
           opportunite.statut === 'Acceptée' ? 'Acceptée' :
           opportunite.statut === 'Refusée' ? 'Refusée' : 'Expirée'}
        </span>
        
        {opportunite.statut === 'Acceptée' && opportunite.dateAcceptation && (
          <div className="text-xs text-green-600 mt-1">
            {opportunite.dateAcceptation}
          </div>
        )}
      </td>

      {/* Échéance */}
      <td className="py-3 px-2">
        <div className="text-gray-900 text-sm">{opportunite.echeance}</div>
        <div className={`text-xs ${
          opportunite.joursRestants <= 2 
            ? 'text-red-600' 
            : opportunite.joursRestants <= 7 
            ? 'text-orange-600' 
            : 'text-gray-500'
        }`}>
          {opportunite.joursRestants > 0 
            ? `${opportunite.joursRestants}j`
            : 'Expirée'
          }
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-2">
        <div className="flex gap-1">
          {/* Voir détails */}
          <button
            onClick={() => onShowDetails(opportunite)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Voir détails"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          
          {/* Modifier offre (si en cours) */}
          {opportunite.statut === 'En cours' && (
            <button
              onClick={handleEditOffer}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Modifier mon offre"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Contacter distributeur (si acceptée) */}
          {opportunite.statut === 'Acceptée' && (
            <button
              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Contacter le distributeur"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Retirer candidature (si en cours) */}
          {opportunite.statut === 'En cours' && (
            <button
              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Retirer ma candidature"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
    
    {/* Modal de modification d'offre */}
    <EditOfferModal
      isOpen={showEditModal}
      onClose={() => setShowEditModal(false)}
      opportunite={opportunite}
      onSave={handleSaveOffer}
    />
    </>
  );
}
