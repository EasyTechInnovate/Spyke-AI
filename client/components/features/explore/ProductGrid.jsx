import { Package2, AlertCircle } from 'lucide-react'
import ProductCardLite from './ProductCardLite'
import { memo } from 'react'

const ProductGrid = memo(function ProductGrid({ 
  products, 
  viewMode, 
  loading,
  error,
  onClearFilters 
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Failed to load products</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Package2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-gray-400 mb-6">
          Try adjusting your filters or search criteria
        </p>
        <button
          onClick={onClearFilters}
          className="px-6 py-2 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
        >
          Clear Filters
        </button>
      </div>
    )
  }

  return (
    <div className={`
      grid gap-6
      ${viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
        : 'grid-cols-1'
      }
    `}>
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