import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { Tolgee, FormatSimple } from '@tolgee/web';
import { InContextTools } from '@tolgee/web/tools';
import { withTolgee } from '@tolgee/i18next';

const TOLGEE_BASE_URL = 'https://tolgee.baytech.kz';

const isIpHost = (host: string) => /^(?:\d{1,3}\.){3}\d{1,3}$/.test(host);

const normalizeTolgeeApiUrl = (raw?: string | null) => {
  const fallback = import.meta.env.VITE_TOLGEE_API_URL || TOLGEE_BASE_URL;
  const candidate = raw?.trim() || fallback;

  try {
    const parsed = new URL(candidate);

    if (parsed.hostname.endsWith('.nip.io')) {
      const normalized = new URL(TOLGEE_BASE_URL);
      normalized.pathname = parsed.pathname;
      normalized.search = parsed.search;
      return normalized.toString();
    }

    if (isIpHost(parsed.hostname) || parsed.hostname === 'localhost') {
      const normalized = new URL(TOLGEE_BASE_URL);
      normalized.pathname = parsed.pathname;
      normalized.search = parsed.search;
      return normalized.toString();
    }

    return parsed.toString();
  } catch {
    return fallback;
  }
};

const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('editor_key');
const urlFromUrl = urlParams.get('tolgee_url');

if (keyFromUrl) {
  sessionStorage.setItem('tolgeeApiKey', keyFromUrl);
  const apiUrlToSave = normalizeTolgeeApiUrl(urlFromUrl);
  sessionStorage.setItem('tolgeeApiUrl', apiUrlToSave);
  window.history.replaceState({}, document.title, window.location.pathname);
}

const savedApiKey = sessionStorage.getItem('tolgeeApiKey');
const savedApiUrlRaw = sessionStorage.getItem('tolgeeApiUrl');
const savedApiUrl = normalizeTolgeeApiUrl(savedApiUrlRaw);

if (savedApiUrlRaw && savedApiUrlRaw !== savedApiUrl) {
  sessionStorage.setItem('tolgeeApiUrl', savedApiUrl);
}

export const isEditMode = Boolean(savedApiKey && savedApiUrl);

export let tolgee: any = null;

const CDN_URL = 'https://baytech.kz/minio/locales/814bc1c3f9019b399682693b66a4ffa5';

const initI18next = async (useHttpBackend: boolean) => {
  if (useHttpBackend) {
    i18n.use(HttpBackend);
  }

  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      backend: useHttpBackend
        ? {
            loadPath: `${CDN_URL}/{{ns}}/{{lng}}.json`,
            crossDomain: true,
          }
        : undefined,
      lng: 'ru',
      fallbackLng: 'ru',
      defaultNS: 'translation',
      ns: ['translation'],
      partialBundledLanguages: true,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'cookie', 'navigator'],
        caches: ['localStorage', 'cookie'],
      },
    });
};

export const setupI18n = async () => {
  if (isEditMode) {
    tolgee = Tolgee()
      .use(InContextTools())
      .use(FormatSimple())
      .init({
        apiUrl: savedApiUrl as string,
        apiKey: savedApiKey as string,
        defaultLanguage: 'ru',
        defaultNs: 'translation',
      });

    try {
      await tolgee.run();
      withTolgee(i18n as any, tolgee);
      await initI18next(false);
      return;
    } catch (error) {
      console.warn('[I18N DEBUG] Tolgee failed, falling back to CDN translations.', error);
    }
  }

  await initI18next(true);
};

export default i18n;
