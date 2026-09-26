import React from 'react';
import { 
  Home, 
  Users, 
  Plus, 
  FileText, 
  BarChart3, 
  Bell, 
  User, 
  ShieldCheck, 
  Wrench,
  Receipt,
  FileCheck
} from 'lucide-react';
import { ArtisanProfile, TabDestination } from '../types';

interface NavigationProps {
  currentTab: TabDestination;
  onSelectTab: (tab: TabDestination) => void;
  profile: ArtisanProfile;
  onOpenProfile: () => void;
  onOpenFormalChoice: () => void;
  onOpenNotifications: () => void;
  onQuickCreate?: () => void;
  unreadCount?: number;
}

export const TopHeader: React.FC<{
  profile: ArtisanProfile;
  title: string;
  onOpenProfile: () => void;
  onOpenFormalChoice: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}> = ({
  profile,
  title,
  onOpenProfile,
  onOpenFormalChoice,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  return (
    <header className="sticky top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-2.5 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand / Title Zone */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-900/10">
            <Wrench className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
                ArtisanPro SN
              </span>
              {/* Regime Badge */}
              <button
                type="button"
                onClick={onOpenFormalChoice}
                title="Cliquez pour changer entre statut Formel et Informel"
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  profile.est_formel
                    ? 'bg-blue-100 text-[#1E3A8A] hover:bg-blue-200'
                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                {profile.est_formel ? 'Formel • TVA' : 'Informel • Reçu'}
              </button>
            </div>
            <h1 className="text-base font-bold text-slate-900 truncate leading-tight">
              {title}
            </h1>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-1.5">
          {/* Notifications button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Profil artisan"
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-[#2563EB] text-white font-bold text-xs flex items-center justify-center shadow-sm ring-2 ring-white hover:opacity-95 transition"
          >
            {profile.nomArtisan
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
};

export const BottomDock: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onQuickCreate,
}) => {
  const invoiceLabel = profile.est_formel ? 'Factures' : 'Reçus';

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 flex justify-center items-center px-4 pointer-events-none pb-safe">
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto mx-auto w-full max-w-sm sm:max-w-[400px] bg-[#0F172A]/95 text-slate-400 rounded-full p-1.5 shadow-2xl shadow-slate-950/40 border border-slate-800/80 backdrop-blur-xl flex items-center justify-center gap-0.5"
      >
        {/* 1. Accueil */}
        <button
          type="button"
          onClick={() => onSelectTab('accueil')}
          className={`flex-1 h-12 flex flex-col items-center justify-center text-center rounded-full transition-all gap-0.5 ${
            currentTab === 'accueil'
              ? 'bg-[#1E3A8A] text-white font-semibold shadow-sm'
              : 'hover:text-white text-slate-400'
          }`}
        >
          <Home className="w-4 h-4 shrink-0" />
          <span className="text-[10px] leading-none text-center">Accueil</span>
        </button>

        {/* 2. Clients */}
        <button
          type="button"
          onClick={() => onSelectTab('clients')}
          className={`flex-1 h-12 flex flex-col items-center justify-center text-center rounded-full transition-all gap-0.5 ${
            currentTab === 'clients'
              ? 'bg-[#1E3A8A] text-white font-semibold shadow-sm'
              : 'hover:text-white text-slate-400'
          }`}
        >
          <Users className="w-4 h-4 shrink-0" />
          <span className="text-[10px] leading-none text-center">Clients</span>
        </button>

        {/* 3. Devis */}
        <button
          type="button"
          onClick={() => onSelectTab('devis')}
          className={`flex-1 h-12 flex flex-col items-center justify-center text-center rounded-full transition-all gap-0.5 ${
            currentTab === 'devis'
              ? 'bg-[#1E3A8A] text-white font-semibold shadow-sm'
              : 'hover:text-white text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" />
          <span className="text-[10px] leading-none text-center">Devis</span>
        </button>

        {/* 5. Factures / Reçus */}
        <button
          type="button"
          onClick={() => onSelectTab('factures')}
          className={`flex-1 h-12 flex flex-col items-center justify-center text-center rounded-full transition-all gap-0.5 ${
            currentTab === 'factures'
              ? 'bg-[#1E3A8A] text-white font-semibold shadow-sm'
              : 'hover:text-white text-slate-400'
          }`}
        >
          <Receipt className="w-4 h-4 shrink-0" />
          <span className="text-[10px] leading-none text-center">{invoiceLabel}</span>
        </button>

        {/* 6. Compta */}
        <button
          type="button"
          onClick={() => onSelectTab('compta')}
          className={`flex-1 h-12 flex flex-col items-center justify-center text-center rounded-full transition-all gap-0.5 ${
            currentTab === 'compta'
              ? 'bg-[#1E3A8A] text-white font-semibold shadow-sm'
              : 'hover:text-white text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" />
          <span className="text-[10px] leading-none text-center">Compta</span>
        </button>
      </nav>
    </div>
  );
};
