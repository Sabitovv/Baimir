import { useEffect, lazy, Suspense } from 'react';
import Layout from '@/components/layout/Layout';
import AppRoutes from '@/routes/AppRoutes';
import { tolgee, isEditMode } from '@/i18n';

import { useImageEditorStore } from './zustand/ImageEditorState';
import { useGetStaticImagesQuery } from './zustand/staticImagesApi';

const TolgeeProvider = lazy(() =>
  import('@tolgee/react').then((m) => ({ default: m.TolgeeProvider }))
);

const ImageEditorModal = lazy(() =>
  import('./zustand/ImageEditorModal').then((m) => ({ default: m.ImageEditorModal }))
);

const App = () => {
  const setImages = useImageEditorStore((state) => state.setImages);

  const { data: remoteImages } = useGetStaticImagesQuery('global_frontend_images');

  useEffect(() => {
    if (remoteImages) {
      setImages(remoteImages);
    }
  }, [remoteImages, setImages]);

  return (
    <>
      {isEditMode && (
        <Suspense fallback={null}>
          <ImageEditorModal />
        </Suspense>
      )}

      {tolgee ? (
        <Suspense fallback={null}>
          <TolgeeProvider tolgee={tolgee} fallback={null}>
            <Layout>
              <AppRoutes />
            </Layout>
          </TolgeeProvider>
        </Suspense>
      ) : (
        <Layout>
          <AppRoutes />
        </Layout>
      )}
    </>
  );
};

export default App;
