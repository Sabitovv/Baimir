import React, { useRef } from 'react';
import { useImageEditorStore } from './ImageEditorState';
import { useImageUpload } from './useImageUploads';

export const ImageEditorModal: React.FC = () => {
  const editingKey = useImageEditorStore((state) => state.editingKey);
  const closeEditor = useImageEditorStore((state) => state.closeEditor);
  const { uploadToMinio, isUploading } = useImageUpload();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editingKey) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadToMinio(file, editingKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
        <button 
          onClick={closeEditor}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold mb-2">Изменение картинки</h3>
        <p className="text-sm text-gray-500 mb-6">
          Ключ: <span className="font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">{editingKey}</span>
        </p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors
              ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isUploading ? 'Загрузка...' : 'Выбрать новый файл'}
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            className="hidden" 
          />
        </div>
      </div>
    </div>
  );
};