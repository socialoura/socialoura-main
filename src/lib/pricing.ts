/**
 * Multi-Currency Pricing Engine
 * 
 * Converts EUR base prices to local currencies with:
 * - Fixed exchange rates (manually updated)
 * - 10% margin to cover FX fees
 * - Psychological rounding (.49 / .99)
 */

// ─── Supported currencies ────────────────────────────────────────────────────
export type SupportedCurrency = 
  | 'eur' | 'gbp' | 'usd' | 'chf' | 'cad' | 'aud' | 'nzd' | 'jpy' 
  | 'cny' | 'inr' | 'brl' | 'mxn' | 'krw' | 'sek' | 'nok' | 'dkk' 
  | 'pln' | 'czk' | 'huf' | 'ron' | 'try' | 'zar' | 'sgd' | 'hkd';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  symbolPosition: 'before' | 'after';
  rate: number;        // 1 EUR = X units of this currency
  zeroDecimal: boolean; // e.g. JPY has no decimals — not needed here but future-proof
}

// ─── Exchange rates (1 EUR = …) — update manually as needed ─────────────────
export const CURRENCIES: Record<SupportedCurrency, CurrencyConfig> = {
  eur: {
    code: 'eur',
    symbol: '€',
    symbolPosition: 'after',
    rate: 1,
    zeroDecimal: false,
  },
  gbp: {
    code: 'gbp',
    symbol: '£',
    symbolPosition: 'before',
    rate: 0.85,
    zeroDecimal: false,
  },
  usd: {
    code: 'usd',
    symbol: '$',
    symbolPosition: 'before',
    rate: 1.08,
    zeroDecimal: false,
  },
  chf: {
    code: 'chf',
    symbol: 'CHF ',
    symbolPosition: 'before',
    rate: 0.94,
    zeroDecimal: false,
  },
  cad: {
    code: 'cad',
    symbol: 'C$',
    symbolPosition: 'before',
    rate: 1.45,
    zeroDecimal: false,
  },
  aud: {
    code: 'aud',
    symbol: 'A$',
    symbolPosition: 'before',
    rate: 1.65,
    zeroDecimal: false,
  },
  nzd: {
    code: 'nzd',
    symbol: 'NZ$',
    symbolPosition: 'before',
    rate: 1.78,
    zeroDecimal: false,
  },
  jpy: {
    code: 'jpy',
    symbol: '¥',
    symbolPosition: 'before',
    rate: 160,
    zeroDecimal: true,
  },
  cny: {
    code: 'cny',
    symbol: '¥',
    symbolPosition: 'before',
    rate: 7.8,
    zeroDecimal: false,
  },
  inr: {
    code: 'inr',
    symbol: '₹',
    symbolPosition: 'before',
    rate: 90,
    zeroDecimal: false,
  },
  brl: {
    code: 'brl',
    symbol: 'R$',
    symbolPosition: 'before',
    rate: 5.4,
    zeroDecimal: false,
  },
  mxn: {
    code: 'mxn',
    symbol: 'MX$',
    symbolPosition: 'before',
    rate: 18.5,
    zeroDecimal: false,
  },
  krw: {
    code: 'krw',
    symbol: '₩',
    symbolPosition: 'before',
    rate: 1450,
    zeroDecimal: true,
  },
  sek: {
    code: 'sek',
    symbol: 'kr',
    symbolPosition: 'after',
    rate: 11.2,
    zeroDecimal: false,
  },
  nok: {
    code: 'nok',
    symbol: 'kr',
    symbolPosition: 'after',
    rate: 11.5,
    zeroDecimal: false,
  },
  dkk: {
    code: 'dkk',
    symbol: 'kr',
    symbolPosition: 'after',
    rate: 7.45,
    zeroDecimal: false,
  },
  pln: {
    code: 'pln',
    symbol: 'zł',
    symbolPosition: 'after',
    rate: 4.3,
    zeroDecimal: false,
  },
  czk: {
    code: 'czk',
    symbol: 'Kč',
    symbolPosition: 'after',
    rate: 25,
    zeroDecimal: false,
  },
  huf: {
    code: 'huf',
    symbol: 'Ft',
    symbolPosition: 'after',
    rate: 390,
    zeroDecimal: false,
  },
  ron: {
    code: 'ron',
    symbol: 'lei',
    symbolPosition: 'after',
    rate: 4.95,
    zeroDecimal: false,
  },
  try: {
    code: 'try',
    symbol: '₺',
    symbolPosition: 'before',
    rate: 35,
    zeroDecimal: false,
  },
  zar: {
    code: 'zar',
    symbol: 'R',
    symbolPosition: 'before',
    rate: 20,
    zeroDecimal: false,
  },
  sgd: {
    code: 'sgd',
    symbol: 'S$',
    symbolPosition: 'before',
    rate: 1.45,
    zeroDecimal: false,
  },
  hkd: {
    code: 'hkd',
    symbol: 'HK$',
    symbolPosition: 'before',
    rate: 8.4,
    zeroDecimal: false,
  },
};

