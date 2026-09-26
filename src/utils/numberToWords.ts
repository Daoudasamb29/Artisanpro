/**
 * Converts a number into French words for Senegalese FCFA receipts
 * e.g., 50000 -> "cinquante mille francs CFA"
 */

const UNITS = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'
];

const TENS = [
  '', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'
];

function convertLessThanHundred(n: number): string {
  if (n < 20) return UNITS[n];

  const ten = Math.floor(n / 10);
  const unit = n % 10;

  if (ten === 7) {
    if (unit === 1) return 'soixante et onze';
    return `soixante-${UNITS[10 + unit]}`;
  }

  if (ten === 8) {
    if (unit === 0) return 'quatre-vingts';
    return `quatre-vingt-${UNITS[unit]}`;
  }

  if (ten === 9) {
    return `quatre-vingt-${UNITS[10 + unit]}`;
  }

  if (unit === 0) return TENS[ten];
  if (unit === 1) return `${TENS[ten]} et un`;
  return `${TENS[ten]}-${UNITS[unit]}`;
}

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';
  if (n < 100) return convertLessThanHundred(n);

  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  let prefix = '';
  if (hundred === 1) {
    prefix = 'cent';
  } else {
    prefix = `${UNITS[hundred]} cent${remainder === 0 ? 's' : ''}`;
  }

  if (remainder === 0) return prefix;
  return `${prefix} ${convertLessThanHundred(remainder)}`;
}

export function nombreEnLettres(montant: number, withDevise: boolean = true): string {
  if (isNaN(montant) || montant === 0) {
    return withDevise ? 'zéro franc CFA' : 'zéro';
  }

  let n = Math.abs(Math.round(montant));
  let parts: string[] = [];

  // Milliards
  const milliards = Math.floor(n / 1_000_000_000);
  n %= 1_000_000_000;
  if (milliards > 0) {
    if (milliards === 1) {
      parts.push('un milliard');
    } else {
      parts.push(`${convertLessThanThousand(milliards)} milliards`);
    }
  }

  // Millions
  const millions = Math.floor(n / 1_000_000);
  n %= 1_000_000;
  if (millions > 0) {
    if (millions === 1) {
      parts.push('un million');
    } else {
      parts.push(`${convertLessThanThousand(millions)} millions`);
    }
  }

  // Milliers
  const milliers = Math.floor(n / 1_000);
  n %= 1_000;
  if (milliers > 0) {
    if (milliers === 1) {
      parts.push('mille');
    } else {
      parts.push(`${convertLessThanThousand(milliers)} mille`);
    }
  }

  // Centaines et unités
  if (n > 0) {
    parts.push(convertLessThanThousand(n));
  }

  const texte = parts.filter(Boolean).join(' ').trim();

  if (!withDevise) {
    return texte;
  }

  const devise = Math.abs(Math.round(montant)) <= 1 ? 'franc CFA' : 'francs CFA';
  return `${texte} ${devise}`;
}

export function formatMontantChiffresEtLettres(montant: number): string {
  if (isNaN(montant) || montant <= 0) return '';
  const chiffres = Math.round(montant)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const lettres = nombreEnLettres(montant);
  return `${chiffres} FCFA — ${lettres}`;
}
