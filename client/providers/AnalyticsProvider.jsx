'use client'

import React, { createContext, useContext, useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { analytics } from '@/lib/analytics/simple-core'
import { setupAutoTracking } from '@/lib/analytics/simple-auto-track'

const AnalyticsContext = createContext(null)

// Internal component that uses search params
function AnalyticsTracker({ children, userId, userProperties }) {
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
  }, [userId, userProperties])

  // Track page views on route change
  useEffect(() => {
    analytics.trackPageView('success')
  }, [pathname, searchParams])

  return children
}

export function AnalyticsProvider({ children, userId, userProperties }) {
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
      <Suspense fallback={null}>
        <AnalyticsTracker userId={userId} userProperties={userProperties}>
          {children}
        </AnalyticsTracker>
      </Suspense>
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