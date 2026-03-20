import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { Tolgee, DevTools, FormatSimple } from '@tolgee/web'
import { withTolgee } from '@tolgee/i18next'

import ruCommon from '@/locales/ru/common.json'
import enCommon from '@/locales/en/common.json'
import kzCommon from '@/locales/kz/common.json'

// 1. Ловим ключ И URL из адресной строки
const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('editor_key');
const urlFromUrl = urlParams.get('tolgee_url'); // Ловим URL

if (keyFromUrl) {
  // Сохраняем ключ
  sessionStorage.setItem('tolgeeApiKey', keyFromUrl);
  
  // Сохраняем URL (если передали из админки) ИЛИ берем из .env ИЛИ ставим дефолт
  const apiUrlToSave = urlFromUrl || import.meta.env.VITE_TOLGEE_API_URL || 'http://localhost:8080';
  sessionStorage.setItem('tolgeeApiUrl', apiUrlToSave);
  
  // Очищаем URL
  window.history.replaceState({}, document.title, window.location.pathname);
}

// 2. Достаем данные из сессии
const savedApiKey = sessionStorage.getItem('tolgeeApiKey');
const savedApiUrl = sessionStorage.getItem('tolgeeApiUrl');

export let tolgee: any = null;

// 3. Включаем Tolgee, только если есть ключ и URL
if (savedApiKey && savedApiUrl) {
  tolgee = Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      apiUrl: savedApiUrl,
      apiKey: savedApiKey,
    });

  withTolgee(i18n as any, tolgee);
}

// 4. Стандартная инициализация
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
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
    }
  });

export default i18n;