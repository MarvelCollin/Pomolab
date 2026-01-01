export interface ILocale {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
  availableLocales: string[];
}
