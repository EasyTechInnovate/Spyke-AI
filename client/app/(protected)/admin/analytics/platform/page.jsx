'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Clock, RefreshCw, Download, Calendar, BarChart3, Users, ShoppingCart, Package, Activity } from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
import CustomSelect from '@/components/shared/CustomSelect'
import { useAdmin } from '@/providers/AdminProvider'
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/admin'
import { motion, AnimatePresence } from 'framer-motion'
import { TIME_RANGE_OPTIONS, ADMIN_TAB_OPTIONS } from '@/lib/constants/analytics'

import { OverviewTab, UsersTab, SalesTab, ProductsTab } from '@/components/features/admin/analytics/tabs'

const getIconComponent = (iconName) => {
    const iconMap = {
        Clock: Clock,
        Calendar: Calendar,
        BarChart3: BarChart3,
        Users: Users,
        ShoppingCart: ShoppingCart,
        Package: Package,
        Activity: Activity
    }
    return iconMap[iconName] || Clock
}

export default function AdminAnalyticsPlatform() {
    const { user } = useAdmin()
    
    // Store data for each tab with time range as cache key
    const [tabCache, setTabCache] = useState({})
    const [loading, setLoading] = useState({
        overview: false,
        users: false,
        sales: false,
        products: false,
        performance: false
    })
    const [errors, setErrors] = useState({})
    const [timeRange, setTimeRange] = useState('30d')
    const [activeTab, setActiveTab] = useState('overview')

    // Generate cache key for memoization
    const getCacheKey = useCallback((tab, range) => `${tab}_${range}`, [])

    // Get cached data for current tab and time range
    const currentTabData = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return tabCache[cacheKey] || null
    }, [activeTab, timeRange, tabCache, getCacheKey])

    const getTabAPI = useCallback((tab) => {
        switch (tab) {
            case 'overview':
                return () => analyticsAPI.admin.getPlatform()
            case 'users':
                return () => analyticsAPI.admin.getUsers()
            case 'sales':
                return () => analyticsAPI.admin.getSales({ period: timeRange })
            case 'products':
                return () => analyticsAPI.admin.getProducts()
            case 'performance':
                // For performance tab, combine data from multiple sources efficiently
                return async () => {
                    // Check if we already have all the data cached
                    const platformKey = getCacheKey('overview', timeRange)
                    const usersKey = getCacheKey('users', timeRange)
                    const salesKey = getCacheKey('sales', timeRange)
                    const productsKey = getCacheKey('products', timeRange)

                    const cachedPlatform = tabCache[platformKey]
                    const cachedUsers = tabCache[usersKey]
                    const cachedSales = tabCache[salesKey]
                    const cachedProducts = tabCache[productsKey]

                    // If we have all cached data, use it
                    if (cachedPlatform && cachedUsers && cachedSales && cachedProducts) {
                        return {
                            platform: cachedPlatform,
                            users: cachedUsers,
                            sales: cachedSales,
                            products: cachedProducts
                        }
                    }

                    // Otherwise, fetch only the missing data
                    const promises = []
                    const dataKeys = []

                    if (!cachedPlatform) {
                        promises.push(analyticsAPI.admin.getPlatform())
                        dataKeys.push('platform')
                    }
                    if (!cachedUsers) {
                        promises.push(analyticsAPI.admin.getUsers())
                        dataKeys.push('users')
                    }
                    if (!cachedSales) {
                        promises.push(analyticsAPI.admin.getSales({ period: timeRange }))
                        dataKeys.push('sales')
                    }
                    if (!cachedProducts) {
                        promises.push(analyticsAPI.admin.getProducts())
                        dataKeys.push('products')
                    }

                    const results = await Promise.all(promises)
                    
                    // Combine cached and new data
                    const combinedData = {
                        platform: cachedPlatform,
                        users: cachedUsers,
                        sales: cachedSales,
                        products: cachedProducts
                    }

                    // Update with new data
                    results.forEach((result, index) => {
                        const key = dataKeys[index]
                        combinedData[key] = result
                        
                        // Cache the individual results for future use
                        const cacheKey = getCacheKey(key === 'platform' ? 'overview' : key, timeRange)
                        setTabCache(prev => ({ ...prev, [cacheKey]: result }))
                    })

                    return combinedData
                }
            default:
                return () => analyticsAPI.admin.getPlatform()
        }
    }, [timeRange, tabCache, getCacheKey])

    // Fetch data for specific tab
    const fetchTabData = useCallback(async (tab) => {
        const cacheKey = getCacheKey(tab, timeRange)
        
        // Skip if already loading or if we have cached data
        if (loading[tab] || tabCache[cacheKey]) {
            return
        }

        try {
            setLoading(prev => ({ ...prev, [tab]: true }))
            setErrors(prev => ({ ...prev, [tab]: null }))

            const apiCall = getTabAPI(tab)
            const data = await apiCall()

            // Cache the data
            setTabCache(prev => ({ ...prev, [cacheKey]: data }))
        } catch (err) {
            console.error(`Error fetching ${tab} analytics data:`, err)
            setErrors(prev => ({ 
                ...prev, 
                [tab]: `Failed to load ${tab} data: ${err.message}` 
            }))
        } finally {
            setLoading(prev => ({ ...prev, [tab]: false }))
        }
    }, [timeRange, loading, tabCache, getCacheKey, getTabAPI])

    // Fetch data when active tab changes or when we don't have cached data
    useEffect(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        if (!tabCache[cacheKey] && !loading[activeTab]) {
            fetchTabData(activeTab)
        }
    }, [activeTab, timeRange, tabCache, loading, fetchTabData, getCacheKey])

    // Clear cache when time range changes
    useEffect(() => {
        // Clear loading states
        setLoading({
            overview: false,
            users: false,
            sales: false,
            products: false,
            performance: false
        })
        setErrors({})
    }, [timeRange])

    // Refresh current tab data (force refresh)
    const refreshCurrentTab = useCallback(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        
        // Clear the cached data for current tab
        setTabCache(prev => {
            const newCache = { ...prev }
            delete newCache[cacheKey]
            return newCache
        })
        
        // Fetch fresh data
        fetchTabData(activeTab)
    }, [activeTab, timeRange, fetchTabData, getCacheKey])

    // Handle tab change
    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab)
    }, [])

    // Export functionality for current tab
    const handleExport = useCallback(() => {
        if (!currentTabData) return

        // Create export data
        const exportData = {
            tab: activeTab,
            timeRange,
            data: currentTabData,
            exportedAt: new Date().toISOString()
        }

        // Download as JSON (you can modify this to export as CSV/Excel)
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

    const renderTabContent = () => {
        const isLoading = loading[activeTab]
        const error = errors[activeTab]

        // Show loading state for current tab
        if (isLoading && !currentTabData) {
            return <LoadingSkeleton />
        }

        // Show error state for current tab
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <ErrorState message={error} />
                    <button
                        onClick={() => fetchTabData(activeTab)}
                        className="mt-4 px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors">
                        Retry
                    </button>
                </div>
            )
        }

        // Render tab content with data
        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            case 'users':
                return (
                    <UsersTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            case 'sales':
                return (
                    <SalesTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            case 'products':
                return (
                    <ProductsTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            default:
                return (
                    <OverviewTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <PageHeader
                title="Admin Analytics"
                subtitle="Comprehensive insights into your admin performance"
                icon={BarChart3}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Controls */}
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

                {/* Tabs */}
                <div className="mb-8">
                    <div className="border-b border-gray-800">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {ADMIN_TAB_OPTIONS.map((tab) => {
                                const IconComponent = getIconComponent(tab.icon)
                                const isCurrentTab = activeTab === tab.value
                                const cacheKey = getCacheKey(tab.value, timeRange)
                                const hasData = !!tabCache[cacheKey]
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
                                        
                                        {/* Loading indicator for tab */}
                                        {isTabLoading && (
                                            <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse" />
                                        )}
                                        
                                        {/* Data indicator - small dot if tab has data */}
                                        {hasData && !isTabLoading && !isCurrentTab && (
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                        )}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}>
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

