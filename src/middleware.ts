import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'fr'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip locale handling for admin routes
  if (pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Check if the pathname is just '/'
  if (pathname === '/') {
    // Redirect to default locale
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // If the path doesn't start with a locale and isn't '/', redirect to default locale
  return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|.*\\..*|fonts).*)',
  ],
};
