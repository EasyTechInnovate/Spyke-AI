'use client'

import { useState } from 'react'
import {
    ShoppingCart,
    DollarSign,
    Package,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    TrendingUp,
    Eye,
    CreditCard,
    Clock,
    BarChart3,
    LineChart,
    PieChart
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsLoadingScreen } from '../AnalyticsLoadingScreen'

// Revenue Trend Chart Component
const RevenueTrendChart = ({ sales }) => {
    // Group sales by date and calculate daily revenue
    const dailyRevenue = sales.reduce((acc, sale) => {
        const date = new Date(sale.createdAt).toLocaleDateString()
        if (!acc[date]) {
            acc[date] = { date, revenue: 0, orders: 0 }
        }
        acc[date].revenue += sale.finalAmount
        acc[date].orders += 1
        return acc
    }, {})

    const chartData = Object.values(dailyRevenue).sort((a, b) => new Date(a.date) - new Date(b.date))
    const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 100)

    if (chartData.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#00FF89]" />
                    Revenue Trend
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                        <LineChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No revenue data available</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-[#00FF89]" />
                Revenue Trend Over Time
            </h3>

            <div className="relative h-64 mb-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-300 w-12">
                    <span>${maxRevenue.toLocaleString()}</span>
                    <span>${Math.round(maxRevenue * 0.75).toLocaleString()}</span>
                    <span>${Math.round(maxRevenue * 0.5).toLocaleString()}</span>
                    <span>${Math.round(maxRevenue * 0.25).toLocaleString()}</span>
                    <span>$0</span>
                </div>

                {/* Chart area */}
                <div className="ml-12 mr-4 h-full relative">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                        {[0, 25, 50, 75, 100].map((percent) => (
                            <div
                                key={percent}
                                className="absolute w-full border-t border-gray-600/30"
                                style={{ top: `${percent}%` }}
                            />
                        ))}
                    </div>

                    {/* Line Chart */}
                    <svg
                        className="w-full h-full absolute inset-0"
                        viewBox="0 0 400 256">
                        <defs>
                            <linearGradient
                                id="revenueGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop
                                    offset="0%"
                                    stopColor="#00FF89"
                                    stopOpacity={0.3}
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#00FF89"
                                    stopOpacity={0.05}
                                />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <motion.path
                            d={`M 0 256 ${chartData
                                .map((d, i) => {
                                    const x = (i / Math.max(chartData.length - 1, 1)) * 400
                                    const y = 256 - (d.revenue / maxRevenue) * 256
                                    return `L ${x} ${y}`
                                })
                                .join(' ')} L 400 256 Z`}
                            fill="url(#revenueGradient)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        />

                        {/* Line */}
                        <motion.path
                            d={`M ${chartData
                                .map((d, i) => {
                                    const x = (i / Math.max(chartData.length - 1, 1)) * 400
                                    const y = 256 - (d.revenue / maxRevenue) * 256
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                                })
                                .join(' ')}`}
                            stroke="#00FF89"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                        />

                        {/* Data points */}
                        {chartData.map((d, i) => {
                            const x = (i / Math.max(chartData.length - 1, 1)) * 400
                            const y = 256 - (d.revenue / maxRevenue) * 256
                            return (
                                <motion.g key={i}>
                                    <motion.circle
                                        cx={x}
                                        cy={y}
                                        r="5"
                                        fill="#00FF89"
                                        stroke="#1F2937"
                                        strokeWidth="2"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: i * 0.1 + 0.5, duration: 0.3 }}
                                        className="cursor-pointer hover:r-7 transition-all"
                                    />
                                    <motion.text
                                        x={x}
                                        y={y - 15}
                                        textAnchor="middle"
                                        className="fill-white text-sm font-medium"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.1 + 0.8 }}>
                                        ${d.revenue.toLocaleString()}
                                    </motion.text>
                                </motion.g>
                            )
                        })}
                    </svg>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                <div className="text-center">
                    <div className="text-lg font-bold text-[#00FF89]">${chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Total Revenue</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{chartData.reduce((sum, d) => sum + d.orders, 0)}</div>
                    <div className="text-xs text-gray-400">Total Orders</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">
                        $
                        {chartData.length > 0
                            ? (chartData.reduce((sum, d) => sum + d.revenue, 0) / chartData.reduce((sum, d) => sum + d.orders, 0)).toFixed(0)
                            : '0'}
                    </div>
                    <div className="text-xs text-gray-400">Avg Order Value</div>
                </div>
            </div>
        </div>
    )
}

