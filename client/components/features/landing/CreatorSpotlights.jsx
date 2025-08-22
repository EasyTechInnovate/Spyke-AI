'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Award, Users, Loader2, UserX } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import sellerAPI from '@/lib/api/seller'

import {
  DSContainer,
  DSStack,
  DSHeading,
  DSText,
  DSButton,
  DSBadge,
  DSLoadingState
} from '@/lib/design-system'

export default function CreatorSpotlights() {
    const [creators, setCreators] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function loadTopSellers() {
            try {
                setLoading(true)
                // Use existing public search endpoint. Limit to 8 for the grid.
                const res = await sellerAPI.searchSellers('?limit=8')

                // The API may return different shapes. Normalize defensively.
                const raw = res?.sellers || res?.results || res || []

                const mapped = (Array.isArray(raw) ? raw : []).map((s) => {
                    const userAvatar = s.userId?.avatar || null
                    const banner = s.sellerBanner || s.banner || null
                    const niches = Array.isArray(s.niches) ? s.niches : []
                    const tools = Array.isArray(s.toolsSpecialization) ? s.toolsSpecialization : []
                    const specialties = Array.from(new Set([...(s.specialties || []), ...niches, ...tools]))

                    return {
                        id: s._id || s.id || s.sellerId || s.userId?._id,
                        name: s.fullName || s.name || s.displayName || s.username || s.email || 'Unknown',
                        avatar: userAvatar || s.avatar || '/logo-icon.svg',
                        banner: banner,
                        title: s.bio || s.title || s.headline || '',
                        badge: s.badge || (s.isFeatured ? 'Featured' : 'Creator'),
                        stats: {
                            sales: s.stats?.totalSales ?? s.totalSales ?? '—',
                            rating: s.stats?.averageRating ?? s.rating ?? '—',
                            products: s.stats?.totalProducts ?? s.productCount ?? '—',
                            revenue:
                                typeof s.stats?.totalEarnings === 'number'
                                    ? `$${s.stats.totalEarnings.toLocaleString()}`
                                    : (s.stats?.totalEarnings ?? s.totalEarnings ?? '—')
                        },
                        specialties: specialties
                    }
                })

                if (mounted) setCreators(mapped)
            } catch (err) {
                console.error('Failed to load top sellers', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        loadTopSellers()

        return () => {
            mounted = false
        }
    }, [])

    return (
        <section className="relative py-12 sm:py-16 lg:py-20 bg-[#0a0a0a]">
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            'radial-gradient(600px 200px at 20% 50%, rgba(255,193,7,.03), transparent), radial-gradient(400px 150px at 80% 50%, rgba(255,193,7,.03), transparent)'
                    }}
                />
            </div>

            <div className="relative z-10">
                <DSContainer>
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12 sm:mb-16">
                        
                        <DSBadge variant="secondary" icon={Star} className="mb-4 sm:mb-6">
                            Creator Spotlights
                        </DSBadge>

                        <DSHeading level={2} variant="hero" className="mb-3 sm:mb-4">
                            <span style={{ color: 'white' }}>Meet Top Sellers This Month</span>
                        </DSHeading>

                        <DSText variant="subhero" style={{ color: '#9ca3af' }}>
                            Learn from the best creators building amazing AI tools and automations
                        </DSText>
                    </motion.div>

                    {/* Loading State */}
                    {loading ? (
                        <DSLoadingState 
                            icon={Loader2}
                            message="Loading top creators..."
                            className="h-48 sm:h-64"
                        />
                    ) : creators.length === 0 ? (
                        /* Empty State */
                        <div className="text-center py-12 sm:py-16">
                            <DSStack gap="medium" direction="column" align="center">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 rounded-xl flex items-center justify-center">
                                    <UserX className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                                </div>
                                
                                <DSText style={{ color: '#9ca3af' }}>
                                    No creators available at the moment
                                </DSText>
                                
                                <Link href="/sellers">
                                    <DSButton variant="secondary" size="medium">
                                        Browse All Creators
                                    </DSButton>
                                </Link>
                            </DSStack>
                        </div>
                    ) : creators.length === 1 ? (
                        /* Single Creator - Centered */
                        <div className="flex justify-center">
                            <div className="w-full max-w-md">
                                <CreatorCard creator={creators[0]} />
                            </div>
                        </div>
                    ) : (
                        /* Multiple Creators Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {creators.slice(0, 8).map((creator, index) => (
                                <motion.div
                                    key={creator.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.05 }}
                                    className="w-full h-full">
                                    <CreatorCard creator={creator} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    {creators.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="text-center mt-8 sm:mt-12">
                            <Link href="/sellers">
                                <DSButton variant="primary" size="large" className="group">
                                    <span>Browse All Creators</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </DSButton>
                            </Link>
                        </motion.div>
                    )}
                </DSContainer>
            </div>
        </section>
    )
}

// Separate CreatorCard component for better organization
function CreatorCard({ creator }) {
    return (
        <div className="group h-full">
            <Link
                href={`/profile/${creator?.id || ''}`}
                className="block h-full"
                prefetch={false}>
                <div className="relative h-full bg-[#171717] border border-gray-800 rounded-xl overflow-hidden hover:border-[#00FF89]/50 transition-all duration-200 hover:shadow-lg hover:shadow-[#00FF89]/5 flex flex-col">
                    
                    {/* Badge */}
                    {creator.badge && (
                        <div className="absolute top-3 right-3 z-10">
                            <DSBadge variant="primary" size="small" className="shadow-sm">
                                {creator.badge}
                            </DSBadge>
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-4 flex flex-col h-full">
                        <DSStack direction="column" gap="small" className="h-full">
                            
                            {/* Profile Header */}
                            <DSStack direction="row" gap="small" align="center">
                                <div className="relative flex-shrink-0">
                                    <Image
                                        src={creator.avatar}
                                        alt={creator?.name || 'Creator'}
                                        width={48}
                                        height={48}
                                        className="rounded-full border-2 border-gray-700 group-hover:border-[#00FF89] transition-colors"
                                        unoptimized={true}
                                    />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-[#171717]" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-white group-hover:text-[#00FF89] transition-colors truncate">
                                        {creator?.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 truncate">
                                        {creator?.title || 'AI Creator'}
                                    </p>
                                </div>
                            </DSStack>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-gray-800/50 rounded-lg p-2">
                                    <DSStack direction="row" gap="xsmall" align="center" className="mb-1">
                                        <TrendingUp className="w-3 h-3 text-[#00FF89]" />
                                        <span className="text-xs text-gray-400">Sales</span>
                                    </DSStack>
                                    <span className="text-xs font-semibold text-white">{creator.stats.sales}</span>
                                </div>

                                <div className="bg-gray-800/50 rounded-lg p-2">
                                    <DSStack direction="row" gap="xsmall" align="center" className="mb-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        <span className="text-xs text-gray-400">Rating</span>
                                    </DSStack>
                                    <span className="text-xs font-semibold text-white">
                                        {typeof creator.stats.rating === 'number' ? creator.stats.rating.toFixed(1) : creator.stats.rating}
                                    </span>
                                </div>

                                <div className="bg-gray-800/50 rounded-lg p-2">
                                    <DSStack direction="row" gap="xsmall" align="center" className="mb-1">
                                        <Award className="w-3 h-3 text-purple-500" />
                                        <span className="text-xs text-gray-400">Products</span>
                                    </DSStack>
                                    <span className="text-xs font-semibold text-white">{creator.stats.products}</span>
                                </div>
                            </div>

                            {/* Specialties */}
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                                <div className="flex flex-wrap gap-1">
                                    {(creator.specialties || []).slice(0, 4).map((specialty, idx) => (
                                        <span
                                            key={idx}
                                            className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                            {specialty}
                                        </span>
                                    ))}
                                    {creator.specialties?.length > 4 && (
                                        <span className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                            +{creator.specialties.length - 4}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* View Profile Link */}
                            <div className="pt-2 border-t border-gray-800">
                                <span className="text-sm text-[#00FF89] group-hover:text-[#00FF89]/80 transition-colors">
                                    View Profile →
                                </span>
                            </div>
                        </DSStack>
                    </div>
                </div>
            </Link>
        </div>
    )
}
