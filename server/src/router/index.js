import { Router } from 'express'
import authRoutes from './auth.route.js'
import healthRoutes from './health.route.js'
import uploadRoutes from './upload.route.js'
import sellerRoutes from './seller.route.js'
import productRoutes from './product.route.js'
import promocodeRoutes from './promocode.route.js'
import purchaseRoutes from './purchase.route.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/health', healthRoutes)
router.use('/upload', uploadRoutes)
router.use('/seller', sellerRoutes)
router.use('/products', productRoutes)
router.use('/promocode', promocodeRoutes)
router.use('/purchase', purchaseRoutes)

export default router