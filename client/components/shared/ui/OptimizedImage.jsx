import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)

  // Default sizes for responsive images
  const defaultSizes = fill 
    ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    : undefined

  // Placeholder image
  const fallbackSrc = '/api/placeholder/400/300'
  
  // Generate blur data URL if not provided
  const shimmer = (w, h) => `
    <svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
        <linearGradient id="g">
          <stop stop-color="#333" offset="20%" />
          <stop stop-color="#222" offset="50%" />
          <stop stop-color="#333" offset="70%" />
        </linearGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="#333" />
      <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
      <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
    </svg>`

  const toBase64 = (str) =>
    typeof window === 'undefined'
      ? Buffer.from(str).toString('base64')
      : window.btoa(str)

  const dataUrl = `data:image/svg+xml;base64,${toBase64(
    shimmer(width || 400, height || 300)
  )}`

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 animate-pulse" />
      )}
      
      <Image
        src={error ? fallbackSrc : src}
        alt={alt}
        className={cn(
          "duration-700 ease-in-out",
          isLoading ? "opacity-0" : "opacity-100",
          fill && "object-cover"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true)
          setIsLoading(false)
        }}
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