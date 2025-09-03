import { ReactNode } from 'react';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { Locale, i18n } from '@/lib/i18n/settings';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { Header } from '@/components/layout/header';

export async function generateStaticParams() {
  return i18n.locales.map((locale: Locale) => ({ locale }));
}

export default async function LocaleLayout(props: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await props.params;
  const dictionary = await getDictionary(locale);
  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <Header />
      {props.children}
    </I18nProvider>
  );
}
