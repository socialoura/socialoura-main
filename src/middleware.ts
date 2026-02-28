import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr', 'de'];
const defaultLocale = 'fr';

// Country → currency mapping (lightweight, no imports from lib to keep middleware edge-compatible)
const COUNTRY_CURRENCY: Record<string, string> = {
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
  // All other countries default to EUR
};
const DEFAULT_CURRENCY = 'eur';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip locale handling for admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // ─── Country / Currency detection ────────────────────────────────────
  const existingCountry = request.cookies.get('user_country')?.value;
  const detectedCountry = (request.headers.get('x-vercel-ip-country') || 'FR').toUpperCase();
  const detectedCurrency = COUNTRY_CURRENCY[detectedCountry] || DEFAULT_CURRENCY;

  // Update cookies if country changed or cookies missing
  const needsUpdate = !existingCountry || existingCountry !== detectedCountry;

  let response: NextResponse | undefined;

  // Check if the pathname is just '/'
  if (pathname === '/') {
    response = NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Check if the pathname starts with a locale
  if (!response) {
    const pathnameHasLocale = locales.some(
      (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (!pathnameHasLocale) {
      response = NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
    }
  }

  // If no redirect needed, just continue
  if (!response) {
    response = NextResponse.next();
  }

  // Always set currency cookies when country changes (or on first visit)
  if (needsUpdate) {
    response.cookies.set('user_currency', detectedCurrency, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
    response.cookies.set('user_country', detectedCountry, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\..*|fonts).*)',
  ],
};
