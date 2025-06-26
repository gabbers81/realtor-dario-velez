import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files - Spanish
import commonEs from '../locales/es/common.json';
import homeEs from '../locales/es/home.json';
import contactEs from '../locales/es/contact.json';
import projectsEs from '../locales/es/projects.json';
import legalEs from '../locales/es/legal.json';

// Import translation files - English
import commonEn from '../locales/en/common.json';
import homeEn from '../locales/en/home.json';
import contactEn from '../locales/en/contact.json';
import projectsEn from '../locales/en/projects.json';
import legalEn from '../locales/en/legal.json';

// Import translation files - Russian
import commonRu from '../locales/ru/common.json';
import homeRu from '../locales/ru/home.json';
import contactRu from '../locales/ru/contact.json';
import projectsRu from '../locales/ru/projects.json';
import legalRu from '../locales/ru/legal.json';

// Import translation files - French
import commonFr from '../locales/fr/common.json';
import homeFr from '../locales/fr/home.json';
import contactFr from '../locales/fr/contact.json';
import projectsFr from '../locales/fr/projects.json';
import legalFr from '../locales/fr/legal.json';

// Import translation files - German
import commonDe from '../locales/de/common.json';
import homeDe from '../locales/de/home.json';
import contactDe from '../locales/de/contact.json';
import projectsDe from '../locales/de/projects.json';
import legalDe from '../locales/de/legal.json';

// Import translation files - Portuguese
import commonPt from '../locales/pt/common.json';
import homePt from '../locales/pt/home.json';
import contactPt from '../locales/pt/contact.json';
import projectsPt from '../locales/pt/projects.json';
import legalPt from '../locales/pt/legal.json';

const resources = {
  es: {
    common: commonEs,
    home: homeEs,
    contact: contactEs,
    projects: projectsEs,
    legal: legalEs,
  },
  en: {
    common: commonEn,
    home: homeEn,
    contact: contactEn,
    projects: projectsEn,
    legal: legalEn,
  },
  ru: {
    common: commonRu,
    home: homeRu,
    contact: contactRu,
    projects: projectsRu,
    legal: legalRu,
  },
  fr: {
    common: commonFr,
    home: homeFr,
    contact: contactFr,
    projects: projectsFr,
    legal: legalFr,
  },
  de: {
    common: commonDe,
    home: homeDe,
    contact: contactDe,
    projects: projectsDe,
    legal: legalDe,
  },
  pt: {
    common: commonPt,
    home: homePt,
    contact: contactPt,
    projects: projectsPt,
    legal: legalPt,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;