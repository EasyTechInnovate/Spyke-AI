import { Router } from 'express'
import healthController from '../controller/Health/health.controller.js'
import uploadController from '../controller/Upload/upload.controller.js'
import { uploadFiles } from '../middleware/multerHandler.js'

const router = Router()

// Health routes
router.route('/self').get(healthController.self)
router.route('/health').get(healthController.health)

// File upload routes
router.route('/upload/health').get(uploadController.self)
router.route('/upload-file').post(uploadFiles, uploadController.uploadFile);

export default router
