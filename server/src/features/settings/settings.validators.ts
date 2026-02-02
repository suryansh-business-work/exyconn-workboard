import { z } from 'zod';

export const smtpConfigSchema = z.object({
  host: z.string(),
  port: z.number().min(1).max(65535),
  secure: z.boolean(),
  user: z.string(),
  password: z.string(),
  fromEmail: z.string().email().or(z.literal('')),
  fromName: z.string(),
});

export const imageKitConfigSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
  urlEndpoint: z.string().url().or(z.literal('')),
});

export const openAIConfigSchema = z.object({
  apiKey: z.string(),
  openAIModel: z.string(),
  maxTokens: z.number().min(100).max(4000),
});

export const testEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const parseTaskSchema = z.object({
  message: z.string().min(1),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

export const analyzeTasksSchema = z.object({
  message: z.string().min(1),
  tasks: z.array(
    z.object({
      id: z.string(),
      taskId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      status: z.string(),
      priority: z.string(),
      labels: z.array(z.string()).optional(),
      assignee: z.string().optional(),
      dueDate: z.string().optional(),
    })
  ),
  history: z
    .array(
      z.object({
        role: z.string(),
        content: z.string(),
      })
    )
    .optional(),
});

export const rewriteTextSchema = z.object({
  text: z.string().min(1),
  context: z.string().optional(),
});

export type SMTPConfigInput = z.infer<typeof smtpConfigSchema>;
export type ImageKitConfigInput = z.infer<typeof imageKitConfigSchema>;
export type OpenAIConfigInput = z.infer<typeof openAIConfigSchema>;
export type TestEmailInput = z.infer<typeof testEmailSchema>;
export type ParseTaskInput = z.infer<typeof parseTaskSchema>;
