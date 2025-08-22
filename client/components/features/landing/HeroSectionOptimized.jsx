'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react'
import { appConfig } from '@/lib/config'
import SearchBar from './hero/SearchBar'
import HeroAccessibility from './hero/HeroAccessibility'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useHeroPerformance } from '@/hooks/useHeroPerformance'
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
  
  // Track performance metrics
  const metrics = useHeroPerformance()

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
      
      // Simulate component loading completion
      const loadingTimer = setTimeout(() => {
        setIsLoading(false)
      }, 800)
      
      return () => {
        window.removeEventListener('resize', updateDimensions)
        mediaQuery.removeEventListener('change', handleMotionChange)
        clearTimeout(loadingTimer)
      }
    }
  }, [])

  // Log performance metrics in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.lcp) {
      console.log('🎯 Hero Section Performance Metrics:', {
        FCP: `${metrics.fcp?.toFixed(2)}ms`,
        LCP: `${metrics.lcp?.toFixed(2)}ms`,
        CLS: metrics.cls?.toFixed(4),
        LoadTime: `${metrics.loadTime?.toFixed(2)}ms`
      })
    }
  }, [metrics])

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
        <div className="absolute inset-0 bg-[#121212]" />
        
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
        className="relative overflow-hidden flex items-center pt-16 hero-container"
        style={{ minHeight: dimensions.height }}
        aria-label="Hero section with AI marketplace search"
      >
        {/* Consistent background */}
        <div className="absolute inset-0 bg-[#121212]">
          {/* Immediate background to prevent flash */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black" />
          
          {/* Enhanced background effects - lazy loaded */}
          {mounted && <BackgroundEffectsLight />}
        </div>

        <DSContainer className="relative z-10 py-16 sm:py-20 lg:py-24">
          <div className="max-w-5xl mx-auto">
            {/* Main Content */}
            <DSStack gap="large" align="center" className="text-center">
              {/* Badge with proper focus handling */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              >
                <DSBadge variant="primary" icon={Sparkles}>
                  #{appConfig.company.name} - AI Marketplace
                </DSBadge>
              </motion.div>

              {/* Optimized heading with proper hierarchy */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 0.2 }}
              >
                <DSHeading level={1} variant="hero" className="hero-text-mobile">
                  <span style={{ color: 'white' }}>Discover </span>
                  <span style={{ 
                    background: `linear-gradient(to right, #00FF89, rgba(0, 255, 137, 0.7))`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    10,000+ AI Prompts
                  </span>
                  <br className="hidden sm:block" />
                  <span style={{ color: 'white' }}>
                    <span className="hidden sm:inline">& </span>
                    <span className="sm:hidden">and </span>
                    Automation Tools
                  </span>
                </DSHeading>
              </motion.div>

              {/* Subheading with proper contrast */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.4 }}
              >
                <DSText 
                  variant="subhero" 
                  className="hero-text-mobile max-w-2xl mx-auto"
                  style={{ color: '#d1d5db' }}
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

              {/* Touch-friendly CTA Buttons using Design System */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.6, delay: prefersReducedMotion ? 0 : 0.8 }}
              >
                <DSStack direction="row" gap="4" className="flex-col sm:flex-row">
                  <Link href="/explore">
                    <DSButton variant="primary" size="medium" className="group w-full sm:w-auto">
                      Explore Marketplace
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </DSButton>
                  </Link>
                  
                  <Link href="/become-seller">
                    <DSButton variant="secondary" size="medium" className="w-full sm:w-auto">
                      Start Selling
                    </DSButton>
                  </Link>
                </DSStack>
              </motion.div>
            </DSStack>

            {/* Stats Section using Design System */}
            <motion.div
              initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
              animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: prefersReducedMotion ? 0 : 1 }}
              className="mt-12 sm:mt-16 lg:mt-20"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {STATS.map((stat, index) => (
                  <DSStatsCard
                    key={stat.label}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.label}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </DSContainer>
      </section>
    </HeroAccessibility>
  )
}