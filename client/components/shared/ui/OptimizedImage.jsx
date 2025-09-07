import { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react'
import NextImage from 'next/image'
import { getCurrentImageConfig, validateImageDomain, generateOptimizedImageUrl } from '../../../lib/config/images'

// Enhanced URL validation with configuration-based checks
const isValidImageUrl = (src) => {
  if (!src || typeof src !== 'string') return false
  
  // Use domain validation from config
  if (!validateImageDomain(src)) return false
  
  // Block suspicious patterns
  const suspiciousPatterns = [
    /^data:image\/svg\+xml.*placeholder/i,
    /placeholder/i,
    /dummy/i,
    /test-image/i
  ]
  
  try {
    const url = new URL(src)
    
    // Check for suspicious patterns in the full URL
    if (suspiciousPatterns.some(pattern => pattern.test(src))) {
      return false
    }
    
    // Only allow http/https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    
    return true
  } catch {
    // Invalid URL format
    return false
  }
}

// Enhanced fallback component with better styling
const ImageFallback = memo(({ className, width, height, alt, showIcon = true }) => (
  <div 
    className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 ${className}`}
    style={{ width, height }}
    role="img"
    aria-label={alt || 'Image not available'}
  >
    {showIcon ? (
      <svg 
        className="w-8 h-8 text-gray-400 dark:text-gray-500" 
        fill="currentColor" 
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
      </svg>
    ) : (
      <span className="text-gray-500 dark:text-gray-400 text-sm">No image</span>
    )}
  </div>
))

ImageFallback.displayName = 'ImageFallback'

const OptimizedImage = memo(function OptimizedImage({ 
  src, 
  alt = '', 
  className = '',
  priority = false,
  quality,
  placeholder,
  blurDataURL,
  fill = false,
  width,
  height,
  sizes,
  onError,
  onLoad,
  maxRetries,
  retryDelay,
  showFallbackIcon = true,
  fallbackSrc,
  optimizeUrl = true,
  ...props 
}) {
  // Get environment-specific configuration
  const config = getCurrentImageConfig()
  
  // Use config defaults if not provided
  const finalMaxRetries = maxRetries ?? config.maxRetries
  const finalRetryDelay = retryDelay ?? config.retryDelay
  const finalQuality = quality ?? config.quality
  const finalPlaceholder = placeholder ?? config.placeholder

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [currentSrc, setCurrentSrc] = useState(src)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Reset state when src changes
  useEffect(() => {
    if (src !== currentSrc) {
      setCurrentSrc(src)
      setIsLoading(true)
      setError(false)
      setRetryCount(0)
    }
  }, [src, currentSrc])

  // Validate and optimize the current source URL
  const optimizedSrc = useMemo(() => {
    if (!isValidImageUrl(currentSrc)) return null
    
    if (optimizeUrl) {
      return generateOptimizedImageUrl(currentSrc, {
        width,
        height,
        quality: finalQuality
      })
    }
    
    return currentSrc
  }, [currentSrc, optimizeUrl, width, height, finalQuality])

  // Enhanced retry logic with exponential backoff
  const retryLoad = useCallback(() => {
    if (retryCount < finalMaxRetries && mountedRef.current) {
      const delay = finalRetryDelay * Math.pow(2, retryCount) // Exponential backoff
      
      if (config.enableDetailedLogging) {
        console.log(`Retrying image load (${retryCount + 1}/${finalMaxRetries}):`, currentSrc)
      }
      
      timeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          setRetryCount(prev => prev + 1)
          setError(false)
          setIsLoading(true)
          
          // Try fallback source if available and haven't used it yet
          if (fallbackSrc && currentSrc !== fallbackSrc && retryCount === 0) {
            setCurrentSrc(fallbackSrc)
          }
        }
      }, delay)
    }
  }, [retryCount, finalMaxRetries, finalRetryDelay, fallbackSrc, currentSrc, config.enableDetailedLogging])

  // Default sizes for responsive images
  const defaultSizes = useMemo(() => {
    if (fill) {
      return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    }
    return undefined
  }, [fill])

  // Generate enhanced shimmer effect
  const shimmer = useCallback((w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#f3f4f6;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#shimmer)">
        <animate attributeName="x" from="-${w}" to="${w}" dur="2s" repeatCount="indefinite"/>
      </rect>
    </svg>`, [])

  const toBase64 = useCallback((str) => {
    if (typeof window === 'undefined') {
      return Buffer.from(str).toString('base64')
    }
    return btoa(str)
  }, [])

  const dataUrl = useMemo(() => {
    const w = width || 400
    const h = height || 300
    return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`
  }, [width, height, shimmer, toBase64])

  const handleError = useCallback((event) => {
    const errorMessage = `Image failed to load: ${currentSrc}`
    
    if (config.enableDetailedLogging) {
      console.warn(errorMessage, event)
    }
    
    if (mountedRef.current && !error) {
      setError(true)
      setIsLoading(false)
      
      // Try to retry if we haven't exceeded max retries
      if (retryCount < finalMaxRetries) {
        retryLoad()
      }
      
      // Call external error handler
      onError?.(new Error(`${errorMessage} after ${retryCount + 1} attempts`))
    }
  }, [currentSrc, error, retryCount, finalMaxRetries, retryLoad, onError, config.enableDetailedLogging])

  const handleLoad = useCallback((event) => {
    if (mountedRef.current) {
      setIsLoading(false)
      setError(false)
      
      if (config.enableDetailedLogging && retryCount > 0) {
        console.log(`Image loaded successfully after ${retryCount} retries:`, currentSrc)
      }
      
      onLoad?.(event)
    }
  }, [onLoad, config.enableDetailedLogging, retryCount, currentSrc])

  const handleLoadingComplete = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false)
    }
  }, [])

  // Show fallback if no valid source or error occurred and retries exhausted
  if (!optimizedSrc || (error && retryCount >= finalMaxRetries)) {
    return (
      <ImageFallback 
        className={className}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        alt={alt}
        showIcon={showFallbackIcon}
      />
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {isLoading && config.enableLoadingOverlay && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 animate-pulse z-10" />
      )}
      
      {/* Retry indicator */}
      {retryCount > 0 && isLoading && config.enableRetryIndicator && (
        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded z-20">
          Retry {retryCount}/{finalMaxRetries}
        </div>
      )}
      
      <NextImage
        src={optimizedSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        onLoadingComplete={handleLoadingComplete}
        placeholder={finalPlaceholder}
        blurDataURL={blurDataURL || dataUrl}
        priority={priority}
        quality={finalQuality}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes || defaultSizes}
        unoptimized={config.unoptimized}
        {...props}
      />
    </div>
  )
})

OptimizedImage.displayName = 'OptimizedImage'

export default OptimizedImage