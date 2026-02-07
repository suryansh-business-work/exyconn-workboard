import api from './api';
import { AgentComponent, CreateAgentComponentPayload, ConfigField } from '../types';

interface RawAgentComponent {
  _id: string;
  name: string;
  category: AgentComponent['category'];
  description: string;
  icon: string;
  color: string;
  configSchema: ConfigField[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

const transformComponent = (c: RawAgentComponent): AgentComponent => ({
  id: c._id,
  name: c.name,
  category: c.category,
  description: c.description,
  icon: c.icon,
  color: c.color,
  configSchema: c.configSchema || [],
  status: c.status,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

export const agentComponentService = {
  getAll: async (): Promise<AgentComponent[]> => {
    const res = await api.get('/agent-components');
    return res.data.map(transformComponent);
  },

  getById: async (id: string): Promise<AgentComponent> => {
    const res = await api.get(`/agent-components/${id}`);
    return transformComponent(res.data);
  },

  create: async (data: CreateAgentComponentPayload): Promise<AgentComponent> => {
    const res = await api.post('/agent-components', data);
    return transformComponent(res.data);
  },

  update: async (
    id: string,
    data: Partial<CreateAgentComponentPayload>
  ): Promise<AgentComponent> => {
    const res = await api.put(`/agent-components/${id}`, data);
    return transformComponent(res.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/agent-components/${id}`);
  },
};
