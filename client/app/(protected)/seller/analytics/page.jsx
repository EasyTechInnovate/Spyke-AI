'use client'
import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Clock, RefreshCw, Download, Calendar, BarChart3, Package, ShoppingCart, DollarSign, Users, Wrench } from 'lucide-react'
import analyticsAPI from '@/lib/api/analytics'
import CustomSelect from '@/components/shared/CustomSelect'
import { PageHeader, LoadingSkeleton, ErrorState } from '@/components/admin'
import { motion, AnimatePresence } from 'framer-motion'
import { TIME_RANGE_OPTIONS } from '@/lib/constants/analytics'
import { OverviewTab, ProductsTab, SalesTab, RevenueTab, CustomersTab, ToolsTab } from '@/components/features/seller/analytics/tabs'

const SELLER_TAB_OPTIONS = [
    { value: 'overview', label: 'Overview', icon: 'BarChart3' },
    { value: 'products', label: 'Products', icon: 'Package' },
    { value: 'sales', label: 'Sales', icon: 'ShoppingCart' },
    { value: 'revenue', label: 'Revenue', icon: 'DollarSign' },
    { value: 'customers', label: 'Customers', icon: 'Users' },
    { value: 'tools', label: 'Tools', icon: 'Wrench' }
]

const getIconComponent = (iconName) => {
    const iconMap = {
        Clock: Clock,
        Calendar: Calendar,
        BarChart3: BarChart3,
        Package: Package,
        ShoppingCart: ShoppingCart,
        DollarSign: DollarSign,
        Users: Users,
        Wrench: Wrench
    }
    return iconMap[iconName] || Clock
}
const MINIMUM_LOADING_DURATION = 800 
export default function SellerAnalytics() {
    const [dataCache, setDataCache] = useState({})
    const [loadingStates, setLoadingStates] = useState({})
    const [errorStates, setErrorStates] = useState({})
    const [timeRange, setTimeRange] = useState('30d')
    const [activeTab, setActiveTab] = useState('overview')
    const pendingRequests = useRef(new Set())
    const abortControllers = useRef({})
    const getCacheKey = useCallback((tab, range) => `${tab}:${range}`, [])
    const currentTabData = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return dataCache[cacheKey]?.data || null
    }, [activeTab, timeRange, dataCache, getCacheKey])
    const isCurrentTabLoading = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return loadingStates[cacheKey] || false
    }, [activeTab, timeRange, loadingStates, getCacheKey])
    const currentTabError = useMemo(() => {
        const cacheKey = getCacheKey(activeTab, timeRange)
        return errorStates[cacheKey] || null
    }, [activeTab, timeRange, errorStates, getCacheKey])
    const getTabAPI = useCallback((tab, range) => {
        const apiParams = range !== '30d' ? { period: range } : {}
        switch (tab) {
            case 'overview':
                return () => analyticsAPI.seller.getDashboard()
            case 'products':
                return () => analyticsAPI.seller.getProducts(apiParams)
            case 'sales':
                return () => analyticsAPI.seller.getSales(apiParams)
            case 'revenue':
                return () => analyticsAPI.seller.getRevenue(apiParams)
            case 'customers':
                return () => analyticsAPI.seller.getCustomers(apiParams)
            case 'tools':
                return () => analyticsAPI.seller.getTools(apiParams)
            default:
                return () => analyticsAPI.seller.getDashboard()
        }
    }, [])
    const fetchTabData = useCallback(async (tab, range = timeRange, forceRefresh = false) => {
        const cacheKey = getCacheKey(tab, range)
        if (pendingRequests.current.has(cacheKey)) {
            return
        }
        if (!forceRefresh && dataCache[cacheKey]?.data) {
            return
        }
        if (abortControllers.current[cacheKey]) {
            abortControllers.current[cacheKey].abort()
        }
        try {
            const startTime = Date.now()
            const controller = new AbortController()
            pendingRequests.current.add(cacheKey)
            abortControllers.current[cacheKey] = controller
            setLoadingStates(prev => ({ ...prev, [cacheKey]: true }))
            setErrorStates(prev => ({ ...prev, [cacheKey]: null }))
            const apiCall = getTabAPI(tab, range)
            const data = await apiCall()
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, MINIMUM_LOADING_DURATION - elapsedTime)
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime))
            }
            if (controller.signal.aborted) {
                return
            }
            setDataCache(prev => ({
                ...prev,
                [cacheKey]: {
                    data,
                    timestamp: Date.now(),
                    tab,
                    range
                }
            }))
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error(`Analytics API Error [${tab}:${range}]:`, error)
                setErrorStates(prev => ({
                    ...prev,
                    [cacheKey]: `Failed to load ${tab} data. Please try again.`
                }))
            }
        } finally {
            pendingRequests.current.delete(cacheKey)
            delete abortControllers.current[cacheKey]
            setLoadingStates(prev => ({ ...prev, [cacheKey]: false }))
        }
    }, [timeRange, dataCache, getCacheKey, getTabAPI])
    useEffect(() => {
        fetchTabData(activeTab, timeRange)
    }, [activeTab, timeRange, fetchTabData])
    useEffect(() => {
        return () => {
            Object.values(abortControllers.current).forEach(controller => {
                controller.abort()
            })
            pendingRequests.current.clear()
        }
    }, [])
    const refreshCurrentTab = useCallback(async () => {
        await fetchTabData(activeTab, timeRange, true)
    }, [activeTab, timeRange, fetchTabData])
    const handleTabChange = useCallback((newTab) => {
        setActiveTab(newTab)
        const cacheKey = getCacheKey(newTab, timeRange)
        if (!dataCache[cacheKey]?.data && !pendingRequests.current.has(cacheKey)) {
            fetchTabData(newTab, timeRange)
        }
    }, [timeRange, dataCache, getCacheKey, fetchTabData])
    const handleTimeRangeChange = useCallback((newRange) => {
        setTimeRange(newRange)
        setErrorStates(prev => {
            const newErrors = { ...prev }
            SELLER_TAB_OPTIONS.forEach(tab => {
                const cacheKey = getCacheKey(tab.value, newRange)
                delete newErrors[cacheKey]
            })
            return newErrors
        })
    }, [getCacheKey])

    const tabStatuses = useMemo(() => {
        return SELLER_TAB_OPTIONS.reduce((acc, tab) => {
            const cacheKey = getCacheKey(tab.value, timeRange)
            acc[tab.value] = {
                hasData: !!dataCache[cacheKey]?.data,
                isLoading: loadingStates[cacheKey] || false,
                hasError: !!errorStates[cacheKey]
            }
            return acc
        }, {})
    }, [dataCache, loadingStates, errorStates, timeRange, getCacheKey])
    const renderTabContent = useCallback(() => {
        if (isCurrentTabLoading && !currentTabData) {
            return <LoadingSkeleton />
        }
        if (currentTabError) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <ErrorState message={currentTabError} />
                    <button
                        onClick={refreshCurrentTab}
                        className="mt-4 px-4 py-2 bg-[#00FF89] hover:bg-[#00E67A] text-black font-medium rounded-lg transition-colors">
                        Retry
                    </button>
                </div>
            )
        }
        const tabProps = {
            analyticsData: currentTabData,
            timeRange,
            loading: isCurrentTabLoading
        }
        switch (activeTab) {
            case 'overview':
                return <OverviewTab {...tabProps} />
            case 'products':
                return <ProductsTab {...tabProps} />
            case 'sales':
                return <SalesTab {...tabProps} />
            case 'revenue':
                return <RevenueTab {...tabProps} />
            case 'customers':
                return <CustomersTab {...tabProps} />
            case 'tools':
                return <ToolsTab {...tabProps} />
            default:
                return <OverviewTab {...tabProps} />
        }
    }, [activeTab, currentTabData, timeRange, isCurrentTabLoading, currentTabError, refreshCurrentTab])
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
                            onChange={handleTimeRangeChange}
                            options={TIME_RANGE_OPTIONS}
                            label="Time Range"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={refreshCurrentTab}
                            disabled={isCurrentTabLoading}>
                            <RefreshCw className={`w-4 h-4 ${isCurrentTabLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        
                    </div>
                </div>
                <div className="mb-8">
                    <div className="border-b border-gray-800">
                        <nav className="-mb-px flex space-x-8 overflow-x-auto">
                            {SELLER_TAB_OPTIONS.map((tab) => {
                                const IconComponent = getIconComponent(tab.icon)
                                const isCurrentTab = activeTab === tab.value
                                const status = tabStatuses[tab.value]
                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => handleTabChange(tab.value)}
                                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 relative transition-colors ${
                                            isCurrentTab
                                                ? 'border-[#00FF89] text-[#00FF89]'
                                                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                                        }`}>
                                        <IconComponent className="w-4 h-4" />
                                        {tab.label}
                                        {status.isLoading && (
                                            <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse" />
                                        )}
                                        {status.hasError && !status.isLoading && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        {status.hasData && !status.isLoading && !status.hasError && !isCurrentTab && (
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
                        key={`${activeTab}-${timeRange}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}>
                        {renderTabContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}