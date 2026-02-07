import api from './api';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  Comment,
  AddCommentPayload,
  AgentExecutionLog,
  AgentExecutionNodeResult,
} from '../types';

// Transform MongoDB _id to id
const transformTask = (task: {
  _id: string;
  taskId: string;
  title: string;
  description: string;
  assignee: string;
  projectId?: string;
  projectName?: string;
  status: Task['status'];
  priority: Task['priority'];
  taskType?: Task['taskType'];
  labels: string[];
  dueDate: string;
  images: string[];
  links?: { title: string; url: string }[];
  agents?: { agentId: string; agentName: string }[];
  createdAt: string;
  updatedAt: string;
}): Task => ({
  id: task._id,
  taskId: task.taskId,
  title: task.title,
  description: task.description,
  assignee: task.assignee,
  projectId: task.projectId,
  projectName: task.projectName,
  status: task.status,
  priority: task.priority,
  taskType: task.taskType || 'task',
  labels: task.labels,
  dueDate: task.dueDate,
  images: task.images,
  links: task.links || [],
  agents: task.agents || [],
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const transformComment = (comment: {
  _id: string;
  text: string;
  author: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}): Comment => ({
  id: comment._id,
  text: comment.text,
  author: comment.author,
  authorEmail: comment.authorEmail,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

interface AISearchResult {
  tasks: Task[];
  explanation: string;
  matchedIds: string[];
}

export const taskService = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data.map(transformTask);
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return transformTask(response.data);
  },

  create: async (task: CreateTaskPayload): Promise<Task> => {
    const response = await api.post('/tasks', task);
    return transformTask(response.data);
  },

  update: async (id: string, task: Partial<UpdateTaskPayload>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, task);
    return transformTask(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  aiSearch: async (query: string): Promise<AISearchResult> => {
    const response = await api.post('/tasks/ai-search', { query });
    return {
      tasks: response.data.tasks.map(transformTask),
      explanation: response.data.explanation,
      matchedIds: response.data.matchedIds,
    };
  },

  // Comment methods
  getComments: async (taskId: string): Promise<Comment[]> => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data.map(transformComment);
  },

  addComment: async (taskId: string, data: AddCommentPayload): Promise<Comment> => {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return transformComment(response.data);
  },

  updateComment: async (
    taskId: string,
    commentId: string,
    data: AddCommentPayload
  ): Promise<Comment> => {
    const response = await api.put(`/tasks/${taskId}/comments/${commentId}`, data);
    return transformComment(response.data);
  },

  deleteComment: async (taskId: string, commentId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  // Agent execution methods
  logAgentExecution: async (
    taskId: string,
    data: {
      agentId: string;
      agentName: string;
      status: 'running' | 'success' | 'error';
      nodeResults: AgentExecutionNodeResult[];
      totalDuration: number;
      triggeredBy: string;
    }
  ): Promise<AgentExecutionLog> => {
    const response = await api.post(`/tasks/${taskId}/agent-execute`, data);
    return response.data;
  },

  getAgentExecutionLogs: async (taskId: string): Promise<AgentExecutionLog[]> => {
    const response = await api.get(`/tasks/${taskId}/agent-logs`);
    return response.data;
  },
};
