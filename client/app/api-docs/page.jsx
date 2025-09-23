'use client'
import React, { useState, useEffect, useMemo } from 'react'
import { CheckCircle, XCircle, Clock, Database, Globe, Activity, Server, Zap, Shield, Code, Terminal, GitBranch, Monitor } from 'lucide-react'
import { appConfig, getTotalEndpoints, buildApiUrl } from '@/lib/config'
import { SpykeLogo } from '@/components/Logo'
import Container from '@/components/shared/layout/Container'
export default function APIPage() {
    const [serviceStatus, setServiceStatus] = useState({})
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
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
    const computedStats = useMemo(() => {
        const totalServices = appConfig.services.length
        const totalEndpoints = getTotalEndpoints()
        const onlineServices = Object.values(serviceStatus).filter((s) => s?.status === 'online').length
        const uptimeTarget = appConfig.company.uptimeTarget
        const avgResponseTime = Object.values(serviceStatus)
            .filter((s) => s?.responseTime)
            .reduce((acc, s, _, arr) => acc + s.responseTime / arr.length, 0)
        return {
            totalServices,
            totalEndpoints,
            onlineServices,
            uptimeTarget,
            avgResponseTime: Math.round(avgResponseTime) || 0
        }
    }, [serviceStatus])
    const overallStatus = useMemo(() => {
        if (loading) return 'checking'
        const statuses = Object.values(serviceStatus)
        const onlineServices = statuses.filter((s) => s.status === 'online').length
        const totalServices = statuses.length
        if (onlineServices === totalServices) return 'all-operational'
        if (onlineServices > totalServices / 2) return 'partial-outage'
        return 'major-outage'
    }, [loading, serviceStatus])
    const statusMessage = useMemo(() => {
        switch (overallStatus) {
            case 'checking':
                return 'System Health Check in Progress...'
            case 'all-operational':
                return 'All Systems Operational'
            case 'partial-outage':
                return 'Partial Service Degradation'
            case 'major-outage':
                return 'Major Service Outage'
            default:
                return 'Status Unknown'
        }
    }, [overallStatus])
    const statusColor = useMemo(() => {
        switch (overallStatus) {
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
    }, [overallStatus])
    const healthData = useMemo(() => {
        const healthService = serviceStatus['health'] || Object.values(serviceStatus).find((s) => s?.status === 'online' && s?.data?.data)
        return healthService?.data?.data || null
    }, [serviceStatus])
    const StatusIndicator = ({ status, compact = false }) => {
        if (loading) {
            return (
                <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className="w-3 h-3 bg-[#FFC050] rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-gray-400 font-mono">CHECKING</span>
                </div>
            )
        }
        if (status === 'online') {
            return (
                <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                    <div className="w-3 h-3 bg-[#00FF89] rounded-full mr-2"></div>
                    <span className="font-medium text-[#00FF89] font-mono">ONLINE</span>
                </div>
            )
        }
        return (
            <div className={`flex items-center ${compact ? 'text-sm' : ''}`}>
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="font-medium text-red-500 font-mono">OFFLINE</span>
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
        <div className="min-h-screen bg-[#121212]">
            <section className="relative py-16 border-b border-gray-800">
                <Container>
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="mb-8"></div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{appConfig.company.fullName} Developer API</h1>
                        <div className="text-[#00FF89] mb-6 font-mono text-lg">v2.1.0 • REST API • GraphQL Ready</div>
                        <p className="text-lg text-gray-300 leading-relaxed mb-8">
                            Production-grade APIs for AI marketplace integration. Real-time monitoring, comprehensive documentation, and
                            developer-first experience.
                        </p>
                        <div className={`inline-flex items-center px-8 py-4 rounded-xl border ${statusColor}`}>
                            <div className="flex items-center space-x-3">
                                {loading ? (
                                    <Clock className="w-6 h-6 animate-spin" />
                                ) : overallStatus === 'all-operational' ? (
                                    <CheckCircle className="w-6 h-6" />
                                ) : (
                                    <XCircle className="w-6 h-6" />
                                )}
                                <span className="text-xl font-semibold font-mono">{statusMessage}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                            <a
                                href="#documentation"
                                className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg hover:border-[#00FF89]/30 transition-colors">
                                <Code className="w-4 h-4 text-[#00FF89]" />
                                <span className="text-gray-300 font-mono text-sm">API Docs</span>
                            </a>
                            <a
                                href="#swagger"
                                className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg hover:border-[#00FF89]/30 transition-colors">
                                <Terminal className="w-4 h-4 text-[#00FF89]" />
                                <span className="text-gray-300 font-mono text-sm">OpenAPI</span>
                            </a>
                            <a
                                href="#sdk"
                                className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f] border border-gray-700 rounded-lg hover:border-[#00FF89]/30 transition-colors">
                                <GitBranch className="w-4 h-4 text-[#00FF89]" />
                                <span className="text-gray-300 font-mono text-sm">SDKs</span>
                            </a>
                        </div>
                    </div>
                </Container>
            </section>
            <section className="py-16">
                <Container>
                    <div className="grid md:grid-cols-5 gap-6 text-center mb-16">
                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                            <Database className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-2 font-mono">{computedStats.totalServices}</div>
                            <div className="text-gray-400 font-medium text-sm">Microservices</div>
                        </div>
                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                            <Globe className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-2 font-mono">{computedStats.totalEndpoints}</div>
                            <div className="text-gray-400 font-medium text-sm">API Endpoints</div>
                        </div>
                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                            <CheckCircle className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-2 font-mono">{computedStats.onlineServices}</div>
                            <div className="text-gray-400 font-medium text-sm">Online Services</div>
                        </div>
                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                            <Activity className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-2 font-mono">{computedStats.uptimeTarget}</div>
                            <div className="text-gray-400 font-medium text-sm">SLA Uptime</div>
                        </div>
                        <div className="bg-[#1f1f1f] rounded-xl p-6 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                            <Zap className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-2 font-mono">{computedStats.avgResponseTime}ms</div>
                            <div className="text-gray-400 font-medium text-sm">Avg Response</div>
                        </div>
                    </div>
                    <div className="grid lg:grid-cols-2 gap-8 mb-16">
                        {appConfig.services.map((service, index) => {
                            const Icon = service.icon
                            const status = serviceStatus[service.id]
                            return (
                                <div
                                    key={service.id}
                                    className="bg-[#1f1f1f] rounded-xl border border-gray-800 hover:border-[#00FF89]/30 transition-all duration-300 overflow-hidden group cursor-pointer"
                                    onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}>
                                    <div className="p-6 border-b border-gray-800">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-3 rounded-lg bg-[#00FF89] text-[#121212] group-hover:bg-[#FFC050] transition-colors">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 font-mono">{service.name}</h3>
                                                    <p className="text-gray-400 mb-3 text-sm">{service.description}</p>
                                                    <div className="flex items-center space-x-4 text-xs">
                                                        <StatusIndicator
                                                            status={status?.status}
                                                            compact
                                                        />
                                                        <span className="text-gray-500 font-mono">{service.endpoints.length} endpoints</span>
                                                        {status?.responseTime && (
                                                            <span className="text-gray-500 font-mono">{status.responseTime}ms</span>
                                                        )}
                                                        <span className="text-gray-500 font-mono">RESTful</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 font-mono mb-1">
                                                    Last Check: {status?.lastChecked ? new Date(status.lastChecked).toLocaleTimeString() : 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-semibold text-white font-mono">API Endpoints</h4>
                                            <div className="text-xs text-gray-500 font-mono">
                                                Base URL: <span className="text-[#00FF89]">/api/v2/{service.id}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {service.endpoints
                                                .slice(0, selectedService === service.id ? service.endpoints.length : 3)
                                                .map((endpoint, endpointIndex) => (
                                                    <div
                                                        key={endpointIndex}
                                                        className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700 hover:border-[#00FF89]/30 transition-colors group/endpoint">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-2 h-2 bg-[#00FF89] rounded-full flex-shrink-0 group-hover/endpoint:bg-[#FFC050] transition-colors"></div>
                                                            <span className="text-gray-300 font-mono text-sm group-hover/endpoint:text-white transition-colors">
                                                                {endpoint}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-xs text-gray-500 font-mono">GET</span>
                                                            <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                            <span className="text-xs text-gray-500 font-mono">JSON</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            {service.endpoints.length > 3 && selectedService !== service.id && (
                                                <div className="text-center py-2">
                                                    <button className="text-xs text-[#00FF89] hover:text-[#FFC050] font-mono transition-colors">
                                                        +{service.endpoints.length - 3} more endpoints
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        {selectedService === service.id && (
                                            <div className="mt-6">
                                                <h5 className="text-sm font-semibold text-white font-mono mb-3">Usage Example</h5>
                                                <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                                                    <pre className="text-xs text-gray-300 font-mono overflow-x-auto">
                                                        {`curl -X GET \\
  "https://api.spykeai.com/v2/${service.id}/${service.endpoints[0]}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="bg-[#1f1f1f] rounded-xl p-8 border border-gray-800 hover:border-[#00FF89]/30 transition-colors">
                        <h3 className="text-2xl font-bold text-[#00FF89] mb-6 text-center font-mono">Technical Specifications</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                                    <Activity className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                                    <div className="font-semibold mb-2 text-[#00FF89] font-mono">Rate Limiting</div>
                                    <p className="text-sm text-gray-400 font-mono">1000 req/min</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">Per API key</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                                    <Clock className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                                    <div className="font-semibold mb-2 text-[#00FF89] font-mono">Monitoring</div>
                                    <p className="text-sm text-gray-400 font-mono">Real-time</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">5-second intervals</p>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
                                    <Shield className="w-8 h-8 text-[#00FF89] mx-auto mb-3" />
                                    <div className="font-semibold mb-2 text-[#00FF89] font-mono">Security</div>
                                    <p className="text-sm text-gray-400 font-mono">OAuth 2.0</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">JWT + API Keys</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 font-mono">API Versions</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                                            <span className="font-mono text-sm text-gray-300">v2.1.0</span>
                                            <span className="text-xs text-[#00FF89] font-mono">CURRENT</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                                            <span className="font-mono text-sm text-gray-300">v2.0.0</span>
                                            <span className="text-xs text-gray-500 font-mono">DEPRECATED</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 font-mono">Response Formats</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                                            <span className="font-mono text-sm text-gray-300">JSON</span>
                                            <span className="text-xs text-[#00FF89] font-mono">DEFAULT</span>
                                        </div>
                                        <div className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                                            <span className="font-mono text-sm text-gray-300">XML</span>
                                            <span className="text-xs text-gray-500 font-mono">AVAILABLE</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    )
}