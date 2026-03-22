import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
// 1. Добавляем HTTP Backend
import HttpBackend from 'i18next-http-backend'

import { Tolgee, FormatSimple, BackendFetch } from '@tolgee/web' 
import { InContextTools } from '@tolgee/web/tools' 
import { withTolgee } from '@tolgee/i18next'

// Статичные импорты удаляем - они больше не нужны!
// import ruCommon from '@/locales/ru/common.json'
// import enCommon from '@/locales/en/common.json'
// import kzCommon from '@/locales/kz/common.json'

const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('editor_key');
const urlFromUrl = urlParams.get('tolgee_url'); 

if (keyFromUrl) {
  sessionStorage.setItem('tolgeeApiKey', keyFromUrl);
  const apiUrlToSave = urlFromUrl || import.meta.env.VITE_TOLGEE_API_URL || 'http://localhost:8080';
  sessionStorage.setItem('tolgeeApiUrl', apiUrlToSave);
  window.history.replaceState({}, document.title, window.location.pathname);
}

const savedApiKey = sessionStorage.getItem('tolgeeApiKey');
const savedApiUrl = sessionStorage.getItem('tolgeeApiUrl');

const isEditMode = Boolean(savedApiKey && savedApiUrl);

export let tolgee: any = null;

if (isEditMode) {
  tolgee = Tolgee()
    .use(InContextTools()) 
    .use(BackendFetch())   
    .use(FormatSimple())
    .init({
      apiUrl: savedApiUrl as string,
      apiKey: savedApiKey as string,
      defaultLanguage: 'ru',
      defaultNs: 'common',
    });

  withTolgee(i18n as any, tolgee);
  tolgee.run(); 
}

const CDN_URL = 'http://89.207.255.17/minio/locales/a93214cc6e77fa276a30db6d738c9b3d';

i18n
  .use(HttpBackend) 
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: `${CDN_URL}/{{ns}}/{{lng}}.json`,
      crossDomain: true 
    },
    
    lng: 'ru',
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common'],
    
    partialBundledLanguages: true, 

    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;