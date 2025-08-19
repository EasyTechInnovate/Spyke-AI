import { Star, TrendingUp, Clock, DollarSign, Zap, Timer, Code2, Package } from 'lucide-react'

// Backend-aligned categories (only what backend actually supports)
export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: Package },
  { id: 'lead_generation', name: 'Lead Generation', icon: Zap },
  { id: 'content_creation', name: 'Content Creation', icon: Code2 },
  { id: 'ecommerce', name: 'E-commerce', icon: Package }
]

// Product types from backend (only what backend actually supports)
export const PRODUCT_TYPES = [
  { id: 'all', name: 'All Types' },
  { id: 'automation', name: 'Automation', icon: Zap },
  { id: 'prompt', name: 'AI Prompts', icon: Code2 },
  { id: 'template', name: 'Templates', icon: Star }
]

// Industries from backend (only what backend actually supports)
export const INDUSTRIES = [
  { id: 'all', name: 'All Industries' },
  { id: 'saas', name: 'SaaS' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'real_estate', name: 'Real Estate' }
]

// Setup time options from backend (only what backend actually supports)
export const SETUP_TIMES = [
  { id: 'all', name: 'Any Setup Time' },
  { id: 'instant', name: 'Instant', icon: Zap },
  { id: 'under_30_mins', name: 'Under 30 mins', icon: Timer },
  { id: 'under_1_hour', name: 'Under 1 hour', icon: Clock }
]

// Enhanced sort options aligned with backend
export const SORT_OPTIONS = [
  { id: 'newest', name: 'Newest First', icon: Clock, sortBy: 'createdAt', sortOrder: 'desc' },
  { id: 'popular', name: 'Most Popular', icon: TrendingUp, sortBy: 'popularity', sortOrder: 'desc' },
  { id: 'rating', name: 'Highest Rated', icon: Star, sortBy: 'rating', sortOrder: 'desc' },
  { id: 'price-low', name: 'Price: Low to High', icon: DollarSign, sortBy: 'price', sortOrder: 'asc' },
  { id: 'price-high', name: 'Price: High to Low', icon: DollarSign, sortBy: 'price', sortOrder: 'desc' },
  { id: 'sales', name: 'Best Selling', icon: TrendingUp, sortBy: 'sales', sortOrder: 'desc' }
]

export const ITEMS_PER_PAGE = 12

// Enhanced default filters with new options
export const DEFAULT_FILTERS = {
  category: 'all',
  type: 'all',
  industry: 'all',
  setupTime: 'all',
  priceRange: [0, 200],
  rating: 0,
  verified: false,
  search: ''
}