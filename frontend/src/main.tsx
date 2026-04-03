import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Обязательно импортируем функции из твоего файла i18n
import { initializeTolgee, isEditMode } from './i18n/index.ts' 

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'

// Оборачиваем запуск приложения в асинхронную функцию
async function bootstrap() {
  // Если мы в режиме перевода (перешли из админки по ссылке с параметрами),
  // заставляем React подождать, пока Tolgee скачает UI-редактор и переводы.
  if (isEditMode) {
    await initializeTolgee();
  }

  // Только после загрузки Tolgee (или сразу, если мы в обычном режиме) 
  // отрисовываем интерфейс.
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
}

// Запускаем инициализацию
bootstrap();   