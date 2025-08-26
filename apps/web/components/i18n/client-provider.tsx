'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';

interface ClientI18nProviderProps {
  children: ReactNode;
  locale?: string;
}

export default function ClientI18nProvider({
  children,
  locale = 'fr',
}: ClientI18nProviderProps) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    if (i18next.isInitialized) {
      setIsI18nInitialized(true);
      if (locale && i18next.language !== locale) {
        i18next.changeLanguage(locale);
      }
    } else {
      const onInitialized = () => {
        setIsI18nInitialized(true);
        if (locale && i18next.language !== locale) {
          i18next.changeLanguage(locale);
        }
      };

      i18next.on('initialized', onInitialized);
      return () => i18next.off('initialized', onInitialized);
    }
  }, [locale]);

  if (!isI18nInitialized) {
    return <div>Loading translations...</div>;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
