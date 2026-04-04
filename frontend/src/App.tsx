import { TolgeeProvider } from '@tolgee/react'
import Layout from '@/components/layout/Layout'
import AppRoutes from '@/routes/AppRoutes'

// Импортируем наш экземпляр tolgee (проверьте правильность пути к файлу i18n, если он лежит в другой папке)
import { tolgee } from '@/i18n' 

const App = () => {
  // Если Tolgee инициализирован (мы локально и в .env есть ключи)
  if (tolgee) {
    return (
      <TolgeeProvider 
        tolgee={tolgee} 
        fallback={<div>Загрузка переводов...</div>} 
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