'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Package, Activity, BarChart3, Users, Eye, Star } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell } from 'recharts'
const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']
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
const safeDivide = (num, den) => (den ? num / den : 0)
const clamp = (num, min, max) => Math.min(Math.max(num ?? 0, min), max)
const truncate = (str, max = 16) => (str?.length > max ? `${str.slice(0, max - 1)}…` : str || '')
const TopProductsTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                    {entry.name}: {entry.dataKey === 'conversionRate' ? `${(entry.value ?? 0).toFixed(1)}%` : (entry.value ?? 0).toLocaleString()}
                </p>
            ))}
        </div>
    )
}
const CategoryTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium capitalize">{data.name}</p>
            <p className="text-gray-400">Products: {formatNumber(data.count)}</p>
            <p className="text-gray-400">Avg Price: {formatCurrency(data.avgPrice)}</p>
            <p className="text-gray-400">Total Views: {formatNumber(data.totalViews)}</p>
        </div>
    )
}
export const ProductsTab = ({ analyticsData, timeRange, loading }) => {
    const generateTrendsWithAllDates = (dailyProducts, timeRange) => {
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
        const dataMap = new Map()
        dailyProducts.forEach(item => {
            let rawDate = item._id?.date || item.date
            if (!rawDate && item._id && typeof item._id === 'object' && 'year' in item._id && 'month' in item._id && 'day' in item._id) {
                const { year, month, day } = item._id
                rawDate = new Date(Number(year), Number(month) - 1, Number(day))
            }
            if (rawDate) {
                const normalizedKey = new Date(rawDate).toISOString().split('T')[0]
                dataMap.set(normalizedKey, {
                    productsCreated: Number(item.productsCreated) || 0,
                    totalViews: Number(item.totalViews) || 0,
                    avgRating: Number(item.avgRating) || 0
                })
            }
        })
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
    const productsData = useMemo(() => {
        if (!analyticsData) return null
        const root = analyticsData?.data ?? analyticsData
        const products = Array.isArray(root.products) ? root.products : []
        const totalProducts = products.length
        const totalViews = products.reduce((sum, p) => sum + (p.views || p.viewCount || 0), 0)
        const totalRevenue = products.reduce((sum, p) => sum + (p.revenue || 0), 0)
        const totalSales = products.reduce((sum, p) => sum + (p.sales || p.salesCount || 0), 0)
        const avgRating = safeDivide(products.reduce((sum, p) => sum + (p.averageRating || 0), 0), totalProducts)
        const avgConversionRate = safeDivide(products.reduce((sum, p) => sum + (p.conversionRate || 0), 0), totalProducts)
        const activeProducts = products.filter(p => p.status === 'published').length
        let dailyProducts = Array.isArray(root.dailyProducts) ? root.dailyProducts : []
        if (!dailyProducts.length && products.length) {
            const map = new Map()
            for (const p of products) {
                const created = p.createdAt ? new Date(p.createdAt) : null
                if (!created) continue
                const key = created.toISOString().split('T')[0]
                const prev = map.get(key) || { productsCreated: 0, totalViews: 0, avgRatingSum: 0, ratingCount: 0 }
                prev.productsCreated += 1
                prev.totalViews += Number(p.views || p.viewCount || 0)
                const r = Number(p.averageRating || 0)
                if (!Number.isNaN(r)) {
                    prev.avgRatingSum += r
                    prev.ratingCount += 1
                }
                map.set(key, prev)
            }
            dailyProducts = Array.from(map.entries()).map(([date, v]) => ({
                date,
                productsCreated: v.productsCreated,
                totalViews: v.totalViews,
                avgRating: safeDivide(v.avgRatingSum, v.ratingCount)
            }))
        }
        const trends = generateTrendsWithAllDates(dailyProducts, timeRange)
        const topProducts = products
            .map((product) => ({
                _id: product._id,
                title: product.title,
                category: product.category,
                viewCount: product.views || product.viewCount || 0,
                salesCount: product.sales || product.salesCount || 0,
                revenue: product.revenue || 0,
                conversionRate: product.conversionRate || (product.views ? (product.sales / product.views * 100) : 0),
                averageRating: product.averageRating || 0,
                sellerName: product.seller?.fullName || 'Unknown Seller',
                price: product.price || 0
            }))
            .sort((a, b) => (b.revenue - a.revenue) || (b.viewCount - a.viewCount))
            .slice(0, 10)
        const rawCategories = Array.isArray(root.categoryDistribution) ? root.categoryDistribution : []
        const catTotal = rawCategories.reduce((sum, c) => sum + (c.count || 0), 0)
        const categoryDistribution = rawCategories
            .map((c) => ({
                _id: c._id,
                // Prefer server-provided category name; fallback to formatted id or 'Uncategorized'
                name: c.name
                    ? String(c.name)
                    : (c._id
                        ? String(c._id)
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase())
                        : 'Uncategorized'),
                count: c.count || 0,
                avgPrice: c.avgPrice || 0,
                totalViews: c.totalViews || 0,
                percentage: catTotal ? ((c.count || 0) / catTotal) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count)
        const rawStatuses = Array.isArray(root.statusDistribution) ? root.statusDistribution : []
        const statusTotal = rawStatuses.reduce((sum, s) => sum + (s.count || 0), 0) || totalProducts
        const statusDistribution = rawStatuses.map((s) => ({
            _id: s._id,
            name: s._id || 'Unknown',
            count: s.count || 0,
            percentage: statusTotal ? ((s.count || 0) / statusTotal) * 100 : 0
        }))
        return {
            metrics: { totalProducts, activeProducts, totalViews, avgRating, totalRevenue, avgConversionRate, totalSales },
            trends,
            topProducts,
            categoryDistribution,
            statusDistribution,
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
    const validTrends = Array.isArray(trends) ? trends : []
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Products</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#00FF89]" />
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
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
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
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Eye className="w-4 h-4 text-[#00FF89]" />
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
                        <h3 className="text-sm font-medium text-gray-400">Total Sales</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalSales)}</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Rating</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Star className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {metrics.avgRating ? metrics.avgRating.toFixed(1) : '0.0'}/5
                    </div>
                </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Product Performance Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm opacity-80"></div>
                            <span className="text-gray-400">Views</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Products Created</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-gray-400">Avg Rating</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={validTrends}>
                            <defs>
                                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00FF89" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00FF89" stopOpacity={0.05} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
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
                                domain={[0, 5]}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
                                                {payload.map((entry, index) => (
                                                    <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
                                                        {entry.name}: {entry.dataKey === 'avgRating' 
                                                            ? `${entry.value?.toFixed(1)}/5` 
                                                            : entry.value?.toLocaleString()}
                                                    </p>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }}
                            />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="totalViews"
                                fill="url(#viewsGradient)"
                                stroke="#00FF89"
                                fillOpacity={1}
                                strokeWidth={2}
                                name="Views"
                            />
                            <Bar 
                                yAxisId="left" 
                                dataKey="productsCreated" 
                                fill="#3B82F6" 
                                radius={[2, 2, 0, 0]}
                                name="Products Created" 
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="avgRating"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', r: 4 }}
                                name="Avg Rating"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                    {(!validTrends.length || !validTrends.some((item) => item.totalViews > 0 || item.productsCreated > 0)) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-800/50 rounded">
                            <div className="text-center text-gray-400">
                                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No product data for {timeRange}</p>
                                <p className="text-sm mt-1">Charts will appear once products are created</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Avg Conversion Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(metrics.avgConversionRate)}</div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Categories</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(categoryDistribution.length)}</div>
                </motion.div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Performing Products</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div key={product._id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm truncate max-w-[200px]">{product.title}</div>
                                            <div className="text-gray-400 text-xs">{formatNumber(product.viewCount)} views • {formatNumber(product.salesCount)} sales</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatCurrency(product.revenue)}</div>
                                        <div className="text-gray-400 text-xs">{formatPercentage(product.conversionRate)} conversion</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No product performance data available</p>
                                <p className="text-sm mt-1">Top products will appear once sales are recorded</p>
                            </div>
                        )}
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0 }}
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
                                        label={({ name, percentage }) => `${name}: ${clamp(percentage, 0, 100).toFixed(1)}%`}
                                    >
                                        {categoryDistribution.slice(0, 8).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CategoryTooltip />} />
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
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
                                        className="bg-[#00FF89] h-2 rounded-full transition-all duration-300"
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