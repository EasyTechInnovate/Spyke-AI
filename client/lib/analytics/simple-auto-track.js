import { analytics } from './simple-core'

export function setupAutoTracking() {
  if (typeof window === 'undefined') return
  
  // Track page views
  trackPageView()
  
  // Track clicks
  setupClickTracking()
  
  // Track errors
  setupErrorTracking()
}

function trackPageView() {
  // Track initial page view
  window.addEventListener('load', () => {
    analytics.trackPageView('success')
  })
  
  // Track page errors
  window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes(window.location.origin)) {
      analytics.trackPageView('error', event.message)
    }
  })
}

function setupClickTracking() {
  // Use event delegation for better performance
  document.addEventListener('click', (event) => {
    const target = event.target
    
    // Check if we should track this element
    const clickableElements = ['a', 'button', '[role="button"]', '[data-track-click]']
    const shouldTrack = clickableElements.some(selector => {
      return target.matches(selector) || target.closest(selector)
    })
    
    if (shouldTrack) {
      const element = clickableElements
        .map(selector => target.matches(selector) ? target : target.closest(selector))
        .find(el => el)
      
      if (element) {
        analytics.trackClick(element)
      }
    }
  }, true)
}

function setupErrorTracking() {
  // Track unhandled errors
  window.addEventListener('error', (event) => {
    analytics.trackError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })
  
  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError({
      message: `Unhandled Promise Rejection: ${event.reason}`,
      reason: event.reason
    })
  })
}