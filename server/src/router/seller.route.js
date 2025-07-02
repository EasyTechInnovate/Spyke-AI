import { Router } from 'express'
import sellerController from '../controller/Seller/seller.controller.js'
import sellerSchemas from '../schema/seller.schema.js'
import validateRequest from '../middleware/validateRequest.js'
import authentication from '../middleware/authentication.js'
import authorization from '../middleware/authorization.js'
import { EUserRole } from '../constant/application.js'

const router = Router()

router.route('/public/:sellerId').get(validateRequest(sellerSchemas.sellerIdParam, 'params'), sellerController.getPublicProfile)

router.route('/search').get(validateRequest(sellerSchemas.searchSellers, 'query'), sellerController.searchSellers)

router.use(authentication)

router
    .route('/profile')
    .post(validateRequest(sellerSchemas.createProfile), sellerController.createProfile)
    .get(sellerController.getProfile)
    .put(validateRequest(sellerSchemas.updateProfile), sellerController.updateProfile)

router.route('/verification/submit').post(validateRequest(sellerSchemas.submitVerification), sellerController.submitForVerification)

router.route('/commission/accept').post(sellerController.acceptCommissionOffer)

router.route('/commission/reject').post(validateRequest(sellerSchemas.rejectCommissionOffer), sellerController.rejectCommissionOffer)

router.route('/commission/counter-offer').post(validateRequest(sellerSchemas.submitCounterOffer), sellerController.submitCounterOffer)

router.route('/stats').get(sellerController.getStats)

router.route('/payout').put(validateRequest(sellerSchemas.updatePayoutInfo), sellerController.updatePayoutInfo)

router.use(authorization([EUserRole.ADMIN]))

router.route('/admin/profiles').get(validateRequest(sellerSchemas.getAllProfiles, 'query'), sellerController.getAllProfiles)

router
    .route('/admin/commission/offer/:sellerId')
    .post(validateRequest(sellerSchemas.sellerIdParam, 'params'), validateRequest(sellerSchemas.offerCommission), sellerController.offerCommission)

router
    .route('/admin/profile/reject/:sellerId')
    .post(validateRequest(sellerSchemas.sellerIdParam, 'params'), validateRequest(sellerSchemas.rejectProfile), sellerController.rejectProfile)

export default router
