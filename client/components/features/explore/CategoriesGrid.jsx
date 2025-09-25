'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Package, BarChart3, Users, ArrowUpRight, Info, Plus } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import { motion } from 'framer-motion'

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

                        return (
                            <motion.div
                                key={cat._id}
                                variants={itemVariants}
                                onHoverStart={() => setHoveredCard(cat._id)}
                                onHoverEnd={() => setHoveredCard(null)}
                                whileHover={{
                                    y: -4,
                                    transition: { duration: 0.2, ease: 'easeOut' }
                                }}
                                className="group">
                                <Link
                                    href={`/explore?category=${cat._id}`}
                                    className="block h-full p-6 bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-xl transition-all duration-300 hover:bg-gray-900/60 hover:border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:ring-offset-2 focus:ring-offset-black">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg flex items-center justify-center border border-green-500/20">
                                                <Icon className="w-7 h-7 text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
                                                    {humanizeId(cat._id)}
                                                </div>
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

                {/* Info Notice about more categories */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-16 max-w-2xl mx-auto"
                >
                    <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                                <Info className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                    More Categories Coming Soon
                                    <Plus className="w-4 h-4 text-green-400" />
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Our system is continuously expanding and adding new product categories based on market trends and user needs. 
                                    New categories will automatically appear here as they become available, ensuring you always have access to the latest 
                                    and most relevant product classifications.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Container>
        </div>
    )
}
