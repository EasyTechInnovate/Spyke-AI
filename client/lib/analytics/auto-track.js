import { analytics } from './core'
import { ANALYTICS_CONFIG } from './config'
import { getElementSelector } from './utils'

export function setupAutoTracking() {
  if (typeof window === 'undefined') return

  // Click tracking
  if (ANALYTICS_CONFIG.events.autoTrack.clicks) {
    document.addEventListener('click', (event) => {
      const target = event.target
      if (!target) return

      // Check if element should be ignored
      const shouldIgnore = ANALYTICS_CONFIG.events.ignoreSelectors.some(selector => 
        target.matches(selector) || target.closest(selector)
      )
      if (shouldIgnore) return

      // Check if element is a trackable target
      const isTrackable = ANALYTICS_CONFIG.events.clickTargets.some(selector =>
        target.matches(selector) || target.closest(selector)
      )
      if (!isTrackable) return

      const trackableElement = ANALYTICS_CONFIG.events.clickTargets
        .map(selector => target.closest(selector))
        .find(el => el) || target

      analytics.trackClick(trackableElement)
    }, true)
  }

  // Form tracking
  if (ANALYTICS_CONFIG.events.autoTrack.forms) {
    // Track form interactions
    const formElements = new WeakMap()

    document.addEventListener('focusin', (event) => {
      const target = event.target
      const form = target.closest('form')
      if (!form) return

      if (!formElements.has(form)) {
        formElements.set(form, {
          startTime: Date.now(),
          fields: new Set()
        })

        analytics.trackForm({
          formId: form.id || getElementSelector(form),
          formName: form.name,
          action: 'start',
          timestamp: Date.now()
        })
      }

      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        const data = formElements.get(form)
        if (data) {
          data.fields.add(target.name || target.id || getElementSelector(target))
        }
      }
    })

    document.addEventListener('submit', (event) => {
      const form = event.target
      if (!form || !(form instanceof HTMLFormElement)) return

      const data = formElements.get(form)
      
      analytics.trackForm({
        formId: form.id || getElementSelector(form),
        formName: form.name,
        action: 'submit',
        fields: data ? Array.from(data.fields) : [],
        timestamp: Date.now()
      })
    })
  }

  // Error tracking
  if (ANALYTICS_CONFIG.events.autoTrack.errors) {
    window.addEventListener('error', (event) => {
      analytics.trackError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        timestamp: Date.now()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      analytics.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: Date.now()
      })
    })
  }

  // Performance tracking
  if (ANALYTICS_CONFIG.events.autoTrack.performance) {
    if ('PerformanceObserver' in window) {
      try {
        // Observe Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          
          analytics.track('Performance Metric', {
            metric: 'LCP',
            value: lastEntry.startTime,
            element: lastEntry.element?.tagName
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // Observe First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            analytics.track('Performance Metric', {
              metric: 'FID',
              value: entry.processingStart - entry.startTime,
              eventType: entry.name
            })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Observe Cumulative Layout Shift
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })

        // Send CLS when page is hidden
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'hidden') {
            analytics.track('Performance Metric', {
              metric: 'CLS',
              value: clsValue
            })
          }
        })
      } catch (error) {
        console.error('Failed to setup performance observers:', error)
      }
    }
  }
}