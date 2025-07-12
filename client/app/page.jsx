"use client"

import HeroSection from "@/components/features/landing/HeroSection"
import PageLayout from "@/components/shared/layout/PageLayout"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <PageLayout>
      <HeroSection />
    </PageLayout>
  )
}
