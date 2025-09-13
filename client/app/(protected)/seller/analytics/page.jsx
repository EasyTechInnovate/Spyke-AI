'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Clock, RefreshCw, Download, Calendar, BarChart3, Package, ShoppingCart, DollarSign, Users } from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
import CustomSelect from '@/components/shared/CustomSelect'
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/admin'
import { motion, AnimatePresence } from 'framer-motion'
import { TIME_RANGE_OPTIONS } from '@/lib/constants/analytics'

import { OverviewTab, ProductsTab, SalesTab, RevenueTab, CustomersTab } from '@/components/features/seller/analytics/tabs'

const SELLER_TAB_OPTIONS = [
    { value: 'overview', label: 'Overview', icon: 'BarChart3' },
    { value: 'products', label: 'Products', icon: 'Package' },
    { value: 'sales', label: 'Sales', icon: 'ShoppingCart' },
    { value: 'revenue', label: 'Revenue', icon: 'DollarSign' },
    { value: 'customers', label: 'Customers', icon: 'Users' }
]

const getIconComponent = (iconName) => {
    const iconMap = {
        Clock: Clock,
        Calendar: Calendar,
        BarChart3: BarChart3,
        Package: Package,
        ShoppingCart: ShoppingCart,
        DollarSign: DollarSign,
        Users: Users
    }
    return iconMap[iconName] || Clock
}

const MINIMUM_LOADING_DURATION = 1500 // 1.5 seconds minimum loading time

export default function SellerAnalytics() {
    const [tabCache, setTabCache] = useState({})
    const [loading, setLoading] = useState({
        overview: false,
        products: false,
        sales: false,
        revenue: false,
        customers: false
    })
    const [errors, setErrors] = useState({})
    const [timeRange, setTimeRange] = useState('30d')
    const [activeTab, setActiveTab] = useState('overview')
    
    // Timer refs to track loading start times
    const loadingTimers = useRef({})

    const getCacheKey = useCallback((tab, range) => `${tab}_${range}`, [])

    const currentTabData = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return tabCache[cacheKey] || null
    }, [activeTab, timeRange, tabCache, getCacheKey])

    const getTabAPI = useCallback((tab) => {
        switch (tab) {
            case 'overview':
                return () => analyticsAPI.seller.getDashboard()
            case 'products':
                return () => analyticsAPI.seller.getProducts()
            case 'sales':
                return () => analyticsAPI.seller.getSales({ period: timeRange })
            case 'revenue':
                return () => analyticsAPI.seller.getRevenue()
            case 'customers':
                return () => analyticsAPI.seller.getCustomers()
            default:
                return () => analyticsAPI.seller.getDashboard()
        }
    }, [timeRange])

    const fetchTabData = useCallback(async (tab) => {
        const cacheKey = getCacheKey(tab, timeRange)
        
        if (loading[tab] || tabCache[cacheKey]) {
            return
        }

        try {
            const startTime = Date.now()
            loadingTimers.current[tab] = startTime
            
            setLoading(prev => ({ ...prev, [tab]: true }))
            setErrors(prev => ({ ...prev, [tab]: null }))

            const apiCall = getTabAPI(tab)
            const data = await apiCall()

            // Calculate how long to wait to meet minimum loading duration
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, MINIMUM_LOADING_DURATION - elapsedTime)

            // Wait for remaining time if needed
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime))
            }

            setTabCache(prev => ({ ...prev, [cacheKey]: data }))
        } catch (err) {
            // Ensure minimum loading time even for errors
            const startTime = loadingTimers.current[tab]
            if (startTime) {
                const elapsedTime = Date.now() - startTime
                const remainingTime = Math.max(0, MINIMUM_LOADING_DURATION - elapsedTime)
                
                if (remainingTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, remainingTime))
                }
            }

            console.error(`Error fetching ${tab} analytics data:`, err)
            setErrors(prev => ({ 
                ...prev, 
                [tab]: `Failed to load ${tab} data: ${err.message}` 
            }))
        } finally {
            setLoading(prev => ({ ...prev, [tab]: false }))
            // Clean up timer reference
            if (loadingTimers.current[tab]) {
                delete loadingTimers.current[tab]
            }
        }
    }, [timeRange, loading, tabCache, getCacheKey, getTabAPI])

    useEffect(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        if (!tabCache[cacheKey] && !loading[activeTab]) {
            fetchTabData(activeTab)
        }
    }, [activeTab, timeRange, tabCache, loading, fetchTabData, getCacheKey])

    useEffect(() => {
        setLoading({
            overview: false,
            products: false,
            sales: false,
            revenue: false,
            customers: false
        })
        setErrors({})
    }, [timeRange])

    const refreshCurrentTab = useCallback(async () => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        
        setTabCache(prev => {
            const newCache = { ...prev }
            delete newCache[cacheKey]
            return newCache
        })
        
        await fetchTabData(activeTab)
    }, [activeTab, timeRange, fetchTabData, getCacheKey])

    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab)
    }, [])

    const handleExport = useCallback(() => {
        if (!currentTabData) return

        const exportData = {
            tab: activeTab,
            timeRange,
            data: currentTabData,
            exportedAt: new Date().toISOString()
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `seller-analytics-${activeTab}-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }, [activeTab, timeRange, currentTabData])

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
                        onClick={() => fetchTabData(activeTab)}
                        className="mt-4 px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors">
                        Retry
                    </button>
                </div>
            )
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <OverviewTab
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
            case 'sales':
                return (
                    <SalesTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            case 'revenue':
                return (
                    <RevenueTab
                        analyticsData={currentTabData}
                        timeRange={timeRange}
                        loading={isLoading}
                    />
                )
            case 'customers':
                return (
                    <CustomersTab
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
                title="Seller Analytics"
                subtitle="Comprehensive insights into your seller performance"
                icon={BarChart3}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

                <div className="mb-8">
                    <div className="border-b border-gray-800">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {SELLER_TAB_OPTIONS.map((tab) => {
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
                                        
                                        {isTabLoading && (
                                            <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse" />
                                        )}
                                        
                                        {hasData && !isTabLoading && !isCurrentTab && (
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                        )}
                                    </button>
                                )
                            })}
                        </nav>
                    </div>
                </div>

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