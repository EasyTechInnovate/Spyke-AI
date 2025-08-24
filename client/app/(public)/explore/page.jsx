'use client'

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { debounce } from '@/utils/debounce'
import Header from '@/components/shared/layout/Header'
import ExploreHeader from '@/components/features/explore/ExploreHeader'
import ExploreControls from '@/components/features/explore/ExploreControls'
import ActiveFilters from '@/components/features/explore/ActiveFilters'
import ProductGrid from '@/components/features/explore/ProductGrid'
import Pagination from '@/components/features/explore/Pagination'
import { productsAPI } from '@/lib/api'
import { CATEGORIES, PRODUCT_TYPES, INDUSTRIES, SETUP_TIMES, ITEMS_PER_PAGE, DEFAULT_FILTERS, SORT_OPTIONS } from '@/data/explore/constants'
import toast from '@/lib/utils/toast'
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Clock, Loader2 } from 'lucide-react'

// Import Design System Components
import { DSContainer, DSStack, DSHeading, DSText, DSButton, DSLoadingState } from '@/lib/design-system'

import InlineNotification from '@/components/shared/notifications/InlineNotification'

// Dynamic imports with proper loading states and error boundaries
const FilterSidebar = dynamic(() => import('@/components/features/explore/FilterSidebar'), {
    loading: () => <FilterSidebarSkeleton />,
    ssr: false
})

const MobileFilterDrawer = dynamic(() => import('@/components/features/explore/MobileFilterDrawer'), {
    ssr: false
})

const VirtualizedProductGrid = dynamic(() => import('@/components/features/explore/VirtualizedProductGrid'), {
    loading: () => <ProductGridSkeleton />,
    ssr: false
})

// Add dynamic import for CategoryDetailClient
const CategoryDetailClient = dynamic(() => import('@/components/features/explore/CategoryDetailClient'), { ssr: false })

// Enhanced Loading skeleton components
function FilterSidebarSkeleton() {
    return (
        <div className="w-72 bg-[#171717] border border-gray-800 rounded-xl p-6 sticky top-8">
            <DSLoadingState
                type="skeleton"
                height="300px"
                className="w-full"
            />
        </div>
    )
}

function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
                    <DSLoadingState
                        type="skeleton"
                        height="200px"
                    />
                    <div className="p-4 space-y-3">
                        <DSLoadingState
                            type="skeleton"
                            height="20px"
                        />
                        <DSLoadingState
                            type="skeleton"
                            height="16px"
                            width="75%"
                        />
                        <DSStack
                            direction="row"
                            justify="between"
                            align="center">
                            <DSLoadingState
                                type="skeleton"
                                height="20px"
                                width="60px"
                            />
                            <DSLoadingState
                                type="skeleton"
                                height="16px"
                                width="50px"
                            />
                        </DSStack>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Enhanced Error boundary component with retry mechanisms
function ExploreErrorBoundary({ error, resetErrorBoundary, onRetry }) {
    const getErrorMessage = () => {
        if (error?.name === 'ChunkLoadError') {
            return 'Failed to load page resources. This might be due to a network issue.'
        }
        if (error?.message?.includes('fetch')) {
            return 'Network error occurred. Please check your internet connection.'
        }
        return error?.message || 'An unexpected error occurred'
    }

    const getErrorType = () => {
        if (error?.name === 'ChunkLoadError') return 'chunk-error'
        if (error?.message?.includes('fetch')) return 'network-error'
        return 'generic-error'
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}>
                    <DSStack
                        gap="large"
                        direction="column"
                        align="center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                        </div>

                        <DSStack
                            gap="small"
                            direction="column"
                            align="center">
                            <DSHeading
                                level={3}
                                size="lg">
                                <span style={{ color: 'white' }}>Something went wrong</span>
                            </DSHeading>
                            <DSText style={{ color: '#9ca3af', textAlign: 'center' }}>{getErrorMessage()}</DSText>
                        </DSStack>

                        <DSStack
                            gap="small"
                            direction="row">
                            <DSButton
                                variant="primary"
                                size="medium"
                                onClick={onRetry || resetErrorBoundary}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Try Again
                            </DSButton>

                            {getErrorType() === 'chunk-error' && (
                                <DSButton
                                    variant="secondary"
                                    size="medium"
                                    onClick={() => window.location.reload()}>
                                    Reload Page
                                </DSButton>
                            )}
                        </DSStack>
                    </DSStack>
                </motion.div>
            </div>
        </div>
    )
}

