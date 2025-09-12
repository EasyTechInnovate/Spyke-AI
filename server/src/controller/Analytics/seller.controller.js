import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import productModel from '../../model/product.model.js'
import purchaseModel from '../../model/purchase.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Seller Analytics'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get seller dashboard analytics
    getDashboardAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller Profile')), req, 404)
            }

            const totalProducts = await productModel.countDocuments({
                sellerId: sellerProfile._id,
                            })

            const activeProducts = await productModel.countDocuments({
                sellerId: sellerProfile._id,
                isActive: true,
                isDeleted: false,
                status: 'published'
            })

            const salesAnalytics = await purchaseModel.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerProfile._id, orderStatus: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$items.price' },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                }
            ])

            const salesData = salesAnalytics.length > 0 ? salesAnalytics[0] : {
                totalSales: 0,
                totalRevenue: 0,
                avgOrderValue: 0
            }

            const viewsAnalytics = await productModel.aggregate([
                { $match: { sellerId: sellerProfile._id, isDeleted: false } },
                { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
            ])

            const totalViews = viewsAnalytics.length > 0 ? viewsAnalytics[0].totalViews : 0

            const recentSales = await purchaseModel.find({
                'items.sellerId': sellerProfile._id,
                orderStatus: 'completed'
            })
            .populate('userId', 'name emailAddress avatar')
            .populate('items.productId', 'title thumbnail price')
            .sort({ createdAt: -1 })
            .limit(10)

            const monthlyRevenue = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
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
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                overview: {
                    totalProducts,
                    activeProducts,
                    totalSales: salesData.totalSales,
                    totalRevenue: salesData.totalRevenue,
                    avgOrderValue: salesData.avgOrderValue,
                    totalViews,
                    sellerSince: sellerProfile.createdAt
                },
                recentSales,
                monthlyRevenue
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getProductAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, sortBy = 'viewCount', sortOrder = 'desc', category, status } = req.query

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller Profile')), req, 404)
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = { 
                sellerId: sellerProfile._id,
                            }

            if (category) matchQuery.category = category
            if (status) matchQuery.status = status

            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { productId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.productId', '$$productId'] },
                                    orderStatus: 'completed'
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalSales: { $sum: 1 },
                                    totalRevenue: { $sum: '$items.price' }
                                }
                            }
                        ],
                        as: 'salesData'
                    }
                },
                {
                    $addFields: {
                        salesCount: { $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] },
                        revenue: { $ifNull: [{ $arrayElemAt: ['$salesData.totalRevenue', 0] }, 0] },
                        conversionRate: {
                            $cond: {
                                if: { $gt: ['$viewCount', 0] },
                                then: {
                                    $multiply: [
                                        { $divide: [{ $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] }, '$viewCount'] },
                                        100
                                    ]
                                },
                                else: 0
                            }
                        }
                    }
                },
                { $unset: 'salesData' },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]

            const products = await productModel.aggregate(pipeline)
            const totalCount = await productModel.countDocuments(matchQuery)

            const summaryAnalytics = await productModel.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalProducts: { $sum: 1 },
                        totalViews: { $sum: '$viewCount' },
                        avgRating: { $avg: '$averageRating' },
                        totalUpvotes: { $sum: '$upvoteCount' }
                    }
                }
            ])

            const summary = summaryAnalytics.length > 0 ? summaryAnalytics[0] : {
                totalProducts: 0,
                totalViews: 0,
                avgRating: 0,
                totalUpvotes: 0
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                summary
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getSalesAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { period = '30d', page = 1, limit = 20 } = req.query

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller Profile')), req, 404)
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

            const skip = (parseInt(page) - 1) * parseInt(limit)

            // Get detailed sales data
            const sales = await purchaseModel.find({
                'items.sellerId': sellerProfile._id,
                orderStatus: 'completed',
                createdAt: { $gte: dateFilter }
            })
            .populate('userId', 'name emailAddress avatar')
            .populate('items.productId', 'title thumbnail category')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))

            const totalSalesCount = await purchaseModel.countDocuments({
                'items.sellerId': sellerProfile._id,
                orderStatus: 'completed',
                createdAt: { $gte: dateFilter }
            })

            const salesSummary = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed',
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$items.price' },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                }
            ])

            const summary = salesSummary.length > 0 ? salesSummary[0] : {
                totalSales: 0,
                totalRevenue: 0,
                avgOrderValue: 0
            }

            const topProducts = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed',
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: '$items.productId',
                        salesCount: { $sum: 1 },
                        revenue: { $sum: '$items.price' }
                    }
                },
                { $sort: { salesCount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $project: {
                        productId: '$_id',
                        title: '$product.title',
                        thumbnail: '$product.thumbnail',
                        category: '$product.category',
                        salesCount: 1,
                        revenue: 1
                    }
                }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                sales,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalSalesCount / parseInt(limit)),
                    totalCount: totalSalesCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalSalesCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                summary,
                topProducts,
                period
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },
    getRevenueAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller Profile')), req, 404)
            }

            // Daily revenue for last 30 days
            const dailyRevenue = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed',
                        createdAt: { $gte: dayjs().subtract(30, 'day').toDate() }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
                        },
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            const categoryRevenue = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed'
                    }
                },
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
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                },
                { $sort: { revenue: -1 } }
            ])

            const currentMonthRevenue = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed',
                        createdAt: {
                            $gte: dayjs().startOf('month').toDate(),
                            $lt: dayjs().endOf('month').toDate()
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 }
                    }
                }
            ])

            const previousMonthRevenue = await purchaseModel.aggregate([
                { $unwind: '$items' },
                {
                    $match: {
                        'items.sellerId': sellerProfile._id,
                        orderStatus: 'completed',
                        createdAt: {
                            $gte: dayjs().subtract(1, 'month').startOf('month').toDate(),
                            $lt: dayjs().subtract(1, 'month').endOf('month').toDate()
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 }
                    }
                }
            ])

            const currentMonth = currentMonthRevenue.length > 0 ? currentMonthRevenue[0] : { revenue: 0, salesCount: 0 }
            const previousMonth = previousMonthRevenue.length > 0 ? previousMonthRevenue[0] : { revenue: 0, salesCount: 0 }

            const revenueGrowth = previousMonth.revenue > 0 
                ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 
                : 0

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                dailyRevenue,
                categoryRevenue,
                monthlyComparison: {
                    current: currentMonth,
                    previous: previousMonth,
                    growth: revenueGrowth
                }
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get customer analytics
    getCustomerAnalytics: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 20 } = req.query

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('Seller Profile')), req, 404)
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)

            // Get customer purchase data
            const customers = await purchaseModel.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerProfile._id, orderStatus: 'completed' } },
                {
                    $group: {
                        _id: '$userId',
                        totalPurchases: { $sum: 1 },
                        totalSpent: { $sum: '$items.price' },
                        firstPurchase: { $min: '$createdAt' },
                        lastPurchase: { $max: '$createdAt' },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                },
                { $sort: { totalSpent: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        userId: '$_id',
                        name: '$user.name',
                        emailAddress: '$user.emailAddress',
                        avatar: '$user.avatar',
                        totalPurchases: 1,
                        totalSpent: 1,
                        avgOrderValue: 1,
                        firstPurchase: 1,
                        lastPurchase: 1,
                        customerLifetime: {
                            $dateDiff: {
                                startDate: '$firstPurchase',
                                endDate: '$lastPurchase',
                                unit: 'day'
                            }
                        }
                    }
                }
            ])

            // Get total unique customers count
            const totalCustomersCount = await purchaseModel.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerProfile._id, orderStatus: 'completed' } },
                { $group: { _id: '$userId' } },
                { $count: 'totalCustomers' }
            ])

            const totalCustomers = totalCustomersCount.length > 0 ? totalCustomersCount[0].totalCustomers : 0

            // Customer acquisition trend
            const acquisitionTrend = await purchaseModel.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.sellerId': sellerProfile._id, orderStatus: 'completed' } },
                {
                    $group: {
                        _id: {
                            userId: '$userId',
                            firstPurchase: { $min: '$createdAt' }
                        }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$_id.firstPurchase" } }
                        },
                        newCustomers: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } },
                { $limit: 30 }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                customers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCustomers / parseInt(limit)),
                    totalCount: totalCustomers,
                    hasNextPage: parseInt(page) < Math.ceil(totalCustomers / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                acquisitionTrend
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}