import Payout from '../../model/payout.model.js'
import SellerProfile from '../../model/seller.profile.model.js'
import PlatformSettings from '../../model/platform.settings.model.js'
import Purchase from '../../model/purchase.model.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import responseMessage from '../../constant/responseMessage.js'
import mongoose from 'mongoose'
import emailService from '../../service/email.service.js'
import emailTemplates from '../../util/email.formatter.js'

export const getPayouts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            sellerId, 
            fromDate, 
            toDate,
            sortBy = 'requestedAt',
            sortOrder = 'desc'
        } = req.query

        const skip = (parseInt(page) - 1) * parseInt(limit)
        
        let matchQuery = {}
        
        if (status) {
            matchQuery.status = status
        }
        
        if (sellerId) {
            matchQuery.sellerId = new mongoose.Types.ObjectId(sellerId)
        }
        
        if (fromDate || toDate) {
            matchQuery.requestedAt = {}
            if (fromDate) matchQuery.requestedAt.$gte = new Date(fromDate)
            if (toDate) matchQuery.requestedAt.$lte = new Date(toDate)
        }

        const sortOptions = {}
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1

        const payouts = await Payout.find(matchQuery)
            .populate('sellerId', 'fullName email payoutInfo stats')
            .populate('approvedBy', 'firstName lastName email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))

        const totalPayouts = await Payout.countDocuments(matchQuery)

        const summary = await Payout.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ])

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            payouts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalPayouts / parseInt(limit)),
                totalItems: totalPayouts,
                itemsPerPage: parseInt(limit)
            },
            summary
        })
    } catch (error) {
        console.error('Error in getPayouts:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const getPayoutDetails = async (req, res) => {
    try {
        const { id } = req.params

        const payout = await Payout.findById(id)
            .populate('sellerId', 'fullName email payoutInfo stats verification')
            .populate('approvedBy', 'firstName lastName email')
            .populate('salesIncluded', 'totalAmount purchaseDate items')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        return httpResponse(req, res, 200, responseMessage.SUCCESS, { payout })
    } catch (error) {
        console.error('Error in getPayoutDetails:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const approvePayout = async (req, res) => {
    try {
        const { id } = req.params
        const { notes } = req.body
        const adminId = req.authenticatedUser.id

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (payout.status !== 'pending') {
            return httpError(req, res, 400, `Cannot approve payout with status: ${payout.status}`)
        }

        await payout.approve(adminId, notes)

        try {
            const approvedEmail = emailTemplates['payout-approved']({
                sellerName: payout.sellerId.fullName,
                amount: payout.amount,
                currency: payout.currency,
                requestId: payout._id,
                approvedAt: payout.approvedAt,
                estimatedProcessingTime: '3-5 business days'
            })
            
            await emailService.sendEmail(
                payout.sellerId.email,
                approvedEmail.subject,
                approvedEmail.text,
                approvedEmail.html
            )
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        return httpResponse(req, res, 200, 'Payout approved successfully', {
            payout: await payout.populate('approvedBy', 'firstName lastName email')
        })
    } catch (error) {
        console.error('Error in approvePayout:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const rejectPayout = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        if (!reason) {
            return httpError(req, res, 400, 'Rejection reason is required')
        }

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (payout.status !== 'pending') {
            return httpError(req, res, 400, `Cannot reject payout with status: ${payout.status}`)
        }

        await payout.reject(reason)

        try {
            const rejectedEmail = emailTemplates['payout-rejected']({
                sellerName: payout.sellerId.fullName,
                amount: payout.amount,
                currency: payout.currency,
                requestId: payout._id,
                rejectionReason: reason
            })
            
            await emailService.sendEmail(
                payout.sellerId.email,
                rejectedEmail.subject,
                rejectedEmail.text,
                rejectedEmail.html
            )
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        return httpResponse(req, res, 200, 'Payout rejected successfully', { payout })
    } catch (error) {
        console.error('Error in rejectPayout:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const holdPayout = async (req, res) => {
    try {
        const { id } = req.params
        const { reason } = req.body

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (!['pending', 'approved'].includes(payout.status)) {
            return httpError(req, res, 400, `Cannot hold payout with status: ${payout.status}`)
        }

        payout.status = 'failed'
        payout.failureReason = reason || 'Put on hold by admin'
        await payout.save()

        try {
            const holdEmail = emailTemplates['payout-hold']({
                sellerName: payout.sellerId.fullName,
                amount: payout.amount,
                currency: payout.currency,
                requestId: payout._id,
                holdReason: reason || 'Administrative review'
            })
            
            await emailService.sendEmail(
                payout.sellerId.email,
                holdEmail.subject,
                holdEmail.text,
                holdEmail.html
            )
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        return httpResponse(req, res, 200, 'Payout put on hold successfully', { payout })
    } catch (error) {
        console.error('Error in holdPayout:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const releasePayout = async (req, res) => {
    try {
        const { id } = req.params

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (payout.status !== 'failed') {
            return httpError(req, res, 400, 'Only failed/held payouts can be released')
        }

        payout.status = 'pending'
        payout.failureReason = null
        await payout.save()

        return httpResponse(req, res, 200, 'Payout released successfully', { payout })
    } catch (error) {
        console.error('Error in releasePayout:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const markAsProcessing = async (req, res) => {
    try {
        const { id } = req.params
        const { transactionId, notes } = req.body

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (payout.status !== 'approved') {
            return httpError(req, res, 400, `Cannot process payout with status: ${payout.status}`)
        }

        await payout.markAsProcessing(transactionId)
        if (notes) {
            payout.notes = payout.notes ? `${payout.notes}\n${notes}` : notes
            await payout.save()
        }

        try {
            const processingEmail = emailTemplates['payout-processing']({
                sellerName: payout.sellerId.fullName,
                amount: payout.amount,
                currency: payout.currency,
                requestId: payout._id,
                transactionId: transactionId || 'Not provided',
                estimatedCompletion: '2-3 business days'
            })
            
            await emailService.sendEmail(
                payout.sellerId.email,
                processingEmail.subject,
                processingEmail.text,
                processingEmail.html
            )
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        return httpResponse(req, res, 200, 'Payout marked as processing', { payout })
    } catch (error) {
        console.error('Error in markAsProcessing:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const markAsCompleted = async (req, res) => {
    try {
        const { id } = req.params
        const { transactionId, notes } = req.body

        const payout = await Payout.findById(id).populate('sellerId', 'fullName email stats')

        if (!payout) {
            return httpError(req, res, 404, responseMessage.ERROR.NOT_FOUND('Payout'))
        }

        if (payout.status !== 'processing') {
            return httpError(req, res, 400, `Cannot complete payout with status: ${payout.status}`)
        }

        await payout.markAsCompleted(transactionId)
        if (notes) {
            payout.notes = payout.notes ? `${payout.notes}\n${notes}` : notes
            await payout.save()
        }

        // Update seller's summary payout info
        const seller = await SellerProfile.findById(payout.sellerId._id)
        if (seller) {
            seller.payoutInfo.lastPayoutAt = payout.completedAt
            seller.payoutInfo.totalPayouts = (seller.payoutInfo.totalPayouts || 0) + payout.amount
            
            // Recalculate available amounts (this is now dynamic)
            // The seller's dashboard will calculate fresh earnings on-demand
            await seller.save()
        }

        try {
            const completedEmail = emailTemplates['payout-completed']({
                sellerName: payout.sellerId.fullName,
                amount: payout.amount,
                currency: payout.currency,
                requestId: payout._id,
                transactionId: transactionId || 'Administrative transfer',
                completedAt: payout.completedAt
            })
            
            await emailService.sendEmail(
                payout.sellerId.email,
                completedEmail.subject,
                completedEmail.text,
                completedEmail.html
            )
        } catch (emailError) {
            console.error('Email notification failed:', emailError)
        }

        return httpResponse(req, res, 200, 'Payout completed successfully', { payout })
    } catch (error) {
        console.error('Error in markAsCompleted:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const bulkApprovePayout = async (req, res) => {
    try {
        const { payoutIds, notes } = req.body
        const adminId = req.authenticatedUser.id

        if (!payoutIds || !Array.isArray(payoutIds) || payoutIds.length === 0) {
            return httpError(req, res, 400, 'Payout IDs array is required')
        }

        const payouts = await Payout.find({
            _id: { $in: payoutIds },
            status: 'pending'
        }).populate('sellerId', 'fullName email')

        if (payouts.length === 0) {
            return httpError(req, res, 400, 'No eligible payouts found')
        }

        const approvedPayouts = []
        const errors = []

        for (const payout of payouts) {
            try {
                await payout.approve(adminId, notes)
                approvedPayouts.push(payout._id)

                const approvedEmail = emailTemplates['payout-approved']({
                    sellerName: payout.sellerId.fullName,
                    amount: payout.amount,
                    currency: payout.currency,
                    requestId: payout._id,
                    approvedAt: payout.approvedAt,
                    estimatedProcessingTime: '3-5 business days'
                })
                
                await emailService.sendEmail(
                    payout.sellerId.email,
                    approvedEmail.subject,
                    approvedEmail.text,
                    approvedEmail.html
                )
            } catch (error) {
                errors.push({ payoutId: payout._id, error: error.message })
            }
        }

        return httpResponse(req, res, 200, 'Bulk approval completed', {
            approvedCount: approvedPayouts.length,
            approvedPayouts,
            errors
        })
    } catch (error) {
        console.error('Error in bulkApprovePayout:', error)
        return httpError(req, res, 500, error.message)
    }
}

export const getPayoutAnalytics = async (req, res) => {
    try {
        const { fromDate, toDate, period = '30' } = req.query

        let matchQuery = {}
        
        if (fromDate || toDate) {
            matchQuery.requestedAt = {}
            if (fromDate) matchQuery.requestedAt.$gte = new Date(fromDate)
            if (toDate) matchQuery.requestedAt.$lte = new Date(toDate)
        } else {
            const daysBack = parseInt(period)
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - daysBack)
            matchQuery.requestedAt = { $gte: startDate }
        }

        const analytics = await Promise.all([
            Payout.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ]),

            Payout.aggregate([
                { $match: { ...matchQuery, status: 'completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$completedAt' },
                            month: { $month: '$completedAt' },
                            day: { $dayOfMonth: '$completedAt' }
                        },
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
            ]),

            Payout.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$payoutMethod',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ]),

            Payout.aggregate([
                { $match: matchQuery },
                {
                    $addFields: {
                        processingTime: {
                            $cond: {
                                if: { $and: ['$requestedAt', '$completedAt'] },
                                then: {
                                    $divide: [
                                        { $subtract: ['$completedAt', '$requestedAt'] },
                                        86400000
                                    ]
                                },
                                else: null
                            }
                        }
                    }
                },
                {
                    $match: {
                        processingTime: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgProcessingTime: { $avg: '$processingTime' },
                        minProcessingTime: { $min: '$processingTime' },
                        maxProcessingTime: { $max: '$processingTime' }
                    }
                }
            ])
        ])

        return httpResponse(req, res, 200, responseMessage.SUCCESS, {
            statusBreakdown: analytics[0],
            dailyTrends: analytics[1],
            methodBreakdown: analytics[2],
            processingTimes: analytics[3][0] || {
                avgProcessingTime: 0,
                minProcessingTime: 0,
                maxProcessingTime: 0
            }
        })
    } catch (error) {
        console.error('Error in getPayoutAnalytics:', error)
        return httpError(req, res, 500, error.message)
    }
}