// Payment Methods Analytics Chart
const PaymentMethodsAnalytics = ({ sales }) => {
    const paymentMethods = sales.reduce((acc, sale) => {
        const method = sale.paymentMethod || 'unknown'
        const revenue = sale.finalAmount || 0

        if (!acc[method]) {
            acc[method] = { count: 0, revenue: 0, avgOrderValue: 0 }
        }
        acc[method].count += 1
        acc[method].revenue += revenue
        return acc
    }, {})

    // Calculate averages
    Object.keys(paymentMethods).forEach((method) => {
        paymentMethods[method].avgOrderValue = paymentMethods[method].count > 0 ? paymentMethods[method].revenue / paymentMethods[method].count : 0
    })

    const total = Object.values(paymentMethods).reduce((sum, method) => sum + method.count, 0)
    const totalRevenue = Object.values(paymentMethods).reduce((sum, method) => sum + method.revenue, 0)
    const entries = Object.entries(paymentMethods).sort((a, b) => b[1].count - a[1].count)

    const colors = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444']
    const methodIcons = {
        manual: CreditCard,
        stripe: CreditCard,
        paypal: DollarSign,
        crypto: DollarSign,
        bank: DollarSign
    }

    if (total === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                    Payment Methods Analytics
                </h3>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    <div className="text-center">
                        <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No payment data available</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                Payment Methods Analytics
            </h3>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-[#00FF89]">{entries.length}</div>
                    <div className="text-xs text-gray-400">Payment Methods</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{total}</div>
                    <div className="text-xs text-gray-400">Total Transactions</div>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">${(totalRevenue / total).toFixed(0)}</div>
                    <div className="text-xs text-gray-400">Avg Order Value</div>
                </div>
            </div>

            {/* Payment Methods List */}
            <div className="space-y-4">
                {entries.map(([method, data], index) => {
                    const percentage = (data.count / total) * 100
                    const IconComponent = methodIcons[method] || CreditCard

                    return (
                        <motion.div
                            key={method}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-700/20 rounded-lg p-4 hover:bg-gray-700/30 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                                        style={{ backgroundColor: `${colors[index % colors.length]}20` }}>
                                        <IconComponent
                                            className="w-5 h-5"
                                            style={{ color: colors[index % colors.length] }}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold capitalize">{method.replace('_', ' ')}</div>
                                        <div className="text-gray-400 text-sm">
                                            {data.count} transaction{data.count !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-bold text-lg">{percentage.toFixed(1)}%</div>
                                    <div className="text-gray-400 text-sm">${data.revenue.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                                    className="h-2 rounded-full"
                                    style={{ backgroundColor: colors[index % colors.length] }}
                                />
                            </div>

                            {/* Additional Metrics */}
                            <div className="grid grid-cols-3 gap-4 text-center text-sm">
                                <div>
                                    <div className="text-white font-semibold">${data.avgOrderValue.toFixed(0)}</div>
                                    <div className="text-gray-400">Avg Order</div>
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{((data.revenue / totalRevenue) * 100).toFixed(1)}%</div>
                                    <div className="text-gray-400">Revenue Share</div>
                                </div>
                                <div>
                                    <div className="text-white font-semibold">{data.count}</div>
                                    <div className="text-gray-400">Orders</div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Payment Method Insights */}
            <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-lg font-bold text-[#00FF89]">{entries[0]?.[0]?.replace('_', ' ') || 'N/A'}</div>
                        <div className="text-xs text-gray-400">Most Popular Method</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                            ${entries.reduce((max, [_, data]) => Math.max(max, data.avgOrderValue), 0).toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-400">Highest Avg Order</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Order Value Distribution Chart
const OrderValueChart = ({ sales }) => {
    const ranges = [
        { label: '$0-100', min: 0, max: 100 },
        { label: '$101-300', min: 101, max: 300 },
        { label: '$301-500', min: 301, max: 500 },
        { label: '$501-1000', min: 501, max: 1000 },
        { label: '$1000+', min: 1001, max: Infinity }
    ]

    const distribution = ranges.map((range) => ({
        ...range,
        count: sales.filter((sale) => sale.finalAmount >= range.min && sale.finalAmount <= range.max).length
    }))

    const maxCount = Math.max(...distribution.map((d) => d.count), 1)

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#00FF89]" />
                Order Value Distribution
            </h3>

            <div className="space-y-4">
                {distribution.map((range, index) => (
                    <div
                        key={range.label}
                        className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">{range.label}</span>
                            <span className="text-white font-semibold">{range.count} orders</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-3">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(range.count / maxCount) * 100}%` }}
                                transition={{ delay: index * 0.1, duration: 0.6 }}
                                className="bg-gradient-to-r from-[#00FF89] to-[#00E67A] h-3 rounded-full"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const SaleCard = ({ sale, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                    {sale.userId?.avatar ? (
                        <img
                            src={sale.userId.avatar}
                            alt={sale.userId.name}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-6 h-6 text-[#00FF89]" />
                    )}
                </div>
                <div>
                    <h3 className="text-white font-semibold">{sale.userId?.name || 'Unknown Customer'}</h3>
                    <p className="text-gray-400 text-sm">{sale.userId?.emailAddress}</p>
                </div>
            </div>
            <div className="text-right">
                <div className="text-[#00FF89] font-bold text-lg">${sale.finalAmount?.toLocaleString() || '0'}</div>
                <div className="text-gray-400 text-sm">{new Date(sale.createdAt).toLocaleDateString()}</div>
            </div>
        </div>

        <div className="space-y-3">
            {sale.items?.map((item, itemIndex) => (
                <div
                    key={itemIndex}
                    className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        {item.productId?.thumbnail ? (
                            <img
                                src={item.productId.thumbnail}
                                alt={item.productId.title}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                        ) : (
                            <Package className="w-5 h-5 text-[#00FF89]" />
                        )}
                    </div>
                    <div className="flex-1">
                        <p className="text-white font-medium">{item.productId?.title || 'Product'}</p>
                        <p className="text-gray-400 text-sm">{item.productId?.category}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white font-semibold">${item.price?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
            <span className="text-gray-400 text-sm">Order ID: {sale._id?.slice(-8) || 'N/A'}</span>
            <span className="px-3 py-1 bg-green-900 text-green-300 text-xs rounded-full">{sale.orderStatus || 'completed'}</span>
        </div>
    </motion.div>
)

const TopProductCard = ({ product, index, rank }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 bg-[#00FF89] rounded-full flex items-center justify-center text-black font-bold">{rank}</div>
            <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                {product.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-12 h-12 rounded-lg object-cover"
                    />
                ) : (
                    <Package className="w-6 h-6 text-[#00FF89]" />
                )}
            </div>
            <div className="flex-1">
                <h3 className="text-white font-semibold">{product.title}</h3>
                <p className="text-gray-400 text-sm">{product.category}</p>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-gray-400 text-sm">Sales</p>
                <p className="text-white font-bold text-xl">{product.salesCount}</p>
            </div>
            <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-[#00FF89] font-bold text-xl">${product.revenue?.toLocaleString()}</p>
            </div>
        </div>
    </motion.div>
)

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex items-center justify-between">
        <div className="text-gray-400 text-sm">
            Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 bg-[#00FF89] text-black font-medium rounded-lg">{currentPage}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    </div>
)

// Enhanced Sales Table Component with pagination, sorting, and filtering
const SalesTable = ({ sales, timeRange, pagination, onPageChange }) => {
    const [sortField, setSortField] = useState('createdAt')
    const [sortDirection, setSortDirection] = useState('desc')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterPaymentMethod, setFilterPaymentMethod] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    // Get unique values for filters
    const paymentMethods = [...new Set(sales.map(sale => sale.paymentMethod))].filter(Boolean)
    const orderStatuses = [...new Set(sales.map(sale => sale.orderStatus))].filter(Boolean)

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const getSortIcon = (field) => {
        if (sortField !== field) return <ChevronUp className="w-4 h-4 opacity-50" />
        return sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4 text-[#00FF89]" /> : 
            <ChevronDown className="w-4 h-4 text-[#00FF89]" />
    }

    // Filter and sort sales data
    const filteredSales = sales
        .filter(sale => {
            const matchesStatus = filterStatus === 'all' || sale.orderStatus === filterStatus
            const matchesPayment = filterPaymentMethod === 'all' || sale.paymentMethod === filterPaymentMethod
            const matchesSearch = !searchTerm || 
                sale.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale.userId?.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sale._id?.toLowerCase().includes(searchTerm.toLowerCase())
            
            return matchesStatus && matchesPayment && matchesSearch
        })
        .sort((a, b) => {
            let aValue, bValue
            
            switch (sortField) {
                case 'createdAt':
                    aValue = new Date(a.createdAt)
                    bValue = new Date(b.createdAt)
                    break
                case 'finalAmount':
                    aValue = a.finalAmount || 0
                    bValue = b.finalAmount || 0
                    break
                case 'customerName':
                    aValue = a.userId?.name || ''
                    bValue = b.userId?.name || ''
                    break
                case 'orderStatus':
                    aValue = a.orderStatus || ''
                    bValue = b.orderStatus || ''
                    break
                default:
                    return 0
            }
            
            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1
            } else {
                return aValue < bValue ? 1 : -1
            }
        })

    const getStatusBadge = (status) => {
        const statusColors = {
            completed: 'bg-green-900 text-green-300',
            pending: 'bg-yellow-900 text-yellow-300',
            cancelled: 'bg-red-900 text-red-300',
            processing: 'bg-blue-900 text-blue-300'
        }
        return `px-2 py-1 text-xs rounded-full ${statusColors[status] || 'bg-gray-700 text-gray-300'}`
    }

    const getPaymentMethodBadge = (method) => {
        const methodColors = {
            manual: 'bg-[#00FF89]/20 text-[#00FF89]',
            stripe: 'bg-blue-500/20 text-blue-400',
            paypal: 'bg-purple-500/20 text-purple-400',
            crypto: 'bg-orange-500/20 text-orange-400'
        }
        return `px-2 py-1 text-xs rounded-full ${methodColors[method] || 'bg-gray-700 text-gray-300'}`
    }

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            {/* Header with filters and search */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#00FF89]" />
                        Recent Sales ({timeRange})
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {filteredSales.length} of {sales.length} orders
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search customers, emails, or order IDs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                ×
                            </button>
                        )}
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                        <option value="all">All Status</option>
                        {orderStatuses.map(status => (
                            <option key={status} value={status} className="capitalize">
                                {status}
                            </option>
                        ))}
                    </select>

                    {/* Payment Method Filter */}
                    <select
                        value={filterPaymentMethod}
                        onChange={(e) => setFilterPaymentMethod(e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                        <option value="all">All Methods</option>
                        {paymentMethods.map(method => (
                            <option key={method} value={method} className="capitalize">
                                {method.replace('_', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                <button
                                    onClick={() => handleSort('customerName')}
                                    className="flex items-center gap-2 hover:text-white transition-colors">
                                    Customer
                                    {getSortIcon('customerName')}
                                </button>
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                Order Details
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                <button
                                    onClick={() => handleSort('finalAmount')}
                                    className="flex items-center gap-2 hover:text-white transition-colors">
                                    Amount
                                    {getSortIcon('finalAmount')}
                                </button>
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                Payment
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                Status
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                <button
                                    onClick={() => handleSort('createdAt')}
                                    className="flex items-center gap-2 hover:text-white transition-colors">
                                    Date
                                    {getSortIcon('createdAt')}
                                </button>
                            </th>
                            <th className="text-left py-3 px-4 text-gray-300 font-medium">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale, index) => (
                            <motion.tr
                                key={sale._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                                
                                {/* Customer */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                            {sale.userId?.avatar ? (
                                                <img
                                                    src={sale.userId.avatar}
                                                    alt={sale.userId.name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5 text-[#00FF89]" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {sale.userId?.name || 'Unknown'}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {sale.userId?.emailAddress}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Order Details */}
                                <td className="py-4 px-4">
                                    <div>
                                        <p className="text-white text-sm font-medium">
                                            {sale.items?.length || 0} item{sale.items?.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            ID: {sale._id?.slice(-8)}
                                        </p>
                                    </div>
                                </td>

                                {/* Amount */}
                                <td className="py-4 px-4">
                                    <div className="text-[#00FF89] font-bold text-lg">
                                        ${sale.finalAmount?.toLocaleString() || '0'}
                                    </div>
                                    {sale.discountAmount > 0 && (
                                        <div className="text-gray-400 text-xs">
                                            Saved: ${sale.discountAmount.toLocaleString()}
                                        </div>
                                    )}
                                </td>

                                {/* Payment */}
                                <td className="py-4 px-4">
                                    <span className={getPaymentMethodBadge(sale.paymentMethod)}>
                                        {sale.paymentMethod?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="py-4 px-4">
                                    <span className={getStatusBadge(sale.orderStatus)}>
                                        {sale.orderStatus || 'Unknown'}
                                    </span>
                                </td>

                                {/* Date */}
                                <td className="py-4 px-4">
                                    <div className="text-white text-sm">
                                        {new Date(sale.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                        {new Date(sale.createdAt).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {/* TODO: View order details */}}
                                            className="p-2 text-gray-400 hover:text-[#00FF89] hover:bg-[#00FF89]/10 rounded-lg transition-colors"
                                            title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {/* TODO: Download receipt */}}
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                            title="Download Receipt">
                                            <Package className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {/* Empty State */}
                {filteredSales.length === 0 && (
                    <div className="text-center py-12">
                        <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">
                            {searchTerm || filterStatus !== 'all' || filterPaymentMethod !== 'all' 
                                ? 'No orders match your filters' 
                                : 'No sales in this period'}
                        </p>
                        {(searchTerm || filterStatus !== 'all' || filterPaymentMethod !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilterStatus('all')
                                    setFilterPaymentMethod('all')
                                }}
                                className="mt-2 text-[#00FF89] hover:text-[#00FF89]/80 text-sm">
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 text-sm">
                            Showing {((pagination.currentPage - 1) * 20) + 1} to {Math.min(pagination.currentPage * 20, pagination.totalCount)} of {pagination.totalCount} results
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => onPageChange(1)}
                                disabled={pagination.currentPage <= 1}
                                className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                First
                            </button>
                            <button
                                onClick={() => onPageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage <= 1}
                                className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            
                            {/* Page Numbers */}
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                const pageNum = Math.max(1, pagination.currentPage - 2) + i
                                if (pageNum > pagination.totalPages) return null
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange(pageNum)}
                                        className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                                            pageNum === pagination.currentPage
                                                ? 'bg-[#00FF89] text-black'
                                                : 'bg-gray-700 text-gray-300 hover:text-white hover:bg-gray-600'
                                        }`}>
                                        {pageNum}
                                    </button>
                                )
                            })}
                            
                            <button
                                onClick={() => onPageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => onPageChange(pagination.totalPages)}
                                disabled={pagination.currentPage >= pagination.totalPages}
                                className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Last
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function SalesTab({ analyticsData, timeRange, loading }) {
    const [currentPage, setCurrentPage] = useState(1)

    if (loading && !analyticsData) {
        return <AnalyticsLoadingScreen variant="sales" />
    }

    // Handle case where there's no sales data
    if (!analyticsData?.sales || analyticsData.sales.length === 0) {
        return (
            <div className="space-y-8">
                {/* Summary Cards with Zero State */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <ShoppingCart className="w-5 h-5 text-[#00FF89]" />
                            <h3 className="text-white font-semibold">Total Sales</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">0</div>
                        <div className="text-gray-400 text-sm">No sales yet</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="w-5 h-5 text-[#00FF89]" />
                            <h3 className="text-white font-semibold">Total Revenue</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">$0</div>
                        <div className="text-gray-400 text-sm">Start selling to see revenue</div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <TrendingUp className="w-5 h-5 text-[#00FF89]" />
                            <h3 className="text-white font-semibold">Avg Order Value</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">$0</div>
                        <div className="text-gray-400 text-sm">No orders yet</div>
                    </motion.div>
                </div>

                {/* Empty State */}
                <div className="text-center py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}>
                        <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">No Sales Data</h3>
                        <p className="text-gray-500">Sales data will appear here once you start selling</p>
                    </motion.div>
                </div>
            </div>
        )
    }

    const { sales = [], summary = {}, topProducts = [], pagination = {} } = analyticsData

    return (
        <div className="space-y-8">
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                            <ShoppingCart className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <h3 className="text-white font-semibold">Total Sales</h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{summary.totalSales?.toLocaleString() || '0'}</div>
                    <div className="text-gray-400 text-sm">In {timeRange}</div>
                    <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">+12.5% from last period</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                            <DollarSign className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <h3 className="text-white font-semibold">Total Revenue</h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">${summary.totalRevenue?.toLocaleString() || '0'}</div>
                    <div className="text-gray-400 text-sm">In {timeRange}</div>
                    <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">+18.2% from last period</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#00FF89]/20 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <h3 className="text-white font-semibold">Avg Order Value</h3>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">${summary.avgOrderValue?.toFixed(0) || '0'}</div>
                    <div className="text-gray-400 text-sm">Per order</div>
                    <div className="mt-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">+5.1% from last period</span>
                    </div>
                </motion.div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueTrendChart sales={sales} />
                <PaymentMethodsAnalytics sales={sales} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <OrderValueChart sales={sales} />
                {/* Customer Insights */}
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#00FF89]" />
                        Customer Insights
                    </h3>

                    {/* Top Customer Spotlight */}
                    {(() => {
                        const customerStats = sales.reduce((acc, sale) => {
                            const customerId = sale.userId?._id
                            const customerName = sale.userId?.name || 'Unknown'
                            const customerAvatar = sale.userId?.avatar
                            const customerEmail = sale.userId?.emailAddress
                            
                            if (!acc[customerId]) {
                                acc[customerId] = {
                                    id: customerId,
                                    name: customerName,
                                    avatar: customerAvatar,
                                    email: customerEmail,
                                    orders: 0,
                                    totalSpent: 0,
                                    avgOrderValue: 0
                                }
                            }
                            acc[customerId].orders += 1
                            acc[customerId].totalSpent += sale.finalAmount || 0
                            return acc
                        }, {})

                        // Calculate average order values
                        Object.values(customerStats).forEach(customer => {
                            customer.avgOrderValue = customer.orders > 0 ? customer.totalSpent / customer.orders : 0
                        })

                        const topCustomer = Object.values(customerStats)
                            .sort((a, b) => b.totalSpent - a.totalSpent)[0]

                        return topCustomer ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                                className="mb-6 p-4 bg-gradient-to-r from-[#00FF89]/10 to-blue-500/10 border border-[#00FF89]/30 rounded-xl">
                                
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-[#00FF89]/50">
                                            {topCustomer.avatar ? (
                                                <img
                                                    src={topCustomer.avatar}
                                                    alt={topCustomer.name}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-8 h-8 text-[#00FF89]" />
                                            )}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#00FF89] rounded-full flex items-center justify-center">
                                            <span className="text-black text-xs font-bold">👑</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-white font-bold text-lg">{topCustomer.name}</h4>
                                            <span className="px-2 py-1 bg-[#00FF89]/20 text-[#00FF89] text-xs font-semibold rounded-full">
                                                VIP Customer
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm">{topCustomer.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                                        <div className="text-2xl font-bold text-[#00FF89] mb-1">
                                            {topCustomer.orders}
                                        </div>
                                        <div className="text-xs text-gray-400">Orders</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-400 mb-1">
                                            ${topCustomer.totalSpent.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-400">Total Spent</div>
                                    </div>
                                    <div className="text-center p-3 bg-gray-700/30 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-400 mb-1">
                                            ${topCustomer.avgOrderValue.toFixed(0)}
                                        </div>
                                        <div className="text-xs text-gray-400">Avg Order</div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : null
                    })()}

                    {/* Customer Statistics */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-gray-300 font-medium">Unique Customers</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                                {new Set(sales.map((s) => s.userId?._id)).size}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-gray-300 font-medium">Repeat Customers</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                                {sales.length - new Set(sales.map((s) => s.userId?._id)).size}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-[#00FF89]" />
                                </div>
                                <span className="text-gray-300 font-medium">Customer Lifetime Value</span>
                            </div>
                            <span className="text-white font-bold text-lg">
                                ${(() => {
                                    const uniqueCustomers = new Set(sales.map((s) => s.userId?._id)).size
                                    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0)
                                    return uniqueCustomers > 0 ? (totalRevenue / uniqueCustomers).toFixed(0) : '0'
                                })()}
                            </span>
                        </div>
                    </div>

                    {/* Customer Growth Indicator */}
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <div className="text-lg font-bold text-[#00FF89]">
                                    {(() => {
                                        const uniqueCustomers = new Set(sales.map((s) => s.userId?._id)).size
                                        const repeatCustomers = sales.length - uniqueCustomers
                                        return uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers * 100).toFixed(1) : '0'
                                    })()}%
                                </div>
                                <div className="text-xs text-gray-400">Repeat Rate</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-bold text-blue-400">
                                    {(() => {
                                        const uniqueCustomers = new Set(sales.map((s) => s.userId?._id)).size
                                        return uniqueCustomers > 0 ? (sales.length / uniqueCustomers).toFixed(1) : '0'
                                    })()}
                                </div>
                                <div className="text-xs text-gray-400">Orders per Customer</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Sales Section */}
            

            <SalesTable
                sales={sales}
                timeRange={timeRange}
                pagination={pagination}
                onPageChange={setCurrentPage}
            />
        </div>
    )
}

