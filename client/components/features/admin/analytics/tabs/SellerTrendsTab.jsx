'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Activity, Target, Package, DollarSign, UserCheck, UserPlus } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell } from 'recharts'

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

const clamp = (num, min, max) => Math.min(Math.max(num ?? 0, min), max)

const SellerTrendsTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const data = payload[0].payload
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium">{data.date}</p>
            {data.registrations !== undefined && <p className="text-gray-400">Registrations: {formatNumber(data.registrations)}</p>}
            {data.activeSellers !== undefined && <p className="text-gray-400">Active Sellers: {formatNumber(data.activeSellers)}</p>}
            {data.productsCreated !== undefined && <p className="text-gray-400">Products Created: {formatNumber(data.productsCreated)}</p>}
            {data.verifications !== undefined && <p className="text-gray-400">Verifications: {formatNumber(data.verifications)}</p>}
        </div>
    )
}

export const SellerTrendsTab = ({ analyticsData, timeRange, loading }) => {
    const sellerTrendsData = useMemo(() => {
        if (!analyticsData) return null

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

        const generateTrendsWithAllDates = (registrations, activity, verifications, period) => {
            const days = getDaysFromTimeRange(period)
            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(endDate.getDate() - (days - 1))

            const registrationMap = new Map()
            registrations.forEach((item) => {
                const dateKey = item._id?.date || item.date
                if (dateKey) {
                    registrationMap.set(dateKey, item.count || 0)
                }
            })

            const activityMap = new Map()
            activity.forEach((item) => {
                const dateKey = item._id?.date || item.date
                if (dateKey) {
                    activityMap.set(dateKey, {
                        activeSellers: item.activeSellerCount || 0,
                        productsCreated: item.productsCreated || 0
                    })
                }
            })

            const verificationMap = new Map()
            verifications.forEach((item) => {
                const dateKey = item._id?.date || item.date
                if (dateKey) {
                    verificationMap.set(dateKey, item.count || 0)
                }
            })

            const trends = []
            for (let i = 0; i < days; i++) {
                const currentDate = new Date(startDate)
                currentDate.setDate(startDate.getDate() + i)
                const dateString = currentDate.toISOString().split('T')[0]

                const registrations = registrationMap.get(dateString) || 0
                const activityData = activityMap.get(dateString) || { activeSellers: 0, productsCreated: 0 }
                const verifications = verificationMap.get(dateString) || 0

                trends.push({
                    date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    registrations,
                    activeSellers: activityData.activeSellers,
                    productsCreated: activityData.productsCreated,
                    verifications,
                    conversionRate: registrations > 0 ? (verifications / registrations) * 100 : 0
                })
            }

            return trends
        }

        const summary = analyticsData.summary || {}
        const trends = generateTrendsWithAllDates(
            analyticsData.sellerRegistrations || [],
            analyticsData.sellerActivity || [],
            analyticsData.verificationTrend || [],
            timeRange
        )

        const totalRegistrations = trends.reduce((sum, item) => sum + item.registrations, 0)
        const totalVerifications = trends.reduce((sum, item) => sum + item.verifications, 0)
        const totalProductsCreated = trends.reduce((sum, item) => sum + item.productsCreated, 0)
        const avgConversionRate = totalRegistrations > 0 ? (totalVerifications / totalRegistrations) * 100 : 0

        return {
            metrics: {
                totalSellers: summary.totalSellers || 0,
                newSellers: summary.newSellers || 0,
                activeSellers: summary.activeSellers || 0,
                growthRate: summary.growthRate || 0,
                activityRate: summary.activityRate || 0,
                totalRegistrations,
                totalVerifications,
                totalProductsCreated,
                avgConversionRate
            },
            trends
        }
    }, [analyticsData, timeRange])

    if (loading) {
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

    if (!sellerTrendsData) {
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

    const { metrics, trends } = sellerTrendsData
    const validTrends = Array.isArray(trends) ? trends : []

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Sellers</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalSellers)}</div>
                    <div className="text-sm text-[#00FF89]">
                        +{formatNumber(metrics.newSellers)} new this {timeRange === '7d' ? 'week' : 'month'}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Active Sellers</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.activeSellers)}</div>
                    <div className="text-sm text-gray-400">{formatPercentage(metrics.activityRate)} activity rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Registrations</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalRegistrations)}</div>
                    <div className="text-sm text-[#00FF89]">{formatPercentage(metrics.growthRate)} growth rate</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Verifications</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalVerifications)}</div>
                    <div className="text-sm text-gray-400">{formatPercentage(metrics.avgConversionRate)} conversion rate</div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Seller Activity Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                            <span className="text-gray-400">Registrations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Active Sellers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#8B5CF6] rounded-sm"></div>
                            <span className="text-gray-400">Products Created</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#F59E0B] rounded-full"></div>
                            <span className="text-gray-400">Verifications</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    {validTrends.length > 0 ? (
                        <ResponsiveContainer
                            width="100%"
                            height="100%">
                            <ComposedChart data={validTrends}>
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
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip content={<SellerTrendsTooltip />} />
                                <Area
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="registrations"
                                    fill="#00FF89"
                                    stroke="#00FF89"
                                    fillOpacity={0.15}
                                    name="Registrations"
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="activeSellers"
                                    fill="#3B82F6"
                                    name="Active Sellers"
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="productsCreated"
                                    fill="#8B5CF6"
                                    name="Products Created"
                                />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="verifications"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    dot={{ fill: '#F59E0B', r: 3 }}
                                    name="Verifications"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No seller trends data for {timeRange}</p>
                                <p className="text-sm mt-1">Charts will appear once seller activity is tracked</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Key Metrics Distribution</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white font-medium">Total Registrations</span>
                                <span className="text-gray-400">{formatNumber(metrics.totalRegistrations)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#00FF89] h-2 rounded-full transition-all duration-300"
                                    style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white font-medium">Verified Sellers</span>
                                <span className="text-gray-400">{formatNumber(metrics.totalVerifications)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#3B82F6] h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${clamp(
                                            metrics.totalRegistrations > 0 ? (metrics.totalVerifications / metrics.totalRegistrations) * 100 : 0,
                                            0,
                                            100
                                        )}%`
                                    }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white font-medium">Active Sellers</span>
                                <span className="text-gray-400">{formatNumber(metrics.activeSellers)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#8B5CF6] h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${clamp(
                                            metrics.totalSellers > 0 ? (metrics.activeSellers / metrics.totalSellers) * 100 : 0,
                                            0,
                                            100
                                        )}%`
                                    }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-white font-medium">Products Created</span>
                                <span className="text-gray-400">{formatNumber(metrics.totalProductsCreated)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-[#F59E0B] h-2 rounded-full transition-all duration-300"
                                    style={{
                                        width: `${clamp(
                                            metrics.activeSellers > 0
                                                ? Math.min((metrics.totalProductsCreated / metrics.activeSellers) * 10, 100)
                                                : 0,
                                            0,
                                            100
                                        )}%`
                                    }}></div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
                    <div className="space-y-4">
                        <div className="bg-gray-750 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Conversion Rate</h4>
                                    <p className="text-2xl font-bold text-[#00FF89]">{formatPercentage(metrics.avgConversionRate)}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">Registration to verification conversion</p>
                        </div>

                        <div className="bg-gray-750 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#3B82F6]/20 rounded-lg flex items-center justify-center">
                                    <Activity className="w-4 h-4 text-[#3B82F6]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Activity Rate</h4>
                                    <p className="text-2xl font-bold text-[#3B82F6]">{formatPercentage(metrics.activityRate)}</p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">Sellers actively creating products</p>
                        </div>

                        <div className="bg-gray-750 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-[#8B5CF6]/20 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-[#8B5CF6]" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">Avg Products</h4>
                                    <p className="text-2xl font-bold text-[#8B5CF6]">
                                        {metrics.activeSellers > 0 ? (metrics.totalProductsCreated / metrics.activeSellers).toFixed(1) : '0.0'}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400">Products per active seller</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

