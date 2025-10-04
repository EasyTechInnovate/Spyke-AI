'use client'
import React, { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
export default function Navigation({ showBecomeSeller }) {
    const navRef = useRef(null)
    return (
        <nav
            ref={navRef}
            className="hidden md:flex items-center space-x-3 lg:space-x-6 xl:space-x-8 pb-2">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/explore"
                    className="nav-link px-4 py-3 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10 whitespace-nowrap">
                    Explore
                </Link>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/creators"
                    className="nav-link px-4 py-3 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10 whitespace-nowrap">
                    Sellers
                </Link>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/categories"
                    className="nav-link px-4 py-3 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10 whitespace-nowrap">
                    Categories
                </Link>
            </motion.div>
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <a
                    href="https://forms.gle/oUBZ3DL29Y4txZ8z5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link px-4 py-3 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10 whitespace-nowrap">
                    Hire Us
                </a>
            </motion.div>
            {showBecomeSeller && (
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <Link
                        href="/seller-benefits"
                        className="nav-link flex items-center gap-2 px-4 py-3 text-base font-medium text-[#00FF89] hover:text-[#00e67a] rounded-md transition-all duration-200 hover:bg-[#00FF89]/10 whitespace-nowrap">
                        <TrendingUp className="w-4 h-4" />
                        Become a Seller
                    </Link>
                </motion.div>
            )}
        </nav>
    )
}