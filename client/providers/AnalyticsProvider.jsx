'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics/simple-core'
import { setupAutoTracking } from '@/lib/analytics/simple-auto-track'

const AnalyticsContext = createContext(null)

export function AnalyticsProvider({ children, userId, userProperties }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize analytics
    analytics.init()
    
    // Setup auto-tracking
    setupAutoTracking()
    
    // Identify user if provided
    if (userId) {
      analytics.identify(userId, userProperties)
    }
    
    // Analytics provider initialized
  }, [])

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView('success')
  }, [pathname, searchParams])

  const contextValue = {
    track: (eventName, properties) => {
      // For simplified analytics, we only track clicks
    },
    trackClick: (element, data) => analytics.trackClick(element, data),
    identify: (userId) => analytics.identify(userId),
    setConsent: (consent) => analytics.setConsent(consent),
    getConsent: () => analytics.getConsent(),
  }

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  )
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    // Return a no-op implementation when outside provider
    return {
      track: () => {},
      trackClick: () => {},
      identify: () => {},
      setConsent: () => {},
      getConsent: () => false
    }
  }
  return context
}