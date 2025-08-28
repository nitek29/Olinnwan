import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n, Locale, localeCookieName } from './lib/i18n/settings';

function isSupportedLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}

function getPreferredLocaleFromHeader(request: NextRequest): Locale | null {
  const accept = request.headers.get('accept-language');
  if (accept) {
    const preferred = accept
      .split(',')
      .map((p) => p.split(';')[0]?.trim() ?? '')
      .filter((p) => p.length > 0);
    for (const pref of preferred) {
      const base = pref.split('-')[0] ?? '';
      if (isSupportedLocale(pref)) return pref;
      if (isSupportedLocale(base)) return base;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore next internal, api, assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const localeInPath = pathSegments[0];

  if (!localeInPath || !isSupportedLocale(localeInPath)) {
    // 1. Cookie
    const cookieLocale = request.cookies.get(localeCookieName)?.value;
    if (cookieLocale && isSupportedLocale(cookieLocale)) {
      const newUrl = new URL(`/${cookieLocale}${pathname}`, request.url);
      return NextResponse.redirect(newUrl);
    }

    // 2. Accept-Language header
    const headerLocale = getPreferredLocaleFromHeader(request);
    if (headerLocale) {
      const newUrl = new URL(`/${headerLocale}${pathname}`, request.url);
      return NextResponse.redirect(newUrl);
    }

    // 3. Fallback default
    const locale = i18n.defaultLocale as Locale;
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(newUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico).*)',
  ],
};
