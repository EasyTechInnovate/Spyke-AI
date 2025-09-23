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
import { Star, Users, Sparkles, Award, Zap, Target, TrendingUp, Clock, Shield, Globe } from 'lucide-react'
import { formatLocation } from '@/lib/utils/seller'
export default function PublicSellerProfile() {
    const params = useParams()
    const sellerId = params.sellerId
    const [activeTab, setActiveTab] = useState('products')
    const [isContactWidgetOpen, setIsContactWidgetOpen] = useState(false)
    const { seller, products, reviews, similarSellers, loading, error, productFilters, updateProductFilters } = useEnhancedSellerProfile(sellerId)
    const handleTabChange = (tab) => {
        setActiveTab(tab)
    }
    const handleProductClick = (productId) => {
        window.location.href = `/products/${productId}`
    }
    const handleContactClick = () => {
        setIsContactWidgetOpen(true)
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <Container>
                    <div className="pt-24 pb-16">
                        <div className="flex flex-col items-center justify-center py-20">
                            <LoadingSpinner message="Loading seller profile..." />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="mt-8 text-center">
                                <p className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Preparing an amazing experience...</p>
                            </motion.div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }
    if (error || !seller) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <Container>
                    <div className="pt-24 pb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20">
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                                <Sparkles className="w-12 h-12 text-red-400" />
                            </div>
                            <h1 className="text-3xl text-[#FFFFFF] mb-4 font-[var(--font-league-spartan)]">Seller Not Found</h1>
                            <p className="text-[#9ca3af] mb-8 max-w-md mx-auto font-[var(--font-kumbh-sans)]">
                                The seller profile you're looking for doesn't exist or has been removed from our marketplace.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="/explore"
                                    className="inline-flex items-center px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all font-[var(--font-kumbh-sans)]">
                                    Explore Other Sellers
                                </a>
                                <a
                                    href="/"
                                    className="inline-flex items-center px-6 py-3 bg-[#1f1f1f] text-[#FFFFFF] border border-[#6b7280]/20 rounded-lg hover:bg-[#2a2a2a] hover:border-[#00FF89]/30 transition-all font-[var(--font-kumbh-sans)]">
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
        <div className="min-h-screen bg-[#121212] text-[#FFFFFF]">
            <main className=" pb-16">
                <div className="w-full">
                    <SellerHero
                        seller={seller}
                        onContactClick={handleContactClick}
                    />
                </div>
                <Container>
                    <div className="max-w-7xl mx-auto">
                        <div className="sticky top-16 z-10 bg-[#121212]/95 backdrop-blur-sm border-b border-[#6b7280]/20 mb-8">
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
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                                                <h3 className="text-[#FFFFFF] mb-6 text-xl font-[var(--font-league-spartan)] flex items-center gap-2">
                                                    <Award className="w-5 h-5 text-[#FFC050]" />
                                                    Achievements & Badges
                                                </h3>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <AchievementBadge 
                                                        icon={Shield} 
                                                        title="Verified Creator" 
                                                        earned={seller?.isVerified} 
                                                        color="emerald"
                                                    />
                                                    <AchievementBadge 
                                                        icon={Target} 
                                                        title="Top Seller" 
                                                        earned={seller?.metrics?.totalSales > 50} 
                                                        color="blue"
                                                    />
                                                    <AchievementBadge 
                                                        icon={TrendingUp} 
                                                        title="Rising Star" 
                                                        earned={seller?.metrics?.profileViews > 1000} 
                                                        color="purple"
                                                    />
                                                    <AchievementBadge 
                                                        icon={Clock} 
                                                        title="Quick Responder" 
                                                        earned={seller?.responseTime === '< 24h'} 
                                                        color="amber"
                                                    />
                                                </div>
                                            </motion.div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                                                <h3 className="text-[#FFFFFF] mb-6 text-xl font-[var(--font-league-spartan)] flex items-center gap-2">
                                                    <Zap className="w-5 h-5 text-[#00FF89]" />
                                                    Skills & Expertise
                                                </h3>
                                                <div className="space-y-6">
                                                    {seller?.niches?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-[#9ca3af] text-sm font-medium mb-3 uppercase tracking-wider">Specializations</h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {seller.niches.map((niche, index) => (
                                                                    <motion.span
                                                                        key={index}
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        className="px-4 py-2 bg-[#00FF89]/10 text-[#00FF89] rounded-xl text-sm font-medium border border-[#00FF89]/20 hover:bg-[#00FF89]/20 transition-all">
                                                                        {niche}
                                                                    </motion.span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {seller?.toolsSpecialization?.length > 0 && (
                                                        <div>
                                                            <h4 className="text-[#9ca3af] text-sm font-medium mb-3 uppercase tracking-wider">Tools & Technologies</h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                                {seller.toolsSpecialization.map((tool, index) => (
                                                                    <motion.div
                                                                        key={index}
                                                                        initial={{ opacity: 0, x: -20 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: index * 0.1 }}
                                                                        className="flex items-center gap-2 px-3 py-2 bg-[#121212] rounded-lg border border-[#6b7280]/20 hover:border-[#FFC050]/30 transition-all">
                                                                        <Globe className="w-4 h-4 text-[#FFC050]" />
                                                                        <span className="text-[#FFFFFF] text-sm font-medium">{tool}</span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                            <SellerAbout seller={seller} />
                                        </div>
                                        <div className="space-y-6">
                                            <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                                                <h3 className="text-[#FFFFFF] mb-4 text-lg font-[var(--font-league-spartan)]">
                                                    Quick Stats
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Products</span>
                                                        <span className="text-[#FFFFFF] font-[var(--font-league-spartan)]">
                                                            {seller?.metrics?.totalProducts || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Total Sales</span>
                                                        <span className="text-[#FFFFFF] font-[var(--font-league-spartan)]">
                                                            {seller?.metrics?.totalSales || 0}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Rating</span>
                                                        <span className="text-[#FFFFFF] flex items-center gap-1 font-[var(--font-league-spartan)]">
                                                            <Star className="w-3 h-3 fill-[#FFC050] text-[#FFC050]" />
                                                            {seller?.metrics?.avgRating ? seller.metrics.avgRating.toFixed(1) : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Response Rate</span>
                                                        <span className="text-[#00FF89] font-[var(--font-league-spartan)]">
                                                            {seller?.responseRate || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                                                <h3 className="text-[#FFFFFF] mb-4 text-lg font-[var(--font-league-spartan)]">
                                                    Get in Touch
                                                </h3>
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={handleContactClick}
                                                        className="w-full p-4 bg-[#00FF89] text-[#121212] rounded-xl hover:shadow-lg hover:shadow-[#00FF89]/25 transition-all font-[var(--font-kumbh-sans)]">
                                                        Send Message
                                                    </button>
                                                    <button className="w-full p-4 bg-[#121212] text-[#FFFFFF] border border-[#6b7280]/20 rounded-xl hover:bg-[#2a2a2a] hover:border-[#00FF89]/30 transition-all font-[var(--font-kumbh-sans)]">
                                                        Schedule Call
                                                    </button>
                                                </div>
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="bg-[#1f1f1f] rounded-2xl p-6 border border-[#6b7280]/20">
                                                <h3 className="text-[#FFFFFF] mb-4 text-lg font-[var(--font-league-spartan)]">
                                                    Trust & Credibility
                                                </h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Member Since</span>
                                                        <span className="text-[#FFFFFF] font-[var(--font-league-spartan)]">
                                                            {seller?.createdAt ? new Date(seller.createdAt).getFullYear() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Last Active</span>
                                                        <span className="text-[#00FF89] font-[var(--font-league-spartan)]">
                                                            {seller?.isOnline ? 'Online now' : 'Recently'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Verification</span>
                                                        <div className="flex items-center gap-1">
                                                            <Shield className={`w-4 h-4 ${seller?.isVerified ? 'text-[#00FF89]' : 'text-[#6b7280]'}`} />
                                                            <span className={`text-sm font-[var(--font-league-spartan)] ${seller?.isVerified ? 'text-[#00FF89]' : 'text-[#6b7280]'}`}>
                                                                {seller?.isVerified ? 'Verified' : 'Pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">Languages</span>
                                                        <span className="text-[#FFFFFF] font-[var(--font-league-spartan)] text-sm">
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
                                className="mt-16 pt-8 border-t border-[#6b7280]/20">
                                <h2 className="text-2xl text-[#FFFFFF] mb-6 font-[var(--font-league-spartan)]">Similar Sellers</h2>
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-[var(--font-kumbh-sans)] ${
                isActive
                    ? 'bg-[#00FF89] text-[#121212] font-semibold'
                    : 'text-[#9ca3af] hover:text-[#FFFFFF] hover:bg-[#1f1f1f]'
            }`}>
            {icon}
            <span>{label}</span>
            {count !== undefined && (
                <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-[#121212]/20' : 'bg-[#6b7280]/20'
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
            className="bg-[#1f1f1f] border border-[#6b7280]/20 rounded-2xl p-6 cursor-pointer hover:border-[#00FF89]/30 transition-all group"
            onClick={onClick}>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00FF89] to-[#FFC050] rounded-full flex items-center justify-center text-[#121212] font-[var(--font-league-spartan)]">
                    {seller.fullName?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-[#FFFFFF] truncate font-[var(--font-league-spartan)]">{seller.fullName}</h3>
                    <p className="text-sm text-[#9ca3af] font-[var(--font-kumbh-sans)]">{formatLocation(seller.location)}</p>
                </div>
            </div>
            <div className="flex items-center justify-between text-sm">
                <span className="text-[#9ca3af] font-[var(--font-kumbh-sans)]">{seller.stats?.totalProducts || 0} products</span>
                <div className="flex items-center gap-1 text-[#FFC050]">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="font-[var(--font-kumbh-sans)]">{seller.stats?.averageRating ? seller.stats.averageRating.toFixed(1) : 'N/A'}</span>
                </div>
            </div>
        </motion.div>
    )
}
function AchievementBadge({ icon: Icon, title, earned, color = 'gray' }) {
    const colorClasses = {
        emerald: earned ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-gray-800 text-gray-500 border-gray-700',
        blue: earned ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-gray-800 text-gray-500 border-gray-700',
        purple: earned ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-gray-800 text-gray-500 border-gray-700',
        amber: earned ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-gray-800 text-gray-500 border-gray-700',
        gray: 'bg-gray-800 text-gray-500 border-gray-700'
    }
    return (
        <motion.div
            whileHover={{ scale: earned ? 1.05 : 1 }}
            className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                colorClasses[color]
            } ${earned ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                earned ? 'bg-current/20' : 'bg-gray-700'
            }`}>
                <Icon className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-medium font-[var(--font-kumbh-sans)] leading-tight">
                {title}
            </h4>
            {earned && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-[#00FF89] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#121212]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </motion.div>
            )}
        </motion.div>
    )
}