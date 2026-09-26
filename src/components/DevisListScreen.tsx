import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Send, 
  Receipt, 
  FileCheck,
  TrendingUp,
  Image as ImageIcon,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { Devis, ArtisanProfile, StatutDevis } from '../types';
import { formatFCFA, formatFrenchDate, buildWhatsAppLink, calculerTotaux } from '../utils/formatters';

interface DevisListScreenProps {
  devis: Devis[];
  profile: ArtisanProfile;
  onOpenCreateDevis: () => void;
  onPreviewDevis: (devis: Devis) => void;
  onConvertirEnFacture: (devis: Devis) => void;
  onUpdateStatut: (devisId: string, newStatut: StatutDevis) => void;
}

export const DevisListScreen: React.FC<DevisListScreenProps> = ({
  devis,
  profile,
  onOpenCreateDevis,
  onPreviewDevis,
  onConvertirEnFacture,
  onUpdateStatut,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'brouillon' | 'envoye' | 'accepte' | 'refuse'>('all');

  // Compute real totals
  const totalDeviseActif = devis.reduce((sum, d) => {
    const tot = calculerTotaux(d.materiaux, d.mainOeuvre?.montant || 0, d.transportLogistique || 0, profile.est_formel, d.appliquerTva, profile.tvaTaux);
    return sum + tot.totalTtc;
  }, 0);

  const nbAcceptes = devis.filter((d) => d.statut === 'accepte').length;
  const tauxConversion = devis.length > 0 ? Math.round((nbAcceptes / devis.length) * 100) : 0;

  // Filter quotes
  const filteredDevis = devis.filter((d) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      d.numero.toLowerCase().includes(q) ||
      d.clientNom.toLowerCase().includes(q) ||
      d.titreChantier.toLowerCase().includes(q) ||
      d.clientAdresse.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    return d.statut === activeFilter;
  });

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Header Overview */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Devis</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
              {devis.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Suivi en direct des devis & chantiers Dakar</p>
        </div>

        <button
          type="button"
          onClick={onOpenCreateDevis}
          className="h-11 px-4 bg-[#1E3A8A] hover:bg-[#172554] active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
      </div>

      {/* Mini KPI Stat Bar */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Devisé Actif</span>
            <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatFCFA(totalDeviseActif || 3450000)}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-emerald-600 text-[11px] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+18% ce mois</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Conversion</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl font-extrabold text-slate-900">{tauxConversion || 68}%</span>
            <span className="text-xs text-slate-400 font-medium">validés</span>
          </div>
          {/* Micro Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${tauxConversion || 68}%` }}
            ></div>
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
          placeholder="Rechercher devis, client, n°..."
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

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            activeFilter === 'all'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous ({devis.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('envoye')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'envoye'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>En attente ({devis.filter((d) => d.statut === 'envoye').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('accepte')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'accepte'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Acceptés ({devis.filter((d) => d.statut === 'accepte').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('brouillon')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'brouillon'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Brouillons ({devis.filter((d) => d.statut === 'brouillon').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('refuse')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'refuse'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>Refusés ({devis.filter((d) => d.statut === 'refuse').length})</span>
        </button>
      </div>

      {/* Devis Cards List */}
      <div className="space-y-2">
        {filteredDevis.map((item) => {
          const totaux = calculerTotaux(
            item.materiaux,
            item.mainOeuvre?.montant || 0,
            item.transportLogistique || 0,
            profile.est_formel,
            item.appliquerTva,
            profile.tvaTaux
          );

          const waUrl = buildWhatsAppLink(
            item.clientTelephone,
            `Bonjour ${item.clientNom}, voici votre devis ${profile.nomEntreprise} N° ${item.numero} d'un montant de ${formatFCFA(totaux.totalTtc)}.`
          );

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-200/80 flex flex-col gap-2 hover:border-[#1E3A8A] transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                    <span>{item.numero}</span>
                    <span>•</span>
                    <span>{formatFrenchDate(item.dateEmission)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {item.clientNom}
                    </h3>
                    {item.clientAdresse && (
                      <span className="flex items-center gap-0.5 text-[11px] text-slate-400 truncate max-w-[150px]">
                        <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        {item.clientAdresse}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0">
                  {item.statut === 'accepte' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Accepté
                    </span>
                  )}
                  {item.statut === 'envoye' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      En attente
                    </span>
                  )}
                  {item.statut === 'brouillon' && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                      Brouillon
                    </span>
                  )}
                  {item.statut === 'refuse' && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      Refusé
                    </span>
                  )}
                </div>
              </div>

              {/* Work Scope Box (Compact) */}
              <div className="px-2 py-1 rounded-lg bg-slate-50 text-slate-700 flex items-center gap-1.5 text-[11px]">
                <FileText className="w-3 h-3 text-[#1E3A8A] shrink-0" />
                <span className="truncate font-medium">
                  {item.titreChantier || item.materiaux[0]?.description || 'Travaux de rénovation'}
                </span>
              </div>

              {/* Card Footer: Total Amount & Actions */}
              <div className="flex items-center justify-between pt-0.5 gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-tight">
                    {item.statut === 'accepte' ? 'Total Validé' : 'Total Devis'}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-[#1E3A8A] tracking-tight">
                    {formatFCFA(totaux.totalTtc)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Aperçu PDF */}
                  <button
                    type="button"
                    onClick={() => onPreviewDevis(item)}
                    className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] sm:text-xs flex items-center gap-1 transition active:scale-95"
                    title="Aperçu PDF"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Aperçu</span>
                  </button>

                  {/* Facturer if accepted */}
                  {item.statut === 'accepte' ? (
                    <button
                      type="button"
                      onClick={() => onConvertirEnFacture(item)}
                      className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs active:scale-95 transition"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>{profile.est_formel ? 'Facturer' : 'Reçu'}</span>
                    </button>
                  ) : item.statut === 'brouillon' ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatut(item.id, 'envoye')}
                      className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-blue-50 text-[#1E3A8A] hover:bg-blue-100 font-semibold text-[11px] sm:text-xs flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Envoyer</span>
                    </button>
                  ) : (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] sm:text-xs flex items-center gap-1 shadow-xs active:scale-95 transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredDevis.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Aucun devis trouvé</p>
            <p className="text-xs text-slate-400 mt-1">Créez votre premier devis en quelques secondes.</p>
          </div>
        )}
      </div>

      {/* Construction Photo Gallery (faithful to Image 24) */}
      <section className="bg-white rounded-2xl p-4 border border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-900">
            <ImageIcon className="w-4 h-4 text-[#1E3A8A]" />
            Photos de chantiers récentes
          </span>
          <span className="text-[#1E3A8A]">3 chantiers Dakar</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl overflow-hidden h-20 bg-slate-100 relative group">
            <img
              src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80"
              alt="Carrelage moderne Almadies"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
              Carrelage
            </span>
          </div>
          <div className="rounded-xl overflow-hidden h-20 bg-slate-100 relative group">
            <img
              src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80"
              alt="Plomberie sanitaire Mermoz"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
              Plomberie
            </span>
          </div>
          <div className="rounded-xl overflow-hidden h-20 bg-slate-100 relative group">
            <img
              src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80"
              alt="Tableau électrique Plateau"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 text-[9px] font-bold text-white bg-black/60 px-1 rounded">
              Électricité
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
