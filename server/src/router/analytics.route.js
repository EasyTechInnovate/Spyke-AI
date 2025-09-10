import { Router } from 'express'
import userAnalyticsController from '../controller/Analytics/user.controller.js'
import sellerAnalyticsController from '../controller/Analytics/seller.controller.js'
import adminAnalyticsController from '../controller/Analytics/admin.controller.js'
import authentication from '../middleware/authentication.js'
import authorization from '../middleware/authorization.js'
import { EUserRole } from '../constant/application.js'

const router = Router()

// Service health check
router.route('/self').get(userAnalyticsController.self)

router.route('/user/dashboard')
    .get(authentication, userAnalyticsController.getDashboardAnalytics)

router.route('/user/purchases')
    .get(authentication, userAnalyticsController.getPurchaseHistory)

router.route('/user/favorites')
    .get(authentication, userAnalyticsController.getFavoriteAnalytics)

router.route('/user/activity')
    .get(authentication, userAnalyticsController.getUserActivity)

router.route('/user/spending')
    .get(authentication, userAnalyticsController.getSpendingInsights)

router.route('/seller/dashboard')
    .get(authentication, authorization([EUserRole.SELLER]), sellerAnalyticsController.getDashboardAnalytics)

router.route('/seller/products')
    .get(authentication, authorization([EUserRole.SELLER]), sellerAnalyticsController.getProductAnalytics)

router.route('/seller/sales')
    .get(authentication, authorization([EUserRole.SELLER]), sellerAnalyticsController.getSalesAnalytics)

router.route('/seller/revenue')
    .get(authentication, authorization([EUserRole.SELLER]), sellerAnalyticsController.getRevenueAnalytics)

router.route('/seller/customers')
    .get(authentication, authorization([EUserRole.SELLER]), sellerAnalyticsController.getCustomerAnalytics)

router.route('/admin/platform')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getPlatformAnalytics)

router.route('/admin/users')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getUserAnalytics)

router.route('/admin/sellers')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getSellerAnalytics)

router.route('/admin/products')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getProductAnalytics)

router.route('/admin/sales')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getSalesAnalytics)

router.route('/admin/promocodes')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getPromocodeAnalytics)

router.route('/admin/revenue')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getRevenueAnalytics)

router.route('/admin/user-trends')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getUserTrends)

router.route('/admin/seller-trends')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getSellerTrends)

router.route('/admin/feedback')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getFeedbackAnalytics)

router.route('/admin/traffic')
    .get(authentication, authorization([EUserRole.ADMIN]), adminAnalyticsController.getTrafficAnalytics)

export default router