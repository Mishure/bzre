'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ro' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'preferred_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ro');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === 'ro' || savedLanguage === 'en')) {
      setLanguageState(savedLanguage);
    }

    // Load initial translations
    loadTranslations(savedLanguage || 'ro');
  }, []);

  const loadTranslations = async (lang: Language) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
    loadTranslations(lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
