import { ANALYTICS_CONFIG } from './config'

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

export function getSessionId() {
  if (typeof window === 'undefined') return ''
  
  let sessionId = sessionStorage.getItem(ANALYTICS_CONFIG.sessionKey)
  if (!sessionId) {
    sessionId = generateId()
    sessionStorage.setItem(ANALYTICS_CONFIG.sessionKey, sessionId)
  }
  return sessionId
}

export function getUserId() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('userId') || null
}

export function shouldTrackUser() {
  if (!ANALYTICS_CONFIG.enabled) return false
  if (typeof window === 'undefined') return false
  
  // Respect Do Not Track
  if (ANALYTICS_CONFIG.respectDoNotTrack && navigator.doNotTrack === '1') {
    return false
  }
  
  // Check for consent - if no consent is set, allow tracking (will show banner)
  const consent = localStorage.getItem('analytics_consent')
  if (consent === 'denied') return false
  
  return true
}

export function sanitizeProperties(properties) {
  const sanitized = {}
  
  for (const [key, value] of Object.entries(properties)) {
    // Skip sensitive keys
    if (['password', 'token', 'secret', 'api_key', 'apiKey'].includes(key.toLowerCase())) {
      continue
    }
    
    // Sanitize values
    if (typeof value === 'string') {
      // Remove potential sensitive patterns
      sanitized[key] = value.replace(/\b(?:\d{4}[\s-]?){3}\d{4}\b/g, '[REDACTED]') // Credit cards
                           .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]') // Emails
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeProperties(value)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

export function getElementSelector(element) {
  const parts = []
  
  while (element && element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase()
    
    if (element.id) {
      selector += `#${element.id}`
      parts.unshift(selector)
      break
    } else if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).join('.')
      if (classes) selector += `.${classes}`
    }
    
    parts.unshift(selector)
    element = element.parentNode
  }
  
  return parts.join(' > ')
}

export function getPageMetadata() {
  if (typeof window === 'undefined') return {}
  
  return {
    url: window.location.href,
    path: window.location.pathname,
    referrer: document.referrer,
    title: document.title,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    userAgent: navigator.userAgent,
    language: navigator.language,
  }
}

export function debounce(func, wait) {
  let timeout = null
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return {}
  
  const navigation = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  
  const metrics = {}
  
  if (navigation) {
    metrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart
    metrics.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart
    metrics.responseTime = navigation.responseEnd - navigation.requestStart
  }
  
  paint.forEach(entry => {
    if (entry.name === 'first-contentful-paint') {
      metrics.firstContentfulPaint = entry.startTime
    }
  })
  
  return metrics
}