import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { PRODUCT_TYPES } from '@/lib/constants/filterMappings'
import { categoryAPI, industryAPI } from '@/lib/api/toolsNiche'

export default function ActiveFilters({ filters, onFilterChange }) {
    const [categories, setCategories] = useState([])
    const [industries, setIndustries] = useState([])

    // Fetch categories to get proper names
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryAPI.getCategories()
                let categoriesData = response?.data?.categories || response?.categories || response?.data || []
                
                if (!Array.isArray(categoriesData)) {
                    categoriesData = []
                }

                const formattedCategories = categoriesData.map(cat => ({
                    id: cat._id || cat.id,
                    name: cat.name || cat.title,
                    isActive: cat.isActive !== false
                })).filter(cat => cat.isActive)

                setCategories(formattedCategories)
            } catch (error) {
                console.error('Failed to fetch categories:', error)
                setCategories([])
            }
        }

        fetchCategories()
    }, [])

    // Fetch industries to get proper names
    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                const response = await industryAPI.getIndustries()
                let industriesData = response?.data?.industries || response?.industries || response?.data || []
                
                if (!Array.isArray(industriesData)) {
                    industriesData = []
                }

                const formattedIndustries = industriesData.map(ind => ({
                    id: ind._id || ind.id,
                    name: ind.name || ind.title,
                    isActive: ind.isActive !== false
                })).filter(ind => ind.isActive)

                setIndustries(formattedIndustries)
            } catch (error) {
                console.error('Failed to fetch industries:', error)
                setIndustries([])
            }
        }

        fetchIndustries()
    }, [])

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
                        label={categories.find((c) => c.id === filters.category)?.name || filters.category}
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
                        label={industries.find((i) => i.id === filters.industry)?.name || filters.industry}
                        onRemove={() => onFilterChange({ ...filters, industry: 'all' })}
                    />
                )}
                {filters.setupTime !== 'all' && (
                    <FilterBadge
                        label={filters.setupTime}
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
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-800/50 hover:bg-gray-700 text-white hover:text-red-400 border border-gray-700 hover:border-red-400/50 rounded-full text-sm font-medium transition-all duration-200"
                    aria-label="Clear all active filters">
                    <X className="w-3 h-3" aria-hidden="true" />
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
                aria-label={`Remove ${label} filter`}>
                <X className="w-3 h-3" aria-hidden="true" />
            </button>
        </span>
    )
}