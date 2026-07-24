import React from 'react';
import { useImageEditorStore } from './ImageEditorState';

interface EditableImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageKey: string;
  fallbackSrc?: string;
  sources?: Array<React.SourceHTMLAttributes<HTMLSourceElement>>;
}

export const EditableImage: React.FC<EditableImageProps> = ({ 
  imageKey, 
  fallbackSrc = '', 
  className = '', 
  sources,
  onClick,
  alt: propsAlt, // 1. Вытаскиваем alt из пропсов под именем propsAlt
  ...restProps   // 2. В restProps теперь лежат все пропсы КРОМЕ alt
}) => {
  const isEditMode = useImageEditorStore((state) => state.isEditMode);
  const openEditor = useImageEditorStore((state) => state.openEditor);
  
  const imageData = useImageEditorStore((state) => state.images[imageKey]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (isEditMode && e.shiftKey) {
      e.preventDefault();
      openEditor(imageKey);
      return;
    }

    onClick?.(e);
  };

  const src = typeof imageData === 'string' ? imageData : imageData?.url;
  const altText = typeof imageData === 'string' ? '' : imageData?.alt;

  // Логика приоритета: сначала из базы, потом из пропсов, потом пустота
  const finalAlt = altText || propsAlt || '';
  const finalSrc = src || fallbackSrc;

  const image = (
    <img
      {...restProps} // 3. Распаковываем безопасные пропсы первыми
      src={finalSrc}
      alt={finalAlt} // 4. Наш вычисленный alt ставим жестко, его никто не перепишет
      className={`${className} ${isEditMode ? 'hover:outline hover:outline-4 hover:outline-blue-500 cursor-pointer' : ''}`}
      onClick={handleImageClick}
    />
  );

  if (sources?.length && !src) {
    return (
      <picture>
        {sources.map((source, index) => (
          <source key={index} {...source} />
        ))}
        {image}
      </picture>
    );
  }

  return image;
};
