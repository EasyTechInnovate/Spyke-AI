'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Package, BarChart3, Users, ArrowUpRight, Info, Plus } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { motion } from 'framer-motion'

const slugify = (val = '') =>
    val
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

export default function CategoriesGrid({ blogCategories = [] }) {
    const [hoveredCard, setHoveredCard] = useState(null)

    const humanizeId = (id) => id.replace(/[_-]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
            <Container className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-2 py-2 bg-gray-900/50 border border-gray-800 rounded-lg mb-6 mt-6">
                        <BarChart3 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-300 font-medium">Product Categories</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Browse by Category</h1>
                    <p className="text-lg text-gray-400 leading-relaxed">
                        Explore our comprehensive collection of AI-powered solutions, organized by business function and use case.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {blogCategories.map((cat, index) => {
                        // Get icon from the category data or default to Package
                        const iconName = cat.iconName || 'Package'
                        const Icon = Package // We'll use Package as default for now
                        const safeSlug = cat.slug?.current || slugify(cat.title || '') || (cat._id || `c${index + 1}`)

                        return (
                            <motion.div
                                key={cat._id || safeSlug}
                                variants={itemVariants}
                                onHoverStart={() => setHoveredCard(cat._id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                whileHover={{
                                    y: -4,
                                    transition: { duration: 0.2, ease: 'easeOut' }
                                }}
                                className="group">
                                <Link
                                    href={`/explore?category=${cat._id || safeSlug}`}
                                    className="block h-full p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-xl transition-all duration-300 hover:bg-gray-900/60 hover:border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-black">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg flex items-center justify-center border border-green-500/20">
                                                <Icon className="w-7 h-7 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                                                    {cat.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                                    </div>

                                    {cat.description && (
                                        <p className="text-gray-400 group-hover:text-gray-300 mb-6 text-sm leading-relaxed transition-colors duration-300">
                                            {cat.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-700/30 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-green-400" />
                                            <span className="text-sm text-green-400 font-semibold">
                                                {cat.postCount || 0} {(cat.postCount || 0) !== 1 ? 'Products' : 'Product'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 group-hover:text-green-400 transition-colors duration-300 font-medium">
                                            VIEW ALL
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {!blogCategories.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="mt-16 max-w-3xl mx-auto">
                        <div className="relative overflow-hidden rounded-2xl border border-gray-800/60 bg-gradient-to-b from-gray-900/40 to-gray-900/20 p-[1px]">
                            <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-green-500/20 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
                            <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md p-6 md:p-8">
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
                                        <div className="absolute inset-0 -z-10 rounded-xl bg-blue-500/20 blur-xl" />
                                        <Info className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-semibold text-white mb-2 flex items-center gap-2">
                                            More Categories Coming Soon
                                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-300">
                                                <Plus className="w-3.5 h-3.5" />
                                                Updates
                                            </span>
                                        </h3>
                                        <p className="text-gray-300/90 text-sm leading-relaxed">
                                            Our system is continuously expanding and adding new product categories based on market trends and user
                                            needs. New categories will automatically appear here as they become available, ensuring you always have
                                            access to the latest and most relevant product classifications.
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-gray-700/50 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
                                                Marketing
                                            </span>
                                            <span className="rounded-full border border-gray-700/50 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
                                                Finance
                                            </span>
                                            <span className="rounded-full border border-gray-700/50 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
                                                Legal
                                            </span>
                                            <span className="rounded-full border border-gray-700/50 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
                                                HR
                                            </span>
                                            <span className="rounded-full border border-gray-700/50 bg-gray-800/60 px-3 py-1 text-xs text-gray-300">
                                                Security
                                            </span>
                                        </div>
                                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                            <Link
                                                href="/explore"
                                                className="inline-flex items-center justify-center rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm font-medium text-green-300 hover:bg-green-500/20 transition-colors">
                                                Browse All Products
                                                <ArrowUpRight className="ml-1.5 h-4 w-4" />
                                            </Link>
                                            <Link
                                                href="/contact"
                                                className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-gray-800/60 px-4 py-2 text-sm font-medium text-gray-300 hover:border-gray-600 hover:bg-gray-800 transition-colors">
                                                Suggest a Category
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </Container>
        </div>
    )
}

