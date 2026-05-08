import { z } from 'zod';

export const suggestionQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '1')),
  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val || '20')),
  q: z.string().trim().optional(),
  category: z.string().trim().optional(),
});

export const toggleFavoriteSchema = z.object({
  tipId: z.string().trim().min(1, 'Tip ID is required'),
  isFavorite: z.boolean(),
});

export type SuggestionQuery = z.infer<typeof suggestionQuerySchema>;
