import OptimizedImage from '../shared/ui/OptimizedImage'
import { useImageLoader } from '../../hooks/useImageLoader'
import { RESPONSIVE_SIZES, IMAGE_QUALITY } from '../../lib/config/images'

/**
 * Example component demonstrating various OptimizedImage usage patterns
 * for different scenarios in QA and production environments
 */
export default function ImageExamples() {
  const { preloadImages, getImageState } = useImageLoader({
    maxRetries: 3,
    onError: (error, src) => {
      console.warn('Image failed to load:', src, error.message)
    }
  })

  // Preload critical images on component mount
  React.useEffect(() => {
    const criticalImages = [
      'https://example.com/hero-image.jpg',
      'https://example.com/featured-product.jpg'
    ]
    preloadImages(criticalImages)
  }, [preloadImages])

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">OptimizedImage Examples</h2>
      
      {/* Basic usage with automatic optimization */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Basic Product Image</h3>
        <OptimizedImage
          src="https://example.com/product-image.jpg"
          alt="Product showcase"
          width={300}
          height={200}
          className="rounded-lg shadow-md"
        />
      </div>

      {/* Hero image with priority loading */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Hero Image (Priority)</h3>
        <OptimizedImage
          src="https://example.com/hero-banner.jpg"
          alt="Hero banner"
          fill
          priority
          sizes={RESPONSIVE_SIZES.hero}
          quality={IMAGE_QUALITY.high}
          className="relative h-64 w-full rounded-xl"
        />
      </div>

      {/* Image with fallback */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Image with Fallback</h3>
        <OptimizedImage
          src="https://potentially-broken-url.com/image.jpg"
          fallbackSrc="https://reliable-cdn.com/fallback-image.jpg"
          alt="Product with fallback"
          width={250}
          height={250}
          maxRetries={3}
          className="rounded-lg"
        />
      </div>

      {/* Thumbnail grid */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Thumbnail Grid</h3>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((id) => (
            <OptimizedImage
              key={id}
              src={`https://example.com/thumbnail-${id}.jpg`}
              alt={`Thumbnail ${id}`}
              width={150}
              height={150}
              quality={IMAGE_QUALITY.thumbnail}
              sizes={RESPONSIVE_SIZES.thumbnail}
              className="rounded-md hover:scale-105 transition-transform"
            />
          ))}
        </div>
      </div>

      {/* Custom error handling */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Custom Error Handling</h3>
        <OptimizedImage
          src="https://broken-url.com/nonexistent.jpg"
          alt="Image that will fail"
          width={200}
          height={200}
          maxRetries={2}
          onError={(error) => {
            // Custom error tracking
            console.error('Custom error handler:', error.message)
            // You could send this to your error tracking service
          }}
          onLoad={() => {
            console.log('Image loaded successfully')
          }}
          className="border-2 border-dashed border-gray-300 rounded-lg"
        />
      </div>

      {/* Disable optimization for specific cases */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Unoptimized Image</h3>
        <OptimizedImage
          src="https://example.com/svg-icon.svg"
          alt="SVG that shouldn't be optimized"
          width={100}
          height={100}
          optimizeUrl={false}
          className="bg-gray-100 rounded-md p-2"
        />
      </div>

      {/* Advanced configuration */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Advanced Configuration</h3>
        <OptimizedImage
          src="https://example.com/high-res-image.jpg"
          alt="High resolution image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90}
          priority={false}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=="
          retryDelay={2000}
          maxRetries={3}
          showFallbackIcon={false}
          className="relative h-96 w-full rounded-lg overflow-hidden"
        />
      </div>
    </div>
  )
}