import { useState } from 'react';
import { useImageEditorStore } from './ImageEditorState';
import { useUploadStaticImageMutation } from './staticImagesApi'; // Укажи правильный путь
import { isEditMode } from '@/i18n';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const updateImage = useImageEditorStore((state) => state.updateImage);
  const closeEditor = useImageEditorStore((state) => state.closeEditor);
  
  // Достаем мутацию из RTK Query
  const [uploadImageMutation] = useUploadStaticImageMutation();

  const uploadToMinio = async (file: File, key: string, settingKey: string = 'global_frontend_images') => {
    
    if (!isEditMode) {
      console.error("Попытка загрузки изображения без прав редактора");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Отправляем реальный запрос на бэкенд через RTK Query
      // unwrap() позволяет отловить ошибку прямо в блоке try/catch
      const newImageUrl = await uploadImageMutation({
        settingKey,
        imageKey: key,
        file
      }).unwrap();

      // 2. Обновляем локальный стейт Zustand новым публичным URL от сервера
      updateImage(key, newImageUrl);
      
      closeEditor();
    } catch (error) {
      console.error('Ошибка при загрузке картинки на сервер:', error);
      alert('Не удалось загрузить картинку. Попробуйте снова.');
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToMinio, isUploading };
};