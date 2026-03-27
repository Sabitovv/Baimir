import { TolgeeProvider } from '@tolgee/react'
import Layout from '@/components/layout/Layout'
import AppRoutes from '@/routes/AppRoutes'
import i18n, { tolgee } from '@/i18n'

const App = () => {
  if (tolgee) {
    return (
      <TolgeeProvider
        tolgee={tolgee}
        fallback={<div>{i18n.t('app.loadingTranslations')}</div>}
      >
        <Layout>
          <AppRoutes />
        </Layout>
      </TolgeeProvider>
    )
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  )
}

export default App
