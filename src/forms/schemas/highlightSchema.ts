import { z } from 'zod';

export const highlightSchema = z.object({
  content: z.string().min(1, 'errors.contentRequired'),
});

export type HighlightSchema = z.infer<typeof highlightSchema>;
