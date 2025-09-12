'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Activity, BarChart3, Users, Eye, Star } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell } from 'recharts'

// Utility functions for formatting
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

export const ProductsTab = ({ analyticsData, timeRange, loading }) => {
    const [productsData, setProductsData] = useState(null)

    const generateTrendsWithAllDates = (dailyProducts, timeRange) => {
        // Calculate date range based on timeRange string
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

        // Create a map for quick lookup of existing data
        const dataMap = new Map()
        dailyProducts.forEach(item => {
            const dateKey = item._id?.date || item.date
            if (dateKey) {
                dataMap.set(dateKey, {
                    productsCreated: item.productsCreated || 0,
                    totalViews: item.totalViews || 0,
                    avgRating: item.avgRating || 0
                })
            }
        })

        // Generate complete date range with placeholder data for missing dates
        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            const dateString = currentDate.toISOString().split('T')[0]
            
            const data = dataMap.get(dateString) || { productsCreated: 0, totalViews: 0, avgRating: 0 }
            
            trends.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                productsCreated: data.productsCreated,
                totalViews: data.totalViews,
                avgRating: data.avgRating
            })
        }

        return trends
    }

    useEffect(() => {
        if (analyticsData) {
            // Process the passed analytics data instead of making API calls
            console.log('Products Analytics Data received:', analyticsData)

            // Extract real data from passed analytics data
            const processedData = {
                metrics: {
                    totalProducts: analyticsData.products?.length || 0,
                    activeProducts: analyticsData.products?.filter(p => p.status === 'published' && p.isActive)?.length || 0,
                    totalViews: analyticsData.products?.reduce((sum, p) => sum + (p.viewCount || 0), 0) || 0,
                    avgRating: analyticsData.products?.length > 0 
                        ? analyticsData.products.reduce((sum, p) => sum + (p.averageRating || 0), 0) / analyticsData.products.length 
                        : 0,
                    totalRevenue: analyticsData.products?.reduce((sum, p) => sum + (p.revenue || 0), 0) || 0,
                    avgConversionRate: analyticsData.products?.length > 0 
                        ? analyticsData.products.reduce((sum, p) => sum + (p.conversionRate || 0), 0) / analyticsData.products.length 
                        : 0
                },
                // Transform dailyProducts to trends format expected by chart (if available in future)
                trends: generateTrendsWithAllDates(analyticsData.dailyProducts || [], timeRange),
                topProducts: analyticsData.products?.slice(0, 10).map((product) => ({
                    _id: product._id,
                    title: product.title,
                    category: product.category,
                    viewCount: product.viewCount || 0,
                    salesCount: product.salesCount || 0,
                    revenue: product.revenue || 0,
                    conversionRate: product.conversionRate || 0,
                    averageRating: product.averageRating || 0,
                    sellerName: product.seller?.fullName || 'Unknown Seller'
                })) || [],
                categoryDistribution: analyticsData.categoryDistribution?.map((category, index) => ({
                    _id: category._id,
                    name: category._id || 'Uncategorized',
                    count: category.count || 0,
                    avgPrice: category.avgPrice || 0,
                    totalViews: category.totalViews || 0,
                    percentage: analyticsData.categoryDistribution?.length > 0 
                        ? ((category.count || 0) / analyticsData.categoryDistribution.reduce((sum, cat) => sum + (cat.count || 0), 0) * 100)
                        : 0
                })) || [],
                statusDistribution: analyticsData.statusDistribution?.map((status, index) => ({
                    _id: status._id,
                    name: status._id || 'Unknown',
                    count: status.count || 0,
                    percentage: analyticsData.statusDistribution?.length > 0 
                        ? ((status.count || 0) / analyticsData.statusDistribution.reduce((sum, stat) => sum + (stat.count || 0), 0) * 100)
                        : 0
                })) || []
            }

            console.log('Processed Products Data:', processedData)
            setProductsData(processedData)
        }
    }, [analyticsData, timeRange])

    if (loading) {
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

    // Ensure we have valid data before destructuring
    if (!productsData) {
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

    const { metrics = {}, trends = [], topProducts = [], categoryDistribution = [], statusDistribution = [] } = productsData

    // Ensure trends is a valid array
    const validTrends = Array.isArray(trends) ? trends : []

    // Colors for charts
    const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']

    return (
        <div className="space-y-6">
            {/* Product Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Products</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalProducts)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Active Products</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.activeProducts)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Views</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalViews)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {metrics.avgRating ? metrics.avgRating.toFixed(1) : '0.0'}/5
                    </div>
                </motion.div>
            </div>

            {/* Product Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Avg Conversion Rate</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(metrics.avgConversionRate)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Categories</h3>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(categoryDistribution.length)}</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Products */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Top Performing Products</h3>
                        
                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                                <span className="text-gray-400">Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                                <span className="text-gray-400">Sales</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                                <span className="text-gray-400">Conversion</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 relative">
                        {topProducts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={topProducts.slice(0, 6)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                    <XAxis 
                                        dataKey="title" 
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                        interval={0}
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                        <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
                                                        {payload.map((entry, index) => (
                                                            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                                                                {entry.name}: {entry.dataKey === 'conversionRate' ? `${entry.value?.toFixed(1)}%` : entry.value?.toLocaleString()}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                    <Bar yAxisId="left" dataKey="viewCount" fill="#00FF89" name="Views" />
                                    <Bar yAxisId="left" dataKey="salesCount" fill="#3B82F6" name="Sales" />
                                    <Line 
                                        yAxisId="right" 
                                        type="monotone" 
                                        dataKey="conversionRate" 
                                        stroke="#8B5CF6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#8B5CF6', r: 4 }}
                                        name="Conversion Rate"
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg font-medium">No product data for {timeRange}</p>
                                    <p className="text-sm mt-1">Charts will appear once products are created</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Category Distribution</h3>
                    <div className="h-80 relative">
                        {categoryDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryDistribution.slice(0, 8)}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                    >
                                        {categoryDistribution.slice(0, 8).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                        <p className="text-white font-medium">{data.name}</p>
                                                        <p className="text-gray-400">Products: {data.count}</p>
                                                        <p className="text-gray-400">Avg Price: {formatCurrency(data.avgPrice)}</p>
                                                        <p className="text-gray-400">Total Views: {formatNumber(data.totalViews)}</p>
                                                    </div>
                                                )
                                            }
                                            return null
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No category data available</p>
                                    <p className="text-sm mt-1">Categories will appear once products are created</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Categories Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Categories</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {categoryDistribution.length > 0 ? categoryDistribution.map((category, index) => (
                            <div key={category._id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium text-sm capitalize">{category.name}</div>
                                        <div className="text-gray-400 text-xs">{formatNumber(category.count)} products</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">{formatPercentage(category.percentage)}</div>
                                    <div className="text-gray-400 text-xs">{formatCurrency(category.avgPrice)} avg</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No category data available</p>
                                <p className="text-sm mt-1">Categories will appear once products are created</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Product Status Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Product Status</h3>
                    <div className="space-y-4">
                        {statusDistribution.length > 0 ? statusDistribution.map((status) => (
                            <div key={status._id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-white font-medium capitalize">{status.name}</span>
                                    <span className="text-gray-400">{formatPercentage(status.percentage)}</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${status.percentage}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>{formatNumber(status.count)} products</span>
                                    <span>{status.name === 'published' ? 'Live' : 'Pending'}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-8">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No status data available</p>
                                <p className="text-sm mt-1">Status distribution will appear once products are created</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}