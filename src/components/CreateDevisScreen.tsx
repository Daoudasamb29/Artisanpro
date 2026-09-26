import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Minus,
  Trash2, 
  UserPlus, 
  FileText, 
  Eye, 
  Check, 
  Save, 
  HelpCircle,
  Percent,
  Truck,
  Sparkles
} from 'lucide-react';
import { Client, Devis, LigneMateriau, MainOeuvre, ArtisanProfile } from '../types';
import { formatFCFA, genererNumeroDevis, calculerTotaux } from '../utils/formatters';

interface CreateDevisScreenProps {
  clients: Client[];
  profile: ArtisanProfile;
  existingDevisCount: number;
  initialClient?: Client | null;
  onSaveDevis: (devis: Devis) => void;
  onCancel: () => void;
  onPreviewDevis: (devis: Devis) => void;
  onOpenCreateClient: () => void;
}

export const CreateDevisScreen: React.FC<CreateDevisScreenProps> = ({
  clients,
  profile,
  existingDevisCount,
  initialClient,
  onSaveDevis,
  onCancel,
  onPreviewDevis,
  onOpenCreateClient,
}) => {
  // Client selection (blank by default unless passed via initialClient)
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClient?.id || ''
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId) || null;

  // Document metadata
  const numeroDevis = genererNumeroDevis(existingDevisCount);
  const [titreChantier, setTitreChantier] = useState('');
  const [dateEmission, setDateEmission] = useState(new Date().toISOString().split('T')[0]);
  const [modalitePaiement, setModalitePaiement] = useState('50% avance • 50% réception');

  // Materials & Products lines: starts clean and blank ready for artisan entry
  const [materiaux, setMateriaux] = useState<LigneMateriau[]>([
    {
      id: 'mat-' + Date.now() + '-1',
      description: '',
      details: '',
      quantite: 1,
      unite: 'u',
      prixUnitaire: 0,
    },
  ]);

  // Labor line (Main d'œuvre & Pose): starts blank
  const [mainOeuvre, setMainOeuvre] = useState<MainOeuvre>({
    description: '',
    details: '',
    typeTarif: 'Forfait',
    montant: 0,
  });

  // Transport & TVA Toggle
  const [transport, setTransport] = useState<number>(0);
  const [appliquerTva, setAppliquerTva] = useState<boolean>(profile.est_formel);

  // Quick helper to add a material line
  const handleAddMateriau = () => {
    setMateriaux([
      ...materiaux,
      {
        id: 'mat-' + Date.now(),
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
      alert('Un devis doit comporter au moins une ligne de matériau ou fourniture.');
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

  // Build the temporary devis object
  const currentDevisObject: Devis = {
    id: 'dev-' + Date.now(),
    numero: numeroDevis,
    clientId: selectedClient?.id || 'cli-unknown',
    clientNom: selectedClient?.nom || 'Client Particulier',
    clientTelephone: selectedClient?.telephone || '+221 77 000 00 00',
    clientAdresse: selectedClient?.adresse || selectedClient?.ville || 'Dakar',
    titreChantier,
    dateEmission,
    dateValidite: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    materiaux,
    mainOeuvre,
    transportLogistique: transport,
    appliquerTva: profile.est_formel ? appliquerTva : false,
    statut: 'brouillon',
    modalitePaiement,
  };

  const totaux = calculerTotaux(
    materiaux,
    mainOeuvre.montant,
    transport,
    profile.est_formel,
    appliquerTva,
    profile.tvaTaux
  );

  const handleSave = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client destinataire pour ce devis.');
      return;
    }
    const hasAtLeastOneItem = materiaux.some((m) => m.description.trim() !== '') || (mainOeuvre.description.trim() !== '' && mainOeuvre.montant > 0);
    if (!hasAtLeastOneItem) {
      alert('Veuillez renseigner au moins un produit, matériau ou prestation de main d’œuvre.');
      return;
    }
    onSaveDevis(currentDevisObject);
  };

  const handlePreview = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client destinataire avant d’afficher l’aperçu.');
      return;
    }
    onPreviewDevis(currentDevisObject);
  };

  return (
    <div className="space-y-5 pb-36 pt-1 max-w-2xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-bold text-slate-900 leading-tight">Nouveau Devis</h2>
          <span className="text-xs text-slate-500 font-medium">BTP Sénégal</span>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 flex items-center justify-center transition active:scale-95"
          title="Sauvegarder"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {/* Status Context Ribbon */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-semibold tracking-wide uppercase text-[10px]">
            Brouillon
          </span>
          <span className="font-bold text-slate-800">{numeroDevis}</span>
        </div>
        <span className="text-slate-500 font-medium">Date : {dateEmission}</span>
      </div>

      {/* 1. Destinataire du Devis */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Destinataire du devis
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

        {/* Client dropdown */}
        <select
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className={`w-full h-12 px-3.5 rounded-xl border text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] transition ${
            !selectedClientId ? 'text-slate-400 border-slate-300' : 'text-slate-900 border-slate-200'
          }`}
        >
          <option value="" disabled>-- Choisir un client pour ce devis --</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id} className="text-slate-900">
              {c.nom} — {c.telephone} ({c.ville})
            </option>
          ))}
        </select>

        {selectedClient && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">{selectedClient.nom}</p>
              <p className="text-slate-500">{selectedClient.adresse || selectedClient.ville}</p>
            </div>
            <span className="font-medium text-[#1E3A8A]">{selectedClient.telephone}</span>
          </div>
        )}

        {/* Worksite Name input */}
        <div className="pt-1">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Intitulé du chantier
          </label>
          <input
            type="text"
            value={titreChantier}
            onChange={(e) => setTitreChantier(e.target.value)}
            placeholder="Ex: Rénovation carrelage & plomberie SDB"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </section>

      {/* 2. Matériaux & Fournitures (Lignes dynamiques ouvertes) */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Matériaux & Prestations
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

        {/* List of Materials Items with open, dedicated input fields */}
        <div className="space-y-4">
          {materiaux.map((mat, index) => {
            const lineSubtotal = (mat.quantite || 0) * (mat.prixUnitaire || 0);

            return (
              <div
                key={mat.id}
                className="p-3.5 rounded-2xl border-2 border-slate-200/90 bg-white relative space-y-3 shadow-xs hover:border-[#1E3A8A]/50 transition"
              >
                {/* Header de la ligne avec numéro et bouton supprimer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E3A8A] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[11px] font-bold">
                      {index + 1}
                    </span>
                    <span>Ligne {index + 1}</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemoveMateriau(mat.id)}
                    className="h-7 px-2.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-1 text-xs transition"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-medium">Supprimer</span>
                  </button>
                </div>

                {/* CHAMP 1 : Nom du produit */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Nom du produit / Matériau <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mat.description}
                    onChange={(e) => handleUpdateMateriau(mat.id, 'description', e.target.value)}
                    placeholder="Ex: Carrelage 60×60, Ciment CPJ 35, Tuyau Ø20..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                  />
                  <input
                    type="text"
                    value={mat.details || ''}
                    onChange={(e) => handleUpdateMateriau(mat.id, 'details', e.target.value)}
                    placeholder="Détails / Spécification (optionnel, ex: Grès cérame poli)"
                    className="w-full h-8 px-3 mt-1.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                  />
                </div>

                {/* CHAMPS 2, 3, 4 : Quantité, Prix unitaire, Total par ligne */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-2 border-t border-slate-100 items-end">
                  {/* CHAMP 2 : Quantité */}
                  <div className="sm:col-span-5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Quantité <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {/* Contrôles tactiles + et - avec champ numérique */}
                      <div className="flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleUpdateMateriau(mat.id, 'quantite', Math.max(1, (Number(mat.quantite) || 1) - 1))}
                          className="w-9 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition text-sm font-bold shrink-0 border-r border-slate-200"
                          title="Diminuer la quantité (-1)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="1"
                          step="1"
                          required
                          value={mat.quantite || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateMateriau(mat.id, 'quantite', val === '' ? '' : parseFloat(val));
                          }}
                          placeholder="1"
                          className="w-14 h-11 text-center font-bold text-sm text-slate-900 focus:outline-none bg-transparent"
                        />

                        <button
                          type="button"
                          onClick={() => handleUpdateMateriau(mat.id, 'quantite', (Number(mat.quantite) || 0) + 1)}
                          className="w-9 h-11 flex items-center justify-center text-[#1E3A8A] hover:bg-blue-50 active:bg-blue-100 transition text-sm font-bold shrink-0 border-l border-slate-200"
                          title="Augmenter la quantité (+1)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <select
                        value={mat.unite}
                        onChange={(e) => handleUpdateMateriau(mat.id, 'unite', e.target.value)}
                        className="flex-1 min-w-[70px] h-11 px-2 rounded-xl border border-slate-300 bg-white font-semibold text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] shrink-0"
                      >
                        <option value="u">u (unité)</option>
                        <option value="m²">m²</option>
                        <option value="sac">sac</option>
                        <option value="ml">ml (mètre)</option>
                        <option value="lot">lot</option>
                        <option value="kg">kg</option>
                        <option value="barre">barre</option>
                        <option value="forfait">forfait</option>
                      </select>
                    </div>
                  </div>

                  {/* CHAMP 3 : Prix unitaire (FCFA) */}
                  <div className="sm:col-span-4">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Prix unitaire <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={mat.prixUnitaire || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleUpdateMateriau(mat.id, 'prixUnitaire', val === '' ? '' : parseFloat(val));
                        }}
                        placeholder="0"
                        className="w-full h-11 pl-3 pr-8 rounded-xl border border-slate-300 bg-white text-right font-bold text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                        F
                      </span>
                    </div>
                  </div>

                  {/* CHAMP 4 : Total par ligne */}
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Total par ligne
                    </label>
                    <div className="h-11 px-3 rounded-xl bg-blue-50/90 border border-blue-200 flex items-center justify-end">
                      <span className="font-extrabold text-sm text-[#1E3A8A] tracking-tight">
                        {formatFCFA(lineSubtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Large Add Button */}
        <button
          type="button"
          onClick={handleAddMateriau}
          className="w-full py-3 rounded-xl border-2 border-dashed border-[#1E3A8A]/40 bg-blue-50/50 hover:bg-blue-50 text-[#1E3A8A] text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une prestation ou matériau</span>
        </button>
      </section>

      {/* 3. Main d'œuvre & Pose (1 ligne dédiée) */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Main d'œuvre & Pose (1 ligne)
            </h3>
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] font-bold text-[11px] flex items-center justify-center">
              1
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-500">Artisan Qualifié</span>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
              Désignation de la pose
            </label>
            <input
              type="text"
              value={mainOeuvre.description}
              onChange={(e) => setMainOeuvre({ ...mainOeuvre, description: e.target.value })}
              placeholder="Ex: Pose carrelage sol, étanchéité et raccordement"
              className="w-full text-xs sm:text-sm font-bold text-slate-900 border-0 p-0 focus:ring-0 focus:outline-none"
            />
            <input
              type="text"
              value={mainOeuvre.details || ''}
              onChange={(e) => setMainOeuvre({ ...mainOeuvre, details: e.target.value })}
              placeholder="Détails (ex: Préparation chape & équipe 2 techniciens)"
              className="w-full text-xs text-slate-500 border-0 p-0 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 bg-slate-50 p-2.5 rounded-lg text-xs items-end">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                Type de facturation
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMainOeuvre({ ...mainOeuvre, typeTarif: 'Forfait' })}
                  className={`h-7 px-2.5 rounded-md font-semibold text-xs flex items-center justify-center transition ${
                    mainOeuvre.typeTarif === 'Forfait'
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Forfait
                </button>
                <button
                  type="button"
                  onClick={() => setMainOeuvre({ ...mainOeuvre, typeTarif: 'Journalier' })}
                  className={`h-7 px-2.5 rounded-md font-semibold text-xs flex items-center justify-center transition ${
                    mainOeuvre.typeTarif === 'Journalier'
                      ? 'bg-[#1E3A8A] text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Journalier
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">
                Montant (FCFA)
              </span>
              <div className="relative inline-flex items-center">
                <input
                  type="number"
                  step="1000"
                  min="0"
                  value={mainOeuvre.montant || ''}
                  onChange={(e) => setMainOeuvre({ ...mainOeuvre, montant: e.target.value === '' ? 0 : Number(e.target.value) })}
                  placeholder="0"
                  className="w-24 sm:w-28 h-7 px-2 pr-5 rounded-md border border-slate-300 text-right font-bold text-xs bg-white text-[#1E3A8A] focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] shadow-2xs"
                />
                <span className="absolute right-1.5 text-[10px] font-bold text-slate-400 pointer-events-none">
                  F
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Récapitulatif avec toggle TVA 18% */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1E3A8A]" />
            Récapitulatif Financier
          </h3>
          <span className="text-[11px] font-semibold text-slate-500">Devis Standard BTP</span>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex justify-between items-center">
            <span>Sous-total Fournitures & Matériaux</span>
            <span className="font-semibold text-slate-900">
              {formatFCFA(totaux.sousTotalMateriaux)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span>Sous-total Main d'œuvre</span>
            <span className="font-semibold text-slate-900">
              {formatFCFA(totaux.sousTotalMainOeuvre)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              Transport & Logistique chantier
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="1000"
                value={transport}
                onChange={(e) => setTransport(Number(e.target.value))}
                className="w-20 h-7 text-right px-1 text-xs border border-slate-200 rounded"
              />
              <span className="text-slate-400 text-[10px]">FCFA</span>
            </div>
          </div>

          {/* Toggle TVA 18% (MANDATORY RULE) */}
          {profile.est_formel ? (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between mt-2">
              <div>
                <div className="flex items-center gap-1.5 font-bold text-xs text-[#1E3A8A]">
                  <Percent className="w-4 h-4" />
                  <span>Appliquer la TVA légale (18%)</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Requis pour les entreprises formelles au Sénégal (NINEA {profile.ninea})
                </p>
              </div>

              {/* Switch Toggle */}
              <button
                type="button"
                onClick={() => setAppliquerTva(!appliquerTva)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
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
          ) : (
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 mt-2">
              <p className="font-semibold flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                Devis en franchise de TVA (Régime Informel sénégalais / CGM)
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                La TVA 18% et les mentions NINEA/RCCM sont masquées conformément à votre statut informel.
              </p>
            </div>
          )}

          {profile.est_formel && appliquerTva && (
            <div className="flex justify-between items-center text-xs font-medium text-slate-700 pt-1">
              <span>Montant TVA (18%)</span>
              <span className="font-bold text-[#1E3A8A]">{formatFCFA(totaux.tva)}</span>
            </div>
          )}
        </div>

        {/* Big Total Box */}
        <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-md">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              {profile.est_formel && appliquerTva ? 'Net Commercial TTC' : 'Total Net à Payer'}
            </span>
            <span className="text-base font-extrabold tracking-tight">TOTAL DEVIS</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {formatFCFA(totaux.totalTtc)}
            </span>
          </div>
        </div>

        {/* Payment Terms Input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Modalité de règlement
          </label>
          <input
            type="text"
            value={modalitePaiement}
            onChange={(e) => setModalitePaiement(e.target.value)}
            placeholder="Ex: 50% avance • 50% réception des travaux"
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
      </section>

      {/* Floating Bottom Action Buttons */}
      <div className="fixed bottom-4 inset-x-0 z-40 max-w-md mx-auto px-4 flex items-center gap-3">
        {/* Aperçu PDF */}
        <button
          type="button"
          onClick={handlePreview}
          className="flex-1 h-12 rounded-xl bg-white hover:bg-slate-50 text-[#1E3A8A] font-bold text-xs sm:text-sm border border-slate-200 flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-[0.98] transition"
        >
          <Eye className="w-4 h-4" />
          <span>Aperçu PDF</span>
        </button>

        {/* Enregistrer Devis */}
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-950/20 active:scale-[0.98] transition"
        >
          <Check className="w-4 h-4" />
          <span>Enregistrer</span>
        </button>
      </div>
    </div>
  );
};
