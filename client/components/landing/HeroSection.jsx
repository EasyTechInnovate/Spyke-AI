'use client'
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback, memo, useRef } from 'react'
import Link from 'next/link'
import { appConfig } from '@/lib/config'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Star, Zap, Search, TrendingUp } from 'lucide-react';
import Container from '../layout/Container';


// Custom floating particles component - responsive
const FloatingParticles = () => {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
    const [particleCount, setParticleCount] = useState(20)
    
    useEffect(() => {
        const updateDimensions = () => {
            const width = window.innerWidth
            const height = window.innerHeight
            setDimensions({ width, height })
            
            // Adjust particle count based on screen size
            if (width < 640) {
                setParticleCount(10)
            } else if (width < 1024) {
                setParticleCount(15)
            } else {
                setParticleCount(20)
            }
        }
        
        updateDimensions()
        window.addEventListener('resize', updateDimensions)
        return () => window.removeEventListener('resize', updateDimensions)
    }, [])
    
    if (dimensions.width === 0) return null
    
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(particleCount)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-brand-primary/30 rounded-full"
                    initial={{
                        x: Math.random() * dimensions.width,
                        y: Math.random() * dimensions.height,
                    }}
                    animate={{
                        x: Math.random() * dimensions.width,
                        y: Math.random() * dimensions.height,
                    }}
                    transition={{
                        duration: Math.random() * 20 + 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    style={{
                        filter: 'blur(1px)',
                        boxShadow: '0 0 10px rgba(0, 255, 137, 0.5)'
                    }}
                />
            ))}
        </div>
    )
}

// Enhanced StatCard with responsive design
const StatCard = memo(({ stat, index }) => {
    const Icon = stat.icon
    const cardRef = useRef(null)
    const [isHovered, setIsHovered] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])
    
    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: isMobile ? 30 : 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            className="relative group"
        >
            {/* Animated border gradient */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-primary to-brand-primary/50 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500" />
            
            {/* Glow effect - only on desktop */}
            {!isMobile && (
                <motion.div
                    className="absolute inset-0 bg-brand-primary/20 rounded-xl sm:rounded-2xl blur-xl"
                    animate={{
                        scale: isHovered ? 1.2 : 1,
                        opacity: isHovered ? 0.3 : 0
                    }}
                    transition={{ duration: 0.3 }}
                />
            )}
            
            {/* Card content */}
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 hover:border-brand-primary/50 transition-all duration-300">
                <motion.div
                    animate={{ 
                        rotate: isHovered && !isMobile ? [0, -10, 10, -10, 0] : 0,
                        scale: isHovered && !isMobile ? 1.1 : 1
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <Icon
                        className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-brand-primary mx-auto mb-1 sm:mb-2 md:mb-3 drop-shadow-[0_0_15px_rgba(0,255,137,0.5)]"
                        aria-hidden="true"
                    />
                </motion.div>
                <motion.div 
                    className="font-bold text-lg sm:text-2xl md:text-4xl mb-0.5 sm:mb-1"
                    animate={{ scale: isHovered && !isMobile ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                >
                    {stat.value}
                </motion.div>
                <div className="text-xs sm:text-sm md:text-base text-gray-300">{stat.label}</div>
                
                {/* Floating dots animation - desktop only */}
                {isHovered && !isMobile && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-1 h-1 bg-brand-primary rounded-full"
                                initial={{ 
                                    x: '50%', 
                                    y: '50%',
                                    scale: 0
                                }}
                                animate={{ 
                                    x: `${50 + (Math.random() - 0.5) * 100}%`,
                                    y: `${50 + (Math.random() - 0.5) * 100}%`,
                                    scale: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 1,
                                    delay: i * 0.1,
                                    repeat: Infinity
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
})

StatCard.displayName = 'StatCard'

// Animated text component - responsive
const AnimatedText = ({ text, className }) => {
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
        setIsMobile(window.innerWidth < 640)
    }, [])
    
    if (isMobile) {
        // Simpler animation for mobile
        return (
            <motion.div 
                className={className}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {text}
            </motion.div>
        )
    }
    
    return (
        <motion.div className={className}>
            {text.split('').map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: index * 0.02,
                        ease: [0.215, 0.61, 0.355, 1]
                    }}
                    className="inline-block"
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </motion.div>
    )
}

const GlowingButton = ({ children, href, primary = false, onClick, className = "" }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    
    useEffect(() => {
        setIsMobile(window.innerWidth < 768)
    }, [])
    
    const ButtonContent = () => (
        <motion.div
            className="relative group"
            onMouseEnter={() => !isMobile && setIsHovered(true)}
            onMouseLeave={() => !isMobile && setIsHovered(false)}
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
        >
            {/* Animated background gradient - reduced for mobile */}
            <motion.div
                className={`absolute -inset-1 ${primary ? 'bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary' : 'bg-gradient-to-r from-brand-primary/50 to-brand-primary/30'} rounded-xl sm:rounded-2xl blur-md sm:blur-lg opacity-60 group-hover:opacity-100`}
                animate={{
                    backgroundPosition: isHovered && !isMobile ? ['0% 50%', '100% 50%', '0% 50%'] : '0% 50%'
                }}
                transition={{
                    backgroundPosition: {
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }
                }}
                style={{ backgroundSize: '200% 200%' }}
            />
            
            <div className={`relative ${className}`}>
                {children}
            </div>
        </motion.div>
    )
    
    if (href) {
        return <Link href={href}><ButtonContent /></Link>
    }
    
    return <button onClick={onClick}><ButtonContent /></button>
}

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('')
    const [isClient, setIsClient] = useState(false)
    const [isSeller, setIsSeller] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [isMobile, setIsMobile] = useState(false)
    const [isTablet, setIsTablet] = useState(false)
    
    const handleMouseMove = (e) => {
        if (!isMobile && !isTablet) {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
    }

    useEffect(() => {
        setIsClient(true)
        
        const checkDevice = () => {
            const width = window.innerWidth
            setIsMobile(width < 640)
            setIsTablet(width >= 640 && width < 1024)
        }
        
        checkDevice()
        window.addEventListener('resize', checkDevice)
        window.addEventListener('mousemove', handleMouseMove)
        
        return () => {
            window.removeEventListener('resize', checkDevice)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            // Navigate to search results
        }
    }, [searchQuery])

    useEffect(() => {
        setIsClient(true)

        // Only access localStorage on client side
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

    const handleKeyPress = useCallback(
        (e) => {
            if (e.key === 'Enter') {
                handleSearch()
            }
        },
        [handleSearch]
    )

    const stats = [
        { label: 'AI Prompts', value: '10,000+', icon: Sparkles },
        { label: 'Active Creators', value: '5,000+', icon: Star },
        { label: 'Happy Customers', value: '50,000+', icon: Zap }
    ]

    const popularTags = ['ChatGPT Prompts', 'Automation Tools', 'Sales Scripts', 'Content Creation']

    return (
        <section className="relative min-h-screen flex items-center bg-black text-white overflow-hidden">
            {/* Skip link */}
            <a
                href="#search"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-brand-primary text-black px-4 py-2 rounded-md font-bold z-50">
                Skip to search
            </a>

            {/* Custom animated background */}
            <div className="absolute inset-0">
                {/* Gradient mesh background - responsive sizes */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[500px] h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-brand-primary/20 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob" />
                    <div className="absolute top-1/3 right-1/4 w-[150px] sm:w-[250px] md:w-[350px] lg:w-[400px] h-[150px] sm:h-[250px] md:h-[350px] lg:h-[400px] bg-purple-500/20 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob animation-delay-2000" />
                    <div className="absolute bottom-0 left-1/2 w-[250px] sm:w-[400px] md:w-[500px] lg:w-[600px] h-[250px] sm:h-[400px] md:h-[500px] lg:h-[600px] bg-brand-primary/10 rounded-full filter blur-[80px] sm:blur-[100px] md:blur-[120px] animate-blob animation-delay-4000" />
                </div>
                
                {/* Grid pattern overlay */}
                <div 
                    className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%22100%22%20height%3D%22100%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%22100%22%20height%3D%22100%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%20100%200%20L%200%200%200%20100%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%220.5%22%20opacity%3D%220.1%22%2F%3E%3C%2Fpattern%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22%20%2F%3E%3C%2Fsvg%3E')] opacity-20 sm:opacity-30 md:opacity-50"
                />
                
                {/* Floating particles */}
                {isClient && <FloatingParticles />}
                
                {/* Spotlight that follows mouse - desktop only */}
                {isClient && !isMobile && !isTablet && (
                    <motion.div
                        className="absolute w-[600px] lg:w-[800px] h-[600px] lg:h-[800px] rounded-full pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle, rgba(0,255,137,0.1) 0%, transparent 70%)',
                            x: mousePosition.x - 400,
                            y: mousePosition.y - 400,
                        }}
                        animate={{
                            x: mousePosition.x - 400,
                            y: mousePosition.y - 400,
                        }}
                        transition={{ type: "spring", damping: 30, stiffness: 200 }}
                    />
                )}
            </div>

            <Container className="relative z-10">
                <div className="max-w-7xl mx-auto text-center py-12 sm:py-16 md:py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
                    {/* Animated Announcement */}
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

                    {/* Animated Heading */}
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

                    {/* Animated Tagline */}
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.7 }}
                        className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-brand-primary mb-8 sm:mb-10 md:mb-12 font-medium px-4"
                    >
                        {appConfig?.company?.tagline || 'Where Ideas Meet Intelligence'}
                    </motion.p>

                    {/* Enhanced Search - fully responsive */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 px-4 sm:px-0"
                        id="search">
                        <div className="relative group">
                            {/* Animated border */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary via-green-400 to-brand-primary rounded-xl sm:rounded-2xl opacity-30 blur-md sm:blur-lg group-hover:opacity-50 animate-gradient bg-400 transition duration-300" />
                            
                            <div className="relative flex flex-col sm:flex-row items-center bg-black/70 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl hover:border-brand-primary/50 transition-all duration-300">
                                <div className="flex items-center w-full sm:flex-1">
                                    <Search className="ml-3 sm:ml-4 h-5 w-5 sm:h-6 sm:w-6 text-gray-400 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Search AI prompts..."
                                        className="flex-1 px-3 sm:px-4 py-3 sm:py-4 bg-transparent text-white placeholder:text-gray-400 focus:outline-none text-sm sm:text-base lg:text-lg"
                                        aria-label="Search AI prompts"
                                    />
                                </div>
                                <div className="w-full sm:w-auto mt-2 sm:mt-0 px-1.5 sm:px-0">
                                    <GlowingButton
                                        onClick={handleSearch}
                                        primary={true}
                                        className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-brand-primary hover:bg-brand-primary/90 text-black font-bold rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base"
                                    >
                                        Search
                                    </GlowingButton>
                                </div>
                            </div>
                        </div>

                        {/* Popular searches with stagger animation - responsive */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1 }}
                            className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4"
                        >
                            <span className="text-gray-400 text-xs sm:text-sm">Popular:</span>
                            {popularTags.map((tag, i) => (
                                <motion.button
                                    key={tag}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ 
                                        duration: 0.3, 
                                        delay: 1.1 + i * 0.1,
                                        type: "spring",
                                        stiffness: 200
                                    }}
                                    whileHover={!isMobile ? { 
                                        scale: 1.05,
                                        boxShadow: "0 0 20px rgba(0,255,137,0.5)"
                                    } : {}}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSearchQuery(tag)}
                                    className="relative px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full overflow-hidden group"
                                    aria-label={`Search for ${tag}`}>
                                    <span className="absolute inset-0 bg-gradient-to-r from-brand-primary/0 via-brand-primary/20 to-brand-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    <span className="relative z-10 block px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:text-brand-primary transition-colors duration-200">
                                        {tag}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* Enhanced CTAs - responsive */}
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

                    {/* Enhanced Stats - fully responsive grid */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-0">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={stat.label}
                                stat={stat}
                                index={index}
                            />
                        ))}
                    </div>
                </div>
            </Container>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% {
                        transform: translate(0px, 0px) scale(1);
                    }
                    33% {
                        transform: translate(30px, -50px) scale(1.1);
                    }
                    66% {
                        transform: translate(-20px, 20px) scale(0.9);
                    }
                }

                @keyframes gradient {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                .animate-blob {
                    animation: blob 20s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }

                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }

                .bg-300 {
                    background-size: 300% 300%;
                }

                .bg-400 {
                    background-size: 400% 400%;
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

                /* Mobile optimizations */
                @media (max-width: 640px) {
                    @keyframes blob {
                        0%, 100% {
                            transform: translate(0px, 0px) scale(1);
                        }
                        33% {
                            transform: translate(15px, -25px) scale(1.05);
                        }
                        66% {
                            transform: translate(-10px, 10px) scale(0.95);
                        }
                    }
                }

                /* Reduce motion */
                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                    }
                    .animate-blob,
                    .animate-gradient,
                    .animate-pulse,
                    .animate-ping {
                        animation: none !important;
                    }
                }

                /* High contrast */
                @media (prefers-contrast: high) {
                    .text-gray-300 {
                        color: #f3f4f6;
                    }
                    .text-gray-400 {
                        color: #e5e7eb;
                    }
                    .bg-white\\/10 {
                        background-color: rgba(255, 255, 255, 0.2);
                    }
                    .border-white\\/20 {
                        border-color: rgba(255, 255, 255, 0.3);
                    }
                }

                /* Focus visible */
                button:focus-visible,
                a:focus-visible,
                input:focus-visible {
                    outline: 2px solid #00ff89;
                    outline-offset: 2px;
                }

                /* Touch-friendly tap targets */
                @media (max-width: 768px) {
                    button, a {
                        min-height: 44px;
                        min-width: 44px;
                    }
                }

                /* Prevent horizontal scroll */
                html, body {
                    overflow-x: hidden;
                    max-width: 100%;
                }
            `}</style>
        </section>
    )
}