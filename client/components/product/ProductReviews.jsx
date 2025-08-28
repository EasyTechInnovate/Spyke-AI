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

    // Handle review submission
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
                // Call the products API to submit the review
                const response = await productsAPI.addReview(product._id, reviewData)

                if (response?.data) {
                    showSuccess('Review submitted successfully!', 'Thank you for your feedback')

                    // Update the product data if parent provides update function
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

    // Calculate review metrics
    const reviewMetrics = useMemo(() => {
        const totalReviews = product?.totalReviews || product?.reviews?.length || 0
        const averageRating = product?.averageRating || 0
        const reviews = product?.reviews || []

        // Calculate satisfaction and distribution from actual reviews
        let satisfaction = 0
        let distribution = []

        if (totalReviews > 0 && reviews.length > 0) {
            // Count ratings from actual review data
            const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

            reviews.forEach((review) => {
                const rating = Math.floor(review.rating || 0)
                if (rating >= 1 && rating <= 5) {
                    ratingCounts[rating]++
                }
            })

            // Calculate satisfaction (4-5 star reviews)
            satisfaction = Math.round(((ratingCounts[5] + ratingCounts[4]) / totalReviews) * 100)

            // Create distribution array
            distribution = [5, 4, 3, 2, 1].map((rating) => ({
                rating,
                count: ratingCounts[rating],
                percentage: totalReviews > 0 ? (ratingCounts[rating] / totalReviews) * 100 : 0
            }))
        } else {
            // Default empty distribution
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
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-4 sm:space-y-6">
            
            {/* Review Form or Sign In Prompt */}
            {isAuthenticated ? (
                <UnifiedReviewForm
                    variant="quickReview"
                    productId={product?._id}
                    onReviewSubmit={handleReviewSubmit}
                    showHeader={true}
                />
            ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-primary/10 rounded-full mb-4">
                            <MessageSquare className="w-6 h-6 text-brand-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Share Your Experience</h3>
                        <p className="text-gray-400 text-sm mb-4 max-w-sm mx-auto">
                            Help others make informed decisions by sharing your experience with this product.
                        </p>
                        <button
                            onClick={requireAuth}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign in to add review
                        </button>
                    </div>
                </div>
            )}

            {/* Customer Reviews Section - Mobile Optimized */}
            {reviewMetrics.hasReviews && (
                <div className="bg-gray-900 rounded-xl sm:rounded-2xl border border-gray-800">
                    {/* Header with Mobile-First Design */}
                    <div className="p-4 sm:p-6 border-b border-gray-800">
                        {/* Mobile: Stack vertically, Desktop: Side by side */}
                        <div className="flex flex-col gap-3 sm:gap-4">
                            {/* Title and Rating Row */}
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <h3 className="text-lg sm:text-xl font-semibold text-white">Customer Reviews</h3>

                                    {/* Rating Display - Mobile Optimized */}
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-0.5 sm:gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                                                        star <= reviewMetrics.averageRating ? 'text-amber-400 fill-current' : 'text-gray-600'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-base sm:text-lg font-semibold text-white">
                                            {reviewMetrics.averageRating.toFixed(1)}
                                        </span>

                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-medium">
                                            <Award className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                            <span className="hidden xs:inline">{getRatingLabel(reviewMetrics.averageRating)}</span>
                                            <span className="xs:hidden">{getRatingLabel(reviewMetrics.averageRating).slice(0, 4)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats - Mobile Optimized */}
                                <div className="text-xs sm:text-sm text-gray-400 flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                                    <span>
                                        {reviewMetrics.totalReviews} review{reviewMetrics.totalReviews !== 1 ? 's' : ''}
                                    </span>
                                    <span className="hidden xs:inline">•</span>
                                    <span>{reviewMetrics.satisfaction}% satisfaction</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews List with Mobile Padding */}
                    <div className="p-3 sm:p-6">
                        <ReviewsList
                            reviews={product?.reviews || []}
                            totalReviews={reviewMetrics.totalReviews}
                            averageRating={reviewMetrics.averageRating}
                            reviewStats={product?.reviewStats || {}}
                        />
                    </div>
                </div>
            )}

            {/* Empty State - Mobile Optimized */}
            {!reviewMetrics.hasReviews && (
                <div className="text-center py-6 sm:py-8">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                        {isAuthenticated ? 'Be the First to Review' : 'No Reviews Yet'}
                    </h3>
                    <p className="text-gray-400 text-sm max-w-xs sm:max-w-sm mx-auto mb-4 sm:mb-6 px-4">
                        {isAuthenticated 
                            ? 'Share your experience with this product and help the seller improve their offering.'
                            : 'Be the first to share your experience with this product.'
                        }
                    </p>
                    {!isAuthenticated && (
                        <button
                            onClick={requireAuth}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign in to add review
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    )
}

