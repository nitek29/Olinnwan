'use client';
import { ReactNode, useMemo } from 'react';
import { I18nContext } from './i18n-context';
import type { Dictionary } from '../../lib/i18n/get-dictionary';
import { Locale } from '../../lib/i18n/settings';

function translate(dictionary: Dictionary, key: string): string {
  const parts = key.split('.');
  let current: string | Dictionary | undefined = dictionary;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      const nextValue = (current as Dictionary)[part];
      current = nextValue as typeof current;
    } else {
      return key; // fallback to key when path missing
    }
  }
  return typeof current === 'string' ? current : key;
}

export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({
      locale,
      dictionary,
      t: (key: string): string => translate(dictionary, key),
    }),
    [locale, dictionary]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
