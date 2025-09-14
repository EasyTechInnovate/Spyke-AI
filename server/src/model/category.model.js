import mongoose from 'mongoose'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Category name must be at least 2 characters long'],
            maxlength: [50, 'Category name cannot exceed 50 characters']
        },
        
        icon: {
            type: String,
            trim: true,
            default: 'Package'
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
categorySchema.index({ name: 1 })
categorySchema.index({ isActive: 1, isDeleted: 1 })
categorySchema.index({ createdAt: -1 })

// Instance method to soft delete
categorySchema.methods.softDelete = function () {
    this.isDeleted = true
    this.isActive = false
    this.deletedAt = dayjs().utc().toDate()
    return this.save()
}

// Instance method to restore
categorySchema.methods.restore = function () {
    this.isDeleted = false
    this.isActive = true
    this.deletedAt = null
    return this.save()
}

// Static method to find active categories
categorySchema.statics.findActive = function () {
    return this.find({ isActive: true, isDeleted: false }).sort({ name: 1 })
}

// Static method to update product count
categorySchema.statics.updateProductCount = async function (categoryId) {
    const Product = mongoose.model('Product')
    const count = await Product.countDocuments({
        category: categoryId,
        status: 'published',
        isDeleted: { $ne: true }
    })
    
    await this.findByIdAndUpdate(categoryId, { productCount: count })
    return count
}

// Static method to increment product count
categorySchema.statics.incrementProductCount = async function (categoryId) {
    await this.findByIdAndUpdate(categoryId, { $inc: { productCount: 1 } })
}

// Static method to decrement product count
categorySchema.statics.decrementProductCount = async function (categoryId) {
    await this.findByIdAndUpdate(categoryId, { $inc: { productCount: -1 } })
}

// JSON transformation
categorySchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.isDeleted
    delete obj.deletedAt
    return obj
}

const categoryModel = mongoose.model('Category', categorySchema)

export default categoryModel