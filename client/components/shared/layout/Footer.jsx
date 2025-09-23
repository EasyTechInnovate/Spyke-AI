'use client'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Container from './Container'
import { SpykeLogo } from '@/components/Logo'
import { Twitter, Linkedin, Youtube, Facebook, Instagram } from 'lucide-react'
export default function Footer() {
    const footerLinks = {
        Product: [
            { name: 'Promotion Policy', href: '/promotion-policy', prefetch: false },
            { name: 'Refund & Return Policy', href: '/refund-policy', prefetch: false },
            { name: 'Payment Policy', href: '/payment-policy', prefetch: false },
        ],
        Marketplace: [
            { name: 'Explore', href: '/explore', prefetch: false },
            { name: 'Categories', href: '/categories', prefetch: false },
            { name: 'Top Sellers', href: '/sellers', prefetch: false },
            { name: 'New Arrivals', href: '/new', prefetch: false }
        ],
        Resources: [
            { name: 'Blog', href: '/blog', prefetch: false },
        ],
        Company: [
            { name: 'About Us', href: '/aboutus', prefetch: true },
            { name: 'Contact Us', href: '/contactus', prefetch: true },
            { name: 'Terms and Condition', href: '/terms', prefetch: true },
            { name: 'Privacy Policy', href: '/privacy-policy', prefetch: false },
            { name: 'Seller Aggrement', href: '/seller-agreement', prefetch: false }
        ]
    }
    const socialLinks = [
        { name: 'Twitter', icon: Twitter, href: 'https://x.com/spykeai' },
        { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/company/spykeai/' },
        { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/Spykeai/' },
        { name: 'YouTube', icon: Youtube, href: 'https://www.youtube.com/@SpykeAITech?sub_confirmation=1' },
        { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/spykeai/' }
    ]
    return (
        <>
            <footer className="bg-black text-white border-t border-gray-800">
                <Container>
                    <div className="py-6 md:py-8">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 mb-6">
                            <div className="col-span-2">
                                <Link
                                    href="/"
                                    className="flex items-center mb-4">
                                    <SpykeLogo
                                        sizePreset="lg"
                                        showText={false}
                                        darkMode={true}
                                        priority={false}
                                        className="hover:scale-105 transition-transform duration-300"
                                    />
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
                                                target="_blank"
                                                rel="noopener noreferrer"
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
                        <div className="pt-4 border-t border-gray-800">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                <p className="font-kumbh-sans text-sm text-gray-400">© {new Date().getFullYear()} Spyke AI. All rights reserved.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </footer>
        </>
    )
}