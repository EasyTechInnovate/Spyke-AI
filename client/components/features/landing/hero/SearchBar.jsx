import { useState, useCallback, useEffect, useRef } from 'react'
import { Search, Loader2, TrendingUp, Clock, X, Star, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import PopularTags from './PopularTags'
import productsAPI from '@/lib/api/products'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useDebounce } from '@/hooks/useDebounce'

export default function SearchBar({ popularTags, onSearch }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchRef = useRef(null)
  const router = useRouter()
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  
  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 5))
    }
  }, [])
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Search products when query changes
  useEffect(() => {
    const searchProducts = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setSearchResults([])
        return
      }
      
      setIsSearching(true)
      try {
        const response = await productsAPI.getProducts({
          search: debouncedSearchQuery,
          limit: 5
        })
        setSearchResults(response.data.products || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }
    
    searchProducts()
  }, [debouncedSearchQuery])
  
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // Save to recent searches
      const searches = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentSearches(searches)
      localStorage.setItem('recentSearches', JSON.stringify(searches))
      
      if (onSearch) {
        onSearch(searchQuery)
      }
      setShowResults(false)
    }
  }, [searchQuery, onSearch, recentSearches])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])
  
  const handleProductClick = (product) => {
    router.push(`/products/${product.slug || product._id}`)
    setShowResults(false)
  }
  
  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowResults(false)
  }
  
  const handleClearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }
  
  const removeRecentSearch = (searchToRemove) => {
    const filtered = recentSearches.filter(s => s !== searchToRemove)
    setRecentSearches(filtered)
    localStorage.setItem('recentSearches', JSON.stringify(filtered))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-full max-w-2xl mx-auto"
      id="search"
      ref={searchRef}
    >
      <div className="relative group">
        {/* Subtle glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF89]/10 to-[#FFC050]/10 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
        
        <div className="relative flex items-center bg-[#1f1f1f]/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:bg-[#1f1f1f]/90 hover:border-[#00FF89]/30 transition-all duration-300 shadow-lg">
          <div className="flex items-center flex-1">
            <Search className="ml-4 md:ml-5 h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setShowResults(true)
              }}
              onFocus={() => setShowResults(true)}
              onKeyPress={handleKeyPress}
              placeholder="Search AI prompts, tools, or templates..."
              className="flex-1 px-3 md:px-4 py-3 md:py-4 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm md:text-base font-light"
              aria-label="Search AI prompts"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 md:px-6 py-3 md:py-4 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-medium transition-all duration-200 border-l border-gray-700 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
          >
            Search
          </button>
        </div>
        
        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showResults && (searchQuery || recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#1f1f1f]/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              {/* Loading State */}
              {isSearching && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-[#00FF89]/10 rounded-full mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00FF89]" />
                  </div>
                  <p className="text-sm text-gray-400">Searching for amazing products...</p>
                </div>
              )}
              
              {/* Search Results */}
              {!isSearching && searchResults.length > 0 && (
                <div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#00FF89]" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        Top Results
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {searchResults.length} found
                    </span>
                  </div>
                  <div className="border-t border-gray-800">
                    {searchResults.map((product, index) => (
                      <button
                        key={product._id}
                        onClick={() => handleProductClick(product)}
                        className="w-full px-4 py-3 hover:bg-gray-800/50 transition-all duration-200 flex items-center gap-4 group"
                      >
                        <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0 group-hover:ring-2 group-hover:ring-[#00FF89]/50 transition-all">
                          {product.thumbnail ? (
                            <Image
                              src={product.thumbnail}
                              alt={product.title}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                              <Search className="w-6 h-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="text-sm font-semibold text-white line-clamp-1 group-hover:text-[#00FF89] transition-colors">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400 capitalize bg-gray-800 px-2 py-0.5 rounded-full">
                              {product.type}
                            </span>
                            {product.averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-400">{product.averageRating}</span>
                              </div>
                            )}
                            <span className="text-sm font-bold text-[#00FF89]">
                              ${product.price}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-[#00FF89] transition-colors" />
                      </button>
                    ))}
                  </div>
                  <Link
                    href={`/explore?search=${encodeURIComponent(searchQuery)}`}
                    className="flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-[#00FF89] hover:bg-gray-800/50 transition-all duration-200 border-t border-gray-800 group"
                  >
                    View all results
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
              
              {/* No Results */}
              {!isSearching && searchQuery && searchResults.length === 0 && (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full mb-4">
                    <Search className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-gray-300 font-medium mb-2">No results found</p>
                  <p className="text-sm text-gray-500 mb-4">Try searching with different keywords</p>
                  <Link
                    href="/explore"
                    className="inline-flex items-center gap-2 text-sm text-[#00FF89] hover:text-[#00FF89]/80 transition-colors"
                  >
                    Browse all products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
              {/* Recent Searches */}
              {!searchQuery && recentSearches.length > 0 && (
                <div>
                  <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                        Recent Searches
                      </span>
                    </div>
                    <button
                      onClick={handleClearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="border-t border-gray-800">
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="flex items-center group hover:bg-gray-800/50 transition-all duration-200"
                      >
                        <button
                          onClick={() => {
                            setSearchQuery(search)
                            setShowResults(true)
                          }}
                          className="flex-1 px-4 py-3 text-left"
                        >
                          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                            {search}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeRecentSearch(search)
                          }}
                          className="p-3 text-gray-600 hover:text-gray-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-gray-800">
                    <p className="text-xs text-gray-500 text-center">
                      Searches are saved locally on your device
                    </p>
                  </div>
                </div>
              )}
              
              {/* Popular Searches - Show when no query and no recent searches */}
              {!searchQuery && recentSearches.length === 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                    <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">
                      Trending Searches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['ChatGPT Prompts', 'AI Automation', 'Marketing Tools', 'Content Creation', 'SEO Templates'].map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          setSearchQuery(term)
                          setShowResults(true)
                        }}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 hover:text-white rounded-full transition-all duration-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Popular searches */}
      <PopularTags tags={popularTags} onTagClick={setSearchQuery} />
    </motion.div>
  )
}