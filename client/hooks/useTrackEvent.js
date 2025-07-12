import { useCallback } from 'react'
import { useAnalytics } from '@/providers/AnalyticsProvider'

export function useTrackEvent() {
  const { track } = useAnalytics()
  
  const trackEvent = useCallback((eventName, properties) => {
    track(eventName, properties)
  }, [track])
  
  return trackEvent
}

export function useTrackClick(eventName, properties) {
  const { trackClick } = useAnalytics()
  
  return useCallback((event) => {
    const target = event?.currentTarget
    if (target) {
      trackClick(target, {
        eventName,
        ...properties
      })
    }
  }, [eventName, properties, trackClick])
}

export function useTrackView(eventName, properties) {
  const trackEvent = useTrackEvent()
  
  const trackView = useCallback(() => {
    trackEvent(eventName, {
      viewedAt: new Date().toISOString(),
      ...properties
    })
  }, [eventName, properties, trackEvent])
  
  return trackView
}

export function useTrackForm(formName) {
  const trackEvent = useTrackEvent()
  
  const trackFormStart = useCallback(() => {
    trackEvent('Form Started', {
      formName,
      startedAt: new Date().toISOString()
    })
  }, [formName, trackEvent])
  
  const trackFormSubmit = useCallback((data) => {
    trackEvent('Form Submitted', {
      formName,
      submittedAt: new Date().toISOString(),
      ...data
    })
  }, [formName, trackEvent])
  
  const trackFormError = useCallback((errors) => {
    trackEvent('Form Error', {
      formName,
      errors,
      errorAt: new Date().toISOString()
    })
  }, [formName, trackEvent])
  
  return {
    trackFormStart,
    trackFormSubmit,
    trackFormError
  }
}