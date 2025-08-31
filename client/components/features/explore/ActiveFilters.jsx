import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { CATEGORIES, PRODUCT_TYPES, INDUSTRIES, SETUP_TIMES } from '@/data/explore/constants'

export default function ActiveFilters({ filters, onFilterChange }) {
    const hasActiveFilters = filters.category !== 'all' || 
        filters.type !== 'all' || 
        filters.industry !== 'all' || 
        filters.setupTime !== 'all' || 
        filters.rating > 0 || 
        filters.verifiedOnly || 
        filters.search ||
        (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000))

    if (!hasActiveFilters) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-6">
                {filters.category !== 'all' && (
                    <FilterBadge
                        label={CATEGORIES.find((c) => c.id === filters.category)?.name || filters.category}
                        onRemove={() => onFilterChange({ ...filters, category: 'all' })}
                    />
                )}

                {filters.type !== 'all' && (
                    <FilterBadge
                        label={PRODUCT_TYPES.find((t) => t.id === filters.type)?.name || filters.type}
                        onRemove={() => onFilterChange({ ...filters, type: 'all' })}
                    />
                )}

                {filters.industry !== 'all' && (
                    <FilterBadge
                        label={INDUSTRIES.find((i) => i.id === filters.industry)?.name || filters.industry}
                        onRemove={() => onFilterChange({ ...filters, industry: 'all' })}
                    />
                )}

                {filters.setupTime !== 'all' && (
                    <FilterBadge
                        label={SETUP_TIMES.find((s) => s.id === filters.setupTime)?.name || filters.setupTime}
                        onRemove={() => onFilterChange({ ...filters, setupTime: 'all' })}
                    />
                )}

                {filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
                    <FilterBadge
                        label={`Price: $${filters.priceRange[0]}-$${filters.priceRange[1]}`}
                        onRemove={() => onFilterChange({ ...filters, priceRange: [0, 1000] })}
                    />
                )}

                {filters.rating > 0 && (
                    <FilterBadge
                        label={`${filters.rating}+ stars`}
                        onRemove={() => onFilterChange({ ...filters, rating: 0 })}
                    />
                )}

                {filters.verifiedOnly && (
                    <FilterBadge
                        label="Verified sellers"
                        onRemove={() => onFilterChange({ ...filters, verifiedOnly: false })}
                    />
                )}

                {filters.search && (
                    <FilterBadge
                        label={`Search: ${filters.search}`}
                        onRemove={() => onFilterChange({ ...filters, search: '' })}
                    />
                )}

                <button
                    onClick={() =>
                        onFilterChange({
                            category: 'all',
                            type: 'all',
                            industry: 'all',
                            setupTime: 'all',
                            priceRange: [0, 1000],
                            rating: 0,
                            verifiedOnly: false,
                            search: ''
                        })
                    }
                    className="text-sm text-gray-400 hover:text-white transition-colors">
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
                className="hover:bg-brand-primary/30 rounded-full p-0.5">
                <X className="w-3 h-3" />
            </button>
        </span>
    )
}
