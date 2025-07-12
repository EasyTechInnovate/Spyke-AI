"use client"

import HeroSection from "@/components/features/landing/HeroSection"
import FeaturedProducts from "@/components/features/landing/FeaturedProducts"
import PageLayout from "@/components/shared/layout/PageLayout"
import AddSampleItemsButton from "@/components/features/cart/AddSampleItemsButton"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <PageLayout>
      {/* Temporary button for testing cart */}
      <div className="fixed bottom-4 right-4 z-50">
        <AddSampleItemsButton />
      </div>
      
      <HeroSection />
      <FeaturedProducts />
    </PageLayout>
  )
}
