import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from './en/translation';
import { zh } from './zh/translation';

export const resources = { en, zh };

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources,
  defaultNS: 'common',
  fallbackLng: 'en',
});
