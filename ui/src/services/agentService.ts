import api from './api';
import { Agent, CreateAgentPayload, WorkflowNode, WorkflowEdge } from '../types';

const transformAgent = (agent: {
  _id: string;
  name: string;
  description: string;
  role: string;
  status: 'active' | 'inactive' | 'draft';
  capabilities: string[];
  configuration: Record<string, unknown>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}): Agent => ({
  id: agent._id,
  name: agent.name,
  description: agent.description,
  role: agent.role,
  status: agent.status,
  capabilities: agent.capabilities,
  configuration: agent.configuration,
  nodes: agent.nodes || [],
  edges: agent.edges || [],
  createdAt: agent.createdAt,
  updatedAt: agent.updatedAt,
});

export const agentService = {
  getAll: async (): Promise<Agent[]> => {
    const response = await api.get('/agents');
    return response.data.map(transformAgent);
  },

  getById: async (id: string): Promise<Agent> => {
    const response = await api.get(`/agents/${id}`);
    return transformAgent(response.data);
  },

  create: async (agent: CreateAgentPayload): Promise<Agent> => {
    const response = await api.post('/agents', agent);
    return transformAgent(response.data);
  },

  update: async (id: string, agent: Partial<CreateAgentPayload>): Promise<Agent> => {
    const response = await api.put(`/agents/${id}`, agent);
    return transformAgent(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/agents/${id}`);
  },
};
