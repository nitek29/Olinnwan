'use client';
import { useContext } from 'react';
import { I18nContext } from './i18n-context';

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('I18nContext missing provider');
  return ctx;
}
