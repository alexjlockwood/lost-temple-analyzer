import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { en } from './en/translation';
import { es } from './es/translation';
import { ko } from './ko/translation';
import { sv } from './sv/translation';
import { zh } from './zh/translation';

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { en, es, ko, sv, zh },
  defaultNS: 'common',
  fallbackLng: 'en',
});
