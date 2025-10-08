'use client'
import {
    TrendingUp,
    TrendingDown,
    Eye,
    Package,
    ShoppingCart,
    DollarSign,
    Calendar,
    Star,
    Users,
    Clock,
    Award,
    Target,
    Activity,
    Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { AnalyticsLoadingScreen } from '../AnalyticsLoadingScreen'
const StatCard = ({ title, value, change, icon: Icon, trend = 'up', description, highlight = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors ${
            highlight ? 'ring-2 ring-[#00FF89]/20 bg-gradient-to-br from-gray-800 to-gray-800/50' : ''
        }`}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${highlight ? 'bg-[#00FF89]/20' : 'bg-gray-700'}`}>
                    <Icon className={`w-5 h-5 ${highlight ? 'text-[#00FF89]' : 'text-[#00FF89]'}`} />
                </div>
                <h3 className="text-gray-300 font-medium">{title}</h3>
            </div>
            {change && (
                <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {change}
                </div>
            )}
        </div>
        <div className="space-y-2">
            <div className={`text-2xl font-bold ${highlight ? 'text-[#00FF89]' : 'text-white'}`}>{value}</div>
            {description && <p className="text-sm text-gray-400">{description}</p>}
        </div>
    </motion.div>
)
const RecentSaleCard = ({ sale, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {sale.userId?.avatar ? (
                        <img
                            src={sale.userId.avatar}
                            alt={sale.userId.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-[#00FF89] font-medium">{sale.userId?.name?.charAt(0) || 'U'}</span>
                    )}
                </div>
                <div>
                    <p className="text-white font-medium">{sale.userId?.name || 'Unknown Customer'}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-[#00FF89] font-semibold">${sale.finalAmount?.toLocaleString() || '0'}</p>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    {new Date(sale.createdAt).toLocaleDateString()}
                </div>
            </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
            <div className="flex items-center gap-2">
                <span
                    className={`px-2 py-1 text-xs rounded-full ${
                        sale.paymentMethod === 'manual' ? 'bg-blue-900 text-blue-300' : 'bg-green-900 text-green-300'
                    }`}>
                    {sale.paymentMethod.toUpperCase()}
                </span>
                <span className="px-2 py-1 text-xs bg-green-900 text-green-300 rounded-full">{sale.orderStatus.toUpperCase()}</span>
            </div>
            <span className="text-gray-400 text-xs">#{sale._id?.slice(-8) || 'N/A'}</span>
        </div>
    </motion.div>
)
const RevenueTrendChart = ({ recentSales, overview, timeRange }) => {
    const generateDailyData = () => {
        const days = []
        const today = new Date()
        let numDays
        switch (timeRange) {
            case '7d':
                numDays = 7
                break
            case '30d':
                numDays = 30
                break
            case '90d':
                numDays = 90
                break
            case '1y':
                numDays = 365
                break
            default:
                numDays = 30
        }
        for (let i = numDays - 1; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const dayData = {
                date: date.toISOString().split('T')[0],
                revenue: 0,
                sales: 0,
                label: date.toLocaleDateString('en', {
                    month: numDays > 30 ? 'short' : 'numeric',
                    day: 'numeric'
                })
            }
            const daySales = recentSales.filter((sale) => {
                const saleDate = new Date(sale.createdAt).toISOString().split('T')[0]
                return saleDate === dayData.date
            })
            dayData.sales = daySales.length
            dayData.revenue = daySales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0)
            days.push(dayData)
        }
        return days
    }
    const dailyData = generateDailyData()
    const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 100)
    const hasData = dailyData.some((d) => d.revenue > 0)
    const getXAxisLabels = () => {
        const totalDays = dailyData.length
        let step
        if (totalDays <= 7)
            step = 1 
        else if (totalDays <= 30)
            step = 5 
        else if (totalDays <= 90)
            step = 15 
        else step = 30 
        return dailyData.filter((_, index) => index % step === 0 || index === dailyData.length - 1)
    }
    const xAxisLabels = getXAxisLabels()
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00FF89]" />
                Revenue Trend ({timeRange.toUpperCase()})
            </h3>
            <div className="relative h-64 mb-4">
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 w-12 pr-2">
                    <span>${Math.round(maxRevenue)}</span>
                    <span>${Math.round(maxRevenue * 0.5)}</span>
                    <span>$0</span>
                </div>
                <div className="ml-12 h-full relative">
                    <div className="absolute inset-0">
                        {[0, 50, 100].map((percent) => (
                            <div
                                key={percent}
                                className="absolute w-full border-t border-gray-600/20"
                                style={{ top: `${percent}%` }}
                            />
                        ))}
                    </div>
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 400 256">
                        <defs>
                            <linearGradient
                                id="revGradient"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%">
                                <stop
                                    offset="0%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.3"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.05"
                                />
                            </linearGradient>
                        </defs>
                        <path
                            d={`M 0 256 ${dailyData
                                .map((day, i) => {
                                    const x = (i / (dailyData.length - 1)) * 400
                                    const y = 256 - (day.revenue / maxRevenue) * 220
                                    return `L ${x} ${y}`
                                })
                                .join(' ')} L 400 256 Z`}
                            fill="url(#revGradient)"
                        />
                        <polyline
                            points={dailyData
                                .map((day, i) => {
                                    const x = (i / (dailyData.length - 1)) * 400
                                    const y = 256 - (day.revenue / maxRevenue) * 220
                                    return `${x},${y}`
                                })
                                .join(' ')}
                            fill="none"
                            stroke="#00FF89"
                            strokeWidth="3"
                        />
                        {dailyData.map((day, i) => {
                            if (day.revenue > 0) {
                                const x = (i / (dailyData.length - 1)) * 400
                                const y = 256 - (day.revenue / maxRevenue) * 220
                                return (
                                    <g key={`rev-${i}`}>
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="5"
                                            fill="#00FF89"
                                            stroke="#1F2937"
                                            strokeWidth="2"
                                        />
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="12"
                                            fill="transparent"
                                            stroke="transparent"
                                            strokeWidth="1">
                                            <title>
                                                ${day.revenue} on {day.label}
                                            </title>
                                        </circle>
                                    </g>
                                )
                            }
                            return null
                        })}
                    </svg>
                </div>
            </div>
            <div className="ml-12 flex justify-between text-xs text-gray-400">
                {xAxisLabels.map((day, index) => (
                    <span
                        key={index}
                        className={day.revenue > 0 ? 'text-[#00FF89]' : ''}>
                        {day.label}
                    </span>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700 text-center">
                <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00FF89] rounded-full"></div>
                        <span className="text-gray-300">{hasData ? `$${overview.totalRevenue?.toLocaleString()} total` : 'No revenue yet'}</span>
                    </div>
                    {hasData && (
                        <span className="text-gray-400">
                            {recentSales.length} sales in {timeRange.toUpperCase()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
const SalesVelocityChart = ({ recentSales, timeRange }) => {
    const generateVelocityData = () => {
        if (!recentSales || recentSales.length === 0) {
            return { velocityData: [], metrics: null }
        }
        const sortedSales = [...recentSales].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        const velocityData = []
        const metrics = {
            averageTimeBetwenSales: 0,
            accelerationRate: 0,
            peakVelocityPeriod: null,
            totalDuration: 0
        }
        let totalTimeBetweenSales = 0
        let velocityChanges = []
        sortedSales.forEach((sale, index) => {
            const saleDate = new Date(sale.createdAt)
            const dataPoint = {
                date: saleDate,
                cumulativeSales: index + 1,
                cumulativeRevenue: sortedSales.slice(0, index + 1).reduce((sum, s) => sum + (s.finalAmount || 0), 0),
                amount: sale.finalAmount || 0,
                customer: sale.userId?.name || 'Unknown',
                daysSinceStart: index === 0 ? 0 : Math.floor((saleDate - new Date(sortedSales[0].createdAt)) / (1000 * 60 * 60 * 24)),
                velocity: 0 
            }
            if (index > 0) {
                const daysSinceStart = Math.max(1, (saleDate - new Date(sortedSales[0].createdAt)) / (1000 * 60 * 60 * 24))
                dataPoint.velocity = (index + 1) / daysSinceStart
                if (index > 1) {
                    const prevVelocity = velocityData[index - 1].velocity
                    velocityChanges.push(dataPoint.velocity - prevVelocity)
                }
                const timeBetween = (saleDate - new Date(sortedSales[index - 1].createdAt)) / (1000 * 60 * 60 * 24)
                totalTimeBetweenSales += timeBetween
            } else {
                dataPoint.velocity = 1 
            }
            velocityData.push(dataPoint)
        })
        if (sortedSales.length > 1) {
            metrics.averageTimeBetwenSales = totalTimeBetweenSales / (sortedSales.length - 1)
            metrics.totalDuration =
                (new Date(sortedSales[sortedSales.length - 1].createdAt) - new Date(sortedSales[0].createdAt)) / (1000 * 60 * 60 * 24)
            if (velocityChanges.length > 0) {
                metrics.accelerationRate = velocityChanges.reduce((sum, change) => sum + change, 0) / velocityChanges.length
            }
            const maxVelocity = Math.max(...velocityData.map((d) => d.velocity))
            const peakPoint = velocityData.find((d) => d.velocity === maxVelocity)
            if (peakPoint) {
                metrics.peakVelocityPeriod = {
                    date: peakPoint.date,
                    velocity: maxVelocity,
                    salesCount: peakPoint.cumulativeSales
                }
            }
        }
        return { velocityData, metrics }
    }
    const { velocityData, metrics } = generateVelocityData()
    const maxSales = Math.max(...velocityData.map((d) => d.cumulativeSales), 5)
    const maxVelocity = Math.max(...velocityData.map((d) => d.velocity), 1)
    if (velocityData.length === 0) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00FF89]" />
                    Sales Velocity
                </h3>
                <div className="text-center py-12">
                    <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No sales data for velocity analysis</p>
                    <p className="text-gray-500 text-sm mt-2">Start making sales to see your velocity trends</p>
                </div>
            </div>
        )
    }
    const showDualAxis = velocityData.length > 2
    const chartHeight = showDualAxis ? 56 : 48
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00FF89]" />
                    Sales Velocity
                </h3>
                {metrics?.accelerationRate && (
                    <div
                        className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                            metrics.accelerationRate > 0
                                ? 'bg-green-900/50 text-green-400'
                                : metrics.accelerationRate < 0
                                  ? 'bg-red-900/50 text-red-400'
                                  : 'bg-gray-700 text-gray-400'
                        }`}>
                        {metrics.accelerationRate > 0 ? '↗' : metrics.accelerationRate < 0 ? '↘' : '→'}
                        {metrics.accelerationRate > 0 ? 'Accelerating' : metrics.accelerationRate < 0 ? 'Decelerating' : 'Steady'}
                    </div>
                )}
            </div>
            <div className={`relative h-${chartHeight} mb-4`}>
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-300 w-8">
                    <span>{maxSales}</span>
                    <span>{Math.ceil(maxSales * 0.75)}</span>
                    <span>{Math.ceil(maxSales * 0.5)}</span>
                    <span>{Math.ceil(maxSales * 0.25)}</span>
                    <span>0</span>
                </div>
                {showDualAxis && (
                    <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-purple-300 w-8 text-right">
                        <span>{maxVelocity.toFixed(1)}</span>
                        <span>{(maxVelocity * 0.75).toFixed(1)}</span>
                        <span>{(maxVelocity * 0.5).toFixed(1)}</span>
                        <span>{(maxVelocity * 0.25).toFixed(1)}</span>
                        <span>0</span>
                    </div>
                )}
                <div className={`${showDualAxis ? 'mx-8' : 'ml-8'} h-full relative`}>
                    <div className="absolute inset-0">
                        {[0, 25, 50, 75, 100].map((percent) => (
                            <div
                                key={percent}
                                className="absolute w-full border-t border-gray-600/30"
                                style={{ top: `${percent}%` }}
                            />
                        ))}
                        {velocityData.length > 5 && (
                            <div className="absolute inset-0">
                                {[25, 50, 75].map((percent) => (
                                    <div
                                        key={`v-${percent}`}
                                        className="absolute h-full border-l border-gray-600/20"
                                        style={{ left: `${percent}%` }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 300 224">
                        <defs>
                            <linearGradient
                                id="velocityGrad"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%">
                                <stop
                                    offset="0%"
                                    stopColor="#8B5CF6"
                                    stopOpacity="0.4"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#8B5CF6"
                                    stopOpacity="0.05"
                                />
                            </linearGradient>
                            <linearGradient
                                id="cumulativeGrad"
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%">
                                <stop
                                    offset="0%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.3"
                                />
                                <stop
                                    offset="100%"
                                    stopColor="#00FF89"
                                    stopOpacity="0.05"
                                />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur
                                    stdDeviation="3"
                                    result="coloredBlur"
                                />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        <path
                            d={`M 0 224 ${velocityData
                                .map((data, i) => {
                                    const x = (i / Math.max(velocityData.length - 1, 1)) * 300
                                    const y = 224 - (data.cumulativeSales / maxSales) * 200
                                    return `L ${x} ${y}`
                                })
                                .join(' ')} L 300 224 Z`}
                            fill="url(#cumulativeGrad)"
                        />
                        <polyline
                            points={velocityData
                                .map((data, i) => {
                                    const x = (i / Math.max(velocityData.length - 1, 1)) * 300
                                    const y = 224 - (data.cumulativeSales / maxSales) * 200
                                    return `${x},${y}`
                                })
                                .join(' ')}
                            fill="none"
                            stroke="#00FF89"
                            strokeWidth="3"
                            filter="url(#glow)"
                        />
                        {showDualAxis && (
                            <polyline
                                points={velocityData
                                    .map((data, i) => {
                                        const x = (i / Math.max(velocityData.length - 1, 1)) * 300
                                        const y = 224 - (data.velocity / maxVelocity) * 200
                                        return `${x},${y}`
                                    })
                                    .join(' ')}
                                fill="none"
                                stroke="#8B5CF6"
                                strokeWidth="2"
                                strokeDasharray="8,4"
                                opacity="0.8"
                            />
                        )}
                        {velocityData.map((data, i) => {
                            const x = (i / Math.max(velocityData.length - 1, 1)) * 300
                            const y = 224 - (data.cumulativeSales / maxSales) * 200
                            const isImportant = data.amount > velocityData.reduce((sum, d) => sum + d.amount, 0) / velocityData.length
                            return (
                                <g key={i}>
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="12"
                                        fill="none"
                                        stroke="#00FF89"
                                        strokeWidth="1"
                                        opacity="0.3"
                                    />
                                    {isImportant && (
                                        <circle
                                            cx={x}
                                            cy={y}
                                            r="16"
                                            fill="none"
                                            stroke="#FFD700"
                                            strokeWidth="1"
                                            opacity="0.5"
                                        />
                                    )}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r={isImportant ? '8' : '6'}
                                        fill={isImportant ? '#FFD700' : '#00FF89'}
                                        stroke="#1F2937"
                                        strokeWidth="2"
                                        filter="url(#glow)"
                                    />
                                    <text
                                        x={x}
                                        y={y - (isImportant ? 25 : 20)}
                                        textAnchor="middle"
                                        className="fill-white font-bold text-xs"
                                        style={{ fontSize: '11px' }}>
                                        #{data.cumulativeSales}
                                    </text>
                                    {isImportant && (
                                        <text
                                            x={x}
                                            y={y + 35}
                                            textAnchor="middle"
                                            className="fill-yellow-400 font-semibold text-xs"
                                            style={{ fontSize: '10px' }}>
                                            ${data.amount}
                                        </text>
                                    )}
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="20"
                                        fill="transparent"
                                        stroke="transparent">
                                        <title>
                                            Sale #{data.cumulativeSales} - ${data.amount}
                                            {'\n'}Customer: {data.customer}
                                            {'\n'}Date: {data.date.toLocaleDateString()}
                                            {showDualAxis && `\nVelocity: ${data.velocity.toFixed(2)} sales/day`}
                                        </title>
                                    </circle>
                                </g>
                            )
                        })}
                    </svg>
                </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-[#00FF89]">{velocityData.length}</div>
                        <div className="text-xs text-gray-400">Total Sales</div>
                    </div>
                    {metrics?.averageTimeBetwenSales && (
                        <div>
                            <div className="text-lg font-bold text-purple-400">{metrics.averageTimeBetwenSales.toFixed(1)}d</div>
                            <div className="text-xs text-gray-400">Avg Time Between</div>
                        </div>
                    )}
                    {metrics?.totalDuration && (
                        <div>
                            <div className="text-lg font-bold text-blue-400">{metrics.totalDuration.toFixed(0)}d</div>
                            <div className="text-xs text-gray-400">Sales Period</div>
                        </div>
                    )}
                    {metrics?.peakVelocityPeriod && (
                        <div>
                            <div className="text-lg font-bold text-yellow-400">{metrics.peakVelocityPeriod.velocity.toFixed(1)}</div>
                            <div className="text-xs text-gray-400">Peak Velocity</div>
                        </div>
                    )}
                </div>
                {showDualAxis && (
                    <div className="text-center">
                        <p className="text-gray-400 text-sm">
                            Current velocity:{' '}
                            <span className="text-purple-400 font-semibold">
                                {velocityData[velocityData.length - 1]?.velocity.toFixed(2)} sales/day
                            </span>
                        </p>
                        {metrics?.accelerationRate && Math.abs(metrics.accelerationRate) > 0.01 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {metrics.accelerationRate > 0 ? 'Sales pace is increasing' : 'Sales pace is slowing down'}
                            </p>
                        )}
                    </div>
                )}
                <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#00FF89] rounded-full"></div>
                        <span className="text-xs text-gray-300">Cumulative Sales</span>
                    </div>
                    {showDualAxis && (
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-1 bg-purple-500 rounded opacity-80"
                                style={{
                                    backgroundImage: 'repeating-linear-gradient(to right, #8B5CF6 0, #8B5CF6 4px, transparent 4px, transparent 8px)'
                                }}></div>
                            <span className="text-xs text-gray-300">Velocity Trend</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-xs text-gray-300">High Value Sales</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
const PerformanceSparklines = ({ overview, recentSales }) => {
    const generateSparklineData = (type) => {
        const days = 7 
        const data = []
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dayStart = new Date(date)
            dayStart.setHours(0, 0, 0, 0)
            const dayEnd = new Date(date)
            dayEnd.setHours(23, 59, 59, 999)
            const daySales = recentSales.filter((sale) => {
                const saleDate = new Date(sale.createdAt)
                return saleDate >= dayStart && saleDate <= dayEnd
            })
            let value = 0
            switch (type) {
                case 'revenue':
                    value = daySales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0)
                    break
                case 'sales':
                    value = daySales.length
                    break
                case 'aov':
                    value = daySales.length > 0 ? daySales.reduce((sum, sale) => sum + (sale.finalAmount || 0), 0) / daySales.length : 0
                    break
                default:
                    value = 0
            }
            data.push(value)
        }
        return data
    }
    const Sparkline = ({ data, color = '#00FF89', className = '', totalValue = 0, label = '' }) => {
        let chartData = data
        if (!data || data.length === 0 || data.every((d) => d === 0)) {
            switch (label) {
                case 'revenue':
                    chartData = [0, 0, 0, overview.totalRevenue * 0.3, overview.totalRevenue * 0.7, 0, overview.totalRevenue * 0.5]
                    break
                case 'sales':
                    chartData = [
                        0,
                        0,
                        0,
                        Math.ceil(overview.totalSales * 0.3),
                        Math.ceil(overview.totalSales * 0.7),
                        0,
                        Math.ceil(overview.totalSales * 0.5)
                    ]
                    break
                case 'aov':
                    chartData = [0, 0, 0, overview.avgOrderValue * 0.8, overview.avgOrderValue * 1.2, 0, overview.avgOrderValue]
                    break
                default:
                    chartData = [0, 120, 320, 280, 450, 380, 520]
            }
        }
        const max = Math.max(...chartData, 1)
        const min = Math.min(...chartData)
        const range = max - min || 1
        return (
            <div className="relative h-16">
                <svg
                    className={`w-full h-full ${className}`}
                    viewBox="0 0 280 64"
                    preserveAspectRatio="none">
                    <defs>
                        <linearGradient
                            id={`sparkGrad-${label}`}
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%">
                            <stop
                                offset="0%"
                                stopColor={color}
                                stopOpacity="0.4"
                            />
                            <stop
                                offset="100%"
                                stopColor={color}
                                stopOpacity="0.05"
                            />
                        </linearGradient>
                    </defs>
                    <path
                        d={`M 0 64 ${chartData
                            .map((value, i) => {
                                const x = (i / (chartData.length - 1)) * 280
                                const y = 10 + (1 - (value - min) / range) * 44
                                return `L ${x} ${y}`
                            })
                            .join(' ')} L 280 64 Z`}
                        fill={`url(#sparkGrad-${label})`}
                    />
                    <polyline
                        points={chartData
                            .map((value, i) => {
                                const x = (i / (chartData.length - 1)) * 280
                                const y = 10 + (1 - (value - min) / range) * 44
                                return `${x},${y}`
                            })
                            .join(' ')}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                    />
                    {chartData.map((value, i) => {
                        const x = (i / (chartData.length - 1)) * 280
                        const y = 10 + (1 - (value - min) / range) * 44
                        return (
                            <circle
                                key={i}
                                cx={x}
                                cy={y}
                                r="3"
                                fill={color}
                                stroke="#1F2937"
                                strokeWidth="1"
                            />
                        )
                    })}
                </svg>
                <div className="absolute top-1 right-2">
                    <span className="text-xl font-bold text-white">
                        {label === 'sales' ? totalValue : `$${Math.round(totalValue).toLocaleString()}`}
                    </span>
                </div>
            </div>
        )
    }
    const revenueData = generateSparklineData('revenue')
    const salesData = generateSparklineData('sales')
    const aovData = generateSparklineData('aov')
    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0) || overview.totalRevenue || 0
    const totalSales = salesData.reduce((sum, val) => sum + val, 0) || overview.totalSales || 0
    const avgAOV = overview.avgOrderValue || 0
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[#00FF89]" />
                        <span className="text-gray-400 text-sm">7-Day Revenue</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <Sparkline
                    data={revenueData}
                    color="#00FF89"
                    totalValue={totalRevenue}
                    label="revenue"
                />
                <div className="mt-2 text-xs text-gray-500">Last 7 days trend</div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">7-Day Sales</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <Sparkline
                    data={salesData}
                    color="#3B82F6"
                    totalValue={totalSales}
                    label="sales"
                />
                <div className="mt-2 text-xs text-gray-500">Transaction volume</div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">Avg Order Value</span>
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <Sparkline
                    data={aovData}
                    color="#8B5CF6"
                    totalValue={avgAOV}
                    label="aov"
                />
                <div className="mt-2 text-xs text-gray-500">Average order value</div>
            </motion.div>
        </div>
    )
}
const BusinessHealth = ({ overview, recentSales }) => {
    const productUtilization = overview.totalProducts > 0 ? (overview.activeProducts / overview.totalProducts) * 100 : 0
    const conversionRate = overview.totalViews > 0 ? (overview.totalSales / overview.totalViews) * 100 : 0
    const recentActivity = recentSales.filter((sale) => {
        const saleDate = new Date(sale.createdAt)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        return saleDate >= thirtyDaysAgo
    }).length
    const getHealthScore = () => {
        let score = 0
        if (overview.totalSales > 0) score += 25
        if (overview.activeProducts > 0) score += 25
        if (recentActivity > 0) score += 25
        if (overview.avgOrderValue > 100) score += 25
        return score
    }
    const healthScore = getHealthScore()
    const getHealthColor = (score) => {
        if (score >= 75) return 'text-green-400'
        if (score >= 50) return 'text-yellow-400'
        return 'text-red-400'
    }
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#00FF89]" />
                Business Health Score
            </h3>
            <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getHealthColor(healthScore)}`}>{healthScore}%</div>
                <p className="text-gray-400 text-sm mt-1">Overall Health Score</p>
            </div>
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Product Utilization</span>
                    <span className="text-white font-semibold">{productUtilization.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-[#00FF89] to-[#00E67A] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${productUtilization}%` }}
                    />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Conversion Rate</span>
                    <span className="text-white font-semibold">{conversionRate.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(conversionRate * 10, 100)}%` }}
                    />
                </div>
            </div>
        </div>
    )
}
const MonthlyRevenueTrend = ({ monthlyRevenue }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#00FF89]" />
            Monthly Revenue Breakdown
        </h3>
        {monthlyRevenue && monthlyRevenue.length > 0 ? (
            <div className="space-y-4">
                {monthlyRevenue.map((month, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 text-sm font-medium">
                                {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            <div className="text-right">
                                <span className="text-[#00FF89] font-bold text-lg">${month.revenue?.toLocaleString()}</span>
                                <p className="text-gray-400 text-xs">{month.salesCount} sales</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 w-16">Revenue</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-[#00FF89] to-[#00E67A] h-3 rounded-full transition-all duration-500"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <span className="text-xs text-[#00FF89] w-12 text-right">
                                    ${month.salesCount > 0 ? (month.revenue / month.salesCount).toFixed(0) : '0'}/sale
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No revenue data available</p>
            </div>
        )}
    </div>
)
export default function OverviewTab({ analyticsData, timeRange, loading }) {
    if (loading && !analyticsData) {
        return <AnalyticsLoadingScreen variant="overview" />
    }
    if (!analyticsData?.overview) {
        return (
            <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Data Available</h3>
                <p className="text-gray-500">Start selling products to see your analytics</p>
            </div>
        )
    }
    const { overview, recentSales = [], monthlyRevenue = [] } = analyticsData
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${(overview.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    description="Lifetime earnings"
                    highlight={true}
                />
                <StatCard
                    title="Total Sales"
                    value={(overview.totalSales || 0).toLocaleString()}
                    icon={ShoppingCart}
                    description="Completed orders"
                />
                <StatCard
                    title="Avg Order Value"
                    value={`$${(overview.avgOrderValue || 0).toFixed(2)}`}
                    icon={TrendingUp}
                    description="Per transaction"
                />
                <StatCard
                    title="Active Products"
                    value={
                        overview.totalProducts > 0
                            ? `${overview.activeProducts || 0}/${overview.totalProducts}`
                            : overview.activeProducts > 0
                              ? `${overview.activeProducts}`
                              : 'No Products'
                    }
                    icon={Package}
                    description={overview.totalProducts > 0 ? 'Published/Total' : 'Create your first product'}
                />
            </div>
            <PerformanceSparklines
                overview={overview}
                recentSales={recentSales}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueTrendChart
                    recentSales={recentSales}
                    overview={overview}
                    timeRange={timeRange}
                />
                <SalesVelocityChart
                    recentSales={recentSales}
                    timeRange={timeRange}
                />
            </div>
            <div className="grid">
                <BusinessHealth
                    overview={overview}
                    recentSales={recentSales}
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[#00FF89]" />
                        Recent Sales ({recentSales.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {recentSales.length > 0 ? (
                            recentSales.map((sale, index) => (
                                <RecentSaleCard
                                    key={sale._id || index}
                                    sale={sale}
                                    index={index}
                                />
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">No recent sales</p>
                            </div>
                        )}
                    </div>
                </div>
                <MonthlyRevenueTrend monthlyRevenue={monthlyRevenue} />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 class="text-white font-medium mb-4 flex items-center gap-2">
                        <Calendar class="w-4 h-4 text-[#00FF89]" />
                        Seller Since
                    </h4>
                    <div class="text-2xl font-bold text-[#00FF89]">
                        {overview.sellerSince ? new Date(overview.sellerSince).toLocaleDateString() : 'N/A'}
                    </div>
                    <p class="text-gray-400 text-sm mt-2">
                        {overview.sellerSince
                            ? `${Math.floor((Date.now() - new Date(overview.sellerSince)) / (1000 * 60 * 60 * 24))} days ago`
                            : 'Recently joined'}
                    </p>
                </div>
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 class="text-white font-medium mb-4 flex items-center gap-2">
                        <Users class="w-4 h-4 text-[#00FF89]" />
                        Customer Base
                    </h4>
                    <div class="text-2xl font-bold text-[#00FF89]">{new Set(recentSales.map((sale) => sale.userId?._id)).size}</div>
                    <p class="text-gray-400 text-sm mt-2">Unique customers</p>
                </div>
                <div class="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h4 class="text-white font-medium mb-4 flex items-center gap-2">
                        <Eye class="w-4 h-4 text-[#00FF89]" />
                        Total Views
                    </h4>
                    <div class="text-2xl font-bold text-[#00FF89]">{(overview.totalViews || 0).toLocaleString()}</div>
                    <p class="text-gray-400 text-sm mt-2">
                        {overview.totalViews > 0
                            ? `${((overview.totalSales / overview.totalViews) * 100).toFixed(2)}% conversion`
                            : 'Start promoting!'}
                    </p>
                </div>
            </div>
        </div>
    )
}