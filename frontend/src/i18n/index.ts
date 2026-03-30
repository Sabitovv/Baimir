import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

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

const CDN_URL = 'http://89.207.255.17/minio/locales/182a077de00162c5d0f7acc0badff225';

if (!isEditMode) {
  i18n.use(HttpBackend);
}

export const initializeTolgee = async () => {
  if (!isEditMode) return null;

  const [{ Tolgee, FormatSimple, BackendFetch }, { InContextTools }, { withTolgee }] = await Promise.all([
    import('@tolgee/web'),
    import('@tolgee/web/tools'),
    import('@tolgee/i18next'),
  ]);

  const tolgee = Tolgee()
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

  return tolgee;
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: !isEditMode ? {
      loadPath: `${CDN_URL}/{{ns}}/{{lng}}.json`,
      crossDomain: true 
    } : undefined,
    
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
