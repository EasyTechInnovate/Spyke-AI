import { Router } from 'express'
import sellerController from '../controller/Seller/seller.controller.js'
import sellerSchemas from '../schema/seller.schema.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import authorization from '../middleware/authorization.js'
import { EUserRole } from '../constant/application.js'

const router = Router()

// Public routes (no authentication required)
router.route('/public/:sellerId').get(validateRequest(sellerSchemas.sellerIdParam, 'params'), sellerController.getPublicProfile)
router.route('/search').get(validateRequest(sellerSchemas.searchSellers, 'query'), sellerController.searchSellers)

// Authenticated seller routes
router
    .route('/profile')
    .post(authentication, validateRequest(sellerSchemas.createProfile), sellerController.createProfile)
    .get(authentication, authorization([EUserRole.SELLER]), sellerController.getProfile)
    .put(authentication,authorization([EUserRole.ADMIN,EUserRole.SELLER]),validateRequest(sellerSchemas.updateProfile), sellerController.updateProfile)

router.route('/verification/submit').post(authentication, validateRequest(sellerSchemas.submitVerification), sellerController.submitForVerification)
router.route('/commission/accept').post(authentication, sellerController.acceptCommissionOffer)
router.route('/commission/reject').post(authentication, validateRequest(sellerSchemas.rejectCommissionOffer), sellerController.rejectCommissionOffer)
router.route('/commission/counter-offer').post(authentication, validateRequest(sellerSchemas.submitCounterOffer), sellerController.submitCounterOffer)
router.route('/stats').get(authentication, sellerController.getStats)
router.route('/payout').put(authentication, validateRequest(sellerSchemas.updatePayoutInfo), sellerController.updatePayoutInfo)

// Admin only routes
router
    .route('/admin/profiles')
    .get(authentication, authorization([EUserRole.ADMIN]), validateRequest(sellerSchemas.getAllProfiles, 'query'), sellerController.getAllProfiles)

router
    .route('/admin/commission/offer/:sellerId')
    .post(
        authentication,
        authorization([EUserRole.ADMIN]),
        validateRequest(sellerSchemas.sellerIdParam, 'params'),
        validateRequest(sellerSchemas.offerCommission),
        sellerController.offerCommission
    )

router
    .route('/admin/profile/reject/:sellerId')
    .post(
        authentication,
        authorization([EUserRole.ADMIN]),
        // validateRequest(sellerSchemas.sellerIdParam, 'params'),
        // validateRequest(sellerSchemas.rejectProfile),
        sellerController.rejectProfile
    )

router
    .route('/admin/commission/accept-counter/:sellerId')
    .post(
        authentication,
        authorization([EUserRole.ADMIN]),
        validateRequest(sellerSchemas.sellerIdParam, 'params'),
        sellerController.acceptCounterOffer
    )
export default router

