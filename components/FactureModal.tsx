"use client";

import { X, Download } from 'lucide-react';

interface Achat {
  id: number;
  numeroCommande: string;
  numeroFacture?: string;
  factureUrl?: string;
  producteur: {
    nom: string;
    ville: string;
  };
  montantTotal: number;
  dateAchat: string;
}

interface FactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  achat: Achat | null;
  onDownloadFacture: (factureUrl: string) => void;
}

export default function FactureModal({ 
  isOpen, 
  onClose, 
  achat, 
  onDownloadFacture 
}: FactureModalProps) {
  if (!isOpen || !achat) return null;

  const handleDownload = () => {
    if (achat.factureUrl) {
      onDownloadFacture(achat.factureUrl);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl h-5/6 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Facture #{achat.numeroFacture || 'N/A'}
            </h2>
            <p className="text-gray-500">Commande #{achat.numeroCommande}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>Producteur: {achat.producteur.nom}</span>
              <span>Montant: {achat.montantTotal.toLocaleString('fr-FR')} FCFA</span>
              <span>Date: {achat.dateAchat}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Bouton télécharger */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Télécharger
            </button>
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu facture */}
        <div className="flex-1 p-6 overflow-auto">
          {achat.factureUrl ? (
            <iframe
              src={achat.factureUrl}
              className="w-full h-full border border-gray-200 rounded-lg"
              title="Aperçu facture"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Download className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Facture non disponible
                </h3>
                <p className="text-gray-500">
                  La facture pour cette commande n'est pas encore disponible.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
