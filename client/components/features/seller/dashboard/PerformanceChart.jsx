'use client'
import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { BarChart3, Eye, ShoppingCart, MousePointer, Search, ChevronDown, Package, Calendar, X } from 'lucide-react'
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
                <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-xs">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-gray-400">{entry.name}:</span>
                            <span className="text-white font-semibold">
                                {entry.name.includes('Rate') || entry.name.includes('%') ? `${entry.value}%` : entry.value.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}
const ProductSelector = ({ products, selectedProduct, onSelect, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const uniqueProducts = Array.from(new Map(products.map((product) => [product.id, product])).values())
    const filteredProducts = uniqueProducts.filter((product) => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
    const handleSelect = (product) => {
        onSelect(product)
        setIsOpen(false)
        setSearchTerm('')
    }
    const handleClose = () => {
        setIsOpen(false)
        setSearchTerm('')
    }
    const getTypeColor = (type) => {
        const colors = {
            prompt: 'text-blue-400',
            agent: 'text-purple-400',
            automation: 'text-orange-400'
        }
        return colors[type] || 'text-gray-400'
    }
    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-3 bg-[#2a2a2a] border-2 border-[#00FF89] rounded-lg text-sm font-medium text-white hover:bg-[#333] transition-colors">
                <span className="truncate pr-2">{selectedProduct ? selectedProduct.title : 'AI-Powered'}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={handleClose}
                    />
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
                        <div className="p-3 border-b border-gray-700">
                            <div className="relative">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/20 focus:border-[#00FF89]"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <button
                                        key={product.id}
                                        onClick={() => handleSelect(product)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#333] transition-colors border-b border-gray-800 last:border-b-0">
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-lg border border-[#00FF89]/30 flex items-center justify-center">
                                            <Package className="w-4 h-4 text-[#00FF89]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{product.title}</p>
                                            <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                <span>{product.sales || 0} sales</span>
                                                <span>•</span>
                                                <span>{product.views || 0} views</span>
                                                <span>•</span>
                                                <span className={getTypeColor(product.type)}>${product.price}</span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center">
                                    <Package className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                    <p className="text-gray-400 text-sm">No products found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
const DateRangeSelector = ({ value, onChange, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const ranges = [
        { key: '7d', label: 'Last 7 days' },
        { key: '14d', label: 'Last 14 days' },
        { key: '30d', label: 'Last 30 days' },
        { key: '90d', label: 'Last 3 months' }
    ]
    const currentRange = ranges.find((r) => r.key === value) || ranges[0]
    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-sm font-medium text-white hover:bg-[#333] transition-colors">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{currentRange.label}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/20 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 bg-[#2a2a2a] border border-gray-700 rounded-lg shadow-xl z-50 min-w-[180px]">
                        {ranges.map((range) => (
                            <button
                                key={range.key}
                                onClick={() => {
                                    onChange(range.key)
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[#333] first:rounded-t-lg last:rounded-b-lg ${
                                    value === range.key ? 'text-[#00FF89] bg-[#00FF89]/5' : 'text-gray-300'
                                }`}>
                                {range.label}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
const MetricButton = ({ metric, isSelected, onClick }) => {
    const IconComponent = metric.icon
    return (
        <button
            onClick={() => onClick(metric.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                    ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/40'
                    : 'bg-[#2a2a2a] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
            }`}>
            <IconComponent className="w-4 h-4" />
            <span>{metric.label}</span>
        </button>
    )
}
export default function PerformanceChart({ topProducts = [], allProducts = [], className = '' }) {
    const [selectedMetrics, setSelectedMetrics] = useState(['views'])
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [viewMode, setViewMode] = useState('single')
    const [dateRange, setDateRange] = useState('7d')
    useEffect(() => {
        if (!selectedProduct && topProducts.length > 0) {
            setSelectedProduct(topProducts[0])
        }
    }, [topProducts, selectedProduct])
    const generateProductTimeData = (product, days = 7) => {
        if (!product) return []
        const ranges = { '7d': 7, '14d': 14, '30d': 30, '90d': 90 }
        const dayCount = ranges[days] || 7
        const totalViews = product.views || 0
        const totalSales = product.sales || 0
        const productPrice = product.price || 0
        return Array.from({ length: dayCount }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - (dayCount - 1 - i))
            const viewsWeight = Math.random() * 0.8 + 0.6 
            const salesWeight = Math.random() * 0.9 + 0.7 
            const dailyViews = Math.max(1, Math.floor((totalViews / dayCount) * viewsWeight))
            const dailySales = Math.max(0, Math.floor((totalSales / dayCount) * salesWeight))
            const conversionRate = dailyViews > 0 ? Math.min(100, (dailySales / dailyViews) * 100) : 0
            const dailyRevenue = dailySales * productPrice
            return {
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                fullDate: date.toLocaleDateString(),
                views: dailyViews,
                sales: dailySales,
                conversions: parseFloat(conversionRate.toFixed(1)),
                revenue: dailyRevenue
            }
        })
    }
    const metrics = [
        { key: 'views', label: 'Views', color: '#00FF89', icon: Eye },
        { key: 'sales', label: 'Sales', color: '#3B82F6', icon: ShoppingCart },
        { key: 'conversions', label: 'Conversion %', color: '#8B5CF6', icon: MousePointer }
    ]
    const toggleMetric = (metricKey) => {
        setSelectedMetrics((prev) => {
            if (prev.includes(metricKey)) {
                return prev.length === 1 ? prev : prev.filter((key) => key !== metricKey)
            } else {
                return [...prev, metricKey]
            }
        })
    }
    const chartData = selectedProduct ? generateProductTimeData(selectedProduct, dateRange) : []
    const calculateStats = () => {
        if (!selectedProduct || !chartData.length) {
            return { primary: '151', secondary: '$2093', product: 'AI-Powered' }
        }
        const totalViews = chartData.reduce((sum, item) => sum + item.views, 0)
        const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0)
        const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
        const avgConversion = chartData.length > 0 ? (chartData.reduce((sum, item) => sum + item.conversions, 0) / chartData.length).toFixed(1) : 0
        const primaryMetric = selectedMetrics[0]
        let primaryValue
        switch (primaryMetric) {
            case 'views':
                primaryValue = totalViews
                break
            case 'sales':
                primaryValue = totalSales
                break
            case 'conversions':
                primaryValue = `${avgConversion}%`
                break
            default:
                primaryValue = totalViews
        }
        return {
            primary: primaryValue,
            secondary: `$${totalRevenue.toFixed(0)}`,
            product: selectedProduct.title
        }
    }
    const stats = calculateStats()
    return (
        <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Product Performance</h3>
                            <p className="text-sm text-gray-400">Analyze individual product trends</p>
                        </div>
                    </div>
                    <DateRangeSelector
                        value={dateRange}
                        onChange={setDateRange}
                    />
                </div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('overview')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                viewMode === 'overview'
                                    ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white border border-gray-700'
                            }`}>
                            Overview
                        </button>
                        <button
                            onClick={() => setViewMode('single')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                viewMode === 'single'
                                    ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white border border-gray-700'
                            }`}>
                            Single Product
                        </button>
                    </div>
                    {viewMode === 'single' && (
                        <div className="flex-1 max-w-sm">
                            <ProductSelector
                                products={topProducts.length > 0 ? topProducts : allProducts}
                                selectedProduct={selectedProduct}
                                onSelect={setSelectedProduct}
                            />
                        </div>
                    )}
                </div>
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-400">Metrics:</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {metrics.map((metric) => (
                            <MetricButton
                                key={metric.key}
                                metric={metric}
                                isSelected={selectedMetrics.includes(metric.key)}
                                onClick={toggleMetric}
                            />
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-[#00FF89]"></div>
                            <span className="text-xs text-gray-400">Primary</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.primary}</p>
                    </div>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                            <span className="text-xs text-gray-400">Revenue</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.secondary}</p>
                    </div>
                    <div className="bg-[#2a2a2a] rounded-lg p-4 border border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                            <span className="text-xs text-gray-400">Product</span>
                        </div>
                        <p
                            className="text-lg font-bold text-white truncate"
                            title={stats.product}>
                            {stats.product}
                        </p>
                    </div>
                </div>
            </div>
            <div className="p-6">
                {chartData.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer
                            width="100%"
                            height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    width={50}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                {selectedMetrics.map((metricKey) => {
                                    const metric = metrics.find((m) => m.key === metricKey)
                                    return (
                                        <Line
                                            key={metricKey}
                                            type="monotone"
                                            dataKey={metricKey}
                                            stroke={metric.color}
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: metric.color }}
                                            activeDot={{
                                                r: 6,
                                                fill: metric.color,
                                                stroke: '#1f1f1f',
                                                strokeWidth: 2
                                            }}
                                        />
                                    )
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center">
                            <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-white font-medium mb-2">No Data Available</h3>
                            <p className="text-gray-400 text-sm">
                                {!selectedProduct ? 'Select a product to view detailed analytics' : 'No data available for the selected period'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}