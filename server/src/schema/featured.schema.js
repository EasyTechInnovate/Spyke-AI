import { z } from 'zod'

export const adminFeaturedListQuerySchema = z.object({
  status: z.enum(['active', 'scheduled', 'all']).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
})

export const setFeaturedBodySchema = z.object({
  isPinned: z.boolean().optional(),
  priority: z.number().int().min(0).optional(),
  startAt: z.string().datetime().optional().or(z.null()),
  endAt: z.string().datetime().optional().or(z.null())
})

export const featuredSuggestionsQuerySchema = z.object({
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  minRating: z.string().regex(/^[1-5](\.\d+)?$/, 'Rating must be between 1 and 5').optional(),
  minReviews: z.string().regex(/^\d+$/, 'minReviews must be a number').optional()
})

export const featuredHybridQuerySchema = featuredSuggestionsQuerySchema
