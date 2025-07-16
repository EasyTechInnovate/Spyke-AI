import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import Product from '../../model/product.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import { notificationService } from '../../util/notification.js'
import { EProductPriceCategory, EProductStatusNew, EUserRole } from '../../constant/application.js'
import { v4 as uuidv4 } from 'uuid'

dayjs.extend(utc)

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Product'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    createProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const productData = req.body

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || !sellerProfile.isApproved) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 403)
            }

            const slug = productData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '') + '-' + uuidv4().slice(0, 8)

            productData.sellerId = sellerProfile._id
            productData.slug = slug

            if (productData.price === 0) {
                productData.priceCategory = EProductPriceCategory.FREE
            } else if (productData.price < 20) {
                productData.priceCategory = EProductPriceCategory.UNDER_20
            } else if (productData.price <= 50) {
                productData.priceCategory = EProductPriceCategory.TWENTY_TO_FIFTY
            } else {
                productData.priceCategory = EProductPriceCategory.OVER_50
            }

            const newProduct = new Product(productData)
            const savedProduct = await newProduct.save()

            sellerProfile.updateStats('totalProducts', 1)
            await sellerProfile.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Created Successfully!',
                `Your product "${savedProduct.title}" has been created and is now in draft status. You can publish it when ready.`,
                'success'
            )

            const responseData = {
                id: savedProduct._id,
                title: savedProduct.title,
                slug: savedProduct.slug,
                status: savedProduct.status,
                createdAt: savedProduct.createdAt
            }

            httpResponse(req, res, 201, responseMessage.PRODUCT.CREATED, responseData)
        } catch (err) {
            if (err.code === 11000) {
                const field = Object.keys(err.keyPattern)[0]
                return httpError(next, new Error(responseMessage.ERROR.DUPLICATE_ENTRY(field)), req, 400)
            }

            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },

    getProducts: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 12,
                type,
                category,
                industry,
                priceCategory,
                setupTime,
                minRating,
                verifiedOnly,
                sortBy = 'createdAt',
                sortOrder = 'desc',
                search,
                sellerId
            } = req.query

            const query = { status: EProductStatusNew.PUBLISHED }

            if (type && type !== 'all') query.type = type
            if (category && category !== 'all') query.category = category
            if (industry && industry !== 'all') query.industry = industry
            if (priceCategory && priceCategory !== 'all') query.priceCategory = priceCategory
            if (setupTime && setupTime !== 'all') query.setupTime = setupTime
            if (minRating) query.averageRating = { $gte: parseFloat(minRating) }
            if (verifiedOnly === 'true') query.isVerified = true
            if (sellerId) query.sellerId = sellerId

            if (search) {
                query.$or = [
                    { title: { $regex: search, $options: 'i' } },
                    { shortDescription: { $regex: search, $options: 'i' } },
                    { tags: { $in: [new RegExp(search, 'i')] } },
                    { searchKeywords: { $in: [new RegExp(search, 'i')] } }
                ]
            }

            const sort = {}
            switch (sortBy) {
                case 'popularity':
                    sort.views = sortOrder === 'desc' ? -1 : 1
                    break
                case 'rating':
                    sort.averageRating = sortOrder === 'desc' ? -1 : 1
                    break
                case 'price':
                    sort.price = sortOrder === 'desc' ? -1 : 1
                    break
                case 'sales':
                    sort.sales = sortOrder === 'desc' ? -1 : 1
                    break
                default:
                    sort.createdAt = sortOrder === 'desc' ? -1 : 1
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const [products, totalCount] = await Promise.all([
                Product.find(query)
                    .populate('sellerId', 'fullName avatar stats.averageRating verification.status')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .select('-reviews -faqs -versions -howItWorks')
                    .lean(),
                Product.countDocuments(query)
            ])

            const totalPages = Math.ceil(totalCount / parseInt(limit))

            const responseData = {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPreviousPage: parseInt(page) > 1
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getProductBySlug: async (req, res, next) => {
        try {
            const { slug } = req.params

            const product = await Product.findOne({ slug, status: EProductStatusNew.PUBLISHED })
                .populate('sellerId', 'fullName avatar bio stats location socialHandles customAutomationServices')
                .populate('reviews.userId', 'name avatar')
                .lean()

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec()

            httpResponse(req, res, 200, responseMessage.SUCCESS, product)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updateProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const updateData = req.body

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString()) {
                if (!authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED_ACCESS), req, 403)
                }
            }

            if (updateData.price !== undefined) {
                if (updateData.price === 0) {
                    updateData.priceCategory = EProductPriceCategory.FREE
                } else if (updateData.price < 20) {
                    updateData.priceCategory = EProductPriceCategory.UNDER_20
                } else if (updateData.price <= 50) {
                    updateData.priceCategory = EProductPriceCategory.TWENTY_TO_FIFTY
                } else {
                    updateData.priceCategory = EProductPriceCategory.OVER_50
                }
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true })
                .populate('sellerId', 'fullName avatar stats.averageRating verification.status')

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Updated Successfully',
                `Your product "${updatedProduct.title}" has been updated successfully.`,
                'info'
            )

            httpResponse(req, res, 200, responseMessage.PRODUCT.UPDATED, updatedProduct)
        } catch (err) {
            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }

            httpError(next, err, req, 500)
        }
    },

    deleteProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString()) {
                if (!authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED_ACCESS), req, 403)
                }
            }

            await Product.findByIdAndDelete(id)

            if (sellerProfile && sellerProfile.stats.totalProducts > 0) {
                sellerProfile.updateStats('totalProducts', -1)
                await sellerProfile.save()
            }

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Deleted Successfully',
                `Your product "${product.title}" has been deleted successfully.`,
                'info'
            )

            httpResponse(req, res, 200, responseMessage.PRODUCT.DELETED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    addReview: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const { rating, comment } = req.body

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (sellerProfile && product.sellerId.toString() === sellerProfile._id.toString()) {
                return httpError(next, new Error(responseMessage.PRODUCT.CANNOT_REVIEW_OWN_PRODUCT), req, 400)
            }

            const existingReview = product.reviews.find(review => review.userId.toString() === authenticatedUser.id)
            if (existingReview) {
                return httpError(next, new Error(responseMessage.PRODUCT.ALREADY_REVIEWED), req, 400)
            }

            product.addReview(authenticatedUser.id, rating, comment)
            await product.save()

            const productSeller = await sellerProfileModel.findById(product.sellerId)
            if (productSeller) {
                await notificationService.sendToUser(
                    productSeller.userId,
                    'New Review Received!',
                    `Someone left a ${rating}-star review on your product "${product.title}".`,
                    'info'
                )
            }

            httpResponse(req, res, 201, responseMessage.PRODUCT.REVIEW_ADDED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    toggleFavorite: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const { isFavorited } = req.body

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const updateOperation = isFavorited ? { $inc: { favorites: 1 } } : { $inc: { favorites: -1 } }
            await Product.findByIdAndUpdate(id, updateOperation)

            const message = isFavorited ? responseMessage.PRODUCT.FAVORITE_ADDED : responseMessage.PRODUCT.FAVORITE_REMOVED

            httpResponse(req, res, 200, message)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    toggleUpvote: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const { isUpvoted } = req.body

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const updateOperation = isUpvoted ? { $inc: { upvotes: 1 } } : { $inc: { upvotes: -1 } }
            await Product.findByIdAndUpdate(id, updateOperation)

            const message = isUpvoted ? responseMessage.PRODUCT.UPVOTE_ADDED : responseMessage.PRODUCT.UPVOTE_REMOVED

            httpResponse(req, res, 200, message)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getRelatedProducts: async (req, res, next) => {
        try {
            const { id } = req.params
            const { limit = 6 } = req.query

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const relatedProducts = await Product.find({
                _id: { $ne: id },
                status: EProductStatusNew.PUBLISHED,
                $or: [
                    { category: product.category },
                    { industry: product.industry },
                    { type: product.type }
                ]
            })
                .populate('sellerId', 'fullName avatar stats.averageRating verification.status')
                .limit(parseInt(limit))
                .select('-reviews -faqs -versions -howItWorks')
                .lean()

            httpResponse(req, res, 200, responseMessage.SUCCESS, relatedProducts)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getAllProductsAdmin: async (req, res, next) => {
        try {
            const {
                page = 1,
                limit = 20,
                status,
                sellerId,
                sortBy = 'createdAt',
                sortOrder = 'desc'
            } = req.query

            const query = {}
            if (status) query.status = status
            if (sellerId) query.sellerId = sellerId

            const sort = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const [products, totalCount] = await Promise.all([
                Product.find(query)
                    .populate('sellerId', 'fullName email avatar userId')
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Product.countDocuments(query)
            ])

            const totalPages = Math.ceil(totalCount / parseInt(limit))

            const responseData = {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPreviousPage: parseInt(page) > 1
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    verifyProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const { isVerified, isTested } = req.body

            const product = await Product.findByIdAndUpdate(
                id,
                { isVerified, isTested },
                { new: true }
            )

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findById(product.sellerId)
            if (sellerProfile) {
                await notificationService.sendToUser(
                    sellerProfile.userId,
                    'Product Verification Updated',
                    `Your product "${product.title}" verification status has been updated.`,
                    'info'
                )
            }

            httpResponse(req, res, 200, responseMessage.PRODUCT.VERIFICATION_UPDATED, {
                productId: product._id,
                isVerified: product.isVerified,
                isTested: product.isTested
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    publishProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const product = await Product.findById(id)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString()) {
                if (!authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED_ACCESS), req, 403)
                }
            }

            product.status = EProductStatusNew.PUBLISHED
            await product.save()

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Published Successfully!',
                `Your product "${product.title}" is now live and available for purchase.`,
                'success'
            )

            httpResponse(req, res, 200, responseMessage.PRODUCT.PUBLISHED, {
                productId: product._id,
                title: product.title,
                status: product.status,
                publishedAt: product.updatedAt
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getMyProducts: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, status } = req.query

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 404)
            }

            const query = { sellerId: sellerProfile._id }
            if (status) query.status = status

            const skip = (parseInt(page) - 1) * parseInt(limit)

            const [products, totalCount] = await Promise.all([
                Product.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .select('-reviews')
                    .lean(),
                Product.countDocuments(query)
            ])

            const totalPages = Math.ceil(totalCount / parseInt(limit))

            const responseData = {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit),
                    hasNextPage: parseInt(page) < totalPages,
                    hasPreviousPage: parseInt(page) > 1
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}