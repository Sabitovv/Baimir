import { create } from 'zustand';
import { isEditMode as globalEditMode } from '@/i18n'; // Импортируем флаг из i18n конфига

interface ImageEditorState {
  images: Record<string, string>;
  isEditMode: boolean; // Режим "разработчика"
  editingKey: string | null;
  setImages: (images: Record<string, string>) => void;
  updateImage: (key: string, newUrl: string) => void;
  openEditor: (key: string) => void;
  closeEditor: () => void;
}

export const useImageEditorStore = create<ImageEditorState>((set) => ({
  images: {},
  // Теперь режим редактирования зависит исключительно от наличия токенов Tolgee
  isEditMode: globalEditMode, 
  editingKey: null,
  
  setImages: (images) => set({ images }),
  
  updateImage: (key, newUrl) => 
    set((state) => ({ 
      images: { ...state.images, [key]: newUrl } 
    })),
    
  openEditor: (key) => {
    // Дополнительная проверка безопасности: не открывать, если мы не в режиме редактирования
    if (globalEditMode) set({ editingKey: key });
  },
  closeEditor: () => set({ editingKey: null }),
}));