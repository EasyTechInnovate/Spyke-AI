import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Star, CheckCircle2, X, DollarSign } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@/lib/design-system'
import { cn } from '@/lib/utils'
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_TYPES, 
  PRODUCT_INDUSTRIES, 
  PRODUCT_SETUP_TIMES,
  PRODUCT_PRICE_CATEGORIES,
  DEFAULT_FILTERS 
} from '@/lib/constants/filterMappings'

export default function FilterSidebar({ 
  filters, 
  onFilterChange,
  productCounts = {},
  className
}) {
  const [expandedSections, setExpandedSections] = useState({
    productType: true,
    category: true,
    industry: true,
    setupTime: true,
    priceRange: true,
    rating: true,
    seller: true
  })

  // Enhanced filter handlers for all filter types
  const handleProductTypeChange = useCallback((typeId) => {
    onFilterChange({ ...filters, type: typeId })
  }, [filters, onFilterChange])

  const handleCategoryChange = useCallback((categoryId) => {
    onFilterChange({ ...filters, category: categoryId })
  }, [filters, onFilterChange])

  const handleIndustryChange = useCallback((industryId) => {
    onFilterChange({ ...filters, industry: industryId })
  }, [filters, onFilterChange])

  const handleSetupTimeChange = useCallback((setupTimeId) => {
    onFilterChange({ ...filters, setupTime: setupTimeId })
  }, [filters, onFilterChange])

  const handlePriceRangeChange = useCallback((range) => {
    onFilterChange({ ...filters, priceRange: range })
  }, [filters, onFilterChange])

  const handleRatingChange = useCallback((rating) => {
    onFilterChange({ ...filters, rating })
  }, [filters, onFilterChange])

  const handleVerifiedChange = useCallback((checked) => {
    onFilterChange({ ...filters, verifiedOnly: checked })
  }, [filters, onFilterChange])

  const clearAllFilters = useCallback(() => {
    onFilterChange({
      ...DEFAULT_FILTERS,
      search: filters.search
    })
  }, [filters.search, onFilterChange])

  // Toggle section with smooth animation
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => 
    filters.category !== 'all' ||
    filters.type !== 'all' ||
    filters.industry !== 'all' ||
    filters.setupTime !== 'all' ||
    filters.rating > 0 ||
    filters.verifiedOnly ||
    (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000))
  , [filters])

  const priceRangeOptions = PRODUCT_PRICE_CATEGORIES.map(option => ({
    ...option,
    count: productCounts.priceRanges?.[option.id] || 0
  }))

  return (
    <motion.aside 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-72 bg-[#171717] border border-gray-800 rounded-xl sticky top-1",
        "max-h-[calc(100vh-1rem)] overflow-hidden flex flex-col shadow-xl",
        className
      )}
    >
      {/* Compact Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-400 hover:text-white h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Clear
          </Button>
        )}
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="p-4 space-y-4">
          {/* Product Type Filter */}
          <FilterSection
            title="Product Type"
            isExpanded={expandedSections.productType}
            onToggle={() => toggleSection('productType')}
            count={PRODUCT_TYPES.length}
          >
            <div className="space-y-1">
              {PRODUCT_TYPES.slice(0, expandedSections.productType ? undefined : 4).map(type => (
                <FilterOption
                  key={type.id}
                  label={type.name}
                  isSelected={filters.type === type.id}
                  onSelect={() => handleProductTypeChange(type.id)}
                  count={productCounts.productTypes?.[type.id] || 0}
                />
              ))}
              {!expandedSections.productType && PRODUCT_TYPES.length > 4 && (
                <button
                  onClick={() => toggleSection('productType')}
                  className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors"
                >
                  +{PRODUCT_TYPES.length - 4} more
                </button>
              )}
            </div>
          </FilterSection>

          {/* Category Filter */}
          <FilterSection
            title="Category"
            isExpanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
            count={PRODUCT_CATEGORIES.length}
          >
            <div className="space-y-1">
              {PRODUCT_CATEGORIES.slice(0, expandedSections.category ? undefined : 4).map(category => (
                <FilterOption
                  key={category.id}
                  label={category.name}
                  isSelected={filters.category === category.id}
                  onSelect={() => handleCategoryChange(category.id)}
                  count={productCounts.categories?.[category.id] || 0}
                />
              ))}
              {!expandedSections.category && PRODUCT_CATEGORIES.length > 4 && (
                <button
                  onClick={() => toggleSection('category')}
                  className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors"
                >
                  +{PRODUCT_CATEGORIES.length - 4} more
                </button>
              )}
            </div>
          </FilterSection>

          {/* Price Filter */}
          <FilterSection
            title="Price"
            isExpanded={expandedSections.priceRange}
            onToggle={() => toggleSection('priceRange')}
          >
            <div className="space-y-2">
              <div className="space-y-1">
                {PRODUCT_PRICE_CATEGORIES.map(option => (
                  <FilterOption
                    key={option.id}
                    label={option.name}
                    isSelected={filters.priceRange?.[0] === option.min && filters.priceRange?.[1] === option.max}
                    onSelect={() => handlePriceRangeChange([option.min, option.max])}
                    count={productCounts.priceRanges?.[option.id] || 0}
                  />
                ))}
              </div>
              
              {/* Compact Custom Price Range */}
              {expandedSections.priceRange && (
                <div className="pt-2 border-t border-gray-800">
                  <p className="text-xs text-gray-400 mb-2">Custom Range</p>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min="0"
                        max={filters.priceRange?.[1] || 1000}
                        value={filters.priceRange?.[0] || 0}
                        onChange={(e) => handlePriceRangeChange([
                          parseInt(e.target.value) || 0,
                          filters.priceRange?.[1] || 1000
                        ])}
                        placeholder="Min"
                        className="w-full pl-6 pr-2 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#00FF89] transition-colors"
                      />
                    </div>
                    <span className="text-gray-400 text-xs">–</span>
                    <div className="relative flex-1">
                      <DollarSign className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min={filters.priceRange?.[0] || 0}
                        value={filters.priceRange?.[1] || 1000}
                        onChange={(e) => handlePriceRangeChange([
                          filters.priceRange?.[0] || 0,
                          parseInt(e.target.value) || 1000
                        ])}
                        placeholder="Max"
                        className="w-full pl-6 pr-2 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#00FF89] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </FilterSection>

          {/* Rating Filter */}
          <FilterSection
            title="Rating"
            isExpanded={expandedSections.rating}
            onToggle={() => toggleSection('rating')}
          >
            <div className="space-y-1">
              {[4, 3, 2, 1, 0].map(rating => (
                <RatingOption
                  key={rating}
                  rating={rating}
                  isSelected={filters.rating === rating}
                  onSelect={() => handleRatingChange(rating)}
                  count={productCounts.ratings?.[rating] || 0}
                />
              ))}
            </div>
          </FilterSection>

          {/* Industry Filter - Collapsed by default */}
          <FilterSection
            title="Industry"
            isExpanded={expandedSections.industry}
            onToggle={() => toggleSection('industry')}
            count={PRODUCT_INDUSTRIES.length}
          >
            <div className="space-y-1">
              {PRODUCT_INDUSTRIES.slice(0, expandedSections.industry ? undefined : 3).map(industry => (
                <FilterOption
                  key={industry.id}
                  label={industry.name}
                  isSelected={filters.industry === industry.id}
                  onSelect={() => handleIndustryChange(industry.id)}
                  count={productCounts.industries?.[industry.id] || 0}
                />
              ))}
              {!expandedSections.industry && PRODUCT_INDUSTRIES.length > 3 && (
                <button
                  onClick={() => toggleSection('industry')}
                  className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors"
                >
                  +{PRODUCT_INDUSTRIES.length - 3} more
                </button>
              )}
            </div>
          </FilterSection>

          {/* Setup Time Filter - Collapsed by default */}
          <FilterSection
            title="Setup Time"
            isExpanded={expandedSections.setupTime}
            onToggle={() => toggleSection('setupTime')}
            count={PRODUCT_SETUP_TIMES.length}
          >
            <div className="space-y-1">
              {PRODUCT_SETUP_TIMES.slice(0, expandedSections.setupTime ? undefined : 3).map(setupTime => (
                <FilterOption
                  key={setupTime.id}
                  label={setupTime.name}
                  isSelected={filters.setupTime === setupTime.id}
                  onSelect={() => handleSetupTimeChange(setupTime.id)}
                  count={productCounts.setupTimes?.[setupTime.id] || 0}
                />
              ))}
              {!expandedSections.setupTime && PRODUCT_SETUP_TIMES.length > 3 && (
                <button
                  onClick={() => toggleSection('setupTime')}
                  className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors"
                >
                  +{PRODUCT_SETUP_TIMES.length - 3} more
                </button>
              )}
            </div>
          </FilterSection>

          {/* Seller Filter - Collapsed by default */}
          <FilterSection
            title="Seller"
            isExpanded={expandedSections.seller}
            onToggle={() => toggleSection('seller')}
          >
            <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group">
              <div className="relative flex-shrink-0">
                <input
                  type="checkbox"
                  checked={filters.verifiedOnly}
                  onChange={(e) => handleVerifiedChange(e.target.checked)}
                  className="sr-only"
                />
                <div className={cn(
                  "w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center",
                  filters.verifiedOnly
                    ? "bg-[#00FF89] border-[#00FF89]"
                    : "bg-transparent border-gray-500 group-hover:border-gray-400"
                )}>
                  {filters.verifiedOnly && (
                    <CheckCircle2 className="w-2.5 h-2.5 text-black" />
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <CheckCircle2 className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                  Verified only
                </span>
                {(productCounts.verified || 0) > 0 && (
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full flex-shrink-0">
                    {productCounts.verified}
                  </span>
                )}
              </div>
            </label>
          </FilterSection>
        </div>
      </div>
    </motion.aside>
  )
}

// Professional Filter Section Component with proper accessibility
function FilterSection({ title, children, isExpanded, onToggle, count }) {
  const sectionId = `filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`
  const contentId = `${sectionId}-content`

  return (
    <section className="border-b border-gray-800 pb-3 last:border-b-0">
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="w-full flex items-center justify-between p-2 hover:bg-gray-800/50 transition-colors rounded-lg group focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-opacity-50"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-white group-hover:text-[#00FF89] transition-colors">
            {title}
          </h3>
          {count > 0 && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
        )}
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden mt-2"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// Professional Filter Option Component with proper states
function FilterOption({ label, isSelected, onSelect, count, className }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
        "focus:outline-none",
        isSelected
          ? "bg-[#00FF89]/15 text-white"
          : "hover:bg-gray-800/50 text-gray-300 hover:text-white",
        className
      )}
      aria-pressed={isSelected}
    >
      <div className={cn(
        "w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 flex items-center justify-center",
        isSelected 
          ? "bg-[#00FF89] border-[#00FF89]" 
          : "border-gray-500 hover:border-gray-400"
      )}>
        {isSelected && (
          <div className="w-1.5 h-1.5 bg-black rounded-full" />
        )}
      </div>
      <span className="flex-1 text-left text-sm truncate font-medium">
        {label}
      </span>
      {count > 0 && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium",
          isSelected
            ? "bg-[#00FF89]/20 text-[#00FF89]"
            : "bg-gray-800 text-gray-400"
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

// Professional Rating Option Component
function RatingOption({ rating, isSelected, onSelect, count }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-opacity-50",
        isSelected
          ? "bg-gray-900/80 border border-gray-700 text-white hover:bg-gray-900"
          : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
      )}
      aria-pressed={isSelected}
    >
      <div className={cn(
        "w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 flex items-center justify-center",
        isSelected 
          ? "bg-gray-800 border-gray-800" 
          : "border-gray-500 hover:border-gray-400"
      )}>
        {isSelected && (
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {rating === 0 ? (
          <span className="text-sm font-medium">All ratings</span>
        ) : (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3 flex-shrink-0",
                    i < rating
                      ? "text-yellow-400 fill-current"
                      : "text-gray-600"
                  )}
                />
              ))}
            </div>
            <span className="text-xs font-medium whitespace-nowrap">& up</span>
          </div>
        )}
      </div>
      
      {count > 0 && (
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium",
          isSelected
            ? "bg-gray-800/50 text-gray-300"
            : "bg-gray-800 text-gray-400"
        )}>
          {count}
        </span>
      )}
    </button>
  )
}
