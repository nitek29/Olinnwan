'use client';

import Image, { type ImageProps } from 'next/image';
import { Button } from '@repo/ui/button';
import { useTranslation } from '../lib/i18n/i18n-client';
import LanguageSelector from '../components/i18n/language-selector';
import styles from './page.module.css';
import { useEffect, useState } from 'react';

type Props = Omit<ImageProps, 'src'> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;

  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const [currentLocale, setCurrentLocale] = useState('fr');

  useEffect(() => {
    if (i18n.language) {
      setCurrentLocale(i18n.language);
    }
  }, [i18n.language]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <LanguageSelector currentLocale={currentLocale} />
        </div>

        <ThemeImage
          className={styles.logo}
          srcLight="turborepo-dark.svg"
          srcDark="turborepo-light.svg"
          alt="Turborepo logo"
          width={180}
          height={38}
          priority
        />

        <h1>{t('welcome')}</h1>
        <p>{t('description')}</p>

        <ol>
          <li>
            Get started by editing <code>apps/web/app/page.tsx</code>
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <div className={styles.ctas}>
          <Button appName="web">{t('actions.save')}</Button>
        </div>
      </main>
    </div>
  );
}
