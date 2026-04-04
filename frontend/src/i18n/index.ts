import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

import { Tolgee, FormatSimple, BackendFetch } from '@tolgee/web';
import { InContextTools } from '@tolgee/web/tools';
import { withTolgee } from '@tolgee/i18next';

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

const CDN_URL = 'http://89.207.255.17/minio/locales/814bc1c3f9019b399682693b66a4ffa5';

if (isEditMode) {
  tolgee = Tolgee()
    .use(InContextTools()) 
    .use(BackendFetch())   
    .use(FormatSimple())
    .init({
      apiUrl: savedApiUrl as string,
      apiKey: savedApiKey as string,
      defaultLanguage: 'ru',
      // ИСПРАВЛЕНИЕ 1: Сообщаем Tolgee, что дефолтное пространство имен - 'translation' (как в i18next)
      defaultNs: 'translation', 
    });

  withTolgee(i18n as any, tolgee);
} else {
  i18n.use(HttpBackend);
}

export const setupI18n = async () => {
  // ИСПРАВЛЕНИЕ 2: Ожидаем загрузки переводов из Tolgee до инициализации i18n
  if (isEditMode && tolgee) {
    await tolgee.run();
  }

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: !isEditMode ? {
        // ИСПРАВЛЕНИЕ 3: Убрали {{ns}}, так как у вас файлы лежат в корне (ru.json, kz.json)
        loadPath: `${CDN_URL}/{{lng}}.json`,
        crossDomain: true 
      } : undefined,
      
      lng: 'ru',
      fallbackLng: 'ru',
      
      // ИСПРАВЛЕНИЕ 4: i18next теперь тоже смотрит в 'translation' по умолчанию
      defaultNS: 'translation',
      ns: ['translation'],
      
      partialBundledLanguages: true, 

      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        caches: ['localStorage', 'cookie'],
      }
    });
};

export default i18n;