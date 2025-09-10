import { useEffect, useState, useRef } from 'react'

export function useHeroPerformance() {
  const [metrics, setMetrics] = useState({
    fcp: null,
    lcp: null,
    cls: null,
    tti: null,
    loadTime: null
  })
  const observersRef = useRef([])

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Track First Contentful Paint
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }))
        }
      })
    })

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      if (lastEntry) {
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }))
      }
    })

    // Track Cumulative Layout Shift with proper cleanup
    let clsScore = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsScore += entry.value
        }
      }
      setMetrics(prev => ({ ...prev, cls: clsScore }))
    })

    try {
      if ('PerformanceObserver' in window) {
        fcpObserver.observe({ entryTypes: ['paint'] })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
        
        // Store observers for cleanup
        observersRef.current = [fcpObserver, lcpObserver, clsObserver]
      }
    } catch (error) {
      console.warn('Performance observers not supported:', error)
    }

    // Track page load time with single event listener
    const handleLoad = () => {
      const loadTime = performance.now()
      setMetrics(prev => ({ ...prev, loadTime }))
    }

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

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