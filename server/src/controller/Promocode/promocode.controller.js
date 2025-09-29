import responseMessage from '../../constant/responseMessage.js'
import httpError from '../../util/httpError.js'
import httpResponse from '../../util/httpResponse.js'
import Promocode from '../../model/promocode.model.js'
import sellerProfileModel from '../../model/seller.profile.model.js'
import Product from '../../model/product.model.js'
import { EUserRole } from '../../constant/application.js'

export default {
    self: (req, res, next) => {
        try {
            httpResponse(req, res, 200, responseMessage.SERVICE('Promocode'))
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    createPromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const {
                code,
                description,
                discountType,
                discountValue,
                maxDiscountAmount,
                minimumOrderAmount,
                applicableProducts,
                applicableCategories,
                applicableIndustries,
                isGlobal,
                usageLimit,
                usageLimitPerUser,
                validFrom,
                validUntil,
                isPublic
            } = req.body

            const createdByType = authenticatedUser.roles.includes(EUserRole.ADMIN) ? 'admin' : 'seller'
            let sellerId = null

            if (createdByType === 'seller') {
                const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
                if (!sellerProfile || !sellerProfile.isApproved) {
                    return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 403)
                }
                sellerId = sellerProfile._id

                if (isGlobal && !authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                    return httpError(next, new Error(responseMessage.PROMOCODE.GLOBAL_NOT_ALLOWED_FOR_SELLER), req, 403)
                }
            }

            const existingPromocode = await Promocode.findOne({ code: code.toUpperCase() })
            if (existingPromocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.CODE_ALREADY_EXISTS), req, 400)
            }

            if (validUntil <= new Date()) {
                return httpError(next, new Error(responseMessage.PROMOCODE.INVALID_EXPIRY_DATE), req, 400)
            }

            const promocodeData = {
                code: code.toUpperCase(),
                description,
                createdBy: authenticatedUser.id,
                createdByType,
                sellerId,
                discountType,
                discountValue,
                maxDiscountAmount,
                minimumOrderAmount: minimumOrderAmount || 0,
                applicableProducts: applicableProducts || [],
                applicableCategories: applicableCategories || [],
                applicableIndustries: applicableIndustries || [],
                isGlobal: isGlobal || false,
                usageLimit,
                usageLimitPerUser: usageLimitPerUser || 1,
                validFrom: validFrom || new Date(),
                validUntil,
                isPublic: isPublic !== undefined ? isPublic : true
            }

            const promocode = new Promocode(promocodeData)
            await promocode.save()

            await promocode.populate([
                { path: 'createdBy', select: 'name email' },
                { path: 'sellerId', select: 'fullName' }
            ])

            httpResponse(req, res, 201, responseMessage.PROMOCODE.CREATED, promocode)
        } catch (err) {
            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }
            httpError(next, err, req, 500)
        }
    },

    getPromocodes: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { page = 1, limit = 10, isActive, createdByType } = req.query

            let result

            if (authenticatedUser.roles.includes(EUserRole.ADMIN)) {
                result = await Promocode.getAdminPromocodes({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                    createdByType
                })
            } else if (authenticatedUser.roles.includes(EUserRole.SELLER)) {
                const sellerProfile = await sellerProfileModel.findOne({ userId: authenticatedUser.id })
                if (!sellerProfile) {
                    return httpError(next, new Error(responseMessage.SELLER.PROFILE_NOT_ACTIVE), req, 404)
                }

                result = await Promocode.getSellerPromocodes(sellerProfile._id, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
                })
            } else {
                return httpError(next, new Error(responseMessage.AUTH.FORBIDDEN), req, 403)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, result)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPromocodeById: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const promocode = await Promocode.findById(id)
                .populate('createdBy', 'name email')
                .populate('sellerId', 'fullName')
                .populate('applicableProducts', 'title slug')

            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_FOUND), req, 404)
            }

            const isOwner = promocode.createdBy._id.toString() === authenticatedUser.id
            const isAdmin = authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!isOwner && !isAdmin) {
                return httpError(next, new Error(responseMessage.PROMOCODE.UNAUTHORIZED_ACCESS), req, 403)
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, promocode)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    updatePromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params
            const updateData = req.body

            const promocode = await Promocode.findById(id)
            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_FOUND), req, 404)
            }

            const isOwner = promocode.createdBy.toString() === authenticatedUser.id
            const isAdmin = authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!isOwner && !isAdmin) {
                return httpError(next, new Error(responseMessage.PROMOCODE.UNAUTHORIZED_ACCESS), req, 403)
            }

            if (promocode.currentUsageCount > 0 && (updateData.code || updateData.discountType || updateData.discountValue)) {
                return httpError(next, new Error(responseMessage.PROMOCODE.CANNOT_MODIFY_USED_PROMOCODE), req, 400)
            }

            if (updateData.code && updateData.code.toUpperCase() !== promocode.code) {
                const existingPromocode = await Promocode.findOne({ code: updateData.code.toUpperCase() })
                if (existingPromocode) {
                    return httpError(next, new Error(responseMessage.PROMOCODE.CODE_ALREADY_EXISTS), req, 400)
                }
            }

            if (updateData.validUntil && new Date(updateData.validUntil) <= new Date()) {
                return httpError(next, new Error(responseMessage.PROMOCODE.INVALID_EXPIRY_DATE), req, 400)
            }

            Object.assign(promocode, updateData)
            await promocode.save()

            await promocode.populate([
                { path: 'createdBy', select: 'name email' },
                { path: 'sellerId', select: 'fullName' },
                { path: 'applicableProducts', select: 'title slug' }
            ])

            httpResponse(req, res, 200, responseMessage.PROMOCODE.UPDATED, promocode)
        } catch (err) {
            if (err.name === 'ValidationError') {
                const firstError = Object.values(err.errors)[0]
                return httpError(next, new Error(firstError.message), req, 422)
            }
            httpError(next, err, req, 500)
        }
    },

    deletePromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const promocode = await Promocode.findById(id)
            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_FOUND), req, 404)
            }

            const isOwner = promocode.createdBy.toString() === authenticatedUser.id
            const isAdmin = authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!isOwner && !isAdmin) {
                return httpError(next, new Error(responseMessage.PROMOCODE.UNAUTHORIZED_ACCESS), req, 403)
            }

            if (promocode.currentUsageCount > 0) {
                return httpError(next, new Error(responseMessage.PROMOCODE.CANNOT_DELETE_USED_PROMOCODE), req, 400)
            }

            await Promocode.findByIdAndDelete(id)

            httpResponse(req, res, 200, responseMessage.PROMOCODE.DELETED)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    togglePromocodeStatus: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const promocode = await Promocode.findById(id)
            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_FOUND), req, 404)
            }

            const isOwner = promocode.createdBy.toString() === authenticatedUser.id
            const isAdmin = authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!isOwner && !isAdmin) {
                return httpError(next, new Error(responseMessage.PROMOCODE.UNAUTHORIZED_ACCESS), req, 403)
            }

            promocode.isActive = !promocode.isActive
            await promocode.save()

            const statusMessage = promocode.isActive ? 
                responseMessage.PROMOCODE.ACTIVATED : 
                responseMessage.PROMOCODE.DEACTIVATED

            httpResponse(req, res, 200, statusMessage, {
                promocodeId: promocode._id,
                code: promocode.code,
                isActive: promocode.isActive
            })
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    validatePromocode: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { code } = req.params

            const promocode = await Promocode.findValidPromocode(code, authenticatedUser.id)
            
            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.INVALID), req, 400)
            }

            const responseData = {
                code: promocode.code,
                description: promocode.description,
                discountType: promocode.discountType,
                discountValue: promocode.discountValue,
                maxDiscountAmount: promocode.maxDiscountAmount,
                minimumOrderAmount: promocode.minimumOrderAmount,
                isGlobal: promocode.isGlobal,
                validUntil: promocode.validUntil,
                remainingUses: promocode.usageLimit ? promocode.usageLimit - promocode.currentUsageCount : null,
                userRemainingUses: promocode.usageLimitPerUser - promocode.usageHistory.filter(
                    usage => usage.userId.toString() === authenticatedUser.id
                ).length
            }

            httpResponse(req, res, 200, responseMessage.PROMOCODE.VALID, responseData)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPromocodeUsageStats: async (req, res, next) => {
        try {
            const { authenticatedUser } = req
            const { id } = req.params

            const promocode = await Promocode.findById(id)
                .populate('usageHistory.userId', 'name email')
                .populate('usageHistory.purchaseId', 'finalAmount createdAt')

            if (!promocode) {
                return httpError(next, new Error(responseMessage.PROMOCODE.NOT_FOUND), req, 404)
            }

            const isOwner = promocode.createdBy.toString() === authenticatedUser.id
            const isAdmin = authenticatedUser.roles.includes(EUserRole.ADMIN)

            if (!isOwner && !isAdmin) {
                return httpError(next, new Error(responseMessage.PROMOCODE.UNAUTHORIZED_ACCESS), req, 403)
            }

            const stats = {
                code: promocode.code,
                totalUsages: promocode.currentUsageCount,
                totalDiscountGiven: promocode.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0),
                remainingUses: promocode.usageLimit ? promocode.usageLimit - promocode.currentUsageCount : null,
                isActive: promocode.isActive,
                validUntil: promocode.validUntil,
                usageHistory: promocode.usageHistory.map(usage => ({
                    user: usage.userId,
                    purchase: usage.purchaseId,
                    discountAmount: usage.discountAmount,
                    usedAt: usage.usedAt
                }))
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, stats)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getPublicPromocodes: async (req, res, next) => {
        try {
            const { page = 1, limit = 10 } = req.query
            const skip = (parseInt(page) - 1) * parseInt(limit)

            const query = {
                isActive: true,
                isPublic: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() }
            }

            const [promocodes, totalCount] = await Promise.all([
                Promocode.find(query)
                    .select('code description discountType discountValue maxDiscountAmount minimumOrderAmount validUntil')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                Promocode.countDocuments(query)
            ])

            const result = {
                promocodes,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / parseInt(limit)),
                    totalItems: totalCount,
                    itemsPerPage: parseInt(limit)
                }
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, result)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    },

    getApplicablePromocodes: async (req, res, next) => {
        try {
            const { productIds } = req.query

            if (!productIds) {
                return httpError(next, new Error('Product IDs are required'), req, 400)
            }

            const productIdArray = productIds.split(',').filter(id => id.trim())

            if (productIdArray.length === 0) {
                return httpError(next, new Error('Valid product IDs are required'), req, 400)
            }

            const products = await Product.find({
                _id: { $in: productIdArray },
                status: 'published'
            }).select('_id category industry')

            if (products.length === 0) {
                return httpError(next, new Error('No valid products found'), req, 404)
            }

            const validProductIds = products.map(p => p._id)
            const categories = [...new Set(products.map(p => p.category).filter(Boolean))]
            const industries = [...new Set(products.map(p => p.industry).filter(Boolean))]
            const categoryStrings = categories.map(c => c.toString())
            const industryStrings = industries.map(i => i.toString())

            const query = {
                isActive: true,
                isPublic: true,
                validFrom: { $lte: new Date() },
                validUntil: { $gte: new Date() },
                $or: [
                    { isGlobal: true },
                    { applicableProducts: { $in: validProductIds } },
                    { applicableCategories: { $in: categoryStrings } },
                    { applicableIndustries: { $in: industryStrings } }
                ]
            }

            const promocodes = await Promocode.find(query)
                .select('code description discountType discountValue maxDiscountAmount minimumOrderAmount isGlobal applicableProducts applicableCategories applicableIndustries validUntil')
                .sort({ discountValue: -1 })
                .lean()

            const categorizedPromocodes = {
                global: [],
                productSpecific: [],
                categorySpecific: [],
                industrySpecific: []
            }

            promocodes.forEach(promo => {
                if (promo.isGlobal) {
                    categorizedPromocodes.global.push(promo)
                } else if (promo.applicableProducts && promo.applicableProducts.length > 0) {
                    const applicableToProducts = promo.applicableProducts.some(pid =>
                        validProductIds.some(vpid => vpid.toString() === pid.toString())
                    )
                    if (applicableToProducts) {
                        categorizedPromocodes.productSpecific.push(promo)
                    }
                } else if (promo.applicableCategories && promo.applicableCategories.length > 0) {
                    const applicableToCategories = promo.applicableCategories.some(cat =>
                        categoryStrings.includes(cat.toString())
                    )
                    if (applicableToCategories) {
                        categorizedPromocodes.categorySpecific.push(promo)
                    }
                } else if (promo.applicableIndustries && promo.applicableIndustries.length > 0) {
                    const applicableToIndustries = promo.applicableIndustries.some(ind =>
                        industryStrings.includes(ind.toString())
                    )
                    if (applicableToIndustries) {
                        categorizedPromocodes.industrySpecific.push(promo)
                    }
                }
            })

            const result = {
                requestedProducts: validProductIds,
                applicablePromocodes: categorizedPromocodes,
                totalCount: promocodes.length
            }

            httpResponse(req, res, 200, responseMessage.SUCCESS, result)
        } catch (err) {
            httpError(next, err, req, 500)
        }
    }
}