// Network status hook with enhanced offline detection
function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(true)
    const [connectionSpeed, setConnectionSpeed] = useState('unknown')

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine)

            // Detect connection speed
            if ('connection' in navigator) {
                const conn = navigator.connection
                setConnectionSpeed(conn.effectiveType || 'unknown')

                const updateConnectionInfo = () => {
                    setConnectionSpeed(conn.effectiveType || 'unknown')
                }

                conn.addEventListener('change', updateConnectionInfo)

                return () => {
                    conn.removeEventListener('change', updateConnectionInfo)
                }
            }

            const handleOnline = () => setIsOnline(true)
            const handleOffline = () => setIsOnline(false)

            window.addEventListener('online', handleOnline)
            window.addEventListener('offline', handleOffline)

            return () => {
                window.removeEventListener('online', handleOnline)
                window.removeEventListener('offline', handleOffline)
            }
        }
    }, [])

    return { isOnline, connectionSpeed }
}

// Enhanced performance monitoring hook
function usePerformanceMonitoring() {
    const [metrics, setMetrics] = useState({
        loadTime: 0,
        renderTime: 0,
        apiLatency: 0
    })

    useEffect(() => {
        const startTime = performance.now()

        return () => {
            const loadTime = performance.now() - startTime
            setMetrics((prev) => ({ ...prev, loadTime }))
        }
    }, [])

    const trackApiCall = useCallback((startTime) => {
        const latency = performance.now() - startTime
        setMetrics((prev) => ({ ...prev, apiLatency: latency }))
    }, [])

    return { metrics, trackApiCall }
}

// Advanced caching hook
function useAdvancedCache() {
    const cache = useRef(new Map())
    const cacheTimestamps = useRef(new Map())
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

    const get = useCallback((key) => {
        const timestamp = cacheTimestamps.current.get(key)
        if (timestamp && Date.now() - timestamp < CACHE_DURATION) {
            return cache.current.get(key)
        }
        return null
    }, [])

    const set = useCallback((key, value) => {
        cache.current.set(key, value)
        cacheTimestamps.current.set(key, Date.now())
    }, [])

    const clear = useCallback(() => {
        cache.current.clear()
        cacheTimestamps.current.clear()
    }, [])

    return { get, set, clear }
}

function ExplorePageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Enhanced hooks
    const { isOnline, connectionSpeed } = useNetworkStatus()
    const { metrics, trackApiCall } = usePerformanceMonitoring()
    const cache = useAdvancedCache()

    // Refs for cleanup and optimization
    const abortControllerRef = useRef(null)
    const retryTimeoutRef = useRef(null)
    const searchTimeoutRef = useRef(null)
    const lastFetchParams = useRef(null)

    // Core state with enhanced error handling
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [initialLoading, setInitialLoading] = useState(true)
    const [totalItems, setTotalItems] = useState(0)
    const [apiError, setApiError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
    const [productCounts, setProductCounts] = useState({}) // New state for filter counts

    // Enhanced filter and UI state
    const [filters, setFilters] = useState(() => {
        try {
            const urlCategory = searchParams.get('category') || 'all'
            const urlSearch = searchParams.get('search') || ''
            const urlPriceMin = parseInt(searchParams.get('minPrice')) || 0
            const urlPriceMax = parseInt(searchParams.get('maxPrice')) || 1000
            const urlRating = parseInt(searchParams.get('rating')) || 0
            const urlVerified = searchParams.get('verified') === 'true'

            return {
                ...DEFAULT_FILTERS,
                category: urlCategory,
                search: urlSearch,
                priceRange: [urlPriceMin, urlPriceMax],
                rating: urlRating,
                verifiedOnly: urlVerified
            }
        } catch (error) {
            console.warn('Error parsing URL params:', error)
            return DEFAULT_FILTERS
        }
    })

    // Separate immediate search input state for responsive typing
    const [searchInput, setSearchInput] = useState(() => {
        try {
            return searchParams.get('search') || ''
        } catch (error) {
            return ''
        }
    })

    const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'newest')
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                return localStorage.getItem('exploreViewMode') || 'grid'
            } catch {
                return 'grid'
            }
        }
        return 'grid'
    })
    const [showFilters, setShowFilters] = useState(true)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [currentPage, setCurrentPage] = useState(() => {
        const page = parseInt(searchParams.get('page')) || 1
        return Math.max(1, page)
    })
    const [useVirtualization, setUseVirtualization] = useState(false)

    // Save view mode to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('exploreViewMode', viewMode)
            } catch (error) {
                console.warn('Error saving view mode:', error)
            }
        }
    }, [viewMode])

    // Enhanced debounced search with cancellation
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            setFilters((prev) => ({ ...prev, search: searchTerm }))
            setCurrentPage(1)
        }, 300),
        []
    )

    // Smart URL update with history management
    const updateURL = useCallback(
        (newFilters, newSort, newPage) => {
            try {
                const params = new URLSearchParams()

                if (newFilters.category !== 'all') params.set('category', newFilters.category)
                if (newFilters.search) params.set('search', newFilters.search)
                if (newFilters.rating > 0) params.set('rating', newFilters.rating.toString())
                if (newFilters.verifiedOnly) params.set('verified', 'true')
                if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0].toString())
                if (newFilters.priceRange[1] < 1000) params.set('maxPrice', newFilters.priceRange[1].toString())
                if (newSort !== 'newest') params.set('sort', newSort)
                if (newPage > 1) params.set('page', newPage.toString())

                const url = params.toString() ? `/explore?${params.toString()}` : '/explore'

                // Use replace for filter/sort changes, push for page changes
                if (newPage !== currentPage) {
                    router.push(url, { shallow: true })
                } else {
                    router.replace(url, { shallow: true })
                }
            } catch (error) {
                console.warn('Error updating URL:', error)
            }
        },
        [router, currentPage]
    )

    // Enhanced API call with comprehensive error handling and caching
    const fetchProducts = useCallback(
        async (isRetry = false, forceRefresh = false) => {
            // If a specific category is selected, defer to CategoryDetailClient to fetch and render products
            if (filters.category && filters.category !== 'all') {
                // Ensure we don't run the global products fetch for category-specific views
                setLoading(false)
                setInitialLoading(false)
                return
            }
            try {
                const apiStartTime = performance.now()

                // Cancel previous request
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort()
                }

                // Create new abort controller
                abortControllerRef.current = new AbortController()

                if (!isRetry) {
                    setLoading(true)
                    setApiError(null)
                }

                // Enhanced network status check
                if (!isOnline) {
                    throw new Error('No internet connection. Please check your network.')
                }

                if (connectionSpeed === 'slow-2g' && !forceRefresh) {
                    showMessage('Slow connection detected. Loading may take longer.', 'info')
                }

                // Build API params with validation
                const params = {
                    page: Math.max(1, currentPage),
                    limit: Math.min(Math.max(1, ITEMS_PER_PAGE), 50), // Validate limits
                    signal: abortControllerRef.current.signal
                }

                // Enhanced sorting configuration
                const sortConfig = {
                    newest: { sortBy: 'createdAt', sortOrder: 'desc' },
                    popular: { sortBy: 'popularity', sortOrder: 'desc' },
                    featured: { sortBy: 'popularity', sortOrder: 'desc' }, // Use popularity for featured since backend doesn't support isFeatured
                    'price-low': { sortBy: 'price', sortOrder: 'asc' },
                    'price-high': { sortBy: 'price', sortOrder: 'desc' },
                    rating: { sortBy: 'rating', sortOrder: 'desc' },
                    sales: { sortBy: 'sales', sortOrder: 'desc' },
                    trending: { sortBy: 'popularity', sortOrder: 'desc' } // Use popularity for trending as well
                }

                const sort = sortConfig[sortBy] || sortConfig.newest
                Object.assign(params, sort)

                // Convert price range to backend-compatible priceCategory
                const getPriceCategory = (priceRange) => {
                    if (!priceRange || !Array.isArray(priceRange)) return null

                    const [min, max] = priceRange

                    // If both min and max are default values, don't send price filter
                    if (min === 0 && max >= 1000) return null

                    // Free products
                    if (min === 0 && max === 0) return 'free'

                    // Under $20
                    if (min === 0 && max <= 20) return 'under_20'

                    // $20 - $50
                    if (min >= 20 && max <= 50) return '20_to_50'

                    // Over $50
                    if (min >= 50) return 'over_50'

                    // For custom ranges, use the closest category
                    if (max <= 20) return 'under_20'
                    if (max <= 50) return '20_to_50'
                    return 'over_50'
                }

                // Enhanced filter application with validation
                if (filters.search?.trim()) {
                    params.search = filters.search.trim().substring(0, 100) // Limit search length
                }

                if (filters.category && filters.category !== 'all') {
                    params.category = filters.category
                }

                // Add new filter parameters for backend alignment
                if (filters.type && filters.type !== 'all') {
                    params.type = filters.type
                }

                if (filters.industry && filters.industry !== 'all') {
                    params.industry = filters.industry
                }

                if (filters.setupTime && filters.setupTime !== 'all') {
                    params.setupTime = filters.setupTime
                }

                // Use priceCategory instead of minPrice/maxPrice
                const priceCategory = getPriceCategory(filters.priceRange)
                if (priceCategory) {
                    params.priceCategory = priceCategory
                }

                if (filters.rating && filters.rating > 0) {
                    params.minRating = Math.min(Math.max(0, filters.rating), 5)
                }

                if (filters.verifiedOnly) {
                    params.verifiedOnly = 'true'
                }

                // Check cache for non-search queries
                const cacheKey = JSON.stringify(params)
                if (!forceRefresh && !params.search) {
                    const cachedData = cache.get(cacheKey)
                    if (cachedData) {
                        setProducts(cachedData.products)
                        setTotalItems(cachedData.totalItems)
                        setLoading(false)
                        setInitialLoading(false)
                        return
                    }
                }

                // Prevent duplicate requests
                const currentParamsString = JSON.stringify(params)
                if (lastFetchParams.current === currentParamsString && !forceRefresh) {
                    return
                }
                lastFetchParams.current = currentParamsString

                const response = await productsAPI.getProducts(params)

                trackApiCall(apiStartTime)

                // Enhanced response handling with validation
                if (response?.data) {
                    const productsData = response.data.products || response.data.data || response.data || []
                    const paginationData = response.data.pagination || response.data.meta || {}

                    // Validate and sanitize product data
                    const validProducts = Array.isArray(productsData) ? productsData.filter((p) => p && (p.id || p._id) && p.title) : []

                    const totalCount = Math.max(0, paginationData.totalItems || paginationData.total || validProducts.length || 0)

                    setProducts(validProducts)
                    setTotalItems(totalCount)
                    setRetryCount(0)
                    setLastUpdateTime(Date.now())

                    // Cache successful results
                    if (!params.search) {
                        cache.set(cacheKey, { products: validProducts, totalItems: totalCount })
                    }

                    // Show success toast for retries
                    if (isRetry) {
                        showMessage('Products loaded successfully!', 'success')
                    }

                    // Enable virtualization for large datasets
                    setUseVirtualization(validProducts.length > 20)
                } else {
                    setProducts([])
                    setTotalItems(0)
                }
            } catch (error) {
                // Enhanced error handling with categorization
                if (error.name === 'AbortError') {
                    return // Request was aborted, ignore
                }

                let errorMessage = 'Failed to load products'
                let shouldRetry = false

                if (!isOnline) {
                    errorMessage = 'You appear to be offline. Please check your connection.'
                } else if (error.name === 'TimeoutError') {
                    errorMessage = 'Request timed out. Please try again.'
                    shouldRetry = true
                } else if (error.message?.includes('fetch')) {
                    errorMessage = 'Network error. Please check your connection.'
                    shouldRetry = true
                } else if (error.status === 429) {
                    errorMessage = 'Too many requests. Please wait a moment.'
                    shouldRetry = true
                } else if (error.status >= 500) {
                    errorMessage = 'Looks like some internal issue. We are fixing it soon'
                    shouldRetry = true
                } else if (error.message) {
                    errorMessage = error.message
                }

                setApiError(errorMessage)
                setProducts([])
                setTotalItems(0)

                // Smart retry logic with exponential backoff
                if (shouldRetry && retryCount < 3) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)

                    retryTimeoutRef.current = setTimeout(() => {
                        setRetryCount((prev) => prev + 1)
                        fetchProducts(true)
                    }, delay)

                    showMessage('Retrying in ${Math.ceil(delay / 1000)} seconds...', 'info')
                } else {
                    showMessage(errorMessage, 'error')
                }

                // Log error for monitoring (in production, send to error tracking service)
                console.error('Explore API Error:', {
                    error,
                    params: lastFetchParams.current,
                    retryCount,
                    timestamp: new Date().toISOString()
                })
            } finally {
                setLoading(false)
                setInitialLoading(false)
            }
        },
        [currentPage, sortBy, filters, isOnline, connectionSpeed, retryCount, cache, trackApiCall]
    )

    // Enhanced API call to fetch filter counts
    const fetchFilterCounts = useCallback(async () => {
        try {
            // Build filter params for counting
            const countParams = {
                // Include current filters except the ones we're counting
                ...(filters.search && { search: filters.search }),
                ...(filters.rating > 0 && { minRating: filters.rating }),
                ...(filters.verifiedOnly && { verifiedOnly: 'true' })
            }

            const response = await productsAPI.getFilterCounts(countParams)

            if (response?.data) {
                setProductCounts(response.data)
            }
        } catch (error) {
            console.warn('Error fetching filter counts:', error)
            // Set default counts if API fails
            setProductCounts({
                productTypes: {},
                categories: {},
                industries: {},
                setupTimes: {},
                priceRanges: {},
                ratings: {},
                verified: 0
            })
        }
    }, [filters.search, filters.rating, filters.verifiedOnly])

    // Fetch filter counts when filters change
    useEffect(() => {
        fetchFilterCounts()
    }, [fetchFilterCounts])

    // Computed values with enhanced logic
    const totalPages = useMemo(() => {
        const pages = Math.ceil(totalItems / ITEMS_PER_PAGE)
        return Math.max(1, pages)
    }, [totalItems])

    const hasActiveFilters = useMemo(
        () =>
            filters.category !== 'all' ||
            filters.search ||
            filters.rating > 0 ||
            filters.verifiedOnly ||
            (filters.priceRange && (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000)),
        [filters]
    )

    const isSlowConnection = connectionSpeed === 'slow-2g' || connectionSpeed === '2g'

    // Enhanced event handlers
    const handleFilterChange = useCallback(
        (newFilters) => {
            try {
                setFilters(newFilters)
                setCurrentPage(1)
                cache.clear() // Clear cache when filters change
            } catch (error) {
                console.warn('Error updating filters:', error)
            }
        },
        [cache]
    )

    const handleSortChange = useCallback((newSort) => {
        setSortBy(newSort)
        setCurrentPage(1)
    }, [])

    const handleSearchChange = useCallback(
        (searchTerm) => {
            // Update input immediately for responsive UI
            setSearchInput(searchTerm)
            // Debounce the actual filter update
            debouncedSearch(searchTerm)
        },
        [debouncedSearch]
    )

    const handleViewModeChange = useCallback((mode) => {
        setViewMode(mode)
    }, [])

    const handlePageChange = useCallback((page) => {
        setCurrentPage(page)
        // Smooth scroll to top of products
        const element = document.getElementById('products-section')
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [])

    const clearFilters = useCallback(() => {
        setFilters(DEFAULT_FILTERS)
        setCurrentPage(1)
        setSortBy('newest')
    }, [])

    const handleRetry = useCallback(() => {
        setRetryCount(0)
        fetchProducts()
    }, [fetchProducts])

    // Enhanced Network status indicator
    const NetworkIndicator = () => (
        <AnimatePresence>
            {!isOnline && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500/90 backdrop-blur-xl text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-red-400">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm font-medium">You're offline</span>
                </motion.div>
            )}
            {isOnline && isSlowConnection && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500/90 backdrop-blur-xl text-black px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 border border-yellow-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Slow connection detected</span>
                </motion.div>
            )}
        </AnimatePresence>
    )

    // Effect to fetch products when dependencies change
    useEffect(() => {
        let isMounted = true

        const loadProducts = async () => {
            if (isMounted) {
                await fetchProducts()
            }
        }

        loadProducts()

        // Cleanup
        return () => {
            isMounted = false
            if (abortControllerRef.current) {
                abortControllerRef.current.abort()
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
        }
    }, [
        currentPage,
        sortBy,
        filters.category,
        filters.type,
        filters.industry,
        filters.setupTime,
        filters.search,
        filters.rating,
        filters.verifiedOnly,
        filters.priceRange?.[0],
        filters.priceRange?.[1]
    ])

    // Separate effect for URL updates to prevent circular dependency
    useEffect(() => {
        updateURL(filters, sortBy, currentPage)
    }, [filters, sortBy, currentPage, router])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current)
            }
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    return (
        <ErrorBoundary FallbackComponent={ExploreErrorBoundary}>
            <div className="min-h-screen bg-black text-white">
                <Header />
                <NetworkIndicator />

                <main className="pt-24 pb-16">
                    <DSContainer>
                        {/* Enhanced Page Header with real-time stats */}
                        <Suspense
                            fallback={
                                <DSLoadingState
                                    type="skeleton"
                                    height="80px"
                                    className="mb-8"
                                />
                            }>
                            <ExploreHeader />
                        </Suspense>

                        {/* Enhanced Search and Controls */}
                        <ExploreControls
                            filters={{ ...filters, search: searchInput }} // Use searchInput for immediate UI feedback
                            sortBy={sortBy}
                            viewMode={viewMode}
                            showFilters={showFilters}
                            onSearch={handleSearchChange}
                            onSortChange={handleSortChange}
                            onViewModeChange={handleViewModeChange}
                            onToggleFilters={() => setShowFilters(!showFilters)}
                            onToggleMobileFilters={() => setShowMobileFilters(true)}
                        />

                        {/* Enhanced Active Filters */}
                        <ActiveFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                        />

                        <div className="flex gap-6">
                            {/* Enhanced Desktop Filters Sidebar */}
                            <AnimatePresence mode="wait">
                                {showFilters && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="hidden lg:block overflow-hidden flex-shrink-0">
                                        <FilterSidebar
                                            filters={filters}
                                            categories={CATEGORIES}
                                            productTypes={PRODUCT_TYPES}
                                            industries={INDUSTRIES}
                                            setupTimes={SETUP_TIMES}
                                            productCounts={productCounts}
                                            onFilterChange={handleFilterChange}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Enhanced Products Section */}
                            <div
                                className="flex-1 min-w-0"
                                id="products-section">
                                {initialLoading ? (
                                    <DSLoadingState
                                        icon={Loader2}
                                        message="Discovering Amazing Products"
                                        description="Finding the perfect tools for you..."
                                        className="min-h-[60vh]"
                                    />
                                ) : apiError && products.length === 0 ? (
                                    <ExploreErrorBoundary
                                        error={{ message: apiError }}
                                        onRetry={handleRetry}
                                    />
                                ) : // If a specific category is selected, mount CategoryDetailClient which handles filters, pagination and URL-sync
                                filters.category && filters.category !== 'all' ? (
                                    <CategoryDetailClient categoryId={filters.category} />
                                ) : (
                                    <>
                                        {/* Enhanced Products Grid with virtualization support */}
                                        {useVirtualization && products.length > 50 ? (
                                            <VirtualizedProductGrid
                                                products={products}
                                                loading={loading && !initialLoading}
                                                error={null}
                                                onClearFilters={clearFilters}
                                                containerHeight={800}
                                                containerWidth={typeof window !== 'undefined' ? window.innerWidth - 400 : 1200}
                                            />
                                        ) : (
                                            <ProductGrid
                                                products={products}
                                                viewMode={viewMode}
                                                loading={loading && !initialLoading}
                                                error={null}
                                                onClearFilters={clearFilters}
                                            />
                                        )}

                                        {/* Enhanced Pagination with smart loading */}
                                        {!loading && !apiError && totalPages > 1 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="mt-12">
                                                <Pagination
                                                    currentPage={currentPage}
                                                    totalPages={totalPages}
                                                    onPageChange={handlePageChange}
                                                    isLoading={loading}
                                                    hasNextPage={currentPage < totalPages}
                                                    hasPrevPage={currentPage > 1}
                                                />
                                            </motion.div>
                                        )}

                                        {/* Enhanced Results Summary with performance insights */}
                                        {!loading && !apiError && products.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.3 }}
                                                className="mt-8 text-center">
                                                <DSStack
                                                    gap="small"
                                                    direction="column"
                                                    align="center">
                                                    <DSText
                                                        size="sm"
                                                        style={{ color: '#9ca3af' }}>
                                                        Showing {products.length} of {totalItems.toLocaleString()} products
                                                    </DSText>
                                                    {hasActiveFilters && (
                                                        <DSButton
                                                            variant="secondary"
                                                            size="small"
                                                            onClick={clearFilters}>
                                                            Clear filters
                                                        </DSButton>
                                                    )}
                                                </DSStack>
                                            </motion.div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </DSContainer>
                </main>

                {/* Enhanced Mobile Filter Drawer */}
                <MobileFilterDrawer
                    isOpen={showMobileFilters}
                    onClose={() => setShowMobileFilters(false)}
                    filters={filters}
                    categories={CATEGORIES}
                    onFilterChange={handleFilterChange}
                />
            </div>
        </ErrorBoundary>
    )
}

// Main export wrapped with Suspense
export default function ExplorePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white">
                    <Header />
                    <div className="pt-24 pb-16">
                        <DSContainer>
                            <DSLoadingState
                                icon={Loader2}
                                message="Loading Explore Page"
                                description="Setting up your browsing experience..."
                                className="min-h-[60vh]"
                            />
                        </DSContainer>
                    </div>
                </div>
            }>
            <ExplorePageContent />
        </Suspense>
    )
}

