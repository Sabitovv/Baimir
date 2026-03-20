import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
// ИСПРАВЛЕНИЕ 1: devTools заменен на DevTools (с большой буквы)
import { Tolgee, DevTools, FormatSimple } from '@tolgee/web'
import { withTolgee } from '@tolgee/i18next'

import ruCommon from '@/locales/ru/common.json'
import enCommon from '@/locales/en/common.json'
import kzCommon from '@/locales/kz/common.json'

// 1. Получаем переменные окружения
const tolgeeApiKey = import.meta.env.VITE_TOLGEE_API_KEY;
const tolgeeApiUrl = import.meta.env.VITE_TOLGEE_API_URL;

// 2. Флаг: включаем Tolgee ТОЛЬКО если переданы ключи
const isTolgeeEnabled = Boolean(tolgeeApiKey && tolgeeApiUrl);

export let tolgee: any = null;

if (isTolgeeEnabled) {
  tolgee = Tolgee()
    .use(DevTools()) // ИСПРАВЛЕНИЕ 1: Вызываем с большой буквы
    .use(FormatSimple())
    .init({
      apiUrl: tolgeeApiUrl,
      apiKey: tolgeeApiKey,
    });

  // ИСПРАВЛЕНИЕ 2: Добавлено "as any", чтобы TypeScript игнорировал 
  // конфликт типов из-за двух разных папок node_modules
  withTolgee(i18n as any, tolgee);
}

// 3. Стандартная инициализация i18next
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
  })

export default i18n;