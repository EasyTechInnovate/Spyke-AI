import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Grid3X3, List, ChevronDown } from 'lucide-react'
export default function ExploreControls({
    filters,
    viewMode,
    showFilters,
    onSearch,
    onViewModeChange,
    onToggleFilters,
    onToggleMobileFilters,
    sortId,
    sortOptions = [],
    onSortChange
}) {
    const hasActiveFilters =
        Object.keys(filters).filter(
            (k) =>
                (k === 'category' && filters[k] !== 'all') ||
                (k === 'type' && filters[k] !== 'all') ||
                (k === 'industry' && filters[k] !== 'all') ||
                (k === 'setupTime' && filters[k] !== 'all') ||
                (k === 'rating' && filters[k] > 0) ||
                (k === 'verifiedOnly' && filters[k]) ||
                (k === 'priceRange' && (filters[k][0] > 0 || filters[k][1] < 1000))
        ).length > 0
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search products, prompts, tools..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent hover:border-gray-700 transition-all"
                        aria-label="Search products"
                    />
                </div>
                <div className="flex gap-2 items-stretch">
                    <button
                        onClick={onToggleMobileFilters}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors"
                        aria-label="Open filters">
                        <Filter className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 bg-brand-primary rounded-full" />}
                    </button>
                    <button
                        onClick={onToggleFilters}
                        className="hidden lg:flex items-center gap-2 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition-colors h-12"
                        aria-label="Toggle filters panel">
                        <SlidersHorizontal className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>
                    <div className="relative flex items-center bg-gray-900 rounded-xl h-12 px-3 focus-within:ring-2 focus-within:ring-brand-primary/40 transition-colors">
                        <label
                            htmlFor="sort"
                            className="sr-only">
                            Sort
                        </label>
                        <select
                            id="sort"
                            value={sortId || ''}
                            onChange={(e) => onSortChange?.(e.target.value)}
                            className="unstyled-select bg-transparent appearance-none border-none outline-none ring-0 focus:outline-none focus:ring-0 text-sm text-gray-300 hover:text-white pr-8">
                            {sortOptions.map((opt) => (
                                <option
                                    key={opt.id}
                                    value={opt.id}
                                    className="bg-gray-900 text-gray-300">
                                    {opt.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 h-12">
                        <button
                            onClick={() => onViewModeChange('grid')}
                            aria-label="Grid view"
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'grid' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}>
                            <Grid3X3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onViewModeChange('list')}
                            aria-label="List view"
                            className={`p-2 rounded-lg transition-colors ${
                                viewMode === 'list' ? 'bg-brand-primary text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
