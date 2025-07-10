'use client'
export const dynamic = 'force-dynamic';
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Container from './Container'
import { Twitter, Linkedin, Github, Youtube, Cookie, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Footer() {
    const [showCookieConsent, setShowCookieConsent] = useState(false)

    useEffect(() => {
        // Check if user has already accepted cookies
        if (typeof window !== 'undefined') {
            const cookieConsent = localStorage.getItem('cookieConsent')
            if (!cookieConsent) {
                // Show consent after a small delay for better UX
                setTimeout(() => {
                    setShowCookieConsent(true)
                }, 1000)
            }
        }
    }, [])

    const handleAcceptCookies = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cookieConsent', 'accepted')
            localStorage.setItem('cookieConsentDate', new Date().toISOString())
        }
        setShowCookieConsent(false)
    }

    const handleDeclineCookies = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cookieConsent', 'declined')
            localStorage.setItem('cookieConsentDate', new Date().toISOString())
        }
        setShowCookieConsent(false)
    }

    const footerLinks = {
        Product: [
            { name: 'Features', href: '/features' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'API Access', href: '/api' },
            { name: 'Roadmap', href: '/roadmap' }
        ],
        Marketplace: [
            { name: 'Explore', href: '/explore' },
            { name: 'Categories', href: '/categories' },
            { name: 'Top Sellers', href: '/sellers' },
            { name: 'New Arrivals', href: '/new' }
        ],
        Resources: [
            { name: 'Blog', href: '/blog' },
            { name: 'Guides', href: '/guides' },
            { name: 'Help Center', href: '/help' },
            { name: 'Community', href: '/community' }
        ],
        Company: [
            { name: 'About', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' },
            { name: 'Press Kit', href: '/press' }
        ]
    }

    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: '#' },
        { name: 'LinkedIn', icon: Linkedin, href: '#' },
        { name: 'GitHub', icon: Github, href: '#' },
        { name: 'YouTube', icon: Youtube, href: '#' }
    ]

    return (
        <>
            <footer className="bg-black text-white border-t border-gray-800">
                <Container>
                    <div className="py-12 md:py-16">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                            <div className="col-span-2">
                                <Link
                                    href="/"
                                    className="flex items-center space-x-2 mb-4">
                                    <span className="font-league-spartan font-bold text-2xl text-brand-primary">Spyke AI</span>
                                </Link>
                                <p className="font-kumbh-sans text-gray-400 mb-6 max-w-xs">
                                    The premium marketplace for AI prompts, automation tools, and digital solutions.
                                </p>
                                <div className="flex space-x-4">
                                    {socialLinks.map((social) => {
                                        const Icon = social.icon
                                        return (
                                            <a
                                                key={social.name}
                                                href={social.href}
                                                className="p-2 text-gray-400 hover:text-brand-primary bg-white/5 hover:bg-brand-primary/10 rounded-lg transition-all duration-300"
                                                aria-label={social.name}>
                                                <Icon className="h-5 w-5" />
                                            </a>
                                        )
                                    })}
                                </div>
                            </div>
                            {Object.entries(footerLinks).map(([category, links]) => (
                                <div
                                    key={category}
                                    className="col-span-1">
                                    <h3 className="font-league-spartan font-semibold text-white mb-4">{category}</h3>
                                    <ul className="space-y-3">
                                        {links.map((link) => (
                                            <li key={link.name}>
                                                <Link
                                                    href={link.href}
                                                    className="font-kumbh-sans text-sm text-gray-400 hover:text-brand-primary transition-colors">
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        <div className="pt-8 border-t border-gray-800">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <p className="font-kumbh-sans text-sm text-gray-400">© {new Date().getFullYear()} Spyke AI. All rights reserved.</p>
                                <div className="flex flex-wrap justify-center gap-6 text-sm">
                                    <Link
                                        href="/terms"
                                        className="font-kumbh-sans text-gray-400 hover:text-brand-primary transition-colors">
                                        Terms of Service
                                    </Link>
                                    <Link
                                        href="/privacy"
                                        className="font-kumbh-sans text-gray-400 hover:text-brand-primary transition-colors">
                                        Privacy Policy
                                    </Link>
                                    <Link
                                        href="/cookies"
                                        className="font-kumbh-sans text-gray-400 hover:text-brand-primary transition-colors">
                                        Cookie Policy
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </footer>
            <AnimatePresence>
                {showCookieConsent && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
                        <div className="max-w-7xl mx-auto">
                            <div className="relative bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-transparent rounded-2xl blur-xl opacity-50" />

                                <div className="relative">
                                    <button
                                        onClick={() => setShowCookieConsent(false)}
                                        className="absolute top-0 right-0 p-2 text-gray-400 hover:text-white transition-colors sm:hidden"
                                        aria-label="Close cookie banner">
                                        <X className="h-4 w-4" />
                                    </button>

                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                        {/* Content */}
                                        <div className="flex-1 pr-8 sm:pr-0">
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="p-2 bg-brand-primary/20 rounded-lg flex-shrink-0">
                                                    <Cookie className="h-5 w-5 sm:h-6 sm:w-6 text-brand-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-league-spartan font-semibold text-lg sm:text-xl text-white mb-2">
                                                        We use cookies 🍪
                                                    </h3>
                                                    <p className="font-kumbh-sans text-sm sm:text-base text-gray-300 leading-relaxed">
                                                        We use cookies to enhance your experience, analyze site traffic, and for marketing purposes.
                                                        By continuing to use our site, you consent to our use of cookies.
                                                        <Link
                                                            href="/cookies"
                                                            className="text-brand-primary hover:text-white ml-1 underline underline-offset-2 transition-colors">
                                                            Learn more
                                                        </Link>
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:flex-shrink-0">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleDeclineCookies}
                                                className="px-6 py-2.5 font-kumbh-sans font-medium text-sm sm:text-base text-gray-300 bg-white/10 hover:bg-white/20 border border-gray-600 rounded-xl transition-all duration-200 whitespace-nowrap">
                                                Decline
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleAcceptCookies}
                                                className="relative group px-6 py-2.5 font-kumbh-sans font-semibold text-sm sm:text-base text-black bg-brand-primary hover:bg-brand-primary/90 rounded-xl transition-all duration-200 whitespace-nowrap">
                                                <span className="relative z-10">Accept All</span>
                                                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary to-green-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    <details className="mt-4 group">
                                        <summary className="cursor-pointer text-sm text-gray-400 hover:text-brand-primary transition-colors font-kumbh-sans">
                                            Manage cookie preferences
                                        </summary>
                                        <div className="mt-4 space-y-3 pl-4">
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked
                                                    disabled
                                                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <div>
                                                    <span className="font-medium text-sm text-gray-300">Essential Cookies</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">Required for the website to function properly</p>
                                                </div>
                                            </label>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <div>
                                                    <span className="font-medium text-sm text-gray-300">Analytics Cookies</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">Help us understand how visitors use our site</p>
                                                </div>
                                            </label>
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    defaultChecked
                                                    className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-brand-primary focus:ring-brand-primary"
                                                />
                                                <div>
                                                    <span className="font-medium text-sm text-gray-300">Marketing Cookies</span>
                                                    <p className="text-xs text-gray-500 mt-0.5">Used to deliver personalized advertisements</p>
                                                </div>
                                            </label>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
