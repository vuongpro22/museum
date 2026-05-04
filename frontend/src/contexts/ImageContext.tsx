import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { imageService, ImageData } from '../services/imageService';

interface ImageContextType {
  images: ImageData[];
  loading: boolean;
  error: string | null;
  refreshImages: () => Promise<void>;
  uploadImage: (file: File, title: string, description?: string, position?: number) => Promise<void>;
  updateImage: (id: number, data: { file?: File; title?: string; description?: string; position?: number }) => Promise<void>;
  deleteImage: (id: number) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | undefined>(undefined);

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};

interface ImageProviderProps {
  children: ReactNode;
}

export const ImageProvider = ({ children }: ImageProviderProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedImages = await imageService.getAllImages();
      setImages(fetchedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, title: string, description?: string, position?: number) => {
    try {
      setError(null);
      const newImage = await imageService.uploadImage({ file, title, description, position });
      setImages(prev => [...prev, newImage].sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      throw err;
    }
  };

  const updateImage = async (id: number, data: { file?: File; title?: string; description?: string; position?: number }) => {
    try {
      setError(null);
      const updatedImage = await imageService.updateImage(id, data);
      setImages(prev => prev.map(img => img.id === id ? updatedImage : img)
                           .sort((a, b) => (a.position || 0) - (b.position || 0)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
      throw err;
    }
  };

  const deleteImage = async (id: number) => {
    try {
      setError(null);
      await imageService.deleteImage(id);
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete image');
      throw err;
    }
  };

  useEffect(() => {
    refreshImages();
  }, []);

  const value: ImageContextType = {
    images,
    loading,
    error,
    refreshImages,
    uploadImage,
    updateImage,
    deleteImage,
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};
