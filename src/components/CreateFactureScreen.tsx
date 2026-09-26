import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Minus,
  Trash2, 
  UserPlus, 
  Receipt, 
  Eye, 
  Check, 
  Save, 
  HelpCircle, 
  Percent, 
  Truck, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Banknote,
  Building2,
  FileCheck,
  Calendar,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Client, Facture, LigneMateriau, MainOeuvre, ArtisanProfile, ModePaiement, StatutFacture, Devis } from '../types';
import { formatFCFA, genererNumeroFacture, calculerTotaux } from '../utils/formatters';
import { nombreEnLettres, formatMontantChiffresEtLettres } from '../utils/numberToWords';

interface CreateFactureScreenProps {
  clients: Client[];
  profile: ArtisanProfile;
  existingFactureCount: number;
  initialDevis?: Devis | null;
  initialClient?: Client | null;
  onSaveFacture: (facture: Facture) => void;
  onCancel: () => void;
  onPreviewFacture: (facture: Facture) => void;
  onOpenCreateClient: () => void;
}

export const CreateFactureScreen: React.FC<CreateFactureScreenProps> = ({
  clients,
  profile,
  existingFactureCount,
  initialDevis,
  initialClient,
  onSaveFacture,
  onCancel,
  onPreviewFacture,
  onOpenCreateClient,
}) => {
  const isFormal = profile.est_formel;

  // Toggle between "Reçu de paiement" and "Facture complète détaillée"
  // Default to 'recu' for informal artisans or when explicitly creating a receipt
  const [docMode, setDocMode] = useState<'recu' | 'facture'>(isFormal && !initialDevis ? 'facture' : 'recu');

  // Client Selection
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialDevis?.clientId || initialClient?.id || (clients.length > 0 ? clients[0].id : '')
  );
  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Total calculated if derived from a devis
  const devisTotal = initialDevis
    ? calculerTotaux(
        initialDevis.materiaux,
        initialDevis.mainOeuvre?.montant || 0,
        initialDevis.transportLogistique || 0,
        isFormal,
        initialDevis.appliquerTva,
        profile.tvaTaux
      ).totalTtc
    : 0;

  // ==========================================
  // 1. REÇU DE PAIEMENT SPECIFIC STATE
  // ==========================================
  // Continuous sequential numbering for receipts
  const [numeroRecu, setNumeroRecu] = useState<string>(
    genererNumeroFacture(existingFactureCount, false)
  );

  // Date du paiement
  const [datePaiement, setDatePaiement] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Montant reçu en chiffres
  const defaultMontant = devisTotal > 0 ? Math.round(devisTotal * 0.5) : 50000;
  const [montantRecu, setMontantRecu] = useState<number>(defaultMontant);

  // Montant en toutes lettres
  const [montantLettres, setMontantLettres] = useState<string>(
    nombreEnLettres(defaultMontant)
  );
  const [isCustomLettres, setIsCustomLettres] = useState<boolean>(false);

  // Objet du paiement
  const defaultObjet = initialDevis
    ? `Acompte sur devis n°${initialDevis.numero} - ${initialDevis.titreChantier || 'Travaux'}`
    : "Acompte sur devis n°012 - fabrication d'une porte";
  const [objetPaiement, setObjetPaiement] = useState<string>(defaultObjet);

  // Mode de paiement: espèces, Wave, Orange Money, virement bancaire, chèque...
  const [modePaiementRecu, setModePaiementRecu] = useState<ModePaiement>('Wave');

  // Si acompte: préciser le solde restant dû
  const [estAcompte, setEstAcompte] = useState<boolean>(true);
  const defaultSolde = devisTotal > defaultMontant ? devisTotal - defaultMontant : 50000;
  const [soldeRestantDu, setSoldeRestantDu] = useState<number>(defaultSolde);

  // Update montant in words automatically when montantRecu changes
  const handleMontantChange = (val: number) => {
    const num = isNaN(val) ? 0 : val;
    setMontantRecu(num);
    if (!isCustomLettres) {
      setMontantLettres(nombreEnLettres(num));
    }
    // If derived from devis, adapt solde
    if (devisTotal > 0 && estAcompte) {
      setSoldeRestantDu(Math.max(0, devisTotal - num));
    }
  };

  const handleResetLettres = () => {
    setIsCustomLettres(false);
    setMontantLettres(nombreEnLettres(montantRecu));
  };

  // ==========================================
  // 2. FACTURE COMPLÈTE SPECIFIC STATE
  // ==========================================
  const numeroFacture = genererNumeroFacture(existingFactureCount, true);
  const [titreChantier, setTitreChantier] = useState(
    initialDevis?.titreChantier || 'Travaux de rénovation & pose'
  );
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().split('T')[0]);
  const [dateEcheance, setDateEcheance] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [modePaiementFacture, setModePaiementFacture] = useState<ModePaiement>('Wave');
  const [statutFacture, setStatutFacture] = useState<StatutFacture>('payee');

  const [materiaux, setMateriaux] = useState<LigneMateriau[]>(
    initialDevis?.materiaux || [
      {
        id: 'fm-' + Date.now() + '-1',
        description: 'Matériel électrique & appareillages',
        details: 'Interrupteurs et prises étanches Legrand',
        quantite: 1,
        unite: 'lot',
        prixUnitaire: 54400,
      },
    ]
  );

  const [mainOeuvre, setMainOeuvre] = useState<MainOeuvre>(
    initialDevis?.mainOeuvre || {
      description: 'Pose appareillage & raccordement',
      details: 'Vérification conformité tableau',
      typeTarif: 'Forfait',
      montant: 40000,
    }
  );

  const [transport, setTransport] = useState<number>(initialDevis?.transportLogistique || 0);
  const [appliquerTva, setAppliquerTva] = useState<boolean>(
    initialDevis ? initialDevis.appliquerTva : isFormal
  );

  const handleAddMateriau = () => {
    setMateriaux([
      ...materiaux,
      {
        id: 'fm-' + Date.now(),
        description: '',
        details: '',
        quantite: 1,
        unite: 'u',
        prixUnitaire: 0,
      },
    ]);
  };

  const handleRemoveMateriau = (id: string) => {
    if (materiaux.length <= 1) {
      alert('Une facture doit comporter au moins une prestation ou matériau.');
      return;
    }
    setMateriaux(materiaux.filter((m) => m.id !== id));
  };

  const handleUpdateMateriau = (id: string, field: keyof LigneMateriau, value: any) => {
    setMateriaux(
      materiaux.map((m) => {
        if (m.id === id) {
          return { ...m, [field]: value };
        }
        return m;
      })
    );
  };

  // Build the temporary facture or receipt object
  const buildCurrentDocument = (): Facture => {
    if (docMode === 'recu') {
      const numRecu = Number(montantRecu) || 0;
      return {
        id: 'rec-' + Date.now(),
        numero: numeroRecu,
        estReçu: true,
        devisSourceId: initialDevis?.id,
        clientId: selectedClient?.id || 'cli-unknown',
        clientNom: selectedClient?.nom || 'Client Sénégal',
        clientTelephone: selectedClient?.telephone || '+221 77 000 00 00',
        clientAdresse: selectedClient?.adresse || selectedClient?.ville || 'Dakar',
        titreChantier: objetPaiement || 'Règlement de travaux',
        dateEmission: datePaiement,
        dateEcheance: datePaiement,
        datePaiement: datePaiement,
        montantRecu: numRecu,
        montantLettres: montantLettres || nombreEnLettres(numRecu),
        objetPaiement: objetPaiement,
        estAcompte: estAcompte,
        soldeRestantDu: estAcompte ? (Number(soldeRestantDu) || 0) : 0,
        materiaux: [
          {
            id: 'rec-mat-1',
            description: objetPaiement || 'Règlement de travaux',
            details: estAcompte 
              ? `Acompte versé (Solde restant dû : ${formatFCFA(Number(soldeRestantDu) || 0)})` 
              : 'Règlement intégral soldé',
            quantite: 1,
            unite: 'forfait',
            prixUnitaire: numRecu,
          },
        ],
        mainOeuvre: { description: '', typeTarif: 'Forfait', montant: 0 },
        transportLogistique: 0,
        appliquerTva: false,
        modePaiement: modePaiementRecu,
        statut: 'payee',
      };
    } else {
      return {
        id: 'fac-' + Date.now(),
        numero: numeroFacture,
        estReçu: false,
        devisSourceId: initialDevis?.id,
        clientId: selectedClient?.id || 'cli-unknown',
        clientNom: selectedClient?.nom || 'Client Sénégal',
        clientTelephone: selectedClient?.telephone || '+221 77 000 00 00',
        clientAdresse: selectedClient?.adresse || selectedClient?.ville || 'Dakar',
        titreChantier,
        dateEmission,
        dateEcheance,
        datePaiement: statutFacture === 'payee' ? dateEmission : undefined,
        materiaux,
        mainOeuvre,
        transportLogistique: transport,
        appliquerTva: isFormal ? appliquerTva : false,
        modePaiement: modePaiementFacture,
        statut: statutFacture,
      };
    }
  };

  const handleSave = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner ou ajouter un client.');
      return;
    }
    if (docMode === 'recu' && (!montantRecu || montantRecu <= 0)) {
      alert('Veuillez saisir un montant reçu valide.');
      return;
    }
    if (docMode === 'recu' && !objetPaiement.trim()) {
      alert('Veuillez préciser l’objet du paiement.');
      return;
    }
    const doc = buildCurrentDocument();
    onSaveFacture(doc);
  };

  const handlePreview = () => {
    const doc = buildCurrentDocument();
    onPreviewFacture(doc);
  };

  const totauxFacture = calculerTotaux(
    materiaux,
    mainOeuvre.montant,
    transport,
    isFormal,
    appliquerTva,
    profile.tvaTaux
  );

  return (
    <div className="space-y-4 pb-36 pt-1 max-w-2xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {docMode === 'recu' ? 'Nouveau Reçu de Paiement' : 'Nouvelle Facture'}
          </h2>
          <span className="text-[11px] text-slate-500 font-medium">
            {isFormal ? 'Entreprise BTP Sénégal' : 'Artisan Indépendant • Sénégal'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white hover:bg-[#172554] flex items-center justify-center transition active:scale-95 shadow-sm"
          title="Sauvegarder"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>

      {/* Switch Mode: Reçu de paiement vs Facture (accessible especially if artisan wants both options) */}
      <div className="flex items-center justify-center p-1 bg-slate-100 rounded-xl max-w-xs mx-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setDocMode('recu')}
          className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            docMode === 'recu'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Reçu de paiement</span>
        </button>

        {isFormal && (
          <button
            type="button"
            onClick={() => setDocMode('facture')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              docMode === 'facture'
                ? 'bg-[#1E3A8A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Facture détaillée</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: REÇU DE PAIEMENT (Demande utilisateur exacte)     */}
      {/* ========================================================= */}
      {docMode === 'recu' && (
        <div className="space-y-3.5">
          {/* 1. Numéro du reçu & Date du paiement */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Numéro du reçu (numérotation continue, utile pour votre suivi) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Numéro du reçu <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                    Numérotation continue
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={numeroRecu}
                    onChange={(e) => setNumeroRecu(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50/50 font-bold text-xs sm:text-sm text-[#1E3A8A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="REC-2025-0001"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Numérotation continue utile pour votre suivi comptable
                </p>
              </div>

              {/* Date du paiement */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Date du paiement <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setDatePaiement(new Date().toISOString().split('T')[0])}
                    className="text-[10px] font-bold text-[#1E3A8A] hover:underline"
                  >
                    Aujourd'hui
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={datePaiement}
                    onChange={(e) => setDatePaiement(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white font-semibold text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Date de réception effective des fonds
                </p>
              </div>
            </div>
          </section>

          {/* 2. Client (Reçu de) */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Client (Versé par) <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={onOpenCreateClient}
                className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau client</span>
              </button>
            </div>

            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.telephone} ({c.ville})
                </option>
              ))}
            </select>

            {selectedClient && (
              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                <span className="font-semibold text-slate-700">{selectedClient.nom}</span>
                <span>•</span>
                <span>{selectedClient.telephone}</span>
                {selectedClient.ville && (
                  <>
                    <span>•</span>
                    <span>{selectedClient.ville}</span>
                  </>
                )}
              </div>
            )}
          </section>

          {/* 3. Montant reçu en chiffres et en lettres (ex. : "50 000 FCFA — cinquante mille francs CFA") */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <span>Montant reçu en chiffres et en lettres</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                FCFA
              </span>
            </div>

            {/* Saisie en chiffres */}
            <div>
              <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                1. Montant en chiffres (FCFA)
              </span>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  required
                  value={montantRecu || ''}
                  onChange={(e) => handleMontantChange(parseFloat(e.target.value) || 0)}
                  placeholder="50 000"
                  className="w-full h-12 pl-3.5 pr-16 rounded-xl border-2 border-slate-300 focus:border-[#1E3A8A] bg-white text-lg font-extrabold text-slate-900 focus:outline-none transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  FCFA
                </span>
              </div>

              {/* Raccourcis de montants rapides */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2">
                {[25000, 50000, 100000, 250000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleMontantChange(val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold shrink-0 transition"
                  >
                    {formatFCFA(val)}
                  </button>
                ))}
                {devisTotal > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMontantChange(Math.round(devisTotal * 0.5))}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] text-[11px] font-bold shrink-0 border border-blue-200"
                  >
                    50% du devis ({formatFCFA(Math.round(devisTotal * 0.5))})
                  </button>
                )}
              </div>
            </div>

            {/* Saisie / Affichage en toutes lettres */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  2. Montant en toutes lettres
                </span>
                <button
                  type="button"
                  onClick={handleResetLettres}
                  className="text-[10px] font-bold text-[#1E3A8A] hover:underline flex items-center gap-0.5"
                  title="Recalculer automatiquement en lettres"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Auto-générer</span>
                </button>
              </div>

              <input
                type="text"
                required
                value={montantLettres}
                onChange={(e) => {
                  setMontantLettres(e.target.value);
                  setIsCustomLettres(true);
                }}
                placeholder="cinquante mille francs CFA"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-slate-50/70 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />

              {/* Encadré d'aperçu de conformité (ex: "50 000 FCFA — cinquante mille francs CFA") */}
              <div className="mt-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[11px] text-slate-500 block">Mention officielle sur le reçu :</span>
                  <span className="font-bold text-[#1E3A8A] text-xs">
                    {formatFCFA(montantRecu)} — {montantLettres || nombreEnLettres(montantRecu)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Objet : à quoi correspond le paiement */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-slate-800 block">
              Objet du paiement <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={objetPaiement}
              onChange={(e) => setObjetPaiement(e.target.value)}
              placeholder="Ex: Acompte sur devis n°012 - fabrication d'une porte"
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />

            {/* Suggestions en un clic */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-slate-400 font-medium self-center">Suggestions :</span>
              {[
                "Acompte sur devis n°012 - fabrication d'une porte",
                "Acompte démarrage des travaux de chantier",
                "Règlement achat matériaux & fournitures",
                "Solde intégral et réception de travaux",
              ].map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setObjetPaiement(sug)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition"
                >
                  {sug.split(' - ')[0]}
                </button>
              ))}
            </div>
          </section>

          {/* 5. Mode de paiement : espèces, Wave, Orange Money, virement bancaire, chèque... */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-2.5">
            <label className="text-xs font-bold text-slate-800 block">
              Mode de paiement <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Espèces */}
              <button
                type="button"
                onClick={() => setModePaiementRecu('Espèces')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  modePaiementRecu === 'Espèces'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Espèces</span>
                <span className="text-[9px] text-slate-500">Main propre</span>
              </button>

              {/* Wave */}
              <button
                type="button"
                onClick={() => setModePaiementRecu('Wave')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  modePaiementRecu === 'Wave'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold">Wave</span>
                <span className="text-[9px] text-slate-500">Mobile</span>
              </button>

              {/* Orange Money */}
              <button
                type="button"
                onClick={() => setModePaiementRecu('Orange Money')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  modePaiementRecu === 'Orange Money'
                    ? 'border-orange-500 bg-orange-50 text-orange-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wallet className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold">Orange Money</span>
                <span className="text-[9px] text-slate-500">OM / Maxit</span>
              </button>

              {/* Virement bancaire */}
              <button
                type="button"
                onClick={() => setModePaiementRecu('Virement')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  modePaiementRecu === 'Virement'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold">Virement</span>
                <span className="text-[9px] text-slate-500">Bancaire / RIB</span>
              </button>

              {/* Chèque */}
              <button
                type="button"
                onClick={() => setModePaiementRecu('Chèque')}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition ${
                  modePaiementRecu === 'Chèque'
                    ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileCheck className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">Chèque</span>
                <span className="text-[9px] text-slate-500">Bancaire</span>
              </button>
            </div>
          </section>

          {/* 6. Si acompte : préciser le solde restant dû */}
          <section className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Nature du paiement & Solde
              </label>
              <span className="text-[10px] text-slate-500 font-medium">
                Précision légale
              </span>
            </div>

            {/* Sélecteur Acompte vs Paiement Total */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEstAcompte(true)}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  estAcompte
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                  estAcompte ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                }`}>
                  {estAcompte && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </div>
                <div>
                  <span className="text-xs block">Acompte</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Il reste un solde dû
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEstAcompte(false)}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition ${
                  !estAcompte
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center shrink-0 ${
                  !estAcompte ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {!estAcompte && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                </div>
                <div>
                  <span className="text-xs block">Règlement total</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Solde entièrement payé
                  </span>
                </div>
              </button>
            </div>

            {/* Champ solde restant dû si acompte */}
            {estAcompte && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Solde restant dû (FCFA) <span className="text-rose-500">*</span>
                  </label>
                  {devisTotal > 0 && (
                    <button
                      type="button"
                      onClick={() => setSoldeRestantDu(Math.max(0, devisTotal - montantRecu))}
                      className="text-[10px] font-bold text-[#1E3A8A] hover:underline"
                    >
                      Calculer selon devis ({formatFCFA(devisTotal - montantRecu)})
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    value={soldeRestantDu || ''}
                    onChange={(e) => setSoldeRestantDu(parseFloat(e.target.value) || 0)}
                    placeholder="75 000"
                    className="w-full h-11 pl-3.5 pr-16 rounded-xl border border-slate-300 bg-white font-extrabold text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                    FCFA
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 font-medium">
                  Soit en lettres : <span className="font-bold text-[#1E3A8A]">{nombreEnLettres(soldeRestantDu)}</span>
                </p>
              </div>
            )}
          </section>

          {/* Récapitulatif Final du Reçu */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1E3A8A] text-white space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-blue-200">
                Total Reçu d'acompte
              </span>
              <span className="bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                Encaissé
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold tracking-tight">
                {formatFCFA(montantRecu)}
              </span>
              <span className="text-xs text-blue-100 font-medium">
                {modePaiementRecu}
              </span>
            </div>
            <p className="text-xs text-blue-100/90 italic pt-1 border-t border-blue-400/30">
              « {montantLettres || nombreEnLettres(montantRecu)} »
            </p>
            {estAcompte && (
              <p className="text-[11px] text-amber-200 font-semibold pt-0.5">
                • Solde restant à percevoir : {formatFCFA(soldeRestantDu)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: FACTURE COMPLÈTE DÉTAILLÉE (Pour entreprise formelle) */}
      {/* ========================================================= */}
      {docMode === 'facture' && (
        <div className="space-y-3.5">
          {/* Top Status Context */}
          <div className="flex items-center justify-between px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[10px] uppercase">
                {numeroFacture}
              </span>
              {initialDevis && (
                <span className="text-emerald-700 font-semibold text-[11px]">
                  Issu du devis {initialDevis.numero}
                </span>
              )}
            </div>
            <span className="text-slate-500 font-medium">Date : {dateEmission}</span>
          </div>

          {/* Client Selection */}
          <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Client
              </label>
              <button
                type="button"
                onClick={onOpenCreateClient}
                className="text-xs font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau client</span>
              </button>
            </div>

            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} — {c.telephone} ({c.ville})
                </option>
              ))}
            </select>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Intitulé du chantier
              </label>
              <input
                type="text"
                value={titreChantier}
                onChange={(e) => setTitreChantier(e.target.value)}
                placeholder="Ex: Rénovation salle de bain / Pose canalisation"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </section>

          {/* Matériaux & Fournitures */}
          <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Prestations & Matériaux
                </h3>
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[11px] flex items-center justify-center">
                  {materiaux.length}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddMateriau}
                className="h-8 px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="space-y-3">
              {materiaux.map((mat, index) => (
                <div
                  key={mat.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white relative space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E3A8A]">
                      Ligne {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMateriau(mat.id)}
                      className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Supprimer</span>
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    value={mat.description}
                    onChange={(e) => handleUpdateMateriau(mat.id, 'description', e.target.value)}
                    placeholder="Description du produit / prestation"
                    className="w-full h-9 px-3 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Quantité</label>
                      <input
                        type="number"
                        min="1"
                        value={mat.quantite || ''}
                        onChange={(e) => handleUpdateMateriau(mat.id, 'quantite', parseFloat(e.target.value) || 0)}
                        className="w-full h-9 px-2 text-center rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Prix Unit.</label>
                      <input
                        type="number"
                        min="0"
                        value={mat.prixUnitaire || ''}
                        onChange={(e) => handleUpdateMateriau(mat.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                        className="w-full h-9 px-2 text-right rounded-lg border border-slate-300 font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Total</label>
                      <div className="h-9 px-2 flex items-center justify-end rounded-lg bg-blue-50 text-[#1E3A8A] font-extrabold text-xs">
                        {formatFCFA((mat.quantite || 0) * (mat.prixUnitaire || 0))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Main d'œuvre */}
          <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Main d'œuvre & Pose</h3>
            <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2">
              <input
                type="text"
                value={mainOeuvre.description}
                onChange={(e) => setMainOeuvre({ ...mainOeuvre, description: e.target.value })}
                placeholder="Désignation de la pose"
                className="w-full text-xs font-bold text-slate-900 border-0 p-0 focus:ring-0 focus:outline-none"
              />
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-xs text-slate-500">Montant :</span>
                <input
                  type="number"
                  step="1000"
                  value={mainOeuvre.montant}
                  onChange={(e) => setMainOeuvre({ ...mainOeuvre, montant: Number(e.target.value) })}
                  className="w-32 h-8 px-2 rounded border border-slate-200 text-right font-extrabold text-xs bg-white text-[#1E3A8A]"
                />
              </div>
            </div>
          </section>

          {/* TVA & Totaux Facture */}
          <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A8A]">
                  <Percent className="w-4 h-4" />
                  <span>Appliquer la TVA (18%)</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  NINEA {profile.ninea || 'SN'} • Entreprise formelle
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAppliquerTva(!appliquerTva)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  appliquerTva ? 'bg-[#1E3A8A]' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    appliquerTva ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-between shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider">
                TOTAL FACTURE TTC
              </span>
              <span className="text-xl font-extrabold tracking-tight">
                {formatFCFA(totauxFacture.totalTtc)}
              </span>
            </div>
          </section>
        </div>
      )}

      {/* Floating Bottom Action Buttons */}
      <div className="fixed bottom-4 inset-x-0 z-40 max-w-md mx-auto px-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handlePreview}
          className="flex-1 h-11 sm:h-12 rounded-xl bg-white hover:bg-slate-50 text-[#1E3A8A] font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition"
        >
          <Eye className="w-4 h-4" />
          <span>Aperçu PDF</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-11 sm:h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 active:scale-[0.98] transition"
        >
          <Check className="w-4 h-4" />
          <span>{docMode === 'recu' ? 'Enregistrer le Reçu' : 'Enregistrer la Facture'}</span>
        </button>
      </div>
    </div>
  );
};
