import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  MessageSquare, 
  ChevronRight, 
  MapPin, 
  X, 
  Building, 
  Briefcase,
  Star,
  CheckCircle,
  Plus,
  FileText,
  Receipt,
  Eye,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  History,
  Check,
  AlertTriangle
} from 'lucide-react';
import { Client, Devis, Facture, ArtisanProfile } from '../types';
import { cleanSenegalPhone, buildWhatsAppLink, formatFCFA, formatFrenchDate, calculerTotaux } from '../utils/formatters';

interface ClientsScreenProps {
  clients: Client[];
  devisList?: Devis[];
  facturesList?: Facture[];
  profile?: ArtisanProfile;
  onAddClient: (newClient: Omit<Client, 'id' | 'dateAjout'>) => void;
  onSelectClientForDevis?: (client: Client) => void;
  onSelectClientForFacture?: (client: Client) => void;
  onPreviewDevis?: (devis: Devis) => void;
  onPreviewFacture?: (facture: Facture) => void;
  isOpenAddModalDirectly?: boolean;
  onCloseAddModalDirectly?: () => void;
}

export const ClientsScreen: React.FC<ClientsScreenProps> = ({
  clients,
  devisList = [],
  facturesList = [],
  profile,
  onAddClient,
  onSelectClientForDevis,
  onSelectClientForFacture,
  onPreviewDevis,
  onPreviewFacture,
  isOpenAddModalDirectly = false,
  onCloseAddModalDirectly,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'chantier' | 'devis' | 'vip'>('all');
  const [isModalOpen, setIsModalOpen] = useState(isOpenAddModalDirectly);

  // Client selected to view their detailed history
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [historyTab, setHistoryTab] = useState<'all' | 'devis' | 'factures'>('all');

  // Form State for new client
  const [nom, setNom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('Dakar');
  const [type, setType] = useState<'Particulier' | 'Entreprise'>('Particulier');
  const [notes, setNotes] = useState('');

  const isFormal = profile?.est_formel ?? true;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onCloseAddModalDirectly) onCloseAddModalDirectly();
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !telephone.trim()) return;

    onAddClient({
      nom: nom.trim(),
      telephone: telephone.startsWith('+221') ? telephone : `+221 ${telephone}`,
      adresse: adresse.trim() || 'Dakar',
      ville: ville.trim() || 'Dakar',
      type,
      notes: notes.trim(),
      statutChantier: 'Chantier',
    });

    // Reset
    setNom('');
    setTelephone('');
    setAdresse('');
    setNotes('');
    handleCloseModal();
  };

  // Filtered clients list
  const filteredClients = clients.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.nom.toLowerCase().includes(q) ||
      c.telephone.includes(q) ||
      c.ville.toLowerCase().includes(q) ||
      c.adresse.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeFilter === 'all') return true;
    if (activeFilter === 'chantier') return c.statutChantier === 'Chantier' || c.statutChantier === 'Rénovation';
    if (activeFilter === 'devis') return c.statutChantier === 'Devis envoyé';
    if (activeFilter === 'vip') return c.type === 'Entreprise' || c.statutChantier === 'Terminé';
    return true;
  });

  // Calculate stats for the selected client in history
  const clientDevis = selectedClientForHistory
    ? devisList.filter(
        (d) =>
          d.clientId === selectedClientForHistory.id ||
          d.clientNom?.trim().toLowerCase() === selectedClientForHistory.nom?.trim().toLowerCase()
      )
    : [];

  const clientFactures = selectedClientForHistory
    ? facturesList.filter(
        (f) =>
          f.clientId === selectedClientForHistory.id ||
          f.clientNom?.trim().toLowerCase() === selectedClientForHistory.nom?.trim().toLowerCase()
      )
    : [];

  const totalDeviseClient = clientDevis.reduce((sum, d) => {
    const tot = calculerTotaux(d.materiaux, d.mainOeuvre?.montant || 0, d.transportLogistique || 0, isFormal, d.appliquerTva, profile?.tvaTaux || 0.18);
    return sum + tot.totalTtc;
  }, 0);

  const totalEncaisseClient = clientFactures
    .filter((f) => f.statut === 'payee')
    .reduce((sum, f) => {
      const tot = calculerTotaux(f.materiaux, f.mainOeuvre?.montant || 0, f.transportLogistique || 0, isFormal, f.appliquerTva, profile?.tvaTaux || 0.18);
      return sum + tot.totalTtc;
    }, 0);

  const totalImpayeClient = clientFactures
    .filter((f) => f.statut === 'impayee' || f.statut === 'en_retard')
    .reduce((sum, f) => {
      const tot = calculerTotaux(f.materiaux, f.mainOeuvre?.montant || 0, f.transportLogistique || 0, isFormal, f.appliquerTva, profile?.tvaTaux || 0.18);
      return sum + tot.totalTtc;
    }, 0);

  return (
    <div className="space-y-4 pb-28 pt-2">
      {/* Top Title & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#1E3A8A] tracking-tight">Clients</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A]">
              {clients.length} actifs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Carnet d'adresses & chantiers Sénégal</p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="h-11 px-4 bg-[#1E3A8A] hover:bg-[#172554] active:scale-95 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nouveau</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par nom, ville, tél..."
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
      </div>

      {/* Filter Chips */}
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
          Tous ({clients.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('chantier')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'chantier'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>En cours</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('devis')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
            activeFilter === 'devis'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Devis attente</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('vip')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1 ${
            activeFilter === 'vip'
              ? 'bg-[#1E3A8A] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-500" />
          <span>Habituels</span>
        </button>
      </div>

      {/* Helper notice */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-[#1E3A8A]">
        <History className="w-3.5 h-3.5 shrink-0 text-[#1E3A8A]" />
        <span>Touchez un client pour ouvrir son <strong>historique complet</strong> (devis, factures, chantiers).</span>
      </div>

      {/* Clients List */}
      <div className="space-y-2">
        {filteredClients.map((client) => {
          const initials = client.nom
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          const waUrl = buildWhatsAppLink(
            client.telephone,
            `Bonjour ${client.nom}, j'espère que vous allez bien. Je vous contacte concernant votre chantier BTP.`
          );

          // Count client quotes & invoices with normalized string matching
          const clientDevisCount = devisList.filter(
            (d) =>
              d.clientId === client.id ||
              d.clientNom?.trim().toLowerCase() === client.nom?.trim().toLowerCase()
          ).length;

          const clientFacturesCount = facturesList.filter(
            (f) =>
              f.clientId === client.id ||
              f.clientNom?.trim().toLowerCase() === client.nom?.trim().toLowerCase()
          ).length;

          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientForHistory(client)}
              className="bg-white rounded-xl p-2.5 sm:p-3 shadow-xs border border-slate-200/80 hover:border-[#1E3A8A] hover:shadow-sm active:scale-[0.99] transition cursor-pointer flex items-center justify-between gap-2.5 group"
              title="Cliquer pour ouvrir l'historique complet de ce client"
            >
              {/* Left: Avatar & Info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-50 text-[#1E3A8A] font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#1E3A8A] group-hover:text-white transition">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1E3A8A] transition truncate">
                      {client.nom}
                    </h3>
                    {client.statutChantier && (
                      <span
                        className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                          client.statutChantier === 'Chantier'
                            ? 'bg-emerald-50 text-emerald-800'
                            : client.statutChantier === 'Devis envoyé'
                            ? 'bg-amber-50 text-amber-800'
                            : client.statutChantier === 'Rénovation'
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {client.statutChantier}
                      </span>
                    )}
                  </div>

                  {/* Phone & Ville */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 truncate">
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Phone className="w-2.5 h-2.5 text-slate-400" />
                      {client.telephone}
                    </span>
                    {client.ville && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                          {client.ville}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Micro indicators for documents */}
                  <div className="flex items-center gap-1.5 mt-1 text-[10px]">
                    <span className="text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded font-medium">
                      {clientDevisCount} devis
                    </span>
                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded font-medium">
                      {clientFacturesCount} {isFormal ? 'factures' : 'reçus'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Direct Quick Contact Actions & History Arrow */}
              <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Call Button */}
                <a
                  href={`tel:${cleanSenegalPhone(client.telephone)}`}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition active:scale-95"
                  title={`Appeler ${client.nom}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>

                {/* WhatsApp Button */}
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center transition active:scale-95"
                  title="WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </a>

                {/* Chevron icon indicating tap for history */}
                <button
                  type="button"
                  onClick={() => setSelectedClientForHistory(client)}
                  className="w-6 h-7 sm:w-7 sm:h-8 text-slate-400 group-hover:text-[#1E3A8A] flex items-center justify-center transition"
                  title="Voir historique"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
            <p className="text-sm font-semibold text-slate-700">Aucun client trouvé</p>
            <p className="text-xs text-slate-400 mt-1">
              Essayez un autre mot-clé ou ajoutez un nouveau client.
            </p>
          </div>
        )}
      </div>

      {/* Activity Card */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Activité Récente
            </p>
            <p className="text-sm font-semibold mt-0.5">
              2 chantiers actifs à Dakar cette semaine
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-blue-200" />
      </div>

      {/* ======================================================================== */}
      {/* MODAL 1 : HISTORIQUE COMPLET DU CLIENT SELECTIONNE (USER REQUEST)        */}
      {/* ======================================================================== */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar flex flex-col gap-4">
            {/* Header: Title & Close */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    Fiche & Historique Client
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    ArtisanPro Sénégal
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClientForHistory(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-sm">
                    {selectedClientForHistory.nom
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900 truncate">
                        {selectedClientForHistory.nom}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#1E3A8A]">
                        {selectedClientForHistory.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{selectedClientForHistory.adresse || selectedClientForHistory.ville}</span>
                    </p>
                  </div>
                </div>

                {/* Quick Phone & WhatsApp Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`tel:${cleanSenegalPhone(selectedClientForHistory.telephone)}`}
                    className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center justify-center transition active:scale-95 shadow-xs"
                    title="Appeler"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={buildWhatsAppLink(
                      selectedClientForHistory.telephone,
                      `Bonjour ${selectedClientForHistory.nom}, je fais le point sur votre chantier BTP.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center transition active:scale-95 shadow-xs"
                    title="WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {selectedClientForHistory.notes && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Note de chantier :</span>
                  {selectedClientForHistory.notes}
                </div>
              )}
            </div>

            {/* Financial Overview for this client */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Devisé
                </span>
                <span className="text-sm font-extrabold text-[#1E3A8A] block mt-1">
                  {formatFCFA(totalDeviseClient)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {clientDevis.length} devis
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Encaissé
                </span>
                <span className="text-sm font-extrabold text-emerald-700 block mt-1">
                  {formatFCFA(totalEncaisseClient)}
                </span>
                <span className="text-[10px] text-emerald-600/80">
                  {clientFactures.filter((f) => f.statut === 'payee').length} payée(s)
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-center shadow-xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  À Encaisser
                </span>
                <span className="text-sm font-extrabold text-amber-700 block mt-1">
                  {formatFCFA(totalImpayeClient)}
                </span>
                <span className="text-[10px] text-amber-600/80">
                  {clientFactures.filter((f) => f.statut !== 'payee').length} restante(s)
                </span>
              </div>
            </div>

            {/* History Filter Segment */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setHistoryTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  historyTab === 'all'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tout ({clientDevis.length + clientFactures.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('devis')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  historyTab === 'devis'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Devis ({clientDevis.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('factures')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  historyTab === 'factures'
                    ? 'bg-white text-[#1E3A8A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>{isFormal ? 'Factures' : 'Reçus'} ({clientFactures.length})</span>
              </button>
            </div>

            {/* Chronological List of Pieces for this client */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto no-scrollbar pr-0.5">
              {/* Devis items */}
              {(historyTab === 'all' || historyTab === 'devis') &&
                clientDevis.map((d) => {
                  const tot = calculerTotaux(
                    d.materiaux,
                    d.mainOeuvre?.montant || 0,
                    d.transportLogistique || 0,
                    isFormal,
                    d.appliquerTva,
                    profile?.tvaTaux || 0.18
                  );

                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1E3A8A] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {d.numero}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                d.statut === 'accepte'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : d.statut === 'envoye'
                                  ? 'bg-amber-100 text-amber-800'
                                  : d.statut === 'refuse'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {d.statut}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {formatFrenchDate(d.dateEmission)} • {d.titreChantier}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-xs text-slate-900">
                          {formatFCFA(tot.totalTtc)}
                        </span>
                        {onPreviewDevis && (
                          <button
                            type="button"
                            onClick={() => onPreviewDevis(d)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                            title="Aperçu PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {/* Factures items */}
              {(historyTab === 'all' || historyTab === 'factures') &&
                clientFactures.map((f) => {
                  const tot = calculerTotaux(
                    f.materiaux,
                    f.mainOeuvre?.montant || 0,
                    f.transportLogistique || 0,
                    isFormal,
                    f.appliquerTva,
                    profile?.tvaTaux || 0.18
                  );

                  return (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-slate-900">
                              {f.numero}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                f.statut === 'payee'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : f.statut === 'en_retard'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {f.statut === 'payee' ? 'Payée' : f.statut === 'en_retard' ? 'En retard' : 'Impayée'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {formatFrenchDate(f.dateEmission)} • {f.modePaiement}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-xs text-[#1E3A8A]">
                          {formatFCFA(tot.totalTtc)}
                        </span>
                        {onPreviewFacture && (
                          <button
                            type="button"
                            onClick={() => onPreviewFacture(f)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition"
                            title="Aperçu PDF"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

              {clientDevis.length === 0 && clientFactures.length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-semibold text-slate-600">
                    Aucun document pour ce client
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Créez un devis ou une facture pour lancer le suivi.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Document Creation for this client */}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const c = selectedClientForHistory;
                    setSelectedClientForHistory(null);
                    if (onSelectClientForDevis && c) onSelectClientForDevis(c);
                  }}
                  className="h-11 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.98] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Devis</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const c = selectedClientForHistory;
                    setSelectedClientForHistory(null);
                    if (onSelectClientForFacture && c) onSelectClientForFacture(c);
                  }}
                  className="h-11 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 active:scale-[0.98] transition"
                >
                  <Receipt className="w-4 h-4" />
                  <span>{isFormal ? 'Nouvelle Facture' : 'Nouveau Reçu'}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedClientForHistory(null)}
                className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
              >
                Fermer la fiche historique
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================== */}
      {/* MODAL 2 : AJOUT D'UN NOUVEAU CLIENT                                     */}
      {/* ======================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1E3A8A]" />
                Nouveau Client
              </h3>
              <button
                onClick={handleCloseModal}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom du client ou entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Moussa Diop ou SARL Teranga"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de téléphone Sénégal *
                </label>
                <div className="flex items-center h-11 rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#1E3A8A] focus-within:border-transparent">
                  <span className="text-xs font-bold text-slate-700 pr-2 border-r border-slate-200">
                    🇸🇳 +221
                  </span>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="77 123 45 67"
                    className="w-full h-full pl-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quartier / Ville
                  </label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Ex: Almadies, Mermoz..."
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Type de client
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as 'Particulier' | 'Entreprise')}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white"
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Entreprise">Entreprise / Société</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse détaillée / Repères
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  placeholder="Ex: Sacré-Cœur 3, près de la boulangerie jaune"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes ou description du chantier
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Rénovation salle de bain, carrelage terrasse..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white font-semibold text-xs shadow-md shadow-blue-900/15 transition active:scale-[0.98]"
                >
                  Enregistrer client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
