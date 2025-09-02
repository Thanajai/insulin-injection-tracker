import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'es' | 'fr' | 'de' | 'hi';

// Fix: Define base keys for pluralization which are used in `useTimeAgo` hook.
type PluralBaseKeys = 'yearsAgo' | 'monthsAgo' | 'daysAgo' | 'hoursAgo' | 'minutesAgo' | 'secondsAgo';

// Fix: Widen TranslationKey to accept the plural base keys.
type TranslationKey = keyof typeof translations.en | PluralBaseKeys;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Fix: Use the widened TranslationKey type for the `key` parameter.
  t: (key: TranslationKey, replacements?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: Language[] = ['en', 'es', 'fr', 'de', 'hi'];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
     if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (supportedLanguages.includes(savedLang)) {
        return savedLang;
      }
      const browserLang = navigator.language.split(/[-_]/)[0] as Language;
      if (supportedLanguages.includes(browserLang)) {
        return browserLang;
      }
    }
    return 'en';
  });
  
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  }

  const t = useCallback((key: TranslationKey, replacements?: { [key: string]: string | number }) => {
    // Fix: Use `string` for `textKey` as it can be a constructed plural key.
    let textKey: string = key;
    
    // Robust pluralization handling
    if (replacements?.count !== undefined) {
        const suffix = replacements.count === 1 ? '_one' : '_other';
        const pluralKey = `${key}${suffix}`;
        const langTranslations = translations[language] as any;
        if (langTranslations[pluralKey]) {
            textKey = pluralKey;
        }
    }
    
    // Fix: Use `any` for dictionary access to avoid type errors with constructed keys.
    let text = (translations[language] as any)[textKey] || (translations.en as any)[textKey] || key;
    
    if (replacements) {
        Object.entries(replacements).forEach(([replaceKey, value]) => {
            text = text.replace(new RegExp(`{\\s*${replaceKey}\\s*}`, 'g'), String(value));
        });
    }
    return text;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
