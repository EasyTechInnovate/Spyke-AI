'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { DESIGN_TOKENS, DSHeading, DSText, DSStack } from '@/lib/design-system'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

export default function RelatedProducts({ relatedProducts, currentProduct }) {
    const router = useRouter()

    if (!relatedProducts || relatedProducts.length === 0) return null

    return (
        <div className="mt-16">
            <DSStack
                direction="row"
                justify="space-between"
                align="center"
                className="mb-8">
                <DSHeading
                    level={2}
                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                    You Might Also Like
                </DSHeading>
                <Link
                    href={`/explore?category=${currentProduct?.category}`}
                    className="transition-colors hover:underline flex items-center gap-1"
                    style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                    View More
                    <ChevronRight className="w-4 h-4" />
                </Link>
            </DSStack>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                    <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        whileHover={{ y: -5 }}
                        className="group cursor-pointer"
                        onClick={() => router.push(`/products/${product.slug}`)}>
                        <div
                            className="rounded-xl overflow-hidden border transition-all h-full flex flex-col hover:shadow-lg"
                            style={{
                                backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                                borderColor: DESIGN_TOKENS.colors.background.elevated
                            }}>
                            <div
                                className="aspect-video relative overflow-hidden"
                                style={{ backgroundColor: DESIGN_TOKENS.colors.background.elevated }}>
                                <OptimizedImage
                                    src={product.thumbnail}
                                    alt={product.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    quality={75}
                                    loading="lazy"
                                />
                                {product.discountPercentage > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                        -{product.discountPercentage}%
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <DSHeading
                                    level={3}
                                    className="mb-2 line-clamp-2 group-hover:opacity-80 transition-opacity"
                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {product.title}
                                </DSHeading>
                                <DSText
                                    size="sm"
                                    className="mb-3 line-clamp-2 flex-1"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    {product.shortDescription}
                                </DSText>
                                <DSStack
                                    direction="row"
                                    justify="space-between"
                                    align="center">
                                    <div>
                                        <DSText
                                            size="xl"
                                            className="font-bold"
                                            style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                                            ${product.price}
                                        </DSText>
                                        {product.originalPrice > product.price && (
                                            <DSText
                                                size="sm"
                                                className="line-through ml-2"
                                                style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                                ${product.originalPrice}
                                            </DSText>
                                        )}
                                    </div>
                                    <DSStack
                                        direction="row"
                                        gap="1"
                                        align="center">
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                        <DSText
                                            size="sm"
                                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                            {product.averageRating?.toFixed(1) || '0.0'}
                                        </DSText>
                                    </DSStack>
                                </DSStack>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}