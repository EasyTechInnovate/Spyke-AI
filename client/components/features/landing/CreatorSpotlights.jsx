'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Award, Users } from 'lucide-react'
import Container from '@/components/shared/layout/Container'
import Link from 'next/link'
import Image from 'next/image'
import sellerAPI from '@/lib/api/seller'

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
                        badge: s.badge || (s.isFeatured ? 'Featured' : ''),
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
        <section className="relative py-20 lg:py-24 bg-gray-950">
            <Container>
                <div className="max-w-7xl mx-auto">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full mb-6">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium text-yellow-500">Creator Spotlights</span>
                        </div>

                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-title">Meet Top Sellers This Month</h2>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
                            Learn from the best creators building amazing AI tools and automations
                        </p>
                    </motion.div>

                    {/* Creators Grid - responsive: auto-fit columns so items expand to fill available space
              If there's exactly one seller, center it and make the card constrained and centered like the Featured Product section. */}
                    {!loading && creators.length === 1 ? (
                        // Narrower centered card to reduce 'zoomed-in' feel
                        <div className="max-w-lg mx-auto">
                            {creators.map((creator) => (
                                <div
                                    key={creator.id || 'single'}
                                    className="mx-auto">
                                    <Link
                                        href={`/profile/${creator?.id || ''}`}
                                        className="group block h-full"
                                        prefetch={false}>
                                        <div className="relative bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10">
                                            {/* Badge */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <span className="px-2 py-1 text-xs font-semibold bg-brand-primary text-brand-primary-text rounded-full">
                                                    {creator.badge}
                                                </span>
                                            </div>

                                            {/* Reduced-size content for less zoom */}
                                            <div className="p-6 flex flex-col">
                                                <div className="w-full h-40 mb-4 bg-gray-800 rounded overflow-hidden">
                                                    <Image
                                                        src={creator.banner || creator.avatar}
                                                        alt={creator?.name || 'Seller'}
                                                        width={800}
                                                        height={320}
                                                        className="object-cover w-full h-full"
                                                        unoptimized={true}
                                                    />
                                                </div>

                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="relative">
                                                        <Image
                                                            src={creator.avatar}
                                                            alt={creator?.name || 'Seller'}
                                                            width={60}
                                                            height={60}
                                                            className="rounded-full border-2 border-gray-800"
                                                            unoptimized={true}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-semibold text-white font-title">{creator?.name}</h3>
                                                        <p className="text-sm text-gray-400">{creator?.title}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="text-xs text-gray-400">Sales</div>
                                                        <div className="text-white font-semibold text-sm">{creator.stats.sales}</div>
                                                    </div>
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="text-xs text-gray-400">Rating</div>
                                                        <div className="text-white font-semibold text-sm">{creator.stats.rating}</div>
                                                    </div>
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="text-xs text-gray-400">Products</div>
                                                        <div className="text-white font-semibold text-sm">{creator.stats.products}</div>
                                                    </div>
                                                    <div className="bg-gray-800/50 rounded-lg p-2">
                                                        <div className="text-xs text-gray-400">Revenue</div>
                                                        <div className="text-white font-semibold text-sm">{creator.stats.revenue}</div>
                                                    </div>
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {(creator.specialties || []).slice(0, 6).map((specialty, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                                                {specialty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="mt-5 text-center">
                                                    <span className="inline-block px-5 py-2 bg-brand-primary text-brand-primary-text rounded-lg text-sm">
                                                        View Profile →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="grid gap-6"
                            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                            {(loading ? new Array(8).fill(null) : creators).map((creator, index) => (
                                <motion.div
                                    key={creator?.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}>
                                    {loading ? (
                                        <div className="h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse" />
                                    ) : (
                                        <Link
                                            href={`/profile/${creator?.id || ''}`}
                                            className="group block h-full"
                                            prefetch={false}>
                                            <div className="relative h-full bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10">
                                                {/* Badge */}
                                                <div className="absolute top-4 right-4 z-10">
                                                    <span className="px-3 py-1 text-xs font-bold bg-brand-primary text-brand-primary-text rounded-full">
                                                        {creator.badge}
                                                    </span>
                                                </div>

                                                {/* Content */}
                                                <div className="p-6 flex flex-col h-full">
                                                    {/* Profile */}
                                                    <div className="flex items-start gap-4 mb-6">
                                                        <div className="relative">
                                                            <Image
                                                                src={creator.avatar}
                                                                alt={creator?.name || 'Seller'}
                                                                width={60}
                                                                height={60}
                                                                className="rounded-full border-2 border-gray-800 group-hover:border-brand-primary transition-colors"
                                                                unoptimized={true}
                                                            />
                                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-white group-hover:text-brand-primary transition-colors font-title">
                                                                {creator?.name}
                                                            </h3>
                                                            <p className="text-sm text-gray-400">{creator?.title}</p>
                                                        </div>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <TrendingUp className="w-3 h-3 text-brand-primary" />
                                                                <span className="text-xs text-gray-400">Sales</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">{creator.stats.sales}</p>
                                                        </div>

                                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Star className="w-3 h-3 text-yellow-500" />
                                                                <span className="text-xs text-gray-400">Rating</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">{creator.stats.rating}</p>
                                                        </div>

                                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Award className="w-3 h-3 text-purple-500" />
                                                                <span className="text-xs text-gray-400">Products</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">{creator.stats.products}</p>
                                                        </div>

                                                        <div className="bg-gray-800/50 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Users className="w-3 h-3 text-green-500" />
                                                                <span className="text-xs text-gray-400">Revenue</span>
                                                            </div>
                                                            <p className="text-sm font-semibold text-white">{creator.stats.revenue}</p>
                                                        </div>
                                                    </div>

                                                    {/* Specialties */}
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500 mb-2">Specializes in:</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(creator.specialties || []).slice(0, 6).map((specialty, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs px-2 py-1 bg-gray-800 text-gray-400 rounded-full">
                                                                    {specialty}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* View Profile */}
                                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                                        <span className="text-sm text-brand-primary group-hover:text-brand-primary/80 transition-colors">
                                                            View Profile →
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-center mt-12">
                        <Link
                            href="/sellers"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-primary-text font-semibold rounded-xl hover:bg-brand-primary/90 transition-all duration-200 group font-body">
                            Browse All Creators
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
