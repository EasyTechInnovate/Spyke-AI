'use client'

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { Clock, RefreshCw, Download, Calendar, BarChart3, Users, ShoppingCart, Package, Activity, DollarSign } from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
import CustomSelect from '@/components/shared/CustomSelect'
import { useAdmin } from '@/providers/AdminProvider'
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/admin'
import { motion, AnimatePresence } from 'framer-motion'
import { TIME_RANGE_OPTIONS, ADMIN_TAB_OPTIONS } from '@/lib/constants/analytics'

// Lazy load tabs for better performance - only load when needed
const OverviewTab = lazy(() => import('@/components/features/admin/analytics/tabs/OverviewTab').then(module => ({ default: module.OverviewTab })))
const UsersTab = lazy(() => import('@/components/features/admin/analytics/tabs/UsersTab').then(module => ({ default: module.UsersTab })))
const SalesTab = lazy(() => import('@/components/features/admin/analytics/tabs/SalesTab').then(module => ({ default: module.SalesTab })))
const ProductsTab = lazy(() => import('@/components/features/admin/analytics/tabs/ProductsTab').then(module => ({ default: module.ProductsTab })))
const PayoutsTab = lazy(() => import('@/components/features/admin/analytics/tabs/PayoutsTab'))
const SellersTab = lazy(() => import('@/components/features/admin/analytics/tabs/SellersTab'))
const PromocodesTab = lazy(() => import('@/components/features/admin/analytics/tabs/PromocodesTab').then(module => ({ default: module.PromocodesTab })))
const RevenueTab = lazy(() => import('@/components/features/admin/analytics/tabs/RevenueTab').then(module => ({ default: module.RevenueTab })))
const UserTrendsTab = lazy(() => import('@/components/features/admin/analytics/tabs/UserTrendsTab').then(module => ({ default: module.UserTrendsTab })))
const SellerTrendsTab = lazy(() => import('@/components/features/admin/analytics/tabs/SellerTrendsTab').then(module => ({ default: module.SellerTrendsTab })))
const FeedbackTab = lazy(() => import('@/components/features/admin/analytics/tabs/FeedbackTab').then(module => ({ default: module.FeedbackTab })))
const TrafficTab = lazy(() => import('@/components/features/admin/analytics/tabs/TrafficTab').then(module => ({ default: module.TrafficTab })))

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 50 // Maximum number of cached entries

// Optimized icon mapping with lazy evaluation
const getIconComponent = (iconName) => {
    const iconMap = {
        Clock: Clock,
        Calendar: Calendar,
        BarChart3: BarChart3,
        Users: Users,
        ShoppingCart: ShoppingCart,
        Package: Package,
        Activity: Activity,
        DollarSign: DollarSign
    }
    return iconMap[iconName] || Clock
}

// Enhanced cache management with TTL and size limits
class AnalyticsCache {
    constructor() {
        this.cache = new Map()
        this.timestamps = new Map()
    }

    set(key, value) {
        // Remove oldest entries if cache is full
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value
            this.cache.delete(oldestKey)
            this.timestamps.delete(oldestKey)
        }

        this.cache.set(key, value)
        this.timestamps.set(key, Date.now())
    }

    get(key) {
        const timestamp = this.timestamps.get(key)
        if (!timestamp || Date.now() - timestamp > CACHE_DURATION) {
            this.cache.delete(key)
            this.timestamps.delete(key)
            return null
        }
        return this.cache.get(key)
    }

    clear() {
        this.cache.clear()
        this.timestamps.clear()
    }

    delete(key) {
        this.cache.delete(key)
        this.timestamps.delete(key)
    }
}

