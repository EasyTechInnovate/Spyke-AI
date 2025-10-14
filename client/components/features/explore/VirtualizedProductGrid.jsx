import { memo, useCallback } from 'react'
import { FixedSizeGrid as Grid } from 'react-window'
import ProductCardLite from './ProductCardLite'
import { Package2, AlertCircle } from 'lucide-react'
const VirtualizedProductGrid = memo(function VirtualizedProductGrid({
  products,
  viewMode,
  loading,
  error,
  onClearFilters,
  containerHeight = 800,
  containerWidth,
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
            aria-label="Reload page to try loading products again"
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
          aria-label="Clear all active filters to show all products"
        >
          Clear Filters
        </button>
      </div>
    )
  }
  const columnCount = viewMode === 'grid' 
    ? containerWidth < 768 ? 1 : containerWidth < 1280 ? 2 : 3
    : 1
  const columnWidth = Math.floor(containerWidth / columnCount)
  const rowHeight = viewMode === 'grid' ? 380 : 180
  const rowCount = Math.ceil(products.length / columnCount)
  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex
    if (index >= products.length) return null
    const product = products[index]
    return (
      <div style={{
        ...style,
        padding: '12px',
      }}>
        <ProductCardLite 
          product={product} 
          viewMode={viewMode}
        />
      </div>
    )
  }, [products, viewMode, columnCount])
  return (
    <Grid
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={containerHeight}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={containerWidth}
      overscanRowCount={2}
      overscanColumnCount={1}
    >
      {Cell}
    </Grid>
  )
})
export default VirtualizedProductGrid