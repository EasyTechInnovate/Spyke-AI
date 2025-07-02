import { z } from 'zod'
import { EPayoutMethod } from '../constant/application.js'

// Common validations
const urlValidation = z.string().url('Please provide a valid URL').optional()
const socialHandleValidation = z.string().trim().optional()

const sellerSchemas = {
    createProfile: z.object({
        fullName: z.string()
            .min(2, 'Full name must be at least 2 characters long')
            .max(100, 'Full name cannot exceed 100 characters')
            .trim(),
        
        email: z.string()
            .email('Please provide a valid email address')
            .toLowerCase()
            .trim(),
        
        websiteUrl: urlValidation,
        
        bio: z.string()
            .min(50, 'Bio must be at least 50 characters long')
            .max(500, 'Bio cannot exceed 500 characters')
            .trim(),
        
        niches: z.array(z.string())
            .min(1, 'Please select at least one niche')
            .max(5, 'You can select maximum 5 niches'),
        
        toolsSpecialization: z.array(z.string())
            .min(1, 'Please select at least one tool specialization')
            .max(10, 'You can select maximum 10 tools'),
        
        location: z.object({
            country: z.string().min(1, 'Country is required').trim(),
            timezone: z.string().min(1, 'Timezone is required').trim()
        }),
        
        sellerBanner: z.string()
            .url('Banner must be a valid URL')
            .optional(),
        
        socialHandles: z.object({
            linkedin: socialHandleValidation,
            twitter: socialHandleValidation,
            instagram: socialHandleValidation,
            youtube: socialHandleValidation
        }).optional(),
        
        customAutomationServices: z.boolean(),
        
        portfolioLinks: z.array(z.string().url('All portfolio links must be valid URLs'))
            .max(10, 'You can add maximum 10 portfolio links')
            .optional(),
        
        payoutInfo: z.object({
            method: z.enum(Object.values(EPayoutMethod), {
                errorMap: () => ({ message: 'Please select a valid payout method' })
            }),
            
            bankDetails: z.object({
                accountHolderName: z.string().min(1, 'Account holder name is required').optional(),
                accountNumber: z.string().min(1, 'Account number is required').optional(),
                routingNumber: z.string().min(1, 'Routing number is required').optional(),
                bankName: z.string().min(1, 'Bank name is required').optional(),
                swiftCode: z.string().optional()
            }).optional(),
            
            paypalEmail: z.string().email('Please provide a valid PayPal email').optional(),
            stripeAccountId: z.string().min(1, 'Stripe account ID is required').optional(),
            wiseEmail: z.string().email('Please provide a valid Wise email').optional()
        }).superRefine((data, ctx) => {
            // Validate required fields based on payout method
            switch (data.method) {
                case EPayoutMethod.BANK:
                    if (!data.bankDetails?.accountHolderName) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Account holder name is required for bank transfers',
                            path: ['bankDetails', 'accountHolderName']
                        })
                    }
                    if (!data.bankDetails?.accountNumber) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Account number is required for bank transfers',
                            path: ['bankDetails', 'accountNumber']
                        })
                    }
                    if (!data.bankDetails?.routingNumber) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Routing number is required for bank transfers',
                            path: ['bankDetails', 'routingNumber']
                        })
                    }
                    if (!data.bankDetails?.bankName) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Bank name is required for bank transfers',
                            path: ['bankDetails', 'bankName']
                        })
                    }
                    break
                    
                case EPayoutMethod.PAYPAL:
                    if (!data.paypalEmail) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'PayPal email is required for PayPal payouts',
                            path: ['paypalEmail']
                        })
                    }
                    break
                    
                case EPayoutMethod.STRIPE:
                    if (!data.stripeAccountId) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Stripe account ID is required for Stripe payouts',
                            path: ['stripeAccountId']
                        })
                    }
                    break
                    
                case EPayoutMethod.WISE:
                    if (!data.wiseEmail) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Wise email is required for Wise payouts',
                            path: ['wiseEmail']
                        })
                    }
                    break
            }
        })
    }),

    updateProfile: z.object({
        fullName: z.string()
            .min(2, 'Full name must be at least 2 characters long')
            .max(100, 'Full name cannot exceed 100 characters')
            .trim()
            .optional(),
        
        email: z.string()
            .email('Please provide a valid email address')
            .toLowerCase()
            .trim()
            .optional(),
        
        websiteUrl: urlValidation,
        
        bio: z.string()
            .min(50, 'Bio must be at least 50 characters long')
            .max(500, 'Bio cannot exceed 500 characters')
            .trim()
            .optional(),
        
        niches: z.array(z.string())
            .min(1, 'Please select at least one niche')
            .max(5, 'You can select maximum 5 niches')
            .optional(),
        
        toolsSpecialization: z.array(z.string())
            .min(1, 'Please select at least one tool specialization')
            .max(10, 'You can select maximum 10 tools')
            .optional(),
        
        location: z.object({
            country: z.string().min(1, 'Country is required').trim(),
            timezone: z.string().min(1, 'Timezone is required').trim()
        }).optional(),
        
        sellerBanner: z.string()
            .url('Banner must be a valid URL')
            .optional(),
        
        socialHandles: z.object({
            linkedin: socialHandleValidation,
            twitter: socialHandleValidation,
            instagram: socialHandleValidation,
            youtube: socialHandleValidation
        }).optional(),
        
        customAutomationServices: z.boolean().optional(),
        
        portfolioLinks: z.array(z.string().url('All portfolio links must be valid URLs'))
            .max(10, 'You can add maximum 10 portfolio links')
            .optional(),
        
        settings: z.object({
            autoApproveProducts: z.boolean().optional(),
            emailNotifications: z.boolean().optional(),
            marketingEmails: z.boolean().optional()
        }).optional()
    }),

    submitVerification: z.object({
        identityProof: z.string()
            .url('Identity proof must be a valid file URL')
            .min(1, 'Identity proof document is required'),
        
        businessProof: z.string()
            .url('Business proof must be a valid file URL')
            .optional(),
        
        taxDocument: z.string()
            .url('Tax document must be a valid file URL')
            .optional()
    }),

    rejectCommissionOffer: z.object({
        reason: z.string()
            .min(10, 'Rejection reason must be at least 10 characters long')
            .max(500, 'Rejection reason cannot exceed 500 characters')
            .trim()
    }),

    submitCounterOffer: z.object({
        rate: z.number()
            .min(1, 'Commission rate must be at least 1%')
            .max(50, 'Commission rate cannot exceed 50%'),
        
        reason: z.string()
            .min(10, 'Counter offer reason must be at least 10 characters long')
            .max(500, 'Counter offer reason cannot exceed 500 characters')
            .trim()
    }),

    updatePayoutInfo: z.object({
        payoutInfo: z.object({
            method: z.enum(Object.values(EPayoutMethod), {
                errorMap: () => ({ message: 'Please select a valid payout method' })
            }),
            
            bankDetails: z.object({
                accountHolderName: z.string().min(1, 'Account holder name is required').optional(),
                accountNumber: z.string().min(1, 'Account number is required').optional(),
                routingNumber: z.string().min(1, 'Routing number is required').optional(),
                bankName: z.string().min(1, 'Bank name is required').optional(),
                swiftCode: z.string().optional()
            }).optional(),
            
            paypalEmail: z.string().email('Please provide a valid PayPal email').optional(),
            stripeAccountId: z.string().min(1, 'Stripe account ID is required').optional(),
            wiseEmail: z.string().email('Please provide a valid Wise email').optional()
        }).superRefine((data, ctx) => {
            // Validate required fields based on payout method
            switch (data.method) {
                case EPayoutMethod.BANK:
                    if (!data.bankDetails?.accountHolderName) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Account holder name is required for bank transfers',
                            path: ['bankDetails', 'accountHolderName']
                        })
                    }
                    if (!data.bankDetails?.accountNumber) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Account number is required for bank transfers',
                            path: ['bankDetails', 'accountNumber']
                        })
                    }
                    if (!data.bankDetails?.routingNumber) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Routing number is required for bank transfers',
                            path: ['bankDetails', 'routingNumber']
                        })
                    }
                    if (!data.bankDetails?.bankName) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Bank name is required for bank transfers',
                            path: ['bankDetails', 'bankName']
                        })
                    }
                    break
                    
                case EPayoutMethod.PAYPAL:
                    if (!data.paypalEmail) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'PayPal email is required for PayPal payouts',
                            path: ['paypalEmail']
                        })
                    }
                    break
                    
                case EPayoutMethod.STRIPE:
                    if (!data.stripeAccountId) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Stripe account ID is required for Stripe payouts',
                            path: ['stripeAccountId']
                        })
                    }
                    break
                    
                case EPayoutMethod.WISE:
                    if (!data.wiseEmail) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: 'Wise email is required for Wise payouts',
                            path: ['wiseEmail']
                        })
                    }
                    break
            }
        })
    }),

    // Public profile params
    getPublicProfile: z.object({
        sellerId: z.string().min(1, 'Seller ID is required')
    }),

    // Search sellers query params
    searchSellers: z.object({
        niche: z.string().optional(),
        tool: z.string().optional(),
        country: z.string().optional(),
        minRating: z.string()
            .optional()
            .default('0')
            .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 5, {
                message: 'Minimum rating must be between 0 and 5'
            }),
        page: z.string()
            .optional()
            .default('1')
            .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
                message: 'Page must be a positive number'
            }),
        limit: z.string()
            .optional()
            .default('10')
            .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100, {
                message: 'Limit must be between 1 and 100'
            }),
        sortBy: z.enum(['createdAt', 'stats.averageRating', 'stats.totalReviews', 'stats.totalProducts'])
            .optional()
            .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc'])
            .optional()
            .default('desc')
    }),

    getAllProfiles: z.object({
        status: z.enum(['all', 'pending', 'under_review', 'commission_offered', 'approved', 'rejected'])
            .optional()
            .default('all'),
        page: z.string()
            .optional()
            .default('1')
            .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
                message: 'Page must be a positive number'
            }),
        limit: z.string()
            .optional()
            .default('10')
            .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0 && parseInt(val) <= 100, {
                message: 'Limit must be between 1 and 100'
            }),
        sortBy: z.enum(['createdAt', 'verification.submittedAt', 'fullName', 'stats.averageRating'])
            .optional()
            .default('createdAt'),
        sortOrder: z.enum(['asc', 'desc'])
            .optional()
            .default('desc')
    }),

    offerCommission: z.object({
        rate: z.number()
            .min(1, 'Commission rate must be at least 1%')
            .max(50, 'Commission rate cannot exceed 50%')
    }),

    rejectProfile: z.object({
        sellerId: z.string().min(1, 'Seller ID is required'),
        reason: z.string()
            .min(10, 'Rejection reason must be at least 10 characters long')
            .max(1000, 'Rejection reason cannot exceed 1000 characters')
            .trim()
    }),

    sellerIdParam: z.object({
        sellerId: z.string().min(1, 'Seller ID is required')
    })
}

export default sellerSchemas