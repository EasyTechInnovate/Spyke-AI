'use client'

import React, { useState, useEffect } from 'react'
import { X, Activity, Trash2 } from 'lucide-react'
import { ANALYTICS_CONFIG } from '@/lib/analytics/config'

export default function AnalyticsDebugPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [events, setEvents] = useState([])
    const [isMinimized, setIsMinimized] = useState(false)

    useEffect(() => {
        if (!ANALYTICS_CONFIG.debug) return

        // Listen for analytics events via custom event
        const handleAnalyticsEvent = (e) => {
            setEvents(prev => [...prev, { ...e.detail, timestamp: Date.now() }].slice(-50)) // Keep last 50 events
        }

        window.addEventListener('analytics:event', handleAnalyticsEvent)
        
        return () => {
            window.removeEventListener('analytics:event', handleAnalyticsEvent)
        }
    }, [])

    // Only show in debug mode
    if (!ANALYTICS_CONFIG.debug) return null

    return (
        <>
            {/* Floating Debug Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 bg-[#00FF89] text-[#121212] p-3 rounded-full shadow-lg hover:bg-[#00FF89]/90 transition-colors"
                title="Open Analytics Debug Panel"
            >
                <Activity className="h-5 w-5" />
            </button>

            {/* Debug Panel */}
            {isOpen && (
                <div className={`fixed ${isMinimized ? 'bottom-4 right-4 w-80' : 'inset-4'} z-50 bg-[#1f1f1f] border border-[#00FF89]/20 rounded-lg shadow-2xl flex flex-col transition-all`}>
                    {/* Header */}
                    <div className="p-4 border-b border-[#00FF89]/20 flex items-center justify-between">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                            <Activity className="h-4 w-4 text-[#00FF89]" />
                            Analytics Debug Panel
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setEvents([])}
                                className="text-gray-400 hover:text-white p-1"
                                title="Clear events"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                {isMinimized ? '□' : '_'}
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[600px]">
                            {events.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No events tracked yet</p>
                            ) : (
                                events.map((event, index) => (
                                    <div key={index} className="bg-[#121212] p-3 rounded border border-[#00FF89]/10 text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-[#00FF89]">{event.type}</span>
                                            <span className="text-gray-500 text-xs">
                                                {new Date(event.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-white mb-1">{event.name}</p>
                                        {event.properties && (
                                            <pre className="text-xs text-gray-400 overflow-x-auto">
                                                {JSON.stringify(event.properties, null, 2)}
                                            </pre>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Status Bar */}
                    <div className="p-2 border-t border-[#00FF89]/20 text-xs text-gray-400">
                        <div className="flex justify-between">
                            <span>Events: {events.length}</span>
                            <span>Debug Mode Active</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}