'use client';

import { useState } from 'react';
import { useTranslation } from '../../lib/i18n/i18n-client';
import { languages, Language } from '../../lib/i18n/config';

interface LanguageSelectorProps {
  currentLocale: string;
}

const languageNames: Record<Language, string> = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  pt: 'Português',
};

export default function LanguageSelector({
  currentLocale,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: Language) => {
    i18n.changeLanguage(locale);
    setIsOpen(false);
  };

  const currentLanguage = languages.includes(currentLocale as Language)
    ? (currentLocale as Language)
    : 'fr';

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {languageNames[currentLanguage]}
        <svg
          className="w-5 h-5 ml-2 -mr-1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white border border-gray-300 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`${
                  locale === currentLanguage
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700'
                } block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 hover:text-gray-900`}
                role="menuitem"
              >
                {languageNames[locale]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
