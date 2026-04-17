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

  const { data: remoteImages, isLoading } = useGetStaticImagesQuery('global_frontend_images');

  // 2. Как только данные загрузились, обновляем Zustand стор напрямую!
    useEffect(() => {
      if (remoteImages) {
        setImages(remoteImages); // <--- Передаем данные без изменений
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