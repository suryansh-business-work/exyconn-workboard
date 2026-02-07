import api from './api';
import {
  SMTPConfig,
  ImageKitConfig,
  OpenAIConfig,
  ParsedTask,
  BuildAgentResponse,
} from '../types';

export const settingsService = {
  getSMTPConfig: async (): Promise<SMTPConfig> => {
    const response = await api.get('/settings/smtp');
    return response.data;
  },

  updateSMTPConfig: async (config: SMTPConfig): Promise<SMTPConfig> => {
    const response = await api.put('/settings/smtp', config);
    return response.data;
  },

  testSMTPConfig: async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/smtp/test', { email });
    return response.data;
  },

  getImageKitConfig: async (): Promise<ImageKitConfig> => {
    const response = await api.get('/settings/imagekit');
    return response.data;
  },

  updateImageKitConfig: async (config: ImageKitConfig): Promise<ImageKitConfig> => {
    const response = await api.put('/settings/imagekit', config);
    return response.data;
  },

  getOpenAIConfig: async (): Promise<OpenAIConfig> => {
    const response = await api.get('/settings/openai');
    return response.data;
  },

  updateOpenAIConfig: async (config: OpenAIConfig): Promise<OpenAIConfig> => {
    const response = await api.put('/settings/openai', config);
    return response.data;
  },

  parseTaskFromChat: async (
    message: string,
    history?: { role: string; content: string }[]
  ): Promise<ParsedTask> => {
    const response = await api.post('/settings/openai/parse-task', { message, history });
    return response.data;
  },

  analyzeTasksWithAI: async (
    message: string,
    tasks: {
      id: string;
      taskId: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      labels?: string[];
      assignee?: string;
      dueDate?: string;
    }[],
    history?: { role: string; content: string }[]
  ): Promise<{ response: string; suggestedTaskIds: string[]; action: string | null }> => {
    const response = await api.post('/settings/openai/analyze-tasks', {
      message,
      tasks,
      history,
    });
    return response.data;
  },

  rewriteWithAI: async (
    text: string,
    context?: string
  ): Promise<{ rewrittenText: string }> => {
    const response = await api.post('/settings/openai/rewrite', { text, context });
    return response.data;
  },

  getDailyReportSettings: async (): Promise<{
    enabled: boolean;
    recipientEmail: string;
  }> => {
    const response = await api.get('/settings/daily-report');
    return response.data;
  },

  updateDailyReportSettings: async (config: {
    enabled: boolean;
    recipientEmail: string;
  }): Promise<{ enabled: boolean; recipientEmail: string }> => {
    const response = await api.put('/settings/daily-report', config);
    return response.data;
  },

  sendStatusToAllResources: async (): Promise<{ sentCount: number }> => {
    const response = await api.post('/settings/daily-report/send-to-all');
    return response.data;
  },

  generateCode: async (
    prompt: string,
    currentCode: string
  ): Promise<{ code: string }> => {
    const response = await api.post('/settings/openai/generate-code', {
      prompt,
      currentCode,
    });
    return response.data;
  },

  generateComponent: async (prompt: string): Promise<Record<string, unknown>> => {
    const response = await api.post('/settings/openai/generate-component', { prompt });
    return response.data;
  },
  buildAgent: async (params: {
    message: string;
    components: { id: string; name: string; category: string; description: string }[];
    currentNodes?: { componentName: string; category: string }[];
    history?: { role: string; content: string }[];
  }): Promise<BuildAgentResponse> => {
    const response = await api.post('/settings/openai/build-agent', params);
    return response.data;
  },
};
