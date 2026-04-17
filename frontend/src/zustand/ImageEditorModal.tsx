import React, { useRef, useState, useEffect } from 'react';
import { useImageEditorStore } from './ImageEditorState';
import { useImageUpload } from './useImageUploads';

export const ImageEditorModal: React.FC = () => {
  const editingKey = useImageEditorStore((state) => state.editingKey);
  const currentData = useImageEditorStore((state) => editingKey ? state.images[editingKey] : null);
  const closeEditor = useImageEditorStore((state) => state.closeEditor);
  
  const { uploadToMinio, updateOnlyAlt, isUploading } = useImageUpload();
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Синхронизируем локальный alt с данными из стора при открытии
  useEffect(() => {
    if (currentData) {
      setAltText(currentData.alt || '');
    }
  }, [currentData, editingKey]);

  if (!editingKey) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadToMinio(file, editingKey, altText);
    }
  };

  const handleSaveOnlyAlt = async () => {
    await updateOnlyAlt(editingKey, altText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button onClick={closeEditor} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">✕</button>

        <h3 className="text-xl font-bold mb-2">Редактор изображения</h3>
        <p className="text-xs text-gray-400 mb-4 font-mono">{editingKey}</p>

        <div className="flex flex-col gap-5">
          {/* Поле для Alt текста */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alt текст (описание для SEO)</label>
            <input 
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Введите описание изображения..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isUploading ? 'Загрузка...' : 'Загрузить новое фото'}
            </button>

            {/* Кнопка сохранения только Alt */}
            <button 
              onClick={handleSaveOnlyAlt}
              disabled={isUploading}
              className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:border-gray-300 disabled:text-gray-300"
            >
              Сохранить только Alt текст
            </button>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
        </div>
      </div>
    </div>
  );
};