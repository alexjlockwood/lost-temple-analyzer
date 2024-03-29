import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { ar } from './ar';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fi } from './fi';
import { fr } from './fr';
import { he } from './he';
import { id } from './id';
import { it } from './it';
import { ko } from './ko';
import { nb } from './nb';
import { nl } from './nl';
import { pl } from './pl';
import { ru } from './ru';
import { sv } from './sv';
import { zh } from './zh';
import { ja } from './ja';

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: { ar, de, en, es, fi, fr, he, id, it, ko, nb, nl, pl, ru, sv, zh, ja },
  defaultNS: 'common',
  fallbackLng: 'en',
});
