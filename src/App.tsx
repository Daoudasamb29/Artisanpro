/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArtisanProfile, 
  Client, 
  Devis, 
  Facture, 
  TabDestination,
  StatutDevis,
  StatutFacture
} from './types';
import { 
  loadProfile, 
  saveProfile, 
  loadClients, 
  saveClients, 
  loadDevis, 
  saveDevis, 
  loadFactures, 
  saveFactures,
  loadIsAuthenticated,
  saveIsAuthenticated
} from './utils/storage';
import { AuthScreen } from './components/AuthScreen';
import { FormalChoiceModal } from './components/FormalChoiceModal';
import { TopHeader, BottomDock } from './components/Navigation';
import { DashboardScreen } from './components/DashboardScreen';
import { ClientsScreen } from './components/ClientsScreen';
import { DevisListScreen } from './components/DevisListScreen';
import { CreateDevisScreen } from './components/CreateDevisScreen';
import { FacturesListScreen } from './components/FacturesListScreen';
import { CreateFactureScreen } from './components/CreateFactureScreen';
import { ComptaScreen } from './components/ComptaScreen';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { ProfileModal } from './components/ProfileModal';
import { NotificationsModal } from './components/NotificationsModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadIsAuthenticated());
  const [profile, setProfile] = useState<ArtisanProfile>(() => loadProfile());
  const [clients, setClients] = useState<Client[]>(() => loadClients());
  const [devisList, setDevisList] = useState<Devis[]>(() => loadDevis());
  const [facturesList, setFacturesList] = useState<Facture[]>(() => loadFactures());

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<TabDestination>('accueil');

  // Modals & sub-views
  const [isFormalChoiceOpen, setIsFormalChoiceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Active Creation flows
  const [isCreatingDevis, setIsCreatingDevis] = useState(false);
  const [isCreatingFacture, setIsCreatingFacture] = useState(false);
  const [isCreatingClientDirectly, setIsCreatingClientDirectly] = useState(false);
  const [clientForNewDevis, setClientForNewDevis] = useState<Client | null>(null);
  const [clientForNewFacture, setClientForNewFacture] = useState<Client | null>(null);
  const [devisSourceForFacture, setDevisSourceForFacture] = useState<Devis | null>(null);

  // Active Document Preview
  const [previewDoc, setPreviewDoc] = useState<Devis | Facture | null>(null);
  const [previewType, setPreviewType] = useState<'devis' | 'facture'>('devis');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Success toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync state to localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  useEffect(() => {
    saveDevis(devisList);
  }, [devisList]);

  useEffect(() => {
    saveFactures(facturesList);
  }, [facturesList]);

  // Auth Handlers
  const handleLogin = (profileOverride?: Partial<ArtisanProfile>) => {
    if (profileOverride) {
      setProfile((prev) => ({ ...prev, ...profileOverride }));
    }
    setIsAuthenticated(true);
    saveIsAuthenticated(true);
    showToast('Bienvenue sur ArtisanPro Sénégal !');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    saveIsAuthenticated(false);
    setIsProfileOpen(false);
    showToast('Déconnexion réussie');
  };

  // Switch formal / informal
  const handleSelectFormal = (isFormal: boolean) => {
    const updated = { ...profile, est_formel: isFormal };
    setProfile(updated);
    saveProfile(updated);
    setIsFormalChoiceOpen(false);
    showToast(
      isFormal
        ? 'Passage en statut Formel : factures avec TVA 18%, NINEA & RCCM activés'
        : 'Passage en statut Informel : reçus sans TVA (Régime CGU) activés'
    );
  };

  // Client addition
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'dateAjout'>) => {
    const newClient: Client = {
      ...newClientData,
      id: 'cli-' + Date.now(),
      dateAjout: new Date().toISOString().split('T')[0],
    };
    setClients([newClient, ...clients]);
    showToast(`Client ${newClient.nom} ajouté avec succès !`);
  };

  // Save Devis
  const handleSaveDevis = (newDevis: Devis) => {
    setDevisList([newDevis, ...devisList]);
    setIsCreatingDevis(false);
    setClientForNewDevis(null);
    setCurrentTab('devis');
    showToast(`Devis ${newDevis.numero} enregistré avec succès !`);
  };

  // Save Facture
  const handleSaveFacture = (newFacture: Facture) => {
    setFacturesList([newFacture, ...facturesList]);
    setIsCreatingFacture(false);
    setDevisSourceForFacture(null);
    setCurrentTab('factures');
    showToast(
      `${profile.est_formel ? 'Facture' : 'Reçu'} ${newFacture.numero} enregistré !`
    );
  };

  // Update Devis status
  const handleUpdateDevisStatut = (devisId: string, newStatut: StatutDevis) => {
    setDevisList(
      devisList.map((d) => (d.id === devisId ? { ...d, statut: newStatut } : d))
    );
    showToast(`Statut du devis mis à jour : ${newStatut}`);
  };

  // Mark invoice as paid
  const handleMarkAsPaid = (factureId: string) => {
    setFacturesList(
      facturesList.map((f) =>
        f.id === factureId
          ? {
              ...f,
              statut: 'payee',
              datePaiement: new Date().toISOString().split('T')[0],
            }
          : f
      )
    );
    showToast('Paiement encaissé et enregistré avec succès !');
  };

  // Convert Devis into Facture
  const handleConvertirEnFacture = (devis: Devis) => {
    setDevisSourceForFacture(devis);
    setIsCreatingFacture(true);
  };

  // Open Preview Modal
  const handlePreviewDoc = (doc: Devis | Facture, type: 'devis' | 'facture') => {
    setPreviewDoc(doc);
    setPreviewType(type);
    setIsPreviewOpen(true);
  };

  // Quick central "+" button action
  const handleQuickCreate = () => {
    setIsCreatingDevis(true);
  };

  // If not logged in, show Auth Screen (Screen 1)
  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} currentProfile={profile} />;
  }

  // Determine top header title based on currentTab & creation mode
  let headerTitle = 'Tableau de bord';
  if (isCreatingDevis) headerTitle = 'Nouveau Devis';
  else if (isCreatingFacture)
    headerTitle = profile.est_formel ? 'Nouvelle Facture' : 'Nouveau Reçu';
  else if (currentTab === 'clients') headerTitle = 'Clients & Chantiers';
  else if (currentTab === 'devis') headerTitle = 'Gestion des Devis';
  else if (currentTab === 'factures')
    headerTitle = profile.est_formel ? 'Factures Pro' : "Reçus d'encaissement";
  else if (currentTab === 'compta') headerTitle = 'Comptabilité';

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0d1c2e] font-sans flex flex-col items-center">
      {/* Main Container */}
      <div className="w-full max-w-md bg-[#f8f9ff] min-h-screen flex flex-col relative shadow-sm border-x border-slate-200/50">
        {/* Top Header Bar */}
        <TopHeader
          profile={profile}
          title={headerTitle}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenFormalChoice={() => setIsFormalChoiceOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadCount={
            devisList.filter((d) => d.statut === 'envoye').length +
            facturesList.filter((f) => f.statut === 'en_retard').length
          }
        />

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-2">
          {/* Active Creation Flow 1: Create Devis */}
          {isCreatingDevis ? (
            <CreateDevisScreen
              clients={clients}
              profile={profile}
              existingDevisCount={devisList.length}
              initialClient={clientForNewDevis}
              onSaveDevis={handleSaveDevis}
              onCancel={() => {
                setIsCreatingDevis(false);
                setClientForNewDevis(null);
              }}
              onPreviewDevis={(d) => handlePreviewDoc(d, 'devis')}
              onOpenCreateClient={() => setIsCreatingClientDirectly(true)}
            />
          ) : isCreatingFacture ? (
            /* Active Creation Flow 2: Create Facture / Reçu */
            <CreateFactureScreen
              clients={clients}
              profile={profile}
              existingFactureCount={facturesList.length}
              initialDevis={devisSourceForFacture}
              initialClient={clientForNewFacture}
              onSaveFacture={handleSaveFacture}
              onCancel={() => {
                setIsCreatingFacture(false);
                setDevisSourceForFacture(null);
                setClientForNewFacture(null);
              }}
              onPreviewFacture={(f) => handlePreviewDoc(f, 'facture')}
              onOpenCreateClient={() => setIsCreatingClientDirectly(true)}
            />
          ) : currentTab === 'accueil' ? (
            /* 1. Dashboard Tab */
            <DashboardScreen
              profile={profile}
              clients={clients}
              devis={devisList}
              factures={facturesList}
              onNavigate={(tab) => setCurrentTab(tab)}
              onOpenCreateDevis={() => setIsCreatingDevis(true)}
              onOpenCreateFacture={() => setIsCreatingFacture(true)}
              onOpenCreateClient={() => {
                setCurrentTab('clients');
                setIsCreatingClientDirectly(true);
              }}
              onPreviewDevis={(d) => handlePreviewDoc(d, 'devis')}
              onPreviewFacture={(f) => handlePreviewDoc(f, 'facture')}
            />
          ) : currentTab === 'clients' ? (
            /* 2. Clients Tab */
            <ClientsScreen
              clients={clients}
              devisList={devisList}
              facturesList={facturesList}
              profile={profile}
              onAddClient={handleAddClient}
              isOpenAddModalDirectly={isCreatingClientDirectly}
              onCloseAddModalDirectly={() => setIsCreatingClientDirectly(false)}
              onSelectClientForDevis={(client) => {
                setClientForNewDevis(client);
                setIsCreatingDevis(true);
              }}
              onSelectClientForFacture={(client) => {
                setClientForNewFacture(client);
                setIsCreatingFacture(true);
              }}
              onPreviewDevis={(d) => handlePreviewDoc(d, 'devis')}
              onPreviewFacture={(f) => handlePreviewDoc(f, 'facture')}
            />
          ) : currentTab === 'devis' ? (
            /* 3. Devis Tab */
            <DevisListScreen
              devis={devisList}
              profile={profile}
              onOpenCreateDevis={() => setIsCreatingDevis(true)}
              onPreviewDevis={(d) => handlePreviewDoc(d, 'devis')}
              onConvertirEnFacture={handleConvertirEnFacture}
              onUpdateStatut={handleUpdateDevisStatut}
            />
          ) : currentTab === 'factures' ? (
            /* 4. Factures Tab */
            <FacturesListScreen
              factures={facturesList}
              profile={profile}
              onOpenCreateFacture={() => setIsCreatingFacture(true)}
              onPreviewFacture={(f) => handlePreviewDoc(f, 'facture')}
              onMarkAsPaid={handleMarkAsPaid}
            />
          ) : (
            /* 5. Compta Tab */
            <ComptaScreen
              devis={devisList}
              factures={facturesList}
              profile={profile}
              onPreviewDevis={(d) => handlePreviewDoc(d, 'devis')}
              onPreviewFacture={(f) => handlePreviewDoc(f, 'facture')}
            />
          )}
        </main>

        {/* Floating Bottom Navigation Dock */}
        {!isCreatingDevis && !isCreatingFacture && (
          <BottomDock
            currentTab={currentTab}
            onSelectTab={(tab) => setCurrentTab(tab)}
            profile={profile}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenFormalChoice={() => setIsFormalChoiceOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onQuickCreate={handleQuickCreate}
          />
        )}
      </div>

      {/* Choice Modal (Formel / Informel) */}
      <FormalChoiceModal
        isOpen={isFormalChoiceOpen}
        estFormel={profile.est_formel}
        onSelect={handleSelectFormal}
        onClose={() => setIsFormalChoiceOpen(false)}
      />

      {/* Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => {
          setProfile(updated);
          showToast('Profil artisan mis à jour avec succès !');
        }}
        onOpenFormalChoice={() => setIsFormalChoiceOpen(true)}
        onLogout={handleLogout}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        devis={devisList}
        factures={facturesList}
        onNavigateDevis={() => {
          setIsNotificationsOpen(false);
          setCurrentTab('devis');
        }}
        onNavigateFactures={() => {
          setIsNotificationsOpen(false);
          setCurrentTab('factures');
        }}
      />

      {/* Document A4 Preview Modal (DEV-2025-XXXX / FAC-2025-XXXX / REC-2025-XXXX) */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        document={previewDoc}
        type={previewType}
        profile={profile}
      />

      {/* Feedback Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 flex items-center gap-2 bg-[#0F172A] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
