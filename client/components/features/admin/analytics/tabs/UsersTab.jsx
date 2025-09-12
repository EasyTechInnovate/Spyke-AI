'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, UserPlus, UserCheck, Activity, TrendingUp, MapPin, Calendar } from 'lucide-react'
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Bar, Line, PieChart, Pie, Cell, AreaChart } from 'recharts'

// Utility functions for formatting
const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num || 0)
}

const formatPercentage = (num) => {
    return `${(num || 0).toFixed(1)}%`
}

export const UsersTab = ({ analyticsData, timeRange, loading }) => {
    const [usersData, setUsersData] = useState(null)

    const generateTrendsWithAllDates = (dailyUsers, timeRange) => {
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
        dailyUsers.forEach(item => {
            const dateKey = item._id?.date || item.date
            if (dateKey) {
                dataMap.set(dateKey, {
                    registrations: item.count || 0,
                    activeUsers: item.activeUserCount || 0,
                    purchases: item.purchases || 0
                })
            }
        })

        // Generate complete date range with placeholder data for missing dates
        const trends = []
        for (let i = 0; i < days; i++) {
            const currentDate = new Date(startDate)
            currentDate.setDate(startDate.getDate() + i)
            const dateString = currentDate.toISOString().split('T')[0]
            
            const data = dataMap.get(dateString) || { registrations: 0, activeUsers: 0, purchases: 0 }
            
            trends.push({
                date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                registrations: data.registrations,
                activeUsers: data.activeUsers,
                purchases: data.purchases,
                engagementRate: data.activeUsers && data.registrations 
                    ? (data.activeUsers / data.registrations * 100) 
                    : 0
            })
        }

        return trends
    }

    useEffect(() => {
        if (analyticsData) {
            // Process the passed analytics data instead of making API calls
            console.log('Analytics Data received:', analyticsData)

            // Extract real data from passed analytics data
            const processedData = {
                metrics: {
                    totalUsers: analyticsData.users?.pagination?.totalCount || 0,
                    newUsers: analyticsData.registrationTrend?.length || 0,
                    activeUsers: analyticsData.users?.users?.length || 0,
                    growthRate: 0, // Calculate from trends if needed
                    retentionRate: 0 // Calculate from user data if needed
                },
                // Transform registration trends to chart format
                trends: generateTrendsWithAllDates(analyticsData.registrationTrend || [], timeRange),
                // User activity data
                activityTrends: generateTrendsWithAllDates(analyticsData.registrationTrend || [], timeRange),
                topUsers: analyticsData.users?.users?.slice(0, 10).map((user) => ({
                    _id: user._id,
                    name: user.name || 'Anonymous User',
                    emailAddress: user.emailAddress,
                    totalPurchases: user.totalPurchases || 0,
                    totalSpent: user.totalSpent || 0,
                    avgOrderValue: user.avgOrderValue || 0,
                    lastPurchase: user.lastPurchase,
                    joinedAt: user.createdAt || user.joinedAt
                })) || [],
                roleDistribution: analyticsData.roleDistribution?.map((role, index) => ({
                    _id: role._id,
                    name: role._id || 'Unknown',
                    count: role.count || 0,
                    percentage: analyticsData.roleDistribution?.length > 0 
                        ? ((role.count || 0) / analyticsData.roleDistribution.reduce((sum, r) => sum + (r.count || 0), 0) * 100)
                        : 0
                })) || []
            }

            console.log('Processed Users Data:', processedData)
            setUsersData(processedData)
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
    if (!usersData) {
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

    const { metrics = {}, trends = [], activityTrends = [], topUsers = [], roleDistribution = [] } = usersData

    // Ensure trends is a valid array
    const validTrends = Array.isArray(trends) ? trends : []
    const validActivityTrends = Array.isArray(activityTrends) ? activityTrends : []

    // Colors for charts
    const CHART_COLORS = ['#00FF89', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#10B981', '#F97316', '#6366F1']

    return (
        <div className="space-y-6">
            {/* User Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="text-2xl font-bold text-white mb-1">{formatNumber(metrics.totalUsers)}</div>
                    <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className="w-3 h-3 text-[#00FF89]" />
                        <span className="text-[#00FF89]">{formatPercentage(metrics.growthRate)}</span>
                        <span className="text-gray-400">vs last period</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">New Users</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(metrics.newUsers)}
                    </div>
                    <div className="text-sm text-gray-400">This {timeRange === '7d' ? 'week' : 'month'}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Active Users</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <UserCheck className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatNumber(metrics.activeUsers)}
                    </div>
                    <div className="text-sm text-gray-400">Recently active</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gray-800 rounded-lg p-6"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-400">Retention Rate</h3>
                        <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center">
                            <Activity className="w-4 h-4 text-[#00FF89]" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                        {formatPercentage(metrics.retentionRate)}
                    </div>
                    <div className="text-sm text-gray-400">30-day retention</div>
                </motion.div>
            </div>

            {/* User Registration & Activity Trends */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">User Registration & Activity Trends</h3>
                    
                    {/* Legend */}
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#00FF89] rounded-sm opacity-80"></div>
                            <span className="text-gray-400">New Registrations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#3B82F6] rounded-sm"></div>
                            <span className="text-gray-400">Active Users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-2 bg-[#8B5CF6] rounded-full"></div>
                            <span className="text-gray-400">Engagement Rate</span>
                        </div>
                    </div>
                </div>
                <div className="h-80 relative">
                    {validTrends.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={validTrends}>
                                <defs>
                                    <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
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
                                                            {entry.name}: {entry.dataKey === 'engagementRate' ? `${entry.value?.toFixed(1)}%` : entry.value?.toLocaleString()}
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
                                    dataKey="registrations"
                                    stroke="#00FF89"
                                    fillOpacity={1}
                                    fill="url(#registrationGradient)"
                                    strokeWidth={2}
                                    name="New Registrations"
                                />
                                <Bar
                                    yAxisId="left"
                                    dataKey="activeUsers"
                                    fill="#3B82F6"
                                    radius={[2, 2, 0, 0]}
                                    name="Active Users"
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="engagementRate"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    dot={{ fill: '#8B5CF6', r: 4 }}
                                    name="Engagement Rate"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No user data for {timeRange}</p>
                                <p className="text-sm mt-1">Charts will appear once users register</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Role Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">User Role Distribution</h3>
                    <div className="h-80 relative">
                        {roleDistribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="count"
                                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                                    >
                                        {roleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload
                                                return (
                                                    <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                                                        <p className="text-white font-medium capitalize">{data.name}</p>
                                                        <p className="text-gray-400">Users: {formatNumber(data.count)}</p>
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
                                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No role distribution data available</p>
                                    <p className="text-sm mt-1">Role analytics will appear once users register</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Top Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Users by Activity</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {topUsers.length > 0 ? topUsers.map((user, index) => (
                            <div key={user._id} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center text-sm font-medium text-gray-300">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="text-white font-medium text-sm">{user.name}</div>
                                        <div className="text-gray-400 text-xs">{user.emailAddress}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-white font-medium">{formatNumber(user.totalPurchases)} orders</div>
                                    <div className="text-gray-400 text-xs">
                                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Recently joined'}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 py-8">
                                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>No user activity data available</p>
                                <p className="text-sm mt-1">Top users will appear once there's activity</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* User Activity Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">User Engagement Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-[#00FF89] mb-2">
                            {metrics.totalUsers > 0 ? formatPercentage((metrics.activeUsers / metrics.totalUsers) * 100) : '0.0%'}
                        </div>
                        <div className="text-gray-400 text-sm">User Activity Rate</div>
                        <div className="text-xs text-gray-500 mt-1">Active users / Total users</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-2">
                            {metrics.totalUsers > 0 ? formatPercentage((metrics.newUsers / metrics.totalUsers) * 100) : '0.0%'}
                        </div>
                        <div className="text-gray-400 text-sm">New User Rate</div>
                        <div className="text-xs text-gray-500 mt-1">New users this period</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400 mb-2">
                            {formatPercentage(metrics.retentionRate)}
                        </div>
                        <div className="text-gray-400 text-sm">Retention Rate</div>
                        <div className="text-xs text-gray-500 mt-1">30-day user retention</div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
