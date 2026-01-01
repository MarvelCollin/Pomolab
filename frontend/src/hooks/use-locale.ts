import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const useLocale = () => {
  const [locale, setLocaleState] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const availableLocales = ['en', 'id'];

  useEffect(() => {
    // Load locale from localStorage or default to 'en'
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocaleState(savedLocale);
    loadTranslations(savedLocale);
  }, []);

  const loadTranslations = async (lang: string) => {
    try {
      // Import translations dynamically
      const translations = await import(`../locales/${lang}.json`);
      setTranslations(translations.default);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to English if translations fail to load
      if (lang !== 'en') {
        const fallback = await import('../locales/en.json');
        setTranslations(fallback.default);
      }
    }
  };

  const setLocale = async (newLocale: string) => {
    if (!availableLocales.includes(newLocale)) {
      console.error('Invalid locale:', newLocale);
      return;
    }

    try {
      // Update locale in backend
      const response = await fetch(`${API_URL}/api/locale`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (!response.ok) {
        throw new Error('Failed to set locale');
      }
      
      // Update local state
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      
      // Load new translations
      await loadTranslations(newLocale);
    } catch (error) {
      console.error('Failed to set locale:', error);
    }
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

  return {
    locale,
    setLocale,
    t,
    availableLocales,
  };
};
