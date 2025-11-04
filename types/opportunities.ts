// Type partagé pour les opportunités
export interface Opportunite {
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
  echeance: string;
  joursRestants: number;
  nombreCandidats?: number;
  dateAcceptation?: string;
}
