import { Router } from 'express'
import authRoutes from './auth.route.js'
import healthRoutes from './health.route.js'
import uploadRoutes from './upload.route.js'
import sellerRoutes from './seller.route.js'
import productRoutes from './product.route.js'
import promocodeRoutes from './promocode.route.js'
import purchaseRoutes from './purchase.route.js'
import analyticsRoutes from './analytics.route.js'
import adminRoutes from './admin.route.js'
import categoryRoutes from '../routes/category.routes.js'
import industryRoutes from '../routes/industry.routes.js'
import toolRoutes from '../routes/tool.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/health', healthRoutes)
router.use('/upload', uploadRoutes)
router.use('/seller', sellerRoutes)
router.use('/products', productRoutes)
router.use('/promocode', promocodeRoutes)
router.use('/purchase', purchaseRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/admin', adminRoutes)
router.use('/categories', categoryRoutes)
router.use('/industries', industryRoutes)
router.use('/tools', toolRoutes)

export default router