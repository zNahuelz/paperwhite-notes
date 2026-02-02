import { z } from 'zod';

export const bookSchema = z.object({
  title: z.string().min(1, 'errors.titleRequired'),
  author: z.string().optional(),
  description: z.string().optional(),
  cover: z.string().optional(),
});

export type BookSchema = z.infer<typeof bookSchema>;
