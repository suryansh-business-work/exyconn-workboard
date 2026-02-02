import api from './api';
import { Developer } from '../types';

// Transform MongoDB _id to id
const transformDeveloper = (dev: {
  _id: string;
  name: string;
  email: string;
  proficient: string;
  createdAt: string;
}): Developer => ({
  id: dev._id,
  name: dev.name,
  email: dev.email,
  proficient: dev.proficient as Developer['proficient'],
  createdAt: dev.createdAt,
});

export const developerService = {
  getAll: async (): Promise<Developer[]> => {
    const response = await api.get('/developers');
    return response.data.map(transformDeveloper);
  },

  create: async (developer: {
    name: string;
    email: string;
    proficient?: string;
  }): Promise<Developer> => {
    const response = await api.post('/developers', developer);
    return transformDeveloper(response.data);
  },

  update: async (
    id: string,
    developer: { name: string; email: string; proficient?: string }
  ): Promise<Developer> => {
    const response = await api.put(`/developers/${id}`, developer);
    return transformDeveloper(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/developers/${id}`);
  },

  resendPassword: async (email: string): Promise<{ message: string }> => {
    const response = await api.post('/users/resend-password', { email });
    return response.data;
  },
};
