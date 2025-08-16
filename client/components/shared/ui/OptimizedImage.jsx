import { useState, useMemo, memo } from 'react'
import NextImage from 'next/image'

// Filter out problematic image URLs
const isValidImageUrl = (src) => {
  if (!src) return false
  
  // Block known problematic domains
  const blockedDomains = [
    'via.placeholder.com',
    'placeholder.com',
    'placehold.it'
  ]
  
  try {
    const url = new URL(src)
    return !blockedDomains.some(domain => url.hostname.includes(domain))
  } catch {
    // Invalid URL
    return false
  }
}

export default function OptimizedImage({ 
  src, 
  alt, 
  className,
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  fill,
  width,
  height,
  sizes,
  onError,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Filter out invalid/problematic URLs
  const validSrc = useMemo(() => {
    return isValidImageUrl(src) ? src : null
  }, [src])

  // Default sizes for responsive images
  const defaultSizes = fill 
    ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    : undefined

  // Generate blur data URL if not provided
  const shimmer = (w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#1f1f1f" offset="20%" />
          <stop stop-color="#2a2a2a" offset="50%" />
          <stop stop-color="#1f1f1f" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#1f1f1f" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" opacity="0.5" />
      <animate attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite" />
    </svg>`

  const toBase64 = (str) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  const dataUrl = useMemo(() => {
    const w = width || 400
    const h = height || 300
    return `data:image/svg+xml;base64,${toBase64(shimmer(w, h))}`
  }, [width, height])

  const handleError = () => {
    if (!error) {
      setError(true)
      onError?.(new Error('Image failed to load'))
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  // Show fallback if no valid source or error occurred
  if (!validSrc || error) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-gray-500 text-sm">No image</div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <NextImage
        src={validSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        placeholder={placeholder}
        blurDataURL={blurDataURL || dataUrl}
        priority={priority}
        quality={quality}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes || defaultSizes}
        {...props}
      />
    </div>
  )
}