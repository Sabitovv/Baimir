import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import Layout from '@/components/layout/Layout'
import AppRoutes from '@/routes/AppRoutes'
import i18n, { initializeTolgee, isEditMode } from '@/i18n'

type TolgeeProviderProps = {
  tolgee: unknown
  fallback?: ReactNode
  children: ReactNode
}

const App = () => {
  const [tolgee, setTolgee] = useState<unknown>(null)
  const [TolgeeProvider, setTolgeeProvider] = useState<ComponentType<TolgeeProviderProps> | null>(null)
  const [isTolgeeLoading, setIsTolgeeLoading] = useState(isEditMode)

  useEffect(() => {
    if (!isEditMode) return

    let isMounted = true

    const loadTolgee = async () => {
      try {
        const [{ TolgeeProvider: LoadedTolgeeProvider }, tolgeeInstance] = await Promise.all([
          import('@tolgee/react'),
          initializeTolgee(),
        ])

        if (!isMounted) return

        setTolgeeProvider(() => LoadedTolgeeProvider as ComponentType<TolgeeProviderProps>)
        setTolgee(tolgeeInstance)
      } finally {
        if (isMounted) {
          setIsTolgeeLoading(false)
        }
      }
    }

    void loadTolgee()

    return () => {
      isMounted = false
    }
  }, [])

  if (isEditMode && isTolgeeLoading) {
    return <div>{i18n.t('app.loadingTranslations')}</div>
  }

  if (isEditMode && tolgee && TolgeeProvider) {
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
