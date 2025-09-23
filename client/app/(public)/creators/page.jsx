'use client'
import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { debounce } from '@/utils/debounce'
import { sellerAPI } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { 
    Search, 
    Users, 
    Star, 
    MapPin, 
    Calendar, 
    Package, 
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Eye,
    TrendingUp,
    Award,
    Heart,
    ExternalLink
} from 'lucide-react'
const ITEMS_PER_PAGE = 12
function CreatorCardSkeleton() {
    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white/10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-white/10 rounded w-3/4" />
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
            </div>
            <div className="space-y-3">
                <div className="h-4 bg-white/10 rounded" />
                <div className="h-4 bg-white/10 rounded w-5/6" />
                <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-white/10 rounded-full w-20" />
                    <div className="h-6 bg-white/10 rounded-full w-24" />
                </div>
            </div>
        </div>
    )
}
function HeroSection({ creatorsCount }) {
    return (
        <section className="text-center py-8 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                    <Users className="w-4 h-4 text-[#00FF89]" />
                    <span className="text-sm font-medium text-[#00FF89]">
                        {creatorsCount?.toLocaleString() || '0'} Active Creators
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                    Meet Our{' '}
                    <span className="bg-gradient-to-r from-[#00FF89] to-emerald-400 bg-clip-text text-transparent">
                        Creators
                    </span>
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                    Discover talented automation experts and digital creators ready to transform your business
                </p>
            </motion.div>
        </section>
    )
}
function SearchControls({ 
    searchQuery, 
    filters, 
    sortBy, 
    onSearchChange, 
    onFilterChange, 
    onSortChange,
    onClearFilters,
    creatorsCount 
}) {
    const niches = ['E-commerce', 'Email Marketing', 'Lead Generation', 'Sales Automation']
    const tools = ['Zapier', 'Mailchimp']
    const countries = ['India']
    const hasActiveFilters = filters.niche || filters.tool || filters.country
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
        >
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search creators by name or expertise..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all"
                />
            </div>
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-400">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filters</span>
                </div>
                <select
                    value={filters.niche}
                    onChange={(e) => {
                        onFilterChange('niche', e.target.value)
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                >
                    <option value="">All Niches</option>
                    {niches.map(niche => (
                        <option key={niche} value={niche} className="bg-gray-800">{niche}</option>
                    ))}
                </select>
                <select
                    value={filters.tool}
                    onChange={(e) => {
                        onFilterChange('tool', e.target.value)
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                >
                    <option value="">All Tools</option>
                    {tools.map(tool => (
                        <option key={tool} value={tool} className="bg-gray-800">{tool}</option>
                    ))}
                </select>
                <select
                    value={filters.country}
                    onChange={(e) => {
                        onFilterChange('country', e.target.value)
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                >
                    <option value="">All Countries</option>
                    {countries.map(country => (
                        <option key={country} value={country} className="bg-gray-800">{country}</option>
                    ))}
                </select>
                <select
                    value={sortBy}
                    onChange={(e) => {
                        onSortChange(e.target.value)
                    }}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                >
                    <option value="createdAt-desc" className="bg-gray-800">Newest First</option>
                    <option value="stats.averageRating-desc" className="bg-gray-800">Highest Rated</option>
                    <option value="stats.totalProducts-desc" className="bg-gray-800">Most Products</option>
                    <option value="stats.profileViews-desc" className="bg-gray-800">Most Popular</option>
                </select>
                {hasActiveFilters && (
                    <button
                        onClick={() => {
                            onClearFilters()
                        }}
                        className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm hover:bg-red-500/30 transition-all"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {filters.niche && (
                        <span className="px-3 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs font-medium rounded-full border border-[#00FF89]/30">
                            Niche: {filters.niche}
                        </span>
                    )}
                    {filters.tool && (
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                            Tool: {filters.tool}
                        </span>
                    )}
                    {filters.country && (
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                            Country: {filters.country}
                        </span>
                    )}
                </div>
            )}
            <div className="text-sm text-gray-400">
                Showing {creatorsCount?.toLocaleString() || 0} creators
            </div>
        </motion.div>
    )
}
function CreatorCard({ creator }) {
    const formatJoinDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
        })
    }
    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'CR'
    }
    return (
        <Link href={`/profile/${creator._id}`} className="group block h-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
            >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full hover:border-[#00FF89]/30 hover:bg-white/10 transition-all duration-300 group flex flex-col">
                    <div className="flex items-start gap-4 mb-4 flex-shrink-0">
                        <div className="relative flex-shrink-0">
                            {creator.userId?.avatar ? (
                                <Image
                                    src={creator.userId.avatar}
                                    alt={creator.fullName}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-gradient-to-br from-[#00FF89]/20 to-emerald-400/20 rounded-full flex items-center justify-center border-2 border-[#00FF89]/30">
                                    <span className="text-[#00FF89] font-bold text-lg">
                                        {getInitials(creator.fullName)}
                                    </span>
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#00FF89] rounded-full border-2 border-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-lg leading-tight mb-1 group-hover:text-[#00FF89] transition-colors">
                                {creator.fullName}
                            </h3>
                            {creator.location?.country && (
                                <div className="flex items-center gap-1 text-sm text-gray-400">
                                    <MapPin className="w-3 h-3" />
                                    <span>{creator.location.country}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mb-4 flex-shrink-0">
                        {creator.bio ? (
                            <p className="text-sm text-gray-300 leading-relaxed h-16 overflow-hidden relative">
                                <span className="line-clamp-3">{creator.bio}</span>
                            </p>
                        ) : (
                            <div className="h-16"></div>
                        )}
                    </div>
                    <div className="mb-4 flex-shrink-0">
                        {creator.niches && creator.niches.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                                {creator.niches.slice(0, 2).map((niche, index) => (
                                    <span 
                                        key={index}
                                        className="px-2.5 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs font-medium rounded-full border border-[#00FF89]/30 whitespace-nowrap flex-shrink-0"
                                    >
                                        {niche}
                                    </span>
                                ))}
                                {creator.niches.length > 2 && (
                                    <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                                        +{creator.niches.length - 2}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="h-9"></div>
                        )}
                    </div>
                    <div className="mb-4 flex-shrink-0">
                        {creator.toolsSpecialization && creator.toolsSpecialization.length > 0 ? (
                            <>
                                <p className="text-xs text-gray-500 mb-2">Tools:</p>
                                <div className="flex flex-wrap gap-1 min-h-[28px]">
                                    {creator.toolsSpecialization.slice(0, 3).map((tool, index) => (
                                        <span 
                                            key={index}
                                            className="px-2 py-1 bg-white/5 text-gray-300 text-xs rounded-lg border border-white/10"
                                        >
                                            {tool}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="h-12"></div>
                        )}
                    </div>
                    <div className="flex-1"></div>
                    {creator.stats && (
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10 mb-4 flex-shrink-0">
                            <div className="text-center">
                                <div className="text-lg font-bold text-white mb-1">
                                    {creator.stats.totalProducts || 0}
                                </div>
                                <div className="text-xs text-gray-400">Products</div>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                    <span className="text-lg font-bold text-white">
                                        {creator.stats.averageRating || '0.0'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {creator.stats.totalReviews || 0} reviews
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>Since {formatJoinDate(creator.userId?.createdAt)}</span>
                        </div>
                        {creator.stats?.profileViews && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3 h-3" />
                                <span>{creator.stats.profileViews.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
function CreatorsGrid({ creators, loading }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <CreatorCardSkeleton key={i} />
                ))}
            </div>
        )
    }
    if (!creators.length) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
            >
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">No creators found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                    Try adjusting your search or filters to discover more creators
                </p>
            </motion.div>
        )
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator, index) => (
                <motion.div
                    key={creator._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                    <CreatorCard creator={creator} />
                </motion.div>
            ))}
        </div>
    )
}
function Pagination({ currentPage, totalPages, onPageChange, loading }) {
    if (totalPages <= 1) return null
    const getPageNumbers = () => {
        const pages = []
        const showPages = 5
        const halfShow = Math.floor(showPages / 2)
        let startPage = Math.max(1, currentPage - halfShow)
        let endPage = Math.min(totalPages, currentPage + halfShow)
        if (endPage - startPage + 1 < showPages) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + showPages - 1)
            } else {
                startPage = Math.max(1, endPage - showPages + 1)
            }
        }
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }
        return pages
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mt-16"
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </button>
            {getPageNumbers().map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-xl transition-all ${
                        pageNum === currentPage
                            ? 'bg-[#00FF89] text-black font-medium'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                >
                    {pageNum}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </motion.div>
    )
}
function ErrorState({ error, onRetry }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
        >
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">Something went wrong</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {error || 'Failed to load creators. Please try again.'}
            </p>
            <button
                onClick={onRetry}
                className="px-6 py-3 bg-[#00FF89] text-black font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-colors"
            >
                Try Again
            </button>
        </motion.div>
    )
}
function CreatorsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [creators, setCreators] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [filters, setFilters] = useState({
        niche: '',
        tool: '',
        country: ''
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0
    })
    const [sortBy, setSortBy] = useState('createdAt-desc')
    const fetchCreators = useCallback(async (resetData = false) => {
        try {
            setLoading(true)
            setError(null)
            const params = new URLSearchParams()
            params.append('page', 1)
            params.append('limit', 100)
            params.append('sortBy', 'createdAt')
            params.append('sortOrder', 'desc')
            const queryString = `?${params.toString()}`
            const response = await sellerAPI.searchSellers(queryString)
            let sellersData = null
            if (response?.data?.sellers) {
                sellersData = response.data.sellers
            } else if (response?.sellers) {
                sellersData = response.sellers
            } else {
                sellersData = []
            }
            setCreators(sellersData)
        } catch (err) {
            setError(err.message || 'Failed to load creators')
            setCreators([])
        } finally {
            setLoading(false)
        }
    }, [])
    const filteredAndSortedCreators = useMemo(() => {
        let filtered = [...creators]
        if (searchInput.trim()) {
            const query = searchInput.toLowerCase()
            filtered = filtered.filter(creator => 
                creator.fullName?.toLowerCase().includes(query) ||
                creator.bio?.toLowerCase().includes(query) ||
                creator.niches?.some(niche => niche.toLowerCase().includes(query)) ||
                creator.toolsSpecialization?.some(tool => tool.toLowerCase().includes(query))
            )
        }
        if (filters.niche) {
            filtered = filtered.filter(creator => 
                creator.niches?.includes(filters.niche)
            )
        }
        if (filters.tool) {
            filtered = filtered.filter(creator => 
                creator.toolsSpecialization?.includes(filters.tool)
            )
        }
        if (filters.country) {
            filtered = filtered.filter(creator => 
                creator.location?.country === filters.country
            )
        }
        if (sortBy) {
            const [sortField, sortOrder] = sortBy.split('-')
            filtered.sort((a, b) => {
                let aValue, bValue
                if (sortField === 'createdAt') {
                    aValue = new Date(a.userId?.createdAt || 0)
                    bValue = new Date(b.userId?.createdAt || 0)
                } else if (sortField.startsWith('stats.')) {
                    const statField = sortField.replace('stats.', '')
                    aValue = a.stats?.[statField] || 0
                    bValue = b.stats?.[statField] || 0
                } else {
                    aValue = a[sortField] || ''
                    bValue = b[sortField] || ''
                }
                if (sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1
                } else {
                    return aValue > bValue ? 1 : -1
                }
            })
        }
        return filtered
    }, [creators, searchInput, filters, sortBy])
    const paginatedCreators = useMemo(() => {
        const startIndex = (pagination.page - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        const paginatedData = filteredAndSortedCreators.slice(startIndex, endIndex)
        const newTotal = filteredAndSortedCreators.length
        const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE)
        setPagination(prev => ({
            ...prev,
            total: newTotal,
            totalPages: newTotalPages
        }))
        return paginatedData
    }, [filteredAndSortedCreators, pagination.page])
    const handleSearchChange = useCallback((searchTerm) => {
        setSearchInput(searchTerm)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])
    const handleFilterChange = useCallback((filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }))
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])
    const handleSortChange = useCallback((newSort) => {
        setSortBy(newSort)
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])
    const handlePageChange = useCallback((page) => {
        setPagination(prev => ({ ...prev, page }))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])
    const clearFilters = useCallback(() => {
        setFilters({ niche: '', tool: '', country: '' })
        setSearchInput('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])
    const handleRetry = useCallback(() => {
        fetchCreators(true)
    }, [fetchCreators])
    useEffect(() => {
        fetchCreators()
    }, [fetchCreators])
    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 pb-16">
                <HeroSection creatorsCount={filteredAndSortedCreators.length} />
                <SearchControls
                    searchQuery={searchInput}
                    filters={filters}
                    sortBy={sortBy}
                    onSearchChange={handleSearchChange}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    onClearFilters={clearFilters}
                    creatorsCount={filteredAndSortedCreators.length}
                />
                {error ? (
                    <ErrorState error={error} onRetry={handleRetry} />
                ) : (
                    <>
                        <CreatorsGrid creators={paginatedCreators} loading={loading} />
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </div>
    )
}
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading creators...</p>
            </div>
        </div>
    )
}
export default function CreatorsPage() {
    return (
        <ErrorBoundary fallback={<ErrorState />}>
            <Suspense fallback={<LoadingFallback />}>
                <CreatorsPageContent />
            </Suspense>
        </ErrorBoundary>
    )
}