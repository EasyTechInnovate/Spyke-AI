import mongoose from 'mongoose'

const sellerProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User ID is required'],
            unique: true
        },
        
        fullName: {
            type: String,
            required: [true, 'Full name or brand name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters long'],
            maxlength: [100, 'Name cannot exceed 100 characters']
        },
        
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
        },
        
        websiteUrl: {
            type: String,
            trim: true,
            default: null,
            validate: {
                validator: function(v) {
                    if (!v) return true
                    return /^https?:\/\/.+\..+/.test(v)
                },
                message: 'Please provide a valid website URL'
            }
        },
        
        bio: {
            type: String,
            required: [true, 'Bio is required'],
            trim: true,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },
        
        niches: {
            type: [String],
            required: [true, 'At least one niche is required'],
            validate: {
                validator: function(v) {
                    return v && v.length > 0
                },
                message: 'Please select at least one niche'
            }
        },
        
        toolsSpecialization: {
            type: [String],
            required: [true, 'Tools specialization is required'],
            validate: {
                validator: function(v) {
                    return v && v.length > 0
                },
                message: 'Please select at least one tool specialization'
            }
        },
        
        location: {
            country: {
                type: String,
                required: [true, 'Country is required'],
                trim: true
            },
            timezone: {
                type: String,
                required: [true, 'Timezone is required'],
                trim: true
            }
        },
        
        sellerBanner: {
            type: String,
            default: null,
            validate: {
                validator: function(v) {
                    if (!v) return true
                    return /\.(jpg|jpeg|png|gif|webp)$/i.test(v)
                },
                message: 'Banner must be a valid image file'
            }
        },
        
        socialHandles: {
            linkedin: {
                type: String,
                default: null,
                trim: true
            },
            twitter: {
                type: String,
                default: null,
                trim: true
            },
            instagram: {
                type: String,
                default: null,
                trim: true
            },
            youtube: {
                type: String,
                default: null,
                trim: true
            }
        },
        
        customAutomationServices: {
            type: Boolean,
            required: [true, 'Please specify if you offer custom automation services'],
            default: false
        },
        
        portfolioLinks: {
            type: [String],
            default: [],
            validate: {
                validator: function(links) {
                    if (!links || links.length === 0) return true
                    return links.every(link => /^https?:\/\/.+\..+/.test(link))
                },
                message: 'All portfolio links must be valid URLs'
            }
        },
        
        revenueShareAgreement: {
            accepted: {
                type: Boolean,
                required: [true, 'Revenue share agreement must be accepted'],
                validate: {
                    validator: function(v) {
                        return v === true
                    },
                    message: 'You must accept the revenue share agreement to proceed'
                }
            },
            acceptedAt: {
                type: Date,
                default: Date.now
            },
            ipAddress: {
                type: String,
                default: null
            }
        },
        
        payoutInfo: {
            method: {
                type: String,
                enum: ['bank', 'paypal', 'stripe', 'wise'],
                required: [true, 'Payout method is required']
            },
            bankDetails: {
                accountHolderName: {
                    type: String,
                    required: function() {
                        return this.payoutInfo?.method === 'bank'
                    }
                },
                accountNumber: {
                    type: String,
                    required: function() {
                        return this.payoutInfo?.method === 'bank'
                    }
                },
                routingNumber: {
                    type: String,
                    required: function() {
                        return this.payoutInfo?.method === 'bank'
                    }
                },
                bankName: {
                    type: String,
                    required: function() {
                        return this.payoutInfo?.method === 'bank'
                    }
                },
                swiftCode: {
                    type: String,
                    default: null
                }
            },
            paypalEmail: {
                type: String,
                required: function() {
                    return this.payoutInfo?.method === 'paypal'
                },
                validate: {
                    validator: function(v) {
                        if (this.payoutInfo?.method !== 'paypal') return true
                        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v)
                    },
                    message: 'Please provide a valid PayPal email'
                }
            },
            stripeAccountId: {
                type: String,
                required: function() {
                    return this.payoutInfo?.method === 'stripe'
                }
            },
            wiseEmail: {
                type: String,
                required: function() {
                    return this.payoutInfo?.method === 'wise'
                }
            },
            isVerified: {
                type: Boolean,
                default: false
            },
            verifiedAt: {
                type: Date,
                default: null
            }
        },
        
        verification: {
            status: {
                type: String,
                enum: ['pending', 'under_review', 'commission_offered', 'approved', 'rejected'],
                default: 'pending'
            },
            submittedAt: {
                type: Date,
                default: Date.now
            },
            reviewedAt: {
                type: Date,
                default: null
            },
            reviewedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            approvedAt: {
                type: Date,
                default: null
            },
            rejectionReason: {
                type: String,
                default: null
            },
            documents: {
                identityProof: {
                    type: String,
                    default: null
                },
                businessProof: {
                    type: String,
                    default: null
                },
                taxDocument: {
                    type: String,
                    default: null
                }
            }
        },
        
        commissionOffer: {
            rate: {
                type: Number,
                default: null,
                min: [0, 'Commission rate cannot be negative'],
                max: [100, 'Commission rate cannot exceed 100%']
            },
            offeredBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                default: null
            },
            offeredAt: {
                type: Date,
                default: null
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected', 'counter_offered'],
                default: 'pending'
            },
            negotiationRound: {
                type: Number,
                default: 1
            },
            lastOfferedBy: {
                type: String,
                enum: ['admin', 'seller'],
                default: 'admin'
            },
            acceptedAt: {
                type: Date,
                default: null
            },
            rejectedAt: {
                type: Date,
                default: null
            },
            rejectionReason: {
                type: String,
                default: null
            },
            counterOffer: {
                rate: {
                    type: Number,
                    default: null
                },
                reason: {
                    type: String,
                    default: null
                },
                submittedAt: {
                    type: Date,
                    default: null
                }
            }
        },
        
        settings: {
            autoApproveProducts: {
                type: Boolean,
                default: false
            },
            emailNotifications: {
                type: Boolean,
                default: true
            },
            marketingEmails: {
                type: Boolean,
                default: false
            }
        },
        
        stats: {
            totalProducts: {
                type: Number,
                default: 0
            },
            totalSales: {
                type: Number,
                default: 0
            },
            totalEarnings: {
                type: Number,
                default: 0
            },
            averageRating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5
            },
            totalReviews: {
                type: Number,
                default: 0
            },
            profileViews: {
                type: Number,
                default: 0
            }
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

