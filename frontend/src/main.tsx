import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Обязательно импортируем функции из файла i18n
import { initializeTolgee, isEditMode } from './i18n/index.ts' 

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'

// Создаем асинхронную функцию для запуска
async function bootstrap() {
  // Ждем, пока Tolgee скачает переводы и UI, если мы в режиме перевода
  if (isEditMode) {
    await initializeTolgee();
  }

  // Только после этого рендерим приложение
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
}

// Запускаем
bootstrap();