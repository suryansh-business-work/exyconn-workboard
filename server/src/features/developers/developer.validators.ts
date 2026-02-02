import { z } from 'zod';

export const resourceRoles = [
  'AI Developer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Tester',
  'QA Engineer',
  'Product Owner',
  'Project Manager',
  'Designer',
  'UI/UX Designer',
  'DevOps Engineer',
  'Data Analyst',
  'Business Analyst',
  'Scrum Master',
  'Tech Lead',
  'HR Manager',
  'HR Executive',
  'Admin',
  'Finance',
  'Marketing',
  'Sales',
  'Support',
  'Operations',
  'Legal',
  'Other',
] as const;

export const createDeveloperSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  proficient: z.enum(resourceRoles),
});

export const updateDeveloperSchema = createDeveloperSchema;

export const developerIdParamSchema = z.object({
  id: z.string().min(1, 'Developer ID is required'),
});

export type CreateDeveloperInput = z.infer<typeof createDeveloperSchema>;
export type UpdateDeveloperInput = z.infer<typeof updateDeveloperSchema>;
