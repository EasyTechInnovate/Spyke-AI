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
  DSLoadingState
} from '@/lib/design-system/components'
import { track } from '@/lib/utils/analytics'
import { TRACKING_EVENTS } from '@/lib/constants/tracking'

const BackgroundEffectsLight = dynamic(() => import('./hero/BackgroundEffectsLight'), {
  ssr: false,
  loading: () => <DSLoadingState type="skeleton" height="100vh" className="absolute inset-0" />
})
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const metrics = useHeroPerformance()
  const { user } = useAuth()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setDimensions({ height: `${Math.min(window.innerHeight * 0.9, 800)}px` })
      }
      updateDimensions()
      window.addEventListener('resize', updateDimensions)

      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
      setPrefersReducedMotion(mediaQuery.matches)
      const handleMotionChange = (e) => setPrefersReducedMotion(e.matches)
      mediaQuery.addEventListener('change', handleMotionChange)

      const handleMouseMove = (e) => {
        if (!prefersReducedMotion) {
          setMousePosition({
            x: e.clientX,
            y: e.clientY
          })
        }
      }
      window.addEventListener('mousemove', handleMouseMove)

      return () => {
        window.removeEventListener('resize', updateDimensions)
        mediaQuery.removeEventListener('change', handleMotionChange)
        window.removeEventListener('mousemove', handleMouseMove)
      }
    }
  }, [prefersReducedMotion])

  const handleSearch = (query) => {
    console.log('🎯 [HeroSectionOptimized] Search initiated:', query)
  }

  const handleExploreClick = () => {
    track(TRACKING_EVENTS.MARKETPLACE_BROWSED, {
      source: 'hero_cta',
      user_type: user ? 'authenticated' : 'anonymous'
    })
  }

  // Always wrap in HeroAccessibility - even during loading
  return (
    <HeroAccessibility>
      {!mounted ? (
        <section
          className="relative overflow-hidden flex items-center pt-16"
          style={{ minHeight: '90vh' }}
          aria-label="Loading hero section"
          role="banner"
        >
          <div className="absolute inset-0 bg-black" />
          <DSContainer>
            <DSStack gap="large" align="center" className="text-center">
              <DSLoadingState type="skeleton" width="200px" height="40px" />
              <div className="space-y-4">
                <DSLoadingState type="skeleton" width="600px" height="60px" />
                <DSLoadingState type="skeleton" width="500px" height="60px" />
              </div>
              <DSLoadingState type="skeleton" width="400px" height="24px" />
              <div id="main-search" className="w-full max-w-3xl">
                <DSLoadingState type="skeleton" width="100%" height="64px" />
              </div>
              <div className="flex gap-4">
                <DSLoadingState type="skeleton" width="180px" height="48px" />
                <DSLoadingState type="skeleton" width="150px" height="48px" />
              </div>
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
      ) : (
        <section
          className="relative overflow-hidden flex items-center hero-container"
          style={{
            minHeight: dimensions.height,
            background: '#000000'
          }}
          aria-label="Hero section with AI marketplace search"
          role="banner"
        >
          {mounted && !prefersReducedMotion && (
            <div
              className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
              style={{
                background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 137, 0.06), transparent 40%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-black">
            <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900/20" />
            {mounted && <BackgroundEffectsLight />}
          </div>
          <DSContainer className="relative z-0 mt-2 pb-16 sm:pb-20 lg:pb-24">
            <div className="max-w-5xl mx-auto">
              <DSStack gap="large" align="center" className="text-center">
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FF89]/20 bg-[#00FF89]/5 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 text-[#00FF89]" aria-hidden="true" />
                    <span className="text-sm font-medium text-white">
                      #{appConfig.company.name} - AI Marketplace
                    </span>
                  </div>
                </motion.div>
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
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
                >
                  <DSText
                    variant="subhero"
                    className="hero-text-mobile max-w-2xl mx-auto text-white/90"
                    role="doc-subtitle"
                  >
                    {appConfig.company.tagline}
                  </DSText>
                </motion.div>
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
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.8 }}
                  role="navigation"
                  aria-label="Main action buttons"
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
                    <Link 
                      href="/explore" 
                      className="w-full sm:w-auto" 
                      aria-label="Explore AI marketplace with thousands of tools and prompts"
                    >
                      <button 
                        onClick={handleExploreClick}
                        className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 text-black font-semibold bg-[#00FF89] rounded-lg hover:bg-[#00FF89]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/25 w-full sm:w-auto min-h-[48px] touch-manipulation focus:outline-none focus:ring-2 focus:ring-[#00FF89] focus:ring-offset-2 focus:ring-offset-black"
                        aria-describedby="explore-button-desc"
                      >
                        <span className="text-base sm:text-base">Explore Marketplace</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
                      </button>
                      <span id="explore-button-desc" className="sr-only">
                        Browse AI prompts, tools, and automation solutions
                      </span>
                    </Link>
                    <div className="w-full sm:w-auto">
                      <SellerButton />
                    </div>
                  </div>
                </motion.div>
              </DSStack>
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 1 }}
                className="mt-12 sm:mt-16 lg:mt-20"
                role="region"
                aria-labelledby="platform-stats"
              >
                <h2 id="platform-stats" className="sr-only">Platform Statistics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                  {STATS.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div 
                        key={stat.label} 
                        className="text-center group"
                        role="group"
                        aria-labelledby={`stat-${index}`}
                      >
                        <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-xl bg-[#00FF89]/10 border border-[#00FF89]/20 group-hover:bg-[#00FF89]/20 transition-all duration-300">
                          <Icon className="w-6 h-6 text-[#00FF89]" aria-hidden="true" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {stat.value}
                        </div>
                        <div 
                          id={`stat-${index}`}
                          className="text-sm text-white/70 font-medium"
                        >
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
      )}
    </HeroAccessibility>
  )
}