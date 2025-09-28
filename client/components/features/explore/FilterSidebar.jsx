import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, Star, CheckCircle2, X, DollarSign } from 'lucide-react'
import { useState, useCallback, useMemo, useEffect } from 'react'
import { Button } from '@/lib/design-system'
import { cn } from '@/lib/utils'
import { PRODUCT_TYPES, PRODUCT_SETUP_TIMES, PRODUCT_PRICE_CATEGORIES, DEFAULT_FILTERS } from '@/lib/constants/filterMappings'
import { categoryAPI, industryAPI } from '@/lib/api/toolsNiche'

export default function FilterSidebar({ filters, onFilterChange, productCounts = {}, className }) {
    const [categories, setCategories] = useState([])
    const [loadingCategories, setLoadingCategories] = useState(true)
    const [industries, setIndustries] = useState([])
    const [loadingIndustries, setLoadingIndustries] = useState(true)
    const [expandedSections, setExpandedSections] = useState({
        productType: true,
        category: true,
        industry: true,
        setupTime: true,
        priceRange: true,
        rating: true,
        seller: true
    })

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoadingCategories(true)
                const response = await categoryAPI.getCategories()

                let categoriesData = response?.data?.categories || response?.categories || response?.data || []

                if (!Array.isArray(categoriesData)) {
                    categoriesData = []
                }

                const formattedCategories = categoriesData
                    .map((cat) => ({
                        id: cat._id || cat.id,
                        name: cat.name || cat.title,
                        icon: cat.icon || 'Package',
                        productCount: cat.productCount || 0,
                        isActive: cat.isActive !== false
                    }))
                    .filter((cat) => cat.isActive)

                setCategories(formattedCategories)
            } catch (error) {
                console.error('Failed to fetch categories:', error)
                setCategories([])
            } finally {
                setLoadingCategories(false)
            }
        }

        fetchCategories()
    }, [])

    useEffect(() => {
        const fetchIndustries = async () => {
            try {
                setLoadingIndustries(true)
                const response = await industryAPI.getIndustries()

                let industriesData = response?.data?.industries || response?.industries || response?.data || []

                if (!Array.isArray(industriesData)) {
                    industriesData = []
                }

                const formattedIndustries = industriesData
                    .map((ind) => ({
                        id: ind._id || ind.id,
                        name: ind.name || ind.title,
                        icon: ind.icon || 'Building',
                        productCount: ind.productCount || 0,
                        isActive: ind.isActive !== false
                    }))
                    .filter((ind) => ind.isActive)

                setIndustries(formattedIndustries)
            } catch (error) {
                console.error('Failed to fetch industries:', error)
                setIndustries([])
            } finally {
                setLoadingIndustries(false)
            }
        }

        fetchIndustries()
    }, [])

    const handleProductTypeChange = useCallback(
        (typeId) => {
            onFilterChange({ ...filters, type: typeId })
        },
        [filters, onFilterChange]
    )
    const handleCategoryChange = useCallback(
        (categoryId) => {
            onFilterChange({ ...filters, category: categoryId })
        },
        [filters, onFilterChange]
    )
    const handleIndustryChange = useCallback(
        (industryId) => {
            onFilterChange({ ...filters, industry: industryId })
        },
        [filters, onFilterChange]
    )
    const handleSetupTimeChange = useCallback(
        (setupTimeId) => {
            onFilterChange({ ...filters, setupTime: setupTimeId })
        },
        [filters, onFilterChange]
    )
    const handlePriceRangeChange = useCallback(
        (range) => {
            onFilterChange({ ...filters, priceRange: range })
        },
        [filters, onFilterChange]
    )
    const handleRatingChange = useCallback(
        (rating) => {
            onFilterChange({ ...filters, rating })
        },
        [filters, onFilterChange]
    )
    const handleVerifiedChange = useCallback(
        (checked) => {
            onFilterChange({ ...filters, verifiedOnly: checked })
        },
        [filters, onFilterChange]
    )
    const clearAllFilters = useCallback(() => {
        onFilterChange({
            ...DEFAULT_FILTERS,
            search: filters.search
        })
    }, [filters.search, onFilterChange])
    const toggleSection = useCallback((section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section]
        }))
    }, [])
    const hasActiveFilters = useMemo(
        () =>
            filters.category !== 'all' ||
            filters.type !== 'all' ||
            filters.industry !== 'all' ||
            filters.setupTime !== 'all' ||
            filters.rating > 0 ||
            filters.verifiedOnly ||
            (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)),
        [filters]
    )
    const priceRangeOptions = PRODUCT_PRICE_CATEGORIES.map((option) => ({
        ...option,
        count: productCounts.priceRanges?.[option.id] || 0
    }))
    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                'w-72 bg-[#171717] border border-gray-800 rounded-xl sticky top-4',
                'h-fit max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col shadow-xl',
                className
            )}>
            <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0 bg-[#171717] relative z-10">
                <h2 className="text-lg font-bold text-white">Filters</h2>
            </header>
            <div
                className="flex-1 overflow-y-auto overflow-x-hidden"
                style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#4b5563 #1f2937'
                }}>
                <div className="p-4 space-y-4 pb-6">
                    {/* Product Type Filter - Ensure header is always visible */}
                    <div className="border-b border-gray-800 pb-3">
                        <button
                            onClick={() => toggleSection('productType')}
                            className="w-full flex items-center justify-between p-2 hover:bg-gray-800/50 transition-colors rounded-lg group focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-opacity-50">
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-white group-hover:text-[#00FF89] transition-colors">Product Type</h3>
                                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{PRODUCT_TYPES.length}</span>
                            </div>
                            {expandedSections.productType ? (
                                <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-[#00FF89] transition-colors" />
                            )}
                        </button>

                        <AnimatePresence initial={false}>
                            {expandedSections.productType && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden mt-2">
                                    <div className="space-y-1">
                                        {PRODUCT_TYPES.map((type) => (
                                            <FilterOption
                                                key={type.id}
                                                label={type.name}
                                                isSelected={filters.type === type.id}
                                                onSelect={() => handleProductTypeChange(type.id)}
                                                count={productCounts.productTypes?.[type.id] || 0}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <FilterSection
                        title="Category"
                        isExpanded={expandedSections.category}
                        onToggle={() => toggleSection('category')}
                        count={categories.length}>
                        <div className="space-y-1 min-h-[60px]">
                            {loadingCategories ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="w-5 h-5 border-2 border-[#00FF89] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-3 text-sm text-gray-400">Loading categories...</span>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-6">
                                    <span className="text-sm text-gray-400">No categories available</span>
                                </div>
                            ) : (
                                <>
                                    {categories.slice(0, expandedSections.category ? undefined : 4).map((category) => (
                                        <FilterOption
                                            key={category.id || category._id}
                                            label={category.name || category.title}
                                            isSelected={filters.category === (category.id || category._id)}
                                            onSelect={() => handleCategoryChange(category.id || category._id)}
                                            count={productCounts.categories?.[category.id || category._id] || 0}
                                        />
                                    ))}
                                    {!expandedSections.category && categories.length > 4 && (
                                        <button
                                            onClick={() => toggleSection('category')}
                                            className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors">
                                            +{categories.length - 4} more
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </FilterSection>
                    <FilterSection
                        title="Price"
                        isExpanded={expandedSections.priceRange}
                        onToggle={() => toggleSection('priceRange')}>
                        <div className="space-y-2">
                            <div className="space-y-1">
                                {PRODUCT_PRICE_CATEGORIES.map((option) => (
                                    <FilterOption
                                        key={option.id}
                                        label={option.name}
                                        isSelected={filters.priceRange?.[0] === option.min && filters.priceRange?.[1] === option.max}
                                        onSelect={() => handlePriceRangeChange([option.min, option.max])}
                                        count={productCounts.priceRanges?.[option.id] || 0}
                                    />
                                ))}
                            </div>
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
                                                onChange={(e) =>
                                                    handlePriceRangeChange([parseInt(e.target.value) || 0, filters.priceRange?.[1] || 1000])
                                                }
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
                                                onChange={(e) =>
                                                    handlePriceRangeChange([filters.priceRange?.[0] || 0, parseInt(e.target.value) || 1000])
                                                }
                                                placeholder="Max"
                                                className="w-full pl-6 pr-2 py-1.5 bg-gray-900 border border-gray-700 rounded-md text-white text-xs focus:outline-none focus:border-[#00FF89] transition-colors"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </FilterSection>
                    <FilterSection
                        title="Rating"
                        isExpanded={expandedSections.rating}
                        onToggle={() => toggleSection('rating')}>
                        <div className="space-y-1">
                            {[4, 3, 2, 1, 0].map((rating) => (
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
                    <FilterSection
                        title="Industry"
                        isExpanded={expandedSections.industry}
                        onToggle={() => toggleSection('industry')}
                        count={industries.length}>
                        <div className="space-y-1 min-h-[60px]">
                            {loadingIndustries ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="w-5 h-5 border-2 border-[#00FF89] border-t-transparent rounded-full animate-spin"></div>
                                    <span className="ml-3 text-sm text-gray-400">Loading industries...</span>
                                </div>
                            ) : industries.length === 0 ? (
                                <div className="text-center py-6">
                                    <span className="text-sm text-gray-400">No industries available</span>
                                </div>
                            ) : (
                                <>
                                    {industries.slice(0, expandedSections.industry ? undefined : 3).map((industry) => (
                                        <FilterOption
                                            key={industry.id}
                                            label={industry.name}
                                            isSelected={filters.industry === industry.id}
                                            onSelect={() => handleIndustryChange(industry.id)}
                                            count={productCounts.industries?.[industry.id] || 0}
                                        />
                                    ))}
                                    {!expandedSections.industry && industries.length > 3 && (
                                        <button
                                            onClick={() => toggleSection('industry')}
                                            className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors">
                                            +{industries.length - 3} more
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </FilterSection>
                    <FilterSection
                        title="Setup Time"
                        isExpanded={expandedSections.setupTime}
                        onToggle={() => toggleSection('setupTime')}
                        count={PRODUCT_SETUP_TIMES.length}>
                        <div className="space-y-1">
                            {PRODUCT_SETUP_TIMES.slice(0, expandedSections.setupTime ? undefined : 3).map((setupTime) => (
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
                                    className="w-full text-left text-xs text-gray-400 hover:text-white py-1 px-2 rounded transition-colors">
                                    +{PRODUCT_SETUP_TIMES.length - 3} more
                                </button>
                            )}
                        </div>
                    </FilterSection>
                    <FilterSection
                        title="Seller"
                        isExpanded={expandedSections.seller}
                        onToggle={() => toggleSection('seller')}>
                        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer group">
                            <div className="relative flex-shrink-0">
                                <input
                                    type="checkbox"
                                    checked={filters.verifiedOnly}
                                    onChange={(e) => handleVerifiedChange(e.target.checked)}
                                    className="sr-only"
                                />
                                <div
                                    className={cn(
                                        'w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center',
                                        filters.verifiedOnly
                                            ? 'bg-[#00FF89] border-[#00FF89]'
                                            : 'bg-transparent border-gray-500 group-hover:border-gray-400'
                                    )}>
                                    {filters.verifiedOnly && <CheckCircle2 className="w-2.5 h-2.5 text-black" />}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <CheckCircle2 className="w-3 h-3 text-[#00FF89] flex-shrink-0" />
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">Verified only</span>
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
function FilterSection({ title, children, isExpanded, onToggle, count }) {
    const sectionId = `filter-section-${title.toLowerCase().replace(/\s+/g, '-')}`
    const contentId = `${sectionId}-content`
    return (
        <section className="border-b border-gray-800 pb-3 last:border-b-0">
            <button
                onClick={onToggle}
                aria-expanded={isExpanded}
                aria-controls={contentId}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-800/50 transition-colors rounded-lg group focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-opacity-50">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white group-hover:text-[#00FF89] transition-colors">{title}</h3>
                    {count > 0 && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{count}</span>}
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
                        className="overflow-hidden mt-2">
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
function FilterOption({ label, isSelected, onSelect, count, className }) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
                'focus:outline-none',
                isSelected ? 'bg-[#00FF89]/15 text-white' : 'hover:bg-gray-800/50 text-gray-300 hover:text-white',
                className
            )}
            aria-pressed={isSelected}>
            <div
                className={cn(
                    'w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 flex items-center justify-center',
                    isSelected ? 'bg-[#00FF89] border-[#00FF89]' : 'border-gray-500 hover:border-gray-400'
                )}>
                {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
            </div>
            <span className="flex-1 text-left text-sm truncate font-medium">{label}</span>
            {count > 0 && (
                <span
                    className={cn(
                        'text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium',
                        isSelected ? 'bg-[#00FF89]/20 text-[#00FF89]' : 'bg-gray-800 text-gray-400'
                    )}>
                    {count}
                </span>
            )}
        </button>
    )
}
function RatingOption({ rating, isSelected, onSelect, count }) {
    return (
        <button
            onClick={onSelect}
            className={cn(
                'w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-opacity-50',
                isSelected
                    ? 'bg-gray-900/80 border border-gray-700 text-white hover:bg-gray-900'
                    : 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
            )}
            aria-pressed={isSelected}>
            <div
                className={cn(
                    'w-3 h-3 rounded-full border-2 transition-all flex-shrink-0 flex items-center justify-center',
                    isSelected ? 'bg-gray-800 border-gray-800' : 'border-gray-500 hover:border-gray-400'
                )}>
                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
                                    className={cn('w-3 h-3 flex-shrink-0', i < rating ? 'text-yellow-400 fill-current' : 'text-gray-600')}
                                />
                            ))}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">& up</span>
                    </div>
                )}
            </div>
            {count > 0 && (
                <span
                    className={cn(
                        'text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium',
                        isSelected ? 'bg-gray-800/50 text-gray-300' : 'bg-gray-800 text-gray-400'
                    )}>
                    {count}
                </span>
            )}
        </button>
    )
}

