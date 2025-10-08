import Payout from '../../model/payout.model.js'
import SellerProfile from '../../model/seller.profile.model.js'
import PlatformSettings from '../../model/platform.settings.model.js'
import Purchase from '../../model/purchase.model.js'
import responseMessage from '../../constant/responseMessage.js'
import emailService from '../../service/email.service.js'
import emailTemplates from '../../util/email.formatter.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import { EPaymentStatus, EOrderStatus } from '../../constant/application.js'

export const self = (req, res, next) => {
    try {
        httpResponse(req, res, 200, responseMessage.SERVICE('Seller Payout'))
    } catch (err) {
        httpError(next, err, req, 500)
    }
}

const calculateEarnings = async (sellerId, fromDate = null, toDate = null) => {
    try {
        const platformSettings = await PlatformSettings.getCurrentSettings()
        const seller = await SellerProfile.findOne({ userId: sellerId })

        if (!seller) {
            throw new Error('Seller not found')
        }

        const commissionRate = 100 - seller.getCurrentCommissionRate()
        if (!commissionRate) {
            throw new Error('Seller commission rate not set')
        }

        // Fix: Use seller profile ID instead of user ID and proper enum constants
        let matchStage = {
            'items.sellerId': seller._id, // Use seller profile ID, not user ID
            paymentStatus: EPaymentStatus.COMPLETED, // Use enum constant
            orderStatus: EOrderStatus.COMPLETED // Use enum constant
        }

        if (fromDate && toDate) {
            matchStage.purchaseDate = {
                // Use purchaseDate instead of completedAt
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            }
        }

        // Calculate earnings from completed purchases
        const salesPipeline = [
            { $match: matchStage },
            { $unwind: '$items' },
            { $match: { 'items.sellerId': seller._id } }, // Use seller profile ID
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$items.price' },
                    salesCount: { $sum: 1 },
                    salesIds: { $push: '$_id' }
                }
            }
        ]

        const salesResult = await Purchase.aggregate(salesPipeline)
        const salesData = salesResult[0] || { totalSales: 0, salesCount: 0, salesIds: [] }

        // Calculate earnings breakdown
        const grossEarnings = salesData.totalSales * (commissionRate / 100)
        const platformFee = grossEarnings * (platformSettings.platformFeePercentage / 100)
        const processingFee = platformSettings.paymentProcessingFee || 0
        const netEarnings = Math.max(0, grossEarnings - platformFee - processingFee)

        // Get existing payouts to calculate what's already been paid
        const existingPayouts = await Payout.find({
            sellerId,
            status: { $in: ['completed', 'processing', 'approved'] }
        })

        const totalPaidOut = existingPayouts.reduce((sum, payout) => sum + payout.amount, 0)
        const availableForPayout = Math.max(0, netEarnings - totalPaidOut)

        const minimumThreshold = platformSettings.minimumPayoutThreshold || 50
        const isEligible = availableForPayout >= minimumThreshold

        const sellerJoinDate = new Date(seller.verification.approvedAt || seller.createdAt)
        const holdPeriodDays = platformSettings.holdPeriodNewSellers || 14
        const holdPeriodEnd = new Date(sellerJoinDate.getTime() + holdPeriodDays * 24 * 60 * 60 * 1000)
        const isOnHold = new Date() < holdPeriodEnd

        return {
            totalSales: salesData.totalSales,
            salesCount: salesData.salesCount,
            commissionRate,
            grossEarnings,
            platformFeePercentage: platformSettings.platformFeePercentage || 10,
            platformFee,
            processingFee,
            netEarnings,
            totalPaidOut,
            availableForPayout,
            isEligible,
            isOnHold,
            holdPeriodEnd: isOnHold ? holdPeriodEnd : null,
            minimumThreshold,
            salesIncluded: salesData.salesIds,
            currency: platformSettings.currency || 'USD'
        }
    } catch (error) {
        throw error
    }
}

export const getPayoutDashboard = async (req, res, next) => {
    try {
        const sellerId = req.authenticatedUser.id
        const { fromDate, toDate } = req.query

        const earningsData = await calculateEarnings(sellerId, fromDate, toDate)

        const recentPayouts = await Payout.find({ sellerId }).populate('approvedBy', 'firstName lastName').sort({ requestedAt: -1 }).limit(5)

        const pendingPayouts = await Payout.find({
            sellerId,
            status: { $in: ['pending', 'approved', 'processing'] }
        }).sort({ requestedAt: -1 })

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            earnings: earningsData,
            recentPayouts,
            pendingPayouts,
            canRequestPayout: earningsData.isEligible && !earningsData.isOnHold && pendingPayouts.length === 0
        })
    } catch (error) {
        console.error('Error in getPayoutDashboard:', error)
        httpError(next, error, req, 500)
    }
}

export const getPayoutHistory = async (req, res, next) => {
    try {
        const sellerId = req.authenticatedUser.id
        const { page = 1, limit = 10, status } = req.query

        const payouts = await Payout.getSellerPayouts(sellerId, {
            page: parseInt(page),
            limit: parseInt(limit),
            status
        })

        const totalPayouts = await Payout.countDocuments({
            sellerId,
            ...(status && { status })
        })

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            payouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPayouts / parseInt(limit)),
                totalItems: totalPayouts,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error('Error in getPayoutHistory:', error)
        httpError(next, error, req, 500)
    }
}

