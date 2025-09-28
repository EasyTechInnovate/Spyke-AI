import { z } from 'zod'
import { EProductCategory, EProductIndustry } from '../constant/application.js'

export const createPromocodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be less than 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters'),
  
  discountType: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: 'Discount type must be either percentage or fixed' })
  }),
  
  discountValue: z.number()
    .min(0, 'Discount value must be positive')
    .max(100, 'Percentage discount cannot exceed 100%'),
  
  maxDiscountAmount: z.number()
    .min(0, 'Max discount amount must be positive')
    .optional(),
  
  minimumOrderAmount: z.number()
    .min(0, 'Minimum order amount must be non-negative')
    .optional(),
  
  applicableProducts: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
  ).optional(),
  
  applicableCategories: z.array(
    z.enum(Object.values(EProductCategory))
  ).optional(),
  
  applicableIndustries: z.array(
    z.enum(Object.values(EProductIndustry))
  ).optional(),
  
  isGlobal: z.boolean().optional(),
  
  usageLimit: z.number()
    .min(1, 'Usage limit must be at least 1')
    .optional(),
  
  usageLimitPerUser: z.number()
    .min(1, 'Usage limit per user must be at least 1')
    .optional(),
  
  validFrom: z.string().datetime().optional(),
  
  validUntil: z.string().datetime({
    message: 'Valid until must be a valid date'
  }),
  
  isPublic: z.boolean().optional()
})

export const updatePromocodeSchema = z.object({
  code: z.string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be less than 20 characters')
    .regex(/^[A-Z0-9_-]+$/i, 'Code can only contain letters, numbers, hyphens and underscores')
    .optional(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(200, 'Description must be less than 200 characters')
    .optional(),
  
  discountType: z.enum(['percentage', 'fixed'], {
    errorMap: () => ({ message: 'Discount type must be either percentage or fixed' })
  }).optional(),
  
  discountValue: z.number()
    .min(0, 'Discount value must be positive')
    .max(100000, 'Discount value is too large')
    .optional(),
  
  maxDiscountAmount: z.number()
    .min(0, 'Max discount amount must be positive')
    .optional(),
  
  minimumOrderAmount: z.number()
    .min(0, 'Minimum order amount must be non-negative')
    .optional(),
  
  applicableProducts: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
  ).optional(),
  
  applicableCategories: z.array(
    z.enum(Object.values(EProductCategory))
  ).optional(),
  
  applicableIndustries: z.array(
    z.enum(Object.values(EProductIndustry))
  ).optional(),
  
  isGlobal: z.boolean().optional(),
  
  usageLimit: z.number()
    .min(1, 'Usage limit must be at least 1')
    .optional(),
  
  usageLimitPerUser: z.number()
    .min(1, 'Usage limit per user must be at least 1')
    .optional(),
  
  validFrom: z.string().datetime().optional(),
  
  validUntil: z.string().datetime({
    message: 'Valid until must be a valid date'
  }).optional(),
  
  isActive: z.boolean().optional(),
  
  isPublic: z.boolean().optional()
}).refine((data) => {
  if (data.discountValue !== undefined && data.discountType === 'percentage' && data.discountValue > 100) {
    return false
  }
  return true
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['discountValue']
})

export const getPromocodesSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  isActive: z.enum(['true', 'false']).optional(),
  createdByType: z.enum(['admin', 'seller']).optional()
})

export const validatePromocodeSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(20, 'Code must be less than 20 characters')
})