import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, X, Mic, Package, History, TrendingUp as TrendingUpIcon, ChevronRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import toast from '@/lib/utils/toast'
import productsAPI from '@/lib/api/products'

export default function SearchOverlay({ isOpen, onClose }) {
    const router = useRouter()
    const { track } = useAnalytics()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState({ products: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [voiceSupported, setVoiceSupported] = useState(false)
    const searchInputRef = useRef(null)
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            setVoiceSupported(!!SpeechRecognition)
        }
    }, [])
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recentSearches')
            if (saved) {
                setRecentSearches(JSON.parse(saved))
            }
        }
    }, [])
    useEffect(() => {
        if (isOpen) {
            track.engagement.featureUsed('search_overlay_opened', {
                source: 'header_search_button'
            });
        }
    }, [isOpen, track]);
    const handleVoiceSearch = () => {
        if (!voiceSupported) {
            track.engagement.featureUsed('voice_search_not_supported', {
                source: 'search_overlay'
            });
            toast.search.voiceNotSupported()
            return
        }

        track.engagement.featureUsed('voice_search_started', {
            source: 'search_overlay',
            current_query: searchQuery
        });

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onstart = () => {
            setIsListening(true)
            toast.search.voiceListening()
        }
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript
            setSearchQuery(transcript)
            setIsListening(false)
            
            track.engagement.featureUsed('voice_search_success', {
                source: 'search_overlay',
                transcript_length: transcript.length,
                search_query: transcript
            });
            
            toast.search.voiceSuccess(transcript)
        }
        recognition.onerror = (event) => {
            setIsListening(false)
            
            track.engagement.featureUsed('voice_search_error', {
                source: 'search_overlay',
                error_type: event.error
            });
            
            if (event.error === 'no-speech') {
                toast.search.voiceNoSpeech()
            } else if (event.error === 'not-allowed') {
                toast.search.voiceAccessDenied()
            } else {
                toast.search.voiceError(event.error)
            }
        }
        recognition.onend = () => {
            setIsListening(false)
        }
        if (isListening) {
            recognition.stop()
        } else {
            recognition.start()
        }
    }
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults({ products: [] })
            return
        }

        const searchStartTime = performance.now();
        
        track.product.productSearched(query.trim(), 0, { source: 'search_overlay' });

        setIsSearching(true)
        try {
            const response = await productsAPI.getProducts({
                search: query.trim(),
                limit: 5
            })
            
            const searchDuration = performance.now() - searchStartTime;
            
            let products = []
            if (response?.data?.products && Array.isArray(response.data.products)) {
                products = response.data.products
            } else if (response?.products && Array.isArray(response.products)) {
                products = response.products
            }

            track.engagement.searchPerformed(query.trim(), 'all', products.length);
            
            track.engagement.featureUsed('search_results_displayed', {
                search_query: query.trim(),
                results_count: products.length,
                search_duration_ms: Math.round(searchDuration),
                source: 'search_overlay'
            });

            setSearchResults({ products })
        } catch (error) {
            const searchDuration = performance.now() - searchStartTime;
            
            track.system.errorOccurred('search_api_failed', error.message, {
                search_query: query.trim(),
                search_duration_ms: Math.round(searchDuration),
                source: 'search_overlay'
            });
            
            console.error('Search error:', error)
            setSearchResults({ products: [] })
        } finally {
            setIsSearching(false)
        }
    }
    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            const timer = setTimeout(() => {
                performSearch(searchQuery)
            }, 300)
            return () => clearTimeout(timer)
        } else {
            setSearchResults({ products: [] })
        }
    }, [searchQuery])
    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault()
        if (searchQuery.trim()) {
            track.engagement.featureUsed('search_submitted', {
                search_query: searchQuery.trim(),
                results_count: searchResults.products?.length || 0,
                source: 'search_overlay',
                submit_method: 'enter_key'
            });

            const updatedRecent = [searchQuery.trim(), ...recentSearches.filter((s) => s !== searchQuery.trim())].slice(0, 5)
            setRecentSearches(updatedRecent)
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))
            router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`)
            onClose()
            setSearchQuery('')
        }
    }
    const handleProductClick = (product) => {
        track.product.productViewed(
            product.id || product._id,
            product.title,
            'search_result',
            product.sellerId || 'unknown',
            product.price || 0
        );

        track.engagement.featureUsed('search_result_clicked', {
            product_id: product.id || product._id,
            product_name: product.title,
            search_query: searchQuery,
            result_position: searchResults.products?.indexOf(product) || 0,
            source: 'search_overlay'
        });

        const updatedRecent = [product.title, ...recentSearches.filter((s) => s !== product.title)].slice(0, 5)
        setRecentSearches(updatedRecent)
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))
        const identifier = product.slug || product.id || product._id
        router.push(`/products/${identifier}`)
        onClose()
        setSearchQuery('')
    }
    const handleRecentSearchClick = (search) => {
        track.engagement.featureUsed('recent_search_clicked', {
            search_query: search,
            source: 'search_overlay'
        });
        
        setSearchQuery(search)
        performSearch(search)
    }
    const handleTrendingSearchClick = (trend) => {
        track.engagement.featureUsed('trending_search_clicked', {
            search_query: trend,
            source: 'search_overlay'
        });
        
        setSearchQuery(trend)
        performSearch(trend)
    }
    const handleQuickSearchClick = (query) => {
        track.engagement.featureUsed('quick_search_clicked', {
            search_query: query,
            source: 'search_overlay'
        });
        
        setSearchQuery(query)
        performSearch(query)
    }
    const handleOverlayClose = () => {
        track.engagement.featureUsed('search_overlay_closed', {
            search_query: searchQuery,
            had_results: searchResults.products?.length > 0,
            source: 'search_overlay'
        });
        
        onClose()
    }
    if (!isOpen) return null
    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                onClick={handleOverlayClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-16 sm:top-20 left-0 right-0 z-[101] w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-700">
                        <form onSubmit={handleSearchSubmit} className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products, prompts, tools..."
                                className="w-full h-12 sm:h-14 pl-12 sm:pl-14 pr-24 sm:pr-28 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 transition-all text-base sm:text-lg"
                            />
                            {voiceSupported && (
                                <button
                                    type="button"
                                    onClick={handleVoiceSearch}
                                    className={`absolute right-12 sm:right-14 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all focus:outline-none focus:ring-0 ${
                                        isListening
                                            ? 'text-brand-primary bg-brand-primary/10 animate-pulse'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                    }`}
                                    title={isListening ? 'Stop listening' : 'Search by voice'}>
                                    <Mic className="h-5 w-5" />
                                    {isListening && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleOverlayClose}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-0">
                                <X className="h-5 w-5" />
                            </button>
                        </form>
                        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
                            <button 
                                onClick={() => handleQuickSearchClick('AI prompts')}
                                className="px-3 py-1.5 bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/30 transition-colors whitespace-nowrap flex-shrink-0">
                                AI Prompts
                            </button>
                            <button 
                                onClick={() => handleQuickSearchClick('automation tools')}
                                className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Automation
                            </button>
                            <button 
                                onClick={() => handleQuickSearchClick('templates')}
                                className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Templates
                            </button>
                            <button 
                                onClick={() => handleQuickSearchClick('scripts')}
                                className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Scripts
                            </button>
                        </div>
                    </div>
                    <SearchResults
                        isSearching={isSearching}
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        recentSearches={recentSearches}
                        onProductClick={handleProductClick}
                        onRecentSearchClick={handleRecentSearchClick}
                        onTrendingSearchClick={handleTrendingSearchClick}
                        onSearchSubmit={handleSearchSubmit}
                    />
                </div>
            </motion.div>
        </>
    )
}
function SearchResults({ 
    isSearching, 
    searchQuery, 
    searchResults, 
    recentSearches, 
    onProductClick, 
    onRecentSearchClick, 
    onTrendingSearchClick,
    onSearchSubmit 
}) {
    if (isSearching) {
        return (
            <div className="p-8 text-center">
                <div className="inline-flex items-center gap-2 text-gray-400">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Search className="h-5 w-5" />
                    </motion.div>
                    <span>Searching...</span>
                </div>
            </div>
        )
    }
    if (searchQuery && searchResults.products?.length > 0) {
        return (
            <div className="max-h-[60vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
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
                                onClick={() => onProductClick(product)}
                                className="w-full p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    {product.image && (
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-700"
                                        />
                                    )}
                                    <div className="flex-1 text-left">
                                        <h4 className="font-medium text-white group-hover:text-brand-primary transition-colors">{product.title}</h4>
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.shortDescription || product.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="text-brand-primary font-semibold">${product.price}</span>
                                            {product.averageRating > 0 && (
                                                <span className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    {product.averageRating.toFixed(1)}
                                                </span>
                                            )}
                                            {product.sales > 0 && <span className="text-gray-500">{product.sales} sales</span>}
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => onSearchSubmit()}
                        className="w-full mt-4 p-3 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl transition-all duration-200 font-medium">
                        View all results for "{searchQuery}"
                    </motion.button>
                </div>
            </div>
        )
    }
    if (searchQuery && searchQuery.length > 2 && searchResults.products?.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">No results found</p>
                    <p className="text-sm mb-4">Try searching with different keywords</p>
                    <button
                        onClick={() => onSearchSubmit()}
                        className="text-brand-primary hover:text-brand-primary/80 font-medium">
                        Search in all products
                    </button>
                </div>
            </div>
        )
    }
    return (
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-6">
                {recentSearches.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Recent Searches
                        </h3>
                        <div className="space-y-2">
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => onRecentSearchClick(search)}
                                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <TrendingUpIcon className="h-4 w-4" />
                        Trending Now
                    </h3>
                    <div className="space-y-2">
                        {['AI Writing Assistant', 'Social Media Templates', 'Email Marketing', 'Automation Scripts', 'ChatGPT Prompts'].map((trend, index) => (
                            <button
                                key={index}
                                onClick={() => onTrendingSearchClick(trend)}
                                className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                                {trend}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}