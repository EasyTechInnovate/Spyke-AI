'use client'
import { useState, useMemo } from 'react'
import { Wrench, TrendingUp, DollarSign, BarChart3, Eye, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function ToolsTab({ analyticsData, timeRange, loading }) {
    const [sortBy, setSortBy] = useState('totalProducts')
    const [sortOrder, setSortOrder] = useState('desc')

    const sortedToolsUsage = useMemo(() => {
        if (!analyticsData?.toolsUsage) return []

        const sorted = [...analyticsData.toolsUsage].sort((a, b) => {
            let aValue = a[sortBy]
            let bValue = b[sortBy]

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase()
                bValue = bValue.toLowerCase()
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1
            }
            return aValue < bValue ? 1 : -1
        })

        return sorted
    }, [analyticsData?.toolsUsage, sortBy, sortOrder])

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
        } else {
            setSortBy(field)
            setSortOrder('desc')
        }
    }

    if (loading) {
        return <ToolsTabSkeleton />
    }

    if (!analyticsData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Wrench className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white font-medium mb-2">No Tools Data</h3>
                    <p className="text-gray-400 text-sm">Tools analytics will appear here once you have products with tools configured.</p>
                </div>
            </div>
        )
    }

    const { toolsUsage = [], toolsPerformance = [], profitableTools = [], summary = {} } = analyticsData

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard
                    title="Unique Tools"
                    value={summary.uniqueToolsCount || 0}
                    icon={<Wrench className="w-5 h-5" />}
                    color="text-[#00FF89]"
                    bgColor="bg-[#00FF89]/20"
                />
                <SummaryCard
                    title="Total Tools Used"
                    value={summary.totalToolsUsed || 0}
                    icon={<Package className="w-5 h-5" />}
                    color="text-blue-400"
                    bgColor="bg-blue-400/20"
                />
                <SummaryCard
                    title="Avg Tools per Product"
                    value={summary.avgToolsPerProduct || 0}
                    icon={<BarChart3 className="w-5 h-5" />}
                    color="text-purple-400"
                    bgColor="bg-purple-400/20"
                />
            </div>

            {/* Tools Usage Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-xl font-semibold text-white mb-2">Tools Usage Analytics</h3>
                    <p className="text-gray-400">Performance metrics for all tools used in your products</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-800/50">
                            <tr>
                                <SortableHeader
                                    label="Tool Name"
                                    field="toolName"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Products"
                                    field="totalProducts"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Views"
                                    field="totalViews"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Sales"
                                    field="totalSales"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                                <SortableHeader
                                    label="Avg Rating"
                                    field="avgRating"
                                    sortBy={sortBy}
                                    sortOrder={sortOrder}
                                    onSort={handleSort}
                                />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {sortedToolsUsage.length > 0 ? (
                                sortedToolsUsage.map((tool, index) => (
                                    <ToolRow
                                        key={tool._id || index}
                                        tool={tool}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-8 text-center text-gray-400">
                                        No tools data available for the selected period
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profitable Tools & Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Profitable Tools */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-[#00FF89]/20 rounded-xl border border-[#00FF89]/30">
                            <DollarSign className="w-5 h-5 text-[#00FF89]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Most Profitable Tools</h3>
                            <p className="text-sm text-gray-400">Top revenue-generating tools</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {profitableTools.length > 0 ? (
                            profitableTools.slice(0, 5).map((tool, index) => (
                                <ProfitableToolItem
                                    key={tool._id || index}
                                    tool={tool}
                                    rank={index + 1}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-400">
                                <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No profitable tools data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tools Performance Trend */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-400/20 rounded-xl border border-blue-400/30">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
                            <p className="text-sm text-gray-400">Tools performance over {timeRange}</p>
                        </div>
                    </div>

                    {toolsPerformance.length > 0 ? (
                        <div className="space-y-4">
                            <div className="text-center text-gray-400">
                                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Performance chart coming soon</p>
                                <p className="text-xs">Tracking {toolsPerformance.length} data points</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No performance data available</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function SummaryCard({ title, value, icon, color, bgColor }) {
    return (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center gap-3">
                <div className={`p-3 ${bgColor} rounded-xl border border-gray-700`}>
                    <div className={color}>{icon}</div>
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{value}</p>
                    <p className="text-sm text-gray-400">{title}</p>
                </div>
            </div>
        </div>
    )
}

function SortableHeader({ label, field, sortBy, sortOrder, onSort }) {
    const isActive = sortBy === field

    return (
        <th
            className="px-6 py-4 text-left cursor-pointer hover:bg-gray-700/50 transition-colors"
            onClick={() => onSort(field)}>
            <div className="flex items-center gap-2">
                <span className={`text-xs font-medium uppercase tracking-wider ${isActive ? 'text-[#00FF89]' : 'text-gray-300'}`}>{label}</span>
                {isActive && (
                    <div className="text-[#00FF89]">
                        {sortOrder === 'desc' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    </div>
                )}
            </div>
        </th>
    )
}

function ToolRow({ tool }) {
    return (
        <tr className="hover:bg-gray-800/50 transition-colors">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-lg border border-[#00FF89]/30 flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-[#00FF89]" />
                    </div>
                    <span className="font-medium text-white">{tool.toolName || 'Unknown Tool'}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-white font-semibold">{tool.totalProducts || 0}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{(tool.totalViews || 0).toLocaleString()}</span>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="text-[#00FF89] font-semibold">{tool.totalSales || 0}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-white">{(tool.avgRating || 0).toFixed(1)}</span>
                </div>
            </td>
        </tr>
    )
}

function ProfitableToolItem({ tool, rank }) {
    const rankColors = {
        1: 'text-yellow-400 bg-yellow-400/20',
        2: 'text-gray-300 bg-gray-300/20',
        3: 'text-orange-400 bg-orange-400/20'
    }

    const defaultColor = 'text-gray-400 bg-gray-400/20'
    const colorClass = rankColors[rank] || defaultColor

    return (
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold`}>{rank}</div>
                <span className="font-medium text-white">{tool._id}</span>
            </div>
            <div className="text-right">
                <p className="text-[#00FF89] font-semibold">${(tool.totalRevenue || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-400">{tool.totalSales || 0} sales</p>
            </div>
        </div>
    )
}

function ToolsTabSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                            <div>
                                <div className="w-16 h-8 bg-gray-700 rounded mb-2"></div>
                                <div className="w-24 h-4 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <div className="w-48 h-6 bg-gray-700 rounded mb-2"></div>
                    <div className="w-64 h-4 bg-gray-700 rounded"></div>
                </div>

                <div className="p-6 space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                                <div className="w-24 h-4 bg-gray-700 rounded"></div>
                            </div>
                            <div className="flex gap-8">
                                <div className="w-8 h-4 bg-gray-700 rounded"></div>
                                <div className="w-12 h-4 bg-gray-700 rounded"></div>
                                <div className="w-8 h-4 bg-gray-700 rounded"></div>
                                <div className="w-12 h-4 bg-gray-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

