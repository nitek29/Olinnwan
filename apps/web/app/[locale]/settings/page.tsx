import { getDictionary } from '../../../lib/i18n/get-dictionary';
import { Locale } from '../../../lib/i18n/settings';

export default async function SettingsPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(params.locale);
  return (
    <div style={{ padding: 32 }}>
      <h1>{dict.navigation?.settings as string}</h1>
      <p>{dict.common?.loading as string}</p>
    </div>
  );
}
