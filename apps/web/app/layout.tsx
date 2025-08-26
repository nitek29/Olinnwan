import type { Metadata } from 'next';
import localFont from 'next/font/local';
import ClientI18nProvider from '../components/i18n/client-provider';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Olinnwan - Modern Dofus Application',
  description: 'Modern web application for Dofus by Ankama Games',
};

// Function to detect language from request headers
function detectLanguage(): string {
  // In a real app, you'd want to detect from headers, cookies, etc.
  // For now, we'll default to French
  return 'fr';
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = detectLanguage();

  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClientI18nProvider locale={lang}>{children}</ClientI18nProvider>
      </body>
    </html>
  );
}
