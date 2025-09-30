'use client'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import SellerHero from '@/components/features/seller/profile/SellerHero'
import EnhancedProductShowcase from '@/components/features/seller/profile/EnhancedProductShowcase'
import SellerAbout from '@/components/features/seller/profile/SellerAbout'
import SellerReviews from '@/components/features/seller/profile/SellerReviews'
import ContactWidget from '@/components/features/seller/profile/ContactWidget'
import { useEnhancedSellerProfile } from '@/hooks/useEnhancedSellerProfile'
import { Star, Users, Sparkles, Award, Zap, Target, TrendingUp, Clock, Shield, Globe, MapPin, Calendar, Eye, Heart } from 'lucide-react'
import { formatLocation } from '@/lib/utils/seller'

export default function PublicSellerProfile() {
    const params = useParams()
    const sellerId = params.sellerId
    const [activeTab, setActiveTab] = useState('products')
    const [isContactWidgetOpen, setIsContactWidgetOpen] = useState(false)

    const { seller, products, reviews, similarSellers, loading, error, productFilters, updateProductFilters } = useEnhancedSellerProfile(sellerId)

    console.log('PublicSellerProfile render', { sellerId, activeTab, isContactWidgetOpen, loading, error, seller })

    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }

    const handleProductClick = (productId) => {
        window.location.href = `/products/${productId}`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white relative">
                {/* Ambient background to match ProductHero */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-black" />
                    <motion.div
                        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                    />
                </div>
                <Container>
                    <div className="pt-24 pb-16 relative z-10">
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoadingSpinner message="Loading seller profile..." />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-8 text-center">
                                <p className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Preparing an amazing experience...</p>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    if (error || !seller) {
        return (
            <div className="min-h-screen bg-black text-white relative">
                {/* Ambient background to match ProductHero */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute inset-0 bg-black" />
                    <motion.div
                        animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                    />
                </div>
                <Container>
                    <div className="pt-24 pb-16 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20">
                            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                <Sparkles className="w-12 h-12 text-red-400" />
                            </div>
                            <h1 className="text-3xl text-white mb-4 [font-family:var(--font-league-spartan)]">Seller Not Found</h1>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto [font-family:var(--font-kumbh-sans)]">
                                The seller profile you're looking for doesn't exist or has been removed from our marketplace.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/explore"
                                    className="inline-flex items-center px-6 py-3 bg-[#00FF89] text-black rounded-lg hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all [font-family:var(--font-kumbh-sans)]">
                                    Explore Other Sellers
                                </a>
                                <a
                                    href="/"
                                    className="inline-flex items-center px-6 py-3 bg:white/5 text-white border border-gray-700/50 rounded-lg hover:bg-[#00FF89]/10 hover:border-[#00FF89]/30 transition-all [font-family:var(--font-kumbh-sans)]">
                                    Go Home
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-black text-white">
            {/* Ambient background to match ProductHero */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-black" />
                <motion.div
                    animate={{ rotate: [0, 360], scale: [1, 1.1, 1] }}
                    transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
            </div>

            <main className="relative z-10 pb-16">
                <div className="w-full">
                    <SellerHero seller={seller} />
                </div>
                <Container>
                    <div className="max-w-7xl mx-auto">
                        {/* Sticky tabs */}
                        <div className="sticky top-16 z-10 bg-black/70 backdrop-blur-sm border-b border-gray-700/50 mb-8">
                            <nav className="flex items-center justify-between py-6">
                                <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                                    <div className="flex gap-4 min-w-max">
                                        <TabButton
                                            label="Products"
                                            count={products.length}
                                            isActive={activeTab === 'products'}
                                            onClick={() => handleTabChange('products')}
                                            icon={<Sparkles className="w-4 h-4" />}
                                        />
                                        <TabButton
                                            label="About"
                                            isActive={activeTab === 'about'}
                                            onClick={() => handleTabChange('about')}
                                            icon={<Users className="w-4 h-4" />}
                                        />
                                        <TabButton
                                            label="Reviews"
                                            count={reviews.length}
                                            isActive={activeTab === 'reviews'}
                                            onClick={() => handleTabChange('reviews')}
                                            icon={<Star className="w-4 h-4" />}
                                        />
                                    </div>
                                </div>
                            </nav>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="min-h-[600px]">
                                {activeTab === 'products' && (
                                    <EnhancedProductShowcase
                                        products={products}
                                        filters={productFilters}
                                        onFilterChange={updateProductFilters}
                                        onProductClick={handleProductClick}
                                    />
                                )}

                                {activeTab === 'about' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        <div className="lg:col-span-2 space-y-8">
                                            {/* Bio Section */}
                                            {seller?.bio && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                    <h3 className="text-white mb-6 text-xl [font-family:var(--font-league-spartan)] flex items-center gap-2">
                                                        <Users className="w-5 h-5 text-[#00FF89]" />
                                                        About {seller.fullName}
                                                    </h3>
                                                    <p className="text-gray-300 leading-relaxed [font-family:var(--font-kumbh-sans)] text-base">
                                                        {seller.bio}
                                                    </p>
                                                </motion.div>
                                            )}

                                            {/* Achievements & Badges */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                <h3 className="text-white mb-6 text-xl [font-family:var(--font-league-spartan)] flex items-center gap-2">
                                                    <Award className="w-5 h-5 text-yellow-400" />
                                                    Achievements & Badges
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <AchievementBadge 
                                                        icon={Shield} 
                                                        title="Verified Creator" 
                                                        earned={seller?.isVerified || seller?.trustScore > 15} 
                                                        color="emerald"
                                                    />
                                                    <AchievementBadge 
                                                        icon={Target} 
                                                        title="Top Seller" 
                                                        earned={seller?.metrics?.totalSales > 30 || seller?.stats?.totalSales > 30} 
                                                        color="blue"
                                                    />
                                                    <AchievementBadge 
                                                        icon={TrendingUp} 
                                                        title="Rising Star" 
                                                        earned={seller?.metrics?.profileViews > 1000 || seller?.stats?.profileViews > 1000} 
                                                        color="purple"
                                                    />
                                                    <AchievementBadge 
                                                        icon={Clock} 
                                                        title="Quick Responder" 
                                                        earned={seller?.avgResponseTime?.includes('< 2h') || seller?.responseTime?.includes('< 2h')} 
                                                        color="amber"
                                                    />
                                                </div>
                                            </motion.div>

                                            {/* Skills & Expertise */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                <h3 className="text-white mb-6 text-xl [font-family:var(--font-league-spartan)] flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-[#00FF89]" />
                                                    Skills & Expertise
                                                </h3>
                                                <div className="space-y-6">
                                                    {(seller?.niches?.length > 0 || seller?.specialties?.length > 0) && (
                                                        <div>
                                                            <h4 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Specializations</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {(seller?.niches || seller?.specialties || []).map((niche, index) => (
                                                                    <motion.span
                                                                        key={index}
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-xl text-sm font-medium border border-[#00FF89]/30 hover:bg-[#00FF89]/20 transition-all">
                                                                        {niche}
                                                                    </motion.span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {seller?.toolsSpecialization?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Tools & Technologies</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                {seller.toolsSpecialization.map((tool, index) => (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-gray-700/50 hover:border-yellow-400/30 transition-all">
                                                                        <Globe className="w-4 h-4 text-yellow-400" />
                                                                        <span className="text-white text-sm font-medium">{tool}</span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>

                                            {/* Services Offered */}
                                            {seller?.customAutomationServices && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.3 }}
                                                    className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                    <h3 className="text-white mb-6 text-xl [font-family:var(--font-league-spartan)] flex items-center gap-2">
                                                        <Sparkles className="w-5 h-5 text-purple-400" />
                                                        Services Offered
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                                            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                                <Zap className="w-5 h-5 text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-medium [font-family:var(--font-league-spartan)]">Custom Automation</h4>
                                                                <p className="text-gray-400 text-sm [font-family:var(--font-kumbh-sans)]">Tailored solutions for your needs</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-gray-700/50">
                                                            <div className="w-10 h-10 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                                                <Target className="w-5 h-5 text-[#00FF89]" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-medium [font-family:var(--font-league-spartan)]">Consultation</h4>
                                                                <p className="text-gray-400 text-sm [font-family:var(--font-kumbh-sans)]">Expert guidance and advice</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            <SellerAbout seller={seller} />
                                        </div>

                                        {/* Right Sidebar */}
                                        <div className="space-y-6">
                                            {/* Quick Stats */}
                                            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                <h3 className="text-white mb-4 text-lg [font-family:var(--font-league-spartan)]">Performance Stats</h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Products</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)]">
                                                            {seller?.stats?.totalProducts || seller?.metrics?.totalProducts || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Total Sales</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)]">
                                                            {seller?.stats?.totalSales || seller?.metrics?.totalSales || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Rating</span>
                                                        <span className="text-white flex items-center gap-1 [font-family:var(--font-league-spartan)]">
                                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                            {seller?.stats?.averageRating || seller?.metrics?.avgRating ? 
                                                                (seller?.stats?.averageRating || seller?.metrics?.avgRating).toFixed(1) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Reviews</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)]">
                                                            {seller?.stats?.totalReviews || seller?.metrics?.totalReviews || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Profile Views</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)]">
                                                            {seller?.stats?.profileViews || seller?.metrics?.profileViews || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Response Rate</span>
                                                        <span className="text-[#00FF89] [font-family:var(--font-league-spartan)]">
                                                            {seller?.responseRate || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Location & Availability */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                <h3 className="text-white mb-4 text-lg [font-family:var(--font-league-spartan)]">Location & Availability</h3>
                                                <div className="space-y-4">
                                                    {(seller?.location?.country || seller?.locationText) && (
                                                        <div className="flex items-center gap-3">
                                                            <MapPin className="w-4 h-4 text-[#00FF89]" />
                                                            <div>
                                                                <span className="text-white [font-family:var(--font-kumbh-sans)]">
                                                                    {seller?.location?.country || seller?.locationText}
                                                                </span>
                                                                {seller?.location?.timezone && (
                                                                    <p className="text-xs text-gray-400">{seller.location.timezone}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-3">
                                                        <Clock className="w-4 h-4 text-yellow-400" />
                                                        <div>
                                                            <span className="text-white [font-family:var(--font-kumbh-sans)]">
                                                                Responds in {seller?.avgResponseTime || seller?.responseTime || '< 24h'}
                                                            </span>
                                                            <p className="text-xs text-gray-400">Average response time</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-3 h-3 rounded-full ${seller?.isOnline ? 'bg-[#00FF89]' : 'bg-gray-600'}`} />
                                                        <span className={`[font-family:var(--font-kumbh-sans)] ${seller?.isOnline ? 'text-[#00FF89]' : 'text-gray-400'}`}>
                                                            {seller?.isOnline ? 'Online now' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>

                                            {/* Trust & Credibility */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-sm">
                                                <h3 className="text-white mb-4 text-lg [font-family:var(--font-league-spartan)]">Trust & Credibility</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Member Since</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)]">
                                                            {seller?.memberSince ? new Date(seller.memberSince).getFullYear() : 
                                                             seller?.joinedDate || 
                                                             (seller?.createdAt ? new Date(seller.createdAt).getFullYear() : 'N/A')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Trust Score</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-16 h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-[#00FF89] to-yellow-400 rounded-full transition-all"
                                                                    style={{ width: `${Math.min((seller?.trustScore || 0) * 5, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-white [font-family:var(--font-league-spartan)] text-sm">
                                                                {seller?.trustScore || 0}/20
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Seller Level</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-3 h-3 rounded-full ${
                                                                seller?.sellerLevel?.level === 'Gold' ? 'bg-yellow-500' :
                                                                seller?.sellerLevel?.level === 'Silver' ? 'bg-gray-400' :
                                                                seller?.sellerLevel?.level === 'Bronze' ? 'bg-orange-400' :
                                                                'bg-gray-600'
                                                            }`} />
                                                            <span className="text-white [font-family:var(--font-league-spartan)] text-sm">
                                                                {seller?.sellerLevel?.level || 'New Seller'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">Languages</span>
                                                        <span className="text-white [font-family:var(--font-league-spartan)] text-sm">
                                                            {seller?.languages?.length > 0 ? seller.languages.slice(0, 2).join(', ') : 'English'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <SellerReviews
                                        reviews={reviews}
                                        sellerId={sellerId}
                                        seller={seller}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {similarSellers.length > 0 && (
                            <motion.section
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-16 pt-8 border-t border-gray-700/50">
                                <h2 className="text-2xl text-white mb-6 [font-family:var(--font-league-spartan)]">Similar Sellers</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {similarSellers.map((similarSeller) => (
                                        <SimilarSellerCard
                                            key={similarSeller.id || similarSeller._id}
                                            seller={similarSeller}
                                            onClick={() => {
                                                const sellerId = similarSeller.id || similarSeller._id
                                                if (sellerId) {
                                                    window.location.href = `/profile/${sellerId}`
                                                } else {
                                                    console.error('No seller ID found:', similarSeller)
                                                }
                                            }}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </Container>
            </main>

            <ContactWidget
                seller={seller}
                isOpen={isContactWidgetOpen}
                onClose={() => setIsContactWidgetOpen(false)}
                className="fixed bottom-6 right-6 z-50"
            />
        </div>
    )
}

function TabButton({ label, count, isActive, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all [font-family:var(--font-kumbh-sans)] border ${
                isActive
                    ? 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89] font-semibold'
                    : 'bg-white/5 border-gray-700 text-gray-300 hover:bg-[#00FF89]/5 hover:border-[#00FF89]/20'
            }`}>
            {icon}
            <span>{label}</span>
            {count !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-black/20 text-[#00FF89]' : 'bg-white/10 text-gray-300'
                }`}>
                    {count}
                </span>
            )}
        </button>
    )
}

function SimilarSellerCard({ seller, onClick }) {
    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/5 border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:border-[#00FF89]/30 transition-all group"
            onClick={onClick}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89] to-yellow-400 rounded-full flex items-center justify-center text-black [font-family:var(--font-league-spartan)]">
                    {seller.fullName?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-white truncate [font-family:var(--font-league-spartan)]">{seller.fullName}</h3>
                    <p className="text-sm text-gray-400 [font-family:var(--font-kumbh-sans)]">{formatLocation(seller.location)}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400 [font-family:var(--font-kumbh-sans)]">{seller.stats?.totalProducts || 0} products</span>
                <div className="flex items-center gap-1 text-yellow-400">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="[font-family:var(--font-kumbh-sans)]">{seller.stats?.averageRating ? seller.stats.averageRating.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        </motion.div>
    )
}

function AchievementBadge({ icon: Icon, title, earned, color = 'gray' }) {
    const colorClasses = {
        emerald: earned ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-white/5 text-gray-400 border-gray-700/50',
        blue: earned ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-white/5 text-gray-400 border-gray-700/50',
        purple: earned ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-white/5 text-gray-400 border-gray-700/50',
        amber: earned ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-white/5 text-gray-400 border-gray-700/50',
        gray: 'bg-white/5 text-gray-400 border-gray-700/50'
    }

    return (
        <motion.div
            whileHover={{ scale: earned ? 1.05 : 1 }}
            className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                colorClasses[color]
            } ${earned ? 'hover:shadow-lg hover:shadow-[#00FF89]/20 cursor-pointer' : 'opacity-70'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                earned ? 'bg-current/10' : 'bg-black/30'
            }`}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium [font-family:var(--font-kumbh-sans)] leading-tight">
                {title}
            </h4>
            {earned && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.div>
            )}
        </motion.div>
    )
}