export const requestPayout = async (req, res, next) => {
    try {
        const sellerId = req.authenticatedUser.id
        const { notes } = req.body

        const seller = await SellerProfile.findOne({ userId: sellerId })
        if (!seller) {
            return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller')), req, 404)
        }

        if (!seller.payoutInfo || !seller.payoutInfo.method) {
            return httpError(next, new Error('Payout method not configured'), req, 400)
        }

        const existingPendingPayout = await Payout.findOne({
            sellerId,
            status: { $in: ['pending', 'approved', 'processing'] }
        })

        if (existingPendingPayout) {
            return httpError(next, new Error('You already have a pending payout request'), req, 400)
        }

        const earningsData = await calculateEarnings(sellerId)

        if (!earningsData.isEligible) {
            return httpError(next, new Error(`Minimum payout threshold of $${earningsData.minimumThreshold} not met`), req, 400)
        }

        if (earningsData.isOnHold) {
            return httpError(next, new Error(`Your account is on hold until ${earningsData.holdPeriodEnd.toDateString()}`), req, 400)
        }

        const payoutPeriodStart = new Date()
        payoutPeriodStart.setDate(1)
        payoutPeriodStart.setHours(0, 0, 0, 0)

        const payoutPeriodEnd = new Date()
        payoutPeriodEnd.setHours(23, 59, 59, 999)

        const payoutDetails = { ...seller.payoutInfo }
        delete payoutDetails.isVerified
        delete payoutDetails.verifiedAt

        const payout = new Payout({
            sellerId,
            amount: earningsData.availableForPayout,
            grossAmount: earningsData.grossEarnings,
            platformFee: earningsData.platformFee,
            processingFee: earningsData.processingFee,
            payoutMethod: seller.payoutInfo.method,
            payoutDetails,
            payoutPeriod: {
                from: payoutPeriodStart,
                to: payoutPeriodEnd
            },
            salesIncluded: earningsData.salesIncluded,
            notes,
            currency: earningsData.currency
        })

        await payout.save()

        // Update seller's cached payout info
        seller.payoutInfo.pendingEarnings = 0 // Will be recalculated after payout
        seller.payoutInfo.availableForPayout = 0
        await seller.save()

        try {
            const confirmationEmail = emailTemplates['payout-request-confirmation']({
                sellerName: seller.fullName,
                amount: earningsData.availableForPayout,
                currency: earningsData.currency,
                requestId: payout._id,
                estimatedProcessingTime: '7 business days'
            })

            await emailService.sendEmail(seller.email, confirmationEmail.subject, confirmationEmail.text, confirmationEmail.html)
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        try {
            const adminUsers = await mongoose.model('User').find({ role: 'admin', isActive: true })
            for (const admin of adminUsers) {
                const adminEmail = emailTemplates['payout-admin-notification']({
                    adminName: admin.firstName + ' ' + admin.lastName,
                    sellerName: seller.fullName,
                    sellerId: seller._id,
                    amount: earningsData.availableForPayout,
                    currency: earningsData.currency,
                    requestId: payout._id,
                    payoutMethod: seller.payoutInfo.method
                })

                await emailService.sendEmail(admin.email, adminEmail.subject, adminEmail.text, adminEmail.html)
            }
        } catch (emailError) {
            console.error('Admin email notification failed:', emailError)
        }

        return httpResponse(req, res, 201, 'Payout request submitted successfully', {
            payout: await payout.populate('sellerId', 'fullName email')
        })
    } catch (error) {
        console.error('Error in requestPayout:', error)
        httpError(next, error, req, 500)
    }
}

export const getEligibleEarnings = async (req, res, next) => {
    try {
        const sellerId = req.authenticatedUser.id
        const { fromDate, toDate } = req.query

        const earningsData = await calculateEarnings(sellerId, fromDate, toDate)

        return httpResponse(req, res, 200, responseMessage.SUCCESS, earningsData)
    } catch (error) {
        console.error('Error in getEligibleEarnings:', error)
        httpError(next, error, req, 500)
    }
}

export const updatePayoutMethod = async (req, res, next) => {
    try {
        const sellerId = req.authenticatedUser.id
        const { method, bankDetails, paypalEmail, stripeAccountId, wiseEmail } = req.body

        const seller = await SellerProfile.findOne({ userId: sellerId })
        if (!seller) {
            return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller')), req, 404)
        }

        const pendingPayout = await Payout.findOne({
            sellerId,
            status: { $in: ['pending', 'approved', 'processing'] }
        })

        if (pendingPayout) {
            return httpError(next, new Error('Cannot update payout method while you have a pending payout'), req, 400)
        }

        seller.payoutInfo.method = method
        seller.payoutInfo.isVerified = false
        seller.payoutInfo.verifiedAt = null

        switch (method) {
            case 'bank':
                seller.payoutInfo.bankDetails = bankDetails
                break
            case 'paypal':
                seller.payoutInfo.paypalEmail = paypalEmail
                break
            case 'stripe':
                seller.payoutInfo.stripeAccountId = stripeAccountId
                break
            case 'wise':
                seller.payoutInfo.wiseEmail = wiseEmail
                break
        }

        await seller.save()

        return httpResponse(req, res, 200, responseMessage.UPDATED, {
            payoutInfo: seller.payoutInfo
        })
    } catch (error) {
        console.error('Error in updatePayoutMethod:', error)
        httpError(next, error, req, 500)
    }
}
