import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import userModel from '../../model/user.model.js'
import productModel from '../../model/product.model.js'
import purchaseModel from '../../model/purchase.model.js'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('User Analytics'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getDashboardAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            // Get total purchases count
            const totalPurchases = await purchaseModel.countDocuments({ 
                userId: authenticatedUser.id,
                orderStatus: 'completed'
            })

            // Get total spent amount
            const spentAnalytics = await purchaseModel.aggregate([
                { $match: { userId: authenticatedUser.id, orderStatus: 'completed' } },
                { $group: { _id: null, totalSpent: { $sum: '$finalAmount' } } }
            ])

            const totalSpent = spentAnalytics.length > 0 ? spentAnalytics[0].totalSpent : 0

            // Get favorite products count
            const favoriteCount = await productModel.countDocuments({
                'engagement.favorites': authenticatedUser.id
            })

            // Get recent purchases
            const recentPurchases = await purchaseModel.find({
                userId: authenticatedUser.id,
                orderStatus: 'completed'
            })
            .populate('items.productId', 'title thumbnail price')
            .sort({ createdAt: -1 })
            .limit(5)

            // Get monthly spending pattern
            const monthlySpending = await purchaseModel.aggregate([
                {
                    $match: {
                        userId: authenticatedUser.id,
                        orderStatus: 'completed',
                        createdAt: { $gte: dayjs().subtract(6, 'month').startOf('month').toDate() }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalSpent: { $sum: '$finalAmount' },
                        purchaseCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                overview: {
                    totalPurchases,
                    totalSpent,
                    favoriteCount,
                    memberSince: user.createdAt
                },
                recentPurchases,
                monthlySpending
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPurchaseHistory: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', category, dateFrom, dateTo } = req.query

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = { 
                userId: authenticatedUser.id,
                orderStatus: 'completed'
            }

            if (dateFrom || dateTo) {
                matchQuery.createdAt = {}
                if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom)
                if (dateTo) matchQuery.createdAt.$lte = new Date(dateTo)
            }

            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'items.productId',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $addFields: {
                        items: {
                            $map: {
                                input: '$items',
                                as: 'item',
                                in: {
                                    $mergeObjects: [
                                        '$$item',
                                        {
                                            product: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: '$productDetails',
                                                            cond: { $eq: ['$$this._id', '$$item.productId'] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                { $unset: 'productDetails' },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]

            if (category) {
                pipeline.splice(2, 0, {
                    $match: { 'productDetails.category': category }
                })
            }

            const purchases = await purchaseModel.aggregate(pipeline)
            const totalCount = await purchaseModel.countDocuments(matchQuery)

            // Calculate analytics for the filtered results
            const analytics = await purchaseModel.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalSpent: { $sum: '$finalAmount' },
                        totalPurchases: { $sum: 1 },
                        avgOrderValue: { $avg: '$finalAmount' }
                    }
                }
            ])

            const analyticsData = analytics.length > 0 ? analytics[0] : {
                totalSpent: 0,
                totalPurchases: 0,
                avgOrderValue: 0
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                purchases,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                analytics: analyticsData
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getFavoriteAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10 } = req.query

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const favorites = await productModel.find({
                'engagement.favorites': authenticatedUser.id,
                isActive: true,
                            })
            .populate('sellerId', 'fullName avatar')
            .sort({ 'engagement.favoritedAt': -1 })
            .skip(skip)
            .limit(parseInt(limit))

            const totalFavorites = await productModel.countDocuments({
                'engagement.favorites': authenticatedUser.id,
                isActive: true,
                            })

            // Get category breakdown of favorites
            const categoryBreakdown = await productModel.aggregate([
                { 
                    $match: { 
                        'engagement.favorites': authenticatedUser.id,
                        isActive: true,
                                            }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' }
                    }
                },
                { $sort: { count: -1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                favorites,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalFavorites / parseInt(limit)),
                    totalCount: totalFavorites,
                    hasNextPage: parseInt(page) < Math.ceil(totalFavorites / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                categoryBreakdown
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getUserActivity: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { period = '30d' } = req.query

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            let dateFilter
            switch (period) {
                case '7d':
                    dateFilter = dayjs().subtract(7, 'day').toDate()
                    break
                case '30d':
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    break
                case '90d':
                    dateFilter = dayjs().subtract(90, 'day').toDate()
                    break
                case '1y':
                    dateFilter = dayjs().subtract(1, 'year').toDate()
                    break
                default:
                    dateFilter = dayjs().subtract(30, 'day').toDate()
            }

            // Get purchase activity
            const purchaseActivity = await purchaseModel.aggregate([
                {
                    $match: {
                        userId: authenticatedUser.id,
                        createdAt: { $gte: dateFilter },
                        orderStatus: 'completed'
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                        },
                        purchaseCount: { $sum: 1 },
                        totalSpent: { $sum: '$finalAmount' }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            // Get favorite activity (approximate by using recent favorites)
            const favoriteActivity = await productModel.aggregate([
                {
                    $match: {
                        'engagement.favorites': authenticatedUser.id,
                        'engagement.favoritedAt': { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$engagement.favoritedAt" } }
                        },
                        favoriteCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                period,
                purchaseActivity,
                favoriteActivity
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getSpendingInsights: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const user = await userModel.findById(authenticatedUser.id)
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            // Category-wise spending
            const categorySpending = await purchaseModel.aggregate([
                {
                    $match: {
                        userId: authenticatedUser.id,
                        orderStatus: 'completed'
                    }
                },
                { $unwind: '$items' },
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
                    $group: {
                        _id: '$product.category',
                        totalSpent: { $sum: '$items.price' },
                        purchaseCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                },
                { $sort: { totalSpent: -1 } }
            ])

            // Monthly trend
            const monthlyTrend = await purchaseModel.aggregate([
                {
                    $match: {
                        userId: authenticatedUser.id,
                        orderStatus: 'completed',
                        createdAt: { $gte: dayjs().subtract(12, 'month').toDate() }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        totalSpent: { $sum: '$finalAmount' },
                        purchaseCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])

            // Top sellers bought from
            const topSellers = await purchaseModel.aggregate([
                {
                    $match: {
                        userId: authenticatedUser.id,
                        orderStatus: 'completed'
                    }
                },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.sellerId',
                        totalSpent: { $sum: '$items.price' },
                        purchaseCount: { $sum: 1 }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'sellerprofiles',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                {
                    $project: {
                        sellerId: '$_id',
                        sellerName: '$seller.fullName',
                        sellerAvatar: '$seller.sellerBanner',
                        totalSpent: 1,
                        purchaseCount: 1
                    }
                }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                categorySpending,
                monthlyTrend,
                topSellers
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}