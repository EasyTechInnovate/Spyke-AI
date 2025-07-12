import { z } from 'zod'

// Schema for creating analytics events
export const createAnalyticsEventSchema = z.object({
  body: z.object({
    events: z.array(
      z.object({
        type: z.enum(['pageview', 'click', 'error']),
        name: z.string().min(1).max(200),
        sessionId: z.string().min(1).max(100),
        properties: z.object({
          url: z.string().optional(),
          title: z.string().optional(),
          referrer: z.string().optional(),
          selector: z.string().optional(),
          text: z.string().optional(),
          href: z.string().optional(),
          errorMessage: z.string().optional(),
          errorStack: z.string().optional(),
          status: z.enum(['success', 'error']).optional(),
          userAgent: z.string().optional(),
          screenResolution: z.string().optional(),
          language: z.string().optional()
        }).optional()
      })
    ).min(1).max(50) // Maximum 50 events per batch
  })
})

// Schema for querying analytics events
export const getAnalyticsEventsSchema = z.object({
  type: z.enum(['pageview', 'click', 'error', 'all']).optional().default('all'),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional().default('20'),
  offset: z.string().transform(Number).pipe(z.number().min(0)).optional().default('0'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Schema for analytics stats
export const getAnalyticsStatsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'all']).optional().default('today')
})