'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Star, StarOff, TrendingUp, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import Link from 'next/link'

export default function FeaturedProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [filterType])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: 1,
        limit: 50,
        status: 'published',
        sortBy: 'sales',
        sortOrder: 'desc'
      }
      
      if (filterType === 'featured') {
        params.isFeatured = true
      }
      
      const response = await productsAPI.getAllProductsAdmin(params)
      
      if (response.data) {
        setProducts(response.data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (productId, currentFeaturedStatus) => {
    try {
      await productsAPI.updateProduct(productId, { 
        isFeatured: !currentFeaturedStatus 
      })
      toast.success(currentFeaturedStatus ? 'Product removed from featured' : 'Product marked as featured')
      fetchProducts()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update product')
    }
  }

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Featured Products</h1>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium">
            {products.filter(p => p.isFeatured).length} featured
          </span>
        </div>
        <p className="text-gray-400">Manage featured products showcase on the homepage</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary"
          />
        </div>
        
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-brand-primary"
        >
          <option value="all">All Products</option>
          <option value="featured">Featured Only</option>
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
          <p className="text-gray-400">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-gray-900 border rounded-xl overflow-hidden hover:border-gray-700 transition-all ${
                product.isFeatured ? 'border-yellow-500/50' : 'border-gray-800'
              }`}
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-800">
                <OptimizedImage
                  src={product.thumbnail || 'https://placehold.co/400x300/1f1f1f/808080?text=Product'}
                  alt={product.title}
                  fill
                  className="object-cover"
                />
                {product.isFeatured && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-yellow-500 text-black text-sm font-bold rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current" />
                    Featured
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {product.shortDescription}
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
                  <div className="text-center">
                    <div className="text-white font-semibold">{product.sales || 0}</div>
                    <div className="text-gray-500 text-xs">Sales</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{product.views || 0}</div>
                    <div className="text-gray-500 text-xs">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">
                      {product.averageRating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-gray-500 text-xs">Rating</div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Revenue</span>
                    <span className="text-brand-primary font-medium">
                      ${((product.price || 0) * (product.sales || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Conversion</span>
                    <span className="text-white">
                      {product.views > 0 ? ((product.sales / product.views) * 100).toFixed(1) : '0'}%
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="flex-1 text-center px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors text-sm"
                  >
                    View
                  </Link>
                  
                  <button
                    onClick={() => toggleFeatured(product._id, product.isFeatured)}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
                      product.isFeatured
                        ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {product.isFeatured ? (
                      <>
                        <StarOff className="w-4 h-4" />
                        Unfeature
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Feature
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}