/**
 * Image optimization configuration for different environments
 * Helps manage image loading behavior in development, QA, and production
 */

export const IMAGE_CONFIG = {
  // Environment-specific settings
  development: {
    unoptimized: true, // Disable Next.js optimization in dev for faster builds
    quality: 75,
    placeholder: 'blur',
    maxRetries: 1,
    retryDelay: 500,
    enableRetryIndicator: true,
    enableLoadingOverlay: true
  },
  
  qa: {
    unoptimized: false,
    quality: 80,
    placeholder: 'blur',
    maxRetries: 3,
    retryDelay: 1000,
    enableRetryIndicator: true,
    enableLoadingOverlay: true,
    // Additional QA-specific logging
    enableDetailedLogging: true
  },
  
  production: {
    unoptimized: false,
    quality: 85,
    placeholder: 'blur',
    maxRetries: 2,
    retryDelay: 1500,
    enableRetryIndicator: false, // Hide retry indicators in production
    enableLoadingOverlay: true,
    enableDetailedLogging: false
  }
}

// Get current environment configuration
export const getCurrentImageConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  const deploymentEnv = process.env.DEPLOYMENT_ENV || env
  
  // Use QA config if explicitly set
  if (deploymentEnv === 'qa' || process.env.VERCEL_ENV === 'preview') {
    return IMAGE_CONFIG.qa
  }
  
  return IMAGE_CONFIG[env] || IMAGE_CONFIG.development
}

// Common image domains that should be allowed
export const ALLOWED_IMAGE_DOMAINS = [
  'images.unsplash.com',
  'cdn.sanity.io',
  'res.cloudinary.com',
  'i.imgur.com',
  'picsum.photos',
  'ik.imagekit.io', // ImageKit CDN for SpykeAI
  'assets.promptbase.com', // PromptBase assets
  // Add your CDN domains here
  process.env.NEXT_PUBLIC_CDN_DOMAIN,
  process.env.NEXT_PUBLIC_IMAGE_DOMAIN
].filter(Boolean)

// Blocked domains that should never load images
export const BLOCKED_IMAGE_DOMAINS = [
  'via.placeholder.com',
  'placeholder.com',
  'placehold.it',
  'dummyimage.com',
  'fakeimg.pl',
  'picsum.photos' // Remove this if you want to allow picsum
]

// Image format priorities for optimization
export const IMAGE_FORMAT_PRIORITY = [
  'image/avif',
  'image/webp',
  'image/jpeg',
  'image/png'
]

// Default sizes for responsive images
export const RESPONSIVE_SIZES = {
  thumbnail: '(max-width: 768px) 100vw, 150px',
  card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 300px',
  hero: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px',
  full: '100vw'
}

// Image quality settings for different use cases
export const IMAGE_QUALITY = {
  thumbnail: 60,
  preview: 70,
  standard: 80,
  high: 90,
  original: 100
}

// Preload critical images based on route
export const CRITICAL_IMAGES = {
  '/': [
    // Add hero images or critical homepage images
  ],
  '/products': [
    // Add critical product images
  ],
  '/explore': [
    // Add critical explore page images
  ]
}

/**
 * Generate optimized image URL based on environment and requirements
 */
export const generateOptimizedImageUrl = (src, options = {}) => {
  if (!src) return null
  
  const {
    width,
    height,
    quality = getCurrentImageConfig().quality,
    format = 'auto'
  } = options
  
  // If it's already a data URL or blob, return as-is
  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  
  // Add your image optimization service logic here
  // For example, if using Cloudinary:
  if (src.includes('cloudinary.com')) {
    let transformations = [`q_${quality}`]
    
    if (width) transformations.push(`w_${width}`)
    if (height) transformations.push(`h_${height}`)
    if (format !== 'auto') transformations.push(`f_${format}`)
    
    return src.replace('/upload/', `/upload/${transformations.join(',')}/`)
  }
  
  return src
}

/**
 * Validate image URL against allowed/blocked domains
 */
export const validateImageDomain = (src) => {
  if (!src || typeof src !== 'string') return false

  // Allow relative URLs and data URLs
  if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) {
    return true
  }

  try {
    const url = new URL(src)
    const hostname = url.hostname.toLowerCase()

    // Check if domain is explicitly blocked
    if (BLOCKED_IMAGE_DOMAINS.some(domain => hostname.includes(domain.toLowerCase()))) {
      return false
    }

    // If allowed domains are specified, check against them
    if (ALLOWED_IMAGE_DOMAINS.length > 0) {
      return ALLOWED_IMAGE_DOMAINS.some(domain =>
        domain && (hostname === domain.toLowerCase() || hostname.includes(domain.toLowerCase()))
      )
    }

    return true
  } catch {
    // If URL parsing fails, allow it to pass through (might be relative)
    return true
  }
}