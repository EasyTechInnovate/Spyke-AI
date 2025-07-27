'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react'
import { EMPTY_CART_MESSAGES } from '../constants'

export default function EmptyCart() {
    const { title, subtitle, primaryAction, secondaryAction } = EMPTY_CART_MESSAGES

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
        >
            {/* Icon */}
            <EmptyCartIcon />

            {/* Content */}
            <h1 className="text-3xl font-bold text-white mb-4">
                {title}
            </h1>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                {subtitle}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                    href={primaryAction.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] text-[#121212] font-semibold rounded-xl hover:bg-[#00FF89]/90 transition-colors"
                >
                    {primaryAction.label}
                    <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                    href={secondaryAction.href}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-[#00FF89]/50 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {secondaryAction.label}
                </Link>
            </div>
        </motion.div>
    )
}

function EmptyCartIcon() {
    return (
        <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00FF89]/20 to-transparent rounded-full blur-xl" />
            <div className="relative w-full h-full bg-[#1f1f1f] rounded-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-gray-500" />
            </div>
        </div>
    )
}