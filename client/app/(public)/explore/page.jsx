'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import ExploreHeader from '@/components/features/explore/ExploreHeader'
import ExploreControls from '@/components/features/explore/ExploreControls'
import ActiveFilters from '@/components/features/explore/ActiveFilters'
import ProductGrid from '@/components/features/explore/ProductGrid'
import Pagination from '@/components/features/explore/Pagination'
import { useExplore } from '@/hooks/useExplore'
import { MOCK_PRODUCTS } from '@/data/explore/mockProducts'
import { CATEGORIES, ITEMS_PER_PAGE } from '@/data/explore/constants'

// Dynamic imports for heavy components
const FilterSidebar = dynamic(() => import('@/components/features/explore/FilterSidebar'), {
  loading: () => <div className="w-72 h-96 bg-gray-900 rounded-2xl animate-pulse" />
})

const MobileFilterDrawer = dynamic(() => import('@/components/features/explore/MobileFilterDrawer'))

export default function ExplorePage() {
  const [products] = useState(MOCK_PRODUCTS)
  const [loading] = useState(false)
  
  const {
    filters,
    sortBy,
    viewMode,
    showFilters,
    showMobileFilters,
    currentPage,
    filteredProducts,
    setFilters,
    setSortBy,
    setViewMode,
    setShowFilters,
    setShowMobileFilters,
    setCurrentPage,
    handleSearch,
    clearFilters
  } = useExplore(products)

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

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
                onClearFilters={clearFilters}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
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