import { z } from 'zod';

export const AgentStatusEnum = z.enum(['active', 'inactive', 'draft']);

const workflowNodeSchema = z.object({
  nodeId: z.string().min(1),
  componentId: z.string().min(1),
  componentName: z.string().min(1),
  category: z.string().min(1),
  color: z.string().optional().default('#1976d2'),
  position: z.object({ x: z.number(), y: z.number() }),
  config: z.record(z.string(), z.string()).optional().default({}),
});

const workflowEdgeSchema = z.object({
  edgeId: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
});

export const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(1000).optional().default(''),
  role: z.string().min(1, 'Role is required').max(100),
  status: AgentStatusEnum.optional().default('draft'),
  capabilities: z.array(z.string()).optional().default([]),
  configuration: z.record(z.string(), z.unknown()).optional().default({}),
  nodes: z.array(workflowNodeSchema).optional().default([]),
  edges: z.array(workflowEdgeSchema).optional().default([]),
});

export const updateAgentSchema = createAgentSchema.partial();

export const agentIdParamSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
