import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { Tolgee, FormatSimple, BackendFetch } from '@tolgee/web' 
import { InContextTools } from '@tolgee/web/tools' 
import { withTolgee } from '@tolgee/i18next'

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

type LocaleNamespaces = Record<string, Record<string, any>>

const localeModules = import.meta.glob('../locales/*/*.json', { eager: true }) as Record<
  string,
  { default: Record<string, any> } | Record<string, any>
>

const resources = Object.entries(localeModules).reduce<LocaleNamespaces>((acc, [path, module]) => {
  const match = path.match(/\/locales\/([^/]+)\/([^/]+)\.json$/)
  if (!match) return acc

  const [, lng, ns] = match
  const dictionary = 'default' in module ? module.default : module

  if (!acc[lng]) acc[lng] = {}
  acc[lng][ns] = dictionary

  return acc
}, {})

if (isEditMode) {
  // ====================================================
  // РЕЖИМ РЕДАКТОРА
  // ====================================================
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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: resources as any,
    
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
