'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink, Star, Package, Calendar, Verified, 
  Award, MessageSquare, MapPin, Globe, Mail, Eye,
  Loader2, AlertCircle, ChevronRight, Sparkles, X
} from 'lucide-react'
import Modal from '@/components/shared/ui/Modal'
import { formatDistanceToNow } from '@/lib/utils/date'
import toast from '@/lib/utils/toast'
import { sellerAPI } from '@/lib/api'

export default function SellerProfileModal({ 
  isOpen, 
  onClose, 
  sellerId,
  sellerName,
  sellerData: initialData = null
}) {
  const [loading, setLoading] = useState(!initialData)
  const [sellerData, setSellerData] = useState(initialData)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && sellerId) {
      if (!initialData) {
        setSellerData(null)
        setError(null)
        fetchSellerData()
      } else {
        setSellerData(initialData)
      }
    }
  }, [isOpen, sellerId, initialData])

  const fetchSellerData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await sellerAPI.getPublicProfile(sellerId)
      
      if (response && response.success && response.data) {
        const apiData = response.data
        const transformedData = {
          _id: apiData.id || apiData._id,
          fullName: apiData.fullName || sellerName || 'Unknown Seller',
          username: apiData.username || apiData.id,
          avatar: apiData.avatar,
          bio: apiData.bio || '',
          location: apiData.location?.country || '',
          timezone: apiData.location?.timezone || '',
          website: apiData.website || '',
          email: apiData.email || '',
          isVerified: apiData.isVerified || false,
          isPro: apiData.isPro || apiData.customAutomationServices || false,
          joinedDate: new Date(apiData.memberSince || apiData.createdAt),
          niches: apiData.niches || [],
          toolsSpecialization: apiData.toolsSpecialization || [],
          socialHandles: apiData.socialHandles || {},
          portfolioLinks: apiData.portfolioLinks || [],
          stats: {
            totalProducts: apiData.stats?.totalProducts || 0,
            totalSales: apiData.stats?.totalSales || 0,
            totalReviews: apiData.stats?.totalReviews || 0,
            averageRating: apiData.stats?.averageRating || 0,
            profileViews: apiData.stats?.profileViews || 0,
            responseTime: apiData.stats?.responseTime || 'N/A',
            responseRate: apiData.stats?.responseRate ? `${apiData.stats.responseRate}%` : 'N/A'
          },
          badges: [],
          recentProducts: apiData.recentProducts || []
        }
        
        setSellerData(transformedData)
      } else {
        throw new Error('No seller data received')
      }
    } catch (error) {
      console.error('Failed to fetch seller data:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load seller profile')
      toast.error('Unable to load seller profile')
    } finally {
      setLoading(false)
    }
  }

  const handleVisitProfile = () => {
    if (sellerData?._id) {
      const profilePath = sellerData.username 
        ? `/seller/${sellerData.username}`
        : `/seller/${sellerData._id}`
      window.location.href = profilePath
    }
  }

  const handleContactSeller = () => {
    if (sellerData?.email) {
      window.location.href = `mailto:${sellerData.email}`
    }
  }

  // Mobile-first responsive content
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
          <p className="text-sm text-gray-400">Loading seller profile...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-400 text-center">{error}</p>
          <button 
            onClick={fetchSellerData}
            className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium flex items-center gap-1"
          >
            Try again
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )
    }

    if (!sellerData) {
      return (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <p className="text-gray-400">No seller data available</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-800">
                {sellerData.avatar ? (
                  <img
                    src={sellerData.avatar}
                    alt={sellerData.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {sellerData.fullName?.charAt(0)?.toUpperCase() || 'S'}
                    </span>
                  </div>
                )}
              </div>
              {sellerData.isPro && (
                <div className="absolute -bottom-1 -right-1 bg-brand-primary rounded-full p-1">
                  <Award className="w-3 h-3 text-black" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h3 className="text-xl font-bold text-white">{sellerData.fullName}</h3>
                {sellerData.isVerified && (
                  <Verified className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              
              <p className="text-sm text-gray-400 mb-2">@{sellerData.username}</p>
              
              {/* Location and Join Date */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-gray-500">
                {sellerData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sellerData.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDistanceToNow(sellerData.joinedDate)}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {sellerData.bio && (
            <p className="text-sm text-gray-300 mt-3 line-clamp-3">
              {sellerData.bio}
            </p>
          )}

          {/* Specializations - Compact Mobile View */}
          {(sellerData.niches?.length > 0 || sellerData.toolsSpecialization?.length > 0) && (
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {sellerData.niches?.map((niche, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-md text-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    {niche}
                  </span>
                ))}
                {sellerData.toolsSpecialization?.map((tool, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md text-xs"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <Package className="w-5 h-5 text-brand-primary mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{sellerData.stats.totalProducts}</div>
            <div className="text-xs text-gray-400">Products</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <Eye className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{sellerData.stats.profileViews}</div>
            <div className="text-xs text-gray-400">Views</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <Star className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">
              {sellerData.stats.averageRating > 0 ? sellerData.stats.averageRating.toFixed(1) : '—'}
            </div>
            <div className="text-xs text-gray-400">Rating</div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-3 text-center border border-gray-700">
            <MessageSquare className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">{sellerData.stats.totalReviews}</div>
            <div className="text-xs text-gray-400">Reviews</div>
          </div>
        </div>

        {/* Action Buttons - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={handleVisitProfile}
            className="flex-1 py-3 px-4 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
          >
            View Full Profile
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {sellerData.email && (
            <button
              onClick={handleContactSeller}
              className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-gray-700"
            >
              Contact Seller
              <Mail className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Social Links - If Available */}
        {sellerData.socialHandles && Object.values(sellerData.socialHandles).some(handle => handle) && (
          <div className="flex items-center justify-center gap-3 pt-3">
            {Object.entries(sellerData.socialHandles).map(([platform, handle]) => {
              if (!handle) return null
              return (
                <a
                  key={platform}
                  href={handle.startsWith('http') ? handle : `https://${platform}.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Globe className="w-4 h-4 text-gray-400" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      className="max-h-[85vh]"
    >
      <div className="relative">
        {/* Custom close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
        {renderContent()}
      </div>
    </Modal>
  )
}