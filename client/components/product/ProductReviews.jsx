'use client'
import React, { useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Award, LogIn, MessageSquare } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationProvider } from '@/components/shared/notifications/NotificationProvider'
import productsAPI from '@/lib/api/products'
import UnifiedReviewForm from '@/components/product/UnifiedReviewForm'
import ReviewsList from '@/components/product/ReviewsList'

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
}

export default function ProductReviews({ product, onProductUpdate }) {
    const { isAuthenticated, requireAuth } = useAuth()
    const { showSuccess, showError } = useNotificationProvider()

    const handleReviewSubmit = useCallback(
        async (reviewData) => {
            if (!isAuthenticated) {
                requireAuth()
                return
            }
            if (!product?._id) {
                showError('Product not found', 'Unable to find the product to review')
                return
            }
            try {
                const response = await productsAPI.addReview(product._id, reviewData)
                if (response?.data) {
                    showSuccess('Review submitted successfully!', 'Thank you for your feedback')
                    if (onProductUpdate) {
                        onProductUpdate({
                            reviews: response.data.reviews || product.reviews,
                            averageRating: response.data.averageRating || product.averageRating,
                            totalReviews: response.data.totalReviews || product.totalReviews,
                            reviewStats: response.data.reviewStats || product.reviewStats
                        })
                    }
                } else {
                    showSuccess('Review submitted!', 'Your review has been added')
                }
            } catch (error) {
                console.error('Error submitting review:', error)
                if (error.status === 400) {
                    showError('Invalid review data', error.message || 'Please check your review and try again')
                } else if (error.status === 401) {
                    showError('Please log in', 'You need to log in to submit a review')
                    requireAuth()
                } else if (error.status === 403) {
                    showError('Not allowed', 'You are not allowed to review this product')
                } else if (error.status === 409) {
                    showError('Already reviewed', 'You have already reviewed this product')
                } else {
                    showError('Failed to submit review', error.message || 'Please try again later')
                }
            }
        },
        [isAuthenticated, product, requireAuth, showSuccess, showError, onProductUpdate]
    )

    const reviewMetrics = useMemo(() => {
        const totalReviews = product?.totalReviews || product?.reviews?.length || 0
        const averageRating = product?.averageRating || 0
        const reviews = product?.reviews || []
        let satisfaction = 0
        let distribution = []
        if (totalReviews > 0 && reviews.length > 0) {
            const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            reviews.forEach((review) => {
                const rating = Math.floor(review.rating || 0)
                if (rating >= 1 && rating <= 5) {
                    ratingCounts[rating]++
                }
            })
            satisfaction = Math.round(((ratingCounts[5] + ratingCounts[4]) / totalReviews) * 100)
            distribution = [5, 4, 3, 2, 1].map((rating) => ({
                rating,
                count: ratingCounts[rating],
                percentage: totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0
            }))
        } else {
            distribution = [5, 4, 3, 2, 1].map((rating) => ({
                rating,
                count: 0,
                percentage: 0
            }))
        }
        return {
            totalReviews,
            averageRating,
            satisfaction,
            distribution,
            hasReviews: totalReviews > 0
        }
    }, [product])

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return 'Excellent'
        if (rating >= 4.0) return 'Very Good'
        if (rating >= 3.5) return 'Good'
        if (rating >= 3.0) return 'Average'
        return 'Fair'
    }

    return (
        <div className="relative bg-black">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-black" />
                <motion.div
                    animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: 'linear'
                    }}
                    className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                        <MessageSquare className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-[#00FF89] font-medium text-sm">Customer Reviews</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">What customers are saying</h2>
                </motion.div>

                {isAuthenticated ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-2xl p-8 bg-black/50 border border-gray-700/50">
                        <UnifiedReviewForm
                            variant="quickReview"
                            productId={product?._id}
                            onReviewSubmit={handleReviewSubmit}
                            showHeader={true}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="relative overflow-hidden rounded-2xl p-8 bg-black/50 border border-gray-700/50">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF89]/10 rounded-full mb-6">
                                <MessageSquare className="w-8 h-8 text-[#00FF89]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">Share Your Experience</h3>
                            <p className="text-lg text-gray-300 mb-6 max-w-md mx-auto leading-relaxed">
                                Help others make informed decisions by sharing your experience with this product.
                            </p>
                            <button
                                onClick={requireAuth}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-xl font-medium text-lg transition-all hover:scale-105">
                                <LogIn className="w-5 h-5" />
                                Sign in to add review
                            </button>
                        </div>
                    </motion.div>
                )}

                {reviewMetrics.hasReviews && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-[#00FF89]" />
                            <h3 className="text-2xl font-bold text-white">Customer Feedback</h3>
                        </div>

                        <div className="relative overflow-hidden rounded-2xl p-8 bg-black/50 border border-gray-700/50">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-6 h-6 transition-colors ${
                                                        star <= reviewMetrics.averageRating ? 'text-amber-400 fill-current' : 'text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-2xl font-bold text-white ml-2">{reviewMetrics.averageRating.toFixed(1)}</span>
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
                                        <Award className="w-5 h-5" />
                                        <span className="font-medium text-lg">{getRatingLabel(reviewMetrics.averageRating)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-300">
                                    <span className="text-lg font-medium">
                                        {reviewMetrics.totalReviews} review{reviewMetrics.totalReviews !== 1 ? 's' : ''}
                                    </span>
                                    <span className="hidden sm:inline text-gray-500">•</span>
                                    <span className="text-lg">{reviewMetrics.satisfaction}% satisfaction</span>
                                </div>
                            </div>

                            <ReviewsList
                                reviews={product?.reviews || []}
                                totalReviews={reviewMetrics.totalReviews}
                                averageRating={reviewMetrics.averageRating}
                                reviewStats={product?.reviewStats || {}}
                            />
                        </div>
                    </motion.div>
                )}

                {!reviewMetrics.hasReviews && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative overflow-hidden rounded-2xl p-12 bg-black/50 border border-gray-700/50">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00FF89]/10 rounded-full mb-6">
                                <Star className="w-10 h-10 text-[#00FF89]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{isAuthenticated ? 'Be the First to Review' : 'No Reviews Yet'}</h3>
                            <p className="text-lg text-gray-300 max-w-md mx-auto mb-8 leading-relaxed">
                                {isAuthenticated
                                    ? 'Share your experience with this product and help the seller improve their offering.'
                                    : 'Be the first to share your experience with this product.'}
                            </p>
                            {!isAuthenticated && (
                                <button
                                    onClick={requireAuth}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-xl font-medium text-lg transition-all hover:scale-105">
                                    <LogIn className="w-5 h-5" />
                                    Sign in to add review
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

