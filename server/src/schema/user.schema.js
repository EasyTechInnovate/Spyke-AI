import { z } from 'zod'

const userSchemas = {
    // User ID parameter validation
    userIdParam: z.object({
        userId: z.string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    }),

    // Suspend single user
    suspendUser: z.object({
        reason: z.string()
            .min(1, 'Suspension reason is required')
            .max(500, 'Reason cannot exceed 500 characters')
    }),

    // Activate single user
    activateUser: z.object({
        activationNote: z.string()
            .max(500, 'Activation note cannot exceed 500 characters')
    }),

    // User management analytics query params
    getUserManagementAnalytics: z.object({
        period: z.enum(['7d', '30d', '90d'])
            .optional()
            .default('30d')
    })
}

export default userSchemas