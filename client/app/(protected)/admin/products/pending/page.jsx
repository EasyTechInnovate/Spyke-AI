'use client'

import { useState, useEffect } from 'react'
import { Package, Search, Filter, CheckCircle, XCircle, Eye, Shield, TestTube, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Image from 'next/image'
import Link from 'next/link'

export default function PendingProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  useEffect(() => {
    // Add small delay to ensure layout is loaded first
    const timer = setTimeout(() => {
      fetchPendingProducts()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [filterStatus, pagination.currentPage])

  const fetchPendingProducts = async () => {
    try {
      setLoading(true)
      console.log('Fetching pending products...')
      
      const params = {
        page: pagination.currentPage,
        limit: 10,
        status: 'published', // Get published but not verified products
      }
      
      // For now, use regular products endpoint if admin endpoint is slow
      const response = await productsAPI.getProducts(params)
      
      if (response && response.data) {
        // Filter only unverified products on client side if API doesn't support the filter
        const allProducts = response.data.products || []
        const unverifiedProducts = allProducts.filter(p => !p.isVerified || !p.isTested)
        setProducts(unverifiedProducts)
        setPagination(response.data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      setError(error.message || 'Failed to load products')
      toast.error('Failed to load products. Please try again.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyProduct = async (productId, isVerified, isTested) => {
    try {
      await productsAPI.verifyProduct(productId, { isVerified, isTested })
      toast.success('Product verification status updated')
      fetchPendingProducts()
    } catch (error) {
      console.error('Error verifying product:', error)
      toast.error('Failed to update product verification')
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
          <h1 className="text-2xl font-bold text-white">Pending Product Review</h1>
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-medium">
            {pagination.totalItems} products pending
          </span>
        </div>
        <p className="text-gray-400">Review and verify products submitted by sellers</p>
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
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-brand-primary"
          >
            <option value="all">All Products</option>
            <option value="unverified">Unverified Only</option>
            <option value="untested">Untested Only</option>
          </select>
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="space-y-4">
          {/* Loading Skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-gray-800 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-800 rounded w-full"></div>
                  <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                  <div className="flex gap-3 mt-4">
                    <div className="h-8 bg-gray-800 rounded w-24"></div>
                    <div className="h-8 bg-gray-800 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error loading products</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              fetchPendingProducts()
            }}
            className="px-6 py-2 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No pending products</h3>
          <p className="text-gray-400">All products have been reviewed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.thumbnail || 'https://via.placeholder.com/128x128?text=Product'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{product.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{product.shortDescription}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">
                            by <span className="text-gray-300">{product.sellerId?.fullName || 'Unknown Seller'}</span>
                          </span>
                          <span className="px-2 py-1 bg-brand-primary/20 text-brand-primary rounded text-xs">
                            {product.type}
                          </span>
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {product.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-brand-primary">
                          {product.price === 0 ? 'Free' : `$${product.price}`}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Created {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Verification Status */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        product.isVerified 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        <Shield className="w-4 h-4" />
                        {product.isVerified ? 'Verified' : 'Not Verified'}
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                        product.isTested 
                          ? 'bg-blue-500/20 text-blue-500' 
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        <TestTube className="w-4 h-4" />
                        {product.isTested ? 'Tested' : 'Not Tested'}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Product
                      </Link>
                      
                      {!product.isVerified && (
                        <button
                          onClick={() => handleVerifyProduct(product._id, true, product.isTested)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify
                        </button>
                      )}
                      
                      {!product.isTested && (
                        <button
                          onClick={() => handleVerifyProduct(product._id, product.isVerified, true)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <TestTube className="w-4 h-4" />
                          Mark as Tested
                        </button>
                      )}
                      
                      {product.isVerified && product.isTested && (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Fully Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            Previous
          </button>
          
          <span className="text-gray-400 px-4">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}