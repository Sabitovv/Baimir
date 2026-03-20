import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Импортируем BackendFetch для скачивания
import { Tolgee, FormatSimple, BackendFetch } from '@tolgee/web' 
// Возвращаем InContextTools для работы Alt + Click
import { InContextTools } from '@tolgee/web/tools' 
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

// 1. Создаем флаг: проверяем, находимся ли мы в режиме редактирования
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

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // ====================================================
    // 2. ГЛАВНАЯ МАГИЯ:
    // Если мы в режиме редактора -> отдаем пустой объект (i18next скачает данные с Tolgee API).
    // Если зашел обычный пользователь -> отдаем локальные JSON файлы.
    resources: isEditMode ? {} : {
      ru: { common: ruCommon },
      en: { common: enCommon },
      kk: { common: kzCommon },
    },
    // ====================================================
    
    lng: 'ru',
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common'],
    
    // Эту настройку тоже оставляем на всякий случай, чтобы Tolgee всегда перекрывал всё
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