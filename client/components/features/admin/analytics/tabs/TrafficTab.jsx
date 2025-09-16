'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Eye, Users, MousePointer, TrendingUp, Globe, BarChart3, Activity, Target, ArrowRight } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell, RadialBarChart, RadialBar, AreaChart, LineChart } from 'recharts'

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

const formatPrice = (price, formattedPrice) => {
    if (formattedPrice && formattedPrice !== '$undefined' && !formattedPrice.includes('undefined')) {
        return formattedPrice
    }
    if (typeof price === 'number' && price > 0) {
        return formatCurrency(price)
    }
    return 'Price not set'
}

export const TrafficTab = ({ analyticsData, timeRange, loading }) => {
    const [trafficData, setTrafficData] = useState(null)

    const generateTimeSeriesData = (timeRange) => {
        const getDaysFromTimeRange = (period) => {
            switch (period) {
                case '7d': return 7
                case '30d': return 30
                case '90d': return 90
                case '1y': return 365
                default: return 30
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
                views: 0,
                users: 0,
                engagementRate: 0,
                conversionRate: 0
            })
        }

        return trends
    }

    const computeDerivedMetrics = (data) => {
        const summary = data.summary || {}
        const engagement = data.engagement || {}
        const conversion = data.conversion || {}

        // Fix data mapping based on actual API response structure
        const totalUsers = summary.newUsers || engagement.totalNewUsers || 0
        const engagedUsers = engagement.buyerUsers || 0
        const totalSales = conversion.totalSales || summary.totalSales || 0
        const totalViews = summary.totalViews || summary.platformViews || 0

        const engagementRate = engagement.engagementRate || summary.engagementRate || 0
        const conversionRate = totalUsers > 0 ? (totalSales / totalUsers) * 100 : (conversion.avgConversionRate || summary.conversionRate || 0)
        const averageOrderValue = totalSales > 0 ? (summary.totalRevenue || 0) / totalSales : 0
        const bounceRate = Math.max(0, 100 - engagementRate)
        const clickThroughRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0

        const computedMetrics = {
            totalUsers,
            engagedUsers,
            totalSales,
            totalViews,
            engagementRate,
            conversionRate,
            averageOrderValue,
            bounceRate,
            clickThroughRate,
            retentionRate: engagementRate * 0.8,
            growthRate: totalUsers > 0 ? Math.min(totalUsers * 2, 100) : 0
        }

        return computedMetrics
    }

    const processedData = useMemo(() => {
        // Handle both nested and direct data structures
        // If analyticsData has a 'data' property, use it, otherwise use analyticsData directly
        const rawData = analyticsData?.data || analyticsData
        
        if (!rawData) return null

        const metrics = computeDerivedMetrics(rawData)
        const trends = generateTimeSeriesData(timeRange)

        const userJourney = [
            { stage: 'Visitors', count: metrics.totalUsers, percentage: 100, color: '#00FF89' },
            { stage: 'Engaged', count: metrics.engagedUsers, percentage: metrics.totalUsers > 0 ? (metrics.engagedUsers / metrics.totalUsers) * 100 : 0, color: '#3B82F6' },
            { stage: 'Converted', count: metrics.totalSales, percentage: metrics.totalUsers > 0 ? (metrics.totalSales / metrics.totalUsers) * 100 : 0, color: '#8B5CF6' }
        ]

        const trafficSources = [
            { name: 'Direct', value: Math.floor(metrics.totalUsers * 0.4), percentage: 40, color: '#00FF89' },
            { name: 'Search', value: Math.floor(metrics.totalUsers * 0.35), percentage: 35, color: '#3B82F6' },
            { name: 'Social', value: Math.floor(metrics.totalUsers * 0.15), percentage: 15, color: '#F59E0B' },
            { name: 'Referral', value: Math.floor(metrics.totalUsers * 0.1), percentage: 10, color: '#EF4444' }
        ].filter(source => source.value > 0)

        const deviceBreakdown = [
            { name: 'Desktop', value: Math.floor(metrics.totalUsers * 0.6), percentage: 60, color: '#00FF89' },
            { name: 'Mobile', value: Math.floor(metrics.totalUsers * 0.35), percentage: 35, color: '#3B82F6' },
            { name: 'Tablet', value: Math.floor(metrics.totalUsers * 0.05), percentage: 5, color: '#8B5CF6' }
        ].filter(device => device.value > 0)

        const categoryPerformance = (rawData.categoryViews || []).map((cat, index) => ({
            name: cat._id?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
            views: cat.totalViews || 0,
            products: cat.productCount || 0,
            avgViews: cat.avgViewsPerProduct || 0,
            color: ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'][index % 5]
        }))

        const topProducts = (rawData.topViewedProducts || []).map((product, index) => ({
            ...product,
            rank: index + 1,
            formattedSellerName: product.sellerId?.fullName || 'Unknown Seller'
        }))

        return {
            metrics,
            trends,
            userJourney,
            trafficSources,
            deviceBreakdown,
            categoryPerformance,
            topProducts,
            conversion: rawData.conversion || {},
            engagement: rawData.engagement || {}
        }
    }, [analyticsData, timeRange])

    useEffect(() => {
        setTrafficData(processedData)
    }, [processedData])

    const shouldShowLoading = loading && !analyticsData
    const shouldShowSkeleton = !trafficData && !analyticsData

    if (shouldShowLoading || shouldShowSkeleton) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
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

    const safeMetrics = trafficData?.metrics || {
        totalUsers: 0,
        engagedUsers: 0,
        totalSales: 0,
        totalViews: 0,
        engagementRate: 0,
        conversionRate: 0,
        averageOrderValue: 0,
        bounceRate: 0,
        clickThroughRate: 0,
        retentionRate: 0,
        growthRate: 0
    }

    const safeUserJourney = trafficData?.userJourney || []
    const safeTrafficSources = trafficData?.trafficSources || []
    const safeDeviceBreakdown = trafficData?.deviceBreakdown || []
    const safeCategoryPerformance = trafficData?.categoryPerformance || []
    const safeTopProducts = trafficData?.topProducts || []

    return (
        <div className="space-y-6">
            

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Users</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeMetrics.totalUsers)}</div>
                    <div className="text-sm text-[#00FF89] flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>{formatPercentage(safeMetrics.growthRate)} growth</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Page Views</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(safeMetrics.totalViews)}</div>
                    <div className="text-sm text-gray-400">Platform activity</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Engagement Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(safeMetrics.engagementRate)}</div>
                    <div className="text-sm text-[#00FF89] flex items-center gap-1">
                        <span>{formatNumber(safeMetrics.engagedUsers)} engaged users</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Conversion Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(safeMetrics.conversionRate)}</div>
                    <div className="text-sm text-gray-400">{formatNumber(safeMetrics.totalSales)} conversions</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">User Journey Funnel</h3>
                        <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                            <span className="text-gray-400">Users Flow</span>
                        </div>
                    </div>
                    <div className="h-80 relative">
                        {safeUserJourney.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={safeUserJourney}>
                                    <defs>
                                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#00FF89" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#00FF89" stopOpacity={0.05} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis 
                                        dataKey="stage" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                        formatter={(value, name) => [formatNumber(value), 'Users']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#00FF89"
                                        fillOpacity={1}
                                        fill="url(#userGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No user journey data</p>
                                    <p className="text-sm mt-2">User flow analytics will appear here</p>
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
                        <h3 className="text-lg font-semibold text-white">Traffic Sources</h3>
                    </div>
                    <div className="h-80 relative">
                        {safeTrafficSources.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={safeTrafficSources}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        dataKey="value"
                                        label={({ name, percentage }) => `${name} ${percentage}%`}
                                        labelLine={false}
                                    >
                                        {safeTrafficSources.map((entry, index) => (
                                            <Cell key={`source-${index}`} fill={entry.color} />
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
                                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No traffic source data</p>
                                    <p className="text-sm mt-2">Source analytics will appear here</p>
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
                <h3 className="text-lg font-semibold text-white mb-4">Top Viewed Products</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {safeTopProducts.length > 0 ? (
                        safeTopProducts.slice(0, 10).map((product, index) => (
                            <div
                                key={product.id || index}
                                className="flex items-center justify-between py-3 px-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium text-sm truncate max-w-[300px]">{product.title}</div>
                                        <div className="text-gray-400 text-xs">by {product.formattedSellerName}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">{formatPrice(product.price, product.formattedPrice)}</div>
                                    {product.discountPercentage > 0 && (
                                        <div className="text-[#00FF89] text-xs">{product.discountPercentage}% off</div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-8">
                            <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No product views data</p>
                            <p className="text-sm mt-1">Top products will appear once users start browsing</p>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Category Performance</h3>
                    <div className="h-80 relative">
                        {safeCategoryPerformance.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={safeCategoryPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 11 }}
                                        angle={0}
                                        textAnchor="middle"
                                        height={80}
                                        interval={0}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        label={{ value: 'Products', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        label={{ value: 'Views', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: '1px solid #374151',
                                            borderRadius: '8px',
                                            color: '#FFFFFF'
                                        }}
                                        formatter={(value, name) => [
                                            name === 'views' ? formatNumber(value) : value,
                                            name === 'views' ? 'Views' : name === 'products' ? 'Products' : 'Avg Views'
                                        ]}
                                    />
                                    <Bar
                                        yAxisId="left"
                                        dataKey="products"
                                        fill="#3B82F6"
                                        radius={[2, 2, 0, 0]}
                                        name="products"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#00FF89"
                                        strokeWidth={2}
                                        dot={{ fill: '#00FF89', r: 4 }}
                                        name="views"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No category data available</p>
                                    <p className="text-sm mt-2">Category analytics will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
                    <div className="h-80 relative">
                        {safeDeviceBreakdown.length > 0 ? (
                            <div className="w-full h-full">
                                <ResponsiveContainer width="100%" height="70%">
                                    <PieChart>
                                        <Pie
                                            data={safeDeviceBreakdown}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={100}
                                            dataKey="value"
                                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                                            labelLine={false}
                                        >
                                            {safeDeviceBreakdown.map((entry, index) => (
                                                <Cell key={`device-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1F2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px',
                                                color: '#FFFFFF'
                                            }}
                                            formatter={(value, name) => [formatNumber(value), 'Users']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="grid grid-cols-3 gap-2 mt-4">
                                    {safeDeviceBreakdown.map((device, index) => (
                                        <div key={index} className="text-center">
                                            <div className="flex items-center justify-center mb-1">
                                                <div 
                                                    className="w-3 h-3 rounded-full mr-2" 
                                                    style={{ backgroundColor: device.color }}
                                                ></div>
                                                <span className="text-xs text-gray-300">{device.name}</span>
                                            </div>
                                            <div className="text-sm font-medium text-white">{formatNumber(device.value)}</div>
                                            <div className="text-xs text-gray-400">{device.percentage}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <MousePointer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No device data available</p>
                                    <p className="text-sm mt-2">Device analytics will appear here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Key Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Bounce Rate</span>
                            <ArrowRight className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-xl font-bold text-white">{formatPercentage(safeMetrics.bounceRate)}</div>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Click-through Rate</span>
                            <MousePointer className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-xl font-bold text-white">{formatPercentage(safeMetrics.clickThroughRate)}</div>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Retention Rate</span>
                            <Users className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-xl font-bold text-white">{formatPercentage(safeMetrics.retentionRate)}</div>
                    </div>
                    <div className="p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400 text-sm">Avg Session Value</span>
                            <Target className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="text-xl font-bold text-white">{formatCurrency(safeMetrics.averageOrderValue)}</div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Traffic Analytics Summary</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-white">User Acquisition</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">New Users</span>
                                <span className="text-white font-medium">{formatNumber(safeMetrics.totalUsers)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">Growth Rate</span>
                                <span className="text-[#00FF89] font-medium">{formatPercentage(safeMetrics.growthRate)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400">Total Views</span>
                                <span className="text-white font-medium">{formatNumber(safeMetrics.totalViews)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-white">User Engagement</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">Engagement Rate</span>
                                <span className="text-white font-medium">{formatPercentage(safeMetrics.engagementRate)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">Engaged Users</span>
                                <span className="text-white font-medium">{formatNumber(safeMetrics.engagedUsers)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400">Bounce Rate</span>
                                <span className="text-white font-medium">{formatPercentage(safeMetrics.bounceRate)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-white">Conversion Metrics</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">Conversion Rate</span>
                                <span className="text-white font-medium">{formatPercentage(safeMetrics.conversionRate)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-700">
                                <span className="text-gray-400">Total Sales</span>
                                <span className="text-white font-medium">{formatNumber(safeMetrics.totalSales)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-400">Click-through Rate</span>
                                <span className="text-white font-medium">{formatPercentage(safeMetrics.clickThroughRate)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

