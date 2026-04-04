import React from 'react';
import { useImageEditorStore } from './ImageEditorState';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageKey: string;
  fallbackSrc?: string; // На случай, если JSON еще не загрузился или ключа нет
}

export const EditableImage: React.FC<EditableImageProps> = ({ 
  imageKey, 
  fallbackSrc = '', 
  className = '', 
  ...props 
}) => {
  const isEditMode = useImageEditorStore((state) => state.isEditMode);
  const openEditor = useImageEditorStore((state) => state.openEditor);
  
  // Достаем только конкретный URL, чтобы избежать лишних рендеров
  const currentSrc = useImageEditorStore((state) => state.images[imageKey]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    // Отлавливаем Shift + Click только в режиме редактирования
    if (isEditMode && e.altKey) {
      e.preventDefault();
      openEditor(imageKey);
    }
  };

  // Стили для визуального отклика
  const editModeClasses = isEditMode 
    ? 'hover:outline hover:outline-4 hover:outline-blue-500 hover:outline-offset-2 hover:cursor-pointer transition-all duration-200' 
    : '';

  return (
    <img
      src={currentSrc || fallbackSrc}
      className={`${className} ${editModeClasses}`}
      onClick={handleImageClick}
      title={isEditMode ? 'Alt + Click для изменения' : undefined}
      {...props}
    />
  );
};