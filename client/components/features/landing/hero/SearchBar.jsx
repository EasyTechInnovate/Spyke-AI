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

    // Perform search API call
    const performSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearchResults({ products: [] })
            return
        }

        setIsSearching(true)

        try {
            // Use the correct products API method with search parameter
            const response = await productsAPI.getProducts({
                search: searchQuery.trim(),
                limit: 5
            })

            // Handle both possible response structures
            let products = []
            if (response?.data?.products) {
                products = response.data.products
            } else if (response?.products) {
                products = response.products
            } else if (Array.isArray(response?.data)) {
                products = response.data
            } else if (Array.isArray(response)) {
                products = response
            }

            setSearchResults({ products })
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults({ products: [] })
        } finally {
            setIsSearching(false)
        }
    }

    // Debounced search effect
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

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
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

            // Navigate to explore page with search
            router.push(`/explore?search=${encodeURIComponent(searchQuery)}`)
            setIsFocused(false)

            if (onSearch) onSearch(searchQuery)
        }
    }

    const handleProductClick = (product) => {
        // Use slug if available, otherwise fallback to id
        const identifier = product.slug || product.id || product._id
        router.push(`/products/${identifier}`)
        setIsFocused(false)
        setQuery('')
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
            className="w-full max-w-4xl mx-auto space-y-4"
            id="main-search"
            ref={searchContainerRef}>
            {/* Main Search Input */}
            <motion.form
                onSubmit={handleSearch}
                className="relative group"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                role="search"
                aria-label="Search AI prompts and automation tools">
                <div
                    className={`relative flex items-center bg-[#1f1f1f]/90 backdrop-blur-xl border-2 rounded-2xl transition-all duration-300 ${isFocused ? 'border-[#00FF89]/60 bg-[#1f1f1f]' : 'border-gray-700 hover:border-gray-600'}`}>
                    {/* Search Icon */}
                    <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
                        <motion.div
                            animate={isFocused ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}>
                            <Search
                                className={`w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-300 ${isFocused ? 'text-[#00FF89]' : 'text-gray-400'}`}
                                aria-hidden="true"
                            />
                        </motion.div>
                    </div>

                    {/* Input Field */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search AI prompts, tools, automation scripts..."
                        className="flex-1 h-14 sm:h-16 bg-transparent text-white placeholder-gray-400 text-base sm:text-lg font-medium !outline-none !focus-visible:outline-none !focus:outline-none !focus-visible:ring-0 !focus:ring-0 !focus-visible:shadow-none !focus:shadow-none !border-none !focus:border-none !focus-visible:border-none"
                        aria-label="Search AI prompts and tools"
                        aria-describedby="search-help"
                        style={{
                            outline: '0 !important',
                            boxShadow: '0 0 0 0 transparent !important',
                            border: '0 !important',
                            WebkitAppearance: 'none',
                            WebkitBoxShadow: '0 0 0 0 transparent !important',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    />

                    {/* Selected Tags Display */}
                    <AnimatePresence>
                        {selectedTags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-1 mr-2">
                                {selectedTags.map((tag, index) => (
                                    <motion.span
                                        key={tag}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#00FF89]/20 border border-[#00FF89]/30 rounded-lg text-xs font-medium text-[#00FF89]">
                                        <Hash className="w-3 h-3" />
                                        {tag.replace(/^\w+\s+/, '')}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-red-400 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </motion.span>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Search Button */}
                    <motion.button
                        type="submit"
                        className={`mr-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#00FF89] to-[#00D4AA] text-black font-bold rounded-xl transition-all duration-300 text-sm sm:text-base ${query.trim() || selectedTags.length > 0 ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}
                        disabled={!query.trim() && selectedTags.length === 0}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <span className="hidden sm:inline">Search</span>
                        <Search className="w-4 h-4 sm:hidden" />
                    </motion.button>
                </div>

                {/* Search Help Text */}
                <div
                    id="search-help"
                    className="sr-only">
                    Search for AI prompts, automation tools, and scripts. Results will appear below as you type.
                </div>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f] backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden z-50 max-h-96 overflow-y-auto shadow-2xl">
                            {isSearching ? (
                                <div className="p-6 text-center">
                                    <div className="inline-flex items-center gap-2 text-gray-400">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                            <Search className="h-5 w-5" />
                                        </motion.div>
                                        <span>Searching...</span>
                                    </div>
                                </div>
                            ) : searchResults.products.length > 0 ? (
                                <div className="p-4">
                                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Products ({searchResults.products.length} found)
                                    </h3>
                                    <div className="space-y-2">
                                        {searchResults.products.map((product) => (
                                            <motion.button
                                                key={product.id || product._id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => handleProductClick(product)}
                                                className="w-full p-3 bg-gray-800/30 hover:bg-gray-700/40 rounded-xl transition-all duration-200 group text-left">
                                                <div className="flex items-start gap-3">
                                                    {product.image && (
                                                        <img
                                                            src={product.image}
                                                            alt={product.title}
                                                            className="w-12 h-12 rounded-lg object-cover bg-gray-700 flex-shrink-0"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-white group-hover:text-[#00FF89] transition-colors truncate">
                                                            {product.title}
                                                        </h4>
                                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                                            {product.shortDescription || product.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                                            <span className="text-[#00FF89] font-semibold">${product.price}</span>
                                                            {product.averageRating > 0 && (
                                                                <span className="flex items-center gap-1 text-yellow-500">
                                                                    <Star className="h-3 w-3 fill-current" />
                                                                    {product.averageRating.toFixed(1)}
                                                                </span>
                                                            )}
                                                            {product.sales > 0 && <span className="text-gray-500">{product.sales} sales</span>}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-[#00FF89] transition-colors flex-shrink-0" />
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>

                                    {/* View All Results */}
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={handleSearch}
                                        className="w-full mt-3 p-3 bg-[#00FF89]/10 hover:bg-[#00FF89]/20 text-[#00FF89] rounded-xl transition-all duration-200 font-medium">
                                        View all results for "{query}"
                                    </motion.button>
                                </div>
                            ) : query.length > 2 ? (
                                <div className="p-6 text-center text-gray-400">
                                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No results found for "{query}"</p>
                                    <button
                                        onClick={handleSearch}
                                        className="mt-2 text-[#00FF89] hover:text-[#00FF89]/80 text-sm">
                                        Search in all products
                                    </button>
                                </div>
                            ) : (
                                <div className="p-4 space-y-2">
                                    <div className="text-sm text-gray-400 font-medium">Quick suggestions</div>
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
                                                className="block w-full text-left px-3 py-2 hover:bg-gray-700/40 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200">
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

            {/* Enhanced Popular Tags - Centered */}
            <AnimatePresence>
                {popularTags.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                            <span className="font-medium">Trending searches:</span>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                            {popularTags.map((tag, index) => (
                                <motion.button
                                    key={tag}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTagClick(tag)}
                                    className={`group relative px-3 sm:px-4 py-2 bg-gray-800/40 hover:bg-gray-700/50 border border-gray-600 hover:border-[#00FF89]/40 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${selectedTags.includes(tag) ? 'bg-[#00FF89]/10 border-[#00FF89]/50 text-[#00FF89]' : 'text-gray-300 hover:text-white'}`}>
                                    {/* Sparkle effect on hover */}
                                    <motion.div
                                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100"
                                        initial={{ rotate: 0 }}
                                        whileHover={{ rotate: 180 }}
                                        transition={{ duration: 0.3 }}>
                                        <Sparkles className="w-3 h-3 text-[#00FF89]" />
                                    </motion.div>

                                    <Hash className="inline w-3 h-3 mr-1 opacity-50" />
                                    {tag}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
