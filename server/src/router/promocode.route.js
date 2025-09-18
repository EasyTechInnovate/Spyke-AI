import { Router } from 'express'
import promocodeController from '../controller/Promocode/promocode.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createPromocodeSchema,
  updatePromocodeSchema,
  getPromocodesSchema,
  validatePromocodeSchema
} from '../schema/promocode.schema.js'
import rateLimiter from '../middleware/rateLimit.js'

const router = Router()

router.get('/self', promocodeController.self)

router.get(
  '/public',
  validateRequest(getPromocodesSchema, 'query'),
  promocodeController.getPublicPromocodes
)

router.get(
  '/applicable',
  promocodeController.getApplicablePromocodes
)

router.post(
  '/',
  authenticate,
  authorize(['seller', 'admin']),
  rateLimiter,
  validateRequest(createPromocodeSchema),
  promocodeController.createPromocode
)

router.get(
  '/',
  authenticate,
  authorize(['seller', 'admin']),
  validateRequest(getPromocodesSchema, 'query'),
  promocodeController.getPromocodes
)

router.get(
  '/:id',
  authenticate,
  authorize(['seller', 'admin']),
  promocodeController.getPromocodeById
)

router.put(
  '/:id',
  authenticate,
  authorize(['seller', 'admin']),
  validateRequest(updatePromocodeSchema),
  promocodeController.updatePromocode
)

router.delete(
  '/:id',
  authenticate,
  authorize(['seller', 'admin']),
  promocodeController.deletePromocode
)

router.post(
  '/:id/toggle-status',
  authenticate,
  authorize(['seller', 'admin']),
  promocodeController.togglePromocodeStatus
)

router.get(
  '/validate/:code',
  authenticate,
  promocodeController.validatePromocode
)

router.get(
  '/:id/stats',
  authenticate,
  authorize(['seller', 'admin']),
  promocodeController.getPromocodeUsageStats
)

export default router