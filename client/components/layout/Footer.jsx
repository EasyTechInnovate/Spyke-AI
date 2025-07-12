'use client'
import Link from 'next/link'
import Container from './Container'
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react'

export default function Footer() {
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
        <footer className="bg-gray-50 dark:bg-brand-dark border-t border-gray-200 dark:border-gray-800">
            <Container>
                <div className="py-12 md:py-16">
                    {/* Top Section */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-2">
                            <Link
                                href="/"
                                className="flex items-center space-x-2 mb-4">
                                {/* <Logo className="h-10 w-10" /> */}
                                <span className="font-league-spartan font-bold text-2xl text-brand-dark dark:text-brand-primary">Spyke AI</span>
                            </Link>
                            <p className="font-kumbh-sans text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                                The premium marketplace for AI prompts, automation tools, and digital solutions.
                            </p>
                            <div className="flex space-x-4">
                                {socialLinks.map((social) => {
                                    const Icon = social.icon
                                    return (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors"
                                            aria-label={social.name}>
                                            <Icon className="h-5 w-5" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>

                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h3 className="font-league-spartan font-semibold text-brand-dark dark:text-white mb-4">{category}</h3>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                href={link.href}
                                                className="font-kumbh-sans text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Section */}
                    <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="font-kumbh-sans text-sm text-gray-600 dark:text-gray-400">© 2024 Spyke AI. All rights reserved.</p>
                            <div className="flex flex-wrap justify-center gap-6 text-sm">
                                <Link
                                    href="/terms"
                                    className="font-kumbh-sans text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                                    Terms of Service
                                </Link>
                                <Link
                                    href="/privacy"
                                    className="font-kumbh-sans text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                                    Privacy Policy
                                </Link>
                                <Link
                                    href="/cookies"
                                    className="font-kumbh-sans text-gray-600 dark:text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors">
                                    Cookie Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
