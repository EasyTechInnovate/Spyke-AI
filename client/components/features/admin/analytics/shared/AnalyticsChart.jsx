import { BarChart3 } from 'lucide-react'
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    PieChart as RechartsPieChart,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ComposedChart
} from 'recharts'
import { CHART_TYPES } from '@/lib/constants/analytics'

export const AnalyticsChart = ({ data, type, title, height = 300, color = '#00FF89' }) => {
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-gray-300 text-sm mb-1 font-league-spartan">{label}</p>
                    {payload.map((entry, index) => (
                        <p
                            key={index}
                            className="text-sm font-medium font-league-spartan"
                            style={{ color: entry.color }}>
                            {entry.name}:{' '}
                            {typeof entry.value === 'number' && entry.dataKey === 'revenue'
                                ? `$${entry.value.toLocaleString()}`
                                : entry.value.toLocaleString()}
                        </p>
                    ))}
                </div>
            )
        }
        return null
    }

    // Check if data is empty or invalid
    const hasData = data && Array.isArray(data) && data.length > 0

    // Empty state component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
            <h4 className="text-lg font-medium text-gray-400 mb-2 font-league-spartan">No Data Available</h4>
            <p className="text-sm text-gray-500 text-center font-league-spartan">
                {type === CHART_TYPES.LINE ? 'No performance data to display for the selected time period.' :
                 type === CHART_TYPES.BAR ? 'No category data available to show.' :
                 type === CHART_TYPES.PIE ? 'No distribution data available.' :
                 'No data available for this chart.'}
            </p>
            <p className="text-xs text-gray-600 mt-2 font-league-spartan">
                Try selecting a different time range or check back later.
            </p>
        </div>
    )

    const renderChart = () => {
        // Return empty state if no data
        if (!hasData) {
            return <EmptyState />
        }

        switch (type) {
            case CHART_TYPES.AREA:
                return (
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient
                                id={`gradient-${color.replace('#', '')}`}
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={color}
                            fillOpacity={1}
                            fill={`url(#gradient-${color.replace('#', '')})`}
                            strokeWidth={2}
                        />
                    </AreaChart>
                )

            case CHART_TYPES.BAR:
                return (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
                    </BarChart>
                )

            case CHART_TYPES.LINE:
                return (
                    <RechartsLineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="users" stroke={color} strokeWidth={3} dot={{ fill: color, r: 4 }} />
                    </RechartsLineChart>
                )

            case CHART_TYPES.PIE:
                return (
                    <RechartsPieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || color} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                )

            case CHART_TYPES.COMPOSED:
                return (
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area yAxisId="left" type="monotone" dataKey="users" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                        <Bar yAxisId="right" dataKey="revenue" fill="#00FF89" radius={[2, 2, 0, 0]} />
                        <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#F59E0B" strokeWidth={2} />
                    </ComposedChart>
                )

            default:
                return <EmptyState />
        }
    }

    return (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-league-spartan">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                {title}
            </h3>
            <div
                style={{ height }}
                className="[&_.recharts-bar]:hover:[&_path]:!fill-current [&_.recharts-active-bar_path]:!fill-current">
                {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                        {renderChart()}
                    </ResponsiveContainer>
                ) : (
                    renderChart()
                )}
            </div>
        </div>
    )
}