import { Router } from 'express'
import { 
  self,
  createAnalyticsEvents, 
  getAnalyticsEvents, 
  getAnalyticsStats,
  clearAnalyticsEvents 
} from '../controller/Analytics/analytics.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { 
  createAnalyticsEventSchema, 
  getAnalyticsEventsSchema, 
  getAnalyticsStatsSchema 
} from '../schema/analytics.schema.js'
import rateLimiter from '../middleware/rateLimit.js'

const router = Router()

router.route('/self').get(self)
router.post(
  '/events',
  rateLimiter, // Uses default rate limiting
  validateRequest(createAnalyticsEventSchema),
  createAnalyticsEvents
)

router.get(
  '/events',
  authenticate,
  authorize(['admin']),
  validateRequest(getAnalyticsEventsSchema, 'query'),
  getAnalyticsEvents
)

router.get(
  '/stats',
  authenticate,
  authorize(['admin']),
  validateRequest(getAnalyticsStatsSchema, 'query'),
  getAnalyticsStats
)

router.delete(
  '/events',
  authenticate,
  authorize(['admin']),
  clearAnalyticsEvents
)

export default router