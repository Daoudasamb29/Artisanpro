export type StatutArtisan = 'formel' | 'informel';

export type MetierArtisan = 'plomberie' | 'electricite' | 'maconnerie' | 'peinture' | 'menuiserie' | 'climatisation';

export interface ArtisanProfile {
  id: string;
  nomArtisan: string;
  nomEntreprise: string;
  metier: MetierArtisan;
  telephone: string; // e.g. "77 412 89 00"
  adresse: string;
  est_formel: boolean;
  ninea?: string; // e.g. "123456789"
  rccm?: string;  // e.g. "SN-DKR-2020-A-1234"
  compteWave?: string;
  compteOrangeMoney?: string;
  tvaTaux: number; // 18%
}

export interface Client {
  id: string;
  nom: string;
  telephone: string; // +221 ...
  adresse: string;
  ville: string;
  type: 'Particulier' | 'Entreprise';
  statutChantier?: 'Chantier' | 'Devis envoyé' | 'Rénovation' | 'Terminé';
  notes?: string;
  dateAjout: string;
}

export interface LigneMateriau {
  id: string;
  description: string;
  details?: string;
  quantite: number;
  unite: string; // 'm²', 'sac', 'ml', 'u', 'forfait', 'lot'
  prixUnitaire: number; // in FCFA
}

export interface MainOeuvre {
  description: string;
  details?: string;
  typeTarif: 'Forfait' | 'Journalier';
  montant: number; // in FCFA
}

export type StatutDevis = 'brouillon' | 'envoye' | 'accepte' | 'refuse';

export interface Devis {
  id: string;
  numero: string; // DEV-2025-XXXX
  clientId: string;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  titreChantier: string;
  dateEmission: string;
  dateValidite: string;
  materiaux: LigneMateriau[];
  mainOeuvre: MainOeuvre;
  transportLogistique: number; // in FCFA, 0 if offert
  appliquerTva: boolean; // only applicable if est_formel
  statut: StatutDevis;
  modalitePaiement: string; // e.g. "50% avance • 50% réception"
  factureGenereeId?: string;
  noteVocale?: string;
}

export type ModePaiement = 'Espèces' | 'Wave' | 'Orange Money' | 'Virement' | 'Chèque';
export type StatutFacture = 'payee' | 'impayee' | 'en_retard';

export interface Facture {
  id: string;
  numero: string; // FAC-2025-XXXX or REC-2025-XXXX
  estReçu: boolean; // true if receipt
  devisSourceId?: string;
  clientId: string;
  clientNom: string;
  clientTelephone: string;
  clientAdresse: string;
  titreChantier: string;
  dateEmission: string;
  dateEcheance: string;
  datePaiement?: string;
  
  // Specific receipt fields
  montantRecu?: number;
  montantLettres?: string;
  objetPaiement?: string;
  estAcompte?: boolean;
  soldeRestantDu?: number;

  materiaux: LigneMateriau[];
  mainOeuvre: MainOeuvre;
  transportLogistique: number;
  appliquerTva: boolean;
  modePaiement: ModePaiement;
  statut: StatutFacture;
  modalitePaiement?: string;
  noteVocale?: string;
}

export type TabDestination = 'accueil' | 'clients' | 'devis' | 'factures' | 'compta';
