import { Star, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { MOCK_PRODUCTS } from './mockProducts'

export const CATEGORIES = [
  { id: 'all', name: 'All Products', count: MOCK_PRODUCTS.length },
  { id: 'prompts', name: 'Prompts', count: 4 },
  { id: 'tools', name: 'Tools', count: 3 },
  { id: 'templates', name: 'Templates', count: 2 }
]

export const SORT_OPTIONS = [
  { id: 'featured', name: 'Featured', icon: Star },
  { id: 'newest', name: 'Newest First', icon: Clock },
  { id: 'price-low', name: 'Price: Low to High', icon: DollarSign },
  { id: 'price-high', name: 'Price: High to Low', icon: DollarSign },
  { id: 'rating', name: 'Highest Rated', icon: Star },
  { id: 'popular', name: 'Most Popular', icon: TrendingUp }
]

export const ITEMS_PER_PAGE = 12

export const DEFAULT_FILTERS = {
  category: 'all',
  priceRange: [0, 200],
  rating: 0,
  verified: false,
  search: ''
}