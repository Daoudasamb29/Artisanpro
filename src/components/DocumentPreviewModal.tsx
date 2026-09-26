import React, { useRef } from 'react';
import { 
  X, 
  Share2, 
  Download, 
  Printer, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  PenTool, 
  Clock, 
  Sparkles,
  Send,
  Receipt,
  FileCheck,
  CreditCard,
  Building2,
  Banknote,
  Smartphone,
  Wallet
} from 'lucide-react';
import { Devis, Facture, ArtisanProfile } from '../types';
import { formatFCFA, formatFrenchDate, buildWhatsAppLink, calculerTotaux } from '../utils/formatters';
import { nombreEnLettres } from '../utils/numberToWords';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Devis | Facture | null;
  type: 'devis' | 'facture';
  profile: ArtisanProfile;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  type,
  profile,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !doc) return null;

  const isDevis = type === 'devis';
  const isFormal = profile.est_formel;
  const isReceipt = !isDevis && ((doc as Facture).estReçu || (doc as Facture).montantRecu !== undefined);

  // Document Title
  let docBadgeTitle = 'DEVIS';
  if (!isDevis) {
    docBadgeTitle = isReceipt ? 'REÇU DE PAIEMENT' : (isFormal ? 'FACTURE' : 'REÇU');
  }

  const factureDoc = !isDevis ? (doc as Facture) : null;
  const montantRecu = factureDoc?.montantRecu !== undefined 
    ? factureDoc.montantRecu 
    : (doc.materiaux[0]?.prixUnitaire || 0);

  const montantLettres = factureDoc?.montantLettres || nombreEnLettres(montantRecu);

  // Calculate dynamic totals for devis or standard facture
  const totaux = calculerTotaux(
    doc.materiaux,
    doc.mainOeuvre?.montant || 0,
    doc.transportLogistique || 0,
    isFormal,
    doc.appliquerTva,
    profile.tvaTaux
  );

  // WhatsApp Message
  let waGreeting = '';
  if (isReceipt && factureDoc) {
    waGreeting = `Bonjour ${doc.clientNom},\nVoici votre Reçu de Paiement N° ${doc.numero} délivré par ${profile.nomEntreprise}.\n• Date : ${formatFrenchDate(factureDoc.datePaiement || doc.dateEmission)}\n• Montant reçu : ${formatFCFA(montantRecu)} (${montantLettres})\n• Objet : ${factureDoc.objetPaiement || doc.titreChantier || 'Règlement de travaux'}\n• Mode de règlement : ${factureDoc.modePaiement}${factureDoc.estAcompte ? `\n• Solde restant dû : ${formatFCFA(factureDoc.soldeRestantDu || 0)}` : ''}\nMerci pour votre confiance ! Jërejëf ci wóolu gi.`;
  } else {
    waGreeting = `Bonjour ${doc.clientNom},\nVoici votre ${docBadgeTitle.toLowerCase()} ${profile.nomEntreprise} N° ${doc.numero} d'un montant de ${formatFCFA(totaux.totalTtc)}.\nMerci pour votre confiance ! Jërejëf ci wóolu gi.`;
  }
  const waUrl = buildWhatsAppLink(doc.clientTelephone, waGreeting);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto no-scrollbar">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col my-auto border border-slate-100 overflow-hidden">
        {/* Modal App Bar */}
        <div className="no-print flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
              Aperçu {docBadgeTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `${docBadgeTitle} ${doc.numero} - ${profile.nomEntreprise}`,
                    text: waGreeting,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(waGreeting);
                  alert('Résumé copié dans le presse-papier !');
                }
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition"
              aria-label="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Document */}
        <div ref={printRef} className="p-4 sm:p-7 bg-white text-slate-900 space-y-4">
          {/* Top Status Bar indicator */}
          <div className="flex items-center justify-between text-xs pb-1">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#1E3A8A] font-semibold text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="uppercase tracking-wider">Document Conforme Sénégal</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isReceipt ? 'Reçu Valide' : 'Devis / Facture BTP'}</span>
            </div>
          </div>

          {/* Marine Accent Stripe */}
          <div className="h-1.5 w-full bg-[#1E3A8A] rounded-full"></div>

          {/* Header Block: Artisan Info & Document Meta */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-snug">
                {profile.nomEntreprise || profile.nomArtisan}
              </h3>
              
              {isFormal ? (
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  NINEA : {profile.ninea || '123456789'} • RCCM : {profile.rccm || 'SN-DKR-2020-A-1234'}
                </p>
              ) : (
                <p className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  Artisan Indépendant • Régime de la contribution globale (CGU Sénégal)
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.adresse || 'Dakar, Sénégal'}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.telephone}
                </span>
              </div>
            </div>

            {/* Document Number & Date */}
            <div className="flex flex-col items-end shrink-0 text-right">
              <span className="bg-[#1E3A8A] text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                {docBadgeTitle}
              </span>
              <span className="text-xs font-bold text-slate-900 mt-1">
                N° {doc.numero}
              </span>
              <span className="text-[11px] text-slate-500">
                {isReceipt ? 'Date paiement :' : 'Date :'} {formatFrenchDate((factureDoc?.datePaiement) || doc.dateEmission)}
              </span>
              {isDevis ? (
                <span className="text-[11px] text-emerald-700 font-medium">
                  Validité : 30 jours
                </span>
              ) : isReceipt ? (
                <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded mt-0.5">
                  Suivi continu
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  Échéance : {formatFrenchDate((doc as Facture).dateEcheance || doc.dateEmission)}
                </span>
              )}
            </div>
          </div>

          {/* Client Destination Box */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>{isReceipt ? 'Reçu de :' : isDevis ? 'Devis établi pour :' : 'Facturé à :'}</span>
              <span className="bg-slate-200/70 text-slate-700 px-2 py-0.2 rounded normal-case font-medium">
                Client Sénégal
              </span>
            </div>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-sm font-bold text-slate-900">
                {doc.clientNom}
              </span>
              <span className="text-xs font-semibold text-[#1E3A8A]">
                {doc.clientTelephone}
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{doc.clientAdresse || 'Dakar, Sénégal'}</span>
            </p>
          </div>

          {/* ==================================================== */}
          {/* DISPLAY CASE 1: REÇU DE PAIEMENT CONFORME SÉNÉGAL    */}
          {/* ==================================================== */}
          {isReceipt && factureDoc ? (
            <div className="space-y-3.5">
              {/* Grand Encadré Montant Reçu en chiffres et en lettres */}
              <div className="rounded-2xl border-2 border-[#1E3A8A]/20 bg-blue-50/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Montant Reçu
                  </span>
                  <span className="bg-[#1E3A8A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {factureDoc.modePaiement}
                  </span>
                </div>

                {/* En chiffres */}
                <div className="text-2xl sm:text-3xl font-extrabold text-[#1E3A8A] tracking-tight">
                  {formatFCFA(montantRecu)}
                </div>

                {/* En toutes lettres */}
                <div className="pt-2 border-t border-blue-200/60">
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">
                    Montant en toutes lettres :
                  </span>
                  <p className="text-sm font-bold text-slate-800 italic mt-0.5">
                    « {montantLettres} »
                  </p>
                </div>
              </div>

              {/* Objet du paiement */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Objet du paiement :
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  {factureDoc.objetPaiement || doc.titreChantier || 'Règlement de travaux'}
                </p>
              </div>

              {/* Situation de paiement : Acompte & Solde restant dû */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Situation du compte
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    factureDoc.estAcompte 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {factureDoc.estAcompte ? 'Acompte versé' : 'Solde intégralement réglé'}
                  </span>
                </div>

                {factureDoc.estAcompte ? (
                  <div className="space-y-1 pt-1 border-t border-slate-200/80">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-600 font-semibold">
                        Solde restant dû :
                      </span>
                      <span className="text-base font-extrabold text-amber-700">
                        {formatFCFA(factureDoc.soldeRestantDu || 0)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      Soit en lettres : {nombreEnLettres(factureDoc.soldeRestantDu || 0)}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-emerald-700 font-semibold pt-1 border-t border-slate-200/80">
                    ✓ Aucun solde restant dû. Prestation soldée.
                  </p>
                )}
              </div>

              {/* Quittance legal notice */}
              <p className="text-[11px] text-slate-500 italic text-center px-2">
                Le présent reçu est délivré pour valoir ce que de droit à titre de quittance de paiement.
              </p>
            </div>
          ) : (
            /* ==================================================== */
            /* DISPLAY CASE 2: DEVIS OU FACTURE COMPLÈTE DÉTAILLÉE  */
            /* ==================================================== */
            <>
              {/* Table of Line Items */}
              <div className="overflow-hidden rounded-xl border border-slate-200 text-xs">
                <div className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider px-3 py-2 grid grid-cols-12 text-[11px]">
                  <span className="col-span-6">Description</span>
                  <span className="col-span-2 text-center">Qté</span>
                  <span className="col-span-2 text-right">P.U.</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>

                {/* Materials rows */}
                {doc.materiaux.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={`px-3 py-2 grid grid-cols-12 items-center border-t border-slate-100 ${
                      idx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    }`}
                  >
                    <div className="col-span-6 pr-2">
                      <p className="font-semibold text-slate-800">{item.description}</p>
                      {item.details && (
                        <p className="text-[11px] text-slate-500 truncate">{item.details}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-slate-600">
                      {item.quantite} {item.unite}
                    </div>
                    <div className="col-span-2 text-right text-slate-600">
                      {formatFCFA(item.prixUnitaire, false)}
                    </div>
                    <div className="col-span-2 text-right font-bold text-slate-900">
                      {formatFCFA(item.quantite * item.prixUnitaire)}
                    </div>
                  </div>
                ))}

                {/* Labor row (Main d'œuvre) */}
                {doc.mainOeuvre && doc.mainOeuvre.montant > 0 && (
                  <div className="px-3 py-2 grid grid-cols-12 items-center border-t border-slate-200 bg-blue-50/30">
                    <div className="col-span-6 pr-2">
                      <p className="font-semibold text-[#1E3A8A]">
                        {doc.mainOeuvre.description || "Main d'œuvre & Pose"}
                      </p>
                      {doc.mainOeuvre.details && (
                        <p className="text-[11px] text-slate-500">{doc.mainOeuvre.details}</p>
                      )}
                    </div>
                    <div className="col-span-2 text-center text-slate-400">
                      {doc.mainOeuvre.typeTarif}
                    </div>
                    <div className="col-span-2 text-right text-slate-400">—</div>
                    <div className="col-span-2 text-right font-bold text-slate-900">
                      {formatFCFA(doc.mainOeuvre.montant)}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Totals Breakdown */}
              <div className="flex flex-col items-end gap-1 text-xs pt-1">
                <div className="flex justify-between w-56 text-slate-600">
                  <span>Fournitures & Matériaux</span>
                  <span>{formatFCFA(totaux.sousTotalMateriaux)}</span>
                </div>
                {totaux.sousTotalMainOeuvre > 0 && (
                  <div className="flex justify-between w-56 text-slate-600">
                    <span>Main d'œuvre</span>
                    <span>{formatFCFA(totaux.sousTotalMainOeuvre)}</span>
                  </div>
                )}
                {totaux.transport > 0 && (
                  <div className="flex justify-between w-56 text-slate-600">
                    <span>Transport & Logistique</span>
                    <span>{formatFCFA(totaux.transport)}</span>
                  </div>
                )}

                {/* TVA row - ONLY IF FORMEL */}
                {isFormal && (
                  <div className="flex justify-between w-56 text-slate-600 border-t border-slate-100 pt-1">
                    <span>TVA ({Math.round(profile.tvaTaux * 100)}%)</span>
                    <span>{formatFCFA(totaux.tva)}</span>
                  </div>
                )}

                {/* Total Highlight */}
                <div className="w-full bg-[#1E3A8A] text-white p-3.5 rounded-xl flex items-center justify-between mt-1.5 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {isFormal ? 'TOTAL TTC' : 'TOTAL NET COMMERCIAL'}
                  </span>
                  <span className="text-xl font-extrabold tracking-tight">
                    {formatFCFA(totaux.totalTtc)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Signatures Module */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between h-24">
              <div>
                <p className="text-[11px] font-bold text-slate-800">Signature de l'artisan</p>
                <p className="text-[10px] text-slate-500">{profile.nomEntreprise || profile.nomArtisan}</p>
              </div>
              <div className="flex items-center justify-between text-emerald-700 text-xs font-semibold">
                <span>Pour acquit le {formatFrenchDate((factureDoc?.datePaiement) || doc.dateEmission)}</span>
                <PenTool className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between h-24">
              <div>
                <p className="text-[11px] font-bold text-slate-800">
                  {isReceipt ? 'Reçu par le client' : 'Bon pour accord client'}
                </p>
                <p className="text-[10px] text-slate-500 italic">« Pour acquit et décharge »</p>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Date : ___ / ___ / 2025</span>
                <PenTool className="w-3.5 h-3.5 text-slate-300" />
              </div>
            </div>
          </div>

          {/* Footer Thank you in French & Wolof */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
            <p className="font-semibold text-[#1E3A8A]">
              Merci pour votre confiance • Jërejëf ci wóolu gi
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Généré par ArtisanPro Sénégal • Gestion BTP & Quittances simplifiées
            </p>
          </div>
        </div>

        {/* Bottom Floating Action Bar */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          {/* WhatsApp Action */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Envoyer WhatsApp</span>
          </a>

          {/* Print / PDF Download */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 h-11 sm:h-12 bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.98] text-white rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
