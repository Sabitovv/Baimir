import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';

// ИСПРАВЛЕНИЕ: Импортируем setupI18n из правильного файла (укажите ваш путь)
import { setupI18n } from '@/i18n'; 

import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'

async function bootstrap() {
  console.log('[BOOTSTRAP DEBUG] Starting app bootstrap...');
  
  try {
    // Теперь функция вызовется корректно и дождется загрузки i18n
    await setupI18n();
  } catch (error) {
    console.error('[BOOTSTRAP DEBUG] Failed to initialize i18n. React will render anyway, but translations might be missing.', error);
  }

  console.log('[BOOTSTRAP DEBUG] Rendering React tree...');
  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  )
}

bootstrap();