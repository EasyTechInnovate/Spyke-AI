import mongoose from 'mongoose'
import {
    EProductType,
    EProductCategory,
    EProductIndustry,
    EProductPriceCategory,
    EProductSetupTime,
    EProductStatusNew
} from '../constant/application.js'

const toolSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        logo: String,
        model: String,
        link: String
    },
    { _id: false }
)

const configurationExampleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: String,
        code: String,
        image: String,
        result: String
    },
    { _id: false }
)

const resultExampleSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: String,
        type: {
            type: String,
            enum: ['image', 'video', 'pdf', 'text'],
            required: true
        },
        url: String,
        content: String
    },
    { _id: false }
)

const versionSchema = new mongoose.Schema(
    {
        version: {
            type: String,
            required: true
        },
        releaseDate: {
            type: Date,
            default: Date.now
        },
        changes: [String],
        price: {
            type: Number,
            required: true
        }
    },
    { _id: false }
)

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: String,
    isVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            unique: true,
            required: true
        },
        shortDescription: {
            type: String,
            required: true,
            maxLength: 200
        },
        fullDescription: {
            type: String,
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        images: [String],
        previewVideo: String,

        type: {
            type: String,
            enum: Object.values(EProductType),
            required: true
        },
        category: {
            type: String,
            enum: Object.values(EProductCategory),
            required: true
        },
        industry: {
            type: String,
            enum: Object.values(EProductIndustry),
            required: true
        },

        price: {
            type: Number,
            required: true
        },
        originalPrice: Number,
        priceCategory: {
            type: String,
            enum: Object.values(EProductPriceCategory),
            required: true
        },

        sellerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller',
            required: true
        },

        toolsUsed: [toolSchema],
        setupTime: {
            type: String,
            enum: Object.values(EProductSetupTime),
            required: true
        },
        targetAudience: String,
        benefits: [String],
        useCaseExamples: [String],
        howItWorks: [String],
        outcome: [String],

        premiumContent: {
            promptText: {
                type: String,
                default: null
            },
            promptInstructions: {
                type: String,
                default: null
            },
            automationInstructions: {
                type: String,
                default: null
            },
            automationFiles: [{
                name: String,
                url: String,
                type: {
                    type: String,
                    enum: ['json', 'csv', 'xml', 'txt', 'zip']
                }
            }],
            agentConfiguration: {
                type: String,
                default: null
            },
            agentFiles: [{
                name: String,
                url: String,
                type: {
                    type: String,
                    enum: ['json', 'py', 'js', 'zip']
                }
            }],
            detailedHowItWorks: [String],
            configurationExamples: [configurationExampleSchema],
            resultExamples: [resultExampleSchema],
            videoTutorials: [{
                title: String,
                url: String,
                duration: String
            }],
            supportDocuments: [{
                title: String,
                url: String,
                type: {
                    type: String,
                    enum: ['pdf', 'doc', 'txt']
                }
            }],
            bonusContent: [{
                title: String,
                description: String,
                type: {
                    type: String,
                    enum: ['template', 'guide', 'checklist', 'bonus']
                },
                url: String
            }]
        },

        isVerified: {
            type: Boolean,
            default: false
        },
        isTested: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: Object.values(EProductStatusNew),
            default: EProductStatusNew.DRAFT
        },

        views: {
            type: Number,
            default: 0
        },
        sales: {
            type: Number,
            default: 0
        },
        favorites: {
            type: Number,
            default: 0
        },
        upvotes: {
            type: Number,
            default: 0
        },

        reviews: [reviewSchema],
        averageRating: {
            type: Number,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },

        versions: [versionSchema],
        currentVersion: {
            type: String,
            default: '1.0.0'
        },

        hasRefundPolicy: {
            type: Boolean,
            default: true
        },
        hasGuarantee: {
            type: Boolean,
            default: false
        },
        guaranteeText: String,

        faqs: [
            {
                question: String,
                answer: String,
                isPremium: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        tags: [String],
        searchKeywords: [String],

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

productSchema.index({ slug: 1 }, { unique: true })
productSchema.index({ sellerId: 1 })
productSchema.index({ category: 1, industry: 1 })
productSchema.index({ type: 1 })
productSchema.index({ priceCategory: 1 })
productSchema.index({ averageRating: -1 })
productSchema.index({ views: -1 })
productSchema.index({ sales: -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ status: 1 })
productSchema.index({ isVerified: 1 })

productSchema.pre('save', function (next) {
    this.updatedAt = Date.now()
    next()
})

productSchema.methods.updateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.averageRating = 0
        this.totalReviews = 0
    } else {
        const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0)
        this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10
        this.totalReviews = this.reviews.length
    }
}

productSchema.methods.addReview = function (userId, rating, comment, isVerified = false) {
    this.reviews.push({
        userId,
        rating,
        comment,
        isVerified
    })
    this.updateAverageRating()
}

productSchema.methods.incrementViews = function () {
    this.views += 1
    return this.save()
}

productSchema.methods.incrementSales = function () {
    this.sales += 1
    return this.save()
}

productSchema.virtual('formattedPrice').get(function () {
    return this.price === 0 ? 'Free' : `$${this.price}`
})

productSchema.virtual('discountPercentage').get(function () {
    if (!this.originalPrice || this.originalPrice <= this.price) return 0
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
})

productSchema.set('toJSON', { virtuals: true })
productSchema.set('toObject', { virtuals: true })

export default mongoose.model('Product', productSchema)