export default function AdminAnalyticsPlatform() {
    const { user } = useAdmin()

    // Enhanced cache with TTL management
    const [analyticsCache] = useState(() => new AnalyticsCache())
    const [tabCache, setTabCache] = useState({})
    const [loading, setLoading] = useState({})
    const [errors, setErrors] = useState({})
    const [timeRange, setTimeRange] = useState('30d')
    const [activeTab, setActiveTab] = useState('overview')
    const [prefetchedTabs, setPrefetchedTabs] = useState(new Set())

    // Generate cache key for memoization
    const getCacheKey = useCallback((tab, range) => `${tab}_${range}`, [])

    // Get cached data with TTL check
    const currentTabData = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return analyticsCache.get(cacheKey) || tabCache[cacheKey] || null
    }, [activeTab, timeRange, tabCache, getCacheKey, analyticsCache])

    // Optimized API call batching
    const batchApiCalls = useCallback(async (calls) => {
        try {
            const results = await Promise.allSettled(calls)
            return results.map((result) => (result.status === 'fulfilled' ? result.value : null))
        } catch (error) {
            console.error('Batch API calls failed:', error)
            return calls.map(() => null)
        }
    }, [])

    // Enhanced API mapping with smart data fetching
    const getTabAPI = useCallback(
        (tab) => {
            const apiMap = {
                overview: () => analyticsAPI.admin.getPlatform(),
                users: () => analyticsAPI.admin.getUsers(),
                sales: () => analyticsAPI.admin.getSales({ period: timeRange }),
                products: () => analyticsAPI.admin.getProducts(),
                payouts: () => analyticsAPI.admin.getPayouts({ period: timeRange }),
                sellers: () => analyticsAPI.admin.getSellers(),
                promocodes: () => analyticsAPI.admin.getPromocodes(),
                revenue: () => analyticsAPI.admin.getRevenue(),
                'user-trends': () => analyticsAPI.admin.getUserTrends(timeRange),
                'seller-trends': () => analyticsAPI.admin.getSellerTrends(timeRange),
                feedback: () => analyticsAPI.admin.getFeedback(),
                traffic: () => analyticsAPI.admin.getTraffic(timeRange),
                performance: async () => {
                    // Optimized performance tab with smart caching
                    const keys = ['overview', 'users', 'sales', 'products']
                    const cachedData = {}
                    const missingKeys = []

                    keys.forEach((key) => {
                        const cacheKey = getCacheKey(key === 'overview' ? 'overview' : key, timeRange)
                        const cached = analyticsCache.get(cacheKey)
                        if (cached) {
                            cachedData[key] = cached
                        } else {
                            missingKeys.push(key)
                        }
                    })

                    if (missingKeys.length === 0) {
                        return cachedData
                    }

                    // Batch fetch missing data
                    const apiCalls = missingKeys.map((key) => {
                        switch (key) {
                            case 'overview':
                                return analyticsAPI.admin.getPlatform()
                            case 'users':
                                return analyticsAPI.admin.getUsers()
                            case 'sales':
                                return analyticsAPI.admin.getSales({ period: timeRange })
                            case 'products':
                                return analyticsAPI.admin.getProducts()
                            default:
                                return analyticsAPI.admin.getPlatform()
                        }
                    })

                    const results = await batchApiCalls(apiCalls)

                    // Cache new results
                    results.forEach((result, index) => {
                        if (result) {
                            const key = missingKeys[index]
                            const cacheKey = getCacheKey(key === 'overview' ? 'overview' : key, timeRange)
                            analyticsCache.set(cacheKey, result)
                            cachedData[key] = result
                        }
                    })

                    return cachedData
                }
            }

            return apiMap[tab] || apiMap['overview']
        },
        [timeRange, analyticsCache, getCacheKey, batchApiCalls]
    )

    // Optimized fetch with deduplication
    const fetchTabData = useCallback(
        async (tab, force = false) => {
            const cacheKey = getCacheKey(tab, timeRange)

            // Skip if already loading or have fresh cached data
            if (!force && (loading[tab] || analyticsCache.get(cacheKey))) {
                return
            }

            try {
                setLoading((prev) => ({ ...prev, [tab]: true }))
                setErrors((prev) => ({ ...prev, [tab]: null }))

                const apiCall = getTabAPI(tab)
                const data = await apiCall()

                // Cache the data with TTL
                analyticsCache.set(cacheKey, data)
                setTabCache((prev) => ({ ...prev, [cacheKey]: data }))
            } catch (err) {
                console.error(`Error fetching ${tab} analytics data:`, err)
                setErrors((prev) => ({
                    ...prev,
                    [tab]: `Failed to load ${tab} data: ${err.message}`
                }))
            } finally {
                setLoading((prev) => ({ ...prev, [tab]: false }))
            }
        },
        [timeRange, loading, analyticsCache, getCacheKey, getTabAPI]
    )

    // Smart prefetching for likely next tabs
    const prefetchNearbyTabs = useCallback(
        async (currentTab) => {
            const tabOrder = ['overview', 'users', 'sales', 'products', 'sellers']
            const currentIndex = tabOrder.indexOf(currentTab)

            if (currentIndex === -1) return

            // Prefetch next 2 tabs
            const nextTabs = tabOrder.slice(currentIndex + 1, currentIndex + 3)

            for (const tab of nextTabs) {
                if (!prefetchedTabs.has(tab)) {
                    const cacheKey = getCacheKey(tab, timeRange)
                    if (!analyticsCache.get(cacheKey)) {
                        // Prefetch in background with lower priority
                        setTimeout(() => {
                            fetchTabData(tab)
                            setPrefetchedTabs((prev) => new Set([...prev, tab]))
                        }, 1000)
                    }
                }
            }
        },
        [timeRange, prefetchedTabs, getCacheKey, analyticsCache, fetchTabData]
    )

    // Main data fetching effect
    useEffect(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        if (!analyticsCache.get(cacheKey) && !loading[activeTab]) {
            fetchTabData(activeTab)
        }

        // Start prefetching after current tab loads
        if (!loading[activeTab]) {
            prefetchNearbyTabs(activeTab)
        }
    }, [activeTab, timeRange, loading, fetchTabData, prefetchNearbyTabs, getCacheKey, analyticsCache])

    // Clear cache and reset state when time range changes
    useEffect(() => {
        analyticsCache.clear()
        setTabCache({})
        setLoading({})
        setErrors({})
        setPrefetchedTabs(new Set())
    }, [timeRange, analyticsCache])

    // Enhanced refresh with cache invalidation
    const refreshCurrentTab = useCallback(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        analyticsCache.delete(cacheKey)
        setTabCache((prev) => {
            const newCache = { ...prev }
            delete newCache[cacheKey]
            return newCache
        })
        fetchTabData(activeTab, true)
    }, [activeTab, timeRange, fetchTabData, getCacheKey, analyticsCache])

    // Optimized tab change with preloading
    const handleTabChange = useCallback(
        (newTab) => {
            setActiveTab(newTab)

            // Immediately start loading if not cached
            const cacheKey = getCacheKey(newTab, timeRange)
            if (!analyticsCache.get(cacheKey) && !loading[newTab]) {
                fetchTabData(newTab)
            }
        },
        [timeRange, fetchTabData, getCacheKey, analyticsCache, loading]
    )

    // Enhanced export with data compression
    const handleExport = useCallback(() => {
        if (!currentTabData) return

        const exportData = {
            tab: activeTab,
            timeRange,
            data: currentTabData,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${activeTab}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [activeTab, timeRange, currentTabData])

    // Optimized tab content rendering with Suspense
    const renderTabContent = () => {
        const isLoading = loading[activeTab]
        const error = errors[activeTab]

        if (isLoading && !currentTabData) {
            return <LoadingSkeleton />
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <ErrorState message={error} />
                    <button
                        onClick={() => fetchTabData(activeTab, true)}
                        className="mt-4 px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors">
                        Retry
                    </button>
                </div>
            )
        }

        const TabComponent =
            {
                overview: OverviewTab,
                users: UsersTab,
                sales: SalesTab,
                products: ProductsTab,
                payouts: PayoutsTab,
                sellers: SellersTab,
                promocodes: PromocodesTab,
                revenue: RevenueTab,
                'user-trends': UserTrendsTab,
                'seller-trends': SellerTrendsTab,
                feedback: FeedbackTab,
                traffic: TrafficTab
            }[activeTab] || OverviewTab

        return (
            <Suspense fallback={<LoadingSkeleton />}>
                
                <TabComponent
                    analyticsData={currentTabData}
                    timeRange={timeRange}
                    loading={isLoading}
                />
            </Suspense>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <PageHeader
                title="Admin Analytics"
                subtitle="Comprehensive insights into your platform performance"
                icon={BarChart3}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Optimized Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <CustomSelect
                            value={timeRange}
                            onChange={setTimeRange}
                            options={TIME_RANGE_OPTIONS}
                            label="Time Range"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={refreshCurrentTab}
                            disabled={loading[activeTab]}>
                            <RefreshCw className={`w-4 h-4 ${loading[activeTab] ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleExport}
                            disabled={!currentTabData || loading[activeTab]}>
                            <Download className="w-4 h-4" />
                            Export
                        </button>
                    </div>
                </div>

                {/* Optimized Tabs with Smart Indicators */}
                <div className="mb-8">
                    <div className="border-b border-gray-800">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {ADMIN_TAB_OPTIONS.map((tab) => {
                                const IconComponent = getIconComponent(tab.icon)
                                const isCurrentTab = activeTab === tab.value
                                const cacheKey = getCacheKey(tab.value, timeRange)
                                const hasData = !!analyticsCache.get(cacheKey)
                                const isTabLoading = loading[tab.value]

                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleTabChange(tab.value)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 relative ${
                                            isCurrentTab
                                                ? 'border-[#00FF89] text-[#00FF89]'
                                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                        }`}>
                                        <IconComponent className="w-4 h-4" />
                                        {tab.label}

                                        {/* Enhanced loading indicator */}
                                        {isTabLoading && <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse" />}

                                        {/* Smart data indicator */}
                                        {hasData && !isTabLoading && !isCurrentTab && <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Optimized Tab Content with Reduced Animation */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}>
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

