import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, ChevronDown, Grid3X3, List } from 'lucide-react'
import { SORT_OPTIONS } from '@/data/explore/constants'

export default function ExploreControls({
    filters,
    sortBy,
    viewMode,
    showFilters,
    onSearch,
    onSortChange,
    onViewModeChange,
    onToggleFilters,
    onToggleMobileFilters
}) {
    const hasActiveFilters =
        Object.keys(filters).filter(
            (k) => (k === 'category' && filters[k] !== 'all') || (k === 'rating' && filters[k] > 0) || (k === 'verified' && filters[k])
        ).length > 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search products, prompts, tools..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent hover:border-gray-700 transition-all"
                    />
                </div>

                <div className="flex gap-2">
                    {/* Mobile Filter Button */}
                    <button
                        onClick={onToggleMobileFilters}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-brand-primary rounded-full" />}
                    </button>

                    {/* Desktop Filter Toggle */}
                    <button
                        onClick={onToggleFilters}
                        className="hidden lg:flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors h-12">
                        <SlidersHorizontal className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => onSortChange(e.target.value)}
                            className="appearance-none px-4 py-3 pr-10 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors cursor-pointer h-12">
                            {SORT_OPTIONS.map((option) => (
                                <option
                                    key={option.id}
                                    value={option.id}>
                                    {option.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
