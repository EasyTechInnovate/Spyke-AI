import { useEffect, useState, useRef } from 'react'

export function useHeroPerformance() {
  const [metrics, setMetrics] = useState({
    fcp: null,
    lcp: null,
    cls: null,
    tti: null,
    loadTime: null,
    renderTime: null,
    interactionDelay: null
  })
  const observersRef = useRef([])
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    let clsScore = 0

    // Track First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: Math.round(entry.startTime) }))
        }
      })
    })

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: Math.round(lastEntry.startTime) }))
      }
    })

    // Track Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      setMetrics(prev => ({ ...prev, cls: Math.round(clsScore * 1000) / 1000 }))
    })

    // Track First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        setMetrics(prev => ({ 
          ...prev, 
          interactionDelay: Math.round(entry.processingStart - entry.startTime) 
        }))
      })
    })

    try {
      if ('PerformanceObserver' in window) {
        fcpObserver.observe({ entryTypes: ['paint'] })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        fidObserver.observe({ entryTypes: ['first-input'] })
        
        // Store observers for cleanup
        observersRef.current = [fcpObserver, lcpObserver, clsObserver, fidObserver]
      }
    } catch (error) {
      console.warn('Performance observers not supported:', error)
    }

    // Track component render time
    const renderStart = performance.now()
    const trackRenderTime = () => {
      const renderEnd = performance.now()
      const renderTime = renderEnd - renderStart
      setMetrics(prev => ({ ...prev, renderTime: Math.round(renderTime) }))
    }

    // Track page load time
    const handleLoad = () => {
      const loadTime = performance.now() - startTimeRef.current
      setMetrics(prev => ({ ...prev, loadTime: Math.round(loadTime) }))
      trackRenderTime()
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

    // Track Time to Interactive (simplified)
    const trackTTI = () => {
      if (document.readyState === 'complete') {
        const tti = performance.now()
        setMetrics(prev => ({ ...prev, tti: Math.round(tti) }))
      }
    }

    setTimeout(trackTTI, 100) // Delay to ensure page is interactive

    // Cleanup function
    return () => {
      observersRef.current.forEach(observer => {
        try {
          observer.disconnect()
        } catch (error) {
          console.warn('Error disconnecting observer:', error)
        }
      })
      observersRef.current = []
    }
  }, []) // Empty dependency array - run once on mount

  return metrics
}

// Performance utility functions
export const performanceUtils = {
  // Report performance metrics to analytics
  reportMetrics: (metrics) => {
    if (typeof window !== 'undefined' && window.gtag) {
      Object.entries(metrics).forEach(([key, value]) => {
        if (value !== null) {
          window.gtag('event', 'performance_metric', {
            metric_name: key,
            value: value,
            custom_parameter: true
          })
        }
      })
    }
  },

  // Get performance grade
  getPerformanceGrade: (metrics) => {
    const { fcp, lcp, cls, interactionDelay } = metrics
    
    let score = 0
    let total = 0

    // FCP scoring (good: <1.8s, needs improvement: <3s, poor: ≥3s)
    if (fcp !== null) {
      if (fcp < 1800) score += 100
      else if (fcp < 3000) score += 50
      total += 100
    }

    // LCP scoring (good: <2.5s, needs improvement: <4s, poor: ≥4s)
    if (lcp !== null) {
      if (lcp < 2500) score += 100
      else if (lcp < 4000) score += 50
      total += 100
    }

    // CLS scoring (good: <0.1, needs improvement: <0.25, poor: ≥0.25)
    if (cls !== null) {
      if (cls < 0.1) score += 100
      else if (cls < 0.25) score += 50
      total += 100
    }

    // FID scoring (good: <100ms, needs improvement: <300ms, poor: ≥300ms)
    if (interactionDelay !== null) {
      if (interactionDelay < 100) score += 100
      else if (interactionDelay < 300) score += 50
      total += 100
    }

    const percentage = total > 0 ? (score / total) * 100 : 0
    
    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  },

  // Format metrics for display
  formatMetrics: (metrics) => {
    return {
      ...metrics,
      fcp: metrics.fcp ? `${metrics.fcp}ms` : 'N/A',
      lcp: metrics.lcp ? `${metrics.lcp}ms` : 'N/A',
      cls: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
      tti: metrics.tti ? `${metrics.tti}ms` : 'N/A',
      loadTime: metrics.loadTime ? `${metrics.loadTime}ms` : 'N/A',
      renderTime: metrics.renderTime ? `${metrics.renderTime}ms` : 'N/A',
      interactionDelay: metrics.interactionDelay ? `${metrics.interactionDelay}ms` : 'N/A'
    }
  }
}