import mongoose from 'mongoose'

const promocodeUsageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        purchaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase',
            required: true
        },
        discountAmount: {
            type: Number,
            required: true
        },
        usedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
)

const promocodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
            minLength: 3,
            maxLength: 20
        },
        description: {
            type: String,
            required: true,
            maxLength: 200
        },
        
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        createdByType: {
            type: String,
            enum: ['admin', 'seller'],
            required: true
        },
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SellerProfile',
            required: function() { return this.createdByType === 'seller' }
        },
        
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: true
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0
        },
        maxDiscountAmount: {
            type: Number,
            default: null
        },
        
        minimumOrderAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        
        applicableProducts: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        }],
        applicableCategories: [{
            type: String
        }],
        applicableIndustries: [{
            type: String
        }],
        isGlobal: {
            type: Boolean,
            default: false
        },
        
        usageLimit: {
            type: Number,
            default: null
        },
        usageLimitPerUser: {
            type: Number,
            default: 1
        },
        currentUsageCount: {
            type: Number,
            default: 0
        },
        
        validFrom: {
            type: Date,
            required: true,
            default: Date.now
        },
        validUntil: {
            type: Date,
            required: true
        },
        
        isActive: {
            type: Boolean,
            default: true
        },
        isPublic: {
            type: Boolean,
            default: true
        },
        
        usageHistory: [promocodeUsageSchema],
        
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

promocodeSchema.index({ code: 1 }, { unique: true })
promocodeSchema.index({ createdBy: 1 })
promocodeSchema.index({ sellerId: 1 })
promocodeSchema.index({ validFrom: 1, validUntil: 1 })
promocodeSchema.index({ isActive: 1, isPublic: 1 })
promocodeSchema.index({ applicableProducts: 1 })
promocodeSchema.index({ applicableCategories: 1 })

promocodeSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    this.code = this.code.toUpperCase()
    next()
})

promocodeSchema.methods.isValid = function () {
    const now = new Date()
    return (
        this.isActive &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (this.usageLimit === null || this.currentUsageCount < this.usageLimit)
    )
}

promocodeSchema.methods.canBeUsedBy = function (userId) {
    if (!this.isValid()) return false
    
    const userUsageCount = this.usageHistory.filter(
        usage => usage.userId.toString() === userId.toString()
    ).length
    
    return userUsageCount < this.usageLimitPerUser
}

promocodeSchema.methods.isApplicableToProducts = function (productIds) {
    if (this.isGlobal) return true
    
    if (this.applicableProducts.length > 0) {
        return productIds.some(productId => 
            this.applicableProducts.some(applicableId => 
                applicableId.toString() === productId.toString()
            )
        )
    }
    
    return true
}

promocodeSchema.methods.isApplicableToCategories = function (categories) {
    if (this.isGlobal) return true
    
    if (this.applicableCategories.length > 0) {
        const categoryStrings = (categories || []).map(c => c?.toString())
        return this.applicableCategories.some(cat => categoryStrings.includes(cat.toString()))
    }
    
    return true
}

promocodeSchema.methods.isApplicableToIndustries = function (industries) {
    if (this.isGlobal) return true

    if (this.applicableIndustries.length > 0) {
        const industryStrings = (industries || []).map(i => i?.toString())
        return this.applicableIndustries.some(ind => industryStrings.includes(ind.toString()))
    }

    return true
}

promocodeSchema.methods.calculateDiscount = function (orderAmount) {
    if (orderAmount < this.minimumOrderAmount) {
        return 0
    }
    
    let discountAmount = 0
    
    if (this.discountType === 'percentage') {
        discountAmount = (orderAmount * this.discountValue) / 100
        
        if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
            discountAmount = this.maxDiscountAmount
        }
    } else if (this.discountType === 'fixed') {
        discountAmount = Math.min(this.discountValue, orderAmount)
    }
    
    return Math.round(discountAmount * 100) / 100
}

promocodeSchema.methods.recordUsage = function (userId, purchaseId, discountAmount) {
    this.usageHistory.push({
        userId,
        purchaseId,
        discountAmount
    })
    this.currentUsageCount += 1
    return this.save()
}

promocodeSchema.methods.deactivate = function () {
    this.isActive = false
    return this.save()
}

promocodeSchema.statics.findValidPromocode = async function (code, userId = null) {
    const promocode = await this.findOne({ 
        code: code.toUpperCase(),
        isActive: true 
    })
    
    if (!promocode || !promocode.isValid()) {
        return null
    }
    
    if (userId && !promocode.canBeUsedBy(userId)) {
        return null
    }
    
    return promocode
}

promocodeSchema.statics.getSellerPromocodes = async function (sellerId, options = {}) {
    const { page = 1, limit = 10, isActive } = options
    const skip = (page - 1) * limit
    
    const query = { sellerId }
    if (isActive !== undefined) {
        query.isActive = isActive
    }
    
    const [promocodes, totalCount] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('applicableProducts', 'title price thumbnail slug')
            .lean(),
        this.countDocuments(query)
    ])
    
    return {
        promocodes,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit
        }
    }
}

promocodeSchema.statics.getAdminPromocodes = async function (options = {}) {
    const { page = 1, limit = 20, isActive, createdByType } = options
    const skip = (page - 1) * limit
    
    const query = {}
    if (isActive !== undefined) {
        query.isActive = isActive
    }
    if (createdByType) {
        query.createdByType = createdByType
    }
    
    const [promocodes, totalCount] = await Promise.all([
        this.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'name email')
            .populate('sellerId', 'fullName')
            .lean(),
        this.countDocuments(query)
    ])
    
    return {
        promocodes,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit
        }
    }
}

export default mongoose.model('Promocode', promocodeSchema)