import Product from '../../model/product.model.js'
import mongoose from 'mongoose'

export default {
    async getFeaturedProductsAlgorithm(options = {}) {
        const { limit = 12, excludeIds = [], category = null, minRating = 3.5 } = options

        const matchStage = {
            status: 'published',
            isVerified: true,
            ...(excludeIds.length > 0 && { _id: { $nin: excludeIds } }),
            ...(category && { category })
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                    pipeline: [{ $project: { name: 1, icon: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'industries',
                    localField: 'industry',
                    foreignField: '_id',
                    as: 'industry',
                    pipeline: [{ $project: { name: 1, icon: 1 } }]
                }
            },
            {
                $lookup: {
                    from: 'sellerprofiles',
                    localField: 'sellerId',
                    foreignField: '_id',
                    as: 'sellerId',
                    pipeline: [{ $project: { fullName: 1, avatar: 1 } }]
                }
            },
            {
                $addFields: {
                    category: { $arrayElemAt: ['$category', 0] },
                    industry: { $arrayElemAt: ['$industry', 0] },
                    sellerId: { $arrayElemAt: ['$sellerId', 0] }
                }
            },
            {
                $addFields: {
                    featuredScore: {
                        $add: [
                            { $multiply: ['$sales', 2] },
                            { $multiply: ['$averageRating', 10] },
                            { $multiply: ['$upvotes', 1.5] },
                            { $multiply: ['$views', 0.1] },
                            { $multiply: ['$totalReviews', 3] },
                            {
                                $cond: {
                                    if: '$isTested',
                                    then: 15,
                                    else: 0
                                }
                            },
                            {
                                $cond: {
                                    if: '$hasGuarantee',
                                    then: 10,
                                    else: 0
                                }
                            },
                            {
                                $cond: {
                                    if: { $gte: ['$averageRating', minRating] },
                                    then: 20,
                                    else: -10
                                }
                            },
                            {
                                $multiply: [
                                    {
                                        $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60 * 24]
                                    },
                                    -0.5
                                ]
                            }
                        ]
                    },

                    diversityBoost: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$type', 'prompt'] }, then: 1 },
                                { case: { $eq: ['$type', 'automation'] }, then: 1.2 },
                                { case: { $eq: ['$type', 'agent'] }, then: 1.3 }
                            ],
                            default: 1
                        }
                    }
                }
            },

            {
                $addFields: {
                    finalScore: {
                        $multiply: ['$featuredScore', '$diversityBoost']
                    }
                }
            },

            {
                $sort: {
                    finalScore: -1,
                    sales: -1,
                    averageRating: -1,
                    createdAt: -1
                }
            },

            { $limit: limit * 2 },

            {
                $group: {
                    _id: '$type',
                    products: { $push: '$$ROOT' },
                    count: { $sum: 1 }
                }
            },

            {
                $project: {
                    products: {
                        $slice: ['$products', Math.ceil(limit / 3)]
                    }
                }
            },

            { $unwind: '$products' },
            { $replaceRoot: { newRoot: '$products' } },
            { $limit: limit }
        ]

        return await Product.aggregate(pipeline)
    },

    async getTrendingProducts(options = {}) {
        const { limit = 8, days = 7 } = options

        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)

        // First get products without population to avoid casting errors
        const productsRaw = await Product.find({
            status: 'published',
            updatedAt: { $gte: dateThreshold }
        })
            .sort({
                sales: -1,
                views: -1,
                upvotes: -1,
                createdAt: -1
            })
            .limit(limit)
            .populate('sellerId', 'fullName avatar')
            .lean()

        // Then manually populate category and industry safely
        const products = await Promise.all(
            productsRaw.map(async (product) => {
                const populatedProduct = { ...product }

                // Safely populate category
                if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                    try {
                        const Category = (await import('../../model/category.model.js')).default
                        const category = await Category.findById(product.category).select('name icon').lean()
                        populatedProduct.category = category
                    } catch (error) {
                        populatedProduct.category = null
                    }
                } else if (typeof product.category === 'string') {
                    populatedProduct.category = { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                } else {
                    populatedProduct.category = null
                }

                // Safely populate industry
                if (product.industry && mongoose.Types.ObjectId.isValid(product.industry)) {
                    try {
                        const Industry = (await import('../../model/industry.model.js')).default
                        const industry = await Industry.findById(product.industry).select('name icon').lean()
                        populatedProduct.industry = industry
                    } catch (error) {
                        populatedProduct.industry = null
                    }
                } else if (typeof product.industry === 'string') {
                    populatedProduct.industry = { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                } else {
                    populatedProduct.industry = null
                }

                return populatedProduct
            })
        )

        return products
    },

    async getHighRatedProducts(options = {}) {
        const { limit = 6, minReviews = 3 } = options

        // First get products without population to avoid casting errors
        const productsRaw = await Product.find({
            status: 'published',
            totalReviews: { $gte: minReviews },
            averageRating: { $gte: 4.0 }
        })
            .sort({
                averageRating: -1,
                totalReviews: -1,
                sales: -1
            })
            .limit(limit)
            .populate('sellerId', 'fullName avatar')
            .lean()

        // Then manually populate category and industry safely
        const products = await Promise.all(
            productsRaw.map(async (product) => {
                const populatedProduct = { ...product }

                // Safely populate category
                if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                    try {
                        const Category = (await import('../../model/category.model.js')).default
                        const category = await Category.findById(product.category).select('name icon').lean()
                        populatedProduct.category = category
                    } catch (error) {
                        populatedProduct.category = null
                    }
                } else if (typeof product.category === 'string') {
                    populatedProduct.category = { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                } else {
                    populatedProduct.category = null
                }

                // Safely populate industry
                if (product.industry && mongoose.Types.ObjectId.isValid(product.industry)) {
                    try {
                        const Industry = (await import('../../model/industry.model.js')).default
                        const industry = await Industry.findById(product.industry).select('name icon').lean()
                        populatedProduct.industry = industry
                    } catch (error) {
                        populatedProduct.industry = null
                    }
                } else if (typeof product.industry === 'string') {
                    populatedProduct.industry = { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                } else {
                    populatedProduct.industry = null
                }

                return populatedProduct
            })
        )

        return products
    },

    async getRecentlyAddedProducts(options = {}) {
        const { limit = 6, days = 30 } = options

        const dateThreshold = new Date()
        dateThreshold.setDate(dateThreshold.getDate() - days)

        // First get products without population to avoid casting errors
        const productsRaw = await Product.find({
            status: 'published',
            isVerified: true,
            createdAt: { $gte: dateThreshold }
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('sellerId', 'fullName avatar')
            .lean()

        // Then manually populate category and industry safely
        const products = await Promise.all(
            productsRaw.map(async (product) => {
                const populatedProduct = { ...product }

                // Safely populate category
                if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                    try {
                        const Category = (await import('../../model/category.model.js')).default
                        const category = await Category.findById(product.category).select('name icon').lean()
                        populatedProduct.category = category
                    } catch (error) {
                        populatedProduct.category = null
                    }
                } else if (typeof product.category === 'string') {
                    populatedProduct.category = { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                } else {
                    populatedProduct.category = null
                }

                // Safely populate industry
                if (product.industry && mongoose.Types.ObjectId.isValid(product.industry)) {
                    try {
                        const Industry = (await import('../../model/industry.model.js')).default
                        const industry = await Industry.findById(product.industry).select('name icon').lean()
                        populatedProduct.industry = industry
                    } catch (error) {
                        populatedProduct.industry = null
                    }
                } else if (typeof product.industry === 'string') {
                    populatedProduct.industry = { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                } else {
                    populatedProduct.industry = null
                }

                return populatedProduct
            })
        )

        return products
    }
}
