import { getDictionary, Dictionary } from '@/lib/i18n/get-dictionary';
import { Locale } from '@/lib/i18n/settings';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const navigation = dict.navigation as Dictionary;
  return (
    <div style={{ padding: 32 }}>
      <h1>{navigation?.about as string}</h1>
      <p>{dict.description as string}</p>
    </div>
  );
}
