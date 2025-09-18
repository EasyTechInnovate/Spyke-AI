import mongoose from 'mongoose'

const platformSettingsSchema = new mongoose.Schema(
    {
        platformFeePercentage: {
            type: Number,
            required: [true, 'Platform fee percentage is required'],
            min: [0, 'Platform fee cannot be negative'],
            max: [50, 'Platform fee cannot exceed 50%'],
            default: 10
        },
        
        minimumPayoutThreshold: {
            type: Number,
            required: [true, 'Minimum payout threshold is required'],
            min: [1, 'Minimum payout threshold must be at least $1'],
            default: 50
        },
        
        payoutProcessingTime: {
            type: Number,
            required: [true, 'Processing time is required'],
            min: [1, 'Processing time must be at least 1 day'],
            max: [30, 'Processing time cannot exceed 30 days'],
            default: 7
        },
        
        paymentProcessingFee: {
            type: Number,
            min: [0, 'Processing fee cannot be negative'],
            max: [10, 'Processing fee cannot exceed $10'],
            default: 0
        },
        
        holdPeriodNewSellers: {
            type: Number,
            min: [0, 'Hold period cannot be negative'],
            max: [90, 'Hold period cannot exceed 90 days'],
            default: 14
        },
        
        autoPayoutEnabled: {
            type: Boolean,
            default: false
        },
        
        maxPayoutAmount: {
            type: Number,
            min: [100, 'Maximum payout amount must be at least $100'],
            default: 10000
        },
        
        currency: {
            type: String,
            default: 'USD',
            enum: ['USD', 'EUR', 'GBP']
        },
        
        lastUpdatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

platformSettingsSchema.index({ isActive: 1 })
platformSettingsSchema.index({ lastUpdatedBy: 1 })

platformSettingsSchema.statics.getCurrentSettings = async function(adminUserId = null) {
    let settings = await this.findOne({ isActive: true }).populate('lastUpdatedBy', 'firstName lastName email')

    if (!settings) {
        let defaultAdminId = null
        
        if (adminUserId) {
            // Use the provided admin user ID from authenticated request
            defaultAdminId = adminUserId
        } else {
            // Fallback: find any admin user if no specific user provided
            const defaultAdmin = await mongoose.model('User').findOne({
                roles: { $in: ['admin'] },
                isActive: true
            }).sort({ createdAt: 1 })
            
            if (defaultAdmin) {
                defaultAdminId = defaultAdmin._id
            }
        }

        if (!defaultAdminId) {
            throw new Error('No admin user found to create default platform settings')
        }

        settings = await this.create({
            lastUpdatedBy: defaultAdminId
        })
        await settings.populate('lastUpdatedBy', 'firstName lastName email')
    }

    return settings
}

platformSettingsSchema.methods.calculateSellerEarning = function(saleAmount) {
    const platformFee = (saleAmount * this.platformFeePercentage) / 100
    const processingFee = this.paymentProcessingFee
    const sellerEarning = saleAmount - platformFee - processingFee
    
    return {
        saleAmount,
        platformFee,
        processingFee,
        sellerEarning: Math.max(0, sellerEarning)
    }
}

export default mongoose.model('PlatformSettings', platformSettingsSchema)