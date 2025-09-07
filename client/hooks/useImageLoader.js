import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Enhanced hook for managing image loading with retry logic and fallback handling
 * Useful for components that need to handle multiple images or complex loading scenarios
 */
export const useImageLoader = ({
  maxRetries = 2,
  retryDelay = 1000,
  onSuccess,
  onError,
  onRetry
} = {}) => {
  const [loadingStates, setLoadingStates] = useState({})
  const [errorStates, setErrorStates] = useState({})
  const [retryStates, setRetryStates] = useState({})
  const timeoutsRef = useRef({})
  const mountedRef = useRef(true)

  useEffect(() => {
    const timeouts = timeoutsRef.current
    return () => {
      mountedRef.current = false
      // Cleanup all timeouts
      Object.values(timeouts).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])

  const loadImage = useCallback((src, id = src) => {
    if (!src || !mountedRef.current) return Promise.reject(new Error('Invalid source or component unmounted'))

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Set loading state
      setLoadingStates(prev => ({ ...prev, [id]: true }))
      setErrorStates(prev => ({ ...prev, [id]: false }))

      img.onload = () => {
        if (mountedRef.current) {
          setLoadingStates(prev => ({ ...prev, [id]: false }))
          setErrorStates(prev => ({ ...prev, [id]: false }))
          onSuccess?.(src, id)
          resolve(src)
        }
      }

      img.onerror = () => {
        if (mountedRef.current) {
          const currentRetries = retryStates[id] || 0
          
          if (currentRetries < maxRetries) {
            // Retry with exponential backoff
            const delay = retryDelay * Math.pow(2, currentRetries)
            setRetryStates(prev => ({ ...prev, [id]: currentRetries + 1 }))
            
            onRetry?.(src, id, currentRetries + 1)
            
            timeoutsRef.current[id] = setTimeout(() => {
              if (mountedRef.current) {
                loadImage(src, id).then(resolve).catch(reject)
              }
            }, delay)
          } else {
            // Max retries exceeded
            setLoadingStates(prev => ({ ...prev, [id]: false }))
            setErrorStates(prev => ({ ...prev, [id]: true }))
            const error = new Error(`Failed to load image after ${maxRetries} retries: ${src}`)
            onError?.(error, src, id)
            reject(error)
          }
        }
      }

      img.src = src
    })
  }, [maxRetries, retryDelay, onSuccess, onError, onRetry, retryStates])

  const preloadImages = useCallback(async (urls) => {
    const results = await Promise.allSettled(
      urls.map(url => loadImage(url))
    )
    
    return results.map((result, index) => ({
      url: urls[index],
      success: result.status === 'fulfilled',
      error: result.status === 'rejected' ? result.reason : null
    }))
  }, [loadImage])

  const resetImageState = useCallback((id) => {
    setLoadingStates(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    setErrorStates(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    setRetryStates(prev => {
      const newState = { ...prev }
      delete newState[id]
      return newState
    })
    
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id])
      delete timeoutsRef.current[id]
    }
  }, [])

  const getImageState = useCallback((id) => ({
    isLoading: loadingStates[id] || false,
    hasError: errorStates[id] || false,
    retryCount: retryStates[id] || 0
  }), [loadingStates, errorStates, retryStates])

  return {
    loadImage,
    preloadImages,
    resetImageState,
    getImageState,
    loadingStates,
    errorStates,
    retryStates
  }
}

/**
 * Hook for validating and normalizing image URLs
 */
export const useImageValidation = () => {
  const validateUrl = useCallback((src) => {
    if (!src || typeof src !== 'string') return { isValid: false, reason: 'Invalid or missing URL' }

    // Check for blocked domains
    const blockedDomains = [
      'via.placeholder.com',
      'placeholder.com',
      'placehold.it',
      'dummyimage.com',
      'fakeimg.pl'
    ]

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^data:image\/svg\+xml.*placeholder/i,
      /placeholder/i,
      /dummy/i,
      /test-image/i
    ]

    try {
      const url = new URL(src)

      if (blockedDomains.some(domain => url.hostname.includes(domain))) {
        return { isValid: false, reason: 'Blocked domain' }
      }

      if (suspiciousPatterns.some(pattern => pattern.test(src))) {
        return { isValid: false, reason: 'Suspicious pattern detected' }
      }

      if (!['http:', 'https:'].includes(url.protocol)) {
        return { isValid: false, reason: 'Invalid protocol' }
      }

      return { isValid: true, normalizedUrl: src }
    } catch (error) {
      return { isValid: false, reason: 'Invalid URL format' }
    }
  }, [])

  const normalizeImageUrl = useCallback((src, fallbacks = []) => {
    const validation = validateUrl(src)
    
    if (validation.isValid) {
      return { url: validation.normalizedUrl, fallbacks }
    }

    // Try fallbacks
    for (const fallback of fallbacks) {
      const fallbackValidation = validateUrl(fallback)
      if (fallbackValidation.isValid) {
        return { url: fallbackValidation.normalizedUrl, fallbacks: fallbacks.slice(fallbacks.indexOf(fallback) + 1) }
      }
    }

    return { url: null, fallbacks: [] }
  }, [validateUrl])

  return {
    validateUrl,
    normalizeImageUrl
  }
}