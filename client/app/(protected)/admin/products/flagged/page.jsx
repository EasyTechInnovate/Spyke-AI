'use client'

import { useState, useEffect } from 'react'
import { Package, Search, AlertTriangle, Eye, Ban, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Image from 'next/image'
import Link from 'next/link'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function FlaggedProductsPage() {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchFlaggedProducts()
  }, [])

  const fetchFlaggedProducts = async () => {
    try {
      setLoading(true)
      // For now, fetch all products and filter flagged ones
      // In a real app, you'd have a specific endpoint for flagged products
      const response = await productsAPI.getAllProductsAdmin({
        page: 1,
        limit: 100
      })
      
      if (response.data) {
        // Filter products that might be flagged (you can add flagging logic)
        const flaggedProducts = response.data.products?.filter(product => 
          // Example flagging criteria
          product.reports?.length > 0 || 
          product.title?.toLowerCase().includes('test') ||
          product.shortDescription?.toLowerCase().includes('test')
        ) || []
        setProducts(flaggedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      showMessage('Failed to load flagged products', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResolveFlag = async (productId) => {
    try {
      // In a real app, you'd have an API endpoint to resolve flags
      showMessage('Flag resolved successfully', 'success')
      fetchFlaggedProducts()
    } catch (error) {
      console.error('Error resolving flag:', error)
      showMessage('Failed to resolve flag', 'error')
    }
  }

  const handleArchiveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to archive this product?')) {
      try {
        await productsAPI.updateProduct(productId, { status: 'archived' })
        showMessage('Product archived successfully', 'success')
        fetchFlaggedProducts()
      } catch (error) {
        console.error('Error archiving product:', error)
        showMessage('Failed to archive product', 'error')
      }
    }
  }

  const filteredProducts = products.filter(product => 
    product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-white">Flagged Products</h1>
          <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium">
            {products.length} items flagged
          </span>
        </div>
        <p className="text-gray-400">Review products that have been reported or flagged for issues</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search flagged products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No flagged products</h3>
          <p className="text-gray-400">All products are in good standing</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-red-500/20 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <div className="relative w-32 h-32 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.thumbnail || 'https://placehold.co/128x128/1f1f1f/808080?text=Product'}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
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
                          <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded text-xs font-medium">
                            Flagged
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Flag Reason */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-medium text-red-500 mb-1">Flag Reason:</h4>
                      <p className="text-sm text-gray-400">
                        {product.flagReason || 'Product contains potentially inappropriate content or violates marketplace guidelines'}
                      </p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/products/${product.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Review Product
                      </Link>
                      
                      <button
                        onClick={() => handleResolveFlag(product._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Resolve Flag
                      </button>
                      
                      <button
                        onClick={() => handleArchiveProduct(product._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                        Archive Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}