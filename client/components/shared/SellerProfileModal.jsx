'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ExternalLink, Star, Package, Calendar, Verified, 
  Award, MessageSquare, MapPin, Globe, Mail, Eye,
  Loader2, AlertCircle, ChevronRight, Sparkles, X,
  Trophy, TrendingUp, Clock, Users, Heart, 
  BarChart3, Zap, Shield, DollarSign
} from 'lucide-react'
import Modal from '@/components/shared/ui/Modal'
import { formatDistanceToNow } from '@/lib/utils/date'
import toast from '@/lib/utils/toast'
import { sellerAPI } from '@/lib/api'
import { cn } from '@/lib/utils'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 }
}

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
}

export default function SellerProfileModal({ 
  isOpen, 
  onClose, 
  sellerId,
  sellerName,
  sellerData: initialData = null
}) {
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

  const [loading, setLoading] = useState(!initialData)
  const [sellerData, setSellerData] = useState(initialData)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

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
            responseRate: apiData.stats?.responseRate ? `${apiData.stats.responseRate}%` : 'N/A',
            returning_customers: apiData.stats?.returning_customers || 0,
            total_revenue: apiData.stats?.total_revenue || 0
          },
          badges: apiData.badges || [],
          recentProducts: apiData.recentProducts || []
        }
        // Log a serializable summary of the transformed data
        console.log('[SellerProfileModal] transformedData summary', {
          id: transformedData._id,
          fullName: transformedData.fullName,
          totalSales: transformedData.stats.totalSales,
          totalProducts: transformedData.stats.totalProducts
        })
        
        setSellerData(transformedData)
      } else {
        throw new Error('No seller data received')
      }
    } catch (error) {
      console.error('Failed to fetch seller data:', error)
      setError(error.response?.data?.message || error.message || 'Failed to load seller profile')
      showMessage('Unable to load seller profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVisitProfile = () => {
    if (sellerData?._id) {
      const profilePath = `/profile/${sellerData._id}`
      window.location.href = profilePath
    }
  }

  const handleContactSeller = () => {
    if (sellerData?.email) {
      window.location.href = `mailto:${sellerData.email}`
    }
  }

  // Calculate seller level based on sales
  const getSellerLevel = (sales) => {
    if (sales >= 1000) return { level: 'Diamond', color: 'text-purple-400', icon: Trophy }
    if (sales >= 500) return { level: 'Gold', color: 'text-yellow-400', icon: Award }
    if (sales >= 100) return { level: 'Silver', color: 'text-gray-300', icon: Award }
    return { level: 'Bronze', color: 'text-orange-400', icon: Shield }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-brand-primary" />
            <div className="absolute inset-0 w-12 h-12 animate-ping text-brand-primary/20">
              <Loader2 className="w-full h-full" />
            </div>
          </div>
          <p className="text-sm text-gray-400 animate-pulse">Loading seller profile...</p>
        </div>
      )
    }

    if (error) {
      return (
        <motion.div 
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center justify-center py-20 space-y-4"
        >
          <AlertCircle className="w-16 h-16 text-red-500" />
          <p className="text-gray-400 text-center">{error}</p>
          <button 
            onClick={fetchSellerData}
            className="px-4 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary rounded-xl font-medium flex items-center gap-2 transition-colors"
          >
            Try again
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )
    }

    if (!sellerData) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-400">No seller data available</p>
        </div>
      )
    }

    const sellerLevel = getSellerLevel(sellerData.stats.totalSales)

    return (
      <motion.div 
        variants={stagger}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* Header Section - Enhanced Design */}
        <motion.div variants={fadeInUp} className="relative">
          {/* Background Banner */}
          {sellerData.sellerBanner ? (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <img 
                src={sellerData.sellerBanner} 
                alt="Profile banner" 
                className="w-full h-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-brand-secondary/5 rounded-2xl" />
          )}
          
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6">
              {/* Enhanced Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-800 ring-4 ring-gray-800 group-hover:ring-brand-primary/20 transition-all">
                  {sellerData.avatar ? (
                    <img
                      src={sellerData.avatar}
                      alt={sellerData.fullName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                      <span className="text-3xl font-bold text-brand-primary-text">
                        {sellerData.fullName?.charAt(0)?.toUpperCase() || 'S'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Status Indicators */}
                <div className="absolute -bottom-2 -right-2 flex gap-1">
                  {sellerData.isVerified && (
                    <div className="bg-blue-500 rounded-full p-1.5 shadow-lg">
                      <Verified className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {sellerData.isPro && (
                    <div className="bg-brand-primary rounded-full p-1.5 shadow-lg">
                      <Zap className="w-3.5 h-3.5 text-brand-primary-text" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-white">{sellerData.fullName}</h3>
                  <div className={cn(
                    "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-800",
                    sellerLevel.color
                  )}>
                    {React.createElement(sellerLevel.icon, { className: "w-3 h-3" })}
                    <span>{sellerLevel.level} Seller</span>
                  </div>
                </div>
                
                <p className="text-gray-400 mb-3">@{sellerData.username}</p>
                
                {/* Location and Meta Info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm">
                  {sellerData.location && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <MapPin className="w-4 h-4" />
                      {sellerData.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Member since {formatDistanceToNow(sellerData.joinedDate)}
                  </div>
                  {sellerData.stats.responseTime !== 'N/A' && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock className="w-4 h-4" />
                      Responds in {sellerData.stats.responseTime}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {sellerData.bio && (
                  <p className="text-gray-300 mt-4 leading-relaxed">
                    {sellerData.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-800 overflow-x-auto pb-px">
          {['overview', 'expertise', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2 font-medium capitalize transition-all whitespace-nowrap relative",
                activeTab === tab 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Stats Grid - Enhanced Design */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div 
                  variants={scaleIn}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-brand-primary/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Package className="w-5 h-5 text-brand-primary" />
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{sellerData.stats.totalProducts}</div>
                  <div className="text-xs text-gray-400">Active Products</div>
                </motion.div>
                
                <motion.div 
                  variants={scaleIn}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-green-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    <BarChart3 className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">{sellerData.stats.totalSales}</div>
                  <div className="text-xs text-gray-400">Total Sales</div>
                </motion.div>
                
                <motion.div 
                  variants={scaleIn}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-yellow-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs text-yellow-400 font-medium">
                      {sellerData.stats.totalReviews} reviews
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {sellerData.stats.averageRating > 0 ? sellerData.stats.averageRating.toFixed(1) : '—'}
                  </div>
                  <div className="text-xs text-gray-400">Average Rating</div>
                </motion.div>
                
                <motion.div 
                  variants={scaleIn}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <Heart className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {sellerData.stats.returning_customers || '—'}%
                  </div>
                  <div className="text-xs text-gray-400">Return Rate</div>
                </motion.div>
              </div>

              {/* Response Stats */}
              {(sellerData.stats.responseTime !== 'N/A' || sellerData.stats.responseRate !== 'N/A') && (
                <motion.div 
                  variants={fadeInUp}
                  className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-800"
                >
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-brand-primary" />
                    Communication
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Response Time</div>
                      <div className="text-lg font-semibold text-white">{sellerData.stats.responseTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Response Rate</div>
                      <div className="text-lg font-semibold text-white">{sellerData.stats.responseRate}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeTab === 'expertise' && (
            <motion.div
              key="expertise"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Specializations */}
              {sellerData.niches?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    Specializations
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sellerData.niches.map((niche, index) => (
                      <motion.span
                        key={index}
                        variants={scaleIn}
                        className="px-3 py-1.5 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-medium border border-brand-primary/20"
                      >
                        {niche}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Technologies */}
              {sellerData.toolsSpecialization?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-400" />
                    Tools & Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {sellerData.toolsSpecialization.map((tool, index) => (
                      <motion.span
                        key={index}
                        variants={scaleIn}
                        className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded-lg text-sm border border-gray-700"
                      >
                        {tool}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Links */}
              {sellerData.portfolioLinks?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Portfolio
                  </h4>
                  <div className="space-y-2">
                    {sellerData.portfolioLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-gray-400 hover:text-brand-primary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {new URL(link).hostname}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-6"
            >
              {/* Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sellerData.isVerified && (
                  <motion.div 
                    variants={scaleIn}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center"
                  >
                    <Verified className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="font-semibold text-white">Verified Seller</div>
                    <div className="text-xs text-gray-400 mt-1">Identity confirmed</div>
                  </motion.div>
                )}
                
                {sellerData.isPro && (
                  <motion.div 
                    variants={scaleIn}
                    className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 text-center"
                  >
                    <Zap className="w-8 h-8 text-brand-primary mx-auto mb-2" />
                    <div className="font-semibold text-white">Pro Seller</div>
                    <div className="text-xs text-gray-400 mt-1">Premium services</div>
                  </motion.div>
                )}
                
                {sellerData.stats.totalSales >= 100 && (
                  <motion.div 
                    variants={scaleIn}
                    className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center"
                  >
                    <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <div className="font-semibold text-white">Top Seller</div>
                    <div className="text-xs text-gray-400 mt-1">100+ sales</div>
                  </motion.div>
                )}
                
                {sellerData.stats.averageRating >= 4.5 && (
                  <motion.div 
                    variants={scaleIn}
                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center"
                  >
                    <Star className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="font-semibold text-white">5-Star Rated</div>
                    <div className="text-xs text-gray-400 mt-1">Excellent reviews</div>
                  </motion.div>
                )}
              </div>

              {/* Milestones */}
              <div>
                <h4 className="font-semibold text-white mb-3">Milestones</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">First sale achieved</span>
                  </div>
                  {sellerData.stats.totalSales >= 10 && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">10 sales milestone</span>
                    </div>
                  )}
                  {sellerData.stats.totalSales >= 50 && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">50 sales milestone</span>
                    </div>
                  )}
                  {sellerData.stats.totalSales >= 100 && (
                    <div className="flex items-center gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">100 sales milestone</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons - Enhanced */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-800"
        >
          <button
            onClick={handleVisitProfile}
            className="flex-1 py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-text font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
          >
            View Full Profile
            <ExternalLink className="w-4 h-4" />
          </button>
          
          {sellerData.email && (
            <button
              onClick={handleContactSeller}
              className="flex-1 py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
            >
              <Mail className="w-4 h-4" />
              Contact Seller
            </button>
          )}
        </motion.div>

        {/* Social Links */}
        {sellerData.socialHandles && Object.values(sellerData.socialHandles).some(handle => handle) && (
          <motion.div 
            variants={fadeInUp}
            className="flex items-center justify-center gap-3 pt-3"
          >
            {Object.entries(sellerData.socialHandles).map(([platform, handle]) => {
              if (!handle) return null
              return (
                <motion.a
                  key={platform}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href={handle.startsWith('http') ? handle : `https://${platform}.com/${handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title={platform}
                >
                  <Globe className="w-4 h-4 text-gray-400 hover:text-white" />
                </motion.a>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    )
  }

  // Add CheckCircle import at the top
  const CheckCircle = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="relative">
        {/* Custom close button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-400 hover:text-white" />
        </motion.button>
        
        {renderContent()}
      </div>
    </Modal>
  )
}