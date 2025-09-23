import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, TrendingUp, Hash, X, Package, Star, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import productsAPI from '@/lib/api/products'
export default function SearchBar({ popularTags = [], onSearch }) {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [selectedTags, setSelectedTags] = useState([])
    const [searchResults, setSearchResults] = useState({ products: [] })
    const [isSearching, setIsSearching] = useState(false)
    const inputRef = useRef(null)
    const searchContainerRef = useRef(null)
    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearchResults({ products: [] })
            return
        }
        setIsSearching(true)
        try {
            const response = await productsAPI.getProducts({
                search: searchQuery.trim(),
                limit: 5
            })
            let products = []
            if (response?.data?.products && Array.isArray(response.data.products)) {
                products = response.data.products
            } else if (response?.products && Array.isArray(response.products)) {
                products = response.products
            }
            setSearchResults({ products })
        } catch (error) {
            setSearchResults({ products: [] })
        } finally {
            setIsSearching(false)
        }
    }
    useEffect(() => {
        if (query.trim().length > 2) {
            const timer = setTimeout(() => {
                performSearch(query)
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setSearchResults({ products: [] })
        }
    }, [query])
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.closest('button[data-product-click]')) {
                return
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setIsFocused(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    const handleSearch = (e) => {
        e.preventDefault()
        if (query.trim() || selectedTags.length > 0) {
            const searchQuery = selectedTags.length > 0 ? `${query} ${selectedTags.join(' ')}`.trim() : query
            router.push(`/explore?search=${encodeURIComponent(searchQuery)}`)
            setIsFocused(false)
            if (onSearch) onSearch(searchQuery)
        }
    }
    const handleProductClick = (product) => {
        const identifier = product.slug || product.id || product._id
        if (!identifier) {
            return
        }
        const productUrl = `/products/${identifier}`
        setIsFocused(false)
        setQuery('')
        router.push(productUrl)
    }
    const handleTagClick = (tag) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags([...selectedTags, tag])
        }
    }
    const removeTag = (tagToRemove) => {
        setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove))
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e)
        } else if (e.key === 'Escape') {
            setIsFocused(false)
            inputRef.current?.blur()
        }
    }
    const showResults = isFocused && (query.length > 2 || searchResults.products.length > 0)
    return (
        <div
            className="w-full max-w-4xl mx-auto space-y-4 relative px-2 sm:px-4"
            id="main-search"
            ref={searchContainerRef}>
            <motion.form
                onSubmit={handleSearch}
                className="relative group"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                role="search"
                aria-label="Search AI prompts and automation tools">
                <div
                    className={`relative overflow-hidden bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-2xl border transition-all duration-500 ease-out rounded-xl sm:rounded-2xl ${isFocused
                        ? 'border-[#00FF89]/40 shadow-[0_0_40px_rgba(0,255,137,0.15)] bg-gray-900/90'
                        : 'border-gray-700/50 hover:border-gray-600/70 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                        }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-[#00FF89]/5 via-transparent to-[#00FF89]/5 opacity-0 transition-opacity duration-500 ${isFocused ? 'opacity-100' : ''}`} />
                    <div className="relative flex items-center min-h-[56px] sm:min-h-[68px]">
                        <div className="flex items-center justify-center w-12 sm:w-16 h-full flex-shrink-0 pl-3 sm:pl-4">
                            <motion.div
                                animate={isFocused ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}>
                                <Search
                                    className={`w-4 h-4 sm:w-6 sm:h-6 transition-all duration-300 ${isFocused ? 'text-[#00FF89] drop-shadow-[0_0_8px_rgba(0,255,137,0.5)]' : 'text-gray-400'
                                        }`}
                                />
                            </motion.div>
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search AI prompts, tools..."
                            className="flex-1 h-full !bg-transparent !text-white/90 !placeholder-gray-400 text-sm sm:text-lg font-light tracking-wide !outline-none !border-none !focus:outline-none !focus:ring-0 pr-2 sm:pr-4 !appearance-none !shadow-none !focus:shadow-none !ring-0 !focus:ring-0 !m-0 !p-0"
                            style={{
                                border: '0 !important',
                                outline: '0 !important',
                                boxShadow: 'none !important',
                                WebkitAppearance: 'none !important',
                                MozAppearance: 'none !important',
                                appearance: 'none !important',
                                background: 'transparent !important',
                                margin: '0 !important',
                                padding: '0 !important',
                                borderRadius: '0 !important',
                                WebkitBoxShadow: 'none !important',
                                WebkitBorderRadius: '0 !important',
                                MozBorderRadius: '0 !important'
                            }}
                            aria-label="Search AI prompts and tools"
                            aria-describedby="search-help"
                        />
                        <AnimatePresence>
                            {selectedTags.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-700/50">
                                    {selectedTags.slice(0, 2).map((tag, index) => (
                                        <motion.span
                                            key={tag}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full text-xs font-medium text-[#00FF89] backdrop-blur-sm">
                                            <span className="truncate max-w-[50px]">
                                                {tag.replace(/^\w+\s+/, '')}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="w-4 h-4 rounded-full hover:bg-red-400/20 hover:text-red-400 transition-colors duration-200 flex items-center justify-center"
                                                aria-label={`Remove ${tag} tag`}>
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </motion.span>
                                    ))}
                                    {selectedTags.length > 2 && (
                                        <span className="text-xs text-gray-400 font-light px-2">
                                            +{selectedTags.length - 2}
                                        </span>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center px-2 sm:px-4">
                            <motion.button
                                type="submit"
                                className={`relative overflow-hidden px-3 sm:px-8 py-2.5 sm:py-3.5 bg-gradient-to-r from-[#00FF89] to-[#00D4AA] text-black font-semibold rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-base shadow-lg hover:shadow-[0_8px_30px_rgba(0,255,137,0.3)] ${query.trim() || selectedTags.length > 0
                                    ? 'opacity-100 scale-100 hover:scale-105'
                                    : 'opacity-60 scale-95'
                                    }`}
                                disabled={!query.trim() && selectedTags.length === 0}
                                whileHover={{ y: -1 }}
                                whileTap={{ scale: 0.98 }}
                                aria-label="Search">
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
                                    animate={query.trim() || selectedTags.length > 0 ? { x: '200%' } : {}}
                                    transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
                                />
                                <span className="relative z-10 hidden sm:inline tracking-wide">Search</span>
                                <Search className="relative z-10 w-4 h-4 sm:hidden" />
                            </motion.button>
                        </div>
                    </div>
                </div>
                <div
                    id="search-help"
                    className="sr-only">
                    Search for AI prompts, automation tools, and scripts. Results will appear below as you type.
                </div>
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 z-[999] bg-[#1f1f1f]/98 backdrop-blur-xl border border-gray-700 rounded-xl sm:rounded-2xl overflow-hidden max-h-80 overflow-y-auto shadow-2xl mx-2 sm:mx-0"
                            style={{
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                            }}>
                            {isSearching ? (
                                <div className="p-4 sm:p-6 text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-400">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                                        </motion.div>
                                        <span className="text-sm sm:text-base">Searching...</span>
                                    </div>
                                </div>
                            ) : searchResults.products.length > 0 ? (
                                <div className="p-3 sm:p-4">
                                    <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                                        Products ({searchResults.products.length} found)
                                    </h3>
                                    <div className="space-y-2">
                                        {searchResults.products.map((product, index) => (
                                            <motion.button
                                                key={product.id || product._id}
                                                data-product-click="true"
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={(event) => {
                                                    event.preventDefault()
                                                    event.stopPropagation()
                                                    handleProductClick(product)
                                                }}
                                                className="w-full p-2.5 sm:p-3 bg-gray-800/30 hover:bg-gray-700/40 rounded-lg sm:rounded-xl transition-all duration-200 group text-left min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    {product.image && (
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover bg-gray-700 flex-shrink-0"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-white group-hover:text-[#00FF89] transition-colors truncate text-sm sm:text-base">
                                                            {product.title}
                                                        </h4>
                                                        <p className="text-xs sm:text-sm text-gray-400 mt-1 line-clamp-2 leading-tight">
                                                            {product.shortDescription || product.description}
                                                        </p>
                                                        <div className="flex items-center gap-2 sm:gap-4 mt-2 text-xs">
                                                            <span className="text-[#00FF89] font-semibold">${product.price}</span>
                                                            {product.averageRating > 0 && (
                                                                <span className="flex items-center gap-1 text-yellow-500">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                    {product.averageRating.toFixed(1)}
                                                                </span>
                                                            )}
                                                            {product.sales > 0 && <span className="text-gray-500 hidden sm:inline">{product.sales} sales</span>}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-hover:text-[#00FF89] transition-colors flex-shrink-0" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={handleSearch}
                                        className="w-full mt-3 p-2.5 sm:p-3 bg-[#00FF89]/10 hover:bg-[#00FF89]/20 text-[#00FF89] rounded-lg sm:rounded-xl transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 text-sm sm:text-base">
                                        View all results for "{query}"
                                    </motion.button>
                                </div>
                            ) : query.length > 2 ? (
                                <div className="p-4 sm:p-6 text-center text-gray-400">
                                    <Search className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs sm:text-sm">No results found for "{query}"</p>
                                    <button
                                        onClick={handleSearch}
                                        className="mt-2 text-[#00FF89] hover:text-[#00FF89]/80 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 rounded px-2 py-1">
                                        Search in all products
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 sm:p-4 space-y-2">
                                    <div className="text-xs sm:text-sm text-gray-400 font-medium">Quick suggestions</div>
                                    {[`${query} prompts`, `${query} automation`, `${query} templates`, `${query} scripts`]
                                        .filter((suggestion) => suggestion.trim().length > 8)
                                        .map((suggestion, index) => (
                                            <motion.button
                                                key={suggestion}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => {
                                                    setQuery(suggestion)
                                                    performSearch(suggestion)
                                                }}
                                                className="block w-full text-left px-2.5 sm:px-3 py-2 hover:bg-gray-700/40 rounded-lg text-xs sm:text-sm text-gray-300 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                                <Search className="inline w-3 h-3 mr-2 opacity-50" />
                                                {suggestion}
                                            </motion.button>
                                        ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.form>
            <AnimatePresence>
                {popularTags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className={`space-y-3 text-center ${showResults ? 'mt-80' : ''}`}>
                        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#00FF89]" />
                            <span className="font-medium">Trending searches:</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 px-2">
                            {popularTags.map((tag, index) => (
                                <motion.button
                                    key={tag}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTagClick(tag)}
                                    className={`group relative px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600 hover:border-[#00FF89]/40 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 min-h-[32px] sm:min-h-[36px] ${selectedTags.includes(tag) ? 'bg-[#00FF89]/10 border-[#00FF89]/50 text-[#00FF89]' : 'text-gray-300 hover:text-white'}`}
                                    aria-label={`Add ${tag} filter`}>
                                    <motion.div
                                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100"
                                        initial={{ rotate: 0 }}
                                        whileHover={{ rotate: 180 }}
                                        transition={{ duration: 0.3 }}>
                                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#00FF89]" />
                                    </motion.div>
                                    <Hash className="inline w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 opacity-50" />
                                    <span className="truncate max-w-[60px] sm:max-w-none">{tag}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}