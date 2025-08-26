'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Package, TrendingUp, DollarSign, Star } from 'lucide-react'

const COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981']

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0]
        return (
            <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 shadow-xl">
                <p className="text-gray-300 text-sm font-medium">{data.name}</p>
                <p className="text-white text-lg font-semibold">{data.value} sales</p>
                <p className="text-gray-400 text-xs">{((data.value / payload[0].payload.total) * 100).toFixed(1)}% of total</p>
            </div>
        )
    }
    return null
}

const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry, index) => (
            <div
                key={index}
                className="flex items-center gap-2">
                <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-gray-300">{entry.value}</span>
            </div>
        ))}
    </div>
)

export default function SalesAnalyticsChart({ data, className = '' }) {
    // Sample data - replace with real data from your API
    const chartData = data || [
        { name: 'AI Prompts', value: 45, revenue: 2250 },
        { name: 'Templates', value: 32, revenue: 1920 },
        { name: 'Scripts', value: 28, revenue: 1680 },
        { name: 'Courses', value: 15, revenue: 1200 },
        { name: 'Tools', value: 8, revenue: 640 }
    ]

    const totalSales = chartData.reduce((sum, item) => sum + item.value, 0)
    const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0)
    const bestCategory = chartData.reduce((best, current) => (current.value > best.value ? current : best), chartData[0])

    // Add total to each item for percentage calculation
    const dataWithTotal = chartData.map((item) => ({ ...item, total: totalSales }))

    return (
        <div className={`bg-[#1f1f1f] border border-gray-800 rounded-2xl ${className}`}>
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-xl border border-purple-500/30">
                        <Package className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Sales by Category</h3>
                        <p className="text-sm text-gray-400">Breakdown of your product categories</p>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{totalSales}</div>
                        <div className="text-xs text-gray-400">Total Sales</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-[#00FF89]">${totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Total Revenue</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-purple-400">{bestCategory?.name}</div>
                        <div className="text-xs text-gray-400">Top Category</div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="h-80">
                    <ResponsiveContainer
                        width="100%"
                        height="100%">
                        <PieChart>
                            <Pie
                                data={dataWithTotal}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value">
                                {dataWithTotal.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        stroke="#1f1f1f"
                                        strokeWidth={2}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend content={<CustomLegend />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
