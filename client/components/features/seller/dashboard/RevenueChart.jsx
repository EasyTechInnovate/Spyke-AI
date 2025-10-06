'use client'
import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Calendar, TrendingUp, DollarSign } from 'lucide-react'
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
                <p className="text-gray-300 text-sm font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-gray-400 text-xs">{entry.dataKey}:</span>
                        <span className="text-white text-sm font-semibold">{entry.dataKey === 'revenue' ? `$${entry.value}` : entry.value}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}
export default function RevenueChart({ recentOrders = [], className = '' }) {
    const [selectedPeriod, setSelectedPeriod] = useState('7d')

    const generateChartData = () => {
        // Always create baseline data structure first
        const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : 90
        const dailyData = {}

        // Initialize all days with zero values
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateKey = date.toISOString().split('T')[0]
            const displayDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            dailyData[dateKey] = {
                date: displayDate,
                revenue: 0,
                sales: 0
            }
        }

        // Only process orders if they exist and are valid
        if (recentOrders && Array.isArray(recentOrders) && recentOrders.length > 0) {
            recentOrders.forEach((order) => {
                try {
                    // Handle multiple possible date field names with validation
                    const orderDateString = order.orderDate || order.createdAt || order.date
                    if (!orderDateString) return // Skip orders without dates

                    const orderDate = new Date(orderDateString)
                    // Validate the date is actually valid
                    if (isNaN(orderDate.getTime())) return

                    const dateKey = orderDate.toISOString().split('T')[0]
                    if (dailyData[dateKey]) {
                        // Handle multiple possible price field names with validation
                        const price = parseFloat(order.price || order.totalAmount || order.finalAmount || 0)
                        if (!isNaN(price) && price >= 0) {
                            dailyData[dateKey].revenue += price
                            dailyData[dateKey].sales += 1
                        }
                    }
                } catch (error) {
                    console.warn('Error processing order for chart:', error, order)
                    // Continue processing other orders
                }
            })
        }

        return Object.values(dailyData)
    }

    const chartData = generateChartData()

    const periods = [
        { value: '7d', label: '7 Days' },
        { value: '30d', label: '30 Days' },
        { value: '90d', label: '90 Days' }
    ]
    const totalRevenue = chartData.reduce((sum, item) => sum + (item.revenue || 0), 0)
    const totalSales = chartData.reduce((sum, item) => sum + (item.sales || 0), 0)
    const averageDaily = chartData.length > 0 ? totalRevenue / chartData.length : 0

    return (
        <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00FF89]/20 rounded-xl border border-[#00FF89]/30">
                            <TrendingUp className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
                            <p className="text-sm text-gray-400">Track your earnings over time</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {periods.map((period) => (
                            <button
                                key={period.value}
                                onClick={() => setSelectedPeriod(period.value)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                    selectedPeriod === period.value
                                        ? 'bg-[#00FF89]/20 text-[#00FF89] border border-[#00FF89]/30'
                                        : 'bg-[#121212] text-gray-400 hover:text-white border border-gray-700'
                                }`}>
                                {period.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">${totalRevenue.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Total Revenue</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-[#00FF89]">${averageDaily.toFixed(0)}</div>
                        <div className="text-xs text-gray-400">Daily Average</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-blue-400">{totalSales}</div>
                        <div className="text-xs text-gray-400">Total Sales</div>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="h-80">
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <AreaChart data={chartData}>
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
                                <linearGradient
                                    id="salesGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="#3B82F6"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#3B82F6"
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
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#00FF89"
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                                strokeWidth={2}
                                name="Revenue"
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="#3B82F6"
                                fillOpacity={1}
                                fill="url(#salesGradient)"
                                strokeWidth={2}
                                name="Sales"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
