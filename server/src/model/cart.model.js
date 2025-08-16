import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
)

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        items: [cartItemSchema],
        totalItems: {
            type: Number,
            default: 0
        },
        totalAmount: {
            type: Number,
            default: 0
        },
        appliedPromocode: {
            code: String,
            discountAmount: Number,
            discountPercentage: Number
        },
        finalAmount: {
            type: Number,
            default: 0
        },
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

cartSchema.index({ userId: 1 }, { unique: true })
cartSchema.index({ 'items.productId': 1 })

cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    this.totalItems = this.items.length
    next()
})

cartSchema.methods.addItem = async function (productId) {
    const existingItem = this.items.find(item => item.productId.toString() === productId.toString())
    if (existingItem) {
        throw new Error('Product already in cart')
    }
    
    this.items.push({ productId })
    await this.calculateTotals()
    return this.save()
}

cartSchema.methods.removeItem = async function (productId) {
    this.items = this.items.filter(item => item.productId.toString() !== productId.toString())
    await this.calculateTotals()
    return this.save()
}

cartSchema.methods.calculateTotals = async function () {
    if (this.items.length === 0) {
        this.totalAmount = 0
        this.finalAmount = 0
        this.appliedPromocode = undefined
        return
    }

    await this.populate('items.productId', 'price')
    
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.productId.price || 0)
    }, 0)

    let discountAmount = 0
    if (this.appliedPromocode) {
        if (this.appliedPromocode.discountPercentage) {
            discountAmount = (this.totalAmount * this.appliedPromocode.discountPercentage) / 100
        } else if (this.appliedPromocode.discountAmount) {
            discountAmount = Math.min(this.appliedPromocode.discountAmount, this.totalAmount)
        }
    }

    this.finalAmount = Math.max(0, this.totalAmount - discountAmount)
    
    if (this.appliedPromocode) {
        this.appliedPromocode.discountAmount = discountAmount
    }
}

cartSchema.methods.applyPromocode = async function (code, discountPercentage, discountAmount) {
    this.appliedPromocode = {
        code,
        discountPercentage,
        discountAmount
    }
    await this.calculateTotals()
    return this.save()
}

cartSchema.methods.applyPromocodeWithAmount = async function (code, discountAmount, discountPercentage = null) {
    this.appliedPromocode = {
        code,
        discountPercentage,
        discountAmount
    }
    
    this.finalAmount = Math.max(0, this.totalAmount - discountAmount)
    
    return this.save()
}

cartSchema.methods.removePromocode = async function () {
    this.appliedPromocode = undefined
    await this.calculateTotals()
    return this.save()
}

cartSchema.methods.clearCart = async function () {
    this.items = []
    this.totalAmount = 0
    this.finalAmount = 0
    this.appliedPromocode = undefined
    return this.save()
}

cartSchema.statics.getOrCreateCart = async function (userId) {
    let cart = await this.findOne({ userId })
    if (!cart) {
        cart = new this({ userId })
        await cart.save()
    }
    return cart
}

export default mongoose.model('Cart', cartSchema)