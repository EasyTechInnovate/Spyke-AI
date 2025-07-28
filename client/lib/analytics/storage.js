import { ANALYTICS_CONFIG } from './config'

class AnalyticsStorage {
  constructor() {
    this.memoryQueue = []
  }

  getEvents() {
    if (typeof window === 'undefined') return this.memoryQueue

    try {
      const stored = localStorage.getItem(ANALYTICS_CONFIG.storageKey)
      const events = stored ? JSON.parse(stored) : []
      return [...events, ...this.memoryQueue]
    } catch (error) {
      // Failed to get analytics events
      return this.memoryQueue
    }
  }

  addEvent(event) {
    if (typeof window === 'undefined') {
      this.memoryQueue.push(event)
      return
    }

    try {
      const events = this.getEvents()
      events.push(event)
      
      // Limit stored events
      const limitedEvents = events.slice(-ANALYTICS_CONFIG.maxStoredEvents)
      
      localStorage.setItem(ANALYTICS_CONFIG.storageKey, JSON.stringify(limitedEvents))
      this.memoryQueue = []
    } catch (error) {
      // Failed to store analytics event
      this.memoryQueue.push(event)
    }
  }

  removeEvents(eventIds) {
    if (typeof window === 'undefined') {
      this.memoryQueue = this.memoryQueue.filter(e => !eventIds.includes(e.id))
      return
    }

    try {
      const events = this.getEvents()
      const remaining = events.filter(e => !eventIds.includes(e.id))
      localStorage.setItem(ANALYTICS_CONFIG.storageKey, JSON.stringify(remaining))
      this.memoryQueue = []
    } catch (error) {
      // Failed to remove analytics events
    }
  }

  clear() {
    if (typeof window === 'undefined') {
      this.memoryQueue = []
      return
    }

    try {
      localStorage.removeItem(ANALYTICS_CONFIG.storageKey)
      this.memoryQueue = []
    } catch (error) {
      // Failed to clear analytics events
    }
  }
}

export const analyticsStorage = new AnalyticsStorage()