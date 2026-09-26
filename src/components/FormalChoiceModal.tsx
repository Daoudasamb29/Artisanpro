import React from 'react';
import { CheckCircle2, Building2, User, ArrowRight, X, Shield, Info } from 'lucide-react';

interface FormalChoiceModalProps {
  isOpen: boolean;
  estFormel: boolean;
  onSelect: (isFormal: boolean) => void;
  onClose?: () => void;
  isInitialSetup?: boolean;
}

export const FormalChoiceModal: React.FC<FormalChoiceModalProps> = ({
  isOpen,
  estFormel,
  onSelect,
  onClose,
  isInitialSetup = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close button if not initial required setup */}
        {!isInitialSetup && onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Icon & Title */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center mb-3.5 shadow-sm">
            <Building2 className="w-7 h-7 text-[#1E3A8A]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Êtes-vous formel ou informel ?
          </h2>
          <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">
            Vous pourrez modifier ce choix à tout moment dans vos paramètres selon l'évolution de votre activité.
          </p>
        </div>

        {/* Choice Cards */}
        <div className="space-y-3.5">
          {/* Card 1: Formel */}
          <button
            type="button"
            onClick={() => onSelect(true)}
            className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.99] border relative ${
              estFormel
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-blue-900/20'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">Formel</span>
                {estFormel && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  estFormel
                    ? 'bg-blue-800/80 text-blue-100 border border-blue-400/30'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                NINEA / RCCM
              </span>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                estFormel ? 'text-blue-100' : 'text-slate-600'
              }`}
            >
              Entreprise enregistrée, facturation avec mention "Facture", TVA 18% activable et accès aux chantiers institutionnels.
            </p>

            <div
              className={`mt-3 pt-2.5 border-t text-[11px] grid grid-cols-2 gap-1.5 ${
                estFormel ? 'border-blue-700/60 text-blue-200' : 'border-slate-100 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>✓ NINEA & RCCM affichés</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ TVA 18% légale</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ Mention légale : Facture</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ Numérotation FAC-2025-XXXX</span>
              </div>
            </div>
          </button>

          {/* Card 2: Informel */}
          <button
            type="button"
            onClick={() => onSelect(false)}
            className={`w-full p-4 rounded-2xl text-left transition-all active:scale-[0.99] border relative ${
              !estFormel
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md shadow-blue-900/20'
                : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">Informel</span>
                {!estFormel && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  !estFormel
                    ? 'bg-blue-800/80 text-blue-100 border border-blue-400/30'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Indépendant
              </span>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                !estFormel ? 'text-blue-100' : 'text-slate-600'
              }`}
            >
              Artisan de quartier, auto-entrepreneur, sans registre de commerce formel requis. Idéal pour débuter simplement.
            </p>

            <div
              className={`mt-3 pt-2.5 border-t text-[11px] grid grid-cols-2 gap-1.5 ${
                !estFormel ? 'border-blue-700/60 text-blue-200' : 'border-slate-100 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>✓ NINEA & RCCM masqués</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ TVA 0% (Franchise CGU)</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ Mention légale : Reçu</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✓ Numérotation REC-2025-XXXX</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() =>
              alert(
                "Au Sénégal, les artisans du régime informel (CGU / CGM) émettent des 'Reçus' sans TVA et sans obligation de mentionner NINEA/RCCM. Les entreprises déclarées émettent des 'Factures' assujetties ou non à la TVA 18% avec NINEA obligatoire."
              )
            }
            className="text-xs font-semibold text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
          >
            <span>En savoir plus sur les statuts BTP au Sénégal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
