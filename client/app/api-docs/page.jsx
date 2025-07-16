'use client'
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CheckCircle,
    XCircle,
    Clock,
    BarChart3,
    TrendingUp,
    Globe
} from 'lucide-react'
import { appConfig, getTotalEndpoints, buildApiUrl } from '@/lib/config'

const ApiDocsPage = () => {
    const [serviceStatus, setServiceStatus] = useState({})
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState('')

    const checkServiceHealth = async (service) => {
        try {
            const response = await fetch(buildApiUrl(service.healthEndpoint), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                return { status: 'online', data, responseTime: Date.now() }
            } else {
                return { status: 'offline', error: response.statusText }
            }
        } catch (error) {
            return { status: 'offline', error: error.message }
        }
    }

    useEffect(() => {
        setCurrentDate(new Date().toLocaleString())

        const checkAllServices = async () => {
            const statuses = {}

            for (const service of appConfig.services) {
                const result = await checkServiceHealth(service)
                statuses[service.id] = result
            }

            setServiceStatus(statuses)
            setLoading(false)
        }

        checkAllServices()

        const interval = setInterval(checkAllServices, appConfig.api.healthCheckInterval)

        return () => clearInterval(interval)
    }, [])

    const getOverallStatus = () => {
        if (loading) return 'checking'

        const statuses = Object.values(serviceStatus)
        const onlineServices = statuses.filter((s) => s.status === 'online').length
        const totalServices = statuses.length

        if (onlineServices === totalServices) return 'all-operational'
        if (onlineServices > totalServices / 2) return 'partial-outage'
        return 'major-outage'
    }

    const getStatusMessage = () => {
        const overall = getOverallStatus()
        switch (overall) {
            case 'checking':
                return appConfig.statusMessages.checking
            case 'all-operational':
                return appConfig.statusMessages.allOperational
            case 'partial-outage':
                return appConfig.statusMessages.partialOutage
            case 'major-outage':
                return appConfig.statusMessages.majorOutage
            default:
                return appConfig.statusMessages.unknown
        }
    }

    const getStatusColor = () => {
        const overall = getOverallStatus()
        switch (overall) {
            case 'checking':
                return 'text-yellow-600 bg-yellow-50'
            case 'all-operational':
                return `text-[${appConfig.theme.primaryColor}] bg-[${appConfig.theme.primaryColor}]/10`
            case 'partial-outage':
                return 'text-orange-600 bg-orange-50'
            case 'major-outage':
                return 'text-red-600 bg-red-50'
            default:
                return 'text-gray-600 bg-gray-50'
        }
    }

    const StatusIndicator = ({ status, compact = false }) => {
        if (loading) {
            return (
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-600">Checking...</span>
                </motion.div>
            )
        }

        if (status === 'online') {
            return (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className={`w-3 h-3 bg-[${appConfig.theme.primaryColor}] rounded-full mr-2`}></div>
                    <span className={`font-medium text-[${appConfig.theme.primaryColor}]`}>Operational</span>
                </motion.div>
            )
        }

        return (
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-red-700">Offline</span>
            </motion.div>
        )
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br from-white via-[${appConfig.theme.primaryColor}]/5 to-[${appConfig.theme.primaryColor}]/10`}>
            <div className="relative">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center">
                        <div className="flex justify-center items-center mb-8">
                            <div className="flex items-center space-x-4">
                                <div className={`p-6 bg-[${appConfig.theme.primaryColor}]/20 rounded-full backdrop-blur-sm border border-[${appConfig.theme.primaryColor}]/30`}>
                                    <BarChart3 className={`w-16 h-16 text-[${appConfig.theme.primaryText}]`} />
                                </div>
                                <div className="text-left">
                                    <div className="flex items-center space-x-3">
                                        <div className={`text-4xl font-bold text-[${appConfig.theme.primaryText}]`}>{appConfig.company.name}</div>
                                        <div className={`text-[${appConfig.theme.primaryColor}] font-medium text-3xl`}>| AI</div>
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">API Services Report | {appConfig.company.tagline}</div>
                                </div>
                            </div>
                        </div>

                        <h1 className={`text-4xl lg:text-6xl font-bold text-[${appConfig.theme.primaryText}] mb-6`}>
                            AI Services <span className={`text-[${appConfig.theme.primaryColor}]`}>Status</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Real-time monitoring of our AI marketplace platform services
                        </p>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className={`inline-flex items-center px-8 py-4 rounded-2xl border-2 ${getStatusColor()} border-current/20 backdrop-blur-sm`}>
                            <div className="flex items-center space-x-3">
                                {loading ? (
                                    <Clock className="w-6 h-6 animate-spin" />
                                ) : getOverallStatus() === 'all-operational' ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <XCircle className="w-6 h-6" />
                                )}
                                <span className="text-xl font-semibold">{getStatusMessage()}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[${appConfig.theme.primaryColor}]/20 shadow-lg`}>
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div className={`bg-[${appConfig.theme.primaryColor}]/10 rounded-2xl p-6`}>
                            <TrendingUp className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-gray-900 mb-2">{appConfig.services.length}</div>
                            <div className="text-gray-700 font-medium">Total Services</div>
                        </div>
                        <div className={`bg-[${appConfig.theme.primaryColor}]/10 rounded-2xl p-6`}>
                            <Globe className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-gray-900 mb-2">{getTotalEndpoints()}</div>
                            <div className="text-gray-700 font-medium">Total Endpoints</div>
                        </div>
                        <div className={`bg-[${appConfig.theme.primaryColor}]/10 rounded-2xl p-6`}>
                            <CheckCircle className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                {Object.values(serviceStatus).filter((s) => s?.status === 'online').length}
                            </div>
                            <div className="text-gray-700 font-medium">Services Online</div>
                        </div>
                        <div className={`bg-[${appConfig.theme.primaryColor}]/10 rounded-2xl p-6`}>
                            <CheckCircle className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-gray-900 mb-2">{appConfig.company.uptimeTarget}</div>
                            <div className="text-gray-700 font-medium">Uptime Target</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {appConfig.services.map((service, index) => {
                        const Icon = service.icon
                        const status = serviceStatus[service.id]

                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-[${appConfig.theme.primaryColor}]/20 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
                                <div className="p-8 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.color} text-white shadow-lg`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                                <p className="text-gray-600 mb-3 leading-relaxed">{service.description}</p>
                                                <div className="flex items-center space-x-4">
                                                    <StatusIndicator
                                                        status={status?.status}
                                                        compact
                                                    />
                                                    <span className="text-sm text-gray-500">{service.endpoints.length} endpoints</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Endpoints:</h4>
                                    <div className="grid gap-3">
                                        {service.endpoints.map((endpoint, endpointIndex) => (
                                            <motion.div
                                                key={endpointIndex}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 + endpointIndex * 0.02 }}
                                                className={`flex items-center space-x-3 p-3 bg-[${appConfig.theme.primaryColor}]/5 rounded-xl border border-[${appConfig.theme.primaryColor}]/10 hover:bg-[${appConfig.theme.primaryColor}]/10 transition-colors`}>
                                                <div className={`w-2 h-2 bg-[${appConfig.theme.primaryColor}] rounded-full flex-shrink-0`}></div>
                                                <span className="text-gray-700 font-medium">{endpoint}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className={`text-center mt-16 bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[${appConfig.theme.primaryColor}]/20 shadow-lg`}>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Monitoring Information</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-gray-700">
                        <div>
                            <div className="font-semibold mb-2">Real-time Updates</div>
                            <p className="text-sm text-gray-600">{appConfig.monitoring.realTimeUpdates}</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Last Updated</div>
                            <p className="text-sm text-gray-600">{currentDate}</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-2">Service Coverage</div>
                            <p className="text-sm text-gray-600">{appConfig.monitoring.serviceCoverage}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default ApiDocsPage