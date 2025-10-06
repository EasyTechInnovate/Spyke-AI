import mongoose from 'mongoose'
import { EOrderStatus, EPaymentStatus } from '../constant/application.js'

const purchaseItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SellerProfile',
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        accessGranted: {
            type: Boolean,
            default: false
        },
        accessGrantedAt: Date
    },
    { _id: false }
)

const purchaseSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        items: [purchaseItemSchema],

        orderStatus: {
            type: String,
            enum: Object.values(EOrderStatus),
            default: EOrderStatus.PENDING
        },
        paymentStatus: {
            type: String,
            enum: Object.values(EPaymentStatus),
            default: EPaymentStatus.PENDING
        },

        totalAmount: {
            type: Number,
            required: true
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        finalAmount: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: 'USD'
        },

        appliedPromocode: {
            code: String,
            discountAmount: Number,
            discountPercentage: Number
        },

        paymentMethod: String,
        paymentReference: {
            type: String,
            sparse: true,
            unique: true // Add unique constraint to prevent duplicates
        },
        transactionId: String,

        purchaseDate: {
            type: Date,
            default: Date.now
        },
        completedAt: Date,
        refundedAt: Date,

        refundReason: String,
        refundAmount: Number,

        ipAddress: String,
        userAgent: String,

        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
)

purchaseSchema.index({ userId: 1 })
purchaseSchema.index({ 'items.productId': 1 })
purchaseSchema.index({ 'items.sellerId': 1 })
purchaseSchema.index({ orderStatus: 1 })
purchaseSchema.index({ paymentStatus: 1 })
purchaseSchema.index({ purchaseDate: -1 })

purchaseSchema.pre('save', function (next) {
    this.updatedAt = Date.now()

    if (this.paymentStatus === EPaymentStatus.COMPLETED && this.orderStatus !== EOrderStatus.COMPLETED) {
        this.items.forEach((item) => {
            if (!item.accessGranted) {
                item.accessGranted = true
                item.accessGrantedAt = new Date()
            }
        })
        this.orderStatus = EOrderStatus.COMPLETED
        this.completedAt = new Date()
    }

    next()
})

purchaseSchema.methods.grantAccess = function () {
    this.items.forEach((item) => {
        item.accessGranted = true
        item.accessGrantedAt = new Date()
    })
    this.orderStatus = EOrderStatus.COMPLETED
    this.paymentStatus = EPaymentStatus.COMPLETED
    this.completedAt = new Date()
    return this.save()
}

purchaseSchema.methods.revokeAccess = function () {
    this.items.forEach((item) => {
        item.accessGranted = false
    })
    this.orderStatus = EOrderStatus.CANCELLED
    return this.save()
}

purchaseSchema.methods.processRefund = function (amount, reason) {
    this.refundAmount = amount || this.finalAmount
    this.refundReason = reason
    this.refundedAt = new Date()
    this.paymentStatus = EPaymentStatus.REFUNDED
    this.orderStatus = EOrderStatus.REFUNDED
    this.items.forEach((item) => {
        item.accessGranted = false
    })
    return this.save()
}

purchaseSchema.statics.hasPurchased = async function (userId, productId) {
    const purchase = await this.findOne({
        userId,
        items: {
            $elemMatch: {
                productId,
                accessGranted: true
            }
        },
        paymentStatus: EPaymentStatus.COMPLETED
    })

    return !!purchase
}

purchaseSchema.statics.hasAnyPurchases = async function (productId) {
    const purchase = await this.findOne({
        items: {
            $elemMatch: {
                productId,
                accessGranted: true
            }
        },
        paymentStatus: EPaymentStatus.COMPLETED
    })

    return !!purchase
}

purchaseSchema.statics.getUserPurchases = async function (userId, options = {}) {
    let userObjectId = userId
    if (typeof userId === 'string') {
        if (mongoose.isValidObjectId(userId)) {
            userObjectId = new mongoose.Types.ObjectId(userId)
        } else {
            return {
                purchases: [],
                pagination: {
                    currentPage: options.page ? parseInt(options.page) : 1,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: options.limit ? parseInt(options.limit) : 10
                }
            }
        }
    }
    const { page = 1, limit = 10, type } = options
    const skip = (page - 1) * limit

    let matchStage = {
        userId: userObjectId,
        paymentStatus: EPaymentStatus.COMPLETED,
        'items.accessGranted': true
    }

    const pipeline = [
        { $match: matchStage },
        { $unwind: '$items' },
        { $match: { 'items.accessGranted': true } },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'product.category',
                foreignField: '_id',
                as: 'categoryDoc'
            }
        },
        {
            $lookup: {
                from: 'sellerprofiles',
                localField: 'items.sellerId',
                foreignField: '_id',
                as: 'seller'
            }
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } }
    ]

    if (type) {
        pipeline.push({ $match: { 'product.type': type } })
    }

    pipeline.push(
        {
            $project: {
                purchaseId: '$_id',
                purchaseDate: '$purchaseDate',
                product: {
                    _id: '$product._id',
                    title: '$product.title',
                    slug: '$product.slug',
                    thumbnail: '$product.thumbnail',
                    price: '$items.price',
                    type: '$product.type',
                    category: '$product.category',
                    categoryName: { $ifNull: [{ $arrayElemAt: ['$categoryDoc.name', 0] }, '$product.category'] },
                    industry: '$product.industry',
                    premiumContent: '$product.premiumContent'
                },
                seller: {
                    _id: '$seller._id',
                    fullName: '$seller.fullName',
                    avatar: '$seller.avatar'
                },
                accessGrantedAt: '$items.accessGrantedAt'
            }
        },
        { $sort: { purchaseDate: -1 } }
    )

    const [result, totalCount] = await Promise.all([
        this.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
        this.aggregate([...pipeline, { $count: 'total' }])
    ])

    let total = totalCount[0]?.total || 0

    if (result.length === 0) {
        const rawCount = await this.countDocuments({ userId: userObjectId, paymentStatus: EPaymentStatus.COMPLETED })
        if (rawCount > 0) {
            const docs = await this.find({ userId: userObjectId, paymentStatus: EPaymentStatus.COMPLETED })
                .sort({ purchaseDate: -1 })
                .skip(skip)
                .limit(limit)
                .populate('items.productId', 'title slug thumbnail price type category industry premiumContent')
                .populate('items.sellerId', 'fullName avatar')
                .lean()
            const flattened = []
            for (const d of docs) {
                for (const it of d.items) {
                    if (!it.accessGranted) continue
                    if (type && it.productId?.type !== type) continue
                    flattened.push({
                        purchaseId: d._id,
                        purchaseDate: d.purchaseDate,
                        product: it.productId
                            ? {
                                  _id: it.productId._id,
                                  title: it.productId.title,
                                  slug: it.productId.slug,
                                  thumbnail: it.productId.thumbnail,
                                  price: it.price,
                                  type: it.productId.type,
                                  category: it.productId.category,
                                  industry: it.productId.industry,
                                  premiumContent: it.productId.premiumContent
                              }
                            : null,
                        seller: it.sellerId
                            ? {
                                  _id: it.sellerId._id,
                                  fullName: it.sellerId.fullName,
                                  avatar: it.sellerId.avatar
                              }
                            : null,
                        accessGrantedAt: it.accessGrantedAt
                    })
                }
            }
            total = rawCount // approximate (per purchase docs, not flattened items count)
            return {
                purchases: flattened,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            }
        }
    }

    return {
        purchases: result,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit
        }
    }
}

purchaseSchema.statics.getUserPurchasesByType = async function (userId) {
    let userObjectId = userId
    if (typeof userId === 'string') {
        if (mongoose.isValidObjectId(userId)) {
            userObjectId = new mongoose.Types.ObjectId(userId)
        } else {
            return {
                prompts: { count: 0, products: [] },
                automations: { count: 0, products: [] },
                agents: { count: 0, products: [] },
                bundles: { count: 0, products: [] }
            }
        }
    }
    const pipeline = [
        {
            $match: {
                userId: userObjectId,
                paymentStatus: EPaymentStatus.COMPLETED,
                'items.accessGranted': true
            }
        },
        { $unwind: '$items' },
        { $match: { 'items.accessGranted': true } },
        {
            $lookup: {
                from: 'products',
                localField: 'items.productId',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'categories',
                localField: 'product.category',
                foreignField: '_id',
                as: 'categoryDoc'
            }
        },
        {
            $lookup: {
                from: 'sellerprofiles',
                localField: 'items.sellerId',
                foreignField: '_id',
                as: 'seller'
            }
        },
        { $unwind: { path: '$seller', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$product.type',
                count: { $sum: 1 },
                products: {
                    $push: {
                        purchaseId: '$_id',
                        purchaseDate: '$purchaseDate',
                        product: {
                            _id: '$product._id',
                            title: '$product.title',
                            slug: '$product.slug',
                            thumbnail: '$product.thumbnail',
                            price: '$items.price',
                            category: '$product.category',
                            categoryName: { $ifNull: [{ $arrayElemAt: ['$categoryDoc.name', 0] }, '$product.category'] },
                            industry: '$product.industry'
                        },
                        seller: {
                            _id: '$seller._id',
                            fullName: '$seller.fullName',
                            avatar: '$seller.avatar'
                        },
                        accessGrantedAt: '$items.accessGrantedAt'
                    }
                }
            }
        },
        {
            $project: {
                type: '$_id',
                count: 1,
                products: {
                    $sortArray: {
                        input: '$products',
                        sortBy: { purchaseDate: -1 }
                    }
                }
            }
        }
    ]

    const result = await this.aggregate(pipeline)

    const categorized = {
        prompts: { count: 0, products: [] },
        automations: { count: 0, products: [] },
        agents: { count: 0, products: [] },
        bundles: { count: 0, products: [] }
    }

    result.forEach((item) => {
        if (categorized[item.type + 's']) {
            categorized[item.type + 's'] = {
                count: item.count,
                products: item.products
            }
        }
    })

    return categorized
}

export default mongoose.model('Purchase', purchaseSchema)
