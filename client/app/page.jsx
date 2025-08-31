import HeroSectionOptimized from '@/components/features/landing/HeroSectionOptimized'
import FeaturedProducts from '@/components/features/landing/FeaturedProducts'
import FeaturedCollections from '@/components/features/landing/FeaturedCollections'
import CuratedUseCases from '@/components/features/landing/CuratedUseCases'
import QuickFilters from '@/components/features/landing/QuickFilters'
import CreatorSpotlights from '@/components/features/landing/CreatorSpotlights'
import BlogHighlights from '@/components/features/landing/BlogHighlights'

export default function HomePage() {
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