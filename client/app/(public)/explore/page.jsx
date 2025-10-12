'use client'
import { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams, useRouter } from 'next/navigation'
import Header from '@/components/shared/layout/Header'
import ExploreHeader from '@/components/features/explore/ExploreHeader'
import ExploreControls from '@/components/features/explore/ExploreControls'
import ActiveFilters from '@/components/features/explore/ActiveFilters'
import ProductGrid from '@/components/features/explore/ProductGrid'
import Pagination from '@/components/features/explore/Pagination'
import { useAnalytics } from '@/hooks/useAnalytics'
import { productsAPI } from '@/lib/api'
import { CATEGORIES, PRODUCT_TYPES, INDUSTRIES, SETUP_TIMES, ITEMS_PER_PAGE, DEFAULT_FILTERS, SORT_OPTIONS } from '@/data/explore/constants'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import { categoryAPI } from '@/lib/api/toolsNiche'
const FilterSidebar = dynamic(() => import('@/components/features/explore/FilterSidebar'), { ssr: false })
const MobileFilterDrawer = dynamic(() => import('@/components/features/explore/MobileFilterDrawer'), { ssr: false })
const VirtualizedProductGrid = dynamic(() => import('@/components/features/explore/VirtualizedProductGrid'), { ssr: false })
function useMounted() {
    const mounted = useRef(false)
    useEffect(() => {
        mounted.current = true
        return () => {
            mounted.current = false
        }
    }, [])
    return mounted
}
function useNetwork() {
    const [online, setOnline] = useState(true)
    useEffect(() => {
        setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
        const on = () => setOnline(true)
        const off = () => setOnline(false)
        window.addEventListener('online', on)
        window.addEventListener('offline', off)
        return () => {
            window.removeEventListener('online', on)
            window.removeEventListener('offline', off)
        }
    }, [])
    return online
}
function useURLState() {
    const searchParams = useSearchParams()
    return useMemo(() => {
        const get = (k, d) => searchParams.get(k) ?? d
        const page = Math.max(1, parseInt(get('page', '1')) || 1)
        const category = get('category', 'all')
        const type = get('type', 'all')
        const industry = get('industry', 'all')
        const setupTime = get('setupTime', 'all')
        const search = get('search', '')
        const sort = get('sort', 'newest') 
        const rating = parseInt(get('rating', '0')) || 0
        const verifiedOnly = get('verified', '') === 'true'
        const minPrice = parseInt(get('minPrice', '0')) || 0
        const maxPrice = parseInt(get('maxPrice', '1000')) || 1000
        return { 
            page, 
            category, 
            type, 
            industry, 
            setupTime, 
            search, 
            sort, 
            rating, 
            verifiedOnly, 
            priceRange: [minPrice, maxPrice] 
        }
    }, [searchParams])
}
function isLikelyObjectId(val) {
    return typeof val === 'string' && /^[a-f0-9]{24}$/i.test(val)
}
function isLikelySlug(val) {
    return typeof val === 'string' && /-/.test(val) && !/_/.test(val) && !isLikelyObjectId(val)
}
const slugify = (val = '') =>
    val
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
function useExploreData(initialURLState) {
    const mounted = useMounted()
    const online = useNetwork()
    const { track } = useAnalytics()
    const [products, setProducts] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)
    const cache = useRef(new Map())
    const categorySlugMapRef = useRef(null) // slug -> id
    const categoriesLoadedRef = useRef(false)
    const resolvingRef = useRef(false)
    const resolveCategoryIfNeeded = useCallback(async (rawCategory) => {
        if (!rawCategory || rawCategory === 'all') return 'all'
        // If it's already an ObjectId or predefined underscore ID, return as-is
        if (isLikelyObjectId(rawCategory) || rawCategory.includes('_')) return rawCategory
        // If looks like a slug (hyphen based), attempt to resolve
        if (isLikelySlug(rawCategory)) {
            // Build map if not yet built
            if (!categoriesLoadedRef.current && !resolvingRef.current) {
                try {
                    resolvingRef.current = true
                    const res = await categoryAPI.getCategories()
                    const list = res?.data?.categories || res?.categories || res?.data || []
                    categorySlugMapRef.current = {}
                    list.forEach((c) => {
                        const name = c.name || c.title || ''
                        const slug = slugify(name)
                        const id = c._id || c.id
                        if (slug && id) {
                            categorySlugMapRef.current[slug] = id
                        }
                    })
                    categoriesLoadedRef.current = true
                } catch (e) {
                    console.warn('Failed to load categories for slug resolution:', e?.message)
                } finally {
                    resolvingRef.current = false
                }
            }
            if (categorySlugMapRef.current && categorySlugMapRef.current[rawCategory]) {
                return categorySlugMapRef.current[rawCategory]
            }
            // Fallback: return original slug (backend may also accept slug if implemented later)
            return rawCategory
        }
        return rawCategory
    }, [])
    const fetchProducts = useCallback(
        async (filters) => {
            if (!online) {
                track.system.errorOccurred('explore_offline', 'User is offline', {
                    filters: JSON.stringify(filters)
                });
                setError('You are offline')
                return
            }
            setLoading(true)
            setError(null)
            const fetchStartTime = performance.now();
            const sortOpt = SORT_OPTIONS.find((o) => o.id === (filters.sort || 'newest')) || SORT_OPTIONS[0]
            // Track search/filter activity
            track.product.productSearched(
                filters.search || '', 
                filters.page || 1, 
                {
                    category: filters.category,
                    type: filters.type,
                    industry: filters.industry,
                    setup_time: filters.setupTime,
                    rating_filter: filters.rating,
                    verified_only: filters.verifiedOnly,
                    price_range: filters.priceRange,
                    sort_option: sortOpt.id,
                    source: 'explore_page'
                }
            );
            // Resolve category (handles slug -> id mapping)
            const resolvedCategory = await resolveCategoryIfNeeded(filters.category)
            const params = {
                page: filters.page,
                limit: ITEMS_PER_PAGE,
                ...(resolvedCategory !== 'all' && { category: resolvedCategory }),
                ...(filters.type !== 'all' && { type: filters.type }),
                ...(filters.industry !== 'all' && { industry: filters.industry }),
                ...(filters.setupTime !== 'all' && { setupTime: filters.setupTime }),
                ...(filters.search && { search: filters.search.trim().slice(0, 100) }),
                ...(filters.rating > 0 && { minRating: filters.rating }),
                ...(filters.verifiedOnly && { verifiedOnly: 'true' }),
                sortBy: sortOpt.sortBy,
                sortOrder: sortOpt.sortOrder,
                ...(() => {
                    const [min, max] = filters.priceRange
                    if (min === 0 && max >= 1000) return {}
                    if (min === 0 && max === 0) return { priceCategory: 'free' }
                    if (min === 0 && max <= 20) return { priceCategory: 'under_20' }
                    if (min >= 20 && max <= 50) return { priceCategory: '20_to_50' }
                    if (min >= 50) return { priceCategory: 'over_50' }
                    if (max <= 20) return { priceCategory: 'under_20' }
                    if (max <= 50) return { priceCategory: '20_to_50' }
                    return { priceCategory: 'over_50' }
                })()
            }
            const key = JSON.stringify(params)
            if (cache.current.has(key)) {
                const cached = cache.current.get(key)
                const fetchDuration = performance.now() - fetchStartTime;
                track.engagement.featureUsed('explore_cache_hit', {
                    cache_key_length: key.length,
                    products_count: cached.products.length,
                    fetch_duration_ms: Math.round(fetchDuration),
                    source: 'explore_page'
                });
                setProducts(cached.products)
                setTotalItems(cached.totalItems)
                setLoading(false)
                return
            }
            try {
                if (abortRef.current) abortRef.current.abort()
                abortRef.current = new AbortController()
                const res = await productsAPI.getProducts(params)
                const data = res?.data || res
                const list = Array.isArray(data?.products) ? data.products : []
                const total = data?.pagination?.totalItems || data?.pagination?.total || list.length
                const fetchDuration = performance.now() - fetchStartTime;
                if (!mounted.current) return
                // Track successful product fetch
                track.system.apiCallMade('/api/products', 'GET', fetchDuration, 200);
                track.engagement.searchPerformed(
                    filters.search || '',
                    'products',
                    list.length
                );
                track.engagement.featureUsed('explore_products_loaded', {
                    products_count: list.length,
                    total_items: total,
                    page: filters.page || 1,
                    has_filters: Object.keys(filters).some(key => 
                        key !== 'page' && filters[key] !== DEFAULT_FILTERS[key]
                    ),
                    fetch_duration_ms: Math.round(fetchDuration),
                    cache_miss: true,
                    source: 'explore_page'
                });
                setProducts(list)
                setTotalItems(total)
                cache.current.set(key, { products: list, totalItems: total })
            } catch (e) {
                if (e.name === 'AbortError') return
                const fetchDuration = performance.now() - fetchStartTime;
                const errorMessage = e?.message || 'Failed to load products';
                track.system.errorOccurred('explore_fetch_failed', errorMessage, {
                    api_duration: fetchDuration,
                    filters: JSON.stringify(filters),
                    source: 'explore_page'
                });
                track.system.apiCallMade('/api/products', 'GET', fetchDuration, e.status || 500);
                setError(errorMessage)
                setProducts([])
                setTotalItems(0)
            } finally {
                if (mounted.current) setLoading(false)
            }
        },
        [online, mounted, resolveCategoryIfNeeded, track]
    )
    useEffect(() => {
        fetchProducts(initialURLState)
    }, []) 
    return { products, totalItems, loading, error, fetchProducts }
}
export default function ExplorePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Loading Explore…</div>}>
            <ExplorePageContent />
        </Suspense>
    )
}
function ExplorePageContent() {
    const router = useRouter()
    const { track } = useAnalytics()
    const urlState = useURLState()
    const [filters, setFilters] = useState({
        ...DEFAULT_FILTERS,
        category: urlState.category,
        type: urlState.type,
        industry: urlState.industry,
        setupTime: urlState.setupTime,
        search: urlState.search,
        priceRange: urlState.priceRange,
        rating: urlState.rating,
        verifiedOnly: urlState.verifiedOnly
    })
    const [sortId, setSortId] = useState(urlState.sort)
    const [page, setPage] = useState(urlState.page)
    const [showFilters, setShowFilters] = useState(true)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')
    const debouncedSearch = useDebounce(filters.search, 350)
    const { products, totalItems, loading, error, fetchProducts } = useExploreData({ ...filters, page, sort: urlState.sort })
    // Track page view on initial load
    useEffect(() => {
        track.engagement.pageViewed('/explore', 'discovery');
        // Track initial filters/search if present
        if (urlState.search || urlState.category !== 'all' || urlState.type !== 'all') {
            track.engagement.featureUsed('explore_page_loaded_with_params', {
                has_search: Boolean(urlState.search),
                search_query: urlState.search,
                category: urlState.category,
                type: urlState.type,
                industry: urlState.industry,
                page: urlState.page,
                source: 'explore_page_url'
            });
        }
    }, [track]);
    useEffect(() => {
        fetchProducts({ ...filters, search: debouncedSearch, page, sort: sortId })
    }, [filters.category, filters.type, filters.industry, filters.setupTime, debouncedSearch, filters.rating, filters.verifiedOnly, filters.priceRange[0], filters.priceRange[1], page, sortId, fetchProducts])
    useEffect(() => {
        const params = new URLSearchParams()
        if (filters.category !== 'all') params.set('category', filters.category)
        if (filters.type !== 'all') params.set('type', filters.type)
        if (filters.industry !== 'all') params.set('industry', filters.industry)
        if (filters.setupTime !== 'all') params.set('setupTime', filters.setupTime)
        if (filters.search) params.set('search', filters.search)
        if (filters.rating > 0) params.set('rating', String(filters.rating))
        if (filters.verifiedOnly) params.set('verified', 'true')
        if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]))
        if (filters.priceRange[1] < 1000) params.set('maxPrice', String(filters.priceRange[1]))
        if (page > 1) params.set('page', String(page))
        if (sortId) params.set('sort', sortId)
        const qs = params.toString()
        router.replace(qs ? `/explore?${qs}` : '/explore')
    }, [filters, page, sortId, router])
    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)), [totalItems])
    const hasActiveFilters = useMemo(
        () =>
            filters.category !== 'all' ||
            filters.type !== 'all' ||
            filters.industry !== 'all' ||
            filters.setupTime !== 'all' ||
            !!filters.search ||
            filters.rating > 0 ||
            filters.verifiedOnly ||
            filters.priceRange[0] > 0 ||
            filters.priceRange[1] < 1000,
        [filters]
    )
    const handleFilterChange = (next) => {
        // Track filter changes
        Object.keys(next).forEach(key => {
            if (next[key] !== filters[key]) {
                track.engagement.featureUsed('explore_filter_changed', {
                    filter_type: key,
                    old_value: filters[key],
                    new_value: next[key],
                    source: 'explore_page'
                });
            }
        });
        setFilters(next)
        setPage(1)
    }
    const clearFilters = () => {
        track.engagement.featureUsed('explore_filters_cleared', {
            previous_filters: JSON.stringify(filters),
            had_active_filters: hasActiveFilters,
            source: 'explore_page'
        });
        setFilters(DEFAULT_FILTERS)
        setPage(1)
    }
    const handlePageChange = (p) => {
        track.engagement.featureUsed('explore_page_changed', {
            from_page: page,
            to_page: p,
            total_pages: totalPages,
            products_per_page: ITEMS_PER_PAGE,
            source: 'explore_pagination'
        });
        setPage(p)
        if (typeof window !== 'undefined') {
            const el = document.getElementById('products-section')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }
    const handleSortChange = (id) => {
        const oldSort = SORT_OPTIONS.find(o => o.id === sortId);
        const newSort = SORT_OPTIONS.find(o => o.id === id);
        track.engagement.featureUsed('explore_sort_changed', {
            old_sort: oldSort?.id || 'newest',
            new_sort: id,
            old_sort_label: oldSort?.label,
            new_sort_label: newSort?.label,
            products_count: products.length,
            source: 'explore_page'
        });
        setSortId(id)
        setPage(1)
    };
    const handleViewModeChange = (mode) => {
        track.engagement.featureUsed('explore_view_mode_changed', {
            old_mode: viewMode,
            new_mode: mode,
            products_count: products.length,
            source: 'explore_page'
        });
        setViewMode(mode)
    };
    const handleToggleFilters = () => {
        track.engagement.featureUsed('explore_filters_toggled', {
            action: showFilters ? 'hide' : 'show',
            source: 'explore_page'
        });
        setShowFilters((v) => !v)
    };
    const handleToggleMobileFilters = () => {
        track.engagement.featureUsed('explore_mobile_filters_opened', {
            source: 'explore_page'
        });
        setShowMobileFilters(true)
    };
    const handleMobileFiltersClose = () => {
        track.engagement.featureUsed('explore_mobile_filters_closed', {
            source: 'explore_page'
        });
        setShowMobileFilters(false)
    };
    const handleRetry = () => {
        track.engagement.featureUsed('explore_retry_clicked', {
            error_message: error,
            source: 'explore_error_state'
        });
        fetchProducts({ ...filters, search: debouncedSearch, page })
    };
    const handleReload = () => {
        track.engagement.featureUsed('explore_reload_clicked', {
            error_message: error,
            source: 'explore_error_state'
        });
        window.location.reload()
    };
    const useVirtual = products.length > 50
    return (
        <div className="min-h-screen bg-black text-white">
            <main className="pt-2 pb-16 max-w-7xl mx-auto px-4">
                <Suspense
                    fallback={
                        <div className="h-20 flex items-center">
                            <Spinner label="Loading header" />
                        </div>
                    }>
                    <ExploreHeader />
                </Suspense>
                <ExploreControls
                    filters={filters}
                    viewMode={viewMode}
                    showFilters={showFilters}
                    onSearch={(s) => {
                        track.engagement.featureUsed('explore_search_input', {
                            search_query: s,
                            query_length: s.length,
                            source: 'explore_controls'
                        });
                        setFilters((f) => ({ ...f, search: s }))
                    }}
                    onViewModeChange={handleViewModeChange}
                    onToggleFilters={handleToggleFilters}
                    onToggleMobileFilters={handleToggleMobileFilters}
                    sortId={sortId}
                    sortOptions={SORT_OPTIONS}
                    onSortChange={handleSortChange}
                />
                <ActiveFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />
                <div className="flex gap-6">
                    {showFilters && (
                        <aside className="hidden lg:block w-72 flex-shrink-0">
                            <FilterSidebar
                                filters={filters}
                                categories={CATEGORIES}
                                productTypes={PRODUCT_TYPES}
                                industries={INDUSTRIES}
                                setupTimes={SETUP_TIMES}
                                onFilterChange={handleFilterChange}
                            />
                        </aside>
                    )}
                    <section
                        id="products-section"
                        className="flex-1 min-w-0">
                        {loading && products.length === 0 && (
                            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                                <Spinner large />
                                <p className="text-sm tracking-wide uppercase text-gray-500">Loading products…</p>
                            </div>
                        )}
                        {!loading && error && (
                            <ErrorState
                                message={error}
                                onRetry={handleRetry}
                                onReload={handleReload}
                            />
                        )}
                        {!error && products.length > 0 && (
                            <>
                                {useVirtual ? (
                                    <VirtualizedProductGrid
                                        products={products}
                                        loading={loading}
                                        error={null}
                                        onClearFilters={clearFilters}
                                        containerHeight={800}
                                        containerWidth={typeof window !== 'undefined' ? window.innerWidth - 400 : 1200}
                                    />
                                ) : (
                                    <ProductGrid
                                        products={products}
                                        viewMode={viewMode}
                                        loading={loading}
                                        error={null}
                                        onClearFilters={clearFilters}
                                    />
                                )}
                                {totalPages > 1 && (
                                    <div className="mt-12">
                                        <Pagination
                                            currentPage={page}
                                            totalPages={totalPages}
                                            onPageChange={handlePageChange}
                                            isLoading={loading}
                                            hasNextPage={page < totalPages}
                                            hasPrevPage={page > 1}
                                        />
                                    </div>
                                )}
                                <div className="mt-8 text-center text-sm text-gray-500">
                                    Showing {products.length} of {totalItems.toLocaleString()} products
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="ml-4 inline-flex items-center text-xs px-3 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-colors">
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        {!loading && !error && products.length === 0 && (
                            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4 text-gray-400">
                                <p className="text-xl font-semibold text-white">No products found</p>
                                {hasActiveFilters ? (
                                    <>
                                        <p className="text-sm">Try adjusting or clearing your filters.</p>
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm">
                                            Reset Filters
                                        </button>
                                    </>
                                ) : (
                                    <p className="text-sm">Try searching for something different.</p>
                                )}
                            </div>
                        )}
                    </section>
                </div>
            </main>
            <MobileFilterDrawer
                isOpen={showMobileFilters}
                onClose={handleMobileFiltersClose}
                filters={filters}
                categories={CATEGORIES}
                productTypes={PRODUCT_TYPES}
                industries={INDUSTRIES}
                setupTimes={SETUP_TIMES}
                onFilterChange={handleFilterChange}
            />
        </div>
    )
}
function Spinner({ large = false, label }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Loader2 className={`animate-spin text-gray-400 ${large ? 'h-10 w-10' : 'h-6 w-6'}`} />
            {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
    )
}
// Enhanced error state with analytics
function ErrorState({ message, onRetry, onReload }) {
    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-5 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2 max-w-sm">
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-sm text-gray-400">{message}</p>
            </div>
            <div className="flex gap-3">
                <button
                    onClick={onRetry}
                    className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm">
                    Retry
                </button>
                <button
                    onClick={onReload}
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm">
                    Reload
                </button>
            </div>
        </div>
    )
}