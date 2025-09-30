import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import productQuicker from './quicker.controller.js'
import dayjs from 'dayjs'
import mongoose from 'mongoose'
import FeaturedProduct from '../../model/featured.product.model.js'
import Product from '../../model/product.model.js'

export default {
    getAdminFeaturedList: async (req, res, next) => {
        try {
            const { status = 'active', limit = 100 } = req.query

            const now = new Date()
            const baseMatch = { isPinned: true }

            let timeMatch = {}
            if (status === 'active') {
                timeMatch = {
                    $and: [{ $or: [{ startAt: null }, { startAt: { $lte: now } }] }, { $or: [{ endAt: null }, { endAt: { $gte: now } }] }]
                }
            } else if (status === 'scheduled') {
                timeMatch = { startAt: { $gt: now } }
            }

            const pins = await FeaturedProduct.aggregate([
                { $match: { ...baseMatch, ...timeMatch } },
                { $sort: { priority: -1, createdAt: -1 } },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' }
            ])

            const products = pins.map((p) => p.product).filter((p) => p && p.status === 'published')

            httpResponse(req, res, 200, responseMessage.SUCCESS, products)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    setFeatured: async (req, res, next) => {
        try {
            const { productId } = req.params
            const { isPinned = true, priority = 0, startAt = null, endAt = null } = req.body || {}

            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return httpError(next, new Error('Invalid productId'), req, 400)
            }

            const product = await Product.findById(productId).select('_id status')
            if (!product) return httpError(next, new Error('Product not found'), req, 404)
            if (product.status !== 'published') {
                return httpError(next, new Error('Only published products can be featured'), req, 400)
            }

            if (!isPinned) {
                await FeaturedProduct.deleteOne({ productId: product._id })
                return httpResponse(req, res, 200, 'Product unpinned from featured')
            }

            const payload = {
                productId: product._id,
                isPinned: true,
                priority: Number(priority) || 0,
                startAt: startAt ? new Date(startAt) : null,
                endAt: endAt ? new Date(endAt) : null,
                createdBy: req?.authenticatedUser?.id || null
            }

            await FeaturedProduct.updateOne({ productId: product._id }, { $set: payload }, { upsert: true })

            httpResponse(req, res, 200, 'Product pinned to featured')
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getFeaturedSuggestions: async (req, res, next) => {
        try {
            const { limit = 12, minRating = 3.5, minReviews = 3 } = req.query

            const pinned = await FeaturedProduct.find({ isPinned: true }).select('productId').lean()
            const excludeIds = pinned.map((p) => p.productId)

            const algResults = await productQuicker.getFeaturedProductsAlgorithm({
                limit: parseInt(limit),
                excludeIds,
                minRating: parseFloat(minRating)
            })

            const suggestions = algResults.filter((p) => (p.totalReviews || 0) >= parseInt(minReviews))

            httpResponse(req, res, 200, responseMessage.SUCCESS, suggestions)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getFeaturedHybrid: async (req, res, next) => {
        try {
            const { limit = 12, minRating = 3.5, minReviews = 3 } = req.query

            const now = new Date()
            const pinnedProducts = await FeaturedProduct.aggregate([
                {
                    $match: {
                        isPinned: true,
                        $and: [{ $or: [{ startAt: null }, { startAt: { $lte: now } }] }, { $or: [{ endAt: null }, { endAt: { $gte: now } }] }]
                    }
                },
                { $sort: { priority: -1, createdAt: -1 } },
                { $limit: parseInt(limit) },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                // Flatten to product document
                { $replaceRoot: { newRoot: '$product' } },
                // Populate seller profile minimal fields
                {
                    $lookup: {
                        from: 'sellerprofiles',
                        localField: 'sellerId',
                        foreignField: '_id',
                        as: 'sellerId',
                        pipeline: [
                            { $project: { fullName: 1, avatar: 1, verification: 1, isVerified: 1 } }
                        ]
                    }
                },
                { $addFields: { sellerId: { $arrayElemAt: ['$sellerId', 0] } } }
            ])

            let results = pinnedProducts.filter((p) => p && p.status === 'published')

            const remaining = parseInt(limit) - results.length
            if (remaining > 0) {
                const excludeIds = pinnedProducts.map((p) => p._id)
                const algResults = await productQuicker.getFeaturedProductsAlgorithm({
                    limit: remaining * 2,
                    excludeIds,
                    minRating: parseFloat(minRating)
                })
                const filtered = algResults.filter((p) => (p.totalReviews || 0) >= parseInt(minReviews))
                results = results.concat(filtered.slice(0, remaining))
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, results)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}

