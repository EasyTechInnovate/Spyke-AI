'use client'

import React, { useState, useEffect } from 'react'
import { X, Shield, BarChart3 } from 'lucide-react'
import { useAnalytics } from '@/providers/AnalyticsProvider'

export default function ConsentBanner() {
    const [show, setShow] = useState(false)
    const { setConsent, getConsent } = useAnalytics()

    useEffect(() => {
        // Check if consent has been given
        const hasConsent = localStorage.getItem('analytics_consent')
        if (!hasConsent) {
            setShow(true)
        }
    }, [])

    const handleAccept = () => {
        setConsent(true)
        setShow(false)
    }

    const handleDecline = () => {
        setConsent(false)
        setShow(false)
    }

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                        <Shield className="h-6 w-6 text-brand-primary flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-white font-semibold mb-1">
                                Privacy & Analytics
                            </h3>
                            <p className="text-sm text-gray-400 max-w-2xl">
                                We use privacy-focused analytics to improve your experience. 
                                No personal data is collected without your consent. All data is stored locally in your browser.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleDecline}
                            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Decline
                        </button>
                        <button
                            onClick={handleAccept}
                            className="px-6 py-2 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary-hover transition-colors"
                        >
                            Accept Analytics
                        </button>
                        <button
                            onClick={() => setShow(false)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}