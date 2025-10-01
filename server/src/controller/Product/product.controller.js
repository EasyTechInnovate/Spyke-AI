import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import quicker from '../../util/quicker.js'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import Product from '../../model/product.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import Purchase from '../../model/purchase.model.js'
import { notificationService } from '../../util/notification.js'
import { EProductPriceCategory, EProductStatusNew, EUserRole } from '../../constant/application.js'
import { v4 as uuidv4 } from 'uuid'
import productQuicker from './quicker.controller.js'
import mongoose from 'mongoose'
import Category from '../../model/category.model.js'
import Industry from '../../model/industry.model.js'

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

            // Convert category name to ObjectId if needed
            if (productData.category && !mongoose.Types.ObjectId.isValid(productData.category)) {
                const category = await Category.findOne({
                    name: new RegExp(`^${productData.category.replace(/[_-]/g, ' ')}$`, 'i')
                })
                if (category) {
                    productData.category = category._id
                } else {
                    return httpError(next, new Error(`Category "${productData.category}" not found`), req, 400)
                }
            }

            // Convert industry name to ObjectId if needed
            if (productData.industry && !mongoose.Types.ObjectId.isValid(productData.industry)) {
                const industry = await Industry.findOne({
                    name: new RegExp(`^${productData.industry.replace(/[_-]/g, ' ')}$`, 'i')
                })
                if (industry) {
                    productData.industry = industry._id
                } else {
                    return httpError(next, new Error(`Industry "${productData.industry}" not found`), req, 400)
                }
            }

            const slug =
                productData.title
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '') +
                '-' +
                uuidv4().slice(0, 8)

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
                category: categoryParam,
                industry: industryParam,
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
            if (priceCategory && priceCategory !== 'all') query.priceCategory = priceCategory
            if (setupTime && setupTime !== 'all') query.setupTime = setupTime
            if (minRating) query.averageRating = { $gte: parseFloat(minRating) }
            if (verifiedOnly === 'true') query.isVerified = true
            if (sellerId) query.sellerId = sellerId

            if (categoryParam && categoryParam !== 'all') {
                let categoryId = null
                if (mongoose.Types.ObjectId.isValid(categoryParam)) {
                    categoryId = categoryParam
                } else {
                    const cat = await Category.findOne({ name: new RegExp(`^${categoryParam}$`, 'i') }, { _id: 1 }).lean()
                    if (cat) categoryId = cat._id
                }
                if (categoryId) {
                    query.category = categoryId
                } else {
                    // Unknown category param: short-circuit with empty result
                    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                        products: [],
                        pagination: {
                            currentPage: parseInt(page),
                            totalPages: 0,
                            totalItems: 0,
                            itemsPerPage: parseInt(limit),
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                    })
                }
            }

            if (industryParam && industryParam !== 'all') {
                let industryId = null
                if (mongoose.Types.ObjectId.isValid(industryParam)) {
                    industryId = industryParam
                } else {
                    const ind = await Industry.findOne({ name: new RegExp(`^${industryParam}$`, 'i') }, { _id: 1 }).lean()
                    if (ind) industryId = ind._id
                }
                if (industryId) {
                    query.industry = industryId
                } else {
                    return httpResponse(req, res, 200, responseMessage.SUCCESS, {
                        products: [],
                        pagination: {
                            currentPage: parseInt(page),
                            totalPages: 0,
                            totalItems: 0,
                            itemsPerPage: parseInt(limit),
                            hasNextPage: false,
                            hasPreviousPage: false
                        }
                    })
                }
            }

            if (!query.category) query.category = { $type: 'objectId' }
            if (!query.industry) query.industry = { $type: 'objectId' }

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
                    .populate({
                        path: 'sellerId',
                        model: 'SellerProfile',
                        select: 'fullName avatar stats.averageRating verification.status'
                    })
                    .populate({
                        path: 'category',
                        select: 'name icon'
                    })
                    .populate({
                        path: 'industry',
                        select: 'name icon'
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .select('-reviews -faqs -versions -howItWorks -premiumContent')
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
            const { authenticatedUser } = req
            let product = await Product.findOne({ slug })
                .populate({
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName avatar bio stats location socialHandles customAutomationServices'
                })
                .populate({
                    path: 'category',
                    select: 'name icon'
                })
                .populate({
                    path: 'industry',
                    select: 'name icon'
                })
                .populate('reviews.userId', 'name avatar')
                .lean()

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            let hasPurchased = false
            let isOwner = false

            // Check ownership and purchase status
            if (authenticatedUser) {
                const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
                isOwner = sellerProfile && product.sellerId.toString() === sellerProfile._id.toString()

                if (!isOwner) {
                    hasPurchased = await Purchase.hasPurchased(authenticatedUser.id, product._id)
                }
            }

            if (product.status !== EProductStatusNew.PUBLISHED) {
                if (!isOwner && !authenticatedUser?.roles?.includes(EUserRole.ADMIN)) {
                    return res.status(200).json({
                        success: false,
                        statusCode: 403,
                        message: 'This product can only be edited when it is in draft or published status.',
                        data: {
                            productId: product._id,
                            title: product.title,
                            status: product.status,
                            canEdit: false,
                            reason: product.status === 'pending_review' 
                                ? 'Product is currently under admin review and cannot be edited.'
                                : product.status === 'archived'
                                ? 'Archived products cannot be edited. Please contact support.'
                                : `Products with status '${product.status}' cannot be edited.`
                        }
                    })
                }

                if (isOwner) {
                    const editableStatuses = [EProductStatusNew.DRAFT, EProductStatusNew.PUBLISHED]
                    if (!editableStatuses.includes(product.status)) {
                        return res.status(200).json({
                            success: false,
                            statusCode: 422,
                            message: 'Product cannot be edited in its current status.',
                            data: {
                                productId: product._id,
                                title: product.title,
                                status: product.status,
                                canEdit: false,
                                reason: product.status === 'pending_review' 
                                    ? 'Product is currently under admin review. Please wait for the review to complete before making changes.'
                                    : product.status === 'archived'
                                    ? 'Archived products cannot be edited. Please contact support to restore this product.'
                                    : `Products with status '${product.status}' cannot be edited at this time.`
                            }
                        })
                    }
                }
            }

            // Filter content based on purchase status
            const responseProduct = { ...product }

            if (!hasPurchased && !isOwner && !authenticatedUser?.roles?.includes(EUserRole.ADMIN)) {
                // Hide premium content for non-purchasers
                delete responseProduct.premiumContent

                // Filter out premium FAQs
                if (responseProduct.faqs) {
                    responseProduct.faqs = responseProduct.faqs.filter((faq) => !faq.isPremium)
                }

                // Hide detailed reviews (keep only basic ones)
                if (responseProduct.reviews) {
                    responseProduct.reviews = responseProduct.reviews.slice(0, 3) // Show only first 3 reviews
                }
            }

            // Add purchase status to response
            responseProduct.userAccess = {
                hasPurchased,
                isOwner,
                canAccessPremiumContent: hasPurchased || isOwner || authenticatedUser?.roles?.includes(EUserRole.ADMIN)
            }

            // Increment views
            Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } }).exec()

            httpResponse(req, res, 200, responseMessage.SUCCESS, responseProduct)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updateProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const updateData = req.body

            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString()) {
                if (!authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED_ACCESS), req, 403)
                }
            }

            // Convert category name to ObjectId if needed
            if (updateData.category && !mongoose.Types.ObjectId.isValid(updateData.category)) {
                const category = await Category.findOne({
                    name: new RegExp(`^${updateData.category.replace(/[_-]/g, ' ')}$`, 'i')
                })
                if (category) {
                    updateData.category = category._id
                } else {
                    return httpError(next, new Error(`Category "${updateData.category}" not found`), req, 400)
                }
            }

            // Convert industry name to ObjectId if needed
            if (updateData.industry && !mongoose.Types.ObjectId.isValid(updateData.industry)) {
                const industry = await Industry.findOne({
                    name: new RegExp(`^${updateData.industry.replace(/[_-]/g, ' ')}$`, 'i')
                })
                if (industry) {
                    updateData.industry = industry._id
                } else {
                    return httpError(next, new Error(`Industry "${updateData.industry}" not found`), req, 400)
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

            const updatedProduct = await Product.findByIdAndUpdate(product._id, updateData, { new: true })
                .populate({
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName avatar stats.averageRating verification.status'
                })
                .populate({
                    path: 'category',
                    select: 'name icon'
                })
                .populate({
                    path: 'industry',
                    select: 'name icon'
                })

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

            // Find product by either ObjectId or slug
            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                // Try to find by slug
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile || product.sellerId.toString() !== sellerProfile._id.toString()) {
                if (!authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED_ACCESS), req, 403)
                }
            }

            // Use the actual product._id for deletion
            await Product.findByIdAndDelete(product._id)

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

            // Find product by either ObjectId or slug
            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (sellerProfile && product.sellerId.toString() === sellerProfile._id.toString()) {
                return httpError(next, new Error(responseMessage.PRODUCT.CANNOT_REVIEW_OWN_PRODUCT), req, 400)
            }

            const existingReview = product.reviews.find((review) => review.userId.toString() === authenticatedUser.id)
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

            // Find product by either ObjectId or slug
            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const updateOperation = isFavorited ? { $inc: { favorites: 1 } } : { $inc: { favorites: -1 } }
            await Product.findByIdAndUpdate(product._id, updateOperation)

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

            // Find product by either ObjectId or slug
            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            const updateOperation = isUpvoted ? { $inc: { upvotes: 1 } } : { $inc: { upvotes: -1 } }
            await Product.findByIdAndUpdate(product._id, updateOperation)

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

            // Find product by either ObjectId or slug
            let product
            if (mongoose.Types.ObjectId.isValid(id)) {
                product = await Product.findById(id)
            } else {
                product = await Product.findOne({ slug: id })
            }

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            // First get related products without population to avoid casting errors
            const relatedProductsRaw = await Product.find({
                _id: { $ne: product._id }, // Use actual product._id for exclusion
                status: EProductStatusNew.PUBLISHED,
                $or: [{ category: product.category }, { industry: product.industry }, { type: product.type }]
            })
                .populate({
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName avatar stats.averageRating verification.status'
                })
                .limit(parseInt(limit))
                .select('-reviews -faqs -versions -howItWorks -premiumContent')
                .lean()

            // Then manually populate category and industry safely
            const relatedProducts = await Promise.all(
                relatedProductsRaw.map(async (product) => {
                    const populatedProduct = { ...product }

                    // Safely populate category
                    if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                        try {
                            const category = await Category.findById(product.category).select('name icon').lean()
                            populatedProduct.category = category
                        } catch (error) {
                            console.warn(`Failed to populate category ${product.category}:`, error.message)
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
                            const industry = await Industry.findById(product.industry).select('name icon').lean()
                            populatedProduct.industry = industry
                        } catch (error) {
                            console.warn(`Failed to populate industry ${product.industry}:`, error.message)
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

            httpResponse(req, res, 200, responseMessage.SUCCESS, relatedProducts)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getAllProductsAdmin: async (req, res, next) => {
        try {
            const { page = 1, limit = 20, status, sellerId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query

            const query = {}
            if (status) query.status = status
            if (sellerId) query.sellerId = sellerId

            const sort = {}
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1

            const skip = (parseInt(page) - 1) * parseInt(limit)

            // First get products without population to avoid casting errors
            const [productsRaw, totalCount] = await Promise.all([
                Product.find(query)
                    .populate({
                        path: 'sellerId',
                        model: 'SellerProfile',
                        select: 'fullName email avatar userId'
                    })
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Product.countDocuments(query)
            ])

            const products = await Promise.all(
                productsRaw.map(async (product) => {
                    const populatedProduct = { ...product }

                    if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                        try {
                            const category = await Category.findById(product.category).select('name icon').lean()
                            populatedProduct.category = category
                        } catch (error) {
                            console.warn(`Failed to populate category ${product.category}:`, error.message)
                            populatedProduct.category = null
                        }
                    } else if (typeof product.category === 'string') {
                        try {
                            const category = await Category.findOne({
                                name: new RegExp(`^${product.category.replace(/[_-]/g, ' ')}$`, 'i')
                            })
                                .select('name icon')
                                .lean()
                            populatedProduct.category = category || { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                        } catch (error) {
                            populatedProduct.category = { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                        }
                    } else {
                        populatedProduct.category = null
                    }

                    if (product.industry && mongoose.Types.ObjectId.isValid(product.industry)) {
                        try {
                            const industry = await Industry.findById(product.industry).select('name icon').lean()
                            populatedProduct.industry = industry
                        } catch (error) {
                            console.warn(`Failed to populate industry ${product.industry}:`, error.message)
                            populatedProduct.industry = null
                        }
                    } else if (typeof product.industry === 'string') {
                        try {
                            const industry = await Industry.findOne({
                                name: new RegExp(`^${product.industry.replace(/[_-]/g, ' ')}$`, 'i')
                            })
                                .select('name icon')
                                .lean()
                            populatedProduct.industry = industry || { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                        } catch (error) {
                            populatedProduct.industry = { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                        }
                    } else {
                        populatedProduct.industry = null
                    }

                    return populatedProduct
                })
            )

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

            const product = await Product.findByIdAndUpdate(id, { isVerified, isTested }, { new: true })

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

            if (!product.isVerified || !product.isTested) {
                return httpError(next, new Error('Product must be verified and tested before publishing'), req, 400)
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
            const { page = 1, limit = 10, status, sortBy = 'updatedAt', sortOrder = 'desc', category, type, priceRange } = req.query

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 404)
            }

            const query = { sellerId: sellerProfile._id }
            if (status) query.status = status

            // Add additional filters
            if (category && category !== 'all') query.category = category
            if (type && type !== 'all') query.type = type
            if (priceRange && priceRange !== 'all') {
                switch (priceRange) {
                    case 'free':
                        query.price = 0
                        break
                    case 'under-20':
                        query.price = { $gt: 0, $lt: 20 }
                        break
                    case '20-50':
                        query.price = { $gte: 20, $lte: 50 }
                        break
                    case '50-100':
                        query.price = { $gte: 50, $lte: 100 }
                        break
                    case 'over-100':
                        query.price = { $gt: 100 }
                        break
                }
            }

            const skip = (parseInt(page) - 1) * parseInt(limit)

            // Sorting options
            const sort = {}
            switch (sortBy) {
                case 'title':
                    sort.title = sortOrder === 'desc' ? -1 : 1
                    break
                case 'price':
                    sort.price = sortOrder === 'desc' ? -1 : 1
                    break
                case 'status':
                    sort.status = sortOrder === 'desc' ? -1 : 1
                    break
                case 'views':
                    sort.views = sortOrder === 'desc' ? -1 : 1
                    break
                case 'sales':
                    sort.sales = sortOrder === 'desc' ? -1 : 1
                    break
                case 'createdAt':
                    sort.createdAt = sortOrder === 'desc' ? -1 : 1
                    break
                default:
                    sort.updatedAt = sortOrder === 'desc' ? -1 : 1
            }

            // First, get products without population to avoid casting errors
            const [productsRaw, totalCount] = await Promise.all([
                Product.find(query).sort(sort).skip(skip).limit(parseInt(limit)).select('-reviews').lean(),
                Product.countDocuments(query)
            ])

            const products = await Promise.all(
                productsRaw.map(async (product) => {
                    const populatedProduct = { ...product }
                    if (product.category && mongoose.Types.ObjectId.isValid(product.category)) {
                        try {
                            const category = await Category.findById(product.category).select('name icon').lean()
                            populatedProduct.category = category
                        } catch (error) {
                            console.warn(`Failed to populate category ${product.category}:`, error.message)
                            populatedProduct.category = null
                        }
                    } else {
                        if (typeof product.category === 'string') {
                            try {
                                const category = await Category.findOne({
                                    name: new RegExp(`^${product.category.replace(/[_-]/g, ' ')}$`, 'i')
                                })
                                    .select('name icon')
                                    .lean()
                                populatedProduct.category = category || { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                            } catch (error) {
                                populatedProduct.category = { name: product.category.replace(/[_-]/g, ' '), icon: 'Package' }
                            }
                        } else {
                            populatedProduct.category = null
                        }
                    }

                    if (product.industry && mongoose.Types.ObjectId.isValid(product.industry)) {
                        try {
                            const industry = await Industry.findById(product.industry).select('name icon').lean()
                            populatedProduct.industry = industry
                        } catch (error) {
                            console.warn(`Failed to populate industry ${product.industry}:`, error.message)
                            populatedProduct.industry = null
                        }
                    } else {
                        if (typeof product.industry === 'string') {
                            try {
                                const industry = await Industry.findOne({
                                    name: new RegExp(`^${product.industry.replace(/[_-]/g, ' ')}$`, 'i')
                                })
                                    .select('name icon')
                                    .lean()
                                populatedProduct.industry = industry || { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                            } catch (error) {
                                populatedProduct.industry = { name: product.industry.replace(/[_-]/g, ' '), icon: 'Briefcase' }
                            }
                        } else {
                            populatedProduct.industry = null
                        }
                    }
                    return populatedProduct
                })
            )

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

    getSellerProduct: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser._id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 404)
            }

            const product = await Product.findOne({
                _id: id,
                sellerId: sellerProfile._id
            })
                .populate({
                    path: 'sellerId',
                    model: 'SellerProfile',
                    select: 'fullName avatar bio stats location socialHandles'
                })
                .populate({
                    path: 'category',
                    select: 'name icon'
                })
                .populate({
                    path: 'industry',
                    select: 'name icon'
                })
                .lean()

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, product)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updateProductStatus: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const { status } = req.body

            if (!Object.values(EProductStatusNew).includes(status)) {
                return httpError(next, new Error('Invalid status value'), req, 400)
            }

            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 404)
            }

            const product = await Product.findOne({
                _id: id,
                sellerId: sellerProfile._id
            })

            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            if (product.isVerified && product.isTested && status === EProductStatusNew.DRAFT) {
                return httpError(next, new Error('Cannot move verified and tested product back to draft'), req, 400)
            }

            if (status === EProductStatusNew.PUBLISHED && (!product.isVerified || !product.isTested)) {
                return httpError(next, new Error('Product must be verified and tested before publishing'), req, 400)
            }

            product.status = status
            await product.save()

            const statusMessages = {
                [EProductStatusNew.DRAFT]: 'moved to draft',
                [EProductStatusNew.PUBLISHED]: 'published successfully',
                [EProductStatusNew.ARCHIVED]: 'archived'
            }

            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Status Updated',
                `Your product "${product.title}" has been ${statusMessages[status]}.`,
                'info'
            )

            httpResponse(req, res, 200, responseMessage.PRODUCT.STATUS_UPDATED || 'Status updated successfully', {
                productId: product._id,
                title: product.title,
                status: product.status,
                updatedAt: product.updatedAt
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    submitForReview: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id: productId } = req.params
            const { message } = req.body

            // Find the product and verify ownership
            const product = await Product.findById(productId)
            if (!product) {
                return httpError(next, new Error(responseMessage.PRODUCT.NOT_FOUND), req, 404)
            }

            // Verify seller profile ownership
            const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
            if (!sellerProfile) {
                return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_FOUND), req, 404)
            }

            // Check if user owns this product (unless admin)
            if (authenticatedUser.role !== EUserRole.ADMIN && !product.sellerId.equals(sellerProfile._id)) {
                return httpError(next, new Error(responseMessage.PRODUCT.UNAUTHORIZED), req, 403)
            }

            // Check if product is in draft status
            if (product.status !== EProductStatusNew.DRAFT) {
                return httpError(next, new Error('Only draft products can be submitted for review'), req, 400)
            }

            // Validate required fields for submission
            const requiredFields = ['title', 'shortDescription', 'fullDescription', 'thumbnail', 'type', 'category', 'industry', 'price', 'setupTime']
            const missingFields = requiredFields.filter((field) => !product[field] && product[field] !== 0)

            if (missingFields.length > 0) {
                return httpError(next, new Error(`Missing required fields: ${missingFields.join(', ')}`), req, 422)
            }

            // Update product status to pending review
            product.status = EProductStatusNew.PENDING_REVIEW
            product.submittedAt = dayjs.utc().toDate()
            if (message) {
                product.reviewMessage = message
            }

            await product.save()

            // Notify admin about new submission
            await notificationService.sendToAdmins(
                'New Product Submission',
                `A new product "${product.title}" has been submitted for review by ${sellerProfile.fullName || 'seller'}.`,
                'info',
                {
                    productId: product._id,
                    sellerId: sellerProfile._id,
                    action: 'review_product'
                }
            )

            // Notify seller about successful submission
            await notificationService.sendToUser(
                authenticatedUser.id,
                'Product Submitted Successfully!',
                `Your product "${product.title}" has been submitted for admin review. You'll be notified once the review is complete.`,
                'success'
            )

            const responseData = {
                id: product._id,
                title: product.title,
                status: product.status,
                submittedAt: product.submittedAt,
                message: product.reviewMessage || null
            }

            httpResponse(req, res, 200, responseMessage.PRODUCT.SUBMITTED_FOR_REVIEW, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getTrendingProducts: async (req, res, next) => {
        try {
            const { limit = 8, days = 7 } = req.query

            const options = {
                limit: parseInt(limit),
                days: parseInt(days)
            }

            const trendingProducts = await productQuicker.getTrendingProducts(options)
            httpResponse(req, res, 200, responseMessage.SUCCESS, trendingProducts)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getHighRatedProducts: async (req, res, next) => {
        try {
            const { limit = 6, minReviews = 3 } = req.query

            const options = {
                limit: parseInt(limit),
                minReviews: parseInt(minReviews)
            }

            const highRatedProducts = await productQuicker.getHighRatedProducts(options)
            httpResponse(req, res, 200, responseMessage.SUCCESS, highRatedProducts)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getRecentlyAdded: async (req, res, next) => {
        try {
            const { limit = 6, days = 30 } = req.query

            const options = {
                limit: parseInt(limit),
                days: parseInt(days)
            }

            const recentProducts = await productQuicker.getRecentlyAddedProducts(options)
            httpResponse(req, res, 200, responseMessage.SUCCESS, recentProducts)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getProductDiscovery: async (req, res, next) => {
        try {
            const [featured, trending, highRated, recentlyAdded] = await Promise.all([
                productQuicker.getFeaturedProductsAlgorithm({ limit: 8 }),
                productQuicker.getTrendingProducts({ limit: 6 }),
                productQuicker.getHighRatedProducts({ limit: 6 }),
                productQuicker.getRecentlyAddedProducts({ limit: 6 })
            ])

            const discoveryData = {
                featured,
                trending,
                highRated,
                recentlyAdded,
                totalSections: 4
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, discoveryData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}
