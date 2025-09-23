'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
    Star,
    MapPin,
    Clock,
    Globe,
    MessageCircle,
    Heart,
    Shield,
    Zap,
    Trophy,
    TrendingUp,
    Users,
    ExternalLink,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    Award,
    Eye
} from 'lucide-react'
import { formatNumber, formatRating } from '@/lib/utils/seller'
export default function SellerHero({ seller, onContactClick }) {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [bioExpanded, setBioExpanded] = useState(false)
    const sellerLevelText = seller && typeof seller.sellerLevel === 'object' && seller.sellerLevel !== null
        ? seller.sellerLevel.level
        : seller?.sellerLevel
    if (typeof window !== 'undefined') {
        console.debug('[SellerHero] props received', { id: seller?.id || seller?._id, sellerLevel: seller?.sellerLevel, sellerLevelText })
    }
    const sellerLocation = seller?.location?.country || (typeof seller?.location === 'string' ? seller.location : '')
    if (!seller) return null
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-[#121212]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,137,0.08),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,192,80,0.06),transparent_50%)]" />
            </div>
            {seller.sellerBanner && (
                <div className="absolute inset-0">
                    <img
                        src={seller.sellerBanner}
                        alt="Seller banner"
                        className="w-full h-full object-cover opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 via-[#121212]/60 to-[#121212]/40" />
                </div>
            )}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="relative">
                <div className="w-full py-8 sm:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
                            <div className="xl:col-span-8 space-y-6 lg:space-y-8">
                                <div className="flex flex-col sm:flex-row lg:flex-row gap-6 lg:gap-8">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                        className="relative group flex-shrink-0 self-center sm:self-start">
                                        <div className="relative">
                                            <div className="absolute -inset-2 bg-gradient-to-r from-[#00FF89] via-[#FFC050] to-[#00FF89] rounded-3xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
                                            <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-[#00FF89] to-[#FFC050]">
                                                {seller.avatar ? (
                                                    <img
                                                        src={seller.avatar}
                                                        alt={seller.fullName}
                                                        className={`w-full h-full object-cover transition-all duration-500 ${
                                                            imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                                                        }`}
                                                        onLoad={() => setImageLoaded(true)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <span
                                                            className="text-2xl sm:text-4xl lg:text-5xl text-[#121212]"
                                                            style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                                            {seller.fullName?.charAt(0)?.toUpperCase() || 'S'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {seller.isOnline && (
                                                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2">
                                                    <div className="relative w-6 h-6 sm:w-8 sm:h-8 bg-[#00FF89] rounded-full border-2 sm:border-4 border-[#121212] flex items-center justify-center">
                                                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#121212] rounded-full" />
                                                        <div className="absolute inset-0 bg-[#00FF89] rounded-full animate-ping opacity-60" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                    <div className="flex-1 space-y-4 lg:space-y-6 min-w-0">
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3, duration: 0.5 }}
                                            className="space-y-3 lg:space-y-4">
                                            <div className="space-y-2 lg:space-y-3">
                                                <h1
                                                    className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#00FF89] tracking-tight leading-tight break-words"
                                                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                                    {seller.fullName}
                                                    {seller.isVerified && (
                                                        <Shield className="inline-block w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ml-2 lg:ml-3 text-[#00FF89] flex-shrink-0" />
                                                    )}
                                                </h1>
                                                <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                                                    <div className="flex items-center gap-1.5 lg:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#00FF89]/20 to-[#FFC050]/20 border border-[#00FF89]/30 rounded-lg sm:rounded-xl">
                                                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFC050] icon-decorative" aria-hidden="true" />
                                                        <span
                                                            className="text-xs sm:text-sm text-contrast-strong"
                                                            style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '600' }}>
                                                            {sellerLevelText || 'Pro Seller'}
                                                        </span>
                                                    </div>
                                                    {seller.averageRating != null && (
                                                        <div className="flex items-center gap-1 lg:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#FFC050]/20 border border-[#FFC050]/30 rounded-lg sm:rounded-xl">
                                                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFC050] fill-current icon-decorative" aria-hidden="true" />
                                                            <span
                                                                className="text-xs sm:text-sm text-contrast-strong"
                                                                style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '600' }}>
                                                                {formatRating(seller.averageRating, { withStar: false })}
                                                            </span>
                                                            <span className="sr-only">Average rating</span>
                                                        </div>
                                                    )}
                                                    {seller.totalSales > 0 && (
                                                        <div className="flex items-center gap-1 lg:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-[#FFFFFF]/10 border border-[#FFFFFF]/20 rounded-lg sm:rounded-xl">
                                                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFFFFF] icon-decorative" aria-hidden="true" />
                                                            <span
                                                                className="text-xs sm:text-sm text-contrast-strong"
                                                                style={{ fontFamily: 'var(--font-kumbh-sans)', fontWeight: '600' }}>
                                                                {formatNumber(seller.totalSales)} Sales
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {seller.bio && (
                                                <div>
                                                    <p className={`text-sm sm:text-base leading-relaxed font-[var(--font-kumbh-sans)] ${bioExpanded ? '' : 'line-clamp-3'} text-[#9ca3af]`}>{seller.bio}</p>
                                                    {seller.bio.length > 240 && (
                                                        <button
                                                            onClick={() => setBioExpanded((s) => !s)}
                                                            className="mt-2 text-xs text-[#00FF89] hover:underline touch-target"
                                                            aria-expanded={bioExpanded}
                                                            aria-controls="seller-bio">
                                                            {bioExpanded ? 'Show less' : 'Read more'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-[#9ca3af]">
                                                {sellerLocation && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="w-4 h-4 text-[#00FF89] flex-shrink-0 icon-decorative" aria-hidden="true" />
                                                        <span className="font-[var(--font-kumbh-sans)] truncate">{sellerLocation}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[#00FF89] flex-shrink-0 icon-decorative" aria-hidden="true" />
                                                    <span className="font-[var(--font-kumbh-sans)]">Responds in {seller.responseTime || '< 24h'}</span>
                                                </div>
                                                {seller.languages && seller.languages.length > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-[#00FF89] flex-shrink-0" />
                                                        <span className="font-[var(--font-kumbh-sans)] truncate">
                                                            {seller.languages.slice(0, 2).join(', ')}
                                                            {seller.languages.length > 2 && ` +${seller.languages.length - 2}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={onContactClick}
                                                    aria-label={`Contact ${seller.fullName}`}
                                                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-[#00FF89] text-[#121212] rounded-xl sm:rounded-2xl font-bold transition-all duration-300 hover:bg-[#00FF89]/90 hover:shadow-[0_0_30px_rgba(0,255,137,0.3)] flex items-center justify-center gap-2 touch-target"
                                                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 icon-decorative" aria-hidden="true" />
                                                    <span className="text-sm sm:text-base">Contact Seller</span>
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => setIsFollowing(!isFollowing)}
                                                    aria-pressed={isFollowing}
                                                    aria-label={isFollowing ? `Unfollow ${seller.fullName}` : `Follow ${seller.fullName}`}
                                                    className={`flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 flex items-center justify-center gap-2 touch-target ${
                                                        isFollowing
                                                            ? 'bg-[#00FF89] text-[#121212] border-[#00FF89]'
                                                            : 'bg-transparent text-[#00FF89] border-[#00FF89] hover:bg-[#00FF89]/10'
                                                    }`}
                                                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: 'bold' }}>
                                                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFollowing ? 'fill-current icon-decorative' : 'icon-decorative'}`} aria-hidden="true" />
                                                    <span className="text-sm sm:text-base">{isFollowing ? 'Following' : 'Follow'}</span>
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.5 }}
                                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 px-2 sm:px-0">
                                    {[
                                        {
                                            icon: TrendingUp,
                                            value: seller.metrics.totalSales || 0,
                                            label: 'Total Sales',
                                            color: 'text-[#00FF89]'
                                        },
                                        {
                                            icon: Users,
                                            value: seller.metrics.totalCustomers || 0,
                                            label: 'Customers',
                                            color: 'text-[#FFC050]'
                                        },
                                        {
                                            icon: Star,
                                            value: seller.metrics.averageRating != null ? formatRating(seller.averageRating) : 'N/A',
                                            label: 'Rating',
                                            color: 'text-[#FFC050]'
                                        },
                                        {
                                            icon: Eye,
                                            value: seller.metrics.profileViews || 0,
                                            label: 'Profile Views',
                                            color: 'text-[#FFFFFF]'
                                        }
                                    ].map((stat, index) => {
                                        const IconComponent = stat.icon
                                        return (
                                            <div
                                                key={index}
                                                className="bg-[#1f1f1f]/70 backdrop-blur-sm border border-[#6b7280]/20 rounded-xl lg:rounded-2xl p-5 sm:p-6 lg:p-8 text-center hover:border-[#00FF89]/30 transition-all min-h-[92px] lg:min-h-[140px] flex flex-col justify-center">
                                                <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${stat.color} mx-auto mb-3 icon-decorative`} aria-hidden="true" />
                                                <div
                                                    className={`text-lg sm:text-xl lg:text-2xl ${stat.color} mb-1`}
                                                    style={{ fontFamily: 'var(--font-league-spartan)', fontWeight: '700' }}>
                                                    {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                                                </div>
                                                <div className="text-xs sm:text-sm text-[#9ca3af] font-[var(--font-kumbh-sans)]">{stat.label}</div>
                                            </div>
                                        )
                                    })}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}