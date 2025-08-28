import { headers, cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { i18n, localeCookieName, Locale } from '../lib/i18n/settings';

function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}

export default async function RootRedirect() {
  const hdrs = await headers();
  const cookieStore = await cookies();

  // 1. Cookie
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    redirect(`/${cookieLocale}`);
  }

  // 2. Header
  const accept = hdrs.get('accept-language') || '';
  const tokens = accept
    .split(',')
    .map((p) => p.split(';')[0]?.trim() ?? '')
    .filter(Boolean);
  for (const pref of tokens) {
    if (isLocale(pref)) redirect(`/${pref}`);
    const base = pref.split('-')[0] ?? '';
    if (isLocale(base)) redirect(`/${base}`);
  }

  // 3. Fallback
  redirect(`/${i18n.defaultLocale}`);
}
