import { createI18n } from 'vue-i18n';
import en from './en.json';
import es from './es.json';

const savedLang = localStorage.getItem('appLang') ?? 'es';

export const i18n = createI18n({
  legacy: false,
  locale: savedLang,
  fallbackLocale: 'en',
  messages: { en, es },
});

export const languageOptions = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' },
];
