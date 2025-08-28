export const i18n = {
  defaultLocale: 'fr',
  locales: ['en', 'fr', 'es', 'pt'] as const,
};

// Cookie (and localStorage key) used to persist user language preference
export const localeCookieName = 'locale';

export type Locale = (typeof i18n)['locales'][number];
