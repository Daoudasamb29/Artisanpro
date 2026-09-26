import React, { useState } from 'react';
import { 
  X, 
  User, 
  Building, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Save, 
  LogOut, 
  Wrench,
  Zap,
  Hammer,
  Paintbrush
} from 'lucide-react';
import { ArtisanProfile, MetierArtisan } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ArtisanProfile;
  onSaveProfile: (profile: ArtisanProfile) => void;
  onOpenFormalChoice: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onOpenFormalChoice,
  onLogout,
}) => {
  if (!isOpen) return null;

  const [nomArtisan, setNomArtisan] = useState(profile.nomArtisan);
  const [nomEntreprise, setNomEntreprise] = useState(profile.nomEntreprise);
  const [metier, setMetier] = useState<MetierArtisan>(profile.metier);
  const [telephone, setTelephone] = useState(profile.telephone);
  const [adresse, setAdresse] = useState(profile.adresse);
  const [ninea, setNinea] = useState(profile.ninea || '123456789');
  const [rccm, setRccm] = useState(profile.rccm || 'SN-DKR-2020-A-1234');
  const [compteWave, setCompteWave] = useState(profile.compteWave || profile.telephone);
  const [compteOrangeMoney, setCompteOrangeMoney] = useState(profile.compteOrangeMoney || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      ...profile,
      nomArtisan,
      nomEntreprise,
      metier,
      telephone,
      adresse,
      ninea: profile.est_formel ? ninea : undefined,
      rccm: profile.est_formel ? rccm : undefined,
      compteWave,
      compteOrangeMoney,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Profil & Paramètres</h3>
              <p className="text-xs text-slate-500">Coordonnées professionnelles Sénégal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Regime Status Box */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
              <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
              <span>Régime actuel : {profile.est_formel ? 'Formel' : 'Informel'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {profile.est_formel
                ? 'Facturation avec TVA 18%, NINEA & RCCM mentionnés'
                : 'Reçus en franchise de TVA (Régime Informel / CGU)'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFormalChoice();
            }}
            className="h-9 px-3 bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Changer
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom de l'artisan
              </label>
              <input
                type="text"
                required
                value={nomArtisan}
                onChange={(e) => setNomArtisan(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom commercial de l'atelier
              </label>
              <input
                type="text"
                required
                value={nomEntreprise}
                onChange={(e) => setNomEntreprise(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Trade / Métier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Métier principal
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMetier('plomberie')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  metier === 'plomberie'
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Plomberie</span>
              </button>

              <button
                type="button"
                onClick={() => setMetier('electricite')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  metier === 'electricite'
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Électricité</span>
              </button>

              <button
                type="button"
                onClick={() => setMetier('maconnerie')}
                className={`py-2 px-1 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                  metier === 'maconnerie'
                    ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>Maçonnerie</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone professionnel
              </label>
              <input
                type="text"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse / Ville
              </label>
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Formal identifiers (NINEA / RCCM) if formal */}
          {profile.est_formel && (
            <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
              <span className="text-xs font-bold text-[#1E3A8A] uppercase tracking-wider block">
                Identifiants Fiscaux Légaux (Formel)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    N° NINEA
                  </label>
                  <input
                    type="text"
                    value={ninea}
                    onChange={(e) => setNinea(e.target.value)}
                    placeholder="123456789"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    N° RCCM
                  </label>
                  <input
                    type="text"
                    value={rccm}
                    onChange={(e) => setRccm(e.target.value)}
                    placeholder="SN-DKR-2020-A-1234"
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Accounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Compte Wave (Numéro)
              </label>
              <input
                type="text"
                value={compteWave}
                onChange={(e) => setCompteWave(e.target.value)}
                placeholder="+221 77..."
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Orange Money (Numéro)
              </label>
              <input
                type="text"
                value={compteOrangeMoney}
                onChange={(e) => setCompteOrangeMoney(e.target.value)}
                placeholder="+221 78..."
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Submit & Logout */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onLogout}
              className="h-11 px-4 rounded-xl text-rose-700 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Se déconnecter</span>
            </button>

            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-900/15 transition active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
