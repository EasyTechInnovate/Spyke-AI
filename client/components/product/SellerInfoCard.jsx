'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Trophy } from 'lucide-react'

import { DESIGN_TOKENS, DSButton, DSHeading, DSText, DSStack } from '@/lib/design-system'

export default function SellerInfoCard({ 
    product, 
    onViewProfile 
}) {
    if (!product?.sellerId) return null

    const seller = product.sellerId

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-sm rounded-xl p-4 border"
            style={{
                backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                borderColor: DESIGN_TOKENS.colors.background.elevated
            }}>
            <DSStack
                direction="row"
                justify="space-between"
                align="center">
                <DSStack
                    direction="row"
                    gap="3"
                    align="center">
                    <div className="relative">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, ${DESIGN_TOKENS.colors.brand.secondary})`
                            }}>
                            <DSText
                                size="lg"
                                className="font-bold"
                                style={{ color: DESIGN_TOKENS.colors.brand.primaryText }}>
                                {seller?.fullName?.charAt(0) || 'S'}
                            </DSText>
                        </div>
                    </div>
                    <div>
                        <DSText
                            className="font-semibold"
                            style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                            {seller?.fullName || 'Anonymous Seller'}
                        </DSText>
                        <DSStack
                            direction="row"
                            gap="3">
                            <DSStack
                                direction="row"
                                gap="1"
                                align="center">
                                <Trophy className="w-3 h-3" />
                                <DSText
                                    size="xs"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    {seller?.stats?.totalSales || 0}+ sales
                                </DSText>
                            </DSStack>
                            <DSStack
                                direction="row"
                                gap="1"
                                align="center">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <DSText
                                    size="xs"
                                    style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                    {seller?.stats?.averageRating?.toFixed(1) || '0.0'}
                                </DSText>
                            </DSStack>
                        </DSStack>
                    </div>
                </DSStack>
                <DSButton
                    variant="secondary"
                    size="small"
                    onClick={onViewProfile}>
                    View Profile
                </DSButton>
            </DSStack>
        </motion.div>
    )
}