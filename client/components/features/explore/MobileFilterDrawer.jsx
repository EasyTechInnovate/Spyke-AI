import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronUp, ChevronDown, Star, CheckCircle2, DollarSign } from 'lucide-react'
import { useState, useCallback, useMemo } from 'react'

export default function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  categories,
  productTypes,
  industries,
  setupTimes,
  onFilterChange 
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

  // Toggle section with smooth animation
  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }, [])

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
      category: 'all',
      type: 'all',
      industry: 'all',
      setupTime: 'all',
      priceRange: [0, 1000],
      rating: 0,
      verifiedOnly: false,
      search: filters.search
    })
    // Close the drawer after clearing filters
    onClose()
  }, [filters.search, onFilterChange, onClose])

  const applyFiltersAndClose = useCallback(() => {
    onClose()
  }, [onClose])

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

  // Price range options
  const priceRangeOptions = [
    { label: 'Under $25', min: 0, max: 25 },
    { label: '$25 - $50', min: 25, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100+', min: 100, max: 1000 }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-full max-w-sm bg-[#1a1b2e] z-50 shadow-2xl flex flex-col lg:hidden"
          >
            <div className="flex-1 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 pt-6 border-b border-[#3a3b4d] flex-shrink-0">
                <h2 className="text-xl font-bold text-white">Filters</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Scrollable Content - Fixed height to prevent growing */}
              <div className="flex-1 overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(100vh - 160px)' }}>
                <div className="p-4 pb-6">
                  <div className="space-y-2">
                    {/* Product Type Filter */}
                    <MobileFilterSection
                      title="Product Type"
                      isExpanded={expandedSections.productType}
                      onToggle={() => toggleSection('productType')}
                    >
                      <div className="space-y-1">
                        {productTypes?.map(type => (
                          <MobileFilterOption
                            key={type.id}
                            label={type.name}
                            isSelected={filters.type === type.id}
                            onSelect={() => handleProductTypeChange(type.id)}
                            count={type.count || 8}
                          />
                        ))}
                      </div>
                    </MobileFilterSection>

                    {/* Category Filter */}
                    <MobileFilterSection
                      title="Category"
                      isExpanded={expandedSections.category}
                      onToggle={() => toggleSection('category')}
                    >
                      <div className="space-y-1">
                        {categories?.map(category => (
                          <MobileFilterOption
                            key={category.id}
                            label={category.name}
                            isSelected={filters.category === category.id}
                            onSelect={() => handleCategoryChange(category.id)}
                            count={category.count || 8}
                          />
                        ))}
                      </div>
                    </MobileFilterSection>

                    {/* Industry Filter */}
                    <MobileFilterSection
                      title="Industry"
                      isExpanded={expandedSections.industry}
                      onToggle={() => toggleSection('industry')}
                    >
                      <div className="space-y-1">
                        {industries?.map(industry => (
                          <MobileFilterOption
                            key={industry.id}
                            label={industry.name}
                            isSelected={filters.industry === industry.id}
                            onSelect={() => handleIndustryChange(industry.id)}
                            count={industry.count || 8}
                          />
                        ))}
                      </div>
                    </MobileFilterSection>

                    {/* Setup Time Filter */}
                    <MobileFilterSection
                      title="Setup Time"
                      isExpanded={expandedSections.setupTime}
                      onToggle={() => toggleSection('setupTime')}
                    >
                      <div className="space-y-1">
                        {setupTimes?.map(setupTime => (
                          <MobileFilterOption
                            key={setupTime.id}
                            label={setupTime.name}
                            isSelected={filters.setupTime === setupTime.id}
                            onSelect={() => handleSetupTimeChange(setupTime.id)}
                            count={setupTime.count || 8}
                          />
                        ))}
                      </div>
                    </MobileFilterSection>

                    {/* Price Range Filter */}
                    <MobileFilterSection
                      title="Price"
                      isExpanded={expandedSections.priceRange}
                      onToggle={() => toggleSection('priceRange')}
                    >
                      <div className="space-y-2">
                        {/* Custom Range Inputs */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              max={filters.priceRange?.[1] || 1000}
                              value={filters.priceRange?.[0] || 0}
                              onChange={(e) => handlePriceRangeChange([
                                parseInt(e.target.value) || 0,
                                filters.priceRange?.[1] || 1000
                              ])}
                              className="w-full pl-8 pr-3 py-2 bg-[#2a2b3d] border border-[#3a3b4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF89] transition-colors"
                              placeholder="Min"
                            />
                          </div>
                          <span className="text-gray-400">–</span>
                          <div className="flex-1 relative">
                            <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="number"
                              min={filters.priceRange?.[0] || 0}
                              value={filters.priceRange?.[1] || 1000}
                              onChange={(e) => handlePriceRangeChange([
                                filters.priceRange?.[0] || 0,
                                parseInt(e.target.value) || 1000
                              ])}
                              className="w-full pl-8 pr-3 py-2 bg-[#2a2b3d] border border-[#3a3b4d] rounded-lg text-white text-sm focus:outline-none focus:border-[#00FF89] transition-colors"
                              placeholder="Max"
                            />
                          </div>
                        </div>

                        {/* Quick Price Options */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handlePriceRangeChange([0, 0])}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              filters.priceRange?.[0] === 0 && filters.priceRange?.[1] === 0
                                ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                : 'bg-[#2a2b3d] text-gray-300 hover:bg-[#3a3b4d] border border-transparent hover:border-[#4a4b5d]'
                            }`}
                          >
                            Free
                          </button>
                          <button
                            onClick={() => handlePriceRangeChange([1, 20])}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              filters.priceRange?.[0] === 1 && filters.priceRange?.[1] === 20
                                ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                : 'bg-[#2a2b3d] text-gray-300 hover:bg-[#3a3b4d] border border-transparent hover:border-[#4a4b5d]'
                            }`}
                          >
                            Under $20
                          </button>
                          <button
                            onClick={() => handlePriceRangeChange([20, 50])}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              filters.priceRange?.[0] === 20 && filters.priceRange?.[1] === 50
                                ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                : 'bg-[#2a2b3d] text-gray-300 hover:bg-[#3a3b4d] border border-transparent hover:border-[#4a4b5d]'
                            }`}
                          >
                            $20 - $50
                          </button>
                          <button
                            onClick={() => handlePriceRangeChange([50, 1000])}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                              filters.priceRange?.[0] === 50 && filters.priceRange?.[1] === 1000
                                ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                : 'bg-[#2a2b3d] text-gray-300 hover:bg-[#3a3b4d] border border-transparent hover:border-[#4a4b5d]'
                            }`}
                          >
                            Over $50
                          </button>
                        </div>
                      </div>
                    </MobileFilterSection>

                    {/* Rating Filter */}
                    <MobileFilterSection
                      title="Rating"
                      isExpanded={expandedSections.rating}
                      onToggle={() => toggleSection('rating')}
                    >
                      <div className="space-y-1">
                        {[4, 3, 2, 1, 0].map(rating => (
                          <MobileRatingOption
                            key={rating}
                            rating={rating}
                            isSelected={filters.rating === rating}
                            onSelect={() => handleRatingChange(rating)}
                          />
                        ))}
                      </div>
                    </MobileFilterSection>

                    {/* Seller Filter */}
                    <MobileFilterSection
                      title="Seller"
                      isExpanded={expandedSections.seller}
                      onToggle={() => toggleSection('seller')}
                    >
                      <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2a2b3d] transition-colors cursor-pointer group">
                        <div className="relative flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={filters.verifiedOnly}
                            onChange={(e) => handleVerifiedChange(e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                            filters.verifiedOnly
                              ? 'bg-[#00FF89] border-[#00FF89]'
                              : 'bg-transparent border-gray-500 group-hover:border-gray-400'
                          }`}>
                            {filters.verifiedOnly && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-1">
                          <CheckCircle2 className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            Verified sellers only
                          </span>
                        </div>
                      </label>
                    </MobileFilterSection>
                  </div>
                </div>
              </div>

              {/* Footer Actions - Sticky at bottom */}
              <div className="flex-shrink-0 p-4 border-t border-[#3a3b4d] bg-[#1a1b2e]">
                <div className="flex gap-3">
                  <button
                    onClick={clearAllFilters}
                    className="flex-1 py-2.5 bg-[#FFC050] text-black rounded-xl font-bold hover:bg-[#FFC050]/90 transition-all duration-200"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={applyFiltersAndClose}
                    className="flex-1 py-2.5 bg-[#00FF89] text-black rounded-xl font-bold hover:bg-[#00FF89]/90 transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Mobile Filter Section Component
function MobileFilterSection({ title, children, isExpanded, onToggle }) {
  return (
    <div className="border-b border-[#3a3b4d] pb-3 last:border-b-0 last:pb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between mb-2 p-2 hover:bg-[#2a2b3d] rounded-lg transition-colors group"
      >
        <h3 className="font-semibold text-white text-base group-hover:text-[#00FF89] transition-colors">
          {title}
        </h3>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
        )}
      </button>
      
      {/* Simplified animation - more reliable */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <div className={isExpanded ? 'block' : 'hidden'}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}

// Generic Mobile Filter Option Component
function MobileFilterOption({ label, isSelected, onSelect, count }) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-gray-900/80 text-white border border-gray-700'
          : 'bg-[#2a2b3d] hover:bg-[#3a3b4d] text-gray-300 hover:text-white'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
        isSelected ? 'bg-gray-800 border-gray-800' : 'border-gray-500'
      }`}>
        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      <span className="flex-1 text-left font-medium text-sm">{label}</span>
      {count && (
        <span className="text-xs text-gray-400 bg-[#1a1b2e] px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </motion.button>
  )
}

// Mobile Rating Option Component
function MobileRatingOption({ rating, isSelected, onSelect }) {
  return (
    <motion.button
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-gray-900/80 text-white border border-gray-700'
          : 'bg-[#2a2b3d] hover:bg-[#3a3b4d] text-gray-300 hover:text-white'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
        isSelected ? 'bg-gray-800 border-gray-800' : 'border-gray-500'
      }`}>
        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
      </div>
      
      <div className="flex items-center gap-2 flex-1">
        {rating === 0 ? (
          <span className="font-medium text-sm">All ratings</span>
        ) : (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-600'
                }`}
              />
            ))}
            <span className="ml-1 font-medium text-sm">& up</span>
          </div>
        )}
      </div>
    </motion.button>
  )
}