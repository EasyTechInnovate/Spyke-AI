import { useEffect, useState } from 'react'

export function useHeroPerformance() {
  const [metrics, setMetrics] = useState({
    fcp: null,
    lcp: null,
    cls: null,
    tti: null,
    loadTime: null
  })

  useEffect(() => {
    // Track First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
        }
      })
    })

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      observer.observe({ entryTypes: ['paint'] })
    }

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
    })

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    }

    // Track Cumulative Layout Shift
    let clsScore = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsScore }))
    })

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }

    // Track page load time
    const handleLoad = () => {
      const loadTime = performance.now()
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    // Cleanup
    return () => {
      observer.disconnect()
      lcpObserver.disconnect()
      clsObserver.disconnect()
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return metrics
}