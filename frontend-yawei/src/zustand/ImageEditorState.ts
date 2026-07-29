import { create } from 'zustand';
import { isEditMode as globalEditMode } from '@/i18n';

interface ImageData {
  url: string;
  alt: string;
}

interface ImageEditorState {
  images: Record<string, ImageData>;
  isEditMode: boolean;
  editingKey: string | null;
  setImages: (images: Record<string, ImageData>) => void;
  // Обновляем и URL, и Alt
  updateImage: (key: string, url: string, alt: string) => void;
  // Обновляем только Alt
  updateAlt: (key: string, alt: string) => void;
  openEditor: (key: string) => void;
  closeEditor: () => void;
}

export const useImageEditorStore = create<ImageEditorState>((set) => ({
  images: {},
  isEditMode: globalEditMode,
  editingKey: null,
  
  setImages: (images) => set({ images }),
  
  updateImage: (key, url, alt) => 
    set((state) => ({ 
      images: { ...state.images, [key]: { url, alt } } 
    })),

  updateAlt: (key, alt) =>
    set((state) => {
      // Безопасно достаем текущую картинку или задаем пустой fallback
      const currentImage = state.images[key] || { url: '', alt: '' };
      
      return {
        images: { 
          ...state.images, 
          [key]: { 
            ...currentImage, 
            alt 
          } 
        }
      };
    }),
    
  openEditor: (key) => {
    if (globalEditMode) set({ editingKey: key });
  },
  closeEditor: () => set({ editingKey: null }),
}));