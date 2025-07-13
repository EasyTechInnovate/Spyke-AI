import HeroSectionOptimized from '@/components/features/landing/HeroSectionOptimized'
import FeaturedProducts from '@/components/features/landing/FeaturedProducts'
import PageLayout from '@/components/shared/layout/PageLayout'

export default function HomePage() {
  return (
    <PageLayout>
      <HeroSectionOptimized />
      <FeaturedProducts />
    </PageLayout>
  )
}