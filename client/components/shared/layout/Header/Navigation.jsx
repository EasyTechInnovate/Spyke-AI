'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navigation() {
    const navRef = useRef(null)

    return (
        <nav
            ref={navRef}
            className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/explore"
                    className="nav-link px-3 py-2 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10">
                    Explore
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/sellers"
                    className="nav-link px-3 py-2 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10">
                    Sellers
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/categories"
                    className="nav-link px-3 py-2 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10">
                    Categories
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/how-it-works"
                    className="nav-link px-3 py-2 text-base font-medium text-white/80 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-white/10">
                    How It Works
                </Link>
            </motion.div>
        </nav>
    )
}
