'use client'
import { useState } from 'react'
import { Star, ThumbsUp, MessageSquare, Filter } from 'lucide-react'
export default function SellerReviews({ reviews = [], sellerId }) {
    const [sortBy, setSortBy] = useState('newest') 
    const [filterRating, setFilterRating] = useState('all') 
    const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
        const count = reviews.filter(review => Math.floor(review.rating) === rating).length
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
        return { rating, count, percentage }
    })
    const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0
    const filteredReviews = reviews
        .filter(review => filterRating === 'all' || Math.floor(review.rating) === parseInt(filterRating))
        .sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt)
                case 'highest':
                    return b.rating - a.rating
                case 'lowest':
                    return a.rating - b.rating
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt)
            }
        })
    if (reviews.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
                <p className="text-gray-400">This seller hasn't received any reviews yet.</p>
            </div>
        )
    }
    return (
        <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                            <span className="text-4xl font-bold text-white">
                                {averageRating.toFixed(1)}
                            </span>
                            <div>
                                <div className="flex items-center gap-1 mb-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${
                                                star <= averageRating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-400">
                                    {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {ratingDistribution.map(({ rating, count, percentage }) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm text-gray-400 w-6">{rating}</span>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <div className="flex-1 bg-gray-800 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-sm text-gray-400 w-8">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <select
                        value={filterRating}
                        onChange={(e) => setFilterRating(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                    </select>
                </div>
                <span className="text-sm text-gray-400">
                    {filteredReviews.length} of {reviews.length} reviews
                </span>
            </div>
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
            {filteredReviews.length >= 10 && (
                <div className="text-center">
                    <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Load More Reviews
                    </button>
                </div>
            )}
        </div>
    )
}
function ReviewCard({ review }) {
    const {
        id,
        rating,
        title,
        comment,
        reviewer,
        product,
        createdAt,
        helpful = 0,
        verified = false
    } = review
    const timeAgo = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                            {reviewer?.name?.charAt(0) || 'U'}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">
                                {reviewer?.name || 'Anonymous'}
                            </span>
                            {verified && (
                                <span className="px-2 py-0.5 bg-brand-primary/20 text-brand-primary text-xs rounded-full">
                                    Verified Purchase
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${
                                            star <= rating
                                                ? 'text-yellow-400 fill-current'
                                                : 'text-gray-600'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400">{timeAgo}</span>
                        </div>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                </button>
            </div>
            {title && (
                <h4 className="font-semibold text-white mb-2">{title}</h4>
            )}
            <p className="text-gray-300 leading-relaxed mb-4">{comment}</p>
            {product && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400">
                        Product: <span className="text-gray-300">{product.title}</span>
                    </div>
                    {helpful > 0 && (
                        <div className="text-sm text-gray-400">
                            {helpful} found helpful
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}