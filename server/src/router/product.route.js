import { Router } from 'express'
import productController from '../controller/Product/product.controller.js'
import authenticate from '../middleware/authentication.js'
import authorize from '../middleware/authorization.js'
import { validateRequest } from '../middleware/validateRequest.js'
import {
  createProductSchema,
  updateProductSchema,
  getProductsSchema,
  addReviewSchema,
  toggleFavoriteSchema,
  toggleUpvoteSchema,
  verifyProductSchema
} from '../schema/product.schema.js'
import rateLimiter from '../middleware/rateLimit.js'

const router = Router()

router.get('/self', productController.self)

router.get(
  '/',
  validateRequest(getProductsSchema, 'query'),
  productController.getProducts
)

router.get(
  '/:slug',
  productController.getProductBySlug
)

router.get(
  '/:id/related',
  productController.getRelatedProducts
)

router.post(
  '/',
  authenticate,
  authorize(['seller', 'admin']),
  rateLimiter,
  validateRequest(createProductSchema),
  productController.createProduct
)

router.put(
  '/:id',
  authenticate,
  authorize(['seller', 'admin']),
  validateRequest(updateProductSchema),
  productController.updateProduct
)

router.delete(
  '/:id',
  authenticate,
  authorize(['seller', 'admin']),
  productController.deleteProduct
)

router.post(
  '/:id/review',
  authenticate,
  rateLimiter,
  validateRequest(addReviewSchema),
  productController.addReview
)

router.post(
  '/:id/favorite',
  authenticate,
  validateRequest(toggleFavoriteSchema),
  productController.toggleFavorite
)

router.post(
  '/:id/upvote',
  authenticate,
  validateRequest(toggleUpvoteSchema),
  productController.toggleUpvote
)

router.post(
  '/:id/publish',
  authenticate,
  authorize(['seller', 'admin']),
  productController.publishProduct
)

router.get(
  '/seller/my-products',
  authenticate,
  authorize(['seller', 'admin']),
  productController.getMyProducts
)

router.get(
  '/admin/all',
  authenticate,
  authorize(['admin']),
  productController.getAllProductsAdmin
)

router.patch(
  '/:id/verify',
  authenticate,
  authorize(['admin']),
  validateRequest(verifyProductSchema),
  productController.verifyProduct
)

export default router