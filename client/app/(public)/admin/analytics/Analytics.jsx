'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
    BarChart3, 
    TrendingUp, 
    Users, 
    MousePointer, 
    FileText, 
    Clock,
    Activity,
    Calendar,
    Filter,
    Download,
    Shield,
    RefreshCw
} from 'lucide-react'
import { analyticsStorage } from '@/lib/analytics/storage'
import { useAnalytics } from '@/providers/AnalyticsProvider'

export default function AnalyticsPage() {
    const [events, setEvents] = useState([])
    const [filteredEvents, setFilteredEvents] = useState([])
    const [filters, setFilters] = useState({
        type: 'all',
        dateRange: 'today',
        search: ''
    })
    const [stats, setStats] = useState({
        totalEvents: 0,
        pageViews: 0,
        clicks: 0,
        forms: 0,
        errors: 0,
        uniqueSessions: 0
    })

    const { track } = useAnalytics()

    useEffect(() => {
        // Track dashboard view
        track('Analytics Dashboard Viewed')
        
        // Load events
        loadEvents()
        
        // Remove auto-refresh to prevent instability
        // Users can manually refresh if needed
    }, [])

    useEffect(() => {
        filterEvents()
        calculateStats()
    }, [events, filters])

    const loadEvents = () => {
        const storedEvents = analyticsStorage.getEvents()
        setEvents(storedEvents)
    }

    const filterEvents = () => {
        let filtered = [...events]

        // Filter by type
        if (filters.type !== 'all') {
            filtered = filtered.filter(e => e.type === filters.type)
        }

        // Filter by date range
        const now = Date.now()
        const ranges = {
            today: 24 * 60 * 60 * 1000,
            week: 7 * 24 * 60 * 60 * 1000,
            month: 30 * 24 * 60 * 60 * 1000
        }
        
        if (filters.dateRange !== 'all' && ranges[filters.dateRange]) {
            const cutoff = now - ranges[filters.dateRange]
            filtered = filtered.filter(e => (e.timestamp || 0) >= cutoff)
        }

        // Filter by search
        if (filters.search) {
            const search = filters.search.toLowerCase()
            filtered = filtered.filter(e => 
                e.name.toLowerCase().includes(search) ||
                JSON.stringify(e.properties).toLowerCase().includes(search)
            )
        }

        // Sort by timestamp descending (newest first)
        filtered.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        setFilteredEvents(filtered)
    }

    const calculateStats = () => {
        // Use filteredEvents for stats to match what's displayed
        const eventsToCount = filters.type === 'all' && filters.dateRange === 'all' && !filters.search 
            ? events 
            : filteredEvents
            
        const uniqueSessions = new Set(eventsToCount.map(e => e.sessionId)).size
        
        setStats({
            totalEvents: eventsToCount.length,
            pageViews: eventsToCount.filter(e => e.type === 'pageview').length,
            clicks: eventsToCount.filter(e => e.type === 'click').length,
            forms: eventsToCount.filter(e => e.type === 'form').length,
            errors: eventsToCount.filter(e => e.type === 'error').length,
            uniqueSessions
        })
    }

    const exportData = () => {
        const data = filteredEvents.map(event => ({
            id: event.id,
            type: event.type,
            name: event.name,
            timestamp: new Date(event.timestamp || 0).toISOString(),
            sessionId: event.sessionId,
            userId: event.userId || 'anonymous',
            ...event.properties
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
        
        track('Analytics Data Exported', { 
            eventCount: data.length,
            filters 
        })
    }

    const clearData = () => {
        if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
            analyticsStorage.clear()
            loadEvents()
            track('Analytics Data Cleared')
        }
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

    const EventRow = ({ event }) => {
        const [expanded, setExpanded] = useState(false)
        const time = new Date(event.timestamp || 0).toLocaleTimeString()
        const date = new Date(event.timestamp || 0).toLocaleDateString()

        const getEventIcon = () => {
            switch (event.type) {
                case 'pageview': return <FileText className="h-4 w-4" />
                case 'click': return <MousePointer className="h-4 w-4" />
                case 'form': return <FileText className="h-4 w-4" />
                case 'error': return <Activity className="h-4 w-4 text-red-500" />
                default: return <Activity className="h-4 w-4" />
            }
        }

        return (
            <div className="border-b border-[#00FF89]/10">
                <div 
                    className="p-4 hover:bg-[#00FF89]/5 cursor-pointer transition-colors"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {getEventIcon()}
                            <div>
                                <p className="font-medium text-white font-kumbh-sans">{event.name}</p>
                                <p className="text-sm text-gray-400 font-kumbh-sans">
                                    {event.type} • {time} • {date}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-[#121212] border border-[#00FF89]/20 rounded font-kumbh-sans">
                                {event.sessionId.substring(0, 8)}
                            </span>
                            {event.userId && (
                                <span className="px-2 py-1 bg-[#00FF89]/10 text-[#00FF89] rounded font-kumbh-sans">
                                    User: {event.userId}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                
                {expanded && (
                    <div className="px-4 pb-4 bg-[#121212]">
                        <pre className="text-xs text-gray-400 overflow-x-auto font-mono p-4 bg-[#1f1f1f] rounded-lg border border-[#00FF89]/10">
                            {JSON.stringify(event.properties, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 font-league-spartan">
                    Analytics Dashboard
                </h1>
                <p className="text-gray-400 font-kumbh-sans">
                    Track user interactions, page views, and system events
                </p>
            </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <StatCard 
                        icon={BarChart3} 
                        label="Total Events" 
                        value={stats.totalEvents}
                        color="#00FF89"
                    />
                    <StatCard 
                        icon={FileText} 
                        label="Page Views" 
                        value={stats.pageViews}
                        color="#00FF89"
                    />
                    <StatCard 
                        icon={MousePointer} 
                        label="Clicks" 
                        value={stats.clicks}
                        color="#FFC050"
                    />
                    <StatCard 
                        icon={FileText} 
                        label="Form Events" 
                        value={stats.forms}
                        color="#FFC050"
                    />
                    <StatCard 
                        icon={Activity} 
                        label="Errors" 
                        value={stats.errors}
                        color="#ff5555"
                    />
                    <StatCard 
                        icon={Users} 
                        label="Sessions" 
                        value={stats.uniqueSessions}
                        color="#00FF89"
                    />
                </div>

                {/* Filters */}
                <div className="bg-[#1f1f1f] rounded-lg p-4 mb-6 border border-[#00FF89]/10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 font-kumbh-sans">
                                Event Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                                className="w-full bg-[#121212] text-white rounded px-3 py-2 border border-[#00FF89]/20 focus:border-[#00FF89] focus:outline-none font-kumbh-sans"
                            >
                                <option value="all">All Types</option>
                                <option value="pageview">Page Views</option>
                                <option value="click">Clicks</option>
                                <option value="form">Forms</option>
                                <option value="custom">Custom</option>
                                <option value="error">Errors</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 font-kumbh-sans">
                                Date Range
                            </label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                                className="w-full bg-[#121212] text-white rounded px-3 py-2 border border-[#00FF89]/20 focus:border-[#00FF89] focus:outline-none font-kumbh-sans"
                            >
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                                <option value="month">Last 30 Days</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm text-gray-400 mb-1 font-kumbh-sans">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search events..."
                                className="w-full bg-[#121212] text-white rounded px-3 py-2 border border-[#00FF89]/20 focus:border-[#00FF89] focus:outline-none font-kumbh-sans"
                            />
                        </div>
                        
                        <div className="flex items-end space-x-2">
                            <button
                                onClick={exportData}
                                className="flex-1 bg-[#00FF89] hover:bg-[#00FF89]/90 text-[#121212] rounded px-4 py-2 flex items-center justify-center space-x-2 transition-colors font-medium font-kumbh-sans"
                            >
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={clearData}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-medium font-kumbh-sans"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="bg-[#1f1f1f] rounded-lg border border-[#00FF89]/10 overflow-hidden">
                    <div className="p-4 border-b border-[#00FF89]/10 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white flex items-center space-x-2 font-league-spartan">
                            <Activity className="h-5 w-5" />
                            <span>Event Stream ({filteredEvents.length} events)</span>
                        </h2>
                        <button
                            onClick={loadEvents}
                            className="text-[#00FF89] hover:text-[#00FF89]/80 text-sm font-medium flex items-center gap-1 font-kumbh-sans">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                    
                    <div className="max-h-[600px] overflow-y-auto">
                        {filteredEvents.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No events found matching your filters
                            </div>
                        ) : (
                            filteredEvents.map(event => (
                                <EventRow key={event.id} event={event} />
                            ))
                        )}
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="mt-8 p-4 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-lg">
                    <p className="text-sm text-[#00FF89] font-kumbh-sans">
                        <Shield className="inline h-4 w-4 mr-2" />
                        <strong>Privacy Notice:</strong> All analytics data is stored locally in your browser. 
                        No personal information is sent to external servers without your consent.
                    </p>
                </div>
        </div>
    )
}