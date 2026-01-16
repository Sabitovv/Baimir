import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ruCommon from '@/locales/ru/common.json'
// import enCommon from '@/locales/en/common.json'
// import kkCommon from '@/locales/kk/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { common: ruCommon },
    //   en: { common: enCommon },
    //   kk: { common: kkCommon }
    },
    fallbackLng: 'ru',
    defaultNS: 'common',
    ns: ['common'],
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
