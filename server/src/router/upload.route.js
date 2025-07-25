import { Router } from 'express'
import uploadController from '../controller/Upload/upload.controller.js'
import { uploadFiles } from '../middleware/multerHandler.js'

const router = Router()

router.route('/self').get(uploadController.self)
router.route('/file').post(uploadFiles, uploadController.uploadFile)

export default router