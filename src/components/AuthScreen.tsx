import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Phone, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { ArtisanProfile } from '../types';

interface AuthScreenProps {
  onLogin: (profileData?: Partial<ArtisanProfile>) => void;
  currentProfile: ArtisanProfile;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, currentProfile }) => {
  const [phoneNumber, setPhoneNumber] = useState('77 412 89 00');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [artisanName, setArtisanName] = useState('Moussa Diop');
  const [companyName, setCompanyName] = useState('Plomberie Moussa');
  const [trade, setTrade] = useState<'plomberie' | 'electricite' | 'maconnerie'>('plomberie');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      onLogin({
        nomArtisan: artisanName,
        nomEntreprise: companyName || `${artisanName} Travaux`,
        metier: trade,
        telephone: `+221 ${phoneNumber}`,
      });
    } else {
      onLogin();
    }
  };

  // Quick preset logins for instant demo testing
  const handleQuickDemoLogin = (role: 'plombier' | 'electricien' | 'macon') => {
    if (role === 'plombier') {
      onLogin({
        nomArtisan: 'Moussa Diop',
        nomEntreprise: 'Plomberie & Travaux Moussa',
        metier: 'plomberie',
        telephone: '+221 77 123 45 67',
        est_formel: true,
      });
    } else if (role === 'electricien') {
      onLogin({
        nomArtisan: 'Abdoulaye Ndiaye',
        nomEntreprise: 'Ndiaye Électricité Pro',
        metier: 'electricite',
        telephone: '+221 78 456 78 90',
        est_formel: false,
      });
    } else {
      onLogin({
        nomArtisan: 'Ibrahima Sarr',
        nomEntreprise: 'Sarr Maçonnerie & BTP',
        metier: 'maconnerie',
        telephone: '+221 76 789 01 23',
        est_formel: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-between items-center px-4 py-6 sm:p-8">
      {/* Top status bar aesthetic */}
      <div className="w-full max-w-sm flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
        <span>09:45</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Dakar, SN</span>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 my-auto">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
              <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isSignUp ? 'Rejoignez ArtisanPro' : 'Bon retour !'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
            {isSignUp
              ? 'Créez votre compte artisan et démarrez vos devis & factures en 2 minutes'
              : 'Gérez vos devis, factures et chantiers au Sénégal'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom complet
                </label>
                <input
                  type="text"
                  required
                  value={artisanName}
                  onChange={(e) => setArtisanName(e.target.value)}
                  placeholder="Ex: Moussa Diop"
                  className="w-full h-12 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de l'atelier ou entreprise
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Plomberie Express Dakar"
                  className="w-full h-12 px-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corps de métier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTrade('plomberie')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      trade === 'plomberie'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Plomberie
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrade('electricite')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      trade === 'electricite'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Électricité
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrade('maconnerie')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                      trade === 'maconnerie'
                        ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-semibold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Maçonnerie
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Phone with Senegal Flag */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Numéro de téléphone
            </label>
            <div className="flex items-center h-12 rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#1E3A8A] focus-within:border-transparent">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-200 shrink-0">
                <span className="text-base">🇸🇳</span>
                <span className="text-sm font-semibold text-slate-700">+221</span>
              </div>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="77 000 00 00"
                className="w-full h-full pl-3 text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Mot de passe
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => alert('Code de réinitialisation envoyé par SMS au numéro')}
                  className="text-[11px] font-medium text-[#1E3A8A] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
            <div className="flex items-center h-12 rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#1E3A8A] focus-within:border-transparent">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-full text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? 'Masquer' : 'Afficher'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-blue-900/15 flex items-center justify-center gap-2 transition-all mt-4"
          >
            <span>{isSignUp ? "S'inscrire gratuitement" : 'Se connecter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Accès Rapide */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center mb-2.5">
            Test rapide en 1 clic (Profils Démo Sénégal)
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('plombier')}
              className="py-2 px-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#1E3A8A] text-[11px] font-medium flex flex-col items-center text-center transition"
            >
              <span className="font-bold">Moussa</span>
              <span className="text-[10px] text-slate-500">Plombier (Formel)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('electricien')}
              className="py-2 px-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium flex flex-col items-center text-center transition"
            >
              <span className="font-bold">Abdou</span>
              <span className="text-[10px] text-slate-500">Électricien (Informel)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('macon')}
              className="py-2 px-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium flex flex-col items-center text-center transition"
            >
              <span className="font-bold">Ibrahima</span>
              <span className="text-[10px] text-slate-500">Maçon (Formel)</span>
            </button>
          </div>
        </div>

        {/* Toggle sign in / sign up */}
        <div className="mt-5 text-center">
          <p className="text-xs text-slate-600">
            {isSignUp ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#1E3A8A] font-bold hover:underline ml-1"
            >
              {isSignUp ? 'Se connecter' : "S'inscrire"}
            </button>
          </p>
        </div>
      </div>

      {/* Footer legal note */}
      <div className="text-center text-slate-400 text-[11px] max-w-sm mt-4">
        <span>ArtisanPro Sénégal • BTP & Rénovation conforme aux usages locaux</span>
      </div>
    </div>
  );
};
