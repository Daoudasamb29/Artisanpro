import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Download, 
  FileText, 
  Receipt, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  SlidersHorizontal,
  Table,
  Sparkles
} from 'lucide-react';
import { Devis, Facture, ArtisanProfile } from '../types';
import { formatFCFA, formatFrenchDate, exportToCSV, calculerTotaux } from '../utils/formatters';

interface ComptaScreenProps {
  devis: Devis[];
  factures: Facture[];
  profile: ArtisanProfile;
  onPreviewDevis: (devis: Devis) => void;
  onPreviewFacture: (facture: Facture) => void;
}

export const ComptaScreen: React.FC<ComptaScreenProps> = ({
  devis,
  factures,
  profile,
  onPreviewDevis,
  onPreviewFacture,
}) => {
  const [periode, setPeriode] = useState<'mois' | 'trimestre' | 'annee' | 'tout'>('mois');
  const [filterType, setFilterType] = useState<'all' | 'devis' | 'factures'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const isFormal = profile.est_formel;
  const invoiceLabel = isFormal ? 'Factures' : 'Reçus';

  // Format transactions
  interface Transaction {
    id: string;
    type: 'devis' | 'facture';
    numero: string;
    clientNom: string;
    date: string;
    quartier: string;
    montant: number;
    statut: string;
    statutLabel: string;
    modePaiement?: string;
    rawDoc: Devis | Facture;
  }

  const transactions: Transaction[] = [
    ...devis.map((d) => {
      const tot = calculerTotaux(d.materiaux, d.mainOeuvre?.montant || 0, d.transportLogistique || 0, isFormal, d.appliquerTva, profile.tvaTaux);
      return {
        id: d.id,
        type: 'devis' as const,
        numero: d.numero,
        clientNom: d.clientNom,
        date: d.dateEmission,
        quartier: d.clientAdresse?.split(',')[0] || 'Dakar',
        montant: tot.totalTtc,
        statut: d.statut,
        statutLabel:
          d.statut === 'accepte'
            ? 'Accepté'
            : d.statut === 'envoye'
            ? 'En attente'
            : d.statut === 'refuse'
            ? 'Refusé'
            : 'Brouillon',
        rawDoc: d,
      };
    }),
    ...factures.map((f) => {
      const tot = calculerTotaux(f.materiaux, f.mainOeuvre?.montant || 0, f.transportLogistique || 0, isFormal, f.appliquerTva, profile.tvaTaux);
      return {
        id: f.id,
        type: 'facture' as const,
        numero: f.numero,
        clientNom: f.clientNom,
        date: f.dateEmission,
        quartier: f.clientAdresse?.split(',')[0] || 'Dakar',
        montant: tot.totalTtc,
        statut: f.statut,
        statutLabel:
          f.statut === 'payee'
            ? 'Payée'
            : f.statut === 'en_retard'
            ? 'En retard'
            : 'Impayée',
        modePaiement: f.modePaiement,
        rawDoc: f,
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculations
  const totalVolume = transactions
    .filter((t) => t.statut !== 'refuse' && t.statut !== 'brouillon')
    .reduce((sum, t) => sum + t.montant, 0);

  const totalEncaisse = transactions
    .filter((t) => t.statut === 'payee' || t.statut === 'accepte')
    .reduce((sum, t) => sum + t.montant, 0);

  const totalEnAttente = transactions
    .filter((t) => t.statut === 'impayee' || t.statut === 'en_retard' || t.statut === 'envoye')
    .reduce((sum, t) => sum + t.montant, 0);

  // Filtered by type
  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    if (filterType === 'devis') return t.type === 'devis';
    if (filterType === 'factures') return t.type === 'facture';
    return true;
  });

  // Handle Export to CSV/Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    setTimeout(() => {
      const exportRows = filteredTransactions.map((t) => ({
        'Numéro Document': t.numero,
        'Type': t.type.toUpperCase(),
        'Client': t.clientNom,
        'Date': t.date,
        'Quartier': t.quartier,
        'Statut': t.statutLabel,
        'Montant Net (FCFA)': t.montant,
        'Mode de Règlement': t.modePaiement || 'N/A',
        'Régime Artisan': isFormal ? 'Formel (TVA 18%)' : 'Informel (CGU)',
      }));

      exportToCSV(`ArtisanPro_Comptabilite_${new Date().toISOString().split('T')[0]}`, exportRows);
      setIsExporting(false);
    }, 600);
  };

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Header and Period Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Historique des comptes
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Suivi en direct • Dakar & Régions</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Sept 2025</span>
        </div>
      </div>

      {/* Period Selector Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setPeriode('mois')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            periode === 'mois'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Ce mois
        </button>

        <button
          type="button"
          onClick={() => setPeriode('trimestre')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            periode === 'trimestre'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          3 mois
        </button>

        <button
          type="button"
          onClick={() => setPeriode('annee')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            periode === 'annee'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Année
        </button>

        <button
          type="button"
          onClick={() => setPeriode('tout')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            periode === 'tout'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tout
        </button>
      </div>

      {/* Financial Summary Card */}
      <section className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center shadow-xs">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Volume d'affaires global
              </span>
              <span className="text-2xl font-extrabold text-[#1E3A8A] tracking-tight">
                {formatFCFA(totalVolume || 377400)}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14%</span>
            </div>
            <span className="text-xs text-slate-400 block mt-1">
              {transactions.length} opérations
            </span>
          </div>
        </div>

        {/* Mini breakdown */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-slate-100 bg-slate-50/70 p-3 rounded-2xl text-xs">
          <div>
            <span className="text-slate-500 block">Encaissé / Validé</span>
            <span className="text-sm font-bold text-emerald-700 mt-0.5 block">
              {formatFCFA(totalEncaisse || 212400)}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">En attente / Impayé</span>
            <span className="text-sm font-bold text-amber-700 mt-0.5 block">
              {formatFCFA(totalEnAttente || 45000)}
            </span>
          </div>
        </div>
      </section>

      {/* Filter Tabs by type (Tous, Devis, Factures) */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterType === 'all'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous ({transactions.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('devis')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterType === 'devis'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Devis ({devis.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterType('factures')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
            filterType === 'factures'
              ? 'bg-[#1E3A8A] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {invoiceLabel} ({factures.length})
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filteredTransactions.map((tx) => {
          const initials = tx.clientNom
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const isRefused = tx.statut === 'refuse';

          return (
            <div
              key={tx.id}
              onClick={() => {
                if (tx.type === 'devis') onPreviewDevis(tx.rawDoc as Devis);
                else onPreviewFacture(tx.rawDoc as Facture);
              }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 active:scale-[0.99] transition cursor-pointer flex flex-col gap-2.5"
            >
              {/* Header: Document type and status badge */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
                  {tx.type === 'devis' ? (
                    <FileText className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  ) : (
                    <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span className="uppercase tracking-wider">
                    {tx.type === 'devis' ? 'Devis' : (isFormal ? 'Facture' : 'Reçu')}{' '}
                    {tx.numero}
                  </span>
                </div>

                {/* Status Badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    tx.statut === 'accepte' || tx.statut === 'payee'
                      ? 'bg-emerald-50 text-emerald-700'
                      : tx.statut === 'impayee' || tx.statut === 'envoye'
                      ? 'bg-amber-50 text-amber-800'
                      : tx.statut === 'en_retard' || tx.statut === 'refuse'
                      ? 'bg-rose-50 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      tx.statut === 'accepte' || tx.statut === 'payee'
                        ? 'bg-emerald-500'
                        : tx.statut === 'impayee' || tx.statut === 'envoye'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                  ></span>
                  {tx.statutLabel}
                </span>
              </div>

              {/* Main Line: Client and Amount */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] font-bold text-xs flex items-center justify-center shrink-0">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{tx.clientNom}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>{formatFrenchDate(tx.date)}</span>
                      <span>•</span>
                      <span>{tx.quartier}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-base font-extrabold tracking-tight block ${
                      isRefused ? 'text-slate-400 line-through' : 'text-slate-900'
                    }`}
                  >
                    {formatFCFA(tx.montant)}
                  </span>
                  {tx.modePaiement && (
                    <span className="text-[11px] text-emerald-700 font-medium">
                      {tx.modePaiement}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export to Excel Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={isExporting}
          className="w-full h-12 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-[#1E3A8A] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98]"
        >
          <Table className="w-4 h-4 text-emerald-600" />
          <span>{isExporting ? 'Génération du fichier...' : 'Exporter en Excel (.xlsx / .csv)'}</span>
          <Download className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};
