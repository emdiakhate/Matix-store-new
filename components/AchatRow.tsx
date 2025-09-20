"use client";

import { 
  Eye, 
  Download
} from 'lucide-react';

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

interface AchatRowProps {
  achat: Achat;
  onViewFacture: (achat: Achat) => void;
  onDownloadFacture: (factureUrl: string) => void;
}

export default function AchatRow({ 
  achat, 
  onViewFacture, 
  onDownloadFacture
}: AchatRowProps) {
  const getStatusBadge = (statut: string) => {
    const statusStyles = {
      'Livré': 'bg-green-100 text-green-700',
      'En transit': 'bg-blue-100 text-blue-700',
      'Préparation': 'bg-yellow-100 text-yellow-700',
      'Annulé': 'bg-red-100 text-red-700'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[statut as keyof typeof statusStyles] || 'bg-gray-100 text-gray-700'}`}>
        {statut}
      </span>
    );
  };

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Numéro de commande */}
      <td className="py-4 px-4">
        <div>
          <div className="font-semibold text-gray-900">#{achat.numeroCommande}</div>
          <div className="text-sm text-gray-500">{achat.referenceInterne}</div>
        </div>
      </td>

      {/* Producteur */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {achat.producteur.nom.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900">{achat.producteur.nom}</div>
            <div className="text-sm text-gray-500">{achat.producteur.ville}</div>
          </div>
        </div>
      </td>

      {/* Produits */}
      <td className="py-4 px-4">
        <div>
          <div className="font-medium text-gray-900">{achat.produitPrincipal}</div>
          <div className="text-sm text-gray-500">
            {achat.quantite} {achat.unite}
            {achat.autresProduits > 0 && (
              <span className="ml-1">+ {achat.autresProduits} autres</span>
            )}
          </div>
        </div>
      </td>

      {/* Montant */}
      <td className="py-4 px-4">
        <div className="font-semibold text-gray-900">
          {achat.montantTotal.toLocaleString('fr-FR')} FCFA
        </div>
        {achat.montantTTC !== achat.montantTotal && (
          <div className="text-sm text-gray-500">
            TTC: {achat.montantTTC.toLocaleString('fr-FR')} FCFA
          </div>
        )}
      </td>

      {/* Date */}
      <td className="py-4 px-4">
        <div className="text-gray-900">{achat.dateAchat}</div>
        <div className="text-sm text-gray-500">{achat.heureAchat}</div>
      </td>

      {/* Statut */}
      <td className="py-4 px-4">
        {getStatusBadge(achat.statut)}
      </td>

      {/* Facture */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-2">
          {achat.factureDisponible ? (
            <div className="flex gap-1">
              {/* Bouton Visualiser */}
              <button
                onClick={() => onViewFacture(achat)}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Visualiser la facture"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              {/* Bouton Télécharger */}
              <button
                onClick={() => achat.factureUrl && onDownloadFacture(achat.factureUrl)}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Télécharger la facture"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">En cours</span>
          )}
        </div>
      </td>
    </tr>
  );
}
