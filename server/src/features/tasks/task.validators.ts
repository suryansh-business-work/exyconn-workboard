import { z } from 'zod';

export const TaskStatusEnum = z.enum(['todo', 'in-progress', 'in-review', 'done']);
export const TaskPriorityEnum = z.enum(['P1', 'P2', 'P3', 'P4']);
export const TaskTypeEnum = z.enum([
  'task',
  'bug',
  'incident',
  'feature',
  'improvement',
  'other',
]);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(5000).optional().default(''),
  assignee: z.string().min(1, 'Assignee is required'),
  projectId: z.string().optional().default(''),
  projectName: z.string().optional().default(''),
  status: TaskStatusEnum.optional().default('todo'),
  priority: TaskPriorityEnum.optional().default('P3'),
  taskType: TaskTypeEnum.optional().default('task'),
  labels: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().or(z.string()),
  images: z.array(z.string().url()).optional().default([]),
  links: z
    .array(
      z.object({
        title: z.string().min(1, 'Link title is required'),
        url: z.string().url('Valid URL is required'),
      })
    )
    .optional()
    .default([]),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
});

export const commentIdParamSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  commentId: z.string().min(1, 'Comment ID is required'),
});

export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(2000),
  author: z.string().min(1, 'Author name is required'),
  authorEmail: z.string().email('Valid email is required'),
});

export const aiSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(500),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type AISearchInput = z.infer<typeof aiSearchSchema>;
