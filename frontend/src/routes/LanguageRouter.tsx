import { useEffect, useState, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import i18n from '@/i18n'
import { languagePath, languageRoute, seoLanguage } from '../../seo.mjs'

const routeBase = () => {
  const { language } = languageRoute(window.location.pathname)
  return language === 'ru' ? '/' : language === 'kz' ? '/kk' : '/en'
}

// A basename keeps every existing Link/navigate call in the selected language,
// including catalog, cart and calculator links. Redux remains outside this router.
export default function LanguageRouter({ children }: { children: ReactNode }) {
  const [basename, setBasename] = useState(routeBase)
  useEffect(() => {
    let fromUrl = 0
    const syncUrl = () => {
      const language = languageRoute(window.location.pathname).language
      setBasename(routeBase())
      if (i18n.isInitialized && seoLanguage(i18n.language) !== language) {
        fromUrl++
        void i18n.changeLanguage(language).finally(() => { fromUrl-- })
      }
    }
    const changeLanguage = (language: string) => {
      if (!i18n.isInitialized || fromUrl) return
      const path = languagePath(window.location.pathname, language)
      if (path === window.location.pathname) return
      window.history.pushState(null, '', `${path}${window.location.search}${window.location.hash}`)
      setBasename(routeBase())
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
    window.addEventListener('popstate', syncUrl)
    i18n.on('languageChanged', changeLanguage)
    return () => {
      window.removeEventListener('popstate', syncUrl)
      i18n.off('languageChanged', changeLanguage)
    }
  }, [])
  return <BrowserRouter key={basename} basename={basename}>{children}</BrowserRouter>
}
