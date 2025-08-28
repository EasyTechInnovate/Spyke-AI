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
import { productsAPI } from '@/lib/api'
import { CATEGORIES, PRODUCT_TYPES, INDUSTRIES, SETUP_TIMES, ITEMS_PER_PAGE, DEFAULT_FILTERS } from '@/data/explore/constants'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'

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
        const search = get('search', '')
        const sort = get('sort', 'newest') // retained in UI only
        const rating = parseInt(get('rating', '0')) || 0
        const verifiedOnly = get('verified', '') === 'true'
        const minPrice = parseInt(get('minPrice', '0')) || 0
        const maxPrice = parseInt(get('maxPrice', '1000')) || 1000
        return { page, category, search, sort, rating, verifiedOnly, priceRange: [minPrice, maxPrice] }
    }, [searchParams])
}

function useExploreData(initialURLState) {
    const mounted = useMounted()
    const online = useNetwork()
    const [products, setProducts] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const abortRef = useRef(null)
    const cache = useRef(new Map())

    const fetchProducts = useCallback(
        async (filters) => {
            if (!online) {
                setError('You are offline')
                return
            }
            setLoading(true)
            setError(null)
            const params = {
                page: filters.page,
                limit: ITEMS_PER_PAGE,
                ...(filters.category !== 'all' && { category: filters.category }),
                ...(filters.search && { search: filters.search.trim().slice(0, 100) }),
                ...(filters.rating > 0 && { minRating: filters.rating }),
                ...(filters.verifiedOnly && { verifiedOnly: 'true' }),
                ...(() => {
                    // price range map -> priceCategory
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
                if (!mounted.current) return
                setProducts(list)
                setTotalItems(total)
                cache.current.set(key, { products: list, totalItems: total })
            } catch (e) {
                if (e.name === 'AbortError') return
                setError(e?.message || 'Failed to load products')
                setProducts([])
                setTotalItems(0)
            } finally {
                if (mounted.current) setLoading(false)
            }
        },
        [online, mounted]
    )

    useEffect(() => {
        fetchProducts(initialURLState)
    }, []) // initial mount

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
    const urlState = useURLState()

    const [filters, setFilters] = useState({
        ...DEFAULT_FILTERS,
        category: urlState.category,
        search: urlState.search,
        priceRange: urlState.priceRange,
        rating: urlState.rating,
        verifiedOnly: urlState.verifiedOnly
    })
    const [page, setPage] = useState(urlState.page)
    const [showFilters, setShowFilters] = useState(true)
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [viewMode, setViewMode] = useState('grid')

    const debouncedSearch = useDebounce(filters.search, 350)

    const { products, totalItems, loading, error, fetchProducts } = useExploreData({ ...filters, page })

    useEffect(() => {
        fetchProducts({ ...filters, search: debouncedSearch, page })
    }, [filters.category, debouncedSearch, filters.rating, filters.verifiedOnly, filters.priceRange[0], filters.priceRange[1], page, fetchProducts])

    useEffect(() => {
        const params = new URLSearchParams()
        if (filters.category !== 'all') params.set('category', filters.category)
        if (filters.search) params.set('search', filters.search)
        if (filters.rating > 0) params.set('rating', String(filters.rating))
        if (filters.verifiedOnly) params.set('verified', 'true')
        if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]))
        if (filters.priceRange[1] < 1000) params.set('maxPrice', String(filters.priceRange[1]))
        if (page > 1) params.set('page', String(page))
        const qs = params.toString()
        router.replace(qs ? `/explore?${qs}` : '/explore')
    }, [filters, page, router])

    const totalPages = useMemo(() => Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE)), [totalItems])

    const hasActiveFilters = useMemo(
        () =>
            filters.category !== 'all' ||
            !!filters.search ||
            filters.rating > 0 ||
            filters.verifiedOnly ||
            filters.priceRange[0] > 0 ||
            filters.priceRange[1] < 1000,
        [filters]
    )

    const handleFilterChange = (next) => {
        setFilters(next)
        setPage(1)
    }

    const clearFilters = () => {
        setFilters(DEFAULT_FILTERS)
        setPage(1)
    }

    const handlePageChange = (p) => {
        setPage(p)
        if (typeof window !== 'undefined') {
            const el = document.getElementById('products-section')
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    const useVirtual = products.length > 50

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <main className="pt-24 pb-16 max-w-7xl mx-auto px-4">
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
                    onSearch={(s) => setFilters((f) => ({ ...f, search: s }))}
                    onViewModeChange={setViewMode}
                    onToggleFilters={() => setShowFilters((v) => !v)}
                    onToggleMobileFilters={() => setShowMobileFilters(true)}
                />

                <ActiveFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* Layout */}
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
                                onRetry={() => fetchProducts({ ...filters, search: debouncedSearch, page })}
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
                onClose={() => setShowMobileFilters(false)}
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

/* ----------------------------- Helper Components ---------------------------- */
function Spinner({ large = false, label }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <Loader2 className={`animate-spin text-gray-400 ${large ? 'h-10 w-10' : 'h-6 w-6'}`} />
            {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
    )
}

function ErrorState({ message, onRetry }) {
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
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm">
                    Reload
                </button>
            </div>
        </div>
    )
}

