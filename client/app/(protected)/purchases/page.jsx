'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Search,
    Calendar,
    CreditCard,
    ChevronRight,
    FileText,
    Zap,
    Bot,
    Layers,
    Loader2,
    List,
    Grid as GridIcon,
    Lock,
    Crown,
    Eye,
    Download,
    ExternalLink,
    X,
    Copy,
    Check
} from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { useAuth } from '@/hooks/useAuth'
import { useAnalytics } from '@/hooks/useAnalytics'
import { purchaseAPI } from '@/lib/api'
import Link from 'next/link'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import { useRouter } from 'next/navigation'

const typeIcons = {
    prompt: FileText,
    automation: Zap,
    agent: Bot,
    bundle: Layers
}

const typeColors = {
    prompt: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    automation: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    agent: 'text-[#00FF89] bg-[#00FF89]/10 border-[#00FF89]/20',
    bundle: 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/20'
}

export default function PurchasesPage() {
    const [notification, setNotification] = useState(null)
    
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    
    const clearNotification = () => setNotification(null)
    
    const { isAuthenticated, loading: authLoading } = useAuth()
    const { track } = useAnalytics()
    const router = useRouter()
    const { user } = useAuth()
    
    const [purchases, setPurchases] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState(null)
    const [viewMode, setViewMode] = useState('grid')
    const [sort, setSort] = useState('recent')
    const [selected, setSelected] = useState(new Set())
    const [showMobileFilters, setShowMobileFilters] = useState(false)
    const [selectedPurchase, setSelectedPurchase] = useState(null)
    const [showPremiumModal, setShowPremiumModal] = useState(false)

    // Track page view and initial state
    useEffect(() => {
        track.engagement.pageViewed('/purchases', 'account');
        
        // Track page load performance
        const startTime = performance.now();
        const handleLoad = () => {
            const loadTime = performance.now() - startTime;
            track.system.pageLoadTime('/purchases', loadTime);
        };
        
        if (document.readyState === 'complete') {
            handleLoad();
        } else {
            window.addEventListener('load', handleLoad);
            return () => window.removeEventListener('load', handleLoad);
        }
    }, [track]);

    // Ensure auth before loading purchases
    useEffect(() => {
        if (authLoading) return
        if (!isAuthenticated) {
            track.system.errorOccurred('purchases_unauthorized_access', 'User not authenticated', {
                redirect_to: '/signin',
                source: 'purchases_page'
            });
            router.push('/signin')
            return
        }
        loadPurchases()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, filter, authLoading, isAuthenticated])

    const loadPurchases = async () => {
        setLoading(true)
        
        const loadStartTime = performance.now();
        
        try {
            const options = {
                page,
                limit: 12
            }
            if (filter !== 'all') options.type = filter
            
            track.engagement.featureUsed('purchase_history_loaded', {
                page,
                filter,
                limit: options.limit,
                source: 'purchases_page'
            });
            
            const response = await purchaseAPI.getUserPurchases(options)
            const loadDuration = performance.now() - loadStartTime;
            
            setPurchases(response.purchases || [])
            setPagination(response.pagination)
            
            // Track successful purchases load
            track.system.apiCallMade('/api/purchases/user', 'GET', loadDuration, 200);
            
            track.engagement.featureUsed('purchase_history_loaded_success', {
                purchases_count: response.purchases?.length || 0,
                total_purchases: response.pagination?.totalItems || 0,
                page,
                filter,
                load_duration_ms: Math.round(loadDuration),
                source: 'purchases_page'
            });
            
        } catch (error) {
            const loadDuration = performance.now() - loadStartTime;
            const errorMessage = error?.message || 'Failed to load purchases';
            
            console.error('Error loading purchases:', error)
            
            track.system.errorOccurred('purchase_history_load_failed', errorMessage, {
                page,
                filter,
                api_duration: loadDuration,
                source: 'purchases_page'
            });
            
            track.system.apiCallMade('/api/purchases/user', 'GET', loadDuration, error.status || 500);
            
            showMessage('Failed to load purchases', 'error')
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const total = purchases.reduce((s, p) => s + (p.product?.price || 0), 0)
        const counts = purchases.reduce((acc, p) => {
            if (!p.product || !p.product.type) return acc
            acc[p.product.type] = (acc[p.product.type] || 0) + 1
            return acc
        }, {})
        return { totalSpent: total, counts }
    }, [purchases])

    const toggleSelect = (purchaseId) => {
        const copy = new Set(selected)
        if (copy.has(purchaseId)) copy.delete(purchaseId)
        else copy.add(purchaseId)
        setSelected(copy)
        
        track.engagement.featureUsed('purchase_item_selected', {
            purchase_id: purchaseId,
            action: copy.has(purchaseId) ? 'select' : 'unselect',
            total_selected: copy.size,
            source: 'purchases_page'
        });
    }

    const filteredPurchases = purchases
        .filter((purchase) => {
            const title = purchase.product?.title || ''
            const category = purchase.product?.category || ''
            return title.toLowerCase().includes(searchTerm.toLowerCase()) || category.toLowerCase().includes(searchTerm.toLowerCase())
        })
        .sort((a, b) => {
            if (sort === 'recent') return new Date(b.purchaseDate) - new Date(a.purchaseDate)
            if (sort === 'price-asc') return (a.product.price || 0) - (b.product.price || 0)
            if (sort === 'price-desc') return (b.product.price || 0) - (a.product.price || 0)
            return 0
        })

    const toggleSelectAll = () => {
        const displayed = filteredPurchases
        if (selected.size === displayed.length) {
            setSelected(new Set())
            track.engagement.featureUsed('purchase_select_all', {
                action: 'unselect_all',
                items_count: displayed.length,
                source: 'purchases_page'
            });
        } else {
            setSelected(new Set(displayed.map((p) => p.purchaseId)))
            track.engagement.featureUsed('purchase_select_all', {
                action: 'select_all',
                items_count: displayed.length,
                source: 'purchases_page'
            });
        }
    }

    // Track filter changes
    const handleFilterChange = (newFilter) => {
        track.engagement.featureUsed('purchase_filter_changed', {
            old_filter: filter,
            new_filter: newFilter,
            source: 'purchases_page'
        });
        
        setFilter(newFilter);
        setPage(1);
    };

    // Track search
    const handleSearchChange = (value) => {
        track.engagement.featureUsed('purchase_search', {
            search_query: value,
            query_length: value.length,
            has_results: filteredPurchases.length > 0,
            source: 'purchases_page'
        });
        
        setSearchTerm(value);
    };

    // Track sort changes
    const handleSortChange = (newSort) => {
        track.engagement.featureUsed('purchase_sort_changed', {
            old_sort: sort,
            new_sort: newSort,
            purchases_count: purchases.length,
            source: 'purchases_page'
        });
        
        setSort(newSort);
    };

    // Track view mode changes
    const handleViewModeChange = (mode) => {
        track.engagement.featureUsed('purchase_view_mode_changed', {
            old_mode: viewMode,
            new_mode: mode,
            purchases_count: purchases.length,
            source: 'purchases_page'
        });
        
        setViewMode(mode);
    };

    // Track premium modal interactions
    const handleShowPremiumModal = (purchase) => {
        track.engagement.featureUsed('purchase_premium_modal_opened', {
            product_id: purchase.product?._id,
            product_title: purchase.product?.title,
            product_type: purchase.product?.type,
            purchase_id: purchase.purchaseId,
            source: 'purchases_page'
        });
        
        setSelectedPurchase(purchase);
        setShowPremiumModal(true);
    };

    const handleClosePremiumModal = () => {
        track.engagement.featureUsed('purchase_premium_modal_closed', {
            product_id: selectedPurchase?.product?._id,
            product_title: selectedPurchase?.product?.title,
            time_spent_seconds: Math.round((Date.now() - modalOpenTime) / 1000),
            source: 'purchases_page'
        });
        
        setShowPremiumModal(false);
        setSelectedPurchase(null);
    };

    // Track modal open time
    const [modalOpenTime, setModalOpenTime] = useState(null);
    
    useEffect(() => {
        if (showPremiumModal) {
            setModalOpenTime(Date.now());
        }
    }, [showPremiumModal]);

    if (loading && purchases.length === 0) {
        return (
            <div className="min-h-screen bg-[#121212]">
                {notification && (
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                )}
                <Container>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <Loader2 className="w-8 h-8 animate-spin text-[#00FF89]" />
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            {/* Premium Content Modal */}
            {showPremiumModal && selectedPurchase && (
                <PremiumContentModal
                    purchase={selectedPurchase}
                    onClose={handleClosePremiumModal}
                    track={track}
                />
            )}

            <main className="pt-24 pb-16">
                <Container>
                    <div className="mb-8">
                        <div className="text-center mb-8">
                            <h1
                                className="text-4xl lg:text-5xl font-bold text-[#00FF89] mb-4"
                                style={{ fontFamily: 'var(--font-league-spartan)' }}>
                                My Purchases
                            </h1>
                            <p
                                className="text-gray-400 max-w-2xl mx-auto text-lg"
                                style={{ fontFamily: 'var(--font-kumbh-sans)' }}>
                                Access all your purchased products. Manage licenses, invoices and quickly revisit your favorite items.
                            </p>
                        </div>
                        <div className="mb-8">
                            <StatsBar
                                purchases={purchases}
                                stats={stats}
                                track={track}
                            />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-6">
                            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                                    <div className="relative w-full lg:w-80">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input
                                            type="text"
                                            placeholder="Search your purchases..."
                                            value={searchTerm}
                                            onChange={(e) => handleSearchChange(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-[#121212] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={filter}
                                            onChange={(e) => handleFilterChange(e.target.value)}
                                            className="bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]">
                                            <option value="all">All Products</option>
                                            <option value="prompt">Prompts</option>
                                            <option value="automation">Automations</option>
                                            <option value="agent">Agents</option>
                                            <option value="bundle">Bundles</option>
                                        </select>
                                        <select
                                            value={sort}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            className="bg-[#121212] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]">
                                            <option value="recent">Most Recent</option>
                                            <option value="price-desc">Price: High to Low</option>
                                            <option value="price-asc">Price: Low to High</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-[#121212] border border-gray-700 rounded-xl p-1">
                                        <button
                                            onClick={() => handleViewModeChange('grid')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:text-white'}`}>
                                            <GridIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleViewModeChange('list')}
                                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:text-white'}`}>
                                            <List className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={toggleSelectAll}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
                                        {selected.size === filteredPurchases.length ? 'Unselect All' : 'Select All'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        {loading ? (
                            <LoadingState />
                        ) : filteredPurchases.length === 0 ? (
                            <EmptyState filter={filter} track={track} />
                        ) : viewMode === 'list' ? (
                            <OrdersTable
                                purchases={filteredPurchases}
                                selected={selected}
                                onToggle={toggleSelect}
                                onViewPremium={handleShowPremiumModal}
                                track={track}
                            />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredPurchases.map((purchase) => (
                                    <PurchaseCard
                                        key={purchase.purchaseId}
                                        purchase={purchase}
                                        selected={selected.has(purchase.purchaseId)}
                                        onToggle={() => toggleSelect(purchase.purchaseId)}
                                        onViewPremium={() => handleShowPremiumModal(purchase)}
                                        track={track}
                                    />
                                ))}
                            </div>
                        )}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-8">
                                {Array.from({ length: pagination.totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => {
                                            track.engagement.featureUsed('purchase_pagination_clicked', {
                                                from_page: page,
                                                to_page: i + 1,
                                                total_pages: pagination.totalPages,
                                                source: 'purchases_page'
                                            });
                                            setPage(i + 1);
                                        }}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all ${
                                            page === i + 1
                                                ? 'bg-[#00FF89] text-[#121212]'
                                                : 'bg-[#1f1f1f] text-gray-300 hover:bg-gray-700 border border-gray-700'
                                        }`}>
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </Container>
            </main>
        </div>
    )
}

// Enhanced PurchaseCard with analytics
function PurchaseCard({ purchase, selected = false, onToggle, onViewPremium, track }) {
    const { product, purchaseDate } = purchase
    const router = useRouter()

    if (!product) {
        return (
            <motion.div className="bg-[#1f1f1f] border border-gray-800 rounded-2xl p-4">
                <div className="text-gray-400">Product data unavailable</div>
            </motion.div>
        )
    }

    const Icon = typeIcons[product.type] || Package
    const colorClass = typeColors[product.type] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'

    // Check if premium content is available
    const hasPremiumContent =
        product.premiumContent &&
        (product.premiumContent.promptText ||
            product.premiumContent.promptInstructions ||
            product.premiumContent.automationInstructions ||
            product.premiumContent.agentConfiguration ||
            (product.premiumContent.detailedHowItWorks && product.premiumContent.detailedHowItWorks.length > 0) ||
            (product.premiumContent.automationFiles && product.premiumContent.automationFiles.length > 0) ||
            (product.premiumContent.agentFiles && product.premiumContent.agentFiles.length > 0))

    const handleAccessProduct = () => {
        // Track product access
        track.engagement.featureUsed('purchase_product_accessed', {
            product_id: product._id,
            product_title: product.title,
            product_type: product.type,
            product_price: product.price,
            purchase_id: purchase.purchaseId,
            has_premium_content: hasPremiumContent,
            source: 'purchases_card'
        });
        
        // Store purchase data in sessionStorage to pass to the next page
        sessionStorage.setItem('currentPurchase', JSON.stringify(purchase))
        router.push(`/purchased/${product.slug || product._id}`)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-[#1f1f1f] border border-gray-800 rounded-2xl overflow-hidden hover:border-[#00FF89]/50 transition-all duration-300 group">
            {/* ...existing card content... */}
            <div className="p-6">
                {/* ...existing card header and content... */}
                
                <div className="flex gap-3">
                    {hasPremiumContent ? (
                        <button
                            onClick={handleAccessProduct}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-[#00FF89] to-green-500 hover:from-[#00FF89]/90 hover:to-green-500/90 text-[#121212] font-semibold rounded-xl transition-all text-center flex items-center justify-center gap-2">
                            <Crown className="w-4 h-4" />
                            Access Premium
                        </button>
                    ) : (
                        <button
                            onClick={handleAccessProduct}
                            className="flex-1 px-4 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-semibold rounded-xl transition-all text-center">
                            Access Product
                        </button>
                    )}
                    <button
                        onClick={handleAccessProduct}
                        className="flex items-center justify-center px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-all">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

// Enhanced StatsBar with analytics
function StatsBar({ purchases = [], stats = { totalSpent: 0, counts: {} }, track }) {
    // Track stats interaction
    const handleStatsClick = (statType, value) => {
        track.engagement.featureUsed('purchase_stats_clicked', {
            stat_type: statType,
            stat_value: value,
            source: 'purchases_stats_bar'
        });
    };

    // ...existing stats calculation and rendering...
}

// Enhanced EmptyState with analytics
function EmptyState({ filter, track }) {
    const handleExploreClick = () => {
        track.engagement.headerLinkClicked('explore_from_empty_purchases', '/explore');
        
        track.engagement.featureUsed('empty_purchases_explore_clicked', {
            current_filter: filter,
            source: 'purchases_empty_state'
        });
    };

    const handleMarketplaceClick = () => {
        track.engagement.headerLinkClicked('marketplace_from_empty_purchases', '/');
        
        track.engagement.featureUsed('empty_purchases_marketplace_clicked', {
            current_filter: filter,
            source: 'purchases_empty_state'
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16">
            {/* ...existing empty state content... */}
            <div className="flex items-center justify-center gap-4">
                <Link
                    href="/explore"
                    onClick={handleExploreClick}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] font-bold rounded-xl transition-all"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Explore Products
                </Link>
                <Link
                    href="/"
                    onClick={handleMarketplaceClick}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#1f1f1f] hover:bg-gray-700 text-white border border-gray-700 rounded-xl transition-all"
                    style={{ fontFamily: 'var(--font-league-spartan)' }}>
                    Marketplace
                </Link>
            </div>
        </motion.div>
    )
}

// Enhanced PremiumContentModal with analytics
function PremiumContentModal({ purchase, onClose, track }) {
    const [copiedItem, setCopiedItem] = useState(null)
    const [activeTab, setActiveTab] = useState('prompt')

    const copyToClipboard = async (text, item) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedItem(item)
            setTimeout(() => setCopiedItem(null), 2000)
            
            // Track copy action
            track.engagement.featureUsed('premium_content_copied', {
                content_type: item,
                content_length: text.length,
                product_id: purchase.product?._id,
                product_title: purchase.product?.title,
                source: 'premium_modal'
            });
            
        } catch (err) {
            console.error('Failed to copy:', err)
            
            track.system.errorOccurred('premium_content_copy_failed', err.message, {
                content_type: item,
                product_id: purchase.product?._id
            });
        }
    }

    // Track tab changes
    const handleTabChange = (tabId) => {
        track.engagement.featureUsed('premium_modal_tab_changed', {
            old_tab: activeTab,
            new_tab: tabId,
            product_id: purchase.product?._id,
            source: 'premium_modal'
        });
        
        setActiveTab(tabId);
    };

    const premiumContent = purchase.product?.premiumContent || {}
    const availableTabs = []

    if (premiumContent.promptText) availableTabs.push({ id: 'prompt', label: 'Prompt Template', icon: FileText })
    if (premiumContent.promptInstructions) availableTabs.push({ id: 'instructions', label: 'Instructions', icon: FileText })
    if (premiumContent.automationInstructions) availableTabs.push({ id: 'automation', label: 'Automation', icon: Zap })
    if (premiumContent.agentConfiguration) availableTabs.push({ id: 'agent', label: 'Agent Config', icon: Bot })
    if (premiumContent.detailedHowItWorks?.length > 0) availableTabs.push({ id: 'howto', label: 'How to Use', icon: FileText })

    if (availableTabs.length > 0 && !availableTabs.find((tab) => tab.id === activeTab)) {
        setActiveTab(availableTabs[0].id)
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                            <Crown className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{purchase.product?.title}</h2>
                            <p className="text-sm text-gray-400">Premium Content Access</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                {availableTabs.length > 0 && (
                    <div className="flex border-b border-gray-800 overflow-x-auto">
                        {availableTabs.map((tab) => {
                            const IconComponent = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                                        activeTab === tab.id
                                            ? 'text-[#00FF89] border-[#00FF89] bg-[#00FF89]/5'
                                            : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
                                    }`}>
                                    <IconComponent className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Content sections with copy tracking... */}
                
                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-800">
                    <div className="text-sm text-gray-400">Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}</div>
                    <Link
                        href={`/purchased/${purchase.product?.slug || purchase.product?._id}`}
                        onClick={() => {
                            track.engagement.headerLinkClicked('view_full_product_from_modal', `/purchased/${purchase.product?.slug || purchase.product?._id}`);
                        }}
                        className="px-4 py-2 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg font-medium transition-all">
                        View Full Product
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

// ...existing components with minimal changes...

