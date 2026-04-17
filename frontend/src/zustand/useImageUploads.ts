import { useState } from 'react';
import { useImageEditorStore } from './ImageEditorState';
import { useUploadStaticImageMutation, useUpdateStaticImageAltMutation } from './staticImagesApi';
import { isEditMode } from '@/i18n';

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const updateImage = useImageEditorStore((state) => state.updateImage);
  const updateAltInStore = useImageEditorStore((state) => state.updateAlt);
  const closeEditor = useImageEditorStore((state) => state.closeEditor);
  
  const [uploadImageMutation] = useUploadStaticImageMutation();
  const [updateAltMutation] = useUpdateStaticImageAltMutation();

  // 1. Загрузка файла + Alt
  const uploadToMinio = async (file: File, key: string, alt: string, settingKey: string = 'global_frontend_images') => {
    if (!isEditMode) return;
    setIsUploading(true);
    
    try {
      const newImageUrl = await uploadImageMutation({
        settingKey,
        imageKey: key,
        file,
        alt
      }).unwrap();

      updateImage(key, newImageUrl, alt);
      closeEditor();
    } catch (error) {
      console.error('Ошибка при загрузке:', error);
      alert('Не удалось загрузить картинку.');
    } finally {
      setIsUploading(false);
    }
  };

  // 2. Обновление только Alt (без смены фото)
  const updateOnlyAlt = async (key: string, alt: string, settingKey: string = 'global_frontend_images') => {
    setIsUploading(true);
    try {
      await updateAltMutation({
        settingKey,
        imageKey: key,
        alt
      }).unwrap();

      updateAltInStore(key, alt);
      closeEditor();
    } catch (error) {
      console.error('Ошибка при обновлении Alt:', error);
      alert('Не удалось обновить текст.');
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadToMinio, updateOnlyAlt, isUploading };
};