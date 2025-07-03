'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { appConfig } from '@/lib/config'

const ArrowRight = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowRight })), {
    loading: () => <span className="w-5 h-5" />
})
const Search = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Search })), {
    loading: () => <span className="w-6 h-6" />
})
const Sparkles = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Sparkles })), {
    loading: () => <span className="w-8 h-8" />
})
const Star = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Star })), {
    loading: () => <span className="w-8 h-8" />
})
const Zap = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Zap })), {
    loading: () => <span className="w-8 h-8" />
})
const TrendingUp = dynamic(() => import('lucide-react').then(mod => ({ default: mod.TrendingUp })), {
    loading: () => <span className="w-5 h-5" />
})

const Container = dynamic(() => import('@/components/layout/Container'), {
    loading: () => <div className="container mx-auto px-4" />
})

const StatCard = memo(({ stat }) => {
    const Icon = stat.icon
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-transparent rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-300" />
            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 hover:bg-white/10 transition-all duration-300">
                <Icon className="h-6 w-6 md:h-8 md:w-8 text-brand-primary mx-auto mb-2 md:mb-3" aria-hidden="true" />
                <div className="font-bold text-2xl md:text-4xl mb-1">{stat.value}</div>
                <div className="text-sm md:text-base text-gray-300">{stat.label}</div>
            </div>
        </div>
    )
})

StatCard.displayName = 'StatCard'

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            // Navigate to search results
        }
    }, [searchQuery])

    const handleKeyPress = useCallback((e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }, [handleSearch])

    const stats = [
        { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
        { label: 'Active Creators', value: '5,000+', icon: Star },
        { label: 'Happy Customers', value: '50,000+', icon: Zap }
    ]

    const popularTags = ['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation']

    return (
        <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden">
            {/* Skip link */}
            <a href="#search" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-black px-4 py-2 rounded-md font-bold z-50">
                Skip to search
            </a>

            {/* Optimized gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent pointer-events-none" />
            
            {/* Simple animated orbs */}
            {isClient && (
                <>
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl animate-pulse-slow animation-delay-2s" />
                </>
            )}

            <Container className="relative z-10">
                <div className="max-w-7xl mx-auto text-center py-20 md:py-32">
                    {/* Announcement */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
                        <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
                        <span className="text-sm font-medium">New: AI Agent Arena - Watch AI compete!</span>
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                        <span className="block mb-2">Premium AI Prompts &</span>
                        <span className="block bg-gradient-to-r from-brand-primary to-white bg-clip-text text-transparent">
                            Automation Tools
                        </span>
                    </h1>

                    {/* Tagline */}
                    <p className="text-xl md:text-2xl lg:text-3xl text-brand-primary mb-12 font-medium">
                        {appConfig?.company?.tagline || 'Where Ideas Meet Intelligence'}
                    </p>

                    {/* Search */}
                    <div className="max-w-4xl mx-auto mb-8" id="search">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/50 to-brand-primary/30 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition duration-300" />
                            <div className="relative flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-2">
                                <Search className="ml-4 h-6 w-6 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search AI prompts, tools, and solutions..."
                                    className="flex-1 px-4 py-4 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-lg"
                                    aria-label="Search AI prompts"
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="px-6 md:px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-xl transition-all duration-200 mr-1"
                                    aria-label="Search button"
                                >
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Popular searches */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <span className="text-gray-400 text-sm">Popular:</span>
                            {popularTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSearchQuery(tag)}
                                    className="px-3 py-1 text-sm rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
                                    aria-label={`Search for ${tag}`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <Link
                            href="/explore"
                            className="inline-flex items-center px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-black rounded-2xl font-bold text-lg transition-all duration-200 group"
                        >
                            Explore Marketplace
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>

                        <Link
                            href="/become-seller"
                            className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-2xl transition-all duration-200 hover:bg-white/20 hover:border-white/40"
                        >
                            Become a Seller
                            <TrendingUp className="ml-2 h-5 w-5" />
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                        {stats.map((stat) => (
                            <StatCard key={stat.label} stat={stat} />
                        ))}
                    </div>
                </div>
            </Container>

            <style jsx>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.1; }
                    50% { opacity: 0.2; }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }

                .animation-delay-2s {
                    animation-delay: 2s;
                }

                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border-width: 0;
                }

                .focus\\:not-sr-only:focus {
                    position: absolute;
                    width: auto;
                    height: auto;
                    padding: 0.5rem 1rem;
                    margin: 0;
                    overflow: visible;
                    clip: auto;
                    white-space: normal;
                }

                /* Reduce motion */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                }

                /* High contrast */
                @media (prefers-contrast: high) {
                    .text-gray-300 { color: #f3f4f6; }
                    .text-gray-400 { color: #e5e7eb; }
                    .bg-white\\/10 { background-color: rgba(255,255,255,0.2); }
                    .border-white\\/20 { border-color: rgba(255,255,255,0.3); }
                }

                /* Focus visible */
                button:focus-visible,
                a:focus-visible,
                input:focus-visible {
                    outline: 2px solid #00ff89;
                    outline-offset: 2px;
                }
            `}</style>
        </section>
    )
}