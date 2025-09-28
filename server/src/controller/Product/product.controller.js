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

            const product = await Product.findOne({ slug, status: EProductStatusNew.PUBLISHED })
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

            // Check if user has purchased the product
            let hasPurchased = false
            let isOwner = false
            
            if (authenticatedUser) {
                // Check if user is the seller/owner
                const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
                isOwner = sellerProfile && product.sellerId.toString() === sellerProfile._id.toString()
                
                // Check if user has purchased the product
                if (!isOwner) {
                    hasPurchased = await Purchase.hasPurchased(authenticatedUser.id, product._id)
                }
            }

            // Filter content based on purchase status
            const responseProduct = { ...product }
            
            if (!hasPurchased && !isOwner && !authenticatedUser?.roles?.includes(EUserRole.ADMIN)) {
                // Hide premium content for non-purchasers
                delete responseProduct.premiumContent
                
                // Filter out premium FAQs
                if (responseProduct.faqs) {
                    responseProduct.faqs = responseProduct.faqs.filter(faq => !faq.isPremium)
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
                .limit(parseInt(limit))
                .select('-reviews -faqs -versions -howItWorks -premiumContent')
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
                    .populate({
                        path: 'sellerId',
                        model: 'SellerProfile',
                        select: 'fullName email avatar userId'
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
                    .populate({
                        path: 'category',
                        select: 'name icon'
                    })
                    .populate({
                        path: 'industry',
                        select: 'name icon'
                    })
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
            const missingFields = requiredFields.filter(field => !product[field] && product[field] !== 0)
            
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

    getFeaturedProducts: async (req, res, next) => {
        try {
            const { 
                limit = 12, 
                category, 
                type,
                minRating = 3.5 
            } = req.query

            const options = {
                limit: parseInt(limit),
                category,
                minRating: parseFloat(minRating)
            }

            const featuredProducts = await productQuicker.getFeaturedProductsAlgorithm(options)

            if (type) {
                const filteredProducts = featuredProducts.filter(product => product.type === type)
                return httpResponse(req, res, 200, responseMessage.SUCCESS, filteredProducts)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, featuredProducts)
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
            const [
                featured,
                trending,
                highRated,
                recentlyAdded
            ] = await Promise.all([
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