sellerProfileSchema.index({ email: 1 })
sellerProfileSchema.index({ 'verification.status': 1 })
sellerProfileSchema.index({ 'location.country': 1 })
sellerProfileSchema.index({ niches: 1 })
sellerProfileSchema.index({ toolsSpecialization: 1 })
sellerProfileSchema.index({ isActive: 1 })
sellerProfileSchema.index({ createdAt: -1 })

sellerProfileSchema.index({ 'verification.status': 1, isActive: 1 })
sellerProfileSchema.index({ niches: 1, 'location.country': 1 })

sellerProfileSchema.virtual('isApproved').get(function() {
    return this.verification.status === 'approved' && 
           this.commissionOffer.status === 'accepted' && 
           this.isActive
})

sellerProfileSchema.virtual('completionPercentage').get(function() {
    let completed = 0
    let total = 10
    
    if (this.fullName) completed++
    if (this.email) completed++
    if (this.bio) completed++
    if (this.niches && this.niches.length > 0) completed++
    if (this.toolsSpecialization && this.toolsSpecialization.length > 0) completed++
    if (this.location.country && this.location.timezone) completed++
    if (this.sellerBanner) completed++
    if (this.payoutInfo && this.payoutInfo.method) completed++
    if (this.revenueShareAgreement.accepted) completed++
    if (this.portfolioLinks && this.portfolioLinks.length > 0) completed++
    
    return Math.round((completed / total) * 100)
})

sellerProfileSchema.methods.acceptCommissionOffer = function() {
    this.commissionOffer.status = 'accepted'
    this.commissionOffer.acceptedAt = new Date()
    this.verification.status = 'approved'
    this.verification.approvedAt = new Date()
}

sellerProfileSchema.methods.rejectCommissionOffer = function(reason) {
    this.commissionOffer.status = 'rejected'
    this.commissionOffer.rejectedAt = new Date()
    this.commissionOffer.rejectionReason = reason
}

sellerProfileSchema.methods.submitCounterOffer = function(rate, reason) {
    if (this.commissionOffer.negotiationRound >= 5) {
        throw new Error('Maximum negotiation rounds reached')
    }
    
    this.commissionOffer.status = 'counter_offered'
    this.commissionOffer.negotiationRound += 1
    this.commissionOffer.lastOfferedBy = 'seller'
    this.commissionOffer.counterOffer = {
        rate: rate,
        reason: reason,
        submittedAt: new Date()
    }
}

sellerProfileSchema.methods.adminCounterOffer = function(rate, adminId) {
    if (this.commissionOffer.negotiationRound >= 5) {
        throw new Error('Maximum negotiation rounds reached')
    }
    
    this.commissionOffer.rate = rate
    this.commissionOffer.status = 'pending'
    this.commissionOffer.negotiationRound += 1
    this.commissionOffer.lastOfferedBy = 'admin'
    this.commissionOffer.offeredBy = adminId
    this.commissionOffer.offeredAt = new Date()
    this.commissionOffer.counterOffer = {
        rate: null,
        reason: null,
        submittedAt: null
    }
}

sellerProfileSchema.methods.getCurrentCommissionRate = function() {
    if (this.commissionOffer.status === 'accepted') {
        return this.commissionOffer.rate
    }
    return null
}

sellerProfileSchema.methods.updateStats = function(field, value) {
    if (this.stats[field] !== undefined) {
        this.stats[field] += value
    }
}

sellerProfileSchema.methods.calculateAverageRating = function(newRating) {
    const currentTotal = this.stats.averageRating * this.stats.totalReviews
    this.stats.totalReviews += 1
    this.stats.averageRating = (currentTotal + newRating) / this.stats.totalReviews
}

sellerProfileSchema.statics.findApproved = function() {
    return this.find({
        'verification.status': 'approved',
        'commissionOffer.status': 'accepted',
        isActive: true
    })
}

sellerProfileSchema.statics.findPendingCommission = function() {
    return this.find({
        'verification.status': 'commission_offered',
        'commissionOffer.status': 'pending'
    })
}

sellerProfileSchema.statics.findCounterOffers = function() {
    return this.find({
        'commissionOffer.status': 'counter_offered'
    })
}

sellerProfileSchema.statics.findByNiche = function(niche) {
    return this.find({
        niches: niche,
        'verification.status': 'approved',
        isActive: true
    })
}

sellerProfileSchema.statics.findByTool = function(tool) {
    return this.find({
        toolsSpecialization: tool,
        'verification.status': 'approved',
        isActive: true
    })
}

sellerProfileSchema.methods.rejectCurrentCounterOffer = function(reason) {
    if (this.commissionOffer.status !== 'counter_offered') {
        throw new Error('No counter offer to reject')
    }
    // Do not change rate; revert status back to pending awaiting seller action
    this.commissionOffer.status = 'pending'
    this.commissionOffer.lastOfferedBy = 'admin'
    this.commissionOffer.rejectionReason = reason
    // Clear counter offer details
    this.commissionOffer.counterOffer = {
        rate: null,
        reason: null,
        submittedAt: null
    }
}

export default mongoose.model('SellerProfile', sellerProfileSchema)