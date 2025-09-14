import mongoose from 'mongoose'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)

const industrySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Industry name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Industry name must be at least 2 characters long'],
            maxlength: [50, 'Industry name cannot exceed 50 characters']
        },
        
        icon: {
            type: String,
            trim: true,
            default: 'Building'
        },
        
        isActive: {
            type: Boolean,
            default: true
        },
        
        productCount: {
            type: Number,
            default: 0
        },
        
        isDeleted: {
            type: Boolean,
            default: false
        },
        
        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

// Indexes for better performance
industrySchema.index({ name: 1 })
industrySchema.index({ isActive: 1, isDeleted: 1 })
industrySchema.index({ createdAt: -1 })

// Instance method to soft delete
industrySchema.methods.softDelete = function () {
    this.isDeleted = true
    this.isActive = false
    this.deletedAt = dayjs().utc().toDate()
    return this.save()
}

// Instance method to restore
industrySchema.methods.restore = function () {
    this.isDeleted = false
    this.isActive = true
    this.deletedAt = null
    return this.save()
}

// Static method to find active industries
industrySchema.statics.findActive = function () {
    return this.find({ isActive: true, isDeleted: false }).sort({ name: 1 })
}

// Static method to update product count
industrySchema.statics.updateProductCount = async function (industryId) {
    const Product = mongoose.model('Product')
    const count = await Product.countDocuments({
        industry: industryId,
        status: 'published',
        isDeleted: { $ne: true }
    })
    
    await this.findByIdAndUpdate(industryId, { productCount: count })
    return count
}

// Static method to increment product count
industrySchema.statics.incrementProductCount = async function (industryId) {
    await this.findByIdAndUpdate(industryId, { $inc: { productCount: 1 } })
}

// Static method to decrement product count
industrySchema.statics.decrementProductCount = async function (industryId) {
    await this.findByIdAndUpdate(industryId, { $inc: { productCount: -1 } })
}

// JSON transformation
industrySchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.isDeleted
    delete obj.deletedAt
    return obj
}

const industryModel = mongoose.model('Industry', industrySchema)

export default industryModel