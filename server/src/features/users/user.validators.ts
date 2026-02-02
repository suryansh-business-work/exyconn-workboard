import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['admin', 'resource']).default('resource'),
  developerId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const resendPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
