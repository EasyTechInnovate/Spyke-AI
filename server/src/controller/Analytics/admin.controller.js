import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import mongoose from 'mongoose'
import userModel from '../../model/user.model.js'
import productModel from '../../model/product.model.js'
import purchaseModel from '../../model/purchase.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import promocodeModel from '../../model/promocode.model.js'
import Payout from '../../model/payout.model.js'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Admin Analytics'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPlatformAnalytics: async (req, res, next) => {
        try {
            const totalUsers = await userModel.countDocuments({})

            const totalSellers = await sellerProfileModel.countDocuments({})

            const totalProducts = await productModel.countDocuments({})

            const activeProducts = await productModel.countDocuments({
                isActive: true,
                status: 'published'
            })

            const salesAnalytics = await purchaseModel.aggregate([
                { $match: { orderStatus: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$finalAmount' },
                        avgOrderValue: { $avg: '$finalAmount' }
                    }
                }
            ])

            const salesData =
                salesAnalytics.length > 0
                    ? salesAnalytics[0]
                    : {
                          totalSales: 0,
                          totalRevenue: 0,
                          avgOrderValue: 0
                      }

            const platformViews = await productModel.aggregate([{ $match: {} }, { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }])

            const totalViews = platformViews.length > 0 ? platformViews[0].totalViews : 0

            const thirtyDaysAgo = dayjs().subtract(30, 'day').toDate()

            const newUsersLast30Days = await userModel.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            })

            const newProductsLast30Days = await productModel.countDocuments({
                createdAt: { $gte: thirtyDaysAgo }
            })

            const salesLast30Days = await purchaseModel.countDocuments({
                createdAt: { $gte: thirtyDaysAgo },
                orderStatus: 'completed'
            })

            const topCategories = await productModel.aggregate([
                { $match: {} },
                {
                    $group: {
                        _id: '$category',
                        productCount: { $sum: 1 },
                        avgPrice: { $avg: '$price' },
                        totalViews: { $sum: '$viewCount' }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                {
                    $addFields: {
                        categoryName: {
                            $ifNull: [{ $arrayElemAt: ['$categoryInfo.name', 0] }, 'Uncategorized']
                        }
                    }
                },
                { $unset: 'categoryInfo' },
                { $sort: { productCount: -1 } },
                { $limit: 10 }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                overview: {
                    totalUsers,
                    totalSellers,
                    totalProducts,
                    activeProducts,
                    totalSales: salesData.totalSales,
                    totalRevenue: salesData.totalRevenue,
                    avgOrderValue: salesData.avgOrderValue,
                    totalViews
                },
                growth: {
                    newUsersLast30Days,
                    newProductsLast30Days,
                    salesLast30Days
                },
                topCategories
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get user analytics for admin
    getUserAnalytics: async (req, res, next) => {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', role, status } = req.query

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = {}
            if (role) matchQuery.roles = role
            if (status === 'active') matchQuery.isActive = true
            if (status === 'inactive') matchQuery.isActive = false

            // Get users with purchase analytics
            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'purchases',
                        localField: '_id',
                        foreignField: 'userId',
                        pipeline: [
                            { $match: { orderStatus: 'completed' } },
                            {
                                $group: {
                                    _id: null,
                                    totalPurchases: { $sum: 1 },
                                    totalSpent: { $sum: '$finalAmount' },
                                    avgOrderValue: { $avg: '$finalAmount' },
                                    lastPurchase: { $max: '$createdAt' }
                                }
                            }
                        ],
                        as: 'purchaseData'
                    }
                },
                {
                    $addFields: {
                        totalPurchases: { $ifNull: [{ $arrayElemAt: ['$purchaseData.totalPurchases', 0] }, 0] },
                        totalSpent: { $ifNull: [{ $arrayElemAt: ['$purchaseData.totalSpent', 0] }, 0] },
                        avgOrderValue: { $ifNull: [{ $arrayElemAt: ['$purchaseData.avgOrderValue', 0] }, 0] },
                        lastPurchase: { $arrayElemAt: ['$purchaseData.lastPurchase', 0] }
                    }
                },
                { $unset: 'purchaseData' },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]

            const users = await userModel.aggregate(pipeline)
            const totalCount = await userModel.countDocuments(matchQuery)

            // User registration trend
            const registrationTrend = await userModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dayjs().subtract(30, 'day').toDate() }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            // User role distribution
            const roleDistribution = await userModel.aggregate([
                { $match: {} },
                { $unwind: '$roles' },
                { $group: { _id: '$roles', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                registrationTrend,
                roleDistribution
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get seller analytics for admin
    getSellerAnalytics: async (req, res, next) => {
        try {
            const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', verificationStatus } = req.query

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = {}
            if (verificationStatus) matchQuery['verification.status'] = verificationStatus

            // Get sellers with performance analytics
            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'products',
                        localField: '_id',
                        foreignField: 'sellerId',
                        pipeline: [
                            { $match: {} },
                            {
                                $group: {
                                    _id: null,
                                    totalProducts: { $sum: 1 },
                                    activeProducts: {
                                        $sum: { $cond: [{ $and: ['$isActive', { $eq: ['$status', 'published'] }] }, 1, 0] }
                                    },
                                    totalViews: { $sum: '$viewCount' },
                                    avgRating: { $avg: '$averageRating' }
                                }
                            }
                        ],
                        as: 'productData'
                    }
                },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { sellerId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.sellerId', '$$sellerId'] },
                                    orderStatus: 'completed'
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
                        ],
                        as: 'salesData'
                    }
                },
                {
                    $addFields: {
                        totalProducts: { $ifNull: [{ $arrayElemAt: ['$productData.totalProducts', 0] }, 0] },
                        activeProducts: { $ifNull: [{ $arrayElemAt: ['$productData.activeProducts', 0] }, 0] },
                        totalViews: { $ifNull: [{ $arrayElemAt: ['$productData.totalViews', 0] }, 0] },
                        avgProductRating: { $ifNull: [{ $arrayElemAt: ['$productData.avgRating', 0] }, 0] },
                        totalSales: { $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] },
                        totalRevenue: { $ifNull: [{ $arrayElemAt: ['$salesData.totalRevenue', 0] }, 0] },
                        avgOrderValue: { $ifNull: [{ $arrayElemAt: ['$salesData.avgOrderValue', 0] }, 0] }
                    }
                },
                { $unset: ['productData', 'salesData'] },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]

            const sellers = await sellerProfileModel.aggregate(pipeline)
            const totalCount = await sellerProfileModel.countDocuments(matchQuery)

            // Top performing sellers
            const topSellers = await sellerProfileModel.aggregate([
                { $match: {} },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { sellerId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.sellerId', '$$sellerId'] },
                                    orderStatus: 'completed'
                                }
                            },
                            { $group: { _id: null, revenue: { $sum: '$items.price' } } }
                        ],
                        as: 'revenue'
                    }
                },
                {
                    $addFields: {
                        totalRevenue: { $ifNull: [{ $arrayElemAt: ['$revenue.revenue', 0] }, 0] }
                    }
                },
                { $sort: { totalRevenue: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        fullName: 1,
                        email: 1,
                        verificationStatus: 1,
                        totalRevenue: 1,
                        createdAt: 1
                    }
                }
            ])

            const nicheDistribution = await sellerProfileModel.aggregate([
                { $match: {} },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { sellerId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.sellerId', '$$sellerId'] },
                                    orderStatus: 'completed'
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalRevenue: { $sum: '$items.price' },
                                    totalSales: { $sum: 1 }
                                }
                            }
                        ],
                        as: 'salesAgg'
                    }
                },
                {
                    $addFields: {
                        _sellerRevenue: { $ifNull: [{ $arrayElemAt: ['$salesAgg.totalRevenue', 0] }, 0] },
                        _sellerSales: { $ifNull: [{ $arrayElemAt: ['$salesAgg.totalSales', 0] }, 0] }
                    }
                },
                { $unwind: '$niches' },
                {
                    $group: {
                        _id: '$niches',
                        count: { $sum: 1 },
                        revenue: { $sum: '$_sellerRevenue' },
                        sales: { $sum: '$_sellerSales' }
                    }
                },
                { $sort: { count: -1 } }
            ])

            const toolDistribution = await sellerProfileModel.aggregate([
                { $match: {} },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { sellerId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.sellerId', '$$sellerId'] },
                                    orderStatus: 'completed'
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalRevenue: { $sum: '$items.price' },
                                    totalSales: { $sum: 1 }
                                }
                            }
                        ],
                        as: 'salesAgg'
                    }
                },
                {
                    $addFields: {
                        _sellerRevenue: { $ifNull: [{ $arrayElemAt: ['$salesAgg.totalRevenue', 0] }, 0] },
                        _sellerSales: { $ifNull: [{ $arrayElemAt: ['$salesAgg.totalSales', 0] }, 0] }
                    }
                },
                { $unwind: '$toolsSpecialization' },
                {
                    $group: {
                        _id: '$toolsSpecialization',
                        count: { $sum: 1 },
                        revenue: { $sum: '$_sellerRevenue' },
                        sales: { $sum: '$_sellerSales' }
                    }
                },
                { $sort: { count: -1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                sellers,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                topSellers,
                nicheDistribution,
                toolDistribution
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get product analytics for admin
    getProductAnalytics: async (req, res, next) => {
        try {
            const { page = 1, limit = 20, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = {}
            if (category) matchQuery.category = category
            if (status) matchQuery.status = status

            // Get products with sales analytics
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
                    $lookup: {
                        from: 'sellerprofiles',
                        localField: 'sellerId',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                { $unwind: '$seller' },
                {
                    $addFields: {
                        salesCount: { $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] },
                        revenue: { $ifNull: [{ $arrayElemAt: ['$salesData.totalRevenue', 0] }, 0] },
                        conversionRate: {
                            $cond: {
                                if: { $gt: ['$viewCount', 0] },
                                then: {
                                    $multiply: [{ $divide: [{ $ifNull: [{ $arrayElemAt: ['$salesData.totalSales', 0] }, 0] }, '$viewCount'] }, 100]
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

            // Product category distribution
            const categoryDistribution = await productModel.aggregate([
                { $match: {} },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        avgPrice: { $avg: '$price' },
                        totalViews: { $sum: '$viewCount' }
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                {
                    $addFields: {
                        name: {
                            $ifNull: [{ $arrayElemAt: ['$categoryInfo.name', 0] }, 'Uncategorized']
                        }
                    }
                },
                { $unset: 'categoryInfo' },
                { $sort: { count: -1 } }
            ])

            // Product status distribution
            const statusDistribution = await productModel.aggregate([
                { $match: {} },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                categoryDistribution,
                statusDistribution
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get sales analytics for admin
    getSalesAnalytics: async (req, res, next) => {
        try {
            const { period = '30d', page = 1, limit = 50 } = req.query

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

            // Get sales data with user and product details
            const sales = await purchaseModel
                .find({
                    orderStatus: 'completed',
                    createdAt: { $gte: dateFilter }
                })
                .populate('userId', 'name emailAddress avatar')
                .populate('items.productId', 'title thumbnail category sellerId')
                .populate('items.sellerId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))

            const totalSalesCount = await purchaseModel.countDocuments({
                orderStatus: 'completed',
                createdAt: { $gte: dateFilter }
            })

            // Sales summary with conversion rate calculation
            const salesSummary = await purchaseModel.aggregate([
                {
                    $match: {
                        orderStatus: 'completed',
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: 1 },
                        totalRevenue: { $sum: '$finalAmount' },
                        avgOrderValue: { $avg: '$finalAmount' },
                        totalItems: { $sum: { $size: '$items' } }
                    }
                }
            ])

            const platformViews = await productModel.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
            ])
            const totalViews = platformViews.length > 0 ? platformViews[0].totalViews : 0
            const summary =
                salesSummary.length > 0
                    ? {
                          ...salesSummary[0],
                          conversionRate: totalViews > 0 ? (salesSummary[0].totalSales / totalViews) * 100 : 0
                      }
                    : {
                          totalSales: 0,
                          totalRevenue: 0,
                          avgOrderValue: 0,
                          totalItems: 0,
                          conversionRate: 0
                      }

            // Daily sales trend
            const dailySales = await purchaseModel.aggregate([
                {
                    $match: {
                        orderStatus: 'completed',
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        salesCount: { $sum: 1 },
                        revenue: { $sum: '$finalAmount' }
                    }
                },
                { $sort: { '_id.date': 1 } }
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
                dailySales,
                period
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get promocode analytics for admin
    getPromocodeAnalytics: async (req, res, next) => {
        try {
            const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            const skip = (parseInt(page) - 1) * parseInt(limit)
            const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

            let matchQuery = {}
            if (status) matchQuery.isActive = status === 'active'

            // Get promocodes with usage analytics
            const pipeline = [
                { $match: matchQuery },
                {
                    $lookup: {
                        from: 'purchases',
                        localField: '_id',
                        foreignField: 'promocodeUsed',
                        pipeline: [
                            { $match: { orderStatus: 'completed' } },
                            {
                                $group: {
                                    _id: null,
                                    totalUsage: { $sum: 1 },
                                    totalSavings: { $sum: '$discountAmount' },
                                    totalRevenue: { $sum: '$finalAmount' }
                                }
                            }
                        ],
                        as: 'usageData'
                    }
                },
                {
                    $lookup: {
                        from: 'sellerprofiles',
                        localField: 'sellerId',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $addFields: {
                        totalUsage: { $ifNull: [{ $arrayElemAt: ['$usageData.totalUsage', 0] }, 0] },
                        totalSavings: { $ifNull: [{ $arrayElemAt: ['$usageData.totalSavings', 0] }, 0] },
                        totalRevenue: { $ifNull: [{ $arrayElemAt: ['$usageData.totalRevenue', 0] }, 0] },
                        sellerName: { $arrayElemAt: ['$seller.fullName', 0] }
                    }
                },
                { $unset: ['usageData', 'seller'] },
                { $sort: sortOptions },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]

            const promocodes = await promocodeModel.aggregate(pipeline)
            const totalCount = await promocodeModel.countDocuments(matchQuery)

            // Top performing promocodes
            const topPromocodes = await promocodeModel.aggregate([
                { $match: {} },
                {
                    $lookup: {
                        from: 'purchases',
                        localField: '_id',
                        foreignField: 'promocodeUsed',
                        pipeline: [{ $match: { orderStatus: 'completed' } }, { $group: { _id: null, usage: { $sum: 1 } } }],
                        as: 'usage'
                    }
                },
                {
                    $addFields: {
                        totalUsage: { $ifNull: [{ $arrayElemAt: ['$usage.usage', 0] }, 0] }
                    }
                },
                { $sort: { totalUsage: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        code: 1,
                        discountType: 1,
                        discountValue: 1,
                        totalUsage: 1,
                        expiresAt: 1
                    }
                }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                promocodes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                topPromocodes
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get user trends analytics for admin
    getUserTrends: async (req, res, next) => {
        try {
            const { period = '30d' } = req.query

            let dateFilter, days
            switch (period) {
                case '7d':
                    dateFilter = dayjs().subtract(7, 'day').toDate()
                    days = 7
                    break
                case '15d':
                    dateFilter = dayjs().subtract(15, 'day').toDate()
                    days = 15
                    break
                case '30d':
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    days = 30
                    break
                case '90d':
                    dateFilter = dayjs().subtract(90, 'day').toDate()
                    days = 90
                    break
                case '365d':
                    dateFilter = dayjs().subtract(365, 'day').toDate()
                    days = 365
                    break
                default:
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    days = 30
            }

            // Daily user registrations
            const userRegistrations = await userModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            // User activity trends (logins, purchases, etc.)
            const userActivity = await purchaseModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter },
                        orderStatus: 'completed'
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        activeUsers: { $addToSet: '$userId' },
                        purchases: { $sum: 1 }
                    }
                },
                {
                    $addFields: {
                        activeUserCount: { $size: '$activeUsers' }
                    }
                },
                { $unset: 'activeUsers' },
                { $sort: { '_id.date': 1 } }
            ])

            // User role distribution trend
            const roleDistribution = await userModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                { $unwind: '$roles' },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            role: '$roles'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1, '_id.role': 1 } }
            ])

            // User retention metrics
            const totalUsers = await userModel.countDocuments({})
            const newUsers = await userModel.countDocuments({
                createdAt: { $gte: dateFilter }
            })
            const activeUsers = await purchaseModel
                .distinct('userId', {
                    createdAt: { $gte: dateFilter },
                    orderStatus: 'completed'
                })
                .then((users) => users.length)

            // Growth rate calculation
            const previousPeriodStart = dayjs()
                .subtract(days * 2, 'day')
                .toDate()
            const previousPeriodEnd = dateFilter
            const previousPeriodUsers = await userModel.countDocuments({
                createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
            })

            const growthRate = previousPeriodUsers > 0 ? ((newUsers - previousPeriodUsers) / previousPeriodUsers) * 100 : 0

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                period,
                summary: {
                    totalUsers,
                    newUsers,
                    activeUsers,
                    growthRate,
                    retentionRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
                },
                userRegistrations,
                userActivity,
                roleDistribution
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get seller trends analytics for admin
    getSellerTrends: async (req, res, next) => {
        try {
            const { period = '30d' } = req.query

            let dateFilter, days
            switch (period) {
                case '7d':
                    dateFilter = dayjs().subtract(7, 'day').toDate()
                    days = 7
                    break
                case '15d':
                    dateFilter = dayjs().subtract(15, 'day').toDate()
                    days = 15
                    break
                case '30d':
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    days = 30
                    break
                case '90d':
                    dateFilter = dayjs().subtract(90, 'day').toDate()
                    days = 90
                    break
                case '365d':
                    dateFilter = dayjs().subtract(365, 'day').toDate()
                    days = 365
                    break
                default:
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    days = 30
            }

            // Daily seller registrations
            const sellerRegistrations = await sellerProfileModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            // Seller activity trends (product creation, sales)
            const sellerActivity = await productModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        activeSellers: { $addToSet: '$sellerId' },
                        productsCreated: { $sum: 1 }
                    }
                },
                {
                    $addFields: {
                        activeSellerCount: { $size: '$activeSellers' }
                    }
                },
                { $unset: 'activeSellers' },
                { $sort: { '_id.date': 1 } }
            ])

            // Seller verification status trend
            const verificationTrend = await sellerProfileModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            status: '$verificationStatus'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1, '_id.status': 1 } }
            ])

            // Seller performance metrics
            const totalSellers = await sellerProfileModel.countDocuments({})
            const newSellers = await sellerProfileModel.countDocuments({
                createdAt: { $gte: dateFilter }
            })
            const activeSellers = await purchaseModel
                .distinct('items.sellerId', {
                    createdAt: { $gte: dateFilter },
                    orderStatus: 'completed'
                })
                .then((sellers) => sellers.length)

            // Growth rate calculation
            const previousPeriodStart = dayjs()
                .subtract(days * 2, 'day')
                .toDate()
            const previousPeriodEnd = dateFilter
            const previousPeriodSellers = await sellerProfileModel.countDocuments({
                createdAt: { $gte: previousPeriodStart, $lt: previousPeriodEnd }
            })

            const growthRate = previousPeriodSellers > 0 ? ((newSellers - previousPeriodSellers) / previousPeriodSellers) * 100 : 0

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                period,
                summary: {
                    totalSellers,
                    newSellers,
                    activeSellers,
                    growthRate,
                    activityRate: totalSellers > 0 ? (activeSellers / totalSellers) * 100 : 0
                },
                sellerRegistrations,
                sellerActivity,
                verificationTrend
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get feedback analytics for admin
    getFeedbackAnalytics: async (req, res, next) => {
        try {
            const { period = '30d', page = 1, limit = 20 } = req.query

            let dateFilter
            switch (period) {
                case '7d':
                    dateFilter = dayjs().subtract(7, 'day').toDate()
                    break
                case '15d':
                    dateFilter = dayjs().subtract(15, 'day').toDate()
                    break
                case '30d':
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    break
                case '90d':
                    dateFilter = dayjs().subtract(90, 'day').toDate()
                    break
                case '365d':
                    dateFilter = dayjs().subtract(365, 'day').toDate()
                    break
                default:
                    dateFilter = dayjs().subtract(30, 'day').toDate()
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)

            // Get product reviews/feedback
            const feedbackData = await productModel.aggregate([
                {
                    $match: {
                        'reviews.0': { $exists: true }
                    }
                },
                { $unwind: '$reviews' },
                {
                    $match: {
                        'reviews.createdAt': { $gte: dateFilter }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'reviews.userId',
                        foreignField: '_id',
                        as: 'reviewer'
                    }
                },
                { $unwind: '$reviewer' },
                {
                    $project: {
                        productId: '$_id',
                        productTitle: '$title',
                        reviewId: '$reviews._id',
                        rating: '$reviews.rating',
                        comment: '$reviews.comment',
                        createdAt: '$reviews.createdAt',
                        reviewerName: '$reviewer.name',
                        reviewerEmail: '$reviewer.emailAddress'
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: parseInt(limit) }
            ])

            const totalFeedback = await productModel.aggregate([
                {
                    $match: {
                        'reviews.0': { $exists: true }
                    }
                },
                { $unwind: '$reviews' },
                {
                    $match: {
                        'reviews.createdAt': { $gte: dateFilter }
                    }
                },
                { $count: 'total' }
            ])

            const totalCount = totalFeedback.length > 0 ? totalFeedback[0].total : 0

            // Feedback summary analytics
            const feedbackSummary = await productModel.aggregate([
                {
                    $match: {
                        'reviews.0': { $exists: true }
                    }
                },
                { $unwind: '$reviews' },
                {
                    $match: {
                        'reviews.createdAt': { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        avgRating: { $avg: '$reviews.rating' },
                        ratingDistribution: {
                            $push: '$reviews.rating'
                        }
                    }
                },
                {
                    $addFields: {
                        rating5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } },
                        rating4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
                        rating3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
                        rating2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
                        rating1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } }
                    }
                },
                { $unset: 'ratingDistribution' }
            ])

            const summary =
                feedbackSummary.length > 0
                    ? feedbackSummary[0]
                    : {
                          totalReviews: 0,
                          avgRating: 0,
                          rating5: 0,
                          rating4: 0,
                          rating3: 0,
                          rating2: 0,
                          rating1: 0
                      }

            // Daily feedback trend
            const dailyFeedback = await productModel.aggregate([
                {
                    $match: {
                        'reviews.0': { $exists: true }
                    }
                },
                { $unwind: '$reviews' },
                {
                    $match: {
                        'reviews.createdAt': { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$reviews.createdAt' } }
                        },
                        reviewCount: { $sum: 1 },
                        avgRating: { $avg: '$reviews.rating' }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                feedback: feedbackData,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalCount,
                    hasNextPage: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
                    hasPrevPage: parseInt(page) > 1
                },
                summary,
                dailyFeedback,
                period
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get visitor/traffic analytics for admin
    getTrafficAnalytics: async (req, res, next) => {
        try {
            const { period = '30d' } = req.query

            let dateFilter
            switch (period) {
                case '7d':
                    dateFilter = dayjs().subtract(7, 'day').toDate()
                    break
                case '15d':
                    dateFilter = dayjs().subtract(15, 'day').toDate()
                    break
                case '30d':
                    dateFilter = dayjs().subtract(30, 'day').toDate()
                    break
                case '90d':
                    dateFilter = dayjs().subtract(90, 'day').toDate()
                    break
                case '365d':
                    dateFilter = dayjs().subtract(365, 'day').toDate()
                    break
                default:
                    dateFilter = dayjs().subtract(30, 'day').toDate()
            }

            // Total product views (proxy for website visits)
            const totalViews = await productModel.aggregate([{ $match: {} }, { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }])

            const platformViews = totalViews.length > 0 ? totalViews[0].totalViews : 0

            // Most viewed products
            const topViewedProducts = await productModel
                .find({
                    updatedAt: { $gte: dateFilter }
                })
                .sort({ viewCount: -1 })
                .limit(10)
                .select('title viewCount category sellerId thumbnail')
                .populate('sellerId', 'fullName')

            // Category views distribution
            const categoryViews = await productModel.aggregate([
                { $match: {} },
                {
                    $group: {
                        _id: '$category',
                        totalViews: { $sum: '$viewCount' },
                        productCount: { $sum: 1 },
                        avgViewsPerProduct: { $avg: '$viewCount' }
                    }
                },
                { $sort: { totalViews: -1 } }
            ])

            // Conversion metrics (views to purchases)
            const conversionData = await productModel.aggregate([
                { $match: {} },
                {
                    $lookup: {
                        from: 'purchases',
                        let: { productId: '$_id' },
                        pipeline: [
                            { $unwind: '$items' },
                            {
                                $match: {
                                    $expr: { $eq: ['$items.productId', '$$productId'] },
                                    orderStatus: 'completed',
                                    createdAt: { $gte: dateFilter }
                                }
                            },
                            { $count: 'sales' }
                        ],
                        as: 'salesData'
                    }
                },
                {
                    $addFields: {
                        salesCount: { $ifNull: [{ $arrayElemAt: ['$salesData.sales', 0] }, 0] },
                        conversionRate: {
                            $cond: {
                                if: { $gt: ['$viewCount', 0] },
                                then: {
                                    $multiply: [{ $divide: [{ $ifNull: [{ $arrayElemAt: ['$salesData.sales', 0] }, 0] }, '$viewCount'] }, 100]
                                },
                                else: 0
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: '$viewCount' },
                        totalSales: { $sum: '$salesCount' },
                        avgConversionRate: { $avg: '$conversionRate' }
                    }
                }
            ])

            const conversion =
                conversionData.length > 0
                    ? conversionData[0]
                    : {
                          totalViews: 0,
                          totalSales: 0,
                          avgConversionRate: 0
                      }

            // User engagement metrics
            const engagementMetrics = await userModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $lookup: {
                        from: 'purchases',
                        localField: '_id',
                        foreignField: 'userId',
                        pipeline: [{ $match: { orderStatus: 'completed' } }, { $count: 'purchases' }],
                        as: 'userPurchases'
                    }
                },
                {
                    $addFields: {
                        purchaseCount: { $ifNull: [{ $arrayElemAt: ['$userPurchases.purchases', 0] }, 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalNewUsers: { $sum: 1 },
                        buyerUsers: { $sum: { $cond: [{ $gt: ['$purchaseCount', 0] }, 1, 0] } }
                    }
                },
                {
                    $addFields: {
                        engagementRate: {
                            $cond: {
                                if: { $gt: ['$totalNewUsers', 0] },
                                then: { $multiply: [{ $divide: ['$buyerUsers', '$totalNewUsers'] }, 100] },
                                else: 0
                            }
                        }
                    }
                }
            ])

            const engagement =
                engagementMetrics.length > 0
                    ? engagementMetrics[0]
                    : {
                          totalNewUsers: 0,
                          buyerUsers: 0,
                          engagementRate: 0
                      }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                period,
                summary: {
                    platformViews,
                    totalViews: conversion.totalViews,
                    totalSales: conversion.totalSales,
                    conversionRate: conversion.avgConversionRate,
                    newUsers: engagement.totalNewUsers,
                    engagementRate: engagement.engagementRate
                },
                topViewedProducts,
                categoryViews,
                conversion,
                engagement
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get revenue analytics for admin
    getRevenueAnalytics: async (req, res, next) => {
        try {
            // Monthly revenue trend for the last 12 months
            const monthlyRevenue = await purchaseModel.aggregate([
                {
                    $match: {
                        orderStatus: 'completed',
                        createdAt: { $gte: dayjs().subtract(12, 'month').startOf('month').toDate() }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' }
                        },
                        revenue: { $sum: '$finalAmount' },
                        salesCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$finalAmount' }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ])

            // Category-wise revenue
            const categoryRevenue = await purchaseModel.aggregate([
                { $match: { orderStatus: 'completed' } },
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
                        revenue: { $sum: '$items.price' },
                        salesCount: { $sum: 1 },
                        avgOrderValue: { $avg: '$items.price' }
                    }
                },
                { $sort: { revenue: -1 } }
            ])

            // Platform commission analytics
            const commissionAnalytics = await purchaseModel.aggregate([
                { $match: { orderStatus: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$finalAmount' },
                        totalCommission: { $sum: '$platformCommission' },
                        avgCommissionRate: { $avg: { $divide: ['$platformCommission', '$finalAmount'] } }
                    }
                }
            ])

            const commission =
                commissionAnalytics.length > 0
                    ? commissionAnalytics[0]
                    : {
                          totalRevenue: 0,
                          totalCommission: 0,
                          avgCommissionRate: 0
                      }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                monthlyRevenue,
                categoryRevenue,
                commission
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPayoutAnalytics: async (req, res, next) => {
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

            // Payout status breakdown
            const statusBreakdown = await Payout.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ])

            // Daily payout trends
            const dailyTrends = await Payout.aggregate([
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
            ])

            // Payout method breakdown
            const methodBreakdown = await Payout.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$payoutMethod',
                        count: { $sum: 1 },
                        totalAmount: { $sum: '$amount' }
                    }
                }
            ])

            // Processing time analytics
            const processingTimes = await Payout.aggregate([
                { $match: matchQuery },
                {
                    $addFields: {
                        processingTime: {
                            $cond: {
                                if: { $and: ['$requestedAt', '$completedAt'] },
                                then: {
                                    $divide: [
                                        { $subtract: ['$completedAt', '$requestedAt'] },
                                        86400000 // Convert to days
                                    ]
                                },
                                else: null
                            }
                        }
                    }
                },
                { $match: { processingTime: { $ne: null } } },
                {
                    $group: {
                        _id: null,
                        avgProcessingTime: { $avg: '$processingTime' },
                        minProcessingTime: { $min: '$processingTime' },
                        maxProcessingTime: { $max: '$processingTime' }
                    }
                }
            ])

            // Top sellers by payout amount
            const topSellersByPayout = await Payout.aggregate([
                { $match: { ...matchQuery, status: 'completed' } },
                {
                    $group: {
                        _id: '$sellerId',
                        totalPayouts: { $sum: '$amount' },
                        payoutCount: { $sum: 1 }
                    }
                },
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
                        sellerName: '$seller.fullName',
                        totalPayouts: 1,
                        payoutCount: 1,
                        avgPayoutAmount: { $divide: ['$totalPayouts', '$payoutCount'] }
                    }
                },
                { $sort: { totalPayouts: -1 } },
                { $limit: 10 }
            ])

            // Platform revenue from fees
            const platformRevenue = await Payout.aggregate([
                { $match: { ...matchQuery, status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalPlatformFees: { $sum: '$platformFee' },
                        totalProcessingFees: { $sum: '$processingFee' },
                        totalPayouts: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ])

            const revenue = platformRevenue[0] || {
                totalPlatformFees: 0,
                totalProcessingFees: 0,
                totalPayouts: 0,
                count: 0
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                statusBreakdown,
                dailyTrends,
                methodBreakdown,
                processingTimes: processingTimes[0] || {
                    avgProcessingTime: 0,
                    minProcessingTime: 0,
                    maxProcessingTime: 0
                },
                topSellersByPayout,
                platformRevenue: {
                    ...revenue,
                    totalRevenue: revenue.totalPlatformFees + revenue.totalProcessingFees,
                    avgPayoutAmount: revenue.count > 0 ? revenue.totalPayouts / revenue.count : 0
                }
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    // Get user orders for admin view (combined user details + orders)
    getUserOrders: async (req, res, next) => {
        try {
            const { userId } = req.params
            const { page = 1, limit = 20, type, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            // Verify user exists and get basic details
            const user = await userModel.findById(userId).select('name emailAddress avatar roles isActive createdAt')
            if (!user) {
                return httpError(next, new Error(responseMessage.ERROR.NOT_FOUND('User')), req, 404)
            }

            // Get user's purchase summary and orders in parallel
            const [purchaseSummary, ordersResult] = await Promise.all([
                // Purchase summary aggregation
                purchaseModel.aggregate([
                    {
                        $match: {
                            userId: new mongoose.Types.ObjectId(userId),
                            orderStatus: 'completed'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            totalOrders: { $sum: 1 },
                            totalSpent: { $sum: '$finalAmount' },
                            avgOrderValue: { $avg: '$finalAmount' },
                            firstPurchase: { $min: '$createdAt' },
                            lastPurchase: { $max: '$createdAt' }
                        }
                    }
                ]),

                // Get actual orders using the existing getUserPurchases method
                purchaseModel.getUserPurchases(userId, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    type
                })
            ])

            const summary = purchaseSummary[0] || {
                totalOrders: 0,
                totalSpent: 0,
                avgOrderValue: 0,
                firstPurchase: null,
                lastPurchase: null
            }

            // Combined response with user details, summary, and orders
            httpResponse(req, res, 200, responseMessage.SUCCESS, {
                user: {
                    ...user.toObject(),
                    // Add purchase statistics to user object
                    totalPurchases: summary.totalOrders,
                    totalSpent: summary.totalSpent,
                    avgOrderValue: summary.avgOrderValue,
                    firstPurchase: summary.firstPurchase,
                    lastPurchase: summary.lastPurchase
                },
                ...ordersResult
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}
