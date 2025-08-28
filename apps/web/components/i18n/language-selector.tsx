'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { i18n, localeCookieName, Locale } from '../../lib/i18n/settings';

function isLocale(value: string): value is Locale {
  return (i18n.locales as readonly string[]).includes(value);
}
import { useI18n } from './use-i18n';

export function LanguageSelector() {
  const { locale } = useI18n();
  const router = useRouter();
  const pathname = usePathname();

  // On mount, if a stored preference exists and differs from current URL locale, navigate.
  useEffect(() => {
    try {
      const stored =
        (typeof window !== 'undefined' &&
          window.localStorage.getItem(localeCookieName)) ||
        undefined;
      if (stored && stored !== locale && isLocale(stored)) {
        const segments = pathname.split('/');
        segments[1] = stored;
        router.replace(segments.join('/'));
      }
    } catch {
      // ignore
    }
  }, [locale, pathname, router]);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value as Locale;
    // Persist preference (client-side only)
    try {
      document.cookie = `${localeCookieName}=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365}`; // 1 year
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(localeCookieName, nextLocale);
      }
    } catch {
      // ignore persistence errors
    }
    // Replace the locale segment (assumes /{locale}/...)
    const segments = pathname.split('/');
    segments[1] = nextLocale; // first segment after leading slash
    router.push(segments.join('/'));
  }

  return (
    <select onChange={onChange} value={locale} style={{ padding: 4 }}>
      {i18n.locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
