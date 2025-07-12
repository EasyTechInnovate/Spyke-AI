'use client'

import React, { useState, useEffect } from 'react'
import { 
    MousePointer, 
    FileText, 
    RefreshCw,
    Download,
    CheckCircle,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { analyticsApi } from '@/lib/api/analytics'
import { useAnalytics } from '@/providers/AnalyticsProvider'
import { ANALYTICS_EVENTS } from '@/lib/analytics/events'

export default function SimpleAnalyticsPage() {
    const [events, setEvents] = useState([])
    const [stats, setStats] = useState({
        totalEvents: 0,
        pageViews: 0,
        successfulPageViews: 0,
        errorPageViews: 0,
        clicks: 0,
        errors: 0,
        uniqueSessions: 0
    })
    const [loading, setLoading] = useState(false)
    const [period, setPeriod] = useState('today')

    const { track } = useAnalytics()

    useEffect(() => {
        // Track dashboard view
        track(ANALYTICS_EVENTS.ADMIN.ANALYTICS_VIEWED)
        
        // Load initial data
        loadData()
    }, [])

    useEffect(() => {
        loadData()
    }, [period])

    const loadData = async () => {
        setLoading(true)
        try {
            // Load stats
            const statsRes = await analyticsApi.getStats(period)
            setStats(statsRes.data.stats)

            // Load recent events (limited to 20)
            const eventsRes = await analyticsApi.getEvents({ 
                limit: 20,
                type: 'all'
            })
            setEvents(eventsRes.data.events)
        } catch (error) {
            // Failed to load analytics
        } finally {
            setLoading(false)
        }
    }

    const exportData = async () => {
        try {
            const response = await analyticsApi.getEvents({ 
                limit: 1000,
                type: 'all'
            })
            
            const data = response.data.events.map(event => ({
                type: event.type,
                name: event.name,
                timestamp: new Date(event.createdAt).toISOString(),
                sessionId: event.sessionId,
                userId: event.userId || 'anonymous',
                url: event.properties?.url || '',
                status: event.properties?.status || '',
                selector: event.properties?.selector || '',
                text: event.properties?.text || ''
            }))

            const csv = [
                Object.keys(data[0] || {}).join(','),
                ...data.map(row => Object.values(row).map(v => 
                    typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
                ).join(','))
            ].join('\n')

            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`
            a.click()
            URL.revokeObjectURL(url)
            
            track(ANALYTICS_EVENTS.ADMIN.ANALYTICS_EXPORTED)
        } catch (error) {
            // Failed to export data
        }
    }

    const clearData = async () => {
        if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
            try {
                await analyticsApi.clearEvents()
                loadData()
                track(ANALYTICS_EVENTS.ADMIN.ANALYTICS_CLEARED)
            } catch (error) {
                // Failed to clear data
            }
        }
    }

    const getEventIcon = (type, status) => {
        if (type === 'pageview') {
            if (status === 'error') return <XCircle className="h-4 w-4 text-red-500" />
            return <CheckCircle className="h-4 w-4 text-[#00FF89]" />
        }
        if (type === 'click') return <MousePointer className="h-4 w-4 text-[#FFC050]" />
        if (type === 'error') return <AlertCircle className="h-4 w-4 text-red-500" />
        return <Activity className="h-4 w-4" />
    }

    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#00FF89]/10">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-400 text-sm font-kumbh-sans">{label}</p>
                    <p className="text-2xl font-bold text-white mt-1 font-league-spartan">{value}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="h-6 w-6" style={{ color }} />
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-league-spartan">
                        Analytics Dashboard
                    </h1>
                    <p className="text-gray-400 font-kumbh-sans">
                        Page loads and user clicks tracking
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-[#121212] text-white rounded px-4 py-2 border border-[#00FF89]/20 focus:border-[#00FF89] focus:outline-none font-kumbh-sans"
                    >
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="text-[#00FF89] hover:text-[#00FF89]/80 p-2 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    icon={FileText} 
                    label="Page Views" 
                    value={stats.pageViews}
                    color="#00FF89"
                />
                <StatCard 
                    icon={CheckCircle} 
                    label="Successful Loads" 
                    value={stats.successfulPageViews}
                    color="#00FF89"
                />
                <StatCard 
                    icon={XCircle} 
                    label="Failed Loads" 
                    value={stats.errorPageViews}
                    color="#ff5555"
                />
                <StatCard 
                    icon={MousePointer} 
                    label="Clicks" 
                    value={stats.clicks}
                    color="#FFC050"
                />
            </div>

            {/* Recent Events */}
            <div className="bg-[#1f1f1f] rounded-lg border border-[#00FF89]/10 overflow-hidden">
                <div className="p-4 border-b border-[#00FF89]/10 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white font-league-spartan">
                        Recent Events
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={exportData}
                            className="bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded px-4 py-2 text-sm font-medium font-kumbh-sans"
                        >
                            <Download className="h-4 w-4 inline mr-2" />
                            Export
                        </button>
                        <button
                            onClick={clearData}
                            className="bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 text-sm font-medium font-kumbh-sans"
                        >
                            Clear
                        </button>
                    </div>
                </div>
                
                <div className="divide-y divide-[#00FF89]/10">
                    {events.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No events recorded yet
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event._id} className="p-4 hover:bg-[#00FF89]/5 transition-colors">
                                <div className="flex items-start gap-3">
                                    {getEventIcon(event.type, event.properties?.status)}
                                    <div className="flex-1">
                                        <p className="font-medium text-white font-kumbh-sans">
                                            {event.name}
                                        </p>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                                            <span>{new Date(event.createdAt).toLocaleString()}</span>
                                            {event.properties?.url && (
                                                <span className="truncate max-w-xs">
                                                    {event.properties.url}
                                                </span>
                                            )}
                                            {event.properties?.text && (
                                                <span className="truncate max-w-xs">
                                                    "{event.properties.text}"
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 bg-[#121212] border border-[#00FF89]/20 rounded text-xs font-kumbh-sans">
                                        {event.type}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}