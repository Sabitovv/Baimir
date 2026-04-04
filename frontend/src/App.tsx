import { useEffect } from 'react'; // Добавили useEffect
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
  // Мы используем 'global_frontend_images', как в вашем хуке загрузки.
  const { data: remoteImages, isLoading } = useGetStaticImagesQuery('global_frontend_images');

  // 2. Как только данные загрузились, обновляем Zustand стор
  useEffect(() => {
    if (remoteImages) {
      setImages(remoteImages);
    }
  }, [remoteImages, setImages]);

  // Пока данные загружаются (самый первый раз), можно показать спиннер
  // Но обычно лучше рендерить Layout, а картинки подставятся позже (fallbackSrc сработает)
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