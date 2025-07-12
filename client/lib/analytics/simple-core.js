import { ANALYTICS_CONFIG } from './config'
import { analyticsApi } from '../api/analytics'
import { ANALYTICS_EVENTS } from './events'
import { 
  getSessionId, 
  getUserId,
  getPageMetadata,
  sanitizeProperties
} from './utils'

export class SimpleAnalytics {
  constructor() {
    this.queue = []
    this.isInitialized = false
    this.config = ANALYTICS_CONFIG
    this.sessionId = getSessionId()
    this.userId = getUserId()
    this.sending = false
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return
    
    this.isInitialized = true
    
    // Send queued events on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })
      
      // Only send events on page unload or manual flush
      // Remove automatic sending to prevent unwanted API calls
    }
    
    // Analytics initialized in debug mode
  }

  // Track page view with success/error status
  trackPageView(status = 'success', errorMessage = null) {
    if (!this.getConsent()) return
    
    const pageInfo = getPageMetadata()
    const eventName = status === 'success' ? ANALYTICS_EVENTS.PAGE.VIEW : ANALYTICS_EVENTS.PAGE.ERROR
    
    const event = {
      type: 'pageview',
      name: eventName,
      sessionId: this.sessionId,
      properties: {
        ...pageInfo,
        status,
        errorMessage,
        timestamp: Date.now()
      }
    }
    
    this.addToQueue(event)
  }

  // Track click events
  trackClick(element, additionalData = {}) {
    if (!this.getConsent()) return
    
    // Get click target info
    const selector = this.getSelector(element)
    const text = (element.textContent || '').trim().substring(0, 50)
    const href = element.getAttribute('href') || element.closest('a')?.getAttribute('href')
    
    const event = {
      type: 'click',
      name: `Click - ${text || selector}`,
      sessionId: this.sessionId,
      properties: {
        selector,
        text,
        href,
        ...getPageMetadata(),
        ...sanitizeProperties(additionalData),
        timestamp: Date.now()
      }
    }
    
    this.addToQueue(event)
  }

  // Track errors
  trackError(error) {
    if (!this.getConsent()) return
    
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack
    } : { message: String(error) }
    
    const event = {
      type: 'error',
      name: `Error - ${errorData.message}`,
      sessionId: this.sessionId,
      properties: {
        ...errorData,
        ...getPageMetadata(),
        timestamp: Date.now()
      }
    }
    
    this.addToQueue(event)
    // Send errors immediately
    this.processBatch()
  }

  // Get element selector
  getSelector(element) {
    if (element.id) return `#${element.id}`
    if (element.className) return `.${element.className.split(' ')[0]}`
    return element.tagName.toLowerCase()
  }

  // Add event to queue
  addToQueue(event) {
    this.queue.push(event)
    
    if (ANALYTICS_CONFIG.debug) {
      // Dispatch custom event for debug panel
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('analytics:event', { 
          detail: event 
        }))
      }
    }
    
    // Only send immediately if queue is getting very large to prevent memory issues
    if (this.queue.length >= 50) {
      this.processBatch()
    }
    // Don't schedule automatic sends - only send on page unload or manual flush
  }

  // Process and send batch
  async processBatch() {
    if (this.sending || this.queue.length === 0) return
    
    this.sending = true
    const events = [...this.queue]
    this.queue = []
    
    try {
      await analyticsApi.sendEvents(events)
      
      // Events sent successfully
    } catch (error) {
      // On error, add events back to queue but don't retry automatically
      this.queue.unshift(...events)
    } finally {
      this.sending = false
    }
  }

  // Flush all events
  async flush() {
    await this.processBatch()
  }

  // Identify user
  identify(userId) {
    this.userId = userId
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', userId)
    }
  }

  // Consent management
  setConsent(consent) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('analytics_consent', consent ? 'accepted' : 'denied')
    
    if (!consent) {
      // Clear queue if consent withdrawn
      this.queue = []
    }
  }

  getConsent() {
    if (typeof window === 'undefined') return false
    
    // Check if analytics is enabled in config
    if (!ANALYTICS_CONFIG.enabled) return false
    
    // Check user consent
    const consent = localStorage.getItem('analytics_consent')
    return consent !== 'denied'
  }
}

// Export singleton instance
export const analytics = new SimpleAnalytics()