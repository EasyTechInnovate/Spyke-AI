'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Award } from 'lucide-react'

import { DESIGN_TOKENS, DSButton, DSHeading, DSText, DSStack } from '@/lib/design-system'
import QuickReview from '@/components/product/QuickReview'
import ReviewsList from '@/components/product/ReviewsList'
import { useAuth } from '@/hooks/useAuth'

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export default function ProductReviews({ product, onReviewSubmit }) {
    const { isAuthenticated } = useAuth()

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit">
            {/* Refined Reviews Header with Statistics */}
            <div className="mb-8">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                    {/* Overall Rating Card */}
                    <div 
                        className="text-center p-6 rounded-xl border group hover:shadow-lg transition-all hover:-translate-y-0.5"
                        style={{
                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                            borderColor: '#00FF8940'
                        }}>
                        <div className="mb-3">
                            <DSText 
                                className="text-2xl font-bold group-hover:scale-105 transition-transform"
                                style={{ color: '#00FF89' }}>
                                {product?.averageRating?.toFixed(1) || '0.0'}
                            </DSText>
                        </div>
                        <div className="flex justify-center mb-3">
                            {[1,2,3,4,5].map((star) => (
                                <Star 
                                    key={star}
                                    className={`w-4 h-4 transition-all ${
                                        star <= (product?.averageRating || 0) 
                                            ? "fill-current group-hover:scale-110" 
                                            : "group-hover:scale-105 opacity-30"
                                    }`}
                                    style={{ 
                                        color: star <= (product?.averageRating || 0) ? '#FFC050' : '#666'
                                    }}
                                />
                            ))}
                        </div>
                        <DSText 
                            className="text-xs mb-3"
                            style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                            Based on {product?.totalReviews || 0} reviews
                        </DSText>
                        
                        {/* Rating Badge */}
                        <div 
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                                backgroundColor: '#FFC05020',
                                borderColor: '#FFC05050',
                                color: '#FFC050',
                                border: '1px solid'
                            }}>
                            <Award className="w-3 h-3" />
                            {product?.averageRating >= 4.5 ? 'Excellent' : 
                             product?.averageRating >= 4.0 ? 'Very Good' :
                             product?.averageRating >= 3.5 ? 'Good' : 
                             product?.averageRating >= 3.0 ? 'Average' : 'Fair'}
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div 
                        className="md:col-span-2 p-6 rounded-xl border hover:shadow-lg transition-all hover:-translate-y-0.5"
                        style={{
                            backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                            borderColor: '#FFC05040'
                        }}>
                        <div className="flex items-center gap-3 mb-4">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: '#FFC050' }}>
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            <DSHeading level={4} style={{ color: '#FFC050', fontSize: '1.125rem', fontWeight: '600' }}>
                                Rating Breakdown
                            </DSHeading>
                        </div>
                        <div className="space-y-2">
                            {[5,4,3,2,1].map((rating) => {
                                const count = product?.reviewStats?.[`${rating}Star`] || 0;
                                const percentage = product?.totalReviews > 0 
                                    ? (count / product.totalReviews) * 100 
                                    : 0;
                                    
                                return (
                                    <div key={rating} className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 w-8">
                                            <span className="text-xs font-medium"
                                                  style={{ color: DESIGN_TOKENS.colors.text.secondary.dark }}>
                                                {rating}
                                            </span>
                                            <Star className="w-2.5 h-2.5 fill-current" style={{ color: '#FFC050' }} />
                                        </div>
                                        <div 
                                            className="flex-1 h-2 rounded-full overflow-hidden"
                                            style={{ backgroundColor: '#FFC05015' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 0.8, delay: rating * 0.1 }}
                                                className="h-full rounded-full"
                                                style={{ backgroundColor: '#FFC050' }}
                                            />
                                        </div>
                                        <span 
                                            className="text-xs font-medium w-6 text-right"
                                            style={{ color: '#FFC050' }}>
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t" 
                             style={{ borderColor: '#FFC05020' }}>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <Users className="w-3 h-3" style={{ color: '#00FF89' }} />
                                    <DSText className="text-xs" style={{ color: '#00FF89' }}>
                                        Total Reviews
                                    </DSText>
                                </div>
                                <DSText className="font-semibold text-sm" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {product?.totalReviews || 0}
                                </DSText>
                            </div>
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingUp className="w-3 h-3" style={{ color: '#00FF89' }} />
                                    <DSText className="text-xs" style={{ color: '#00FF89' }}>
                                        Satisfaction
                                    </DSText>
                                </div>
                                <DSText className="font-semibold text-sm" style={{ color: DESIGN_TOKENS.colors.text.primary.dark }}>
                                    {product?.totalReviews > 0 ? 
                                        Math.round(((product?.reviewStats?.['5Star'] || 0) + 
                                                   (product?.reviewStats?.['4Star'] || 0)) / 
                                                   product.totalReviews * 100) : 0}%
                                </DSText>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Review for authenticated users */}
            {isAuthenticated && (
                <div 
                    className="mb-8 p-5 rounded-xl border"
                    style={{
                        backgroundColor: DESIGN_TOKENS.colors.background.card.dark,
                        borderColor: '#00FF8940'
                    }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: '#00FF89' }}>
                            <Star className="w-4 h-4 text-black" />
                        </div>
                        <DSHeading level={4} style={{ color: '#00FF89', fontSize: '1.125rem', fontWeight: '600' }}>
                            Share Your Experience
                        </DSHeading>
                    </div>
                    <QuickReview
                        productId={product?._id}
                        onReviewSubmit={onReviewSubmit}
                    />
                </div>
            )}

            {/* Reviews List */}
            <ReviewsList
                reviews={product?.reviews || []}
                totalReviews={product?.totalReviews || 0}
                averageRating={product?.averageRating || 0}
                reviewStats={product?.reviewStats || {}}
            />
        </motion.div>
    )
}