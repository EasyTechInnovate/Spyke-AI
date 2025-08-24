'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Download, Star } from 'lucide-react'
import Link from 'next/link'

import { DESIGN_TOKENS, DSButton, DSHeading, DSText, DSStack, DSContainer } from '@/lib/design-system'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'

export default function StickyPurchaseBar({
    product,
    hasPurchased,
    isOwner,
    onBuyNow,
    onAddToCart,
    onDownload
}) {
    if (!product) return null

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 backdrop-blur-lg border-t z-40 shadow-2xl"
            style={{
                backgroundColor: `${DESIGN_TOKENS.colors.background.card.dark}95`,
                borderColor: DESIGN_TOKENS.colors.background.elevated
            }}>
            <DSContainer maxWidth="hero" padding="responsive">
                <div className="py-4">
                    <DSStack
                        direction="row"
                        justify="space-between"
                        align="center"
                        gap="4">
                        <DSStack direction="row" gap="4" align="center">
                            <div
                                className="w-12 h-12 relative rounded-lg overflow-hidden hidden sm:block"
                                style={{ backgroundColor: DESIGN_TOKENS.colors.background.elevated }}>
                                <OptimizedImage
                                    src={product.thumbnail}
                                    alt={product.title}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                    quality={75}
                                />
                            </div>
                            <div>
                                <DSHeading
                                    level={3}
                                    className="line-clamp-1"
                                    style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {product.title}
                                </DSHeading>
                                <DSStack direction="row" gap="3" align="center">
                                    <DSText
                                        size="2xl"
                                        className="font-bold"
                                        style={{ color: DESIGN_TOKENS.colors.brand.primary }}>
                                        ${product.price}
                                    </DSText>
                                    {product.originalPrice > product.price && (
                                        <DSText
                                            size="sm"
                                            className="line-through"
                                            style={{ color: DESIGN_TOKENS.colors.text.muted.dark }}>
                                            ${product.originalPrice}
                                        </DSText>
                                    )}
                                    {product.averageRating > 0 && (
                                        <DSStack direction="row" gap="1" align="center">
                                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                            <DSText
                                                size="sm"
                                                style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                {product.averageRating.toFixed(1)}
                                            </DSText>
                                        </DSStack>
                                    )}
                                </DSStack>
                            </div>
                        </DSStack>

                        <DSStack direction="row" gap="3" align="center">
                            {hasPurchased ? (
                                <DSButton variant="primary" onClick={onDownload}>
                                    <Download className="w-5 h-5" />
                                </DSButton>
                            ) : isOwner ? (
                                <Link href="/seller/products">
                                    <DSButton variant="primary">Manage</DSButton>
                                </Link>
                            ) : (
                                <>
                                    <DSButton variant="primary" onClick={onBuyNow}>
                                        Buy Now
                                    </DSButton>
                                    <DSButton variant="secondary" onClick={onAddToCart}>
                                        <ShoppingCart className="w-5 h-5" />
                                    </DSButton>
                                </>
                            )}
                        </DSStack>
                    </DSStack>
                </div>
            </DSContainer>
        </motion.div>
    )
}