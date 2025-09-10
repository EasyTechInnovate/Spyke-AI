'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Database, Globe, Activity } from 'lucide-react'
import { appConfig, getTotalEndpoints, buildApiUrl } from '@/lib/config'
import { SpykeLogo } from '@/components/Logo'

export default function APIPage() {
    const [serviceStatus, setServiceStatus] = useState({})
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const checkServiceHealth = async (service) => {
        const startTime = Date.now()
        try {
            const response = await fetch(buildApiUrl(service.healthEndpoint), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const endTime = Date.now()
            const responseTime = endTime - startTime

            if (response.ok) {
                const data = await response.json()
                return {
                    status: 'online',
                    data,
                    responseTime,
                    lastChecked: new Date().toISOString()
                }
            } else {
                return {
                    status: 'offline',
                    error: response.statusText,
                    responseTime,
                    lastChecked: new Date().toISOString()
                }
            }
        } catch (error) {
            const endTime = Date.now()
            const responseTime = endTime - startTime
            return {
                status: 'offline',
                error: error.message,
                responseTime,
                lastChecked: new Date().toISOString()
            }
        }
    }

    useEffect(() => {
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
                return 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/30'
            case 'all-operational':
                return 'text-[#00FF89] bg-[#00FF89]/10 border-[#00FF89]/30'
            case 'partial-outage':
                return 'text-[#FFC050] bg-[#FFC050]/10 border-[#FFC050]/30'
            case 'major-outage':
                return 'text-red-500 bg-red-500/10 border-red-500/30'
            default:
                return 'text-gray-500 bg-gray-500/10 border-gray-500/30'
        }
    }

    const StatusIndicator = ({ status, compact = false }) => {
        if (loading) {
            return (
                <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className="w-3 h-3 bg-[#FFC050] rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-500 body-font">Checking...</span>
                </div>
            )
        }

        if (status === 'online') {
            return (
                <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className="w-3 h-3 bg-[#00FF89] rounded-full mr-2"></div>
                    <span className="font-medium text-[#00FF89] body-font">Operational</span>
                </div>
            )
        }

        return (
            <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-red-500 body-font">Offline</span>
            </div>
        )
    }

    const formatMemory = (bytes) => {
        if (!bytes) return 'N/A'
        if (typeof bytes === 'string' && bytes.includes('MB')) return bytes

        const mb = bytes / (1024 * 1024)
        return `${mb.toFixed(2)} MB`
    }

    const formatCpuUsage = (cpuArray) => {
        if (!cpuArray || !Array.isArray(cpuArray)) return 'N/A'
        const average = cpuArray.reduce((sum, cpu) => sum + cpu, 0) / cpuArray.length
        return `${average.toFixed(1)}%`
    }

    const formatUptime = (uptime) => {
        if (!uptime) return 'N/A'
        if (typeof uptime === 'string') return uptime

        const seconds = Math.floor(uptime / 1000)
        const minutes = Math.floor(seconds / 60)
        const hours = Math.floor(minutes / 60)

        if (hours > 0) return `${hours}h ${minutes % 60}m`
        if (minutes > 0) return `${minutes}m ${seconds % 60}s`
        return `${seconds}s`
    }

    return (
        <div className="min-h-screen bg-white text-[#121212] body-font">
            {/* Header */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-[#00FF89]/5 to-[#FFC050]/5"></div>
                <div className="absolute inset-0 bg-[#00FF89] opacity-5"></div>

                <div className="relative max-w-7xl mx-auto px-6 py-16">
                    <div className="text-center">
                        <div className="flex justify-center mb-8">
                            <SpykeLogo size={64} showText={false} />
                        </div>

                        <h1 className="text-6xl font-bold text-[#121212] mb-4 title-font">{appConfig.company.fullName}</h1>
                        <div className="text-sm text-[#00FF89] mb-6 body-font">{appConfig.company.tagline}</div>
                        <p className="text-2xl text-gray-600 mb-8 max-w-3xl mx-auto body-font">{appConfig.company.description}</p>

                        {/* Overall Status */}
                        <div className={`inline-flex items-center px-8 py-4 rounded-2xl border-2 ${getStatusColor()} backdrop-blur-sm shadow-lg`}>
                            <div className="flex items-center space-x-3">
                                {loading ? (
                                    <Clock className="w-6 h-6 animate-spin" />
                                ) : getOverallStatus() === 'all-operational' ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <XCircle className="w-6 h-6" />
                                )}
                                <span className="text-xl font-semibold title-font">{getStatusMessage()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <div className="bg-gradient-to-br from-[#00FF89]/10 to-[#FFC050]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#00FF89]/20 shadow-lg">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div className="bg-white/70 rounded-2xl p-6 border border-[#00FF89]/20 shadow-md">
                            <Database className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-[#121212] mb-2 title-font">{appConfig.services.length}</div>
                            <div className="text-gray-600 font-medium body-font">Total Services</div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-6 border border-[#00FF89]/20 shadow-md">
                            <Globe className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-[#121212] mb-2 title-font">{getTotalEndpoints()}</div>
                            <div className="text-gray-600 font-medium body-font">Total Endpoints</div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-6 border border-[#00FF89]/20 shadow-md">
                            <CheckCircle className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-[#121212] mb-2 title-font">
                                {Object.values(serviceStatus).filter((s) => s?.status === 'online').length}
                            </div>
                            <div className="text-gray-600 font-medium body-font">Services Online</div>
                        </div>
                        <div className="bg-white/70 rounded-2xl p-6 border border-[#00FF89]/20 shadow-md">
                            <Activity className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-[#121212] mb-2 title-font">{appConfig.company.uptimeTarget}</div>
                            <div className="text-gray-600 font-medium body-font">Uptime Target</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Grid */}
            <div className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid lg:grid-cols-2 gap-8">
                    {appConfig.services.map((service, index) => {
                        const Icon = service.icon
                        const status = serviceStatus[service.id]

                        return (
                            <div
                                key={service.id}
                                className="bg-white/70 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-[#00FF89]/30 transition-all duration-300 overflow-hidden">
                                {/* Service Header */}
                                <div className="p-8 border-b border-gray-100">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-4 rounded-2xl bg-gradient-to-r ${service.color} text-white shadow-lg`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-[#121212] mb-2 title-font">{service.name}</h3>
                                                <p className="text-gray-600 mb-3 leading-relaxed body-font">{service.description}</p>
                                                <div className="flex items-center space-x-4">
                                                    <StatusIndicator
                                                        status={status?.status}
                                                        compact
                                                    />
                                                    <span className="text-sm text-gray-500 body-font">{service.endpoints.length} endpoints</span>
                                                    {status?.responseTime && (
                                                        <span className="text-sm text-gray-500 body-font">{status.responseTime}ms</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Endpoints List */}
                                <div className="p-8">
                                    <h4 className="text-lg font-semibold text-[#121212] mb-4 title-font">Available Endpoints:</h4>
                                    <div className="grid gap-3">
                                        {service.endpoints.map((endpoint, endpointIndex) => (
                                            <div
                                                key={endpointIndex}
                                                className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-[#00FF89]/30 transition-colors">
                                                <div className="w-2 h-2 bg-[#00FF89] rounded-full flex-shrink-0"></div>
                                                <span className="text-gray-700 font-medium body-font">{endpoint}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Monitoring Information */}
                <div className="text-center mt-16 bg-gradient-to-br from-[#00FF89]/10 to-[#FFC050]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#00FF89]/20 shadow-lg">
                    <h3 className="text-xl font-semibold text-[#121212] mb-4 title-font">Monitoring Information</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-gray-600">
                        <div>
                            <div className="font-semibold mb-2 text-[#00FF89] title-font">Real-time Updates</div>
                            <p className="text-sm body-font">{appConfig.monitoring.realTimeUpdates}</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-2 text-[#00FF89] title-font">Last Updated</div>
                            <p className="text-sm body-font">{new Date().toLocaleString()}</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-2 text-[#00FF89] title-font">Service Coverage</div>
                            <p className="text-sm body-font">{appConfig.monitoring.serviceCoverage}</p>
                        </div>
                    </div>
                </div>

                {/* System Health Metrics */}
                <div className="mt-8 bg-gradient-to-br from-[#00FF89]/10 to-[#FFC050]/10 backdrop-blur-sm rounded-3xl p-8 border border-[#00FF89]/20 shadow-lg">
                    <h3 className="text-xl font-semibold text-[#121212] mb-6 text-center title-font">System Health Metrics</h3>

                    {(() => {
                        // Get health data from the main health service or first available online service
                        const healthService =
                            serviceStatus['health'] || Object.values(serviceStatus).find((s) => s?.status === 'online' && s?.data?.data)

                        if (!healthService?.data?.data) {
                            return (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 mb-2 body-font">No health metrics available</div>
                                    <div className="text-sm text-gray-400 body-font">Services must be online to display health data</div>
                                </div>
                            )
                        }

                        const { application, system } = healthService.data.data

                        return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                                {/* Environment */}
                                {appConfig.healthDisplay.metricsToShow.environment && application?.environment && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Environment:</span>
                                        <span className="text-[#121212] font-medium capitalize body-font">{application.environment}</span>
                                    </div>
                                )}

                                {/* Uptime */}
                                {appConfig.healthDisplay.metricsToShow.uptime && application?.uptime && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Uptime:</span>
                                        <span className="text-[#121212] font-medium body-font">{formatUptime(application.uptime)}</span>
                                    </div>
                                )}

                                {/* Memory Usage */}
                                {appConfig.healthDisplay.metricsToShow.memoryUsage && application?.memoryUsage && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Heap Used:</span>
                                        <span className="text-[#121212] font-medium body-font">{formatMemory(application.memoryUsage.heapUsed)}</span>
                                    </div>
                                )}

                                {/* CPU Usage */}
                                {appConfig.healthDisplay.metricsToShow.cpuUsage && system?.cpuUsage && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">CPU Usage:</span>
                                        <span className="text-[#121212] font-medium body-font">{formatCpuUsage(system.cpuUsage)}</span>
                                    </div>
                                )}

                                {/* Free Memory */}
                                {system?.freeMemory && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Free Memory:</span>
                                        <span className="text-[#121212] font-medium body-font">{formatMemory(system.freeMemory)}</span>
                                    </div>
                                )}

                                {/* Total Memory */}
                                {system?.totalMemory && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Total Memory:</span>
                                        <span className="text-[#121212] font-medium body-font">{formatMemory(system.totalMemory)}</span>
                                    </div>
                                )}

                                {/* Heap Total */}
                                {application?.memoryUsage?.heapTotal && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 body-font">Heap Total:</span>
                                        <span className="text-[#121212] font-medium body-font">
                                            {formatMemory(application.memoryUsage.heapTotal)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })()}
                </div>
            </div>
        </div>
    )
}