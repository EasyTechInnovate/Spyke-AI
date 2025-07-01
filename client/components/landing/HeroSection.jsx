'use client'

import { useState, useEffect } from 'react'
import Container from '@/components/layout/Container'
import { ArrowRight, Sparkles, TrendingUp, Search, Zap, Star } from 'lucide-react'
import Link from 'next/link'
import { appConfig } from '@/lib/config'

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('')
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const stats = [
        { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
        { label: 'Active Creators', value: '5,000+', icon: Star },
        { label: 'Happy Customers', value: '50,000+', icon: Zap }
    ]

    return (
        <section className="relative min-h-screen flex items-center bg-[#0A0A0A] text-white overflow-hidden">
            {/* Dynamic gradient that follows mouse */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: `radial-gradient(800px at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 255, 137, 0.12), transparent 80%)`
                }}
            />

            {/* Static gradient orbs */}
            <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-brand-primary/10 rounded-full filter blur-[150px]" />
            <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-brand-secondary/10 rounded-full filter blur-[150px]" />

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <Container className="relative z-10">
                <div className="max-w-7xl mx-auto text-center py-20">
                    <div className="flex justify-center mb-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-primary/20 blur-xl animate-pulse" />
                            <div className="relative flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl border border-brand-primary/50 rounded-full">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
                                </span>
                                <span className="text-sm font-medium text-brand-primary">New: AI Agent Arena</span>
                                <span className="text-sm text-gray-300">Watch AI compete!</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Heading - Reasonable size */}
                    <h1 className="font-league-spartan mb-8">
                        <span className="block text-5xl sm:text-6xl md:text-7xl font-bold mb-4">Premium AI Prompts &</span>
                        <span className="block text-5xl sm:text-6xl md:text-7xl font-bold">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-white to-brand-secondary animate-gradient bg-300%">
                                Automation Tools
                            </span>
                        </span>
                    </h1>

                    {/* Tagline */}
                    <p className="font-kumbh-sans text-2xl md:text-3xl text-brand-primary mb-6">{appConfig.company.tagline}</p>

                    {/* Description */}
                    <p className="font-kumbh-sans text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                        {appConfig.company.description}
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary rounded-2xl opacity-20 blur-lg group-hover:opacity-30 transition duration-300" />
                            <div className="relative flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                                <Search className="ml-4 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search AI prompts, tools, and solutions..."
                                    className="flex-1 px-4 py-4 bg-transparent text-white placeholder:text-gray-500 focus:outline-none text-lg"
                                />
                                <button className="px-8 py-3 bg-gradient-to-r from-brand-primary to-brand-primary/80 hover:from-brand-primary/90 hover:to-brand-primary text-black font-bold rounded-xl transition-all duration-200 transform hover:scale-105 mr-1">
                                    Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Popular searches */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12 text-sm">
                        <span className="text-gray-500">Popular:</span>
                        {['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation'].map((tag) => (
                            <button
                                key={tag}
                                className="px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:bg-brand-primary/20 hover:border-brand-primary/50 hover:text-brand-primary transition-all duration-200">
                                {tag}
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
                        <Link
                            href="/explore"
                            className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl opacity-100 blur transition duration-300" />
                            <span className="relative flex items-center px-8 py-4 bg-black rounded-2xl text-brand-primary font-bold text-lg transition-all duration-300">
                                Explore Marketplace
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        <Link
                            href="/become-seller"
                            className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-2xl transition-all duration-300 hover:bg-white/20 hover:border-white/30 transform hover:scale-105">
                            <span className="flex items-center text-lg">
                                Become a Seller
                                <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                        {stats.map((stat, index) => {
                            const Icon = stat.icon
                            return (
                                <div
                                    key={stat.label}
                                    className="group relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition duration-300" />
                                    <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                                        <Icon className="h-8 w-8 text-brand-primary mx-auto mb-3" />
                                        <div className="font-league-spartan font-bold text-4xl mb-1">{stat.value}</div>
                                        <div className="font-kumbh-sans text-base text-gray-400">{stat.label}</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Container>
        </section>
    )
}
