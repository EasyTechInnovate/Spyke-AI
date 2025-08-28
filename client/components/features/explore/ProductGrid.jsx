import { Package2, AlertCircle } from 'lucide-react'
import ProductCardLite from './ProductCardLite'
import { memo } from 'react'

const SkeletonCard = () => (
  <div className="rounded-2xl border border-[#1e1e1e] bg-gradient-to-b from-[#121212] to-[#0d0d0d] p-4 animate-pulse">
    <div className="aspect-[4/3] rounded-xl bg-[#1f1f1f] mb-4" />
    <div className="h-4 bg-[#1f1f1f] rounded w-3/4 mb-3" />
    <div className="h-3 bg-[#1f1f1f] rounded w-full mb-2" />
    <div className="h-3 bg-[#1f1f1f] rounded w-2/5" />
  </div>
)

const ProductGrid = memo(function ProductGrid({ 
  products, 
  viewMode, 
  loading,
  error,
  onClearFilters 
}) {
  if (loading) {
    return (
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] mb-5">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase tracking-wide text-gray-300">Error</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load products</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center max-w-sm">
          <Package2 className="w-14 h-14 text-gray-600 mx-auto mb-5" />
          <h3 className="text-lg font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">Adjust your filters or search criteria to broaden results.</p>
          <button
            onClick={onClearFilters}
            className="px-5 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#3a3a3a] rounded-xl transition-colors text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} transition-all`}> 
      {products.map((product) => (
        <ProductCardLite 
          key={product._id || product.id}
          product={product} 
          viewMode={viewMode}
        />
      ))}
    </div>
  )
})

export default ProductGrid