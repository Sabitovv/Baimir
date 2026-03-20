import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { Tolgee, DevTools, FormatSimple } from '@tolgee/web'
import { withTolgee } from '@tolgee/i18next'

import ruCommon from '@/locales/ru/common.json'
import enCommon from '@/locales/en/common.json'
import kzCommon from '@/locales/kz/common.json'

// 1. URL сервера Tolgee можно оставить публичным (без ключа он бесполезен)
// Замените на реальный IP или домен, где доступен ваш docker (например, http://130.193.xx.xx:8080)
const tolgeeApiUrl = import.meta.env.VITE_TOLGEE_API_URL || 'http://localhost:8080';

// 2. Ловим ключ из URL (когда админ переходит из админки)
const urlParams = new URLSearchParams(window.location.search);
const keyFromUrl = urlParams.get('editor_key');

if (keyFromUrl) {
  // Если пришли с ключом, сохраняем его в сессию (до закрытия вкладки)
  sessionStorage.setItem('tolgeeApiKey', keyFromUrl);
  // Очищаем URL, чтобы ключ не маячил в адресной строке
  window.history.replaceState({}, document.title, window.location.pathname);
}

// 3. Достаем ключ из сессии
const savedApiKey = sessionStorage.getItem('tolgeeApiKey');

export let tolgee: any = null;

// 4. Включаем Tolgee ТОЛЬКО если в сессии есть ключ
if (savedApiKey) {
  tolgee = Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      apiUrl: tolgeeApiUrl,
      apiKey: savedApiKey,
    });

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