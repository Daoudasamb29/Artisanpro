import { Devis, Facture, LigneMateriau } from '../types';

/**
 * Format an integer or float amount into Senegalese FCFA string
 * e.g., 118000 -> "118 000 FCFA"
 */
export function formatFCFA(montant: number, withSuffix: boolean = true): string {
  if (isNaN(montant)) return withSuffix ? '0 FCFA' : '0';
  const formatted = Math.round(montant)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return withSuffix ? `${formatted} FCFA` : formatted;
}

/**
 * Calculate totals for a devis or facture
 */
export function calculerTotaux(
  materiaux: LigneMateriau[],
  montantMainOeuvre: number,
  transport: number,
  estFormel: boolean,
  appliquerTva: boolean,
  tvaTaux: number = 0.18
) {
  const sousTotalMateriaux = materiaux.reduce(
    (sum, m) => sum + (m.quantite || 0) * (m.prixUnitaire || 0),
    0
  );
  const sousTotalMainOeuvre = montantMainOeuvre || 0;
  const sousTotalHt = sousTotalMateriaux + sousTotalMainOeuvre + (transport || 0);

  // If artisan is informal, VAT is NEVER applied
  const tva = estFormel && appliquerTva ? Math.round(sousTotalHt * tvaTaux) : 0;
  const totalTtc = sousTotalHt + tva;

  return {
    sousTotalMateriaux,
    sousTotalMainOeuvre,
    transport,
    sousTotalHt,
    tva,
    totalTtc,
  };
}

/**
 * Clean phone number for tel: or wa.me links
 * e.g., "+221 77 123 45 67" or "77 123 45 67" -> "221771234567"
 */
export function cleanSenegalPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('221')) {
    return digits;
  }
  return `221${digits}`;
}

/**
 * Build WhatsApp share link with prefilled text
 */
export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = cleanSenegalPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Sequential number generators
 */
export function genererNumeroDevis(count: number, annee: number = 2025): string {
  const seq = (count + 1).toString().padStart(4, '0');
  return `DEV-${annee}-${seq}`;
}

export function genererNumeroFacture(count: number, estFormel: boolean, annee: number = 2025): string {
  const prefix = estFormel ? 'FAC' : 'REC';
  const seq = (count + 1).toString().padStart(4, '0');
  return `${prefix}-${annee}-${seq}`;
}

/**
 * Formats a Date object or ISO string to French format
 * e.g., "25 Sept 2025"
 */
export function formatFrenchDate(dateStrOrObj: string | Date): string {
  const date = typeof dateStrOrObj === 'string' ? new Date(dateStrOrObj) : dateStrOrObj;
  if (isNaN(date.getTime())) return String(dateStrOrObj);

  const months = [
    'Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin',
    'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'
  ];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Export data to a downloadable CSV / Excel file
 */
export function exportToCSV(filename: string, rows: Array<Record<string, string | number>>) {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(';'),
    ...rows.map(row =>
      headers
        .map(header => {
          const val = row[header] ?? '';
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(';')
    ),
  ].join('\r\n');

  // Add BOM for Excel UTF-8 compatibility
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
