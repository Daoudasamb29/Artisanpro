import React, { useState } from 'react';
import { 
  Plus, 
  Hourglass, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Download, 
  Send, 
  Eye, 
  Mic, 
  Play, 
  Check, 
  Search,
  MapPin,
  X
} from 'lucide-react';
import { Facture, ArtisanProfile, StatutFacture } from '../types';
import { formatFCFA, formatFrenchDate, buildWhatsAppLink, calculerTotaux } from '../utils/formatters';

interface FacturesListScreenProps {
  factures: Facture[];
  profile: ArtisanProfile;
  onOpenCreateFacture: () => void;
  onPreviewFacture: (facture: Facture) => void;
  onMarkAsPaid: (factureId: string) => void;
}

export const FacturesListScreen: React.FC<FacturesListScreenProps> = ({
  factures,
  profile,
  onOpenCreateFacture,
  onPreviewFacture,
  onMarkAsPaid,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'payee' | 'impayee' | 'en_retard'>('all');
  const [playingVoiceNote, setPlayingVoiceNote] = useState(false);

  const isFormal = profile.est_formel;
  const screenTitle = isFormal ? 'Factures' : 'Reçus';
  const newButtonLabel = isFormal ? 'Nouvelle' : 'Nouveau';

  // Compute live totals
  const facturesPayees = factures.filter((f) => f.statut === 'payee');
  const facturesImpayees = factures.filter((f) => f.statut === 'impayee' || f.statut === 'en_retard');

  const totalEncaisse = facturesPayees.reduce((sum, f) => {
    const tot = calculerTotaux(f.materiaux, f.mainOeuvre?.montant || 0, f.transportLogistique || 0, isFormal, f.appliquerTva, profile.tvaTaux);
    return sum + tot.totalTtc;
  }, 0);

  const totalAEncaisser = facturesImpayees.reduce((sum, f) => {
    const tot = calculerTotaux(f.materiaux, f.mainOeuvre?.montant || 0, f.transportLogistique || 0, isFormal, f.appliquerTva, profile.tvaTaux);
    return sum + tot.totalTtc;
  }, 0);

  // Filter list
  const filteredFactures = factures.filter((f) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      f.numero.toLowerCase().includes(q) ||
      f.clientNom.toLowerCase().includes(q) ||
      f.clientAdresse.toLowerCase().includes(q) ||
      f.titreChantier.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    return f.statut === activeFilter;
  });

  const handleToggleVoiceNote = () => {
    setPlayingVoiceNote(!playingVoiceNote);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {screenTitle}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
              {factures.length} actives
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Suivi des encaissements & relances</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateFacture}
          className="h-11 px-4 bg-[#1E3A8A] hover:bg-[#172554] active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{newButtonLabel}</span>
        </button>
      </div>

      {/* 2 Bento Micro-Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* À encaisser */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">À encaisser</span>
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Hourglass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold text-amber-700 tracking-tight block">
              {formatFCFA(totalAEncaisser || 165000)}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {facturesImpayees.length} clients concernés
            </span>
          </div>
        </div>

        {/* Encaissé du mois */}
        <div className="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-emerald-800">Encaissé (Mois)</span>
            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-lg font-extrabold text-emerald-700 tracking-tight block">
              {formatFCFA(totalEncaisse || 380400)}
            </span>
            <span className="text-[11px] text-emerald-600/80 mt-0.5 block">
              {facturesPayees.length} soldées
            </span>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Rechercher par client, n° ${isFormal ? 'facture' : 'reçu'}...`}
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes ({factures.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('payee')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'payee'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Payées ({facturesPayees.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('impayee')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'impayee'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Impayées ({factures.filter((f) => f.statut === 'impayee').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('en_retard')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'en_retard'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>En retard ({factures.filter((f) => f.statut === 'en_retard').length})</span>
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-2">
        {filteredFactures.map((item) => {
          const totaux = calculerTotaux(
            item.materiaux,
            item.mainOeuvre?.montant || 0,
            item.transportLogistique || 0,
            isFormal,
            item.appliquerTva,
            profile.tvaTaux
          );

          const initials = item.clientNom
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const waUrl = buildWhatsAppLink(
            item.clientTelephone,
            `Bonjour ${item.clientNom}, ceci est un rappel concernant votre ${isFormal ? 'facture' : 'reçu'} ${profile.nomEntreprise} N° ${item.numero} d'un montant de ${formatFCFA(totaux.totalTtc)}.`
          );

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-200/80 flex flex-col gap-2 hover:border-[#1E3A8A] transition"
            >
              {/* Header row: Reference & Status */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-slate-500 text-[11px]">
                  <span>{item.numero}</span>
                  <span>•</span>
                  <span>{formatFrenchDate(item.dateEmission)}</span>
                </div>

                <div>
                  {item.statut === 'payee' && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold flex items-center gap-1 text-[10px]">
                      <Check className="w-3 h-3" />
                      Payée
                    </span>
                  )}
                  {item.statut === 'impayee' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3" />
                      Impayée
                    </span>
                  )}
                  {item.statut === 'en_retard' && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold flex items-center gap-1 text-[10px]">
                      <AlertTriangle className="w-3 h-3" />
                      En retard (+7j)
                    </span>
                  )}
                </div>
              </div>

              {/* Client & Amount */}
              <div className="flex items-center justify-between pt-0.5 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      item.statut === 'en_retard'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-[#1E3A8A]'
                    }`}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.clientNom}
                    </h3>
                    <div className="flex items-center gap-0.5 text-[11px] text-slate-500 mt-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.clientAdresse || 'Dakar'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-extrabold tracking-tight block ${
                      item.statut === 'en_retard' ? 'text-rose-600' : 'text-[#1E3A8A]'
                    }`}
                  >
                    {formatFCFA(totaux.totalTtc)}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {item.statut === 'payee'
                      ? item.modePaiement
                      : `Éch. ${formatFrenchDate(item.dateEcheance || item.dateEmission)}`}
                  </span>
                </div>
              </div>

              {/* Worksite name / Acompte indicator */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.titreChantier && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md truncate flex items-center gap-1 font-medium max-w-[220px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                    <span className="truncate">{item.titreChantier}</span>
                  </div>
                )}
                {item.estAcompte && item.soldeRestantDu !== undefined && item.soldeRestantDu > 0 && (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md shrink-0">
                    Acompte • Reste {formatFCFA(item.soldeRestantDu)}
                  </span>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 gap-1.5">
                {/* PDF button */}
                <button
                  type="button"
                  onClick={() => onPreviewFacture(item)}
                  className="h-7 sm:h-8 px-2 sm:px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                >
                  <Eye className="w-3 h-3 text-[#1E3A8A]" />
                  <span>{isFormal ? 'Facture PDF' : 'Reçu PDF'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {/* Mark as paid button if unpaid */}
                  {item.statut !== 'payee' && (
                    <button
                      type="button"
                      onClick={() => onMarkAsPaid(item.id)}
                      className="h-7 sm:h-8 px-2 sm:px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Check className="w-3 h-3" />
                      <span>Encaissé</span>
                    </button>
                  )}

                  {/* Relance button */}
                  {item.statut !== 'payee' && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95 transition ${
                        item.statut === 'en_retard'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-50 text-[#1E3A8A] hover:bg-blue-100'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      <span>{item.statut === 'en_retard' ? 'Relance' : 'Relancer'}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredFactures.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Aucune facture trouvée</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre première facture ou reçu d'encaissement.</p>
          </div>
        )}
      </div>

      {/* Note vocale mémo card (as in Image 1) */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Mic className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">Note vocale mémo chantier</p>
            <p className="text-[11px] text-slate-500 truncate">
              {playingVoiceNote
                ? '▶ Lecture en cours : "Rappeler Moussa après livraison du disjoncteur"'
                : 'Rappeler Moussa après livraison du disjoncteur'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleVoiceNote}
          className="w-9 h-9 rounded-full bg-white text-[#1E3A8A] hover:bg-blue-100 flex items-center justify-center shadow-xs transition active:scale-95 shrink-0"
          aria-label="Écouter la note"
        >
          {playingVoiceNote ? <Clock className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  );
};
