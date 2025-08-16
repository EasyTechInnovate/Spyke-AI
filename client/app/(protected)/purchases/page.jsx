'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  CreditCard,
  ChevronRight,
  FileText,
  Zap,
  Bot,
  Layers,
  Loader2,
  AlertCircle
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { useAuth } from '@/hooks/useAuth'
import { purchaseAPI } from '@/lib/api'
import { toast } from 'sonner'
import Link from 'next/link'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

// Product type icons
const typeIcons = {
  prompt: FileText,
  automation: Zap,
  agent: Bot,
  bundle: Layers
}

// Product type colors
const typeColors = {
  prompt: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  automation: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  agent: 'text-green-500 bg-green-500/10 border-green-500/20',
  bundle: 'text-orange-500 bg-orange-500/10 border-orange-500/20'
}

export default function PurchasesPage() {
  const { user } = useAuth()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  
  // Load purchases
  useEffect(() => {
    loadPurchases()
  }, [page, filter])

  const loadPurchases = async () => {
    setLoading(true)
    try {
      const options = {
        page,
        limit: 12
      }
      
      if (filter !== 'all') {
        options.type = filter
      }
      
      const response = await purchaseAPI.getUserPurchases(options)
      setPurchases(response.purchases || [])
      setPagination(response.pagination)
    } catch (error) {
      console.error('Error loading purchases:', error)
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  // Handle download
  const handleDownload = async (product) => {
    try {
      toast.loading('Preparing download...')
      
      // In production, this would download the actual file
      // For now, just show a success message
      setTimeout(() => {
        toast.dismiss()
        toast.success(`Downloaded: ${product.title}`)
      }, 1000)
      
    } catch (error) {
      toast.dismiss()
      toast.error('Download failed. Please try again.')
    }
  }

  // Filter purchases by search term
  const filteredPurchases = purchases.filter(purchase => 
    purchase.product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.product.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && purchases.length === 0) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <Container>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <main className="pt-24 pb-16">
        <Container>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">My Purchases</h1>
            <p className="text-gray-400">
              Access and download all your purchased products
            </p>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all' 
                    ? 'bg-brand-primary text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setFilter('prompt')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'prompt' 
                    ? 'bg-brand-primary text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Prompts
              </button>
              <button
                onClick={() => setFilter('automation')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'automation' 
                    ? 'bg-brand-primary text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Zap className="w-4 h-4" />
                Automations
              </button>
              <button
                onClick={() => setFilter('agent')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'agent' 
                    ? 'bg-brand-primary text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                Agents
              </button>
              <button
                onClick={() => setFilter('bundle')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  filter === 'bundle' 
                    ? 'bg-brand-primary text-black' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                Bundles
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 lg:max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Purchase Grid */}
          {filteredPurchases.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPurchases.map((purchase) => (
                  <PurchaseCard
                    key={purchase.purchaseId}
                    purchase={purchase}
                    onDownload={handleDownload}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === i + 1
                          ? 'bg-brand-primary text-black'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </main>
    </div>
  )
}

// Purchase Card Component
function PurchaseCard({ purchase, onDownload }) {
  const { product, purchaseDate, accessGrantedAt } = purchase
  const Icon = typeIcons[product.type] || Package
  const colorClass = typeColors[product.type] || 'text-gray-500 bg-gray-500/10 border-gray-500/20'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-200"
    >
      {/* Product Image */}
      <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-700 relative">
        {product.thumbnail ? (
          <OptimizedImage
            src={product.thumbnail}
            alt={product.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Type Badge */}
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg border ${colorClass} backdrop-blur-sm`}>
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <span className="text-xs font-medium capitalize">{product.type}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <span className="capitalize">{product.category.replace('_', ' ')}</span>
          <span>•</span>
          <span>{product.industry.replace('_', ' ')}</span>
        </div>

        {/* Purchase Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>Purchased {new Date(purchaseDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CreditCard className="w-4 h-4" />
            <span>${product.price}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onDownload(product)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          
          <Link
            href={`/products/${product._id}`}
            className="flex items-center justify-center px-4 py-2 bg-gray-800 text-gray-300 rounded-xl hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Empty State Component
function EmptyState({ filter }) {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package className="w-12 h-12 text-gray-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        {filter === 'all' ? 'No Purchases Yet' : `No ${filter}s Purchased`}
      </h2>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">
        {filter === 'all' 
          ? "You haven't purchased any products yet. Start exploring our marketplace to find amazing AI tools."
          : `You haven't purchased any ${filter}s yet. Check out our collection of ${filter}s.`}
      </p>
      <Link
        href="/explore"
        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-semibold rounded-xl hover:bg-brand-primary/90 transition-colors"
      >
        Explore Products
        <ChevronRight className="w-5 h-5" />
      </Link>
    </div>
  )
}