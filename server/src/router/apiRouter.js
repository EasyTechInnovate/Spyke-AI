import { Router } from 'express'
import healthController from '../controller/Health/health.controller.js'
import uploadController from '../controller/Upload/upload.controller.js'
import { uploadFiles } from '../middleware/multerHandler.js'
import authenticationController from '../controller/Authentication/authentication.controller.js'
import authSchemas from '../schema/auth.schema.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'

const router = Router()

// Health routes
router.route('/self').get(healthController.self)
router.route('/health').get(healthController.health)

// File upload routes
router.route('/upload/health').get(uploadController.self)
router.route('/upload-file').post(uploadFiles, uploadController.uploadFile)

// Authentication routes
router.route('/auth/health').get(authenticationController.self)
router.route('/auth/register').post(validateRequest(authSchemas.register), authenticationController.register)
router
    .route('/auth/confirmation/:token')
    .get(
        validateRequest(authSchemas.confirmationParams, 'params'),
        validateRequest(authSchemas.confirmationQuery, 'query'),
        authenticationController.confirmation
    )
router.route('/auth/login').post(validateRequest(authSchemas.login), authenticationController.login)
router.route('/auth/me').get(authentication, authenticationController.me)
router.route('/auth/logout').post(authentication, authenticationController.logout)
router.route('/auth/refresh-token').post(validateRequest(authSchemas.refreshToken), authenticationController.refreshToken)
router.route('/auth/forgot-password').post(validateRequest(authSchemas.forgotPassword), authenticationController.forgotPassword)
router.route('/auth/reset-password').post(validateRequest(authSchemas.resetPassword), authenticationController.resetPassword)
router.route('/auth/change-password').post(authentication, validateRequest(authSchemas.changePassword), authenticationController.changePassword)
router.route('/auth/update-profile').put(authentication, validateRequest(authSchemas.updateProfile), authenticationController.updateProfile)

export default router