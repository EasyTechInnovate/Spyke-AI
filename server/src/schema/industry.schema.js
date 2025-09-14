import { z } from 'zod'

// Create Industry Schema
export const createIndustrySchema = z.object({
    name: z.string()
        .min(2, 'Industry name must be at least 2 characters long')
        .max(50, 'Industry name cannot exceed 50 characters')
        .trim(),
    
    icon: z.string()
        .trim()
        .default('Building'),
    
    isActive: z.boolean()
        .default(true)
})

// Update Industry Schema
export const updateIndustrySchema = z.object({
    name: z.string()
        .min(2, 'Industry name must be at least 2 characters long')
        .max(50, 'Industry name cannot exceed 50 characters')
        .trim()
        .optional(),
    
    icon: z.string()
        .trim()
        .optional(),
    
    isActive: z.boolean()
        .optional()
})

// Get Industries Schema
export const getIndustriesSchema = z.object({
    page: z.string()
        .regex(/^\d+$/, 'Page must be a number')
        .transform(val => parseInt(val))
        .default('1'),
    
    limit: z.string()
        .regex(/^\d+$/, 'Limit must be a number')
        .transform(val => Math.min(parseInt(val), 100))
        .default('20'),
    
    sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'productCount'])
        .default('name'),
    
    sortOrder: z.enum(['asc', 'desc'])
        .default('asc'),
    
    search: z.string()
        .trim()
        .optional(),
    
    isActive: z.enum(['true', 'false'])
        .transform(val => val === 'true')
        .optional()
})

// Industry ID Parameter Schema
export const industryIdParam = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Industry ID must be a valid MongoDB ObjectId')
})