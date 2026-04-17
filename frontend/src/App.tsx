import { useEffect } from 'react';
import { TolgeeProvider } from '@tolgee/react';
import Layout from '@/components/layout/Layout';
import AppRoutes from '@/routes/AppRoutes';
import { tolgee, isEditMode } from '@/i18n'; 
import { ImageEditorModal } from './zustand/ImageEditorModal';

// Импорты для синхронизации данных
import { useImageEditorStore } from './zustand/ImageEditorState';
import { useGetStaticImagesQuery } from './zustand/staticImagesApi';

const App = () => {
  const setImages = useImageEditorStore((state) => state.setImages);

  // 1. Запускаем запрос к бэкенду. 
  const { data: remoteImages, isLoading } = useGetStaticImagesQuery('global_frontend_images');

  // 2. Как только данные загрузились, обновляем Zustand стор
  useEffect(() => {
    if (remoteImages) {
      // Преобразуем Record<string, string> в Record<string, { url: string, alt: string }>
      const formattedImages = Object.entries(remoteImages).reduce((acc, [key, url]) => {
        acc[key] = { url, alt: '' }; // Задаем пустой alt, пока бэкенд отдает только ссылки
        return acc;
      }, {} as Record<string, { url: string; alt: string }>);

      setImages(formattedImages);
    }
  }, [remoteImages, setImages]);

  if (isLoading && !remoteImages) {
    return <div className="h-screen flex items-center justify-center">Загрузка ресурсов...</div>;
  }

  return (
    <>
      {/* Модалка рендерится только в режиме редактирования */}
      {isEditMode && <ImageEditorModal />}
      
      {tolgee ? (
        <TolgeeProvider 
          tolgee={tolgee} 
          fallback={<div>Загрузка переводов...</div>} 
        >
          <Layout>
            <AppRoutes />
          </Layout>
        </TolgeeProvider>
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </>
  );
};

export default App;