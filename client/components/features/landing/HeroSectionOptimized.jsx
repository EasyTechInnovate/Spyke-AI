'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ArrowRight, Sparkles, Star, Zap } from 'lucide-react'
import { appConfig } from '@/lib/config'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'

import SearchBar from './hero/SearchBar'

// Only lazy load background effects as they're not critical
const BackgroundEffects = dynamic(() => import('./hero/BackgroundEffects'), {
  ssr: false
})

// Constants
const STATS = [
  { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
  { label: 'Active Creators', value: '5,000+', icon: Star },
  { label: 'Happy Customers', value: '50,000+', icon: Zap }
]

const POPULAR_TAGS = ['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation']

export default function HeroSectionOptimized() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] overflow-hidden flex items-center">
      {/* Consistent background with featured section */}
      <div className="absolute inset-0 bg-black">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        {/* Background Effects - Lazy loaded */}
        {mounted && <BackgroundEffects />}
      </div>

      <Container className="relative z-10 py-20">
        <div className="max-w-5xl mx-auto">
          {/* Main Content */}
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 border border-brand-primary/20 rounded-full">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-brand-primary">
                #{appConfig.company.name} - AI Marketplace
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight">
              <span className="text-white">Discover </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-green-400">
                10,000+ AI Prompts
              </span>
              <br />
              <span className="text-white">& Automation Tools</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto font-inter">
              {appConfig.company.tagline}
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto">
              <SearchBar onSearch={() => {}} popularTags={POPULAR_TAGS} />
            </div>

            {/* Popular Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Popular:</span>
              {POPULAR_TAGS.map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-sm bg-gray-900 text-gray-300 rounded-full hover:bg-gray-800 hover:text-white transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/explore"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-brand-primary text-brand-primary-text font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200"
              >
                Explore Marketplace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/become-seller"
                className="inline-flex items-center gap-2 px-8 py-4 border border-gray-700 text-white font-semibold rounded-xl hover:bg-gray-900 hover:border-gray-600 transition-all duration-200"
              >
                Start Selling
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-xl mb-4">
                  <stat.icon className="w-6 h-6 text-brand-primary" />
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}