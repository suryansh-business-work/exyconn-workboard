import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(1000).optional().default(''),
  urlTest: z.string().url('Invalid URL').optional().or(z.literal('')),
  urlStage: z.string().url('Invalid URL').optional().or(z.literal('')),
  urlProd: z.string().url('Invalid URL').optional().or(z.literal('')),
  repoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  docsUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  ownerId: z.string().min(1, 'Owner is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectIdParamSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
