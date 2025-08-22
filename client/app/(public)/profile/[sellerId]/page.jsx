'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import SellerHero from '@/components/features/seller/profile/SellerHero'
import EnhancedProductShowcase from '@/components/features/seller/profile/EnhancedProductShowcase'
import SellerAbout from '@/components/features/seller/profile/SellerAbout'
import SellerReviews from '@/components/features/seller/profile/SellerReviews'
import ContactWidget from '@/components/features/seller/profile/ContactWidget'
import { useEnhancedSellerProfile } from '@/hooks/useEnhancedSellerProfile'
import toast from '@/lib/utils/toast'
import { MessageCircle, Star, Users, Sparkles } from 'lucide-react'
import { formatLocation } from '@/lib/utils/seller'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
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
        // Navigate to product page in the same tab
        window.location.href = `/products/${productId}`
    }

    const handleContactClick = () => {
        setIsContactWidgetOpen(true)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <Header />
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
                <Header />
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
            <Header />

            <main className="pt-20 pb-16">
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

                                {/* Quick Actions */}
                            </nav>
                        </div>

                        {/* Tab Content with Smooth Transitions */}
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
                                        <div className="lg:col-span-2">
                                            <SellerAbout seller={seller} />
                                        </div>
                                        <div className="space-y-6">
                                            {/* Quick Stats Sidebar */}
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

                                            {/* Contact Card */}
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

                        {/* Similar Sellers Section */}
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
                                            key={similarSeller.id}
                                            seller={similarSeller}
                                            onClick={() => (window.location.href = `/profile/${similarSeller.id}`)}
                                        />
                                    ))}
                                </div>
                            </motion.section>
                        )}
                    </div>
                </Container>
            </main>

            {/* Contact Widget - Always available */}
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
            className={`flex items-center gap-2 py-3 sm:py-4 px-4 sm:px-6 border-b-2 text-sm transition-all duration-200 font-[var(--font-kumbh-sans)] ${
                isActive
                    ? 'border-[#00FF89] text-[#00FF89] bg-[#00FF89]/5'
                    : 'border-transparent text-[#9ca3af] hover:text-[#FFFFFF] hover:border-[#6b7280]/50'
            }`}>
            {icon}
            <span>{label}</span>
            {count !== undefined && (
                <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full font-[var(--font-league-spartan)] ${
                        isActive ? 'bg-[#00FF89] text-[#121212]' : 'bg-[#1f1f1f] text-[#9ca3af] border border-[#6b7280]/20'
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
