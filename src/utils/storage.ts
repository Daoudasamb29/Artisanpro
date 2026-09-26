import { ArtisanProfile, Client, Devis, Facture } from '../types';
import { initialArtisanProfile, initialClients, initialDevis, initialFactures } from '../data/mockData';
import { genererNumeroDevis, genererNumeroFacture } from './formatters';

const STORAGE_KEYS = {
  PROFILE: 'artisanpro_profile',
  CLIENTS: 'artisanpro_clients',
  DEVIS: 'artisanpro_devis',
  FACTURES: 'artisanpro_factures',
  AUTH: 'artisanpro_auth',
};

export function loadProfile(): ArtisanProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return initialArtisanProfile;
}

export function saveProfile(profile: ArtisanProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function loadClients(): Client[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return initialClients;
}

export function saveClients(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  } catch (e) {
    console.error(e);
  }
}

export function loadDevis(): Devis[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEVIS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return initialDevis;
}

export function saveDevis(devis: Devis[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DEVIS, JSON.stringify(devis));
  } catch (e) {
    console.error(e);
  }
}

export function loadFactures(): Facture[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FACTURES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return initialFactures;
}

export function saveFactures(factures: Facture[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FACTURES, JSON.stringify(factures));
  } catch (e) {
    console.error(e);
  }
}

export function loadIsAuthenticated(): boolean {
  try {
    const auth = localStorage.getItem(STORAGE_KEYS.AUTH);
    return auth === 'true';
  } catch (e) {
    return false;
  }
}

export function saveIsAuthenticated(auth: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, auth ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
}
