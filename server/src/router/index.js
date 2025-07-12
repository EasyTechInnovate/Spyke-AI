import { Router } from 'express'
import authRoutes from './auth.route.js'
import healthRoutes from './health.route.js'
import uploadRoutes from './upload.route.js'
import sellerRoutes from './seller.route.js'
import analyticsRoutes from './analytics.route.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/health', healthRoutes)
router.use('/upload', uploadRoutes)
router.use('/seller', sellerRoutes)
router.use('/analytics', analyticsRoutes)

export default router