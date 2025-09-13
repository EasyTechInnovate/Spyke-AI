'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react'
import { appConfig } from '@/lib/config'
import SearchBar from './hero/SearchBar'
import HeroAccessibility from './hero/HeroAccessibility'
import SellerButton from './hero/SellerButton'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useHeroPerformance } from '@/hooks/useHeroPerformance'
import { useAuth } from '@/hooks/useAuth'
import './hero/HeroMobile.css'

import {
  DSContainer,
  DSStack,
  DSHeading,
  DSText,
  DSButton,
  DSBadge,
  DSStatsCard,
  DSLoadingState
} from '@/lib/design-system/components'

// Use the lightweight background effects
const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => <DSLoadingState type="skeleton" height="100vh" className="absolute inset-0" />
})

// Constants with design system structure
const STATS = [
  { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
  { label: 'Active Creators', value: '5,000+', icon: Star },
  { label: 'Happy Customers', value: '50,000+', icon: Zap }
]

const POPULAR_TAGS = ['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation']

export default function HeroSectionOptimized() {
  const [mounted, setMounted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [dimensions, setDimensions] = useState({ height: '90vh' })
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track performance metrics
  const metrics = useHeroPerformance()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)

    // Set proper dimensions to prevent layout shift
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setDimensions({ height: `${Math.min(window.innerHeight * 0.9, 800)}px` })
      }

      updateDimensions()
      window.addEventListener('resize', updateDimensions)

      // Check reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)

      const handleMotionChange = (e) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handleMotionChange)

      // Mouse move handler for elegant glow effect
      const handleMouseMove = (e) => {
        if (!prefersReducedMotion) {
          setMousePosition({
            x: e.clientX,
            y: e.clientY
          })
        }
      }

      window.addEventListener('mousemove', handleMouseMove)

      // Simulate component loading completion
      const loadingTimer = setTimeout(() => {
        setIsLoading(false)
      }, 800)

      return () => {
        window.removeEventListener('resize', updateDimensions)
        mediaQuery.removeEventListener('change', handleMotionChange)
        window.removeEventListener('mousemove', handleMouseMove)
        clearTimeout(loadingTimer)
      }
    }
  }, [prefersReducedMotion])

  const handleSearch = (query) => {
    console.log('🎯 [HeroSectionOptimized] Search initiated:', query)
  }

  // Show loading state during initial render
  if (!mounted || isLoading) {
    return (
      <section
        className="relative overflow-hidden flex items-center pt-16"
        style={{ minHeight: dimensions.height }}
        aria-label="Loading hero section"
      >
        <div className="absolute inset-0 bg-black" />

        <DSContainer>
          <DSStack gap="large" align="center" className="text-center">
            {/* Badge Skeleton */}
            <DSLoadingState type="skeleton" width="200px" height="40px" />

            {/* Heading Skeleton */}
            <div className="space-y-4">
              <DSLoadingState type="skeleton" width="600px" height="60px" />
              <DSLoadingState type="skeleton" width="500px" height="60px" />
            </div>

            {/* Subheading Skeleton */}
            <DSLoadingState type="skeleton" width="400px" height="24px" />

            {/* Search Bar Skeleton */}
            <DSLoadingState type="skeleton" width="100%" height="64px" className="max-w-3xl" />

            {/* CTA Buttons Skeleton */}
            <div className="flex gap-4">
              <DSLoadingState type="skeleton" width="180px" height="48px" />
              <DSLoadingState type="skeleton" width="150px" height="48px" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-3">
                  <DSLoadingState type="skeleton" width="48px" height="48px" className="mx-auto" />
                  <DSLoadingState type="skeleton" width="80px" height="32px" className="mx-auto" />
                  <DSLoadingState type="skeleton" width="100px" height="16px" className="mx-auto" />
                </div>
              ))}
            </div>
          </DSStack>
        </DSContainer>
      </section>
    )
  }

  return (
    <HeroAccessibility>
      <section
        className="relative overflow-hidden flex items-center hero-container"
        style={{
          minHeight: dimensions.height,
          background: '#000000'
        }}
        aria-label="Hero section with AI marketplace search"
      >
        {/* Mouse Follow Glow Effect */}
        {mounted && !prefersReducedMotion && (
          <div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 137, 0.06), transparent 40%)`,
            }}
          />
        )}

        {/* Pure black background with subtle overlay */}
        <div className="absolute inset-0 bg-black">
          {/* Minimal elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900/20" />

          {/* Enhanced background effects - lazy loaded */}
          {mounted && <BackgroundEffectsLight />}
        </div>

        <DSContainer className="relative z-0 mt-2 pb-16 sm:pb-20 lg:pb-24">
          <div className="max-w-5xl mx-auto">
            {/* Main Content */}
            <DSStack gap="large" align="center" className="text-center">
              {/* Badge with green theme */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FF89]/20 bg-[#00FF89]/5 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-[#00FF89]" />
                  <span className="text-sm font-medium text-white">
                    #{appConfig.company.name} - AI Marketplace
                  </span>
                </div>
              </motion.div>

              {/* Hero heading with enhanced green gradient */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <DSHeading level={1} variant="hero" className="hero-text-mobile">
                  <span className="text-white">Discover </span>
                  <span
                    className="relative"
                    style={{
                      background: `linear-gradient(135deg, #00FF89 0%, #00FF89 50%, rgba(0, 255, 137, 0.8) 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(0, 255, 137, 0.3)'
                    }}
                  >
                    10,000+ AI Prompts
                  </span>
                  <br className="hidden sm:block" />
                  <span className="text-white">
                    <span className="hidden sm:inline">& </span>
                    <span className="sm:hidden">and </span>
                    Automation Tools
                  </span>
                </DSHeading>
              </motion.div>

              {/* Clean white subheading */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
              >
                <DSText
                  variant="subhero"
                  className="hero-text-mobile max-w-2xl mx-auto text-white/90"
                >
                  {appConfig.company.tagline}
                </DSText>
              </motion.div>

              {/* Enhanced Search Bar */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.6 }}
                className="w-full max-w-3xl"
              >
                <SearchBar
                  popularTags={POPULAR_TAGS}
                  onSearch={handleSearch}
                />
              </motion.div>

              {/* Refined CTA Buttons with role-based conditional rendering */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.8 }}
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
                  <Link href="/explore" className="w-full sm:w-auto">
                    <button className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 text-black font-semibold bg-[#00FF89] rounded-lg hover:bg-[#00FF89]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/25 w-full sm:w-auto min-h-[48px] touch-manipulation">
                      <span className="text-base sm:text-base">Explore Marketplace</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </Link>

                  <div className="w-full sm:w-auto">
                    <SellerButton />
                  </div>
                </div>
              </motion.div>
            </DSStack>

            {/* Clean stats section with green accents */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 1 }}
              className="mt-12 sm:mt-16 lg:mt-20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {STATS.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className="text-center group">
                      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-[#00FF89]/10 border border-[#00FF89]/20 group-hover:bg-[#00FF89]/20 transition-all duration-300">
                        <Icon className="w-6 h-6 text-[#00FF89]" />
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm text-white/70 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </DSContainer>
      </section>
    </HeroAccessibility>
  )
}