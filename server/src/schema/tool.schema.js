import { z } from 'zod'

export const createToolSchema = z.object({
    name: z.string()
        .min(2, 'Tool name must be at least 2 characters long')
        .max(50, 'Tool name cannot exceed 50 characters')
        .trim(),
    
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
    
    icon: z.string()
        .trim()
        .default('Wrench'),
    
    isActive: z.boolean()
        .default(true)
})

export const updateToolSchema = z.object({
    name: z.string()
        .min(2, 'Tool name must be at least 2 characters long')
        .max(50, 'Tool name cannot exceed 50 characters')
        .trim()
        .optional(),
    
    description: z.string()
        .max(500, 'Description cannot exceed 500 characters')
        .trim()
        .optional(),
    
    icon: z.string()
        .trim()
        .optional(),
    
    isActive: z.boolean()
        .optional()
})

export const getToolsSchema = z.object({
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

export const toolIdParam = z.object({
    id: z.string()
        .regex(/^[0-9a-fA-F]{24}$/, 'Tool ID must be a valid MongoDB ObjectId')
})