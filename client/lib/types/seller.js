import { z } from 'zod'

export const VerificationStatusEnum = z.enum([
  'pending',
  'under_review',
  'commission_offered',
  'approved',
  'rejected'
])

export const CommissionStatusEnum = z.enum([
  'pending',
  'counter_offered',
  'accepted',
  'rejected'
])

export const CommissionHistoryItemSchema = z.object({
  id: z.string().optional(),
  by: z.enum(['admin', 'seller']).optional(),
  type: z.enum(['offer', 'counter', 'accepted', 'rejected']).optional(),
  rate: z.number().min(0).max(100).optional(),
  reason: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  status: z.string().optional(),
  message: z.string().optional()
})

export const CommissionOfferSchema = z.object({
  rate: z.number().min(0).max(100),
  status: CommissionStatusEnum.optional(),
  negotiationRound: z.number().int().min(0).max(10).optional(),
  offeredAt: z.string().datetime().optional(),
  acceptedAt: z.string().datetime().optional(),
  rejectedAt: z.string().datetime().optional(),
  rejectionReason: z.string().optional(),
  lastOfferedBy: z.enum(['admin','seller']).optional(),
  counterOffer: z.object({
    rate: z.number().min(0).max(100),
    reason: z.string(),
    submittedAt: z.string().datetime().optional()
  }).optional(),
  history: z.array(CommissionHistoryItemSchema).optional()
})

export const SellerStatsSchema = z.object({
  totalEarnings: z.number().optional(),
  totalSales: z.number().optional(),
  totalProducts: z.number().optional(),
  averageRating: z.number().optional(),
  profileViews: z.number().optional()
})

export const SellerProfileSchema = z.object({
  fullName: z.string(),
  bio: z.string().optional(),
  email: z.string().email(),
  websiteUrl: z.string().url().optional().or(z.literal('')),
  location: z.object({ country: z.string().optional() }).optional(),
  niches: z.array(z.string()).optional().default([]),
  toolsSpecialization: z.array(z.string()).optional().default([]),
  verification: z.object({
    status: VerificationStatusEnum,
    submittedAt: z.string().datetime().optional(),
    rejectionReason: z.string().optional()
  }).optional(),
  commissionOffer: CommissionOfferSchema.optional(),
  payoutInfo: z.object({
    method: z.string().optional().default(''),
    isVerified: z.boolean().optional(),
    paypalEmail: z.string().email().optional()
  }).optional(),
  settings: z.object({
    emailNotifications: z.boolean().optional(),
    marketingEmails: z.boolean().optional(),
    autoApproveProducts: z.boolean().optional()
  }).optional(),
  stats: SellerStatsSchema.optional()
})

export const parseSellerProfile = (data) => {
  if (!data || typeof data !== 'object') return null
  const cloned = JSON.parse(JSON.stringify(data))

  // Normalize arrays (backend may send null)
  if (!Array.isArray(cloned.niches)) cloned.niches = []
  if (!Array.isArray(cloned.toolsSpecialization)) cloned.toolsSpecialization = []

  // Clean stats: remove null numeric fields
  if (cloned.stats && typeof cloned.stats === 'object') {
    for (const k of Object.keys(cloned.stats)) {
      if (cloned.stats[k] == null) delete cloned.stats[k]
    }
  }

  // Clean payoutInfo/settings/verification if null
  if (cloned.payoutInfo == null) cloned.payoutInfo = {}
  if (cloned.settings == null) cloned.settings = {}
  if (cloned.verification == null || typeof cloned.verification !== 'object') {
    cloned.verification = { status: 'pending' }
  } else if (!['pending','under_review','commission_offered','approved','rejected'].includes(cloned.verification.status)) {
    cloned.verification.status = 'pending'
  }

  // Backend sometimes returns an empty or invalid commissionOffer/counterOffer
  if (cloned?.commissionOffer && typeof cloned.commissionOffer === 'object') {
    const co = cloned.commissionOffer
    if (co.rate == null || typeof co.rate !== 'number' || Number.isNaN(co.rate)) {
      // Entire offer invalid -> drop it
      delete cloned.commissionOffer
    } else {
      // Validate counterOffer
      if (co.counterOffer) {
        const c = co.counterOffer
        const invalidRate = c.rate == null || typeof c.rate !== 'number' || Number.isNaN(c.rate)
        const invalidReason = c.reason == null || typeof c.reason !== 'string' || c.reason.trim() === ''
        if (invalidRate || invalidReason) delete co.counterOffer
      }
    }
  }

  // Location normalization
  if (cloned.location && typeof cloned.location === 'object') {
    if (cloned.location.country == null) delete cloned.location.country
  }

  let result = SellerProfileSchema.safeParse(cloned)
  if (result.success) return result.data

  // Build a minimal fallback instead of returning null so UI still works
  const fallback = {
    fullName: typeof cloned.fullName === 'string' ? cloned.fullName : 'Seller',
    email: typeof cloned.email === 'string' ? cloned.email : 'unknown@example.com',
    bio: typeof cloned.bio === 'string' ? cloned.bio : undefined,
    websiteUrl: typeof cloned.websiteUrl === 'string' ? cloned.websiteUrl : '',
    location: cloned.location && typeof cloned.location === 'object' ? { country: cloned.location.country } : {},
    niches: cloned.niches,
    toolsSpecialization: cloned.toolsSpecialization,
    verification: cloned.verification,
    commissionOffer: cloned.commissionOffer,
    payoutInfo: cloned.payoutInfo,
    settings: cloned.settings,
    stats: cloned.stats
  }
  const secondTry = SellerProfileSchema.safeParse(fallback)
  if (secondTry.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('SellerProfile validation recovered with fallback', result.error.flatten())
    }
    return secondTry.data
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn('SellerProfile validation failed, returning null', result.error.flatten())
  }
  return null
}