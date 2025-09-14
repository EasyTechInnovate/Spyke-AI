import { z } from 'zod'

const payoutSchemas = {
    // Seller payout request
    requestPayout: z.object({
        notes: z.string()
            .max(500, 'Notes cannot exceed 500 characters')
            .optional()
    }),

    // Update payout method
    updatePayoutMethod: z.object({
        method: z.enum(['bank', 'paypal', 'stripe', 'wise'], {
            required_error: 'Payout method is required'
        }),
        
        bankDetails: z.object({
            accountHolderName: z.string()
                .min(2, 'Account holder name must be at least 2 characters')
                .max(100, 'Account holder name cannot exceed 100 characters'),
            accountNumber: z.string()
                .min(8, 'Account number must be at least 8 characters')
                .max(20, 'Account number cannot exceed 20 characters'),
            routingNumber: z.string()
                .min(9, 'Routing number must be 9 characters')
                .max(9, 'Routing number must be 9 characters'),
            bankName: z.string()
                .min(2, 'Bank name must be at least 2 characters')
                .max(100, 'Bank name cannot exceed 100 characters'),
            swiftCode: z.string()
                .min(8, 'SWIFT code must be at least 8 characters')
                .max(11, 'SWIFT code cannot exceed 11 characters')
                .optional()
        }).optional(),
        
        paypalEmail: z.string()
            .email('Please provide a valid PayPal email')
            .optional(),
            
        stripeAccountId: z.string()
            .min(10, 'Stripe account ID must be at least 10 characters')
            .max(50, 'Stripe account ID cannot exceed 50 characters')
            .optional(),
            
        wiseEmail: z.string()
            .email('Please provide a valid Wise email')
            .optional()
    }).refine((data) => {
        // Validate that required fields are present for each method
        if (data.method === 'bank' && !data.bankDetails) {
            return false
        }
        if (data.method === 'paypal' && !data.paypalEmail) {
            return false
        }
        if (data.method === 'stripe' && !data.stripeAccountId) {
            return false
        }
        if (data.method === 'wise' && !data.wiseEmail) {
            return false
        }
        return true
    }, {
        message: 'Required fields missing for selected payout method'
    }),

    // Admin platform settings
    updatePlatformSettings: z.object({
        platformFeePercentage: z.number()
            .min(0, 'Platform fee cannot be negative')
            .max(50, 'Platform fee cannot exceed 50%')
            .optional(),
            
        minimumPayoutThreshold: z.number()
            .min(1, 'Minimum payout threshold must be at least $1')
            .max(1000, 'Minimum payout threshold cannot exceed $1000')
            .optional(),
            
        payoutProcessingTime: z.number()
            .min(1, 'Processing time must be at least 1 day')
            .max(30, 'Processing time cannot exceed 30 days')
            .optional(),
            
        paymentProcessingFee: z.number()
            .min(0, 'Processing fee cannot be negative')
            .max(10, 'Processing fee cannot exceed $10')
            .optional(),
            
        holdPeriodNewSellers: z.number()
            .min(0, 'Hold period cannot be negative')
            .max(90, 'Hold period cannot exceed 90 days')
            .optional(),
            
        autoPayoutEnabled: z.boolean()
            .optional(),
            
        maxPayoutAmount: z.number()
            .min(100, 'Maximum payout amount must be at least $100')
            .max(100000, 'Maximum payout amount cannot exceed $100,000')
            .optional(),
            
        currency: z.enum(['USD', 'EUR', 'GBP'], {
            invalid_type_error: 'Currency must be USD, EUR, or GBP'
        }).optional()
    }),

    // Admin payout actions
    approvePayout: z.object({
        notes: z.string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
    }),

    rejectPayout: z.object({
        reason: z.string()
            .min(10, 'Rejection reason must be at least 10 characters')
            .max(1000, 'Rejection reason cannot exceed 1000 characters')
    }),

    holdPayout: z.object({
        reason: z.string()
            .max(1000, 'Hold reason cannot exceed 1000 characters')
            .optional()
    }),

    markAsProcessing: z.object({
        transactionId: z.string()
            .max(100, 'Transaction ID cannot exceed 100 characters')
            .optional(),
        notes: z.string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
    }),

    markAsCompleted: z.object({
        transactionId: z.string()
            .max(100, 'Transaction ID cannot exceed 100 characters')
            .optional(),
        notes: z.string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
    }),

    bulkApprovePayouts: z.object({
        payoutIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid payout ID format'))
            .min(1, 'At least one payout ID is required')
            .max(50, 'Cannot approve more than 50 payouts at once'),
        notes: z.string()
            .max(1000, 'Notes cannot exceed 1000 characters')
            .optional()
    }),

    // Query parameters
    getPayouts: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a number')
            .transform(Number)
            .refine(val => val >= 1, 'Page must be at least 1')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a number')
            .transform(Number)
            .refine(val => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
            .optional(),
        status: z.enum(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'])
            .optional(),
        sellerId: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid seller ID format')
            .optional(),
        fromDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid from date format, use YYYY-MM-DD')
            .optional(),
        toDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid to date format, use YYYY-MM-DD')
            .optional(),
        sortBy: z.enum(['requestedAt', 'amount', 'status'])
            .optional(),
        sortOrder: z.enum(['asc', 'desc'])
            .optional()
    }),

    getPayoutHistory: z.object({
        page: z.string()
            .regex(/^\d+$/, 'Page must be a number')
            .transform(Number)
            .refine(val => val >= 1, 'Page must be at least 1')
            .optional(),
        limit: z.string()
            .regex(/^\d+$/, 'Limit must be a number')
            .transform(Number)
            .refine(val => val >= 1 && val <= 50, 'Limit must be between 1 and 50')
            .optional(),
        status: z.enum(['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'])
            .optional()
    }),

    getEarnings: z.object({
        fromDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid from date format, use YYYY-MM-DD')
            .optional(),
        toDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid to date format, use YYYY-MM-DD')
            .optional()
    }),

    // URL parameters
    payoutIdParam: z.object({
        id: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid payout ID format')
    })
}

export default payoutSchemas