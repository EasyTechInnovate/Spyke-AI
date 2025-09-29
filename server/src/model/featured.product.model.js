import mongoose from 'mongoose'

const featuredProductSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
            unique: true
        },
        isPinned: {
            type: Boolean,
            default: true
        },
        priority: {
            type: Number,
            default: 0
        },
        startAt: {
            type: Date,
            default: null
        },
        endAt: {
            type: Date,
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        }
    },
    {
        timestamps: true
    }
)

featuredProductSchema.index({ productId: 1 }, { unique: true })
featuredProductSchema.index({ isPinned: 1, priority: -1 })
featuredProductSchema.index({ startAt: 1, endAt: 1 })

export default mongoose.model('FeaturedProduct', featuredProductSchema)