// ─── Country → Currency mapping ──────────────────────────────────────────────
const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  // EUR zone
  FR: 'eur', DE: 'eur', ES: 'eur', IT: 'eur', NL: 'eur', BE: 'eur',
  AT: 'eur', PT: 'eur', IE: 'eur', FI: 'eur', GR: 'eur', LU: 'eur',
  SK: 'eur', SI: 'eur', EE: 'eur', LV: 'eur', LT: 'eur', MT: 'eur',
  CY: 'eur', HR: 'eur',
  // GBP
  GB: 'gbp',
  // USD
  US: 'usd',
  // CHF
  CH: 'chf',
  // CAD
  CA: 'cad',
  // AUD
  AU: 'aud',
  // NZD
  NZ: 'nzd',
  // JPY
  JP: 'jpy',
  // CNY
  CN: 'cny',
  // INR
  IN: 'inr',
  // BRL
  BR: 'brl',
  // MXN
  MX: 'mxn',
  // KRW
  KR: 'krw',
  // SEK
  SE: 'sek',
  // NOK
  NO: 'nok',
  // DKK
  DK: 'dkk',
  // PLN
  PL: 'pln',
  // CZK
  CZ: 'czk',
  // HUF
  HU: 'huf',
  // RON
  RO: 'ron',
  // TRY
  TR: 'try',
  // ZAR
  ZA: 'zar',
  // SGD
  SG: 'sgd',
  // HKD
  HK: 'hkd',
};

const DEFAULT_CURRENCY: SupportedCurrency = 'eur';

/**
 * Resolve a country code (ISO 3166-1 alpha-2) to a supported currency.
 */
export function countryToCurrency(countryCode: string | null | undefined): SupportedCurrency {
  if (!countryCode) return DEFAULT_CURRENCY;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? DEFAULT_CURRENCY;
}

// ─── Margin ──────────────────────────────────────────────────────────────────
const FX_MARGIN = 0.10; // 10%

// ─── Psychological rounding ──────────────────────────────────────────────────
/**
 * Rounds a price to .49 or .99 (psychological pricing).
 *
 * Rules:
 *   decimals .00–.49  → .49
 *   decimals .50–.99  → .99
 */
function psychologicalRound(price: number): number {
  const whole = Math.floor(price);
  const decimals = price - whole;

  if (decimals <= 0.49) {
    return whole + 0.49;
  }
  return whole + 0.99;
}

// ─── Main conversion function ────────────────────────────────────────────────
export interface ConvertedPrice {
  /** Display price (e.g. 9.49) */
  price: number;
  /** Amount in smallest currency unit for Stripe (e.g. 949) */
  amountInCents: number;
  /** Currency code lowercase (e.g. "gbp") */
  currency: SupportedCurrency;
  /** Formatted string for display (e.g. "£9.49" or "9,49€") */
  formatted: string;
}

/**
 * Convert a EUR price to a target currency with margin + psychological rounding.
 *
 * @param eurPrice    — Price in EUR (e.g. 9.99)
 * @param toCurrency  — Target currency code (e.g. "gbp")
 * @returns           — ConvertedPrice object
 *
 * Example flow for GBP:
 *   9.99 EUR × 0.85 = 8.4915
 *   8.4915 × 1.10   = 9.34065  (add 10% margin)
 *   psychological    = 9.49     (decimals .34 → .49)
 */
export function convertPrice(eurPrice: number, toCurrency: SupportedCurrency): ConvertedPrice {
  const config = CURRENCIES[toCurrency];

  // If already EUR, skip conversion but still apply psychological rounding
  if (toCurrency === 'eur') {
    return {
      price: eurPrice,
      amountInCents: Math.round(eurPrice * 100),
      currency: 'eur',
      formatted: formatPrice(eurPrice, config),
    };
  }

  // Step 1: Convert
  const converted = eurPrice * config.rate;

  // Step 2: Add margin
  const withMargin = converted * (1 + FX_MARGIN);

  // Step 3: Psychological rounding
  const rounded = psychologicalRound(withMargin);

  return {
    price: rounded,
    amountInCents: Math.round(rounded * 100),
    currency: toCurrency,
    formatted: formatPrice(rounded, config),
  };
}

/**
 * Format a numeric price with the correct symbol placement.
 */
export function formatPrice(price: number, configOrCurrency: CurrencyConfig | SupportedCurrency): string {
  const config = typeof configOrCurrency === 'string'
    ? CURRENCIES[configOrCurrency]
    : configOrCurrency;

  // Handle zero-decimal currencies (JPY, KRW)
  if (config.zeroDecimal) {
    const value = Math.round(price).toString();
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${value}`;
    }
    return `${value}${config.symbol}`;
  }

  const value = price.toFixed(2);
  if (config.symbolPosition === 'before') {
    return `${config.symbol}${value}`;
  }
  return `${value}${config.symbol}`;
}

/**
 * Format an amount in cents to a display string (used in PaymentModal).
 */
export function formatCentsToDisplay(amountInCents: number, currency: SupportedCurrency): string {
  const config = CURRENCIES[currency];
  
  // Handle zero-decimal currencies (JPY, KRW)
  if (config.zeroDecimal) {
    const value = Math.round(amountInCents / 100).toString();
    if (config.symbolPosition === 'before') {
      return `${config.symbol}${value}`;
    }
    return `${value}${config.symbol}`;
  }
  
  const value = (amountInCents / 100).toFixed(2);
  if (config.symbolPosition === 'before') {
    return `${config.symbol}${value}`;
  }
  return `${value}${config.symbol}`;
}

// ─── Cookie helpers ──────────────────────────────────────────────────────────
export const CURRENCY_COOKIE_NAME = 'user_currency';
export const COUNTRY_COOKIE_NAME = 'user_country';
