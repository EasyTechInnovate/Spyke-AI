import { Router } from 'express'
import authRoutes from './auth.route.js'
import healthRoutes from './health.route.js'
import uploadRoutes from './upload.route.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/health', healthRoutes)
router.use('/upload', uploadRoutes)

export default router