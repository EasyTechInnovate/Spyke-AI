import { z } from 'zod'
import { EProductType, EProductCategory, EProductIndustry, EProductPriceCategory, EProductSetupTime, EProductStatusNew } from '../constant/application.js'

// Helper function to create flexible ObjectId or name validation
const createFlexibleIdSchema = (fieldName) => z.string()
  .refine((val) => {
    // Allow valid ObjectIds
    if (/^[0-9a-fA-F]{24}$/.test(val)) return true
    // Allow non-empty strings (names)
    if (typeof val === 'string' && val.trim().length > 0) return true
    return false
  }, `${fieldName} must be a valid ObjectId or name`)


const toolSchema = z.object({
  name: z.string().min(1, 'Tool name is required'),
  logo: z.string().optional().default(''),
  model: z.string().optional().default(''),
  link: z.string().optional().default('')
})

const versionSchema = z.object({
  version: z.string().min(1, 'Version is required'),
  releaseDate: z.string().datetime().optional(),
  changes: z.array(z.string()).optional(),
  price: z.number().min(0, 'Price must be non-negative')
})

const configurationExampleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  code: z.string().optional(),
  image: z.string().url().optional(),
  result: z.string().optional()
})

const resultExampleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['image', 'video', 'pdf', 'text']),
  url: z.string().url().optional(),
  content: z.string().optional()
})

const automationFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['json', 'csv', 'xml', 'txt', 'zip'])
})

const agentFileSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['json', 'py', 'js', 'zip'])
})

const videoTutorialSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  duration: z.string().optional()
})

const supportDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Must be a valid URL'),
  type: z.enum(['pdf', 'doc', 'txt'])
})

const bonusContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['template', 'guide', 'checklist', 'bonus']),
  url: z.string().url('Must be a valid URL')
})

const premiumContentSchema = z.object({
  promptText: z.string().optional(),
  promptInstructions: z.string().optional(),
  automationInstructions: z.string().optional(),
  automationFiles: z.array(automationFileSchema).optional(),
  agentConfiguration: z.string().optional(),
  agentFiles: z.array(agentFileSchema).optional(),
  detailedHowItWorks: z.array(z.string()).optional(),
  configurationExamples: z.array(configurationExampleSchema).optional(),
  resultExamples: z.array(resultExampleSchema).optional(),
  videoTutorials: z.array(videoTutorialSchema).optional(),
  supportDocuments: z.array(supportDocumentSchema).optional(),
  bonusContent: z.array(bonusContentSchema).optional()
})

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  isPremium: z.boolean().optional()
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
  
  images: z.array(z.string().url()).optional().default([]),
  
  // Fixed previewVideo validation
  previewVideo: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === null || val === '') return true
      return z.string().url().safeParse(val).success
    }, 'Preview video must be a valid URL or empty'),
  
  type: z.enum(Object.values(EProductType), {
    errorMap: () => ({ message: 'Type must be one of: prompt, automation, agent, bundle' })
  }),
  
  // Flexible category validation - accepts ObjectId or name
  category: createFlexibleIdSchema('Category'),
  
  // Flexible industry validation - accepts ObjectId or name  
  industry: createFlexibleIdSchema('Industry'),
  
  price: z.number()
    .min(0, 'Price must be non-negative'),
  
  originalPrice: z.number()
    .min(0, 'Original price must be non-negative')
    .optional(),
  
  targetAudience: z.string().optional(),
  benefits: z.array(z.string()).optional().default([]),
  useCaseExamples: z.array(z.string()).optional().default([]),
  howItWorks: z.array(z.string()).min(1, 'At least one step is required for how it works'),
  outcome: z.array(z.string()).optional().default([]),
  
  // Improved toolsUsed validation
  toolsUsed: z.array(toolSchema)
    .optional()
    .default([])
    .refine((tools) => Array.isArray(tools), 'Tools used must be an array'),
    
  setupTime: z.enum(Object.values(EProductSetupTime), {
    errorMap: () => ({ message: 'Invalid setup time' })
  }),
  
  tags: z.array(z.string()).min(1, 'At least one tag is required').max(10, 'Maximum 10 tags allowed'),
  searchKeywords: z.array(z.string()).optional().default([]),
  
  performanceMetrics: z.string().optional(),
  usageInformation: z.string().optional(),
  supportAndMaintenance: z.string().optional(),
  faqs: z.array(faqSchema).min(1, 'At least one FAQ is required'),
  
  hasRefundPolicy: z.boolean().optional(),
  hasGuarantee: z.boolean().optional(),
  guaranteeText: z.string().optional(),
  versions: z.array(versionSchema).optional(),
  currentVersion: z.string().optional(),
  premiumContent: premiumContentSchema.optional()
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
  
  // Fixed previewVideo validation for updates
  previewVideo: z.string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val || val === null || val === '') return true
      return z.string().url().safeParse(val).success
    }, 'Preview video must be a valid URL or empty'),
  
  type: z.enum(Object.values(EProductType)).optional(),
  
  // Flexible validation for updates - accepts ObjectId or name
  category: createFlexibleIdSchema('Category').optional(),
  industry: createFlexibleIdSchema('Industry').optional(),
  
  price: z.number().min(0, 'Price must be non-negative').optional(),
  
  originalPrice: z.number().min(0, 'Original price must be non-negative').optional(),
  
  // Improved toolsUsed validation for updates
  toolsUsed: z.array(toolSchema)
    .optional()
    .refine((tools) => !tools || Array.isArray(tools), 'Tools used must be an array'),
  
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
  
  currentVersion: z.string().optional(),
  
  premiumContent: premiumContentSchema.optional()
})

export const getProductsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional(),
  
  type: z.enum([...Object.values(EProductType), 'all']).optional(),
  
  category: z.string()
    // .regex(/^[0-9a-fA-F]{24}$/, 'Category must be a valid ObjectId')
    .or(z.enum(['all']))
    .optional(),
  
  industry: z.string()
    // .regex(/^[0-9a-fA-F]{24}$/, 'Industry must be a valid ObjectId')
    .or(z.enum(['all']))
    .optional(),
  
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

// Schema for updating product status
export const updateProductStatusSchema = z.object({
  status: z.enum(Object.values(EProductStatusNew), {
    errorMap: () => ({ message: 'Status must be one of: draft, published, archived' })
  })
})

// Schema for submitting products for review
export const submitForReviewSchema = z.object({
    message: z.string().optional().refine((val) => !val || val.trim().length > 0, {
        message: "Message cannot be empty if provided"
    })
})

// Schema for purchasing a product
export const purchaseProductSchema = z.object({
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional()
})

// Schema for getting user purchases
export const getUserPurchasesSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').optional()
})