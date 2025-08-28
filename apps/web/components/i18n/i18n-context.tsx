'use client';
import { createContext } from 'react';
import type { Dictionary } from '../../lib/i18n/get-dictionary';
import { Locale } from '../../lib/i18n/settings';

export interface I18nValue {
  locale: Locale;
  dictionary: Dictionary;
  t: (key: string) => string;
}

export const I18nContext = createContext<I18nValue | undefined>(undefined);
