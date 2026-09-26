import React from 'react';
import { X, Bell, Clock, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Devis, Facture } from '../types';
import { formatFCFA, formatFrenchDate } from '../utils/formatters';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  devis: Devis[];
  factures: Facture[];
  onNavigateDevis: () => void;
  onNavigateFactures: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  devis,
  factures,
  onNavigateDevis,
  onNavigateFactures,
}) => {
  if (!isOpen) return null;

  const pendingDevis = devis.filter((d) => d.statut === 'envoye');
  const overdueFactures = factures.filter((f) => f.statut === 'en_retard');
  const unpaidFactures = factures.filter((f) => f.statut === 'impayee');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Notifications de chantiers</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 pt-3">
          {/* Overdue alert */}
          {overdueFactures.length > 0 && (
            <div
              onClick={() => {
                onClose();
                onNavigateFactures();
              }}
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 cursor-pointer hover:bg-rose-100/70 transition"
            >
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-900">
                    {overdueFactures.length} facture(s) en retard d'encaissement
                  </p>
                  <p className="text-[11px] text-rose-700 mt-0.5">
                    {overdueFactures.map((f) => `${f.clientNom} (${f.numero})`).join(', ')}
                  </p>
                  <span className="text-[11px] font-bold text-rose-800 underline mt-1 inline-flex items-center gap-1">
                    Relancer via WhatsApp <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pending quotes */}
          {pendingDevis.length > 0 && (
            <div
              onClick={() => {
                onClose();
                onNavigateDevis();
              }}
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 cursor-pointer hover:bg-amber-100/70 transition"
            >
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-900">
                    {pendingDevis.length} devis en attente de validation client
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5">
                    Envoyés récemment à Dakar. Pensez à faire un suivi pour sécuriser le chantier.
                  </p>
                  <span className="text-[11px] font-bold text-amber-800 underline mt-1 inline-flex items-center gap-1">
                    Consulter les devis <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Normal status item */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1E3A8A] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#1E3A8A]">
                  Comptabilité synchronisée
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Vos pièces sont à jour. Export Excel (.xlsx) disponible dans l'onglet Compta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
