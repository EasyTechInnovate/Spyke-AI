'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid3X3, List, Star, Eye, ShoppingCart, DollarSign, Clock, Tag, Zap, TrendingUp, Heart, Package } from 'lucide-react'
export default function EnhancedProductShowcase({ products = [], filters, onFilterChange, onProductClick }) {
    const getCategoryId = (c) => {
        if (!c) return ''
        if (typeof c === 'string') return c
        return c._id || c.id || c.name || ''
    }
    const getCategoryLabel = (c) => {
        if (!c) return 'General'
        if (typeof c === 'string') return c.replace(/[_-]/g, ' ')
        return c.name || getCategoryId(c)?.replace(/[_-]/g, ' ') || 'General'
    }
    const [viewMode, setViewMode] = useState('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const categories = useMemo(() => {
        const cats = new Set(products.map((p) => p.category).filter(Boolean))
        return ['all', ...Array.from(cats)]
    }, [products])
    // Debug logs for categories
    useEffect(() => {
        try {
            const normalized = categories.map((c) => ({
                id: c === 'all' ? 'all' : getCategoryId(c),
                label: c === 'all' ? 'All Categories' : getCategoryLabel(c)
            }))
            console.log('[EnhancedProductShowcase] categories:', normalized)
        } catch (e) {
            console.log('[EnhancedProductShowcase] categories log error:', e)
        }
    }, [categories])
    useEffect(() => {
        console.log('[EnhancedProductShowcase] filters.category:', filters?.category)
    }, [filters?.category])
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase()
                const searchableText = [product.title, product.shortDescription, getCategoryLabel(product.category), ...(product.tags || [])]
                    .join(' ')
                    .toLowerCase()
                if (!searchableText.includes(query)) return false
            }
            if (filters?.category && filters.category !== 'all') {
                const productCatId = getCategoryId(product.category)
                const filterCatId = getCategoryId(filters.category)
                if (productCatId !== filterCatId) return false
            }
            if (filters?.type && filters.type !== 'all' && product.type !== filters.type) {
                return false
            }
            if (filters?.priceRange && filters.priceRange !== 'all') {
                const price = product.price || 0
                switch (filters.priceRange) {
                    case 'free':
                        return price === 0
                    case 'under-20':
                        return price > 0 && price < 20
                    case '20-50':
                        return price >= 20 && price <= 50
                    case 'over-50':
                        return price > 50
                    default:
                        return true
                }
            }
            return true
        })
    }, [products, searchQuery, filters])
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-low':
                    return (a.price || 0) - (b.price || 0)
                case 'price-high':
                    return (b.price || 0) - (a.price || 0)
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0)
                case 'popular':
                    return (b.sales || 0) - (a.sales || 0)
                case 'newest':
                default:
                    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            }
        })
    }, [filteredProducts, filters.sortBy])
    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-[#1f1f1f] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#6b7280]/20">
                    <ShoppingCart className="w-12 h-12 text-[#6b7280]" />
                </div>
                <h3
                    className="text-xl text-[#FFFFFF] mb-2"
                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: '600' }}>
                    No Products Yet
                </h3>
                <p className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">This seller hasn't created any products yet.</p>
            </div>
        )
    }
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7280] group-focus-within:text-[#00FF89] transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products, categories, or features..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-12 w-full pl-12 pr-4 bg-[#121212] border border-[#6b7280]/30 rounded-xl text-[#FFFFFF] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all font-[var(--font-kumbh-sans)]"
                        />
                        {searchQuery && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-1/2 -translate-y-1/2">
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="w-6 h-6 bg-[#6b7280]/20 hover:bg-[#6b7280]/40 rounded-full flex items-center justify-center text-[#6b7280] hover:text-[#FFFFFF] transition-all">
                                    ×
                                </button>
                            </motion.div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <PortalSelect
                            className="h-12 w-full md:w-auto"
                            options={categories.map((c) => {
                                const value = c === 'all' ? 'all' : getCategoryId(c)
                                const label = c === 'all' ? 'All Categories' : getCategoryLabel(c)
                                return { value, label }
                            })}
                            value={getCategoryId(filters.category)}
                            onChange={(val) => {
                                console.log('[EnhancedProductShowcase] category changed to:', val)
                                onFilterChange({ category: val })
                            }}
                            placeholder="All Categories"
                            minWidth="140px"
                        />
                        <PortalSelect
                            className="h-12 w-full md:w-auto"
                            options={[
                                { value: 'newest', label: 'Newest First' },
                                { value: 'popular', label: 'Most Popular' },
                                { value: 'rating', label: 'Highest Rated' },
                                { value: 'price-low', label: 'Price: Low to High' },
                                { value: 'price-high', label: 'Price: High to Low' }
                            ]}
                            value={filters.sortBy}
                            onChange={(val) => onFilterChange({ sortBy: val })}
                            placeholder="Newest First"
                            minWidth="160px"
                        />
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 w-full md:w-auto px-4 rounded-xl border-2 transition-all duration-300 flex items-center gap-2 justify-center ${
                                showFilters
                                    ? 'bg-[#00FF89] text-[#121212] border-[#00FF89]'
                                    : 'bg-[#121212] text-[#FFFFFF] border-[#6b7280]/30 hover:border-[#00FF89]/50'
                            }`}
                            style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '500' }}>
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                        </motion.button>
                        <div className="flex items-center border-2 border-[#6b7280]/30 rounded-xl overflow-hidden mt-2 sm:mt-0 md:mt-0">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-4 transition-all duration-300 ${
                                    viewMode === 'grid' ? 'bg-[#00FF89] text-[#121212]' : 'bg-[#121212] text-[#6b7280] hover:text-[#FFFFFF]'
                                }`}>
                                <Grid3X3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-4 transition-all duration-300 ${
                                    viewMode === 'list' ? 'bg-[#00FF89] text-[#121212]' : 'bg-[#121212] text-[#6b7280] hover:text-[#FFFFFF]'
                                }`}>
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-6 pt-6 border-t border-[#6b7280]/20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label
                                        className="block text-sm text-[#FFFFFF] mb-3"
                                        style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '600' }}>
                                        Price Range
                                    </label>
                                    <select
                                        value={filters.priceRange}
                                        onChange={(e) => onFilterChange({ priceRange: e.target.value })}
                                        className="relative z-50 w-full px-4 py-3 bg-[#121212] border border-[#6b7280]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 font-[var(--font-kumbh-sans)]">
                                        <option
                                            value="all"
                                            className="bg-[#121212]">
                                            All Prices
                                        </option>
                                        <option
                                            value="free"
                                            className="bg-[#121212]">
                                            Free
                                        </option>
                                        <option
                                            value="under-20"
                                            className="bg-[#121212]">
                                            Under $20
                                        </option>
                                        <option
                                            value="20-50"
                                            className="bg-[#121212]">
                                            $20 - $50
                                        </option>
                                        <option
                                            value="over-50"
                                            className="bg-[#121212]">
                                            Over $50
                                        </option>
                                    </select>
                                </div>
                                <div>
                                    <label
                                        className="block text-sm text-[#FFFFFF] mb-3"
                                        style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '600' }}>
                                        Product Type
                                    </label>
                                    <select
                                        value={filters.type || 'all'}
                                        onChange={(e) => onFilterChange({ type: e.target.value })}
                                        className="relative z-50 w-full px-4 py-3 bg-[#121212] border border-[#6b7280]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 font-[var(--font-kumbh-sans)]">
                                        <option
                                            value="all"
                                            className="bg-[#121212]">
                                            All Types
                                        </option>
                                        <option
                                            value="automation"
                                            className="bg-[#121212]">
                                            Automation
                                        </option>
                                        <option
                                            value="prompt"
                                            className="bg-[#121212]">
                                            AI Prompt
                                        </option>
                                        <option
                                            value="agent"
                                            className="bg-[#121212]">
                                            AI Agent
                                        </option>
                                        <option
                                            value="bundle"
                                            className="bg-[#121212]">
                                            Bundle
                                        </option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            onFilterChange({
                                                category: 'all',
                                                priceRange: 'all',
                                                type: 'all',
                                                sortBy: 'newest'
                                            })
                                            setSearchQuery('')
                                        }}
                                        className="w-full px-4 py-3 bg-[#6b7280]/20 text-[#FFFFFF] rounded-xl hover:bg-[#6b7280]/30 transition-all"
                                        style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '500' }}>
                                        Clear All Filters
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
            <div className="flex items-center justify-between">
                <div className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">
                    <span className="font-semibold text-[#FFFFFF] text-lg">{sortedProducts.length}</span> product
                    {sortedProducts.length !== 1 ? 's' : ''} found
                    {searchQuery && (
                        <span>
                            {' '}
                            for "<span className="text-[#00FF89] font-medium">{searchQuery}</span>"
                        </span>
                    )}
                </div>
                <div className="hidden md:flex items-center gap-6 text-sm text-[#6b7280]">
                    <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg border border-[#6b7280]/20">
                        <DollarSign className="w-4 h-4 text-[#FFC050]" />
                        <span className="font-[var(--font-kumbh-sans)]">
                            Avg: ${(sortedProducts.reduce((sum, p) => sum + (p.price || 0), 0) / sortedProducts.length || 0).toFixed(0)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1f1f1f] px-3 py-2 rounded-lg border border-[#6b7280]/20">
                        <Star className="w-4 h-4 text-[#FFC050]" />
                        <span className="font-[var(--font-kumbh-sans)]">
                            {(sortedProducts.reduce((sum, p) => sum + (p.rating || 0), 0) / sortedProducts.length || 0).toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={`${viewMode}-${getCategoryId(filters.category)}-${filters.sortBy}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={
                        viewMode === 'grid'
                            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full'
                            : 'space-y-4'
                    }>
                    {sortedProducts.map((product, index) => (
                        <ProductCard
                            key={product.slug || product._id || product.id}
                            product={product}
                            viewMode={viewMode}
                            onClick={() => onProductClick?.(product.slug || product._id || product.id)}
                            delay={index * 0.05}
                            getCategoryLabel={getCategoryLabel}
                        />
                    ))}
                </motion.div>
            </AnimatePresence>
            {sortedProducts.length >= 12 && (
                <div className="text-center pt-8">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 bg-[#1f1f1f] text-[#FFFFFF] rounded-xl hover:bg-[#2a2a2a] transition-all border border-[#6b7280]/20 hover:border-[#00FF89]/30 font-[var(--font-kumbh-sans)] font-medium">
                        Load More Products
                    </motion.button>
                </div>
            )}
        </div>
    )
}
function PortalSelect({ options = [], value, onChange, className = '', placeholder = '', minWidth }) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef(null)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
    useEffect(() => {
        function updatePosition() {
            const el = triggerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            setPos({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width
            })
        }
        if (open) {
            updatePosition()
            window.addEventListener('resize', updatePosition)
            window.addEventListener('scroll', updatePosition, true)
        }
        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [open])
    useEffect(() => {
        function onDocClick(e) {
            if (!triggerRef.current) return
            if (!triggerRef.current.contains(e.target)) setOpen(false)
        }
        if (open) document.addEventListener('mousedown', onDocClick)
        return () => document.removeEventListener('mousedown', onDocClick)
    }, [open])
    return (
        <div
            className={`relative ${className}`}
            ref={triggerRef}
            style={{ minWidth }}>
            <button
                type="button"
                onClick={() => setOpen((s) => !s)}
                className="w-full text-left px-4 bg-[#121212] border border-[#6b7280]/30 rounded-xl text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 transition-all flex items-center justify-between h-12">
                <span className="truncate">{options.find((o) => o.value === value)?.label || placeholder}</span>
                <svg
                    className="w-4 h-4 ml-2 text-[#9ca3af]"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M5 7l5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
            {open &&
                typeof document !== 'undefined' &&
                createPortal(
                    <div
                        className="bg-[#121212] border border-[#6b7280]/30 rounded-xl shadow-2xl overflow-hidden text-[#FFFFFF]"
                        style={{ position: 'absolute', top: pos.top + 'px', left: pos.left + 'px', width: pos.width + 'px', zIndex: 99999 }}>
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value)
                                    setOpen(false)
                                }}
                                className={`w-full text-left px-4 py-3 hover:bg-[#1f1f1f] transition-colors ${opt.value === value ? 'bg-[#1f1f1f]' : ''}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>,
                    document.body
                )}
        </div>
    )
}
function ProductCard({ product, viewMode, onClick, delay = 0, getCategoryLabel }) {
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    if (viewMode === 'list') {
        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay }}
                className="bg-[#1f1f1f] border border-[#6b7280]/20 rounded-2xl p-6 hover:border-[#00FF89]/30 transition-all cursor-pointer group"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}>
                <div className="flex gap-6">
                    <div className="w-24 h-24 bg-[#121212] rounded-xl overflow-hidden flex-shrink-0 border border-[#6b7280]/20">
                        {product.thumbnail ? (
                            <img
                                src={product.thumbnail}
                                alt={product.title}
                                className={`w-full h-full object-cover transition-all duration-500 ${
                                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                } ${isHovered ? 'scale-105' : 'scale-100'}`}
                                onLoad={() => setImageLoaded(true)}
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-[#00FF89]/20 to-[#FFC050]/20 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#00FF89]" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h3
                                    className="text-[#FFFFFF] text-lg line-clamp-1 mb-2"
                                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                    {product.title}
                                </h3>
                                <p className="text-[#9ca3af] text-sm line-clamp-2 mb-3 font-[var(--font-kumbh-sans)]">{product.shortDescription}</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-[#00FF89]/10 text-[#00FF89] rounded-lg text-xs font-medium border border-[#00FF89]/20">
                                        {getCategoryLabel(product.category)}
                                    </span>
                                    {product.type && (
                                        <span className="px-3 py-1 bg-[#FFC050]/10 text-[#FFC050] rounded-lg text-xs font-medium border border-[#FFC050]/20">
                                            {product.type}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div
                                    className="text-xl text-[#FFFFFF] mb-1"
                                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                    {product.price > 0 ? `$${product.price}` : 'Free'}
                                </div>
                                {product.originalPrice && product.originalPrice > product.price && (
                                    <div className="text-sm text-[#6b7280] line-through font-[var(--font-kumbh-sans)]">${product.originalPrice}</div>
                                )}
                                <div className="flex items-center gap-3 mt-3">
                                    {product.rating > 0 && (
                                        <div className="flex items-center gap-1 text-[#FFC050] text-sm">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span className="font-[var(--font-kumbh-sans)]">{product.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setIsLiked(!isLiked)
                                        }}
                                        className={`p-2 rounded-lg transition-all ${
                                            isLiked ? 'text-red-400 bg-red-400/10' : 'text-[#6b7280] hover:text-red-400 hover:bg-red-400/10'
                                        }`}>
                                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="bg-[#1f1f1f] border border-[#6b7280]/20 rounded-2xl overflow-hidden hover:border-[#00FF89]/30 transition-all cursor-pointer group"
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>
            <div className="aspect-video sm:aspect-[4/3] bg-[#121212] relative overflow-hidden">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className={`w-full h-full object-cover transition-all duration-500 ${
                            imageLoaded ? 'opacity-100' : 'opacity-0'
                        } ${isHovered ? 'scale-110' : 'scale-100'}`}
                        onLoad={() => setImageLoaded(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00FF89]/20 to-[#FFC050]/20 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-[#00FF89]" />
                    </div>
                )}
                <div
                    className={`absolute inset-0 bg-[#121212]/60 flex items-center justify-center gap-3 transition-all duration-300 ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-3 bg-[#FFFFFF]/20 backdrop-blur-sm rounded-full text-[#FFFFFF] hover:bg-[#FFFFFF]/30 transition-all touch-target"
                        tabIndex={0}
                        aria-label={`Preview ${product.title}`}>
                        <Eye className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsLiked(!isLiked)
                        }}
                        className={`p-3 backdrop-blur-sm rounded-full transition-all touch-target ${
                            isLiked ? 'bg-red-400/80 text-[#FFFFFF]' : 'bg-[#FFFFFF]/20 text-[#FFFFFF] hover:bg-red-400/30'
                        }`}
                        tabIndex={0}
                        aria-pressed={isLiked}>
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.button>
                </div>
                <div className="absolute top-4 right-4">
                    <span
                        className="px-3 py-2 bg-[#121212]/80 backdrop-blur-sm text-[#FFFFFF] rounded-xl text-sm border border-[#6b7280]/20"
                        style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                        {product.price > 0 ? `$${product.price}` : 'Free'}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3
                        className="text-[#FFFFFF] line-clamp-2 flex-1"
                        style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                        {product.title}
                    </h3>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1 text-[#FFC050] text-sm">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-[var(--font-kumbh-sans)]">{product.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
                <p className="text-[#9ca3af] text-sm line-clamp-2 mb-4 font-[var(--font-kumbh-sans)]">{product.shortDescription}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-[#00FF89]/10 text-[#00FF89] rounded-lg text-xs font-medium border border-[#00FF89]/20">
                            {getCategoryLabel(product.category)}
                        </span>
                        {product.sales > 0 && (
                            <div className="flex items-center gap-1 text-[#00FF89] text-xs">
                                <TrendingUp className="w-3 h-3" />
                                <span className="font-[var(--font-kumbh-sans)]">{product.sales}</span>
                            </div>
                        )}
                    </div>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-[#6b7280] line-through font-[var(--font-kumbh-sans)]">${product.originalPrice}</span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
