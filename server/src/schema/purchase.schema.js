import { z } from 'zod'

export const addToCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
})

export const removeFromCartSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
})

export const applyPromocodeSchema = z.object({
  code: z.string()
    .min(1, 'Promocode is required')
    .max(20, 'Promocode must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Promocode must contain only uppercase letters and numbers')
})

export const createPurchaseSchema = z.object({
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional()
})

export const getUserPurchasesSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  type: z.enum(['prompt', 'automation', 'agent', 'bundle']).optional()
})