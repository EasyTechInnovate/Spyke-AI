import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORIES } from '@/data/explore/constants'

export default function ActiveFilters({ filters, onFilterChange }) {
  const hasActiveFilters = filters.category !== 'all' || 
    filters.rating > 0 || 
    filters.verified || 
    filters.search

  if (!hasActiveFilters) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        {filters.category !== 'all' && (
          <FilterBadge
            label={CATEGORIES.find(c => c.id === filters.category)?.name}
            onRemove={() => onFilterChange({ ...filters, category: 'all' })}
          />
        )}
        
        {filters.rating > 0 && (
          <FilterBadge
            label={`${filters.rating}+ stars`}
            onRemove={() => onFilterChange({ ...filters, rating: 0 })}
          />
        )}
        
        {filters.verified && (
          <FilterBadge
            label="Verified sellers"
            onRemove={() => onFilterChange({ ...filters, verified: false })}
          />
        )}
        
        {filters.search && (
          <FilterBadge
            label={`Search: ${filters.search}`}
            onRemove={() => onFilterChange({ ...filters, search: '' })}
          />
        )}
        
        <button
          onClick={() => onFilterChange({
            category: 'all',
            priceRange: [0, 200],
            rating: 0,
            verified: false,
            search: ''
          })}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear all
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function FilterBadge({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-brand-primary/30 rounded-full p-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  )
}