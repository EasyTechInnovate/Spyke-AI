import { Router } from 'express'
import purchaseController from '../controller/Purchase/purchase.controller.js'
import authenticate from '../middleware/authentication.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  addToCartSchema,
  removeFromCartSchema,
  applyPromocodeSchema,
  createPurchaseSchema,
  getUserPurchasesSchema
} from '../schema/purchase.schema.js'
import rateLimiter from '../middleware/rateLimit.js'

const router = Router()

router.get('/self', purchaseController.self)

router.get(
  '/cart',
  authenticate,
  purchaseController.getCart
)

router.post(
  '/cart/add',
  authenticate,
  rateLimiter,
  validateRequest(addToCartSchema),
  purchaseController.addToCart
)

router.delete(
  '/cart/remove/:productId',
  authenticate,
  purchaseController.removeFromCart
)

router.delete(
  '/cart/clear',
  authenticate,
  purchaseController.clearCart
)

router.post(
  '/cart/promocode',
  authenticate,
  validateRequest(applyPromocodeSchema),
  purchaseController.applyPromocode
)

router.delete(
  '/cart/promocode',
  authenticate,
  purchaseController.removePromocode
)

router.post(
  '/create',
  authenticate,
  rateLimiter,
  validateRequest(createPurchaseSchema),
  purchaseController.createPurchase
)

router.get(
  '/my-purchases',
  authenticate,
  validateRequest(getUserPurchasesSchema, 'query'),
  purchaseController.getUserPurchases
)

router.get(
  '/my-purchases/by-type',
  authenticate,
  purchaseController.getUserPurchasesByType
)

router.get(
  '/access/:id',
  authenticate,
  purchaseController.getProductAccess
)

router.post(
  '/complete-payment',
  purchaseController.completePayment
)

router.post(
  '/confirm-payment',
  authenticate,
  purchaseController.confirmPayment
)

router.post(
  '/payment-intent',
  authenticate,
  rateLimiter,
  purchaseController.createPaymentIntent
)

router.post(
  '/confirm-stripe-payment',
  authenticate,
  rateLimiter,
  purchaseController.confirmStripePayment
)

router.post(
  '/stripe/webhook',
  purchaseController.handleStripeWebhook
)

export default router