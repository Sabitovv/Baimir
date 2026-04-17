import React from 'react';
import { useImageEditorStore } from './ImageEditorState';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageKey: string;
  fallbackSrc?: string;
}

export const EditableImage: React.FC<EditableImageProps> = ({ 
  imageKey, 
  fallbackSrc = '', 
  className = '', 
  ...props 
}) => {
  const isEditMode = useImageEditorStore((state) => state.isEditMode);
  const openEditor = useImageEditorStore((state) => state.openEditor);
  
  // Достаем объект с данными
  const imageData = useImageEditorStore((state) => state.images[imageKey]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isEditMode && e.shiftKey) {
      e.preventDefault();
      openEditor(imageKey);
    }
  };

  // Безопасное извлечение на случай, если данные еще в старом строковом формате
  const src = typeof imageData === 'string' ? imageData : imageData?.url;
  const altText = typeof imageData === 'string' ? '' : imageData?.alt;

  return (
    <img
      src={src || fallbackSrc}
      alt={altText || props.alt || ''}
      className={`${className} ${isEditMode ? 'hover:outline hover:outline-4 hover:outline-blue-500 cursor-pointer' : ''}`}
      onClick={handleImageClick}
      {...props}
    />
  );
};