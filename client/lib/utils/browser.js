/**
 * Safe browser API utilities that work in both SSR and client environments
 */

// Safe localStorage operations
export const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn('localStorage.getItem failed:', error)
      return null
    }
  },
  
  setItem: (key, value) => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('localStorage.setItem failed:', error)
      return false
    }
  },
  
  removeItem: (key) => {
    if (typeof window === 'undefined') return false
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error)
      return false
    }
  }
}

// Safe sessionStorage operations
export const safeSessionStorage = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.warn('sessionStorage.getItem failed:', error)
      return null
    }
  },
  
  setItem: (key, value) => {
    if (typeof window === 'undefined') return false
    try {
      sessionStorage.setItem(key, value)
      return true
    } catch (error) {
      console.warn('sessionStorage.setItem failed:', error)
      return false
    }
  },
  
  removeItem: (key) => {
    if (typeof window === 'undefined') return false
    try {
      sessionStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn('sessionStorage.removeItem failed:', error)
      return false
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return false
    try {
      sessionStorage.clear()
      return true
    } catch (error) {
      console.warn('sessionStorage.clear failed:', error)
      return false
    }
  }
}

// Safe cookie operations
export const safeCookie = {
  set: (name, value, options = '') => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return false
    try {
      document.cookie = `${name}=${value}; ${options}`
      return true
    } catch (error) {
      console.warn('Cookie setting failed:', error)
      return false
    }
  },
  
  get: (name) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null
    try {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop().split(';').shift()
      return null
    } catch (error) {
      console.warn('Cookie reading failed:', error)
      return null
    }
  }
}

// Safe window operations
export const safeWindow = {
  redirect: (url) => {
    if (typeof window === 'undefined') return false
    try {
      window.location.href = url
      return true
    } catch (error) {
      console.warn('Window redirect failed:', error)
      return false
    }
  },
  
  getLocation: () => {
    if (typeof window === 'undefined') return { pathname: '', href: '' }
    return {
      pathname: window.location.pathname,
      href: window.location.href,
      search: window.location.search,
      hash: window.location.hash
    }
  }
}

// Check if we're in browser environment
export const isBrowser = typeof window !== 'undefined'