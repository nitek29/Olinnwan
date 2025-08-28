import { getDictionary } from '../../../lib/i18n/get-dictionary';
import { Locale } from '../../../lib/i18n/settings';

export default async function AboutPage({
  params,
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(params.locale);
  return (
    <div style={{ padding: 32 }}>
      <h1>{dict.navigation?.about as string}</h1>
      <p>{dict.description as string}</p>
    </div>
  );
}
