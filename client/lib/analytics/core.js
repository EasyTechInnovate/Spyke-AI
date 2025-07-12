import posthog from 'posthog-js'
import { track as vercelTrack } from '@vercel/analytics'
import { ANALYTICS_CONFIG } from './config'
import { analyticsStorage } from './storage'
import { EventType } from './types'
import { 
  generateId, 
  getSessionId, 
  getUserId, 
  shouldTrackUser, 
  sanitizeProperties,
  getPageMetadata,
  debounce
} from './utils'

class Analytics {
  constructor() {
    this.initialized = false
    this.queue = []
    this.batchTimer = null
    this.isOnline = true
    
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
    }
  }

  setupEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processBatch()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
    
    // Process batch on page unload
    window.addEventListener('beforeunload', () => {
      this.processBatch(true)
    })
  }

  init() {
    if (this.initialized || typeof window === 'undefined') return

    try {
      // Initialize PostHog
      if (ANALYTICS_CONFIG.posthog.apiKey) {
        posthog.init(ANALYTICS_CONFIG.posthog.apiKey, {
          api_host: ANALYTICS_CONFIG.posthog.apiHost,
          capture_pageview: false, // We'll handle this manually
          capture_pageleave: true,
          persistence: 'localStorage',
          autocapture: false, // We'll handle this manually for better control
        })
      }

      // Load queued events
      const storedEvents = analyticsStorage.getEvents()
      if (storedEvents.length > 0) {
        this.queue.push(...storedEvents)
        this.scheduleBatch()
      }

      this.initialized = true
      
      if (ANALYTICS_CONFIG.debug) {
        console.log('Analytics initialized')
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error)
    }
  }

  identify(userId, properties) {
    if (!shouldTrackUser()) return

    try {
      const sanitized = properties ? sanitizeProperties(properties) : {}
      
      // Store user ID locally
      if (typeof window !== 'undefined') {
        localStorage.setItem('userId', userId)
      }
      
      // Identify in PostHog
      if (posthog) {
        posthog.identify(userId, sanitized)
      }
      
      // Track identification event
      this.track('User Identified', {
        ...sanitized,
        timestamp: Date.now(),
      })
    } catch (error) {
      console.error('Failed to identify user:', error)
    }
  }

  track(eventName, properties) {
    if (!shouldTrackUser()) {
      if (ANALYTICS_CONFIG.debug) {
        console.log('Analytics tracking disabled by user preference')
      }
      return
    }

    try {
      const event = {
        id: generateId(),
        type: 'custom',
        name: eventName,
        properties: {
          ...getPageMetadata(),
          ...sanitizeProperties(properties || {}),
        },
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userId: getUserId() || undefined,
      }

      this.addToQueue(event)
      
      // Also track with Vercel Analytics
      vercelTrack(eventName, event.properties)
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  trackPageView(data) {
    if (!shouldTrackUser() || !ANALYTICS_CONFIG.events.autoTrack.pageViews) return

    try {
      const event = {
        id: generateId(),
        type: 'pageview',
        name: 'Page View',
        properties: {
          ...getPageMetadata(),
          ...data,
        },
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userId: getUserId() || undefined,
      }

      this.addToQueue(event)
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  trackClick(element, data) {
    if (!shouldTrackUser() || !ANALYTICS_CONFIG.events.autoTrack.clicks) return

    try {
      const clickData = {
        element: element.tagName.toLowerCase(),
        elementType: element.getAttribute('type') || '',
        elementId: element.id || undefined,
        elementClass: element.className || undefined,
        text: (element.textContent || '').trim().substring(0, 100),
        href: element.getAttribute('href') || undefined,
        timestamp: Date.now(),
        ...data,
      }

      const event = {
        id: generateId(),
        type: 'click',
        name: 'Element Click',
        properties: {
          ...getPageMetadata(),
          ...clickData,
        },
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userId: getUserId() || undefined,
      }

      this.addToQueue(event)
    } catch (error) {
      console.error('Failed to track click:', error)
    }
  }

  trackForm(formData) {
    if (!shouldTrackUser() || !ANALYTICS_CONFIG.events.autoTrack.forms) return

    try {
      const event = {
        id: generateId(),
        type: 'form',
        name: `Form ${formData.action}`,
        properties: {
          ...getPageMetadata(),
          ...formData,
        },
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userId: getUserId() || undefined,
      }

      this.addToQueue(event)
    } catch (error) {
      console.error('Failed to track form:', error)
    }
  }

  trackError(error) {
    if (!shouldTrackUser() || !ANALYTICS_CONFIG.events.autoTrack.errors) return

    try {
      const errorData = error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        timestamp: Date.now(),
      } : error

      const event = {
        id: generateId(),
        type: 'error',
        name: 'Error',
        properties: {
          ...getPageMetadata(),
          ...errorData,
        },
        timestamp: Date.now(),
        sessionId: getSessionId(),
        userId: getUserId() || undefined,
      }

      this.addToQueue(event)
      
      // Process errors immediately
      this.processBatch()
    } catch (err) {
      console.error('Failed to track error:', err)
    }
  }

  addToQueue(event) {
    this.queue.push(event)
    
    if (ANALYTICS_CONFIG.debug) {
      console.log('Analytics event queued:', event)
    }
    
    // Store in local storage
    analyticsStorage.addEvent(event)
    
    // Schedule batch processing
    if (this.queue.length >= ANALYTICS_CONFIG.batchSize) {
      this.processBatch()
    } else {
      this.scheduleBatch()
    }
  }

  scheduleBatch() {
    if (this.batchTimer) return
    
    this.batchTimer = setTimeout(() => {
      this.processBatch()
    }, ANALYTICS_CONFIG.batchInterval)
  }

  processBatch = debounce(async (forceSend = false) => {
    if (!this.isOnline && !forceSend) return
    if (this.queue.length === 0) return
    
    const events = [...this.queue]
    this.queue = []
    
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    
    try {
      // Send to PostHog
      if (posthog) {
        events.forEach(event => {
          posthog.capture(event.name, event.properties)
        })
      }
      
      // Remove successfully sent events from storage
      const eventIds = events.map(e => e.id)
      analyticsStorage.removeEvents(eventIds)
      
      if (ANALYTICS_CONFIG.debug) {
        console.log(`Analytics batch sent: ${events.length} events`)
      }
    } catch (error) {
      console.error('Failed to send analytics batch:', error)
      // Re-add events to queue on failure
      this.queue.unshift(...events)
      this.scheduleBatch()
    }
  }, 100)

  // Consent management
  setConsent(consent) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('analytics_consent', consent ? 'granted' : 'denied')
    
    if (!consent) {
      // Clear all analytics data
      analyticsStorage.clear()
      this.queue = []
      
      // Opt out of PostHog
      if (posthog) {
        posthog.opt_out_capturing()
      }
    } else {
      // Opt back in
      if (posthog) {
        posthog.opt_in_capturing()
      }
    }
  }

  getConsent() {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('analytics_consent') !== 'denied'
  }
}

export const analytics = new Analytics()