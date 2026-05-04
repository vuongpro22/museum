import { ImageMetadata } from '../types/museum';

const API_BASE_URL = '/api';
// const API_BASE_URL = 'http://localhost:8080/api';
export interface ImageData {
  id: number;
  title: string;
  cloudinaryUrl: string;
  description: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface UploadImageData {
  file: File;
  title: string;
  description?: string;
  position?: number;
}

export interface UpdateImageData {
  file?: File;
  title?: string;
  description?: string;
  position?: number;
}

class ImageService {
  async getAllImages(): Promise<ImageData[]> {
    const response = await fetch(`${API_BASE_URL}/images`);
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    return response.json();
  }

  async getImageById(id: number): Promise<ImageData> {
    const response = await fetch(`${API_BASE_URL}/images/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    return response.json();
  }

  async uploadImage(data: UploadImageData): Promise<ImageData> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.position !== undefined) {
      formData.append('position', data.position.toString());
    }

    const response = await fetch(`${API_BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload image');
    }

    return response.json();
  }

  async updateImage(id: number, data: UpdateImageData): Promise<ImageData> {
    const formData = new FormData();
    
    if (data.file) {
      formData.append('file', data.file);
    }
    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.position !== undefined) {
      formData.append('position', data.position.toString());
    }

    const response = await fetch(`${API_BASE_URL}/images/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update image');
    }

    return response.json();
  }

  async deleteImage(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/images/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      let errorMessage = 'Failed to delete image';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Nếu không parse được JSON, sử dụng message mặc định
        console.error('Failed to parse error response:', e);
      }
      throw new Error(errorMessage);
    }

    // Parse success response nếu cần
    try {
      const result = await response.json();
      console.log('Delete successful:', result.message);
    } catch (e) {
      // Không cần parse response nếu không có JSON
    }
  }

  async searchImages(title: string): Promise<ImageData[]> {
    const response = await fetch(`${API_BASE_URL}/images/search?title=${encodeURIComponent(title)}`);
    if (!response.ok) {
      throw new Error('Failed to search images');
    }
    return response.json();
  }

  // Convert ImageData to ImageMetadata for compatibility with existing components
  convertToImageMetadata(imageData: ImageData): ImageMetadata {
    return {
      url: imageData.cloudinaryUrl,
      title: imageData.title,
      artist: '', // Not used in current implementation
      date: new Date(imageData.createdAt).toLocaleDateString(),
      description: imageData.description,
      link: '', // Not used in current implementation
    };
  }
}

export const imageService = new ImageService();
