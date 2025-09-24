import mongoose from 'mongoose'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'

dayjs.extend(utc)

const toolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Tool name is required'],
            unique: true,
            trim: true,
            minlength: [2, 'Tool name must be at least 2 characters long'],
            maxlength: [50, 'Tool name cannot exceed 50 characters']
        },
        
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters']
        },
        
        icon: {
            type: String,
            trim: true,
            default: 'Wrench'
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

toolSchema.index({ name: 1 })
toolSchema.index({ isActive: 1, isDeleted: 1 })
toolSchema.index({ createdAt: -1 })

toolSchema.methods.softDelete = function () {
    this.isDeleted = true
    this.isActive = false
    this.deletedAt = dayjs().utc().toDate()
    return this.save()
}

toolSchema.methods.restore = function () {
    this.isDeleted = false
    this.isActive = true
    this.deletedAt = null
    return this.save()
}

toolSchema.statics.findActive = function () {
    return this.find({ isActive: true, isDeleted: false }).sort({ name: 1 })
}

toolSchema.statics.updateProductCount = async function (toolId) {
    const Product = mongoose.model('Product')
    const count = await Product.countDocuments({
        'tools.toolId': toolId,
        status: 'published',
        isDeleted: { $ne: true }
    })
    
    await this.findByIdAndUpdate(toolId, { productCount: count })
    return count
}

toolSchema.statics.incrementProductCount = async function (toolId) {
    await this.findByIdAndUpdate(toolId, { $inc: { productCount: 1 } })
}

toolSchema.statics.decrementProductCount = async function (toolId) {
    await this.findByIdAndUpdate(toolId, { $inc: { productCount: -1 } })
}

toolSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.isDeleted
    delete obj.deletedAt
    return obj
}

const toolModel = mongoose.model('Tool', toolSchema)

export default toolModel