'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import EditOfferModal from './EditOfferModal';
import type { Opportunite } from '@/types/opportunities';

interface DetailsOpportuniteModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunite: Opportunite | null;
  onUpdateOffer: (
    opportuniteId: number,
    newOffer: { prix: number; quantite: number; unite: string }
  ) => void;
}

export default function DetailsOpportuniteModal({
  isOpen,
  onClose,
  opportunite,
  onUpdateOffer,
}: DetailsOpportuniteModalProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditOffer = () => {
    setShowEditModal(true);
  };

  const handleSaveOffer = (
    opportuniteId: number,
    newOffer: { prix: number; quantite: number; unite: string }
  ) => {
    onUpdateOffer(opportuniteId, newOffer);
    setShowEditModal(false);
  };

  if (!isOpen || !opportunite) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-5/6 overflow-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{opportunite.titreAnnonce}</h2>
              <p className="text-gray-500">Réf: #{opportunite.referenceAnnonce}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Détails de l'annonce</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Produit:</span> {opportunite.produitDemande}
                </div>
                <div>
                  <span className="text-gray-500">Quantité:</span> {opportunite.quantiteDemandee}{' '}
                  {opportunite.uniteDemandee}
                </div>
                <div>
                  <span className="text-gray-500">Budget max:</span>{' '}
                  {opportunite.budgetMax.toLocaleString()} XOF
                </div>
                <div>
                  <span className="text-gray-500">Échéance:</span> {opportunite.echeance}
                </div>
                <div>
                  <span className="text-gray-500">Distributeur:</span>{' '}
                  {opportunite.distributeur.nom}
                </div>
                <div>
                  <span className="text-gray-500">Localisation:</span>{' '}
                  {opportunite.distributeur.ville}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Mon offre</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Prix proposé:</span>{' '}
                  {opportunite.monOffre.prix.toLocaleString()} XOF
                </div>
                <div>
                  <span className="text-gray-500">Quantité:</span> {opportunite.monOffre.quantite}{' '}
                  {opportunite.monOffre.unite}
                </div>
                <div>
                  <span className="text-gray-500">Date d'offre:</span>{' '}
                  {opportunite.monOffre.dateOffre}
                </div>
                <div>
                  <span className="text-gray-500">Statut:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs ${
                      opportunite.statut === 'Acceptée'
                        ? 'bg-green-100 text-green-700'
                        : opportunite.statut === 'En cours'
                          ? 'bg-blue-100 text-blue-700'
                          : opportunite.statut === 'Refusée'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {opportunite.statut}
                  </span>
                </div>
                {opportunite.dateAcceptation && (
                  <div>
                    <span className="text-gray-500">Acceptée le:</span>{' '}
                    {opportunite.dateAcceptation}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analyse de l'offre */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Analyse de mon offre</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {opportunite.monOffre.prix.toLocaleString()} XOF
                </div>
                <div className="text-gray-500">Mon prix</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {opportunite.budgetMax.toLocaleString()} XOF
                </div>
                <div className="text-gray-500">Budget max</div>
              </div>
              <div className="text-center">
                <div
                  className={`text-2xl font-bold ${
                    opportunite.monOffre.prix <= opportunite.budgetMax
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {Math.round(
                    ((opportunite.budgetMax - opportunite.monOffre.prix) / opportunite.budgetMax) *
                      100
                  )}
                  %
                </div>
                <div className="text-gray-500">
                  {opportunite.monOffre.prix <= opportunite.budgetMax ? 'Marge' : 'Dépassement'}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            {opportunite.statut === 'En cours' && (
              <>
                <button
                  onClick={handleEditOffer}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier mon offre
                </button>
                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                  Retirer ma candidature
                </button>
              </>
            )}
            {opportunite.statut === 'Acceptée' && (
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Contacter le distributeur
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>

      {/* Modal de modification d'offre */}
      <EditOfferModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        opportunite={opportunite}
        onSave={handleSaveOffer}
      />
    </div>
  );
}
