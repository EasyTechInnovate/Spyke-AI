import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import userModel from '../../model/user.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import { notificationService } from '../../util/notification.js'
import { EUserRole, ESellerVerificationStatus, ECommissionOfferStatus, EPayoutMethod } from '../../constant/application.js'

dayjs.extend(utc)

export default {
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

            if (sellerProfile.verification.status === ESellerVerificationStatus.APPROVED) {
                return httpError(next, new Error(responseMessage.SELLER.CANNOT_UPDATE_APPROVED_PROFILE), req, 400)
            }

            Object.keys(updateData).forEach((key) => {
                if (updateData[key] !== undefined && key !== 'verification' && key !== 'commissionOffer') {
                    sellerProfile[key] = updateData[key]
                }
            })

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

            if (sellerProfile.verification.status !== ESellerVerificationStatus.UNDER_REVIEW) {
                return httpError(next, new Error(responseMessage.SELLER.CANNOT_REJECT_PROFILE), req, 400)
            }

            sellerProfile.verification.status = ESellerVerificationStatus.REJECTED
            sellerProfile.verification.reviewedAt = dayjs().utc().toDate()
            sellerProfile.verification.reviewedBy = authenticatedUser.id
            sellerProfile.verification.rejectionReason = reason

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
    }
}

