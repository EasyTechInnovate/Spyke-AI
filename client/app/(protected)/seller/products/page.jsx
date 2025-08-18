'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, Search, Filter, MoreVertical, Edit2, Trash2, Eye, FileJson, Send, Archive, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { SpykeLogo } from '@/components/Logo'
import { useSellerProfile } from '@/hooks/useSellerProfile'

export default function SellerProductsPage() {
  const router = useRouter()
  const { data: sellerProfile, loading: profileLoading } = useSellerProfile()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  })

  // Check if seller is fully approved (both verification and commission)
  const isVerificationApproved = sellerProfile?.verificationStatus === 'approved'
  const isCommissionAccepted = sellerProfile?.commissionOffer?.status === 'accepted' && sellerProfile?.commissionOffer?.acceptedAt
  const isFullyApproved = isVerificationApproved && isCommissionAccepted

  // If seller is not fully approved, show restricted access message
  if (!profileLoading && !isFullyApproved) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Products Access Restricted</h2>
            <p className="text-gray-400 mb-6">
              You need to complete your seller approval process before you can manage products.
            </p>
            
            {!isVerificationApproved && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                <p className="text-amber-300 text-sm">
                  ⏳ Your documents are still being reviewed
                </p>
              </div>
            )}
            
            {isVerificationApproved && !isCommissionAccepted && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                <p className="text-blue-300 text-sm">
                  💼 Please accept the commission offer to complete your approval
                </p>
              </div>
            )}
            
            <Link
              href="/seller/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-semibold"
            >
              Complete Approval Process
            </Link>
          </div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (isFullyApproved) {
      fetchProducts()
    }
  }, [filterStatus, pagination.currentPage, isFullyApproved])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: 10
      }
      
      if (filterStatus !== 'all') {
        params.status = filterStatus
      }

      const response = await productsAPI.getMyProducts(params)
      
      if (response.data) {
        setProducts(response.data.products || [])
        setPagination(response.data.pagination || pagination)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.deleteProduct(productId)
        toast.success('Product deleted successfully')
        fetchProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Failed to delete product')
      }
    }
  }

  const handlePublishProduct = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      await productsAPI.updateProduct(productId, { status: newStatus })
      toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`)
      fetchProducts()
    } catch (error) {
      console.error('Error updating product status:', error)
      toast.error('Failed to update product status')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', text: 'Draft' },
      published: { color: 'bg-green-500', text: 'Published' },
      archived: { color: 'bg-red-500', text: 'Archived' }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color} text-white`}>
        {config.text}
      </span>
    )
  }

  const filteredProducts = products.filter(product => 
    product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product?.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Page Header */}
      <div className="border-b border-gray-800 bg-[#1f1f1f]">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">My Products</h1>
              <p className="text-sm text-gray-400 mt-1">Manage your product inventory</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Link
                href="/seller/products/addjson"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
              >
                <FileJson className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">Import JSON</span>
              </Link>
              <Link
                href="/seller/products/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Add Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
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
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:outline-none focus:border-brand-primary"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by creating your first product'}
            </p>
            <Link
              href="/seller/products/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Product</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <motion.div
                key={product?._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/products/${product?.slug || product?._id || product?.id}`)}
                onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/products/${product?.slug || product?._id || product?.id}`) }}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all cursor-pointer"
              >
                {/* Product Image */}
                <div className="aspect-video bg-gray-800 relative">
                  {product?.thumbnail ? (
                    <img
                      src={product?.thumbnail}
                      alt={product?.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-600" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(product?.status)}
                  </div>
                  
                  {/* Actions Menu */}
                  <div className="absolute top-3 right-3">
                    <div className="relative group">
                      <button className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70 transition-colors">
                        <MoreVertical className="w-4 h-4 text-white" />
                      </button>
                      
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <Link
                          href={`/products/${product?.slug || product?._id || product?.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                        <Link
                          href={`/seller/products/${product?.slug || product?._id || product?.id}/edit`}
                          className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Link>
                        <button
                          onClick={() => handlePublishProduct(product?._id, product?.status)}
                          className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-700 w-full text-left ${
                            product?.status === 'published' 
                              ? 'text-orange-400 hover:text-orange-300' 
                              : 'text-green-400 hover:text-green-300'
                          }`}
                        >
                          {product?.status === 'published' ? (
                            <>
                              <Archive className="w-4 h-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              Publish
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product?._id)}
                          className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                    {product?.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {product?.shortDescription}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">
                        <span className="text-white font-medium">{product?.views || 0}</span> views
                      </span>
                      <span className="text-gray-400">
                        <span className="text-white font-medium">{product?.sales || 0}</span> sales
                      </span>
                    </div>
                    <span className="text-brand-primary font-semibold">
                      ${product?.price}
                    </span>
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
    </div>
  )
}