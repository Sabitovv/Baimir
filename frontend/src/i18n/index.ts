import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('editor_key');
const urlFromUrl = urlParams.get('tolgee_url');

console.log('[I18N DEBUG] URL Params:', { keyFromUrl: !!keyFromUrl, urlFromUrl });

if (keyFromUrl) {
  sessionStorage.setItem('tolgeeApiKey', keyFromUrl);
  const apiUrlToSave = urlFromUrl || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
  sessionStorage.setItem('tolgeeApiUrl', apiUrlToSave);
  window.history.replaceState({}, document.title, window.location.pathname);
  console.log('[I18N DEBUG] Saved credentials to sessionStorage:', { apiUrlToSave });
}

const savedApiKey = sessionStorage.getItem('tolgeeApiKey');
const savedApiUrl = sessionStorage.getItem('tolgeeApiUrl');

export const isEditMode = Boolean(savedApiKey && savedApiUrl);
console.log('[I18N DEBUG] isEditMode:', isEditMode);

const CDN_URL = 'http://89.207.255.17/minio/locales/814bc1c3f9019b399682693b66a4ffa5';

if (!isEditMode) {
  i18n.use(HttpBackend);
}

export const initializeTolgee = async () => {
  if (!isEditMode) {
    console.log('[I18N DEBUG] Not in edit mode, skipping Tolgee initialization.');
    return null;
  }

  console.log('[I18N DEBUG] Starting Tolgee initialization...');

  try {
    const [{ Tolgee, FormatSimple, BackendFetch }, { InContextTools }, { withTolgee }] = await Promise.all([
      import('@tolgee/web'),
      import('@tolgee/web/tools'),
      import('@tolgee/i18next'),
    ]);
    
    console.log('[I18N DEBUG] Tolgee packages imported successfully.');

    const tolgee = Tolgee()
      .use(InContextTools())
      .use(BackendFetch())
      .use(FormatSimple())
      .init({
        apiUrl: savedApiUrl as string,
        apiKey: savedApiKey as string,
        defaultLanguage: 'ru',
      });

    withTolgee(i18n as any, tolgee);
    
    console.log('[I18N DEBUG] Tolgee initialized, running fetch...');
    await tolgee.run();
    console.log('[I18N DEBUG] Tolgee fetch completed successfully!');

    return tolgee;
  } catch (error) {
    console.error('[I18N DEBUG] ERROR INITIALIZING TOLGEE:', error);
    throw error;
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true, // Включаем встроенное логирование i18next
    backend: !isEditMode ? {
      loadPath: `${CDN_URL}/{{lng}}.json`,
      crossDomain: true 
    } : undefined,
    
    lng: 'ru',
    fallbackLng: 'ru',
    
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