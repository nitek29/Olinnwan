import 'server-only';
import { Locale } from './settings';

// Recursive dictionary of translation strings.
export interface Dictionary {
  [key: string]: string | Dictionary;
}

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const dict = (await import(`../../public/locales/${locale}/common.json`).then(
    (m) => m.default
  )) as Dictionary;
  return dict;
}
