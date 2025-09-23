import HeroSectionOptimized from '@/components/features/landing/HeroSectionOptimized'
import FeaturedProducts from '@/components/features/landing/FeaturedProducts'
import FeaturedCollections from '@/components/features/landing/FeaturedCollections'
import CuratedUseCases from '@/components/features/landing/CuratedUseCases'
import QuickFilters from '@/components/features/landing/QuickFilters'
import CreatorSpotlights from '@/components/features/landing/CreatorSpotlights'
import BlogHighlights from '@/components/features/landing/BlogHighlights'

export default function HomePage() {
  console.log('=== STRIPE ENVIRONMENT VARIABLES ===')
        console.log('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:', publishableKey)
        console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY)
        console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET)
        console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
        console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
        console.log('NODE_ENV:', process.env.NODE_ENV)
  return (
    <div className="min-h-screen bg-brand-dark">
      <HeroSectionOptimized />
      
      <div className="space-y-0">
        <FeaturedProducts />
        <FeaturedCollections />
        <CuratedUseCases />
        <QuickFilters />
        <CreatorSpotlights />
        <BlogHighlights />
      </div>
    </div>
  )
}