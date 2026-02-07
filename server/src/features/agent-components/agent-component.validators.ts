import { z } from 'zod';

export const componentCategoryEnum = z.enum([
  'event',
  'data-scrapper',
  'communication',
  'ai',
  'action',
  'logic',
  'custom',
]);

export const configFieldTypeEnum = z.enum([
  'text',
  'password',
  'select',
  'number',
  'boolean',
  'textarea',
]);

const configFieldSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
  type: configFieldTypeEnum.optional().default('text'),
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional().default(''),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional()
    .default([]),
  defaultValue: z.string().optional().default(''),
});

export const createAgentComponentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  category: componentCategoryEnum,
  description: z.string().max(1000).optional().default(''),
  icon: z.string().optional().default('Extension'),
  color: z.string().optional().default('#1976d2'),
  configSchema: z.array(configFieldSchema).optional().default([]),
  status: z.enum(['active', 'inactive']).optional().default('active'),
});

export const updateAgentComponentSchema = createAgentComponentSchema.partial();

export const agentComponentIdParamSchema = z.object({
  id: z.string().min(1, 'Component ID is required'),
});

export type CreateAgentComponentInput = z.infer<typeof createAgentComponentSchema>;
export type UpdateAgentComponentInput = z.infer<typeof updateAgentComponentSchema>;
