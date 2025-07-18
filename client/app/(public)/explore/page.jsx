'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { debounce } from '@/utils/debounce'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import ExploreHeader from '@/components/features/explore/ExploreHeader'
import ExploreControls from '@/components/features/explore/ExploreControls'
import ActiveFilters from '@/components/features/explore/ActiveFilters'
import ProductGrid from '@/components/features/explore/ProductGrid'
import Pagination from '@/components/features/explore/Pagination'
// Removed useExplore import - managing state directly
import { productsAPI } from '@/lib/api'
import { CATEGORIES, ITEMS_PER_PAGE } from '@/data/explore/constants'

// Dynamic imports for heavy components
const FilterSidebar = dynamic(() => import('@/components/features/explore/FilterSidebar'), {
  loading: () => <div className="w-72 h-96 bg-gray-900 rounded-2xl animate-pulse" />
})

const MobileFilterDrawer = dynamic(() => import('@/components/features/explore/MobileFilterDrawer'))

export default function ExplorePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalItems, setTotalItems] = useState(0)
  const [apiError, setApiError] = useState(null)
  
  // Use state directly since API handles filtering
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: [],
    priceRange: '',
    rating: 0,
    setupTime: [],
    industry: 'all',
    verifiedOnly: false
  })
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(true)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const handleSearch = useCallback(
    debounce((searchTerm) => {
      setFilters(prev => ({ ...prev, search: searchTerm }))
      setCurrentPage(1)
    }, 300),
    []
  )

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      type: [],
      priceRange: '',
      rating: 0,
      setupTime: [],
      industry: 'all',
      verifiedOnly: false
    })
    setCurrentPage(1)
  }, [])

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setApiError(null)
        
        // Start with minimal params to debug
        const params = {
          page: 1,
          limit: 20
        }

        // Handle sorting
        if (sortBy === 'newest') {
          params.sortBy = 'createdAt'
          params.sortOrder = 'desc'
        } else if (sortBy === 'popular' || sortBy === 'featured') {
          params.sortBy = 'popularity'
          params.sortOrder = 'desc'
        } else if (sortBy === 'price-low') {
          params.sortBy = 'price'
          params.sortOrder = 'asc'
        } else if (sortBy === 'price-high') {
          params.sortBy = 'price'
          params.sortOrder = 'desc'
        }

        // Apply filters
        if (filters.search) params.search = filters.search
        if (filters.category && filters.category !== 'all') params.category = filters.category
        if (filters.type && filters.type.length > 0) params.type = filters.type[0] // API expects single type
        if (filters.priceRange) {
          if (filters.priceRange === 'free') params.price = 0
          else if (filters.priceRange === 'under-50') params.maxPrice = 50
          else if (filters.priceRange === 'under-100') params.maxPrice = 100
          else if (filters.priceRange === 'over-100') params.minPrice = 100
        }
        if (filters.rating && filters.rating > 0) params.minRating = filters.rating
        if (filters.setupTime && filters.setupTime.length > 0) params.setupTime = filters.setupTime[0]
        if (filters.verifiedOnly) params.verifiedOnly = 'true'

        console.log('Fetching products with params:', params)
        const response = await productsAPI.getProducts(params)
        console.log('API Response:', response)
        
        if (response && response.data) {
          // Check if response structure matches what we expect
          const productsData = response.data.products || response.data.data || response.data || []
          const paginationData = response.data.pagination || response.data.meta || {}
          
          setProducts(Array.isArray(productsData) ? productsData : [])
          setTotalItems(paginationData.totalItems || paginationData.total || productsData.length || 0)
          console.log('Products loaded:', productsData.length)
          console.log('Response structure:', Object.keys(response.data))
        } else {
          console.log('No data in response')
          setProducts([])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setApiError(error.message || 'Failed to load products')
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, sortBy, filters])

  // Use API products directly since pagination is handled server-side
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedProducts = products

  // Simplified handlers without tracking
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
  }

  const handleSearchWithTracking = (searchTerm) => {
    handleSearch(searchTerm)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <main className="pt-24 pb-16">
        <Container>
          {/* Page Header */}
          <ExploreHeader />

          {/* Search and Controls */}
          <ExploreControls
            filters={filters}
            sortBy={sortBy}
            viewMode={viewMode}
            showFilters={showFilters}
            onSearch={handleSearchWithTracking}
            onSortChange={handleSortChange}
            onViewModeChange={setViewMode}
            onToggleFilters={() => setShowFilters(!showFilters)}
            onToggleMobileFilters={() => setShowMobileFilters(true)}
          />

          {/* Active Filters */}
          <ActiveFilters
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            {showFilters && (
              <div className="hidden lg:block transition-all duration-300">
                <div className="w-72">
                  <FilterSidebar
                    filters={filters}
                    categories={CATEGORIES}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              <ProductGrid
                products={paginatedProducts}
                viewMode={viewMode}
                loading={loading}
                error={apiError}
                onClearFilters={clearFilters}
              />

              {/* Pagination */}
              {!loading && !apiError && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </Container>
      </main>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={filters}
        categories={CATEGORIES}
        onFilterChange={handleFilterChange}
      />
    </div>
  )
}