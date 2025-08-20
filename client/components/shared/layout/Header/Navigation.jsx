'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Navigation() {
    const navRef = useRef(null)

    return (
        <nav
            ref={navRef}
            className="flex items-center space-x-1 sm:space-x-2">
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/explore"
                    className="nav-link px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-gray-100">
                    Explore
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/sellers"
                    className="nav-link px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-gray-100">
                    Sellers
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/categories"
                    className="nav-link px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-gray-100">
                    Categories
                </Link>
            </motion.div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Link
                    href="/how-it-works"
                    className="nav-link px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-primary rounded-md transition-all duration-200 hover:bg-gray-100">
                    How It Works
                </Link>
            </motion.div>
        </nav>
    )
}
