import api from './api';
import { Project, CreateProjectPayload } from '../types';

const transformProject = (data: Record<string, unknown>): Project => ({
  id: data._id as string,
  name: data.name as string,
  description: data.description as string,
  urlTest: data.urlTest as string,
  urlStage: data.urlStage as string,
  urlProd: data.urlProd as string,
  repoUrl: data.repoUrl as string,
  docsUrl: data.docsUrl as string,
  ownerId: data.ownerId as string,
  ownerName: data.ownerName as string,
  createdAt: data.createdAt as string,
  updatedAt: data.updatedAt as string,
});

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await api.get('/projects');
    return data.map(transformProject);
  },

  getById: async (id: string): Promise<Project> => {
    const { data } = await api.get(`/projects/${id}`);
    return transformProject(data);
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await api.post('/projects', payload);
    return transformProject(data);
  },

  update: async (
    id: string,
    payload: Partial<CreateProjectPayload>
  ): Promise<Project> => {
    const { data } = await api.put(`/projects/${id}`, payload);
    return transformProject(data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};
