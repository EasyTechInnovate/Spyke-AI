import mongoose from 'mongoose'

const payoutSchema = new mongoose.Schema(
    {
        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SellerProfile',
            required: [true, 'Seller ID is required']
        },
        
        amount: {
            type: Number,
            required: [true, 'Payout amount is required'],
            min: [0.01, 'Amount must be greater than 0']
        },
        
        grossAmount: {
            type: Number,
            required: [true, 'Gross amount is required'],
            min: [0.01, 'Gross amount must be greater than 0']
        },
        
        platformFee: {
            type: Number,
            required: [true, 'Platform fee is required'],
            min: [0, 'Platform fee cannot be negative']
        },
        
        processingFee: {
            type: Number,
            default: 0,
            min: [0, 'Processing fee cannot be negative']
        },
        
        payoutMethod: {
            type: String,
            required: [true, 'Payout method is required'],
            enum: ['bank', 'paypal', 'stripe', 'wise']
        },
        
        payoutDetails: {
            type: mongoose.Schema.Types.Mixed,
            required: [true, 'Payout details are required']
        },
        
        status: {
            type: String,
            enum: ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'pending'
        },
        
        requestedAt: {
            type: Date,
            default: Date.now
        },
        
        approvedAt: {
            type: Date,
            default: null
        },
        
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        
        processedAt: {
            type: Date,
            default: null
        },
        
        completedAt: {
            type: Date,
            default: null
        },
        
        failureReason: {
            type: String,
            default: null
        },
        
        transactionId: {
            type: String,
            default: null
        },
        
        payoutPeriod: {
            from: {
                type: Date,
                required: [true, 'Payout period start date is required']
            },
            to: {
                type: Date,
                required: [true, 'Payout period end date is required']
            }
        },
        
        salesIncluded: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Purchase'
        }],
        
        notes: {
            type: String,
            default: null
        },
        
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP']
        }
    },
    {
        timestamps: true
    }
)

payoutSchema.index({ sellerId: 1 })
payoutSchema.index({ status: 1 })
payoutSchema.index({ requestedAt: -1 })
payoutSchema.index({ approvedBy: 1 })
payoutSchema.index({ 'payoutPeriod.from': 1, 'payoutPeriod.to': 1 })

payoutSchema.index({ sellerId: 1, status: 1 })
payoutSchema.index({ status: 1, requestedAt: -1 })

payoutSchema.methods.approve = function(adminId, notes = null) {
    this.status = 'approved'
    this.approvedAt = new Date()
    this.approvedBy = adminId
    if (notes) this.notes = notes
    return this.save()
}

payoutSchema.methods.reject = function(reason) {
    this.status = 'cancelled'
    this.failureReason = reason
    return this.save()
}

payoutSchema.methods.markAsProcessing = function(transactionId = null) {
    this.status = 'processing'
    this.processedAt = new Date()
    if (transactionId) this.transactionId = transactionId
    return this.save()
}

payoutSchema.methods.markAsCompleted = function(transactionId = null) {
    this.status = 'completed'
    this.completedAt = new Date()
    if (transactionId) this.transactionId = transactionId
    return this.save()
}

payoutSchema.methods.markAsFailed = function(reason) {
    this.status = 'failed'
    this.failureReason = reason
    return this.save()
}

payoutSchema.statics.getPendingPayouts = function() {
    return this.find({ status: 'pending' })
        .populate('sellerId', 'fullName email payoutInfo')
        .sort({ requestedAt: 1 })
}

payoutSchema.statics.getSellerPayouts = function(sellerId, options = {}) {
    const { page = 1, limit = 10, status } = options
    const skip = (page - 1) * limit
    
    let query = { sellerId }
    if (status) query.status = status
    
    return this.find(query)
        .populate('approvedBy', 'firstName lastName email')
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
}

export default mongoose.model('Payout', payoutSchema)