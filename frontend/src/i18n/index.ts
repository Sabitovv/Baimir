import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// ИСПРАВЛЕНИЕ 1: Убрали BackendFetch из импорта
import { Tolgee, FormatSimple } from '@tolgee/web';
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

export const isEditMode = Boolean(savedApiKey && savedApiUrl);

export let tolgee: any = null;

const CDN_URL = 'http://89.207.255.17/minio/locales/814bc1c3f9019b399682693b66a4ffa5';

if (isEditMode) {
  tolgee = Tolgee()
    .use(InContextTools()) 
    // ИСПРАВЛЕНИЕ 2: Полностью удалили строку .use(BackendFetch(...))
    .use(FormatSimple())
    .init({
      apiUrl: savedApiUrl as string,
      apiKey: savedApiKey as string,
      defaultLanguage: 'ru',
      defaultNs: 'translation',
    });

  withTolgee(i18n as any, tolgee);
} else {
  // В обычном режиме за загрузку файлов отвечает i18next-http-backend
  i18n.use(HttpBackend);
}

export const setupI18n = async () => {
  if (isEditMode && tolgee) {
    try {
      // Теперь Tolgee не будет искать файлы на MinIO, а сразу обратится к своему API
      await tolgee.run();
    } catch (error) {
      console.warn('[I18N DEBUG] Tolgee failed to load API records. Continuing anyway...', error);
    }
  }

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: !isEditMode ? {
      loadPath: `${CDN_URL}/{{ns}}/{{lng}}.json`, 
      crossDomain: true 
    } : undefined,
          
      lng: 'ru',
      fallbackLng: 'ru',
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