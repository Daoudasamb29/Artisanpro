import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Plus, 
  BarChart3, 
  FileText, 
  Users, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ArtisanProfile, Client, Devis, Facture, TabDestination } from '../types';
import { formatFCFA } from '../utils/formatters';

interface DashboardScreenProps {
  profile: ArtisanProfile;
  clients: Client[];
  devis: Devis[];
  factures: Facture[];
  onNavigate: (tab: TabDestination) => void;
  onOpenCreateDevis: () => void;
  onOpenCreateFacture: () => void;
  onOpenCreateClient: () => void;
  onPreviewDevis: (d: Devis) => void;
  onPreviewFacture: (f: Facture) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  clients,
  devis,
  factures,
  onNavigate,
  onOpenCreateDevis,
  onOpenCreateFacture,
  onOpenCreateClient,
  onPreviewDevis,
  onPreviewFacture,
}) => {
  const [showAmount, setShowAmount] = useState(true);

  // Compute live metrics
  const totalEncaisseCeMois = factures
    .filter((f) => f.statut === 'payee')
    .reduce((sum, f) => {
      const itemsTot = f.materiaux.reduce((s, m) => s + m.quantite * m.prixUnitaire, 0);
      const ht = itemsTot + (f.mainOeuvre?.montant || 0) + (f.transportLogistique || 0);
      const tva = profile.est_formel && f.appliquerTva ? Math.round(ht * profile.tvaTaux) : 0;
      return sum + ht + tva;
    }, 0);

  const devisEnCours = devis.filter((d) => d.statut === 'envoye' || d.statut === 'brouillon').length;
  const devisAcceptes = devis.filter((d) => d.statut === 'accepte').length;

  const facturesImpayees = factures.filter((f) => f.statut === 'impayee' || f.statut === 'en_retard');
  const totalImpayes = facturesImpayees.reduce((sum, f) => {
    const itemsTot = f.materiaux.reduce((s, m) => s + m.quantite * m.prixUnitaire, 0);
    const ht = itemsTot + (f.mainOeuvre?.montant || 0) + (f.transportLogistique || 0);
    const tva = profile.est_formel && f.appliquerTva ? Math.round(ht * profile.tvaTaux) : 0;
    return sum + ht + tva;
  }, 0);

  const invoiceButtonLabel = profile.est_formel ? 'Facture pro' : 'Reçu pro';

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Greeting Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            Bonjour, {profile.nomArtisan.split(' ')[0]} <span>👋</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {profile.nomEntreprise} • {profile.est_formel ? 'Entreprise Formelle' : 'Artisan Indépendant'}
          </p>
        </div>
      </div>

      {/* Primary Hero Revenue Card */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1A337E] to-[#0F1E4A] p-5 text-white shadow-xl shadow-blue-900/15 overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-blue-400/15 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-sky-400/10 rounded-full blur-xl pointer-events-none"></div>

        {/* Card Header Info */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center space-x-2 text-blue-200">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {profile.est_formel ? "Chiffre d'affaires ce mois" : 'Encaissements du mois'}
            </span>
            <button
              type="button"
              onClick={() => setShowAmount(!showAmount)}
              className="text-blue-200/80 hover:text-white transition-colors"
              aria-label={showAmount ? 'Masquer' : 'Afficher'}
            >
              {showAmount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Trend Chip */}
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+14.5%</span>
          </div>
        </div>

        {/* Big Highlight Amount */}
        <div className="relative z-10 mb-4">
          <div className="text-[32px] font-extrabold tracking-tight leading-none text-white">
            {showAmount ? formatFCFA(totalEncaisseCeMois || 450000) : '•••••••• FCFA'}
          </div>
          <p className="text-[11px] text-blue-200/80 mt-1.5">
            Dakar & Banlieue • {factures.filter((f) => f.statut === 'payee').length} factures encaissées
          </p>
        </div>

        {/* Inner Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1 relative z-10">
          <button
            type="button"
            onClick={onOpenCreateFacture}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white text-[#1E3A8A] font-bold text-xs shadow-sm hover:bg-blue-50 active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4 text-blue-600" />
            <span>+ Encaisser</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('compta')}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs backdrop-blur-sm border border-white/15 active:scale-[0.98] transition"
          >
            <BarChart3 className="w-4 h-4 text-blue-200" />
            <span>Voir les bilans</span>
          </button>
        </div>
      </section>

      {/* 2 Key Metric Cards */}
      <section className="grid grid-cols-2 gap-3">
        {/* Devis en cours */}
        <div
          onClick={() => onNavigate('devis')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Devis en cours
            </span>
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-slate-900 leading-none">
              {devisEnCours || 3}
            </span>
            <span className="text-[11px] font-medium text-slate-400">à relancer</span>
          </div>
          <div className="mt-2.5 flex items-center text-[10.5px] font-semibold text-blue-700 bg-blue-50 rounded-md px-2 py-0.5 w-max">
            <span>{devisAcceptes || 2} acceptés cette semaine</span>
          </div>
        </div>

        {/* Factures impayées */}
        <div
          onClick={() => onNavigate('factures')}
          className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm flex flex-col justify-between cursor-pointer hover:border-amber-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Impayés
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-amber-600 leading-none">
              {facturesImpayees.length || 2}
            </span>
            <span className="text-[11px] font-medium text-slate-400">clients</span>
          </div>
          <div className="mt-2.5 flex items-center text-[10.5px] font-semibold text-amber-800 bg-amber-50 rounded-md px-2 py-0.5 w-max">
            <span>{formatFCFA(totalImpayes || 85000)} restants</span>
          </div>
        </div>
      </section>

      {/* Quick Actions (3 Buttons) */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Actions rapides
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          {/* Action 1: Devis */}
          <button
            type="button"
            onClick={onOpenCreateDevis}
            className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-1.5 shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Nouveau devis
            </span>
          </button>

          {/* Action 2: Client */}
          <button
            type="button"
            onClick={onOpenCreateClient}
            className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-1.5 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              Nouveau client
            </span>
          </button>

          {/* Action 3: Facture / Reçu */}
          <button
            type="button"
            onClick={onOpenCreateFacture}
            className="flex flex-col items-center p-2 rounded-2xl hover:bg-slate-50 active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-1.5 shadow-sm">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 leading-tight">
              {invoiceButtonLabel}
            </span>
          </button>
        </div>
      </section>

      {/* Chantiers & Récents Section */}
      <section className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">
            Chantiers & Récents
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('factures')}
            className="text-xs font-semibold text-[#1E3A8A] hover:underline"
          >
            Tout voir
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Job 1 */}
          <div 
            onClick={() => onNavigate('factures')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold text-xs shrink-0">
                VA
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Villa Almadies</p>
                <p className="text-[11px] text-slate-500 truncate">Rénovation carrelage • Moussa Diop</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block">94 400 F</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                Wave reçu
              </span>
            </div>
          </div>

          {/* Job 2 */}
          <div 
            onClick={() => onNavigate('devis')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                IM
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Immeuble Mermoz</p>
                <p className="text-[11px] text-slate-500 truncate">Plomberie sanitaire • Fatou Ndiaye</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block">320 000 F</span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                Devis validé
              </span>
            </div>
          </div>

          {/* Job 3 */}
          <div 
            onClick={() => onNavigate('factures')}
            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                RP
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">Résidence Plateau</p>
                <p className="text-[11px] text-slate-500 truncate">Électricité tableau • Abdoulaye Fall</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-slate-900 block">120 000 F</span>
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                Échéance +7j
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
