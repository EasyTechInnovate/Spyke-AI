'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, Zap, TrendingUp } from 'lucide-react'
import { appConfig } from '@/lib/config'
import Container from '@/components/shared/layout/Container'
import AnimatedText from './hero/AnimatedText'
import GlowingButton from './hero/GlowingButton'
import SearchBar from './hero/SearchBar'
import StatCard from './hero/StatCard'
import BackgroundEffects from './hero/BackgroundEffects'
import HeroStyles from './hero/HeroStyles'

// Constants
const STATS = [
  { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
  { label: 'Active Creators', value: '5,000+', icon: Star },
  { label: 'Happy Customers', value: '50,000+', icon: Zap }
]

const POPULAR_TAGS = ['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation']

export default function HeroSection() {
  const [isClient, setIsClient] = useState(false)
  const [isSeller, setIsSeller] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    // Check seller status
    if (typeof window !== 'undefined') {
      try {
        const rolesStr = localStorage.getItem('roles')
        const roles = rolesStr ? JSON.parse(rolesStr) : []
        setIsSeller(roles.includes('seller'))
      } catch (e) {
        console.error('Failed to parse roles from localStorage:', e)
        setIsSeller(false)
      }
    }
  }, [])

  const handleSearch = useCallback((query) => {
    // Navigate to search results
    console.log('Search:', query)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden">
      {/* Accessibility skip link */}
      <a
        href="#search"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-black px-4 py-2 rounded-md font-bold z-50"
      >
        Skip to search
      </a>

      {/* Background Effects */}
      <div className="absolute inset-0">
        {isClient && <BackgroundEffects />}
      </div>

      {/* Main Content */}
      <Container className="relative z-10">
        <div className="max-w-7xl mx-auto text-center py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
          {/* Announcement Banner */}
          <AnnouncementBanner />

          {/* Hero Heading */}
          <HeroHeading />

          {/* Search Bar */}
          <SearchBar 
            popularTags={POPULAR_TAGS} 
            onSearch={handleSearch}
          />

          {/* CTA Buttons */}
          <CTAButtons isSeller={isSeller} />

          {/* Stats Grid */}
          <StatsGrid stats={STATS} />
        </div>
      </Container>

      {/* Styles */}
      <HeroStyles />
    </section>
  )
}

// Sub-components
function AnnouncementBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="inline-block mb-6 sm:mb-8"
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/50 to-transparent rounded-full blur animate-pulse" />
        <div className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-black/50 backdrop-blur-xl border border-white/20 rounded-full hover:border-brand-primary/50 transition-all duration-300">
          <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-brand-primary"></span>
          </span>
          <span className="text-xs sm:text-sm font-medium">New: AI Agent Arena - Watch AI compete!</span>
        </div>
      </div>
    </motion.div>
  )
}

function HeroHeading() {
  return (
    <>
      <div className="mb-4 sm:mb-6">
        <AnimatedText 
          text="Premium AI Prompts &"
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-1 sm:mb-2"
        />
        <motion.h1 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"
        >
          <span className="relative inline-block">
            <span className="relative z-10 bg-gradient-to-r from-brand-primary via-white to-brand-primary bg-clip-text text-transparent animate-gradient bg-300">
              Automation Tools
            </span>
            <motion.span
              className="absolute inset-0 bg-brand-primary/20 blur-xl hidden sm:block"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </span>
        </motion.h1>
      </div>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-brand-primary mb-8 sm:mb-10 md:mb-12 font-medium px-4"
      >
        {appConfig?.company?.tagline || 'Where Ideas Meet Intelligence'}
      </motion.p>
    </>
  )
}

function CTAButtons({ isSeller }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.2 }}
      className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-10 sm:mb-12 md:mb-16 px-4 sm:px-0"
    >
      <GlowingButton
        href="/explore"
        primary={true}
        className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-brand-primary hover:bg-brand-primary/90 text-black rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base lg:text-lg transition-all duration-200 group"
      >
        Explore Marketplace
        <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
      </GlowingButton>

      {!isSeller && (
        <GlowingButton
          href="/become-seller"
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl sm:rounded-2xl transition-all duration-200 hover:bg-white/20 hover:border-white/40 text-sm sm:text-base lg:text-lg"
        >
          Become a Seller
          <TrendingUp className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </GlowingButton>
      )}
    </motion.div>
  )
}

function StatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          stat={stat}
          index={index}
        />
      ))}
    </div>
  )
}