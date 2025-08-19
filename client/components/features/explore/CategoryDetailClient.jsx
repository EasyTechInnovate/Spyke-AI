'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import EnhancedProductShowcase from '@/components/features/seller/profile/EnhancedProductShowcase'
import productsAPI from '@/lib/api/products'
import FilterSidebar from '@/components/features/explore/FilterSidebar'

export default function CategoryDetailClient({ categoryId }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize filters and pagination from URL (if present) so links are shareable
  const initialCategory = categoryId || (searchParams?.get('category') ?? 'all')
  const initialPage = parseInt(searchParams?.get('page')) || 1
  const initialSort = searchParams?.get('sort') || 'newest'

  const [filters, setFilters] = useState({ category: initialCategory, priceRange: 'all', type: 'all', sortBy: initialSort })
  const [pagination, setPagination] = useState({ page: initialPage, limit: 12, totalPages: 1 })

  const fetchProducts = useCallback(async (opts = {}) => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        category: filters.category,
        page: pagination.page,
        limit: pagination.limit,
        sortBy: filters.sortBy,
        sortOrder: 'desc'
      }

      // merge any explicit overrides
      Object.assign(params, opts)

      const res = await productsAPI.getProducts(params)
      const data = res?.data || res
      setProducts(data?.products || [])

      if (data?.pagination) {
        setPagination((p) => ({ ...p, totalPages: data.pagination.totalPages || 1, page: data.pagination.currentPage || p.page }))
      }
    } catch (err) {
      setError(err?.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters.category, filters.sortBy, pagination.limit, pagination.page])

  useEffect(() => {
    // reset to page 1 when category or filters change
    setPagination((p) => ({ ...p, page: 1 }))
  }, [filters.category, filters.priceRange, filters.type, filters.sortBy])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts, pagination.page])

  // Keep URL in sync with filters and pagination so the page is shareable
  useEffect(() => {
    try {
      const params = new URLSearchParams()
      if (filters.category && filters.category !== 'all') params.set('category', filters.category)
      if (filters.sortBy && filters.sortBy !== 'newest') params.set('sort', filters.sortBy)
      if (pagination.page && pagination.page > 1) params.set('page', pagination.page.toString())
      const url = params.toString() ? `/explore?${params.toString()}` : '/explore'
      // Use replace to avoid polluting history on small filter changes
      router.replace(url)
    } catch (err) {
      // ignore
    }
  }, [filters.category, filters.sortBy, pagination.page, router])

  const handleFilterChange = (newPartial) => {
    setFilters((prev) => ({ ...prev, ...newPartial }))
  }

  if (loading) {
    return <div className="py-12 flex items-center justify-center text-gray-400">Loading products…</div>
  }

  if (error) {
    return <div className="py-12 text-center text-red-400">{error}</div>
  }

  return (
    <div className="min-h-screen bg-[#121212] px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <FilterSidebar
              filters={filters}
              categories={[]}
              productTypes={[]}
              industries={[]}
              setupTimes={[]}
              onFilterChange={(f) => handleFilterChange(f)}
            />
          </aside>

          <main className="lg:col-span-3">
            <EnhancedProductShowcase
              products={products}
              filters={filters}
              onFilterChange={handleFilterChange}
              onProductClick={(slug) => { window.location.href = `/products/${slug}` }}
            />

            {/* Pagination controls */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50"
              >Previous</button>

              <span className="text-gray-400">Page {pagination.page} of {pagination.totalPages}</span>

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50"
              >Next</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
