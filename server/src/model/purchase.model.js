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
        this.items.forEach(item => {
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
    this.items.forEach(item => {
        item.accessGranted = true
        item.accessGrantedAt = new Date()
    })
    this.orderStatus = EOrderStatus.COMPLETED
    this.paymentStatus = EPaymentStatus.COMPLETED
    this.completedAt = new Date()
    return this.save()
}

purchaseSchema.methods.revokeAccess = function () {
    this.items.forEach(item => {
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
    this.items.forEach(item => {
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

purchaseSchema.statics.getUserPurchases = async function (userId, options = {}) {
    const { page = 1, limit = 10, type } = options
    const skip = (page - 1) * limit
    
    let matchStage = {
        userId,
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
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'sellerprofiles',
                localField: 'items.sellerId',
                foreignField: '_id',
                as: 'seller'
            }
        },
        { $unwind: '$seller' }
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
                    industry: '$product.industry'
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
    
    const total = totalCount[0]?.total || 0
    
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
    const pipeline = [
        {
            $match: {
                userId,
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
        { $unwind: '$product' },
        {
            $lookup: {
                from: 'sellerprofiles',
                localField: 'items.sellerId',
                foreignField: '_id',
                as: 'seller'
            }
        },
        { $unwind: '$seller' },
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
    
    result.forEach(item => {
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