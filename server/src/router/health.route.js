import { Router } from 'express'
import healthController from '../controller/Health/health.controller.js'

const router = Router()

router.route('/self').get(healthController.self)
router.route('/').get(healthController.health)

export default router