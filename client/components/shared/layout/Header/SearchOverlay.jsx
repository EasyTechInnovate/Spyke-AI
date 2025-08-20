import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Mic, Package, Tag, History, TrendingUp as TrendingUpIcon, ChevronRight, Star } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from '@/lib/utils/toast'
import api from '@/lib/api'

export default function SearchOverlay({ isOpen, onClose }) {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState({ products: [], categories: [] })
    const [isSearching, setIsSearching] = useState(false)
    const [recentSearches, setRecentSearches] = useState([])
    const [isListening, setIsListening] = useState(false)
    const [voiceSupported, setVoiceSupported] = useState(false)
    const searchInputRef = useRef(null)

    // Focus input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])

    // Check voice support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            setVoiceSupported(!!SpeechRecognition)
        }
    }, [])

    // Load recent searches
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('recentSearches')
            if (saved) {
                setRecentSearches(JSON.parse(saved))
            }
        }
    }, [])

    // Voice search handler
    const handleVoiceSearch = () => {
        if (!voiceSupported) {
            toast.search.voiceNotSupported()
            return
        }

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
            toast.search.voiceSuccess(transcript)
        }

        recognition.onerror = (event) => {
            setIsListening(false)
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

    // Perform search
    const performSearch = async (query) => {
        if (!query.trim()) {
            setSearchResults({ products: [], categories: [] })
            return
        }

        setIsSearching(true)

        try {
            const response = await api.search.query(query)
            setSearchResults(response.data)
        } catch (error) {
            console.error('Search error:', error)
            toast.search.searchError()
        } finally {
            setIsSearching(false)
        }
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Handle search selection
    const handleSearchSelect = (item) => {
        // Save to recent searches
        const updatedRecent = [item.title, ...recentSearches.filter((s) => s !== item.title)].slice(0, 5)
        setRecentSearches(updatedRecent)
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent))

        // Navigate to product
        router.push(`/product/${item.id}`)
        onClose()
        setSearchQuery('')
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                onClick={onClose}
            />

            {/* Search Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.2 }}
                className="fixed top-0 left-0 right-0 z-[101] w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
                <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Header */}
                    <div className="p-4 sm:p-6 border-b border-gray-700">
                        <div className="relative">
                            {/* Left icon wrapper for perfect vertical alignment */}
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

                            {/* Voice Search Button */}
                            {voiceSupported && (
                                <button
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

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-0">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 mt-4 overflow-x-auto scrollbar-hide">
                            <button className="px-3 py-1.5 bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-medium hover:bg-brand-primary/30 transition-colors whitespace-nowrap flex-shrink-0">
                                All
                            </button>
                            <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Prompts
                            </button>
                            <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Tools
                            </button>
                            <button className="px-3 py-1.5 bg-gray-800/50 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700/50 transition-colors whitespace-nowrap flex-shrink-0">
                                Templates
                            </button>
                        </div>
                    </div>

                    {/* Search Results */}
                    <SearchResults
                        isSearching={isSearching}
                        searchQuery={searchQuery}
                        searchResults={searchResults}
                        recentSearches={recentSearches}
                        onSearchSelect={handleSearchSelect}
                        setSearchQuery={setSearchQuery}
                    />
                </div>
            </motion.div>
        </>
    )
}

function SearchResults({ isSearching, searchQuery, searchResults, recentSearches, onSearchSelect, setSearchQuery }) {
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
                {/* Products Section */}
                <div className="p-4 sm:p-6">
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products
                    </h3>
                    <div className="space-y-2">
                        {searchResults.products.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => onSearchSelect(product)}
                                className="w-full p-3 sm:p-4 bg-gray-800/30 hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover bg-gray-700"
                                    />
                                    <div className="flex-1 text-left">
                                        <h4 className="font-medium text-white group-hover:text-brand-primary transition-colors">{product.title}</h4>
                                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{product.description}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs">
                                            <span className="text-brand-primary font-semibold">${product.price}</span>
                                            <span className="flex items-center gap-1 text-yellow-500">
                                                <Star className="h-3 w-3 fill-current" />
                                                {product.rating}
                                            </span>
                                            <span className="text-gray-500">{product.sales} sales</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-brand-primary transition-colors flex-shrink-0" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (searchQuery && searchResults.products?.length === 0) {
        return (
            <div className="p-8 text-center">
                <div className="text-gray-400">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium mb-1">No results found</p>
                    <p className="text-sm">Try searching with different keywords</p>
                </div>
            </div>
        )
    }

    // Default: Recent & Trending
    return (
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid sm:grid-cols-2 gap-6">
                {/* Recent Searches */}
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
                                    onClick={() => setSearchQuery(search)}
                                    className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors text-sm">
                                    {search}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Searches */}
                <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <TrendingUpIcon className="h-4 w-4" />
                        Trending Now
                    </h3>
                    <div className="space-y-2">
                        {['AI Writing Assistant', 'Social Media Templates', 'Email Marketing'].map((trend, index) => (
                            <button
                                key={index}
                                onClick={() => setSearchQuery(trend)}
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
