import { z } from 'zod';

export const deleteImageParamSchema = z.object({
  fileId: z.string().min(1, 'File ID is required'),
});

export type DeleteImageParam = z.infer<typeof deleteImageParamSchema>;
