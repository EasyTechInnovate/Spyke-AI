import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import userModel from '../../model/user.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import Product from '../../model/product.model.js'
import Purchase from '../../model/purchase.model.js'
import { notificationService } from '../../util/notification.js'
import { EUserRole, ESellerVerificationStatus, ECommissionOfferStatus, EOrderStatus, EPaymentStatus } from '../../constant/application.js'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Seller Profile'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    createProfile: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const {
                fullName,
                email,
                websiteUrl,
                bio,
                niches,
                toolsSpecialization,
                location,
                sellerBanner,
                socialHandles,
                customAutomationServices,
                portfolioLinks,
                payoutInfo
            } = req.body

            const existingProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (existingProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_ALREADY_EXISTS), req, 400)
            }

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            user.addRole(EUserRole.SELLER)
            await user.save()

            const sellerProfileData = {
                userId: authenticatedUser.id,
                fullName,
                email,
                websiteUrl,
                bio,
                niches,
                toolsSpecialization,
                location,
                sellerBanner,
                socialHandles,
                customAutomationServices,
                portfolioLinks,
                payoutInfo,
                revenueShareAgreement: {
                    accepted: true,
                    acceptedAt: dayjs().utc().toDate(),
                    ipAddress: req.ip || req.connection.remoteAddress
                }
            }

            const newSellerProfile = new sellerProfileModel(sellerProfileData)
            const savedProfile = await newSellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Seller Profile Created Successfully!',
                'Your seller profile has been submitted for review. We will notify you once the review process is complete.',
                'success'
            )

            const responseData = {
                id: savedProfile._id,
                userId: savedProfile.userId,
                fullName: savedProfile.fullName,
                email: savedProfile.email,
                verification: savedProfile.verification,
                completionPercentage: savedProfile.completionPercentage
            }

            httpResponse(req, res, 201, responseMessage.SELLER.PROFILE_CREATED, responseData)
        } catch (err) {
            if (err.code === 11000) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_ALREADY_EXISTS), req, 400)
            }

            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },

    getProfile: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, sellerProfile)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updateProfile: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const updateData = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            const APPROVED_EDITABLE_FIELDS = ['bio','socialHandles','sellerBanner','profileImage','portfolioLinks','customAutomationServices','websiteUrl','location','niches','toolsSpecialization','languages']
            const ALWAYS_BLOCKED_FIELDS = ['fullName','verification','commissionOffer','payoutInfo','userId','isActive','stats','revenueShareAgreement','createdAt','updatedAt','_id','suspendedAt','suspendedBy','suspensionReason','activatedAt','activatedBy','activationNote']
            const isApproved = sellerProfile.verification.status === ESellerVerificationStatus.APPROVED
            const isObj = v => v && typeof v === 'object' && !Array.isArray(v)

            let applied = 0
            for (const [key, val] of Object.entries(updateData)) {
                if (val === undefined) continue
                if (ALWAYS_BLOCKED_FIELDS.includes(key)) continue
                if (isApproved && !APPROVED_EDITABLE_FIELDS.includes(key)) continue

                if (isObj(val) && isObj(sellerProfile[key])) {
                    sellerProfile[key] = { ...sellerProfile[key], ...val }
                } else {
                    sellerProfile[key] = val
                }
                applied++
            }

            if (applied === 0) {
                return httpError(next, new Error('No allowed fields to update'), req, 400)
            }

            const updatedProfile = await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Profile Updated',
                'Your seller profile has been updated successfully.',
                'info'
            )

            httpResponse(req, res, 200, responseMessage.UPDATED, updatedProfile)
        } catch (err) {
            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },

    submitForVerification: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { identityProof, businessProof, taxDocument } = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.verification.status !== ESellerVerificationStatus.PENDING) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_ALREADY_SUBMITTED), req, 400)
            }

            if (sellerProfile.completionPercentage < 80) {
                return httpError(next, new Error(responseMessage.SELLER.INCOMPLETE_PROFILE), req, 400)
            }

            sellerProfile.verification.status = ESellerVerificationStatus.UNDER_REVIEW
            sellerProfile.verification.submittedAt = dayjs().utc().toDate()
            sellerProfile.verification.documents = {
                identityProof,
                businessProof,
                taxDocument
            }

            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Profile Submitted for Review',
                'Your seller profile has been submitted for verification. Our team will review it within 3-5 business days.',
                'info'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.PROFILE_SUBMITTED, {
                verificationStatus: sellerProfile.verification.status,
                submittedAt: sellerProfile.verification.submittedAt
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    acceptCommissionOffer: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.verification.status !== ESellerVerificationStatus.COMMISSION_OFFERED) {
                return httpError(next, new Error(responseMessage.SELLER.NO_COMMISSION_OFFER), req, 400)
            }

            if (sellerProfile.commissionOffer.status !== ECommissionOfferStatus.PENDING) {
                return httpError(next, new Error(responseMessage.SELLER.COMMISSION_ALREADY_RESPONDED), req, 400)
            }

            sellerProfile.acceptCommissionOffer()
            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Welcome to Our Seller Community!',
                `Congratulations! You've accepted our commission offer of ${sellerProfile.commissionOffer.rate}%. Your seller account is now active.`,
                'success'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.COMMISSION_ACCEPTED, {
                verificationStatus: sellerProfile.verification.status,
                commissionRate: sellerProfile.commissionOffer.rate,
                approvedAt: sellerProfile.verification.approvedAt
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    rejectCommissionOffer: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { reason } = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.verification.status !== ESellerVerificationStatus.COMMISSION_OFFERED) {
                return httpError(next, new Error(responseMessage.SELLER.NO_COMMISSION_OFFER), req, 400)
            }

            if (sellerProfile.commissionOffer.status !== ECommissionOfferStatus.PENDING) {
                return httpError(next, new Error(responseMessage.SELLER.COMMISSION_ALREADY_RESPONDED), req, 400)
            }

            sellerProfile.rejectCommissionOffer(reason)
            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Commission Offer Rejected',
                'You have rejected our commission offer. Our team may reach out to discuss alternative terms.',
                'info'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.COMMISSION_REJECTED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    submitCounterOffer: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { rate, reason } = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.verification.status !== ESellerVerificationStatus.COMMISSION_OFFERED) {
                return httpError(next, new Error(responseMessage.SELLER.NO_COMMISSION_OFFER), req, 400)
            }

            if (sellerProfile.commissionOffer.status !== ECommissionOfferStatus.PENDING || sellerProfile.commissionOffer.lastOfferedBy !== 'admin') {
                return httpError(next, new Error(responseMessage.SELLER.COMMISSION_ALREADY_RESPONDED), req, 400)
            }

            if (sellerProfile.commissionOffer.negotiationRound >= 5) {
                return httpError(next, new Error(responseMessage.SELLER.MAX_NEGOTIATION_ROUNDS_REACHED), req, 400)
            }

            sellerProfile.submitCounterOffer(rate, reason)
            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Counter Offer Submitted',
                `Your counter offer of ${rate}% commission has been submitted. Our team will review and respond soon.`,
                'info'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.COUNTER_OFFER_SUBMITTED, {
                counterOfferRate: rate,
                reason: reason,
                submittedAt: sellerProfile.commissionOffer.counterOffer.submittedAt,
                negotiationRound: sellerProfile.commissionOffer.negotiationRound
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getStats: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            const responseData = {
                stats: sellerProfile.stats,
                completionPercentage: sellerProfile.completionPercentage,
                isApproved: sellerProfile.isApproved,
                currentCommissionRate: sellerProfile.getCurrentCommissionRate()
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updatePayoutInfo: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { payoutInfo } = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            sellerProfile.payoutInfo = {
                ...sellerProfile.payoutInfo,
                ...payoutInfo,
                isVerified: false,
                verifiedAt: null
            }

            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Payout Information Updated',
                'Your payout information has been updated and is pending verification.',
                'info'
            )

            httpResponse(req, res, 200, responseMessage.UPDATED, {
                payoutInfo: sellerProfile.payoutInfo
            })
        } catch (err) {
            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },

    getPublicProfile: async (req, res, next) => {
        try {
            const { sellerId } = req.params

            const sellerProfile = await sellerProfileModel.findById(sellerId).populate('userId', 'avatar createdAt')
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (!sellerProfile.isApproved) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 403)
            }

            sellerProfile.updateStats('profileViews', 1)
            await sellerProfile.save()

            const publicData = {
                id: sellerProfile._id,
                fullName: sellerProfile.fullName,
                bio: sellerProfile.bio,
                niches: sellerProfile.niches,
                toolsSpecialization: sellerProfile.toolsSpecialization,
                location: sellerProfile.location,
                sellerBanner: sellerProfile.sellerBanner,
                socialHandles: sellerProfile.socialHandles,
                customAutomationServices: sellerProfile.customAutomationServices,
                portfolioLinks: sellerProfile.portfolioLinks,
                stats: {
                    totalProducts: sellerProfile.stats.totalProducts,
                    averageRating: sellerProfile.stats.averageRating,
                    totalReviews: sellerProfile.stats.totalReviews,
                    profileViews: sellerProfile.stats.profileViews
                },
                memberSince: sellerProfile.userId?.createdAt,
                avatar: sellerProfile.userId?.avatar
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, publicData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    searchSellers: async (req, res, next) => {
        try {
            const { niche, tool, country, minRating = 0, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            const query = {
                'verification.status': ESellerVerificationStatus.APPROVED,
                'commissionOffer.status': ECommissionOfferStatus.ACCEPTED,
                isActive: true,
                'stats.averageRating': { $gte: parseFloat(minRating) }
            }

            if (niche) query.niches = niche
            if (tool) query.toolsSpecialization = tool
            if (country) query['location.country'] = country

            const sort = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const [sellers, totalCount] = await Promise.all([
                sellerProfileModel
                    .find(query)
                    .select('fullName bio niches toolsSpecialization location sellerBanner stats customAutomationServices')
                    .populate('userId', 'avatar createdAt')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit)),
                sellerProfileModel.countDocuments(query)
            ])

            const responseData = {
                sellers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / parseInt(limit))
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getAllProfiles: async (req, res, next) => {
        try {
            const { status = 'all', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            const query = {}
            if (status !== 'all') {
                query['verification.status'] = status
            }

            const sort = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const [profiles, totalCount] = await Promise.all([
                sellerProfileModel.find(query).populate('userId', 'emailAddress avatar createdAt').sort(sort).skip(skip).limit(parseInt(limit)),
                sellerProfileModel.countDocuments(query)
            ])

            const responseData = {
                profiles,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCount,
                    totalPages: Math.ceil(totalCount / parseInt(limit))
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    offerCommission: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sellerId } = req.params
            const { rate } = req.body

            const sellerProfile = await sellerProfileModel.findById(sellerId)
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            const canOfferCommission =
                sellerProfile.verification.status === ESellerVerificationStatus.UNDER_REVIEW ||
                (sellerProfile.verification.status === ESellerVerificationStatus.COMMISSION_OFFERED &&
                    sellerProfile.commissionOffer.status === 'counter_offered' &&
                    sellerProfile.commissionOffer.lastOfferedBy === 'seller')

            if (!canOfferCommission) {
                return httpError(next, new Error(responseMessage.SELLER.CANNOT_OFFER_COMMISSION), req, 400)
            }

            if (sellerProfile.commissionOffer.negotiationRound >= 5) {
                return httpError(next, new Error(responseMessage.SELLER.MAX_NEGOTIATION_ROUNDS_REACHED), req, 400)
            }

            if (sellerProfile.verification.status === ESellerVerificationStatus.UNDER_REVIEW) {
                sellerProfile.verification.status = ESellerVerificationStatus.COMMISSION_OFFERED
                sellerProfile.verification.reviewedAt = dayjs().utc().toDate()
                sellerProfile.verification.reviewedBy = authenticatedUser.id

                sellerProfile.commissionOffer = {
                    rate,
                    offeredBy: authenticatedUser.id,
                    offeredAt: dayjs().utc().toDate(),
                    status: ECommissionOfferStatus.PENDING,
                    negotiationRound: 1,
                    lastOfferedBy: 'admin'
                }
            } else {
                sellerProfile.adminCounterOffer(rate, authenticatedUser.id)
            }

            await sellerProfile.save()

            await notificationService.sendToUser(
                sellerProfile.userId,
                'Commission Offer Received!',
                `Great news! We're offering you a ${rate}% commission rate. Please review and respond to this offer in your seller dashboard.`,
                'success'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.COMMISSION_OFFERED, {
                sellerId,
                commissionRate: rate,
                offeredAt: sellerProfile.commissionOffer.offeredAt,
                negotiationRound: sellerProfile.commissionOffer.negotiationRound
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    rejectProfile: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sellerId } = req.params
            const { reason } = req.body

            const sellerProfile = await sellerProfileModel.findById(sellerId)
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            const canReject =
                sellerProfile.verification.status === ESellerVerificationStatus.UNDER_REVIEW ||
                sellerProfile.verification.status === ESellerVerificationStatus.COMMISSION_OFFERED

            if (!canReject) {
                return httpError(next, new Error(responseMessage.SELLER.CANNOT_REJECT_PROFILE), req, 400)
            }

            sellerProfile.verification.status = ESellerVerificationStatus.REJECTED
            sellerProfile.verification.reviewedAt = dayjs().utc().toDate()
            sellerProfile.verification.reviewedBy = authenticatedUser.id
            sellerProfile.verification.rejectionReason = reason

            sellerProfile.commissionOffer = {
                rate: null,
                offeredBy: null,
                offeredAt: null,
                status: 'rejected',
                negotiationRound: 1,
                lastOfferedBy: 'admin',
                acceptedAt: null,
                rejectedAt: new Date(),
                rejectionReason: reason,
                counterOffer: {
                    rate: null,
                    reason: null,
                    submittedAt: null
                }
            }

            await sellerProfile.save()

            await notificationService.sendToUser(
                sellerProfile.userId,
                'Seller Application Update',
                `Your seller application has been reviewed. Please check your dashboard for details and next steps.`,
                'warning'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.PROFILE_REJECTED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    acceptCounterOffer: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sellerId } = req.params

            const sellerProfile = await sellerProfileModel.findById(sellerId)
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.commissionOffer.status !== ECommissionOfferStatus.COUNTER_OFFERED) {
                return httpError(next, new Error(responseMessage.SELLER.NO_COUNTER_OFFER), req, 400)
            }

            if (sellerProfile.commissionOffer.negotiationRound >= 5) {
                return httpError(next, new Error(responseMessage.SELLER.MAX_NEGOTIATION_ROUNDS_REACHED), req, 400)
            }

            sellerProfile.commissionOffer.rate = sellerProfile.commissionOffer.counterOffer.rate
            sellerProfile.commissionOffer.status = ECommissionOfferStatus.PENDING
            sellerProfile.commissionOffer.negotiationRound += 1
            sellerProfile.commissionOffer.lastOfferedBy = 'admin'
            sellerProfile.commissionOffer.offeredBy = authenticatedUser.id
            sellerProfile.commissionOffer.offeredAt = dayjs().utc().toDate()

            sellerProfile.commissionOffer.counterOffer = {
                rate: null,
                reason: null,
                submittedAt: null
            }

            await sellerProfile.save()

            await notificationService.sendToUser(
                sellerProfile.userId,
                'Counter Offer Accepted!',
                `Great news! We've accepted your counter offer of ${sellerProfile.commissionOffer.rate}%. Please accept this updated offer to complete your seller approval.`,
                'success'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.COUNTER_OFFER_ACCEPTED, {
                sellerId,
                acceptedRate: sellerProfile.commissionOffer.rate,
                acceptedAt: sellerProfile.commissionOffer.offeredAt,
                negotiationRound: sellerProfile.commissionOffer.negotiationRound
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    getDashboard: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            const now = dayjs().utc()
            const last30Days = now.subtract(30, 'days').toDate()
            const last7Days = now.subtract(7, 'days').toDate()

            const [
                recentOrders,
                topProducts,
                totalProductViews,
                pendingOrdersCount,
                completedOrdersCount,
                revenueThisMonth,
                salesThisMonth
            ] = await Promise.all([
                Purchase.aggregate([
                    {
                        $match: {
                            'items.sellerId': sellerProfile._id,
                            paymentStatus: EPaymentStatus.COMPLETED,
                            purchaseDate: { $gte: last30Days }
                        }
                    },
                    { $unwind: '$items' },
                    { $match: { 'items.sellerId': sellerProfile._id } },
                    {
                        $lookup: {
                            from: 'products',
                            localField: 'items.productId',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    { $unwind: '$product' },
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'userId',
                            foreignField: '_id',
                            as: 'buyer'
                        }
                    },
                    { $unwind: '$buyer' },
                    {
                        $project: {
                            _id: 1,
                            orderId: '$_id',
                            productTitle: '$product.title',
                            productType: '$product.type',
                            price: '$items.price',
                            buyerName: '$buyer.name',
                            buyerEmail: '$buyer.emailAddress',
                            orderDate: '$purchaseDate',
                            status: '$orderStatus'
                        }
                    },
                    { $sort: { orderDate: -1 } },
                    { $limit: 10 }
                ]),

                Product.find({ sellerId: sellerProfile._id })
                    .select('title type price sales views averageRating thumbnail')
                    .sort({ sales: -1 })
                    .limit(5)
                    .lean(),

                Product.aggregate([
                    { $match: { sellerId: sellerProfile._id } },
                    { $group: { _id: null, totalViews: { $sum: '$views' } } }
                ]).then(result => result[0]?.totalViews || 0),

                Purchase.countDocuments({
                    'items.sellerId': sellerProfile._id,
                    orderStatus: EOrderStatus.PENDING,
                    paymentStatus: EPaymentStatus.COMPLETED
                }),

                Purchase.countDocuments({
                    'items.sellerId': sellerProfile._id,
                    orderStatus: EOrderStatus.COMPLETED,
                    paymentStatus: EPaymentStatus.COMPLETED
                }),

                Purchase.aggregate([
                    {
                        $match: {
                            'items.sellerId': sellerProfile._id,
                            paymentStatus: EPaymentStatus.COMPLETED,
                            purchaseDate: { $gte: now.startOf('month').toDate() }
                        }
                    },
                    { $unwind: '$items' },
                    { $match: { 'items.sellerId': sellerProfile._id } },
                    { $group: { _id: null, totalRevenue: { $sum: '$items.price' } } }
                ]).then(result => result[0]?.totalRevenue || 0),

                Purchase.aggregate([
                    {
                        $match: {
                            'items.sellerId': sellerProfile._id,
                            paymentStatus: EPaymentStatus.COMPLETED,
                            purchaseDate: { $gte: now.startOf('month').toDate() }
                        }
                    },
                    { $unwind: '$items' },
                    { $match: { 'items.sellerId': sellerProfile._id } },
                    { $count: 'totalSales' }
                ]).then(result => result[0]?.totalSales || 0)
            ])

            const totalCartAdditions = await Purchase.aggregate([
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        purchaseDate: { $gte: last30Days }
                    }
                },
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerProfile._id } },
                { $count: 'totalCarts' }
            ]).then(result => result[0]?.totalCarts || 0)

            const previous30Days = now.subtract(60, 'days').toDate()
            const [currentPeriodRevenue, previousPeriodRevenue] = await Promise.all([
                Purchase.aggregate([
                    {
                        $match: {
                            'items.sellerId': sellerProfile._id,
                            paymentStatus: EPaymentStatus.COMPLETED,
                            purchaseDate: { $gte: last30Days }
                        }
                    },
                    { $unwind: '$items' },
                    { $match: { 'items.sellerId': sellerProfile._id } },
                    { $group: { _id: null, revenue: { $sum: '$items.price' } } }
                ]).then(result => result[0]?.revenue || 0),

                Purchase.aggregate([
                    {
                        $match: {
                            'items.sellerId': sellerProfile._id,
                            paymentStatus: EPaymentStatus.COMPLETED,
                            purchaseDate: { $gte: previous30Days, $lt: last30Days }
                        }
                    },
                    { $unwind: '$items' },
                    { $match: { 'items.sellerId': sellerProfile._id } },
                    { $group: { _id: null, revenue: { $sum: '$items.price' } } }
                ]).then(result => result[0]?.revenue || 0)
            ])

            const revenueGrowth = previousPeriodRevenue > 0 
                ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue * 100)
                : currentPeriodRevenue > 0 ? 100 : 0

            const dashboardData = {
                totalEarnings: sellerProfile.stats.totalEarnings,
                totalOrders: sellerProfile.stats.totalSales,
                totalProducts: sellerProfile.stats.totalProducts,
                averageRating: sellerProfile.stats.averageRating,
                
                pendingOrders: pendingOrdersCount,
                completedOrders: completedOrdersCount,
                
                recentOrders: recentOrders.map(order => ({
                    id: order._id,
                    orderId: String(order._id).slice(-6),
                    productTitle: order.productTitle,
                    productType: order.productType,
                    price: order.price,
                    buyerName: order.buyerName,
                    buyerEmail: order.buyerEmail,
                    orderDate: order.orderDate,
                    status: order.status,
                    formattedDate: dayjs(order.orderDate).format('MMM DD, YYYY')
                })),

                topProducts: topProducts.map(product => ({
                    id: product._id,
                    title: product.title,
                    type: product.type,
                    price: product.price,
                    sales: product.sales,
                    views: product.views,
                    averageRating: product.averageRating,
                    thumbnail: product.thumbnail,
                    conversionRate: product.views > 0 ? ((product.sales / product.views) * 100).toFixed(1) : 0
                })),

                analytics: {
                    views: totalProductViews,
                    carts: totalCartAdditions,
                    purchases: sellerProfile.stats.totalSales,
                    conversionRate: totalProductViews > 0 ? ((sellerProfile.stats.totalSales / totalProductViews) * 100).toFixed(2) : 0
                },

                performance: {
                    revenueThisMonth: revenueThisMonth,
                    salesThisMonth: salesThisMonth,
                    revenueGrowth: revenueGrowth.toFixed(1),
                    profileViews: sellerProfile.stats.profileViews,
                    averageOrderValue: sellerProfile.stats.totalSales > 0 
                        ? (sellerProfile.stats.totalEarnings / sellerProfile.stats.totalSales).toFixed(2) 
                        : 0
                },

                summary: {
                    isApproved: sellerProfile.isApproved,
                    verificationStatus: sellerProfile.verification.status,
                    commissionRate: sellerProfile.getCurrentCommissionRate(),
                    completionPercentage: sellerProfile.completionPercentage,
                    memberSince: sellerProfile.createdAt,
                    lastUpdated: sellerProfile.updatedAt
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, dashboardData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    suspendSeller: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sellerId } = req.params
            const { reason } = req.body

            const sellerProfile = await sellerProfileModel.findById(sellerId)
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (!sellerProfile.isActive) {
                return httpError(next, new Error(responseMessage.SELLER.ALREADY_SUSPENDED), req, 400)
            }

            sellerProfile.isActive = false
            sellerProfile.suspendedAt = dayjs().utc().toDate()
            sellerProfile.suspendedBy = authenticatedUser.id
            sellerProfile.suspensionReason = reason

            await sellerProfile.save()

            await notificationService.sendToUser(
                sellerProfile.userId,
                'Account Suspended',
                `Your seller account has been suspended. Reason: ${sellerProfile.suspensionReason}. Please contact support for assistance.`,
                'warning'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.SUSPENDED, {
                sellerId,
                suspendedAt: sellerProfile.suspendedAt,
                reason: sellerProfile.suspensionReason
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    activateSeller: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { sellerId } = req.params
            const { note } = req.body

            const sellerProfile = await sellerProfileModel.findById(sellerId)
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller profile')), req, 404)
            }

            if (sellerProfile.isActive) {
                return httpError(next, new Error(responseMessage.SELLER.ALREADY_ACTIVE), req, 400)
            }

            if (sellerProfile.verification.status !== ESellerVerificationStatus.APPROVED) {
                return httpError(next, new Error(responseMessage.SELLER.NOT_APPROVED_FOR_ACTIVATION), req, 400)
            }

            sellerProfile.isActive = true
            sellerProfile.activatedAt = dayjs().utc().toDate()
            sellerProfile.activatedBy = authenticatedUser.id
            sellerProfile.activationNote = note

            sellerProfile.suspendedAt = null
            sellerProfile.suspendedBy = null
            sellerProfile.suspensionReason = null

            await sellerProfile.save()

            await notificationService.sendToUser(
                sellerProfile.userId,
                'Account Activated',
                `Your seller account has been activated! You can now start selling on our platform. ${note ? `Note: ${note}` : ''}`,
                'success'
            )

            httpResponse(req, res, 200, responseMessage.SELLER.ACTIVATED, {
                sellerId,
                activatedAt: sellerProfile.activatedAt,
                note: sellerProfile.activationNote
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}

