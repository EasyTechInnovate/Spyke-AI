'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    Globe,
    Zap,
    Server,
    RefreshCw,
    Activity,
    Database,
    Terminal,
    Code2,
    Network,
    HardDrive,
    Gauge,
    Signal,
    Layers,
    Menu,
    X
} from 'lucide-react'
import { appConfig, getTotalEndpoints, buildApiUrl } from '@/lib/config'

const ClockDisplay = () => {
    const [currentDate, setCurrentDate] = useState('')
    
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentDate(now.toLocaleString())
        }
        updateTime()
        const timeInterval = setInterval(updateTime, 1000)
        
        return () => clearInterval(timeInterval)
    }, [])
    
    return (
        <div className="text-sm text-gray-400">
            <Clock className="w-4 h-4 inline mr-1" />
            {currentDate}
        </div>
    )
}

const ApiDocsPage = () => {
    const [serviceStatus, setServiceStatus] = useState({})
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedMetric, setSelectedMetric] = useState('response')
    const [terminalLines, setTerminalLines] = useState([])
    const [isInitialized, setIsInitialized] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [selectedServiceId, setSelectedServiceId] = useState(null)

    const checkServiceHealth = async (service) => {
        try {
            const startTime = Date.now()
            
            // Create an AbortController for timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
            
            const response = await fetch(buildApiUrl(service.healthEndpoint), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            })
            
            clearTimeout(timeoutId)

            const responseTime = Date.now() - startTime

            if (response.ok) {
                const data = await response.json()
                return { status: 'online', data, responseTime }
            } else {
                return { status: 'offline', error: response.statusText, responseTime }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                return { status: 'offline', error: 'Request timeout', responseTime: 5000 }
            }
            return { status: 'offline', error: error.message, responseTime: 0 }
        }
    }

    useEffect(() => {
        const checkAllServices = async () => {
            // Only add terminal lines if not initial load
            if (isInitialized) {
                const lines = [`[${new Date().toLocaleTimeString()}] Initiating health check...`]
                setTerminalLines(prev => [...prev.slice(-10), ...lines])
            }

            // Make all health check requests in parallel
            const healthCheckPromises = appConfig.services.map(async (service) => {
                const result = await checkServiceHealth(service)
                
                if (isInitialized) {
                    const statusLine = `[${new Date().toLocaleTimeString()}] ${service.name}: ${result.status.toUpperCase()} (${result.responseTime}ms)`
                    setTerminalLines(prev => [...prev.slice(-10), statusLine])
                }
                
                return { id: service.id, result }
            })

            // Wait for all requests to complete
            const results = await Promise.all(healthCheckPromises)
            
            // Convert array to object
            const statuses = results.reduce((acc, { id, result }) => {
                acc[id] = result
                return acc
            }, {})

            setServiceStatus(statuses)
            setLoading(false)
            setRefreshing(false)
            
            if (!isInitialized) {
                setIsInitialized(true)
            }
        }

        checkAllServices()

        const interval = setInterval(checkAllServices, appConfig.api.healthCheckInterval)

        return () => {
            clearInterval(interval)
        }
    }, [isInitialized])

    const handleViewDetails = (serviceId) => {
        setSelectedServiceId(serviceId)
        setActiveTab('services')
        setIsMobileMenuOpen(false)
        
        // Scroll to top after tab change
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }, 100)
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        setTerminalLines([`[${new Date().toLocaleTimeString()}] Manual refresh initiated...`])

        // Make all health check requests in parallel
        const healthCheckPromises = appConfig.services.map(async (service) => {
            const result = await checkServiceHealth(service)
            
            const statusLine = `[${new Date().toLocaleTimeString()}] ${service.name}: ${result.status.toUpperCase()} (${result.responseTime}ms)`
            setTerminalLines(prev => [...prev.slice(-10), statusLine])
            
            return { id: service.id, result }
        })

        // Wait for all requests to complete
        const results = await Promise.all(healthCheckPromises)
        
        // Convert array to object
        const statuses = results.reduce((acc, { id, result }) => {
            acc[id] = result
            return acc
        }, {})

        setServiceStatus(statuses)
        setRefreshing(false)
    }

    const getOverallStatus = useMemo(() => {
        if (loading) return 'checking'

        const statuses = Object.values(serviceStatus)
        const onlineServices = statuses.filter((s) => s.status === 'online').length
        const totalServices = statuses.length

        if (onlineServices === totalServices) return 'all-operational'
        if (onlineServices > totalServices / 2) return 'partial-outage'
        return 'major-outage'
    }, [loading, serviceStatus])

    const getAverageResponseTime = useMemo(() => {
        const times = Object.values(serviceStatus)
            .filter(s => s.responseTime)
            .map(s => s.responseTime)
        
        if (times.length === 0) return 0
        return Math.round(times.reduce((a, b) => a + b, 0) / times.length)
    }, [serviceStatus])

    const getUptimePercentage = useMemo(() => {
        const total = Object.values(serviceStatus).length
        const online = Object.values(serviceStatus).filter(s => s.status === 'online').length
        return total > 0 ? Math.round((online / total) * 100) : 0
    }, [serviceStatus])

    const MetricCard = ({ icon: Icon, label, value, trend, color }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative overflow-hidden h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <div className="relative bg-[#1a1a1a] border border-gray-800 rounded-lg p-3 sm:p-4 h-full min-h-[100px] sm:min-h-[120px]">
                <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                    {trend && (
                        <span className={`text-xs ${trend > 0 ? 'text-[#00FF89]' : 'text-red-500'}`}>
                            {trend > 0 ? '+' : ''}{trend}%
                        </span>
                    )}
                </div>
                <div className="text-xl sm:text-2xl font-bold text-white mb-1 tabular-nums">{value}</div>
                <div className="text-xs text-gray-500">{label}</div>
            </div>
        </motion.div>
    )

    const ServiceRow = React.memo(({ service, status, index, onViewDetails }) => {
        const Icon = service.icon
        const [hasAnimated, setHasAnimated] = useState(false)
        
        useEffect(() => {
            setHasAnimated(true)
        }, [])
        
        return (
            <motion.tr
                initial={hasAnimated ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={hasAnimated ? {} : { delay: index * 0.05 }}
                className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors">
                <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color}`}>
                            <Icon className="w-4 h-4 text-[#121212]" />
                        </div>
                        <div>
                            <div className="font-medium text-white">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.endpoints.length} endpoints</div>
                        </div>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                        {status?.status === 'online' ? (
                            <>
                                <div className="w-2 h-2 bg-[#00FF89] rounded-full animate-pulse"></div>
                                <span className="text-[#00FF89] text-sm tabular-nums">Operational</span>
                            </>
                        ) : (
                            <>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-red-500 text-sm tabular-nums">Offline</span>
                            </>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                        <Gauge className="w-4 h-4 text-gray-500" />
                        <span className="text-white tabular-nums">{status?.responseTime || 0}ms</span>
                    </div>
                </td>
                <td className="py-4 px-6">
                    <div className="flex -space-x-1">
                        {service.endpoints.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-6 h-6 bg-gray-700 rounded-full border-2 border-[#121212] flex items-center justify-center">
                                <span className="text-[8px] text-gray-400">{i + 1}</span>
                            </div>
                        ))}
                        {service.endpoints.length > 3 && (
                            <div className="w-6 h-6 bg-gray-800 rounded-full border-2 border-[#121212] flex items-center justify-center">
                                <span className="text-[8px] text-gray-400">+{service.endpoints.length - 3}</span>
                            </div>
                        )}
                    </div>
                </td>
                <td className="py-4 px-6">
                    <button 
                        onClick={() => onViewDetails(service.id)}
                        className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm transition-colors">
                        View Details →
                    </button>
                </td>
            </motion.tr>
        )
    }, (prevProps, nextProps) => {
        // Only re-render if status or responseTime actually changed
        return (
            prevProps.service.id === nextProps.service.id &&
            prevProps.status?.status === nextProps.status?.status &&
            prevProps.status?.responseTime === nextProps.status?.responseTime &&
            prevProps.index === nextProps.index &&
            prevProps.onViewDetails === nextProps.onViewDetails
        )
    })

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-12">
            {/* Header */}
            <div className="border-b border-gray-800 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* Mobile menu button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
                                <Menu className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-gradient-to-r from-[#00FF89] to-[#FFC050] rounded-lg">
                                    <Terminal className="w-6 h-6 text-[#121212]" />
                                </div>
                                <div className="hidden sm:block">
                                    <h1 className="text-xl font-bold">{appConfig.company.name} API Status</h1>
                                    <p className="text-xs text-gray-500">Real-time Service Monitoring</p>
                                </div>
                                <div className="sm:hidden">
                                    <h1 className="text-lg font-bold">API Status</h1>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <div className="hidden sm:block">
                                <ClockDisplay />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:border-[#00FF89]/50 transition-colors">
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex relative">
                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar - Desktop */}
                <div className="hidden lg:block w-64 border-r border-gray-800 bg-[#0a0a0a] min-h-screen fixed left-0 top-[73px] bottom-0">
                    <div className="p-6">
                        <div className="space-y-2">
                            {['overview', 'services', 'metrics', 'logs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                        activeTab === tab 
                                            ? 'bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30' 
                                            : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                                    }`}>
                                    <div className="flex items-center space-x-3">
                                        {tab === 'overview' && <Layers className="w-4 h-4" />}
                                        {tab === 'services' && <Server className="w-4 h-4" />}
                                        {tab === 'metrics' && <BarChart3 className="w-4 h-4" />}
                                        {tab === 'logs' && <Terminal className="w-4 h-4" />}
                                        <span className="capitalize">{tab}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* System Status */}
                        <div className="mt-8 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                            <h3 className="text-sm font-semibold mb-3 text-gray-400">System Status</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Uptime</span>
                                        <span className="text-[#00FF89]">{getUptimePercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-[#00FF89] to-[#FFC050] h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getUptimePercentage}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Response</span>
                                        <span className="text-[#FFC050]">{getAverageResponseTime}ms</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-[#FFC050] to-[#00FF89] h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (200 - getAverageResponseTime) / 2)}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Mobile */}
                <motion.div
                    initial={false}
                    animate={{ x: isMobileMenuOpen ? 0 : '-100%' }}
                    className="lg:hidden fixed w-64 border-r border-gray-800 bg-[#0a0a0a] h-full z-50 transition-transform">
                    <div className="p-6 lg:sticky lg:top-16">
                        {/* Mobile close button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <div className="space-y-2">
                            {['overview', 'services', 'metrics', 'logs'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => {
                                        setActiveTab(tab)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                                        activeTab === tab 
                                            ? 'bg-[#00FF89]/10 text-[#00FF89] border border-[#00FF89]/30' 
                                            : 'text-gray-400 hover:text-white hover:bg-[#1a1a1a]'
                                    }`}>
                                    <div className="flex items-center space-x-3">
                                        {tab === 'overview' && <Layers className="w-4 h-4" />}
                                        {tab === 'services' && <Server className="w-4 h-4" />}
                                        {tab === 'metrics' && <BarChart3 className="w-4 h-4" />}
                                        {tab === 'logs' && <Terminal className="w-4 h-4" />}
                                        <span className="capitalize">{tab}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* System Status */}
                        <div className="mt-8 p-4 bg-[#1a1a1a] rounded-lg border border-gray-800">
                            <h3 className="text-sm font-semibold mb-3 text-gray-400">System Status</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Uptime</span>
                                        <span className="text-[#00FF89]">{getUptimePercentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-[#00FF89] to-[#FFC050] h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${getUptimePercentage}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-500">Response</span>
                                        <span className="text-[#FFC050]">{getAverageResponseTime}ms</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <motion.div 
                                            className="bg-gradient-to-r from-[#FFC050] to-[#00FF89] h-1.5 rounded-full"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, (200 - getAverageResponseTime) / 2)}%` }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 p-4 sm:p-6 lg:p-6 lg:ml-64">
                    {/* Breadcrumb Navigation */}
                    {activeTab !== 'overview' && (
                        <div className="mb-4 text-sm text-gray-500">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className="hover:text-white transition-colors">
                                Overview
                            </button>
                            <span className="mx-2">/</span>
                            <span className="text-white capitalize">{activeTab}</span>
                        </div>
                    )}
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={false}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}>
                                {loading ? (
                                    // Loading skeleton
                                    <div className="space-y-6">
                                        <div className="h-32 bg-gray-900 rounded-xl animate-pulse"></div>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="h-28 bg-gray-900 rounded-xl animate-pulse"></div>
                                            ))}
                                        </div>
                                        <div className="h-96 bg-gray-900 rounded-xl animate-pulse"></div>
                                    </div>
                                ) : (
                                    <>
                                {/* Status Banner */}
                                <div className="mb-6 sm:mb-8">
                                    <div className={`p-4 sm:p-6 rounded-xl border ${
                                        getOverallStatus === 'all-operational' 
                                            ? 'bg-[#00FF89]/10 border-[#00FF89]/30' 
                                            : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                            <div className="flex items-center space-x-3 sm:space-x-4">
                                                {getOverallStatus === 'all-operational' ? (
                                                    <CheckCircle className="w-8 h-8 text-[#00FF89]" />
                                                ) : (
                                                    <XCircle className="w-8 h-8 text-red-500" />
                                                )}
                                                <div>
                                                    <h2 className="text-xl sm:text-2xl font-bold">
                                                        {getOverallStatus === 'all-operational' ? 'All Systems Operational' : 'Service Disruption'}
                                                    </h2>
                                                    <p className="text-gray-400 mt-1">
                                                        {Object.values(serviceStatus).filter(s => s.status === 'online').length} of {appConfig.services.length} services online
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-[#00FF89]">{getUptimePercentage}%</div>
                                                <div className="text-sm text-gray-500">Uptime</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                                    <MetricCard 
                                        icon={Server} 
                                        label="Total Services" 
                                        value={appConfig.services.length}
                                        color="text-[#00FF89]"
                                    />
                                    <MetricCard 
                                        icon={Globe} 
                                        label="API Endpoints" 
                                        value={getTotalEndpoints()}
                                        color="text-[#FFC050]"
                                    />
                                    <MetricCard 
                                        icon={Zap} 
                                        label="Avg Response" 
                                        value={`${getAverageResponseTime}ms`}
                                        trend={-5}
                                        color="text-blue-500"
                                    />
                                    <MetricCard 
                                        icon={Activity} 
                                        label="Health Score" 
                                        value={`${getUptimePercentage}%`}
                                        trend={2}
                                        color="text-purple-500"
                                    />
                                </div>

                                {/* Services Table - Desktop */}
                                <div className="hidden lg:block bg-[#0f0f0f] rounded-xl border border-gray-800 overflow-hidden min-h-[400px]">
                                    <div className="px-6 py-4 border-b border-gray-800">
                                        <h3 className="text-lg font-semibold">Service Overview</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full table-fixed">
                                            <thead>
                                                <tr className="text-left text-gray-500 text-sm">
                                                    <th className="px-6 py-3 whitespace-nowrap w-2/5">Service</th>
                                                    <th className="px-6 py-3 whitespace-nowrap w-1/5">Status</th>
                                                    <th className="px-6 py-3 whitespace-nowrap w-1/5">Response Time</th>
                                                    <th className="px-6 py-3 whitespace-nowrap w-1/5">Endpoints</th>
                                                    <th className="px-6 py-3 whitespace-nowrap w-1/5">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {appConfig.services.map((service, index) => (
                                                    <ServiceRow 
                                                        key={service.id}
                                                        service={service}
                                                        status={serviceStatus[service.id]}
                                                        index={index}
                                                        onViewDetails={handleViewDetails}
                                                    />
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Services Cards - Mobile */}
                                <div className="lg:hidden space-y-4">
                                    <h3 className="text-lg font-semibold mb-4">Service Overview</h3>
                                    {appConfig.services.map((service, index) => {
                                        const Icon = service.icon
                                        const status = serviceStatus[service.id]
                                        
                                        return (
                                            <motion.div
                                                key={service.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color}`}>
                                                            <Icon className="w-5 h-5 text-[#121212]" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-white">{service.name}</div>
                                                            <div className="text-xs text-gray-500">{service.endpoints.length} endpoints</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {status?.status === 'online' ? (
                                                            <div className="flex items-center space-x-1">
                                                                <div className="w-2 h-2 bg-[#00FF89] rounded-full"></div>
                                                                <span className="text-[#00FF89] text-sm">Online</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-1">
                                                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                                <span className="text-red-500 text-sm">Offline</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                        <Gauge className="w-4 h-4" />
                                                        <span>{status?.responseTime || 0}ms</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleViewDetails(service.id)}
                                                        className="text-[#00FF89] text-sm hover:text-[#00FF89]/80 transition-colors">
                                                        Details →
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'services' && (
                            <motion.div
                                key="services"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                            </svg>
                                            <span>Back to Overview</span>
                                        </button>
                                        <h2 className="text-xl sm:text-2xl font-bold">Service Details</h2>
                                    </div>
                                    {selectedServiceId && (
                                        <button
                                            onClick={() => setSelectedServiceId(null)}
                                            className="text-sm text-gray-400 hover:text-white transition-colors">
                                            Clear selection
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-6">
                                    {appConfig.services.map((service, index) => {
                                        const Icon = service.icon
                                        const status = serviceStatus[service.id]
                                        
                                        return (
                                            <motion.div 
                                                key={service.id} 
                                                className={`bg-[#0f0f0f] rounded-xl border overflow-hidden transition-all duration-300 ${
                                                    selectedServiceId === service.id 
                                                        ? 'border-[#00FF89] shadow-lg shadow-[#00FF89]/20' 
                                                        : 'border-gray-800'
                                                }`}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}>
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-4">
                                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${service.color}`}>
                                                                <Icon className="w-6 h-6 text-[#121212]" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-semibold">{service.name}</h3>
                                                                <p className="text-gray-500 mt-1">{service.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className={`px-3 py-1 rounded-full text-sm ${
                                                            status?.status === 'online' 
                                                                ? 'bg-[#00FF89]/20 text-[#00FF89]' 
                                                                : 'bg-red-500/20 text-red-500'
                                                        }`}>
                                                            {status?.status === 'online' ? 'Online' : 'Offline'}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                                        <div className="bg-[#1a1a1a] p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Response Time</div>
                                                            <div className="text-lg font-semibold">{status?.responseTime || 0}ms</div>
                                                        </div>
                                                        <div className="bg-[#1a1a1a] p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Endpoints</div>
                                                            <div className="text-lg font-semibold">{service.endpoints.length}</div>
                                                        </div>
                                                        <div className="bg-[#1a1a1a] p-3 rounded-lg">
                                                            <div className="text-xs text-gray-500 mb-1">Health</div>
                                                            <div className="text-lg font-semibold">{status?.status === 'online' ? '100%' : '0%'}</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="space-y-2">
                                                        <div className="text-sm text-gray-500 mb-2">Available Endpoints:</div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {service.endpoints.map((endpoint, i) => (
                                                                <div key={i} className="flex items-center space-x-2 bg-[#1a1a1a] px-3 py-2 rounded-lg">
                                                                    <Code2 className="w-3 h-3 text-[#00FF89]" />
                                                                    <span className="text-sm">{endpoint}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'metrics' && (
                            <motion.div
                                key="metrics"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}>
                                <h2 className="text-2xl font-bold mb-6">Performance Metrics</h2>
                                
                                {/* Metric Selector */}
                                <div className="flex space-x-2 mb-6">
                                    {['response', 'uptime', 'requests'].map((metric) => (
                                        <button
                                            key={metric}
                                            onClick={() => setSelectedMetric(metric)}
                                            className={`px-4 py-2 rounded-lg transition-all ${
                                                selectedMetric === metric
                                                    ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                                    : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
                                            }`}>
                                            {metric.charAt(0).toUpperCase() + metric.slice(1)} Time
                                        </button>
                                    ))}
                                </div>
                                
                                {/* Graph Placeholder */}
                                <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-8">
                                    <div className="h-64 flex items-center justify-center">
                                        <div className="text-center">
                                            <BarChart3 className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                                            <p className="text-gray-500">Real-time metrics visualization</p>
                                            <p className="text-sm text-gray-600 mt-2">Average Response: {getAverageResponseTime}ms</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Metric Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6">
                                    <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Gauge className="w-6 h-6 text-[#00FF89]" />
                                            <span className="text-xs text-gray-500">Last Hour</span>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{getAverageResponseTime}ms</div>
                                        <div className="text-sm text-gray-500">Average Response</div>
                                    </div>
                                    
                                    <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Signal className="w-6 h-6 text-[#FFC050]" />
                                            <span className="text-xs text-gray-500">Today</span>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{getUptimePercentage}%</div>
                                        <div className="text-sm text-gray-500">Uptime Rate</div>
                                    </div>
                                    
                                    <div className="bg-[#0f0f0f] rounded-xl border border-gray-800 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <Network className="w-6 h-6 text-blue-500" />
                                            <span className="text-xs text-gray-500">Total</span>
                                        </div>
                                        <div className="text-3xl font-bold mb-2">{getTotalEndpoints()}</div>
                                        <div className="text-sm text-gray-500">Active Endpoints</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'logs' && (
                            <motion.div
                                key="logs"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}>
                                <h2 className="text-2xl font-bold mb-6">System Logs</h2>
                                
                                {/* Terminal */}
                                <div className="bg-black rounded-xl border border-gray-800 overflow-hidden">
                                    <div className="bg-[#1a1a1a] px-4 py-2 border-b border-gray-800 flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-gray-500 ml-4">system.log</span>
                                    </div>
                                    <div className="p-4 font-mono text-sm">
                                        <div className="space-y-1">
                                            {terminalLines.map((line, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className={`${
                                                        line.includes('ONLINE') ? 'text-[#00FF89]' : 
                                                        line.includes('OFFLINE') ? 'text-red-500' : 
                                                        'text-gray-400'
                                                    }`}>
                                                    {line}
                                                </motion.div>
                                            ))}
                                            <div className="flex items-center space-x-2 text-gray-600">
                                                <span>$</span>
                                                <div className="w-2 h-4 bg-gray-600 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Log Stats */}
                                <div className="grid grid-cols-4 gap-4 mt-6">
                                    <div className="bg-[#0f0f0f] rounded-lg border border-gray-800 p-4">
                                        <div className="text-2xl font-bold text-[#00FF89]">{terminalLines.filter(l => l.includes('ONLINE')).length}</div>
                                        <div className="text-xs text-gray-500">Success</div>
                                    </div>
                                    <div className="bg-[#0f0f0f] rounded-lg border border-gray-800 p-4">
                                        <div className="text-2xl font-bold text-red-500">{terminalLines.filter(l => l.includes('OFFLINE')).length}</div>
                                        <div className="text-xs text-gray-500">Failures</div>
                                    </div>
                                    <div className="bg-[#0f0f0f] rounded-lg border border-gray-800 p-4">
                                        <div className="text-2xl font-bold text-[#FFC050]">{terminalLines.length}</div>
                                        <div className="text-xs text-gray-500">Total Logs</div>
                                    </div>
                                    <div className="bg-[#0f0f0f] rounded-lg border border-gray-800 p-4">
                                        <div className="text-2xl font-bold text-blue-500">{getAverageResponseTime}</div>
                                        <div className="text-xs text-gray-500">Avg ms</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Back Button for Mobile */}
            {activeTab !== 'overview' && (
                <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onClick={() => setActiveTab('overview')}
                    className="lg:hidden fixed bottom-20 right-4 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] p-4 rounded-full shadow-lg z-40">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </motion.button>
            )}

            {/* Footer Status Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-gray-800 px-4 sm:px-6 py-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                            <Database className="w-3 h-3" />
                            <span>Connected to {appConfig.api.baseURL}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                            <HardDrive className="w-3 h-3" />
                            <span>{appConfig.services.length} Services</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                            <Signal className="w-3 h-3 text-[#00FF89]" />
                            <span>Live</span>
                        </span>
                        <span>{appConfig.company.name} v1.0.0</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApiDocsPage