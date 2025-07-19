import HeroSectionOptimized from '@/components/features/landing/HeroSectionOptimized'
import FeaturedProducts from '@/components/features/landing/FeaturedProducts'
import FeaturedCollections from '@/components/features/landing/FeaturedCollections'
import CuratedUseCases from '@/components/features/landing/CuratedUseCases'
import QuickFilters from '@/components/features/landing/QuickFilters'
import CreatorSpotlights from '@/components/features/landing/CreatorSpotlights'
import BlogHighlights from '@/components/features/landing/BlogHighlights'
import PageLayout from '@/components/shared/layout/PageLayout'

export default function HomePage() {
  return (
    <PageLayout>
      <HeroSectionOptimized />
      <FeaturedProducts />
      <FeaturedCollections />
      <CuratedUseCases />
      <QuickFilters />
      <CreatorSpotlights />
      <BlogHighlights />
    </PageLayout>
  )
}