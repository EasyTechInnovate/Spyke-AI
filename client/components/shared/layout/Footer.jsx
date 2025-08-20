'use client'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Container from './Container'
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react'

export default function Footer() {
    // Routes that don't exist yet - disable prefetching to avoid 404 errors
    const nonExistentRoutes = [
        '/features',
        '/pricing',
        '/api',
        '/roadmap',
        '/explore',
        '/categories',
        '/sellers',
        '/new',
        '/blog',
        '/guides',
        '/help',
        '/community',
        '/about',
        '/careers',
        '/contact',
        '/press'
    ]

    const footerLinks = {
        Product: [
            { name: 'Features', href: '/features', prefetch: false },
            { name: 'Pricing', href: '/pricing', prefetch: false },
            { name: 'API Access', href: '/api', prefetch: false },
            { name: 'Roadmap', href: '/roadmap', prefetch: false }
        ],
        Marketplace: [
            { name: 'Explore', href: '/explore', prefetch: false },
            { name: 'Categories', href: '/categories', prefetch: false },
            { name: 'Top Sellers', href: '/sellers', prefetch: false },
            { name: 'New Arrivals', href: '/new', prefetch: false }
        ],
        Resources: [
            { name: 'Blog', href: '/blog', prefetch: false },
            { name: 'Guides', href: '/guides', prefetch: false },
            { name: 'Help Center', href: '/help', prefetch: false },
            { name: 'Community', href: '/community', prefetch: false }
        ],
        Company: [
            { name: 'About', href: '/about', prefetch: false },
            { name: 'Careers', href: '/careers', prefetch: false },
            { name: 'Contact', href: '/contact', prefetch: false },
            { name: 'Press Kit', href: '/press', prefetch: false }
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
                                                    prefetch={link.prefetch !== false}
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
        </>
    )
}

