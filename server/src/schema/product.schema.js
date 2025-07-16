import { z } from 'zod'
import { EProductType, EProductCategory, EProductIndustry, EProductPriceCategory, EProductSetupTime, EProductStatusNew } from '../constant/application.js'

const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  logo: z.string().url().optional(),
  model: z.string().optional(),
  link: z.string().url().optional()
})

const versionSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  releaseDate: z.string().datetime().optional(),
  changes: z.array(z.string()).optional(),
  price: z.number().min(0, 'Price must be non-negative')
})

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required')
})

export const createProductSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  
  shortDescription: z.string()
    .min(10, 'Short description must be at least 10 characters')
    .max(200, 'Short description must be less than 200 characters'),
  
  fullDescription: z.string()
    .min(50, 'Full description must be at least 50 characters'),
  
  thumbnail: z.string()
    .url('Thumbnail must be a valid URL'),
  
  images: z.array(z.string().url()).optional(),
  
  previewVideo: z.string().url().optional(),
  
  type: z.enum(Object.values(EProductType), {
    errorMap: () => ({ message: 'Type must be one of: prompt, automation, agent, bundle' })
  }),
  
  category: z.enum(Object.values(EProductCategory), {
    errorMap: () => ({ message: 'Invalid category' })
  }),
  
  industry: z.enum(Object.values(EProductIndustry), {
    errorMap: () => ({ message: 'Invalid industry' })
  }),
  
  price: z.number()
    .min(0, 'Price must be non-negative'),
  
  originalPrice: z.number()
    .min(0, 'Original price must be non-negative')
    .optional(),
  
  toolsUsed: z.array(toolSchema).optional(),
  
  setupTime: z.enum(Object.values(EProductSetupTime), {
    errorMap: () => ({ message: 'Invalid setup time' })
  }),
  
  targetAudience: z.string().optional(),
  
  benefits: z.array(z.string()).optional(),
  
  useCaseExamples: z.array(z.string()).optional(),
  
  howItWorks: z.array(z.string()).optional(),
  
  outcome: z.array(z.string()).optional(),
  
  hasRefundPolicy: z.boolean().optional(),
  
  hasGuarantee: z.boolean().optional(),
  
  guaranteeText: z.string().optional(),
  
  faqs: z.array(faqSchema).optional(),
  
  tags: z.array(z.string()).optional(),
  
  searchKeywords: z.array(z.string()).optional(),
  
  versions: z.array(versionSchema).optional(),
  
  currentVersion: z.string().optional()
})

export const updateProductSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .optional(),
  
  shortDescription: z.string()
    .min(10, 'Short description must be at least 10 characters')
    .max(200, 'Short description must be less than 200 characters')
    .optional(),
  
  fullDescription: z.string()
    .min(50, 'Full description must be at least 50 characters')
    .optional(),
  
  thumbnail: z.string()
    .url('Thumbnail must be a valid URL')
    .optional(),
  
  images: z.array(z.string().url()).optional(),
  
  previewVideo: z.string().url().optional(),
  
  type: z.enum(Object.values(EProductType)).optional(),
  
  category: z.enum(Object.values(EProductCategory)).optional(),
  
  industry: z.enum(Object.values(EProductIndustry)).optional(),
  
  price: z.number().min(0, 'Price must be non-negative').optional(),
  
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  
  toolsUsed: z.array(toolSchema).optional(),
  
  setupTime: z.enum(Object.values(EProductSetupTime)).optional(),
  
  targetAudience: z.string().optional(),
  
  benefits: z.array(z.string()).optional(),
  
  useCaseExamples: z.array(z.string()).optional(),
  
  howItWorks: z.array(z.string()).optional(),
  
  outcome: z.array(z.string()).optional(),
  
  status: z.enum(Object.values(EProductStatusNew)).optional(),
  
  hasRefundPolicy: z.boolean().optional(),
  
  hasGuarantee: z.boolean().optional(),
  
  guaranteeText: z.string().optional(),
  
  faqs: z.array(faqSchema).optional(),
  
  tags: z.array(z.string()).optional(),
  
  searchKeywords: z.array(z.string()).optional(),
  
  versions: z.array(versionSchema).optional(),
  
  currentVersion: z.string().optional()
})

export const getProductsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  
  type: z.enum([...Object.values(EProductType), 'all']).optional(),
  
  category: z.enum([...Object.values(EProductCategory), 'all']).optional(),
  
  industry: z.enum([...Object.values(EProductIndustry), 'all']).optional(),
  
  priceCategory: z.enum([...Object.values(EProductPriceCategory), 'all']).optional(),
  
  setupTime: z.enum([...Object.values(EProductSetupTime), 'all']).optional(),
  
  minRating: z.string().regex(/^[1-5](\.\d+)?$/, 'Rating must be between 1 and 5').optional(),
  
  verifiedOnly: z.enum(['true', 'false']).optional(),
  
  sortBy: z.enum(['createdAt', 'popularity', 'rating', 'price', 'sales']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
  
  search: z.string().optional(),
  
  sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seller ID').optional()
})

export const addReviewSchema = z.object({
  rating: z.number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
  
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters')
    .optional()
})

export const toggleFavoriteSchema = z.object({
  isFavorited: z.boolean()
})

export const toggleUpvoteSchema = z.object({
  isUpvoted: z.boolean()
})

export const verifyProductSchema = z.object({
  isVerified: z.boolean().optional(),
  isTested: z.boolean().optional()
})

// Schema for getting related products
export const getRelatedProductsSchema = z.object({
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
})

// Schema for admin to get all products
export const getAllProductsAdminSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  status: z.enum(Object.values(EProductStatusNew)).optional(),
  sellerId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid seller ID').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'price', 'sales']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})