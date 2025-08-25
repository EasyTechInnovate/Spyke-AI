'use client'

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import { debounce } from '@/utils/debounce'
import Header from '@/components/shared/layout/Header'
import { sellerAPI } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import toast from '@/lib/utils/toast'
import { 
    Search, 
    Users, 
    Star, 
    MapPin, 
    Calendar, 
    Package, 
    Filter,
    Grid3X3,
    List,
    RefreshCw,
    AlertTriangle,
    Loader2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

// Import Design System Components
import { DSContainer, DSStack, DSHeading, DSText, DSButton, DSLoadingState, DSBadge } from '@/lib/design-system'

const BRAND = '#00FF89'
const ITEMS_PER_PAGE = 12

// Helper function to format join date
const formatJoinDate = (dateString) => {
    return new Date(dateString).getFullYear()
}

// Loading skeletons following design system patterns
function CreatorCardSkeleton() {
    return (
        <div className="bg-[#171717] border border-gray-800 rounded-xl overflow-hidden">
            <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-800 rounded animate-pulse" />
                        <div className="h-3 bg-gray-800 rounded w-2/3 animate-pulse" />
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-3 bg-gray-800 rounded animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded w-4/5 animate-pulse" />
                </div>
                <div className="flex gap-2">
                    <div className="h-6 bg-gray-800 rounded-full w-16 animate-pulse" />
                    <div className="h-6 bg-gray-800 rounded-full w-20 animate-pulse" />
                </div>
            </div>
        </div>
    )
}

function CreatorsGrid({ creators, loading, viewMode = 'grid' }) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
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
                className="text-center py-16">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <DSHeading level={3} size="lg" style={{ color: '#ffffff', marginBottom: '0.5rem' }}>
                    No creators found
                </DSHeading>
                <DSText style={{ color: '#9ca3af' }}>
                    Try adjusting your search or filters to discover more creators
                </DSText>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {creators.map((creator, index) => (
                <motion.div
                    key={creator._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}>
                    <CreatorCard creator={creator} />
                </motion.div>
            ))}
        </motion.div>
    )
}

// Enhanced Creator Card following design system
function CreatorCard({ creator }) {
    const hasStats = creator.stats && Object.keys(creator.stats).length > 0

    return (
        <Link href={`/profile/${creator._id}`} className="group block">
            <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="bg-[#171717] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/30 transition-all duration-300 h-full">
                
                {/* Creator Header */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                        {creator.userId?.avatar ? (
                            <Image
                                src={creator.userId.avatar}
                                alt={creator.fullName}
                                width={48}
                                height={48}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-[#00FF89]/20 rounded-full flex items-center justify-center">
                                <span className="text-[#00FF89] font-semibold text-lg">
                                    {creator.fullName?.charAt(0) || 'U'}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate group-hover:text-[#00FF89] transition-colors">
                            {creator.fullName || 'Anonymous Creator'}
                        </h3>
                        {creator.location?.country && (
                            <div className="flex items-center gap-1 text-sm text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>{creator.location.country}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                    <DSText size="sm" style={{ color: '#9ca3af', marginBottom: '1rem' }} className="line-clamp-3">
                        {creator.bio}
                    </DSText>
                )}

                {/* Expertise Tags */}
                {creator.niches && creator.niches.length > 0 && (
                    <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                            {creator.niches.slice(0, 3).map((niche, index) => (
                                <DSBadge 
                                    key={index}
                                    variant="primary"
                                    size="sm"
                                >
                                    {niche}
                                </DSBadge>
                            ))}
                            {creator.niches.length > 3 && (
                                <DSBadge variant="secondary" size="sm">
                                    +{creator.niches.length - 3}
                                </DSBadge>
                            )}
                        </div>
                    </div>
                )}

                {/* Tools */}
                {creator.toolsSpecialization && creator.toolsSpecialization.length > 0 && (
                    <div className="mb-4">
                        <DSText size="xs" style={{ color: '#6b7280', marginBottom: '0.25rem' }}>
                            Specializes in:
                        </DSText>
                        <div className="flex flex-wrap gap-1">
                            {creator.toolsSpecialization.slice(0, 3).map((tool, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                                >
                                    {tool}
                                </span>
                            ))}
                            {creator.toolsSpecialization.length > 3 && (
                                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded">
                                    +{creator.toolsSpecialization.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Stats */}
                {hasStats && (
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-white">
                                {creator.stats.totalProducts || 0}
                            </div>
                            <div className="text-xs text-gray-500">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="text-lg font-semibold text-white">
                                    {creator.stats.averageRating ? creator.stats.averageRating.toFixed(1) : '0.0'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-500">
                                ({creator.stats.totalReviews || 0} reviews)
                            </div>
                        </div>
                    </div>
                )}

                {/* Join Date */}
                {creator.userId?.createdAt && (
                    <div className="flex items-center gap-1 mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatJoinDate(creator.userId.createdAt)}</span>
                    </div>
                )}
            </motion.div>
        </Link>
    )
}

// Enhanced filter controls following design system
function CreatorControls({ 
    searchQuery, 
    filters, 
    sortBy,
    onSearchChange, 
    onFilterChange, 
    onSortChange,
    onClearFilters,
    creatorsCount = 0
}) {
    const niches = ['E-commerce', 'Marketing', 'Social Media', 'Email Marketing', 'Lead Generation', 'Customer Support', 'Data Analysis']
    const tools = ['Zapier', 'Make', 'Shopify', 'WooCommerce', 'Mailchimp', 'HubSpot', 'Airtable', 'Google Sheets']
    const countries = ['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'India', 'Brazil']

    const hasActiveFilters = filters.niche || filters.tool || filters.country || filters.minRating > 0

    return (
        <div className="mb-8">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search creators by name, skills, or expertise..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-[#171717] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all"
                    />
                </div>
            </div>

            {/* Filter Controls */}
            <div className="bg-[#171717] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <DSText size="sm" style={{ color: '#ffffff' }}>
                        Filters ({creatorsCount} creators)
                    </DSText>
                    {hasActiveFilters && (
                        <DSButton
                            variant="secondary"
                            size="small"
                            onClick={onClearFilters}
                        >
                            Clear All
                        </DSButton>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Niche Filter */}
                    <select
                        value={filters.niche}
                        onChange={(e) => onFilterChange('niche', e.target.value)}
                        className="px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    >
                        <option value="">All Specializations</option>
                        {niches.map(niche => (
                            <option key={niche} value={niche}>{niche}</option>
                        ))}
                    </select>

                    {/* Tool Filter */}
                    <select
                        value={filters.tool}
                        onChange={(e) => onFilterChange('tool', e.target.value)}
                        className="px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    >
                        <option value="">All Tools</option>
                        {tools.map(tool => (
                            <option key={tool} value={tool}>{tool}</option>
                        ))}
                    </select>

                    {/* Country Filter */}
                    <select
                        value={filters.country}
                        onChange={(e) => onFilterChange('country', e.target.value)}
                        className="px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    >
                        <option value="">All Countries</option>
                        {countries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>

                    {/* Sort Filter */}
                    <select
                        value={sortBy}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="px-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50"
                    >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="stats.averageRating-desc">Highest Rated</option>
                        <option value="stats.totalProducts-desc">Most Products</option>
                    </select>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800">
                        {filters.niche && (
                            <DSBadge variant="primary">
                                Niche: {filters.niche}
                            </DSBadge>
                        )}
                        {filters.tool && (
                            <DSBadge variant="primary">
                                Tool: {filters.tool}
                            </DSBadge>
                        )}
                        {filters.country && (
                            <DSBadge variant="primary">
                                Country: {filters.country}
                            </DSBadge>
                        )}
                        {filters.minRating > 0 && (
                            <DSBadge variant="primary">
                                {filters.minRating}+ Stars
                            </DSBadge>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Enhanced Pagination component
function CreatorsPagination({ currentPage, totalPages, onPageChange, loading }) {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        const showPages = 5
        const halfShow = Math.floor(showPages / 2)
        
        let startPage = Math.max(1, currentPage - halfShow)
        let endPage = Math.min(totalPages, currentPage + halfShow)
        
        // Adjust if we're near the beginning or end
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
            className="flex items-center justify-center gap-2 mt-12">
            
            <DSButton
                variant="secondary"
                size="small"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="flex items-center gap-1"
            >
                <ChevronLeft className="w-4 h-4" />
                Previous
            </DSButton>
            
            {getPageNumbers().map((pageNum) => (
                <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        pageNum === currentPage
                            ? 'bg-[#00FF89] text-black font-medium'
                            : 'bg-[#171717] border border-gray-800 text-white hover:bg-[#1f1f1f] hover:border-gray-700'
                    }`}
                >
                    {pageNum}
                </button>
            ))}
            
            <DSButton
                variant="secondary"
                size="small"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="flex items-center gap-1"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </DSButton>
        </motion.div>
    )
}

// Error boundary component
function CreatorsErrorBoundary({ error, resetErrorBoundary, onRetry }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
                <DSStack gap="large" direction="column" align="center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <DSStack gap="small" direction="column" align="center">
                        <DSHeading level={3} size="lg">
                            <span style={{ color: 'white' }}>Something went wrong</span>
                        </DSHeading>
                        <DSText style={{ color: '#9ca3af', textAlign: 'center' }}>
                            {error?.message || 'Failed to load creators. Please try again.'}
                        </DSText>
                    </DSStack>
                    
                    <DSButton variant="primary" onClick={onRetry || resetErrorBoundary}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                    </DSButton>
                </DSStack>
            </div>
        </motion.div>
    )
}

function CreatorsPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // State management
    const [creators, setCreators] = useState([])
    const [loading, setLoading] = useState(true)
    const [initialLoading, setInitialLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchInput, setSearchInput] = useState('')
    const [filters, setFilters] = useState({
        niche: '',
        tool: '',
        country: '',
        minRating: 0
    })
    const [pagination, setPagination] = useState({
        page: 1,
        limit: ITEMS_PER_PAGE,
        total: 0,
        totalPages: 0
    })
    const [sortBy, setSortBy] = useState('createdAt-desc')

    // Enhanced debounced search
    const debouncedSearch = useCallback(
        debounce((searchTerm) => {
            setSearchQuery(searchTerm)
            setPagination(prev => ({ ...prev, page: 1 }))
        }, 300),
        []
    )

    // Enhanced API call
    const fetchCreators = useCallback(async (page = 1) => {
        try {
            setLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams()
            
            if (filters.niche) params.append('niche', filters.niche)
            if (filters.tool) params.append('tool', filters.tool)
            if (filters.country) params.append('country', filters.country)
            if (filters.minRating > 0) params.append('minRating', filters.minRating)
            if (searchQuery) params.append('search', searchQuery)
            
            params.append('page', page)
            params.append('limit', pagination.limit)
            
            const [sortField, sortOrder] = sortBy.split('-')
            params.append('sortBy', sortField)
            params.append('sortOrder', sortOrder)

            const queryString = params.toString() ? `?${params.toString()}` : ''
            const response = await sellerAPI.searchSellers(queryString)
            
            if (response?.sellers) {
                setCreators(response.sellers)
                setPagination(prev => ({
                    ...prev,
                    page,
                    total: response.pagination?.total || 0,
                    totalPages: response.pagination?.totalPages || 0
                }))
            }
        } catch (err) {
            console.error('Error fetching creators:', err)
            setError('Failed to load creators. Please try again.')
            setCreators([])
        } finally {
            setLoading(false)
            setInitialLoading(false)
        }
    }, [filters, searchQuery, sortBy, pagination.limit])

    // Event handlers
    const handleSearchChange = useCallback((searchTerm) => {
        setSearchInput(searchTerm)
        debouncedSearch(searchTerm)
    }, [debouncedSearch])

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
        setFilters({
            niche: '',
            tool: '',
            country: '',
            minRating: 0
        })
        setSearchQuery('')
        setSearchInput('')
        setPagination(prev => ({ ...prev, page: 1 }))
    }, [])

    const handleRetry = useCallback(() => {
        fetchCreators(pagination.page)
    }, [fetchCreators, pagination.page])

    // Effects
    useEffect(() => {
        fetchCreators(pagination.page)
    }, [fetchCreators, pagination.page])

    // Filter creators by search query on frontend for responsive search
    const filteredCreators = useMemo(() => {
        if (!searchInput.trim() || searchInput === searchQuery) return creators
        
        const query = searchInput.toLowerCase()
        return creators.filter(creator => 
            creator.fullName?.toLowerCase().includes(query) ||
            creator.bio?.toLowerCase().includes(query) ||
            creator.niches?.some(niche => niche.toLowerCase().includes(query)) ||
            creator.toolsSpecialization?.some(tool => tool.toLowerCase().includes(query))
        )
    }, [creators, searchInput, searchQuery])

    return (
        <ErrorBoundary FallbackComponent={CreatorsErrorBoundary}>
            <div className="min-h-screen bg-black text-white">
                <Header />

                <main className="pt-24 pb-16">
                    <DSContainer>
                        {/* Page Header following ExploreHeader pattern */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 sm:mb-12 text-center">
                            
                            <DSStack gap="medium" direction="column" align="center">
                                <DSBadge variant="primary" icon={Users} className="mb-2">
                                    Meet Our Community
                                </DSBadge>
                                
                                <DSHeading level={1} variant="hero">
                                    <span style={{ color: 'white' }}>Discover </span>
                                    <span style={{ color: BRAND }}>Creators</span>
                                </DSHeading>
                                
                                <DSText variant="subhero" style={{ color: '#9ca3af' }}>
                                    Connect with talented automation experts and digital creators ready to transform your business
                                </DSText>

                                <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        <span>{pagination.total} Active Creators</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        <span>1000+ Products Available</span>
                                    </div>
                                </div>
                            </DSStack>
                        </motion.div>

                        {/* Controls */}
                        <CreatorControls
                            searchQuery={searchInput}
                            filters={filters}
                            sortBy={sortBy}
                            onSearchChange={handleSearchChange}
                            onFilterChange={handleFilterChange}
                            onSortChange={handleSortChange}
                            onClearFilters={clearFilters}
                            creatorsCount={pagination.total}
                        />

                        {/* Main Content */}
                        {initialLoading ? (
                            <DSLoadingState
                                icon={Loader2}
                                message="Discovering Amazing Creators"
                                description="Finding the perfect creators for you..."
                                className="min-h-[60vh]"
                            />
                        ) : error ? (
                            <CreatorsErrorBoundary
                                error={{ message: error }}
                                onRetry={handleRetry}
                            />
                        ) : (
                            <>
                                <CreatorsGrid
                                    creators={filteredCreators}
                                    loading={loading && !initialLoading}
                                />

                                <CreatorsPagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                    loading={loading}
                                />

                                {/* Results Summary */}
                                {!loading && !error && filteredCreators.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.3 }}
                                        className="mt-8 text-center">
                                        <DSText size="sm" style={{ color: '#9ca3af' }}>
                                            Showing {filteredCreators.length} of {pagination.total.toLocaleString()} creators
                                        </DSText>
                                    </motion.div>
                                )}
                            </>
                        )}
                    </DSContainer>
                </main>
            </div>
        </ErrorBoundary>
    )
}

export default function CreatorsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black text-white">
                    <Header />
                    <div className="pt-24 pb-16">
                        <DSContainer>
                            <DSLoadingState
                                icon={Loader2}
                                message="Loading Creators"
                                description="Setting up your browsing experience..."
                                className="min-h-[60vh]"
                            />
                        </DSContainer>
                    </div>
                </div>
            }>
            <CreatorsPageContent />
        </Suspense>
    )
}