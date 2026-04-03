import { type ReactNode } from 'react'
import Layout from '@/components/layout/Layout'
import AppRoutes from '@/routes/AppRoutes'

// Вся сложная логика загрузки Tolgee теперь происходит ДО запуска React в index.tsx
const App = () => {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  )
}

export default App