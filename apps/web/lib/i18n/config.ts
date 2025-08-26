export const defaultNS = 'common';
export const cookieName = 'i18next';
export const fallbackLng = 'fr';
export const languages = ['fr', 'en', 'es', 'pt'] as const;

export type Language = (typeof languages)[number];

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    load: 'languageOnly' as const,
  };
}
