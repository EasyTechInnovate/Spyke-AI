'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Container from '@/components/shared/layout/Container'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import { useEnhancedSellerProfile } from '@/hooks/useEnhancedSellerProfile'
import {
    Star,
    Users,
    Sparkles,
    Clock,
    MapPin,
    Package,
    LayoutGrid,
    List,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    Shield} from 'lucide-react'
import ContactWidget from '@/components/features/seller/profile/ContactWidget'

export default function PublicSellerProfile() {
    const { sellerId } = useParams()
    const router = useRouter()
    const [isContactWidgetOpen, setIsContactWidgetOpen] = useState(false)
    const [showAllSkills, setShowAllSkills] = useState(false)
    const [viewMode, setViewMode] = useState('list') // 'grid' | 'list'
    const [localTime, setLocalTime] = useState('')

    const { seller, products = [], reviews = [], loading, error, pagination, productPage, setProductPage } = useEnhancedSellerProfile(sellerId)
    console.log('Seller Data:', { seller, products, reviews, loading, error })
    const stats = seller?.stats || {}
    const metrics = seller?.metrics || {}
    const totalSales = metrics.totalSales ?? stats.totalSales ?? 0
    const totalReviews = metrics.totalReviews ?? stats.totalReviews ?? 0
    const avgRating = metrics.avgRating ?? stats.averageRating ?? 0
    const productsCount = stats.totalProducts ?? metrics.totalProducts ?? products.length

    const allProducts = products || []
    const daysActive = seller?.memberSince ? Math.max(1, Math.floor((Date.now() - new Date(seller.memberSince).getTime()) / 86400000)) : 0
    const earliestProduct = [...allProducts].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0]
    const latestProductUpdate = [...allProducts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    const uniqueTools = Array.from(new Set(allProducts.flatMap((p) => (p.toolsUsed || []).map((t) => t.name).filter(Boolean))))
    const uniqueTags = Array.from(new Set(allProducts.flatMap((p) => p.tags || [])))
    const milestones = []
    if (totalSales >= 10) milestones.push('10+ Sales')
    if (totalSales >= 50) milestones.push('50+ Sales')
    if (totalSales >= 100) milestones.push('100+ Sales')

    useEffect(() => {
        if (!seller?.location?.timezone) return
        const update = () => {
            try {
                const time = new Intl.DateTimeFormat('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: seller.location.timezone
                }).format(new Date())
                setLocalTime(time)
            } catch (e) {
                setLocalTime('—')
            }
        }
        update()
        const id = setInterval(update, 60000)
        return () => clearInterval(id)
    }, [seller?.location?.timezone])

    const cardBase = 'bg-[#0b0b0b]/95 border border-white/10 backdrop-blur-xl rounded-xl p-6 shadow-[0_0_30px_rgba(0,255,137,0.03)]'
    const sectionTitle = 'text-xl font-semibold text-white mb-5 [font-family:var(--font-league-spartan)] tracking-wide'

    if (loading)
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center">
                <LoadingSpinner message="Loading seller profile..." />
            </div>
        )

    if (error || !seller)
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center px-6">
                <Sparkles className="w-12 h-12 text-[#00FF89] mb-4" />
                <h1 className="text-xl font-bold">Seller Not Found</h1>
                <p className="text-gray-400 mt-2 max-w-md">The requested profile could not be found or is currently unavailable.</p>
            </div>
        )

    function handleProductClick(id) {
        router.push(`/products/${id}`)
    }

    function goToPage(p) {
        if (!pagination) return
        if (p < 1 || p > pagination.totalPages || p === productPage) return
        setProductPage(p)
        // Smooth scroll back to products section after page change
        if (typeof window !== 'undefined') {
            const el = document.getElementById('seller-products-section')
            if (el) {
                window.scrollTo({ top: el.offsetTop - 120, behavior: 'smooth' })
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0a0a] to-[#111] text-white text-lg sm:text-xl leading-relaxed">
            {/* Banner */}
            <div className="relative h-[360px] sm:h-[420px] overflow-hidden">
                <img
                    src={seller.sellerBanner || '/images/default-banner-dark.jpg'}
                    alt="Seller banner"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/70" />
            </div>

            {/* Profile Summary (moved below banner for better banner visibility) */}
            <Container>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`${cardBase} -mt-28 sm:-mt-32 mb-10 flex flex-col sm:flex-row sm:items-center gap-6`}>
                    <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl border border-white/10 overflow-hidden shadow-lg shrink-0">
                        <img
                            src={seller?.profileImage}
                            alt={seller?.fullName}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                        <span
                            className={`absolute bottom-2 right-2 ${seller.isOnline ? 'bg-[#00FF89]' : 'bg-gray-500'} w-4 h-4 rounded-full border-4 border-[#0b0b0b]`}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-4xl sm:text-6xl font-bold [font-family:var(--font-league-spartan)] tracking-tight">
                                {seller.fullName}
                            </h1>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                            <p className="text-[#00FF89] font-semibold mt-2 text-base sm:text-lg flex flex-wrap gap-2">
                                <span>Automation Expert</span>
                                {seller.niches?.[0] && <span>• {seller.niches[0]}</span>}
                                {seller.location?.timezone && <span className="text-gray-400">• {seller.location.timezone}</span>}
                            </p>
                            <div className="flex gap-4 text-[#00FF89]">
                                {seller.socialHandles?.linkedin && (
                                    <a
                                        href={seller.socialHandles.linkedin}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:scale-110 transition">
                                        <Linkedin className="w-6 h-6" />
                                    </a>
                                )}
                                {seller.socialHandles?.twitter && (
                                    <a
                                        href={seller.socialHandles.twitter}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:scale-110 transition">
                                        <Twitter className="w-6 h-6" />
                                    </a>
                                )}
                                {seller.socialHandles?.instagram && (
                                    <a
                                        href={seller.socialHandles.instagram}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:scale-110 transition">
                                        <Instagram className="w-6 h-6" />
                                    </a>
                                )}
                                {seller.socialHandles?.youtube && (
                                    <a
                                        href={seller.socialHandles.youtube}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="hover:scale-110 transition">
                                        <Youtube className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-4 max-w-4xl text-center">
                            <Stat
                                label="Products"
                                value={productsCount}
                            />
                            <Stat
                                label="Sales"
                                value={totalSales}
                            />
                            <Stat
                                label="Rating"
                                value={avgRating?.toFixed(1) || '0.0'}
                            />
                            <Stat
                                label="Reviews"
                                value={totalReviews}
                            />
                            <Stat
                                label="Views"
                                value={stats.profileViews || 0}
                            />
                        </div>
                    </div>

                    <div className="hidden">
                        {/* Social icons moved above */}
                    </div>
                </motion.div>
            </Container>

            {/* Content */}
            <Container>
                <div className="grid lg:grid-cols-3 gap-8 pb-20">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Introduction / About */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className={cardBase}>
                            <h2 className={sectionTitle}>Introduction</h2>
                            <p className="text-gray-300 text-xl leading-relaxed">{seller.bio || 'No bio available.'}</p>
                            <div className="mt-6 grid gap-3 text-xs sm:text-sm text-gray-300">
                                {seller.location?.country && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-[#00FF89]" />
                                        {seller.location.country}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#00FF89]" />
                                    Joined {new Date(seller.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </div>
                                {seller.location?.timezone && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#00FF89]" />
                                        Timezone: {seller.location.timezone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#00FF89]" />
                                    {stats.profileViews || 0} profile views
                                </div>
                                {daysActive > 0 && (
                                    <div
                                        className="flex items-center gap-2 cursor-help"
                                        title={`Active Days = floor((Now - Joined Date) / 86400000). Joined: ${new Date(seller.memberSince).toLocaleDateString()}`}>
                                        <Clock className="w-4 h-4 text-[#00FF89]" />
                                        Active for {daysActive} day{daysActive === 1 ? '' : 's'}
                                    </div>
                                )}
                                {localTime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#00FF89]" />
                                        Local Time: {localTime}
                                    </div>
                                )}
                            </div>
                            {milestones.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {milestones.map((m) => (
                                        <span
                                            key={m}
                                            className="px-2 py-1 bg-[#00FF89]/10 border border-[#00FF89]/30 text-[#00FF89] text-xs rounded-md">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Timeline */}
                            <div className="mt-6 border-t border-white/5 pt-4">
                                <h3 className="text-lg font-semibold mb-2 text-white/90">Timeline</h3>
                                <ul className="text-sm space-y-1 text-gray-400">
                                    <li>Joined: {new Date(seller.memberSince).toLocaleDateString()}</li>
                                    {earliestProduct && <li>First Product: {new Date(earliestProduct.createdAt).toLocaleDateString()}</li>}
                                    {latestProductUpdate && <li>Last Update: {new Date(latestProductUpdate.updatedAt).toLocaleDateString()}</li>}
                                </ul>
                            </div>
                        </motion.div>

                        {/* Tool Stack */}
                        {uniqueTools.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className={cardBase}>
                                <h2 className={sectionTitle}>Tool Stack</h2>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueTools.map((t) => (
                                        <span
                                            key={t}
                                            className="px-3 py-1.5 bg-white/5 rounded-md border border-white/10 text-sm text-[#00FF89]">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Tags Cloud */}
                        {uniqueTags.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.14 }}
                                className={cardBase}>
                                <h2 className={sectionTitle}>Topics / Tags</h2>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-[#111] rounded-lg border border-[#222] text-xs text-gray-300">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Skills */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className={cardBase}>
                            <h2 className={sectionTitle}>Skills & Tools</h2>
                            <div className="flex flex-wrap gap-2">
                                {[...(seller.niches || []), ...(seller.toolsSpecialization || [])]
                                    .slice(0, showAllSkills ? 30 : 8)
                                    .map((skill, i) => (
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            key={i}
                                            className="px-3 py-1.5 bg-[#111] border border-[#222] rounded-lg text-[#00FF89] text-base font-medium">
                                            {skill}
                                        </motion.span>
                                    ))}
                            </div>
                            {(seller.niches?.length || 0) + (seller.toolsSpecialization?.length || 0) > 8 && (
                                <button
                                    onClick={() => setShowAllSkills(!showAllSkills)}
                                    className="mt-3 text-[#00FF89] text-sm hover:underline">
                                    {showAllSkills ? 'Show Less' : 'Show More'}
                                </button>
                            )}
                        </motion.div>

                        {/* Performance / Analytics */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className={cardBase}>
                            <h2 className={sectionTitle}>Performance</h2>
                            <ul className="text-lg text-gray-300 space-y-2">
                                <li className="flex justify-between">
                                    <span>Total Sales</span>
                                    <strong>{totalSales}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Total Products</span>
                                    <strong>{productsCount}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Avg Rating</span>
                                    <strong>{avgRating?.toFixed(1) || '0.0'}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Total Reviews</span>
                                    <strong>{totalReviews}</strong>
                                </li>
                                <li className="flex justify-between">
                                    <span>Profile Views</span>
                                    <strong>{stats.profileViews || 0}</strong>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className={cardBase}
                            id="seller-products-section"
                        >
                            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Package className="w-6 h-6 text-[#00FF89]" />
                                    <h2 className="text-xl font-semibold text-white [font-family:var(--font-league-spartan)] tracking-wide mb-0 leading-none">Products ({pagination?.totalItems ?? products.length})</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        aria-pressed={viewMode === 'grid'}
                                        className={`h-11 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition ${viewMode === 'grid' ? 'bg-[#00FF89] text-black border-[#00FF89]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                                    >
                                        <LayoutGrid className="w-4 h-4" /> Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        aria-pressed={viewMode === 'list'}
                                        className={`h-11 px-4 rounded-lg border text-sm font-medium flex items-center gap-2 transition ${viewMode === 'list' ? 'bg-[#00FF89] text-black border-[#00FF89]' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                                    >
                                        <List className="w-4 h-4" /> List
                                    </button>
                                </div>
                            </div>

                            {products.length ? (
                                viewMode === 'grid' ? (
                                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {products.map((p) => {
                                            const discount =
                                                p.originalPrice && p.originalPrice > p.price
                                                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                                                    : 0
                                            const savings = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0
                                            const ageDays = Math.max(1, Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000))
                                            return (
                                                <motion.div
                                                    key={p._id}
                                                    whileHover={{ scale: 1.02 }}
                                                    transition={{ type: 'spring', stiffness: 200 }}
                                                    onClick={() => handleProductClick(p._id)}
                                                    className="group bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl p-4 hover:border-[#00FF89]/60 transition cursor-pointer">
                                                    <div className="relative h-40 w-full rounded-lg overflow-hidden mb-3">
                                                        <img
                                                            src={p.thumbnail}
                                                            alt={p.title}
                                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                            loading="lazy"
                                                        />
                                                        {discount > 0 && (
                                                            <span className="absolute top-2 left-2 bg-[#00FF89] text-black text-[10px] font-bold px-2 py-1 rounded-md">
                                                                -{discount}%
                                                            </span>
                                                        )}
                                                        {p.isVerified && (
                                                            <span className="absolute top-2 right-2 bg-black/70 backdrop-blur px-2 py-1 rounded-md text-[10px] text-[#00FF89] border border-[#00FF89]/40 flex items-center gap-1">
                                                                <Shield className="w-3 h-3" />
                                                                Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {p.currentVersion && <Badge label={`v${p.currentVersion}`} />}
                                                        {p.priceCategory && (
                                                            <Badge
                                                                label={mapPriceCategory(p.priceCategory)}
                                                                tone="neutral"
                                                            />
                                                        )}
                                                        {p.setupTime && (
                                                            <Badge
                                                                label={p.setupTime === 'instant' ? 'Instant Setup' : p.setupTime}
                                                                tone="accent"
                                                            />
                                                        )}
                                                        {p.targetAudience && (
                                                            <Badge
                                                                label={p.targetAudience}
                                                                tone="neutral"
                                                            />
                                                        )}
                                                        {p.isVerified && (
                                                            <Badge
                                                                label="Verified"
                                                                icon={<Shield className="w-3 h-3" />}
                                                            />
                                                        )}
                                                        {p.isTested && <Badge label="Tested" />}
                                                        {p.hasRefundPolicy && <Badge label="Refund Policy" />}
                                                        {p.hasGuarantee && <Badge label="Guarantee" />}
                                                    </div>
                                                    <h3 className="font-semibold group-hover:text-[#00FF89] transition text-lg line-clamp-1">
                                                        {p.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-1 flex gap-2">
                                                        {p.category?.name && <span>{p.category.name}</span>}
                                                        {p.industry?.name && <span>• {p.industry.name}</span>}
                                                    </p>
                                                    <p className="text-base text-gray-300 line-clamp-3 mt-2">{p.shortDescription}</p>
                                                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-400">
                                                        <span>{p.views} views</span>
                                                        <span>{p.sales} sales</span>
                                                        <span>{p.favorites} favorites</span>
                                                        <span>{p.upvotes} upvotes</span>
                                                    </div>
                                                    {p.benefits?.length > 0 && (
                                                        <ul className="mt-3 space-y-1 text-sm text-gray-300 list-disc list-inside">
                                                            {p.benefits.slice(0, 2).map((b) => (
                                                                <li key={b}>{b}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    {p.useCaseExamples?.length > 0 && (
                                                        <div className="mt-2 text-sm text-gray-400">
                                                            <span className="text-gray-500">Use Case:</span> {p.useCaseExamples[0]}
                                                        </div>
                                                    )}
                                                    {p.toolsUsed?.length > 0 && (
                                                        <div className="mt-3 flex flex-wrap gap-1">
                                                            {p.toolsUsed.slice(0, 3).map((t) => (
                                                                <span
                                                                    key={t.name + t.model}
                                                                    className="px-2 py-0.5 bg-white/5 rounded-md text-xs text-gray-300 border border-white/10">
                                                                    {t.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col divide-y divide-white/5">
                                        {products.map((p) => {
                                            const discount =
                                                p.originalPrice && p.originalPrice > p.price
                                                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                                                    : 0
                                            const savings = p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0
                                            const ageDays = Math.max(1, Math.floor((Date.now() - new Date(p.createdAt).getTime()) / 86400000))
                                            return (
                                                <motion.div
                                                    key={p._id}
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                    onClick={() => handleProductClick(p._id)}
                                                    className="cursor-pointer flex flex-col gap-4 py-4 first:pt-0 last:pb-0">
                                                    <div className="flex gap-4">
                                                        <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#1a1a1a] shrink-0">
                                                            <img
                                                                src={p.thumbnail}
                                                                alt={p.title}
                                                                className="absolute inset-0 w-full h-full object-cover"
                                                                loading="lazy"
                                                            />
                                                            {discount > 0 && (
                                                                <span className="absolute top-2 left-2 bg-[#00FF89] text-black text-[10px] font-bold px-2 py-1 rounded-md">
                                                                    -{discount}%
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 flex flex-col min-w-0">
                                                            <div className="flex flex-wrap gap-2 mb-2">
                                                                {p.currentVersion && <Badge label={`v${p.currentVersion}`} />}
                                                                {p.priceCategory && (
                                                                    <Badge
                                                                        label={mapPriceCategory(p.priceCategory)}
                                                                        tone="neutral"
                                                                    />
                                                                )}
                                                                {p.setupTime && (
                                                                    <Badge
                                                                        label={p.setupTime === 'instant' ? 'Instant Setup' : p.setupTime}
                                                                        tone="accent"
                                                                    />
                                                                )}
                                                                {p.targetAudience && (
                                                                    <Badge
                                                                        label={p.targetAudience}
                                                                        tone="neutral"
                                                                    />
                                                                )}
                                                                {p.isVerified && (
                                                                    <Badge
                                                                        label="Verified"
                                                                        icon={<Shield className="w-3 h-3" />}
                                                                    />
                                                                )}
                                                                {p.isTested && <Badge label="Tested" />}
                                                                {p.hasRefundPolicy && <Badge label="Refund Policy" />}
                                                                {p.hasGuarantee && <Badge label="Guarantee" />}
                                                            </div>
                                                            <div className="flex justify-between items-start gap-4">
                                                                <h3 className="font-semibold text-lg truncate hover:text-[#00FF89] transition">
                                                                    {p.title}
                                                                </h3>
                                                                <div className="flex flex-col items-end gap-0.5">
                                                                    <span className="text-[#00FF89] font-semibold text-base">${p.price.toFixed(2)}</span>
                                                                    {discount > 0 && (
                                                                        <span className="text-[11px] text-gray-500 line-through">
                                                                            ${p.originalPrice.toFixed(2)}
                                                                        </span>
                                                                    )}
                                                                    {discount > 0 && (
                                                                        <span className="text-[10px] text-[#00FF89]">
                                                                            Save ${savings.toFixed(2)} ({discount}%)
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1 flex gap-2 truncate">
                                                                {p.category?.name && <span>{p.category.name}</span>}
                                                                {p.industry?.name && <span>• {p.industry.name}</span>}
                                                                {p.setupTime && <span>• {p.setupTime}</span>}
                                                                <span>• {ageDays}d old</span>
                                                            </p>
                                                            <p className="text-base text-gray-300 mt-2 line-clamp-4">{p.shortDescription}</p>
                                                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-400">
                                                                <span>{p.views} views</span>
                                                                <span>{p.sales} sales</span>
                                                                <span>{p.favorites} favorites</span>
                                                                <span>{p.upvotes} upvotes</span>
                                                                <span className="flex items-center gap-1 text-yellow-400">
                                                                    <Star className="w-3 h-3 fill-current" />
                                                                    {p.averageRating?.toFixed(1) || 0}
                                                                </span>
                                                            </div>
                                                            {p.benefits?.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h4 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Benefits</h4>
                                                                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                                                                        {p.benefits.slice(0, 4).map((b) => (
                                                                            <li key={b}>{b}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                            {p.useCaseExamples?.length > 0 && (
                                                                <div className="mt-3">
                                                                    <h4 className="text-xs uppercase tracking-wide text-gray-400 mb-1">Use Cases</h4>
                                                                    <ul className="list-disc list-inside text-sm space-y-1 text-gray-300">
                                                                        {p.useCaseExamples.slice(0, 3).map((u) => (
                                                                            <li key={u}>{u}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                )
                            ) : (
                                <div className="text-gray-500 text-center py-10">No products yet</div>
                            )}

                            {/* Pagination Controls */}
                            {pagination?.totalPages > 1 && (
                                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                                    {/* Helper to build truncated page list */}
                                    {(() => {
                                        const total = pagination.totalPages
                                        const current = productPage
                                        const pages = []

                                        const push = (p) => pages.push(p)
                                        const addEllipsis = (key) => pages.push({ type: 'ellipsis', key })

                                        if (total <= 7) {
                                            for (let i = 1; i <= total; i++) push(i)
                                        } else {
                                            push(1)
                                            if (current > 4) addEllipsis('left')
                                            const start = Math.max(2, current - 1)
                                            const end = Math.min(total - 1, current + 1)
                                            for (let i = start; i <= end; i++) push(i)
                                            if (current < total - 3) addEllipsis('right')
                                            push(total)
                                        }

                                        return (
                                            <>
                                                <button
                                                    onClick={() => goToPage(productPage - 1)}
                                                    disabled={!pagination.hasPreviousPage}
                                                    className={`px-3 py-2 rounded-lg text-sm border transition ${pagination.hasPreviousPage ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200' : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'}`}
                                                    aria-label="Previous page"
                                                >
                                                    Prev
                                                </button>
                                                {pages.map((p, idx) =>
                                                    typeof p === 'object' && p.type === 'ellipsis' ? (
                                                        <span
                                                            key={p.key + idx}
                                                            className="px-2 py-2 text-sm text-gray-500 select-none">
                                                            …
                                                        </span>
                                                    ) : (
                                                        <button
                                                            key={p}
                                                            onClick={() => goToPage(p)}
                                                            aria-current={p === productPage ? 'page' : undefined}
                                                            className={`min-w-[42px] px-3 py-2 rounded-lg text-sm font-medium border transition ${p === productPage ? 'bg-[#00FF89] border-[#00FF89] text-black' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
                                                        >
                                                            {p}
                                                        </button>
                                                    )
                                                )}
                                                <button
                                                    onClick={() => goToPage(productPage + 1)}
                                                    disabled={!pagination.hasNextPage}
                                                    className={`px-3 py-2 rounded-lg text-sm border transition ${pagination.hasNextPage ? 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-200' : 'bg-white/5 border-white/10 text-gray-500 cursor-not-allowed'}`}
                                                    aria-label="Next page"
                                                >
                                                    Next
                                                </button>
                                            </>
                                        )
                                    })()}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </Container>

            {isContactWidgetOpen && (
                <ContactWidget
                    seller={seller}
                    isOpen={isContactWidgetOpen}
                    onClose={() => setIsContactWidgetOpen(false)}
                />
            )}
        </div>
    )
}

function Stat({ label, value }) {
    return (
        <div className="bg-white/5 rounded-lg py-5">
            <div className="text-3xl font-bold [font-family:var(--font-league-spartan)]">{value}</div>
            <div className="text-xs sm:text-sm uppercase tracking-wide text-gray-400">{label}</div>
        </div>
    )
}

function Badge({ label, icon, tone = 'primary' }) {
    const toneClasses =
        tone === 'accent'
            ? 'bg-[#00FF89]/15 border-[#00FF89]/40 text-[#00FF89]'
            : tone === 'neutral'
              ? 'bg-white/5 border-white/10 text-gray-300'
              : 'bg-[#00FF89]/10 border-[#00FF89]/30 text-[#00FF89]'
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-medium ${toneClasses}`}>
            {icon}
            {label}
        </span>
    )
}

function mapPriceCategory(pc) {
    switch (pc) {
        case 'over_50':
            return 'Premium'
        case 'under_10':
            return 'Budget'
        case '10_50':
            return 'Standard'
        default:
            return pc
    }
}

