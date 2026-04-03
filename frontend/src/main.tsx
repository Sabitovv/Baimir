import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './i18n/index.ts'
import { initializeTolgee, isEditMode } from './i18n/index.ts'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/app/store'

async function bootstrap() {
  console.log('[BOOTSTRAP DEBUG] Starting app bootstrap...');
  
  if (isEditMode) {
    console.log('[BOOTSTRAP DEBUG] App is in edit mode. Waiting for Tolgee...');
    try {
      await initializeTolgee();
    } catch (error) {
      console.error('[BOOTSTRAP DEBUG] Failed to initialize Tolgee. React will render anyway, but translations might be missing.', error);
    }
  } else {
    console.log('[BOOTSTRAP DEBUG] Normal mode, skipping Tolgee wait.');
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