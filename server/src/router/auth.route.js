import { Router } from 'express'
import authenticationController from '../controller/Authentication/authentication.controller.js'
import authSchemas from '../schema/auth.schema.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'

const router = Router()

router.route('/health').get(authenticationController.self)
router.route('/register').post(validateRequest(authSchemas.register), authenticationController.register)
router
    .route('/confirmation/:token')
    .get(
        validateRequest(authSchemas.confirmationParams, 'params'),
        validateRequest(authSchemas.confirmationQuery, 'query'),
        authenticationController.confirmation
    )
router.route('/login').post(validateRequest(authSchemas.login), authenticationController.login)
router.route('/me').get(authentication, authenticationController.me)
router.route('/logout').post(authentication, authenticationController.logout)
router.route('/refresh-token').post(validateRequest(authSchemas.refreshToken), authenticationController.refreshToken)
router.route('/forgot-password').post(validateRequest(authSchemas.forgotPassword), authenticationController.forgotPassword)
router.route('/reset-password').post(validateRequest(authSchemas.resetPassword), authenticationController.resetPassword)
router.route('/change-password').post(authentication, validateRequest(authSchemas.changePassword), authenticationController.changePassword)
router.route('/update-profile').put(authentication, validateRequest(authSchemas.updateProfile), authenticationController.updateProfile)

export default router