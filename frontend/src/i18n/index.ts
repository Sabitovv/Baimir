import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// 1. Возвращаем DevTools, так как Nginx теперь пропускает WebSockets!
import { Tolgee, FormatSimple, DevTools } from '@tolgee/web' 
import { withTolgee } from '@tolgee/i18next'

import ruCommon from '@/locales/ru/common.json'
import enCommon from '@/locales/en/common.json'
import kzCommon from '@/locales/kz/common.json'

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

export let tolgee: any = null;

if (savedApiKey && savedApiUrl) {
  tolgee = Tolgee()
    .use(DevTools()) // <--- Используем мощный DevTools
    .use(FormatSimple())
    .init({
      apiUrl: savedApiUrl,
      apiKey: savedApiKey,
      defaultLanguage: 'ru',
      defaultNs: 'common', // <--- Подсказываем Tolgee ваш namespace
    });

  withTolgee(i18n as any, tolgee);
  
  tolgee.run(); 
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { common: ruCommon },
      en: { common: enCommon },
      kk: { common: kzCommon },
    },
    lng: 'ru',
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common'],
    
    // ====================================================
    // 2. САМОЕ ВАЖНОЕ: Разрешаем скачивать обновления поверх локальных файлов!
    partialBundledLanguages: true, 
    // ====================================================

    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;