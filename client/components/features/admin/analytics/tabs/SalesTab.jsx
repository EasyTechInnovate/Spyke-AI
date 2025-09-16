'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, ShoppingCart, Activity, Package, DollarSign } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell } from 'recharts'

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
    return `${(num || 0).toFixed(2)}%`
}

export const SalesTab = ({ analyticsData, timeRange, loading }) => {
    const [salesData, setSalesData] = useState(null)

    const generateTrendsWithAllDates = (dailySales, timeRange) => {
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

        const dataMap = new Map()
        dailySales.forEach((item) => {
            const dateKey = item._id?.date || item.date
            if (dateKey) {
                dataMap.set(dateKey, {
                    revenue: item.revenue || 0,
                    salesCount: item.salesCount || 0
                })
            }
        })

        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            const dateString = currentDate.toISOString().split('T')[0]

            const data = dataMap.get(dateString) || { revenue: 0, salesCount: 0 }

            trends.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: data.revenue,
                orders: data.salesCount,
                averageOrderValue: data.revenue && data.salesCount ? Math.round(data.revenue / data.salesCount) : 0
            })
        }

        return trends
    }

    const processTopProducts = (sales) => {
        const productMap = new Map()

        sales.forEach((sale) => {
            sale.items.forEach((item) => {
                const productId = item.productId?._id || 'unknown'
                const productName = item.productId?.title || 'Product (Deleted)'
                const price = item.price || 0

                if (productMap.has(productId)) {
                    const existing = productMap.get(productId)
                    existing.salesCount += 1
                    existing.revenue += price
                } else {
                    productMap.set(productId, {
                        _id: productId,
                        name: productName,
                        salesCount: 1,
                        revenue: price
                    })
                }
            })
        })

        return Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10)
    }

    const processPaymentMethods = (sales) => {
        const paymentMap = new Map()
        let totalRevenue = 0

        sales.forEach((sale) => {
            const method = sale.paymentMethod || 'unknown'
            const revenue = sale.finalAmount || 0
            totalRevenue += revenue

            if (paymentMap.has(method)) {
                const existing = paymentMap.get(method)
                existing.count += 1
                existing.revenue += revenue
            } else {
                paymentMap.set(method, {
                    _id: method,
                    name: method,
                    count: 1,
                    revenue: revenue
                })
            }
        })

        return Array.from(paymentMap.values()).map((method) => ({
            ...method,
            percentage: totalRevenue > 0 ? (method.revenue / totalRevenue) * 100 : 0
        }))
    }

    const processCustomerInsights = (sales) => {
        const customerMap = new Map()

        sales.forEach((sale) => {
            const customerId = sale.userId?._id
            const customerName = sale.userId?.name || 'Anonymous'
            const customerEmail = sale.userId?.emailAddress || 'unknown@email.com'
            const amount = sale.finalAmount || 0

            if (customerMap.has(customerId)) {
                const existing = customerMap.get(customerId)
                existing.totalSpent += amount
                existing.orderCount += 1
            } else {
                customerMap.set(customerId, {
                    _id: customerId,
                    name: customerName,
                    email: customerEmail,
                    totalSpent: amount,
                    orderCount: 1
                })
            }
        })

        return Array.from(customerMap.values())
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 10)
    }

    useEffect(() => {
        if (analyticsData?.sales) {
            const processedData = {
                metrics: {
                    totalRevenue: analyticsData.summary?.totalRevenue || 0,
                    totalOrders: analyticsData.summary?.totalSales || 0,
                    averageOrderValue: analyticsData.summary?.avgOrderValue || 0,
                    conversionRate: analyticsData.summary?.conversionRate || 0,
                    totalItems: analyticsData.summary?.totalItems || 0
                },
                trends: generateTrendsWithAllDates(analyticsData.dailySales || [], timeRange),
                topProducts: processTopProducts(analyticsData.sales || []),
                paymentMethods: processPaymentMethods(analyticsData.sales || []),
                topCustomers: processCustomerInsights(analyticsData.sales || []),
                recentSales:
                    analyticsData.sales?.slice(0, 5).map((sale) => ({
                        _id: sale._id,
                        customerName: sale.userId?.name || 'Anonymous',
                        amount: sale.finalAmount || 0,
                        status: sale.orderStatus,
                        date: sale.purchaseDate,
                        paymentMethod: sale.paymentMethod
                    })) || []
            }

            setSalesData(processedData)
        }
    }, [analyticsData, timeRange])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
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

    if (!salesData) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
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

    const { metrics = {}, trends = [], topProducts = [], paymentMethods = [], topCustomers = [], recentSales = [] } = salesData

    const validTrends = Array.isArray(trends) ? trends : []
    const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Revenue</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.totalRevenue)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Orders</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalOrders)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Average Order Value</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatCurrency(metrics.averageOrderValue)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Items Sold</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Package className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalItems)}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Conversion Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{formatPercentage(metrics.conversionRate)}</div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Sales Trends</h3>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm opacity-80"></div>
                            <span className="text-gray-400">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Orders</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-gray-400">Avg Order Value</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <ComposedChart data={validTrends}>
                            <defs>
                                <linearGradient
                                    id="revenueGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="#00FF89"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#00FF89"
                                        stopOpacity={0.05}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#374151"
                                opacity={0.3}
                            />
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
                                tickFormatter={(value) => `$${value}`}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                            />
                            <Tooltip
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                <p className="text-gray-300 text-sm mb-2 font-medium">{label}</p>
                                                {payload.map((entry, index) => (
                                                    <p
                                                        key={index}
                                                        className="text-sm font-medium"
                                                        style={{ color: entry.color }}>
                                                        {entry.name}:{' '}
                                                        {entry.dataKey === 'revenue' || entry.dataKey === 'averageOrderValue'
                                                            ? `$${entry.value?.toLocaleString()}`
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
                                dataKey="revenue"
                                stroke="#00FF89"
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                                strokeWidth={2}
                                name="Revenue"
                            />
                            <Bar
                                yAxisId="right"
                                dataKey="orders"
                                fill="#3B82F6"
                                radius={[2, 2, 0, 0]}
                                name="Orders"
                            />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="averageOrderValue"
                                stroke="#8B5CF6"
                                strokeWidth={2}
                                dot={{ fill: '#8B5CF6', r: 4 }}
                                name="Avg Order Value"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>

                    {(!validTrends.length || !validTrends.some((item) => item.revenue > 0 || item.orders > 0)) && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-800/50 rounded">
                            <div className="text-center text-gray-400">
                                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No sales data for {timeRange}</p>
                                <p className="text-sm mt-1">Chart shows date range with no recorded sales</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Products</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topProducts.length > 0 ? (
                            topProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm truncate max-w-[200px]">{product.name}</div>
                                            <div className="text-gray-400 text-xs">{formatNumber(product.salesCount)} sales</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatCurrency(product.revenue)}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No product sales data available</p>
                                <p className="text-sm mt-1">Top products will appear once sales are recorded</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                    <div className="h-80 relative">
                        {paymentMethods.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%">
                                <PieChart>
                                    <Pie
                                        data={paymentMethods}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="revenue"
                                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}>
                                        {paymentMethods.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                        <p className="text-white font-medium capitalize">{data.name}</p>
                                                        <p className="text-gray-400">Revenue: {formatCurrency(data.revenue)}</p>
                                                        <p className="text-gray-400">Transactions: {formatNumber(data.count)}</p>
                                                        <p className="text-gray-400">Percentage: {formatPercentage(data.percentage)}</p>
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
                                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No payment methods data available</p>
                                    <p className="text-sm mt-1">Payment analytics will appear once transactions are processed</p>
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
                    transition={{ delay: 0.8 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Customers</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topCustomers.length > 0 ? (
                            topCustomers.map((customer, index) => (
                                <div
                                    key={customer._id}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{customer.name}</div>
                                            <div className="text-gray-400 text-xs">{customer.email}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatCurrency(customer.totalSpent)}</div>
                                        <div className="text-gray-400 text-xs">{customer.orderCount} orders</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No customer data available</p>
                                <p className="text-sm mt-1">Top customers will appear once sales are recorded</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Sales</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {recentSales.length > 0 ? (
                            recentSales.map((sale) => (
                                <div
                                    key={sale._id}
                                    className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                            <ShoppingCart className="w-4 h-4 text-gray-300" />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium text-sm">{sale.customerName}</div>
                                            <div className="text-gray-400 text-xs capitalize">
                                                {sale.paymentMethod} • {sale.status}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white font-medium">{formatCurrency(sale.amount)}</div>
                                        <div className="text-gray-400 text-xs">{new Date(sale.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No recent sales</p>
                                <p className="text-sm mt-1">Recent transactions will appear here</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

