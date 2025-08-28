'use client';
import styles from '../page.module.css';
import Image from 'next/image';
import { Button } from '@repo/ui/button';
import { useI18n } from '../../components/i18n/use-i18n';
import { LanguageSelector } from '../../components/i18n/language-selector';

export default function HomePage() {
  const { t } = useI18n();
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="turborepo-dark.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />
        <h1>{t('welcome')}</h1>
        <p>{t('description')}</p>
        <ol>
          <li>
            Get started by editing <code>apps/web/app/[locale]/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>
        <div className={styles.ctas}>
          <Button appName="web">{t('actions.save')}</Button>
        </div>
        <div style={{ marginTop: 32 }}>
          <LanguageSelector />
        </div>
      </main>
    </div>
  );
}
