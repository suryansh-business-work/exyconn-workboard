import api from './api';

export interface UploadResponse {
  url: string;
  fileId: string;
  name: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file); // Using same endpoint, field name kept for compatibility

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (fileId: string): Promise<void> => {
    await api.delete(`/upload/${fileId}`);
  },
};
