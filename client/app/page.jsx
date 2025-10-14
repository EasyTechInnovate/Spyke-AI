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
      <main role="main" className="space-y-0">
        <h1 className="sr-only">AI Marketplace - Discover Prompts, Tools & Automation</h1>
        <nav aria-label="Page sections" className="sr-only">
          <ul>
            <li><a href="#featured-products">Featured Products</a></li>
            <li><a href="#featured-collections">Featured Collections</a></li>
            <li><a href="#use-cases">Use Cases</a></li>
            <li><a href="#quick-filters">Quick Filters</a></li>
            <li><a href="#creator-spotlights">Creator Spotlights</a></li>
            <li><a href="#blog-highlights">Blog Highlights</a></li>
          </ul>
        </nav>
        <section id="featured-products" aria-labelledby="featured-products-heading">
          <h2 id="featured-products-heading" className="sr-only">Featured Products</h2>
          <FeaturedProducts />
        </section>
        <section id="featured-collections" aria-labelledby="featured-collections-heading">
          <h2 id="featured-collections-heading" className="sr-only">Featured Collections</h2>
          <FeaturedCollections />
        </section>
        <section id="use-cases" aria-labelledby="use-cases-heading">
          <h2 id="use-cases-heading" className="sr-only">Curated Use Cases</h2>
          <CuratedUseCases />
        </section>
        <section id="quick-filters" aria-labelledby="quick-filters-heading">
          <h2 id="quick-filters-heading" className="sr-only">Quick Filters</h2>
          <QuickFilters />
        </section>
        <section id="creator-spotlights" aria-labelledby="creator-spotlights-heading">
          <h2 id="creator-spotlights-heading" className="sr-only">Creator Spotlights</h2>
          <CreatorSpotlights />
        </section>
        <section id="blog-highlights" aria-labelledby="blog-highlights-heading">
          <h2 id="blog-highlights-heading" className="sr-only">Blog Highlights</h2>
          <BlogHighlights />
        </section>
      </main>
    </div>
  )
}