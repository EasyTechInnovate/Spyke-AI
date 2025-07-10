"use client"
export const dynamic = 'force-dynamic';

import CuratedUseCases from "@/components/landing/CuratedUseCases"
import FeatureCards from "@/components/landing/FeaturedCollection"
import FeaturedCollections from "@/components/landing/FeaturedCollection"
import FeaturedPrompts from "@/components/landing/FeaturePrompt"
import HeroSection from "@/components/landing/HeroSection"
import QuickFilters from "@/components/landing/QuickFilters"
import Footer from "@/components/layout/Footer"
import Header from "@/components/layout/Header"


export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
      </main>
      <Footer />
    </>
  )
}