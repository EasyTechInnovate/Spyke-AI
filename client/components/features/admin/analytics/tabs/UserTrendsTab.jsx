'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Activity, BarChart3, Target, UserPlus, Zap } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell, BarChart } from 'recharts'

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

const clamp = (num, min, max) => Math.min(Math.max(num ?? 0, min), max)

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
            <p className="text-white font-medium">{label}</p>
            {payload.map((entry, index) => (
                <p key={index} className="text-gray-400" style={{ color: entry.color }}>
                    {entry.name}: {formatNumber(entry.value)}
                </p>
            ))}
        </div>
    )
}

export const UserTrendsTab = ({ analyticsData, timeRange, loading }) => {
    const processedData = useMemo(() => {
        if (!analyticsData) return null

        // Handle multiple possible data structures
        const data = analyticsData.data || analyticsData
        
        if (!data || !data.summary) return null

        const { summary, userRegistrations, userActivity, roleDistribution } = data

        const registrationMap = new Map()
        userRegistrations?.forEach(reg => {
            const date = reg._id.date
            registrationMap.set(date, reg.count)
        })

        const activityMap = new Map()
        userActivity?.forEach(activity => {
            const date = activity._id.date
            activityMap.set(date, {
                purchases: activity.purchases,
                activeUsers: activity.activeUserCount
            })
        })

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

        const timeSeriesData = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            const dateString = currentDate.toISOString().split('T')[0]
            const displayDate = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            const registrations = registrationMap.get(dateString) || 0
            const activity = activityMap.get(dateString) || { purchases: 0, activeUsers: 0 }

            timeSeriesData.push({
                date: displayDate,
                registrations,
                purchases: activity.purchases,
                activeUsers: activity.activeUsers
            })
        }

        const roleAggregation = new Map()
        roleDistribution?.forEach(role => {
            const roleName = role._id.role
            const current = roleAggregation.get(roleName) || 0
            roleAggregation.set(roleName, current + role.count)
        })

        const roleData = Array.from(roleAggregation.entries()).map(([role, count]) => ({
            role: role.charAt(0).toUpperCase() + role.slice(1),
            count,
            percentage: (count / summary.totalUsers) * 100
        }))

        const totalPurchases = userActivity?.reduce((sum, activity) => sum + activity.purchases, 0) || 0
        const totalActiveUserDays = userActivity?.reduce((sum, activity) => sum + activity.activeUserCount, 0) || 0
        const avgPurchasesPerActiveUser = totalActiveUserDays > 0 ? totalPurchases / totalActiveUserDays : 0

        const dailyActivityData = userActivity?.map(activity => ({
            date: new Date(activity._id.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            purchases: activity.purchases,
            activeUsers: activity.activeUserCount,
            purchasesPerUser: activity.activeUserCount > 0 ? activity.purchases / activity.activeUserCount : 0
        })).sort((a, b) => new Date(a.date) - new Date(b.date)) || []

        return {
            summary: {
                ...summary,
                totalPurchases,
                avgPurchasesPerActiveUser,
                activationRate: summary.totalUsers > 0 ? (summary.activeUsers / summary.totalUsers) * 100 : 0
            },
            timeSeriesData,
            roleData,
            dailyActivityData
        }
    }, [analyticsData, timeRange])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-800 rounded-lg p-6 h-80 animate-pulse">
                            <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
                            <div className="h-full bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (!processedData) {
        return (
            <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50 text-gray-400" />
                    <p className="text-lg font-medium text-white">No user trends data available</p>
                    <p className="text-sm mt-1 text-gray-400">User analytics will appear once tracking is enabled</p>
                </div>
            </div>
        )
    }

    const { summary, timeSeriesData, roleData, dailyActivityData } = processedData
    const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981']

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(summary.totalUsers)}</div>
                    <div className="text-sm text-[#00FF89]">
                        +{formatNumber(summary.newUsers)} new ({formatPercentage(summary.growthRate)})
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(summary.activeUsers)}</div>
                    <div className="text-sm text-gray-400">
                        {formatPercentage(summary.activationRate)} activation rate
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Retention Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Target className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(summary.retentionRate)}</div>
                    <div className="text-sm text-gray-400">
                        User retention
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Total Purchases</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(summary.totalPurchases)}</div>
                    <div className="text-sm text-gray-400">
                        Total transactions
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Avg Purchases/User</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {summary.avgPurchasesPerActiveUser.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">
                        Per active user
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Growth Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">{formatPercentage(summary.growthRate)}</div>
                    <div className="text-sm text-gray-400">
                        User growth
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">User Registration Trends</h3>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm"></div>
                            <span className="text-gray-400">Registrations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Active Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#F59E0B] rounded-full"></div>
                            <span className="text-gray-400">Purchases</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={timeSeriesData}>
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
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                yAxisId="left"
                                type="monotone"
                                dataKey="registrations"
                                fill="#00FF89"
                                stroke="#00FF89"
                                fillOpacity={0.15}
                                name="Registrations"
                            />
                            <Bar yAxisId="left" dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="purchases"
                                stroke="#F59E0B"
                                strokeWidth={2}
                                dot={{ fill: '#F59E0B', r: 3 }}
                                name="Purchases"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Role Distribution</h3>
                    <div className="h-80 relative">
                        {roleData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ role, percentage }) => `${role}: ${clamp(percentage, 0, 100).toFixed(1)}%`}
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No role distribution data available</p>
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
                    <h3 className="text-lg font-semibold text-white mb-4">Daily Activity Overview</h3>
                    <div className="h-80 relative">
                        {dailyActivityData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
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
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="purchases" fill="#00FF89" name="Purchases" />
                                    <Bar dataKey="activeUsers" fill="#3B82F6" name="Active Users" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                <div className="text-center">
                                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No daily activity data available</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {roleData.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Role Breakdown Details</h3>
                    <div className="space-y-4">
                        {roleData.map((role, index) => (
                            <div key={role.role} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white font-medium">{role.role}</span>
                                    <span className="text-gray-400">{formatNumber(role.count)} users</span>
                                </div>
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full transition-all duration-300"
                                        style={{ 
                                            width: `${clamp(role.percentage, 0, 100)}%`,
                                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length]
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Distribution</span>
                                    <span>{clamp(role.percentage, 0, 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    )
}
