import { Router } from 'express'
import * as payoutController from '../controller/Admin/payout.controller.js'
import * as platformSettingsController from '../controller/Admin/platform.settings.controller.js'
import * as userController from '../controller/Admin/user.controller.js'
import adminController from '../controller/Analytics/admin.controller.js'
import payoutSchemas from '../schema/payout.schema.js'
import userSchemas from '../schema/user.schema.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import authorization from '../middleware/authorization.js'
import { EUserRole } from '../constant/application.js'

const router = Router()

// Service health checks
router.get('/platform/settings/self', platformSettingsController.self)
router.get('/payouts/self', payoutController.self)

// Platform Settings Routes
router.route('/platform/settings')
    .get(authentication, authorization([EUserRole.ADMIN]), platformSettingsController.getPlatformSettings)
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.updatePlatformSettings), platformSettingsController.updatePlatformSettings)

router.route('/platform/settings/reset')
    .post(authentication, authorization([EUserRole.ADMIN]), platformSettingsController.resetPlatformSettings)

// Payout Management Routes
router.route('/payouts')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.getPayouts, 'query'), payoutController.getPayouts)

router.route('/payouts/analytics')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.getPayoutAnalytics, 'query'), payoutController.getPayoutAnalytics)

router.route('/payouts/bulk-approve')
    .post(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.bulkApprovePayouts), payoutController.bulkApprovePayout)

router.route('/payouts/:id')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), payoutController.getPayoutDetails)

router.route('/payouts/:id/approve')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), validateRequest(payoutSchemas.approvePayout), payoutController.approvePayout)

router.route('/payouts/:id/reject')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), validateRequest(payoutSchemas.rejectPayout), payoutController.rejectPayout)

router.route('/payouts/:id/hold')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), validateRequest(payoutSchemas.holdPayout), payoutController.holdPayout)

router.route('/payouts/:id/release')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), payoutController.releasePayout)

router.route('/payouts/:id/processing')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), validateRequest(payoutSchemas.markAsProcessing), payoutController.markAsProcessing)

router.route('/payouts/:id/completed')
    .put(authentication, authorization([EUserRole.ADMIN]), validateRequest(payoutSchemas.payoutIdParam, 'params'), validateRequest(payoutSchemas.markAsCompleted), payoutController.markAsCompleted)

router.get('/users/self', userController.self)

router.route('/users/analytics')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(userSchemas.getUserManagementAnalytics, 'query'), userController.getUserManagementAnalytics)

router.route('/users/suspend/:userId')
    .post(authentication, authorization([EUserRole.ADMIN]), validateRequest(userSchemas.userIdParam, 'params'), validateRequest(userSchemas.suspendUser), userController.suspendUser)

router.route('/users/activate/:userId')
    .post(authentication, authorization([EUserRole.ADMIN]), validateRequest(userSchemas.userIdParam, 'params'), validateRequest(userSchemas.activateUser), userController.activateUser)

// User order management route for admin (combined endpoint)
router.route('/users/:userId/orders')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(userSchemas.userIdParam, 'params'), adminController.getUserOrders)

export default router