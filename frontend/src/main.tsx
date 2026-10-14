import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App';

import { setupI18n } from '@/i18n'; 

import { Provider } from 'react-redux'
import LanguageRouter from '@/routes/LanguageRouter'
import { store } from '@/app/store'

function bootstrap() {
  // Start i18n init in the background; do not block the first paint.
  setupI18n().catch((error) => {
    console.error('[BOOTSTRAP] Failed to initialize i18n:', error);
  });

  createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
      <LanguageRouter>
        <App />
      </LanguageRouter>
    </Provider>
  )
}

bootstrap();
