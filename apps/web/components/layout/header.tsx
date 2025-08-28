'use client';
import Link from 'next/link';
import { useI18n } from '../i18n/use-i18n';
import { LanguageSelector } from '../i18n/language-selector';

export function Header() {
  const { t, locale } = useI18n();
  return (
    <header
      style={{
        display: 'flex',
        gap: 24,
        padding: '12px 24px',
        alignItems: 'center',
        borderBottom: '1px solid #222',
      }}
    >
      <nav style={{ display: 'flex', gap: 16 }}>
        <Link href={`/${locale}`}>{t('navigation.home')}</Link>
        <Link href={`/${locale}/about`}>{t('navigation.about')}</Link>
        <Link href={`/${locale}/settings`}>{t('navigation.settings')}</Link>
      </nav>
      <div style={{ marginLeft: 'auto' }}>
        <LanguageSelector />
      </div>
    </header>
  );
}
