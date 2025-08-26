// Main i18n configuration and utilities
export { getOptions, languages, cookieName, fallbackLng } from './config';
export type { Language } from './config';

// Client-side hook for React components
export { useTranslation as useClientTranslation } from './i18n-client';

// Server-side utilities for App Router
export { useTranslation as useServerTranslation } from './i18n-server';
