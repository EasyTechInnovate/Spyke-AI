'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Star, ThumbsUp, ThumbsDown, BarChart3, TrendingUp, TrendingDown } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell, LineChart } from 'recharts'

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount || 0)
}

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

const clamp = (num, min, max) => Math.min(Math.max(num ?? 0, min), max)
const truncate = (str, max = 16) => (str?.length > max ? `${str.slice(0, max - 1)}…` : str || '')

export const FeedbackTab = ({ analyticsData, timeRange, loading }) => {
    const [feedbackData, setFeedbackData] = useState(null)

    const generateTimeSeriesData = (timeRange) => {
        const getDaysFromTimeRange = (period) => {
            switch (period) {
                case '7d':
                    return 7
                case '30d':
                    return 30
                case '90d':
                    return 90
                case '1y':
                    return 365
                default:
                    return 30
            }
        }

        const days = getDaysFromTimeRange(timeRange)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(endDate.getDate() - (days - 1))

        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)

            trends.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: currentDate.toISOString().split('T')[0],
                totalReviews: 0,
                avgRating: 0,
                positivePercentage: 0,
                satisfactionScore: 0
            })
        }

        return trends
    }

    const computeDerivedMetrics = (data) => {
        const summary = data.summary || {}
        const totalReviews = summary.totalReviews || 0
        const totalRatings =
            (summary.rating5 || 0) + (summary.rating4 || 0) + (summary.rating3 || 0) + (summary.rating2 || 0) + (summary.rating1 || 0)

        const positiveReviews = (summary.rating5 || 0) + (summary.rating4 || 0)
        const negativeReviews = (summary.rating1 || 0) + (summary.rating2 || 0)
        const neutralReviews = summary.rating3 || 0

        const positiveRate = totalRatings > 0 ? (positiveReviews / totalRatings) * 100 : 0
        const negativeRate = totalRatings > 0 ? (negativeReviews / totalRatings) * 100 : 0
        const neutralRate = totalRatings > 0 ? (neutralReviews / totalRatings) * 100 : 0

        const satisfactionScore =
            totalRatings > 0
                ? ((summary.rating5 || 0) * 100 + (summary.rating4 || 0) * 75 + (summary.rating3 || 0) * 50 + (summary.rating2 || 0) * 25) /
                  totalRatings
                : 0

        const responseRate = totalReviews > 0 ? 100 : 0
        const avgRating = summary.avgRating || 0

        const nps = totalRatings > 0 ? positiveRate - negativeRate : 0

        return {
            totalReviews,
            totalRatings,
            positiveReviews,
            negativeReviews,
            neutralReviews,
            positiveRate,
            negativeRate,
            neutralRate,
            satisfactionScore,
            responseRate,
            avgRating,
            nps,
            engagementRate: totalReviews > 0 ? 100 : 0
        }
    }

    const processedData = useMemo(() => {
        if (!analyticsData?.data) return null

        const data = analyticsData.data
        const metrics = computeDerivedMetrics(data)
        const trends = generateTimeSeriesData(timeRange)

        const ratingDistribution = [
            {
                name: '5 Stars',
                value: data.summary?.rating5 || 0,
                color: '#00FF89',
                percentage: metrics.totalRatings > 0 ? ((data.summary?.rating5 || 0) / metrics.totalRatings) * 100 : 0
            },
            {
                name: '4 Stars',
                value: data.summary?.rating4 || 0,
                color: '#3B82F6',
                percentage: metrics.totalRatings > 0 ? ((data.summary?.rating4 || 0) / metrics.totalRatings) * 100 : 0
            },
            {
                name: '3 Stars',
                value: data.summary?.rating3 || 0,
                color: '#F59E0B',
                percentage: metrics.totalRatings > 0 ? ((data.summary?.rating3 || 0) / metrics.totalRatings) * 100 : 0
            },
            {
                name: '2 Stars',
                value: data.summary?.rating2 || 0,
                color: '#EF4444',
                percentage: metrics.totalRatings > 0 ? ((data.summary?.rating2 || 0) / metrics.totalRatings) * 100 : 0
            },
            {
                name: '1 Star',
                value: data.summary?.rating1 || 0,
                color: '#7C2D12',
                percentage: metrics.totalRatings > 0 ? ((data.summary?.rating1 || 0) / metrics.totalRatings) * 100 : 0
            }
        ]

        const sentimentDistribution = [
            { name: 'Positive', value: metrics.positiveReviews, color: '#00FF89', percentage: metrics.positiveRate },
            { name: 'Neutral', value: metrics.neutralReviews, color: '#F59E0B', percentage: metrics.neutralRate },
            { name: 'Negative', value: metrics.negativeReviews, color: '#EF4444', percentage: metrics.negativeRate }
        ].filter((item) => item.value > 0)

        return {
            metrics,
            trends,
            ratingDistribution: ratingDistribution.filter((item) => item.value > 0),
            sentimentDistribution,
            feedback: data.feedback || [],
            pagination: data.pagination || {}
        }
    }, [analyticsData, timeRange])

    useEffect(() => {
        setFeedbackData(processedData)
    }, [processedData])

    const shouldShowLoading = loading && !analyticsData
    const shouldShowSkeleton = !feedbackData && !analyticsData

    if (shouldShowLoading || shouldShowSkeleton) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-800 rounded-lg p-6 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-gray-800 rounded-lg p-6 h-80 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-full bg-gray-700 rounded"></div>
                </div>
            </div>
        )
    }

    const safeMetrics = feedbackData?.metrics || {
        totalReviews: 0,
        totalRatings: 0,
        positiveReviews: 0,
        negativeReviews: 0,
        neutralReviews: 0,
        positiveRate: 0,
        negativeRate: 0,
        neutralRate: 0,
        satisfactionScore: 0,
        responseRate: 0,
        avgRating: 0,
        nps: 0,
        engagementRate: 0
    }

    const safeRatingDistribution = feedbackData?.ratingDistribution || []
    const safeSentimentDistribution = feedbackData?.sentimentDistribution || []
    const safeFeedback = feedbackData?.feedback || []

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Reviews</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeMetrics.totalReviews)}</div>
                    <div className="text-sm text-[#00FF89] flex items-center gap-1">
                        <span>{formatPercentage(safeMetrics.responseRate)} response rate</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{safeMetrics.avgRating ? safeMetrics.avgRating.toFixed(1) : '0.0'}/5</div>
                    <div className="text-sm text-gray-400">Overall satisfaction</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Positive Reviews</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <ThumbsUp className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeMetrics.positiveReviews)}</div>
                    <div className="text-sm text-[#00FF89] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{formatPercentage(safeMetrics.positiveRate)} positive</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Satisfaction Score</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{safeMetrics.satisfactionScore.toFixed(0)}%</div>
                    <div className="text-sm text-gray-400">Weighted average</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Rating Distribution</h3>
                    </div>
                    <div className="h-64 relative">
                        {safeRatingDistribution.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%">
                                <PieChart>
                                    <Pie
                                        data={safeRatingDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name.split(' ')[0]}★ ${percentage.toFixed(1)}%`}
                                        labelLine={false}>
                                        {safeRatingDistribution.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                        formatter={(value, name) => [formatNumber(value), name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No rating data available</p>
                                    <p className="text-sm mt-2">Ratings will appear here once customers start reviewing products</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Sentiment Analysis</h3>
                    </div>
                    <div className="h-64 relative">
                        {safeSentimentDistribution.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%">
                                <PieChart>
                                    <Pie
                                        data={safeSentimentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                                        labelLine={false}>
                                        {safeSentimentDistribution.map((entry, index) => (
                                            <Cell
                                                key={`sentiment-${index}`}
                                                fill={entry.color}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                        formatter={(value, name) => [formatNumber(value), name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No sentiment data available</p>
                                    <p className="text-sm mt-2">Sentiment analysis will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Rating Breakdown</h3>
                <div className="space-y-4">
                    {[
                        { stars: 5, count: analyticsData?.data?.summary?.rating5 || 0, color: '#00FF89' },
                        { stars: 4, count: analyticsData?.data?.summary?.rating4 || 0, color: '#3B82F6' },
                        { stars: 3, count: analyticsData?.data?.summary?.rating3 || 0, color: '#F59E0B' },
                        { stars: 2, count: analyticsData?.data?.summary?.rating2 || 0, color: '#EF4444' },
                        { stars: 1, count: analyticsData?.data?.summary?.rating1 || 0, color: '#7C2D12' }
                    ].map((rating) => {
                        const percentage = safeMetrics.totalRatings > 0 ? (rating.count / safeMetrics.totalRatings) * 100 : 0
                        return (
                            <div
                                key={rating.stars}
                                className="flex items-center gap-4">
                                <div className="flex items-center gap-1 w-16">
                                    <span className="text-white font-medium">{rating.stars}</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                </div>
                                <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-300"
                                        style={{
                                            width: `${percentage}%`,
                                            backgroundColor: rating.color
                                        }}
                                    />
                                </div>
                                <div className="text-white font-medium w-12 text-right">{formatNumber(rating.count)}</div>
                                <div className="text-gray-400 text-sm w-12 text-right">{percentage.toFixed(1)}%</div>
                            </div>
                        )
                    })}
                </div>

                {safeMetrics.totalRatings === 0 && (
                    <div className="text-center text-gray-400 py-8">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No reviews available yet</p>
                        <p className="text-sm mt-2">Customer reviews and ratings will be displayed here</p>
                    </div>
                )}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400">Net Promoter Score</span>
                            <span className={`font-medium ${safeMetrics.nps >= 0 ? 'text-[#00FF89]' : 'text-[#EF4444]'}`}>
                                {safeMetrics.nps.toFixed(1)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400">Positive Rate</span>
                            <span className="text-white font-medium">{formatPercentage(safeMetrics.positiveRate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400">Negative Rate</span>
                            <span className="text-white font-medium">{formatPercentage(safeMetrics.negativeRate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400">Neutral Rate</span>
                            <span className="text-white font-medium">{formatPercentage(safeMetrics.neutralRate)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400">Engagement Rate</span>
                            <span className="text-white font-medium">{formatPercentage(safeMetrics.engagementRate)}</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Review Summary</h3>
                    <div className="space-y-4">
                        <div className="text-center py-6">
                            <div className="text-4xl font-bold text-white mb-2">
                                {safeMetrics.avgRating ? safeMetrics.avgRating.toFixed(1) : '0.0'}
                            </div>
                            <div className="flex justify-center mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.floor(safeMetrics.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                    />
                                ))}
                            </div>
                            <div className="text-gray-400 text-sm">Based on {formatNumber(safeMetrics.totalRatings)} ratings</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                            <div className="text-center">
                                <div className="text-lg font-bold text-[#00FF89]">{formatNumber(safeMetrics.positiveReviews)}</div>
                                <div className="text-xs text-gray-400">Positive</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-[#F59E0B]">{formatNumber(safeMetrics.neutralReviews)}</div>
                                <div className="text-xs text-gray-400">Neutral</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-[#EF4444]">{formatNumber(safeMetrics.negativeReviews)}</div>
                                <div className="text-xs text-gray-400">Negative</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Feedback</h3>
                <div className="space-y-4">
                    {safeFeedback.length > 0 ? (
                        safeFeedback.slice(0, 5).map((item, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < (item.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-white font-medium">{item.rating || 0}/5</span>
                                    </div>
                                    <span className="text-gray-400 text-sm">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                                    </span>
                                </div>
                                <p className="text-gray-300 mb-2">{item.comment || 'No comment provided'}</p>
                                <p className="text-gray-400 text-sm">Product: {item.productName || 'Unknown Product'}</p>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No feedback available</p>
                            <p className="text-sm mt-2">Customer feedback will appear here as it comes in</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
