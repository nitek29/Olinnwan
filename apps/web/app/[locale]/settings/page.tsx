import { getDictionary, Dictionary } from '@/lib/i18n/get-dictionary';
import { Locale } from '@/lib/i18n/settings';

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const navigation = dict.navigation as Dictionary;
  const common = dict.common as Dictionary;
  return (
    <div style={{ padding: 32 }}>
      <h1>{navigation?.settings as string}</h1>
      <p>{common?.loading as string}</p>
    </div>
  );
}
