'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react'
import { appConfig } from '@/lib/config'
import { useAnalytics } from '@/hooks/useAnalytics'
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
  const [isLoading, setIsLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { track } = useAnalytics()
  const metrics = useHeroPerformance()
  const { user } = useAuth()

  useEffect(() => {
    // Track hero section view
    track.engagement.featureUsed('hero_section_viewed', {
      user_authenticated: !!user,
      source: 'landing_hero'
    });

    // Track hero section load performance
    const heroLoadStart = performance.now();
    
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
      
      const loadingTimer = setTimeout(() => {
        setIsLoading(false)
        const heroLoadDuration = performance.now() - heroLoadStart;
        
        // Track hero section fully loaded
        track.engagement.featureUsed('hero_section_loaded', {
          load_duration_ms: Math.round(heroLoadDuration),
          has_reduced_motion: prefersReducedMotion,
          viewport_height: window.innerHeight,
          source: 'landing_hero'
        });
      }, 800)

      // Track hero section interaction
      const handleHeroInteraction = () => {
        track.engagement.featureUsed('hero_section_interacted', {
          interaction_type: 'click',
          source: 'landing_hero'
        });
      };

      document.addEventListener('click', handleHeroInteraction, { once: true });
      
      return () => {
        window.removeEventListener('resize', updateDimensions)
        mediaQuery.removeEventListener('change', handleMotionChange)
        window.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('click', handleHeroInteraction)
        clearTimeout(loadingTimer)
      }
    }
  }, [prefersReducedMotion, track, user])

  const handleSearch = (query) => {
    console.log('🎯 [HeroSectionOptimized] Search initiated:', query)
    
    // Track hero search
    track.engagement.searchPerformed(query, 'hero_search', 0);
    track.engagement.featureUsed('hero_search_performed', {
      search_query: query,
      query_length: query.length,
      user_authenticated: !!user,
      source: 'landing_hero'
    });
  }

  const handleExploreClick = () => {
    track.engagement.headerLinkClicked('explore_from_hero', '/explore');
    track.conversion.funnelStepCompleted('hero_to_explore', {
      cta_type: 'primary',
      cta_text: 'Explore Marketplace',
      user_authenticated: !!user,
      source: 'landing_hero'
    });
  };

  const handleStatsClick = (stat) => {
    track.engagement.featureUsed('hero_stats_clicked', {
      stat_label: stat.label,
      stat_value: stat.value,
      source: 'landing_hero'
    });
  };

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
            <DSLoadingState type="skeleton" width="200px" height="40px" />
            <div className="space-y-4">
              <DSLoadingState type="skeleton" width="600px" height="60px" />
              <DSLoadingState type="skeleton" width="500px" height="60px" />
            </div>
            <DSLoadingState type="skeleton" width="400px" height="24px" />
            <DSLoadingState type="skeleton" width="100%" height="64px" className="max-w-3xl" />
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
                onClick={() => track.engagement.featureUsed('hero_badge_clicked', {
                  badge_text: `#${appConfig.company.name} - AI Marketplace`,
                  source: 'landing_hero'
                })}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FF89]/20 bg-[#00FF89]/5 backdrop-blur-sm cursor-pointer hover:bg-[#00FF89]/10 transition-colors">
                  <Sparkles className="w-4 h-4 text-[#00FF89]" />
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
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-md sm:max-w-none mx-auto">
                  <Link href="/explore" className="w-full sm:w-auto">
                    <button 
                      onClick={handleExploreClick}
                      className="group relative inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3 text-black font-semibold bg-[#00FF89] rounded-lg hover:bg-[#00FF89]/90 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/25 w-full sm:w-auto min-h-[48px] touch-manipulation"
                    >
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
                    <div 
                      key={stat.label} 
                      className="text-center group cursor-pointer"
                      onClick={() => handleStatsClick(stat)}
                    >
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