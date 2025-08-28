import { useEffect, useRef, useCallback } from 'react'

/**
 * Performance monitoring hook for review components
 * Tracks render times, re-renders, and user interactions
 */
export function useReviewPerformance(componentName, enabled = process.env.NODE_ENV === 'development') {
    const renderCount = useRef(0)
    const lastRenderTime = useRef(Date.now())
    const interactionTimes = useRef([])

    // Track component renders
    useEffect(() => {
        if (!enabled) return

        renderCount.current += 1
        const now = Date.now()
        const timeSinceLastRender = now - lastRenderTime.current
        lastRenderTime.current = now

        if (renderCount.current > 1) {
            console.log(`[Performance] ${componentName} re-render #${renderCount.current} (${timeSinceLastRender}ms since last render)`)
        }
    })

    // Track interaction responsiveness
    const trackInteraction = useCallback((interactionType, startTime = Date.now()) => {
        if (!enabled) return () => {}

        return () => {
            const duration = Date.now() - startTime
            interactionTimes.current.push({ type: interactionType, duration })
            
            if (duration > 100) { // Flag slow interactions
                console.warn(`[Performance] Slow ${interactionType} in ${componentName}: ${duration}ms`)
            }
            
            // Keep only last 10 interactions
            if (interactionTimes.current.length > 10) {
                interactionTimes.current = interactionTimes.current.slice(-10)
            }
        }
    }, [componentName, enabled])

    // Performance summary
    const getPerformanceReport = useCallback(() => {
        if (!enabled) return null

        const avgInteractionTime = interactionTimes.current.length > 0
            ? interactionTimes.current.reduce((sum, i) => sum + i.duration, 0) / interactionTimes.current.length
            : 0

        return {
            componentName,
            totalRenders: renderCount.current,
            avgInteractionTime: Math.round(avgInteractionTime),
            recentInteractions: interactionTimes.current.slice(-5)
        }
    }, [componentName, enabled])

    return {
        trackInteraction,
        getPerformanceReport,
        renderCount: renderCount.current
    }
}