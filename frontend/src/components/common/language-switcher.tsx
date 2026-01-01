import React from 'react';
import { useLocale } from '../../hooks/use-locale';

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale, t, availableLocales } = useLocale();

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale);
  };

  const getLanguageName = (lang: string): string => {
    return lang === 'en' ? t('language.english') : t('language.indonesian');
  };

  return (
    <div className="language-switcher">
      <select
        value={locale}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="language-select"
      >
        {availableLocales.map((lang) => (
          <option key={lang} value={lang}>
            {getLanguageName(lang)}
          </option>
        ))}
      </select>
    </div>
  );
};
