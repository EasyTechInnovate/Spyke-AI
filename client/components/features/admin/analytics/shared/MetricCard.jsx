import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { COLOR_SCHEMES, METRIC_DEFINITIONS } from '@/lib/constants/analytics'
import { Tooltip } from '@/components/shared/Tooltip'

// Enhanced metric card with trend analysis and tooltips
export const EnhancedMetricCard = ({ title, value, icon: Icon, color, trend, subtitle, loading, onClick, metricKey }) => {
    const colorScheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.blue
    const metricDefinition = metricKey ? METRIC_DEFINITIONS[metricKey] : null

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`${colorScheme.bg} backdrop-blur-sm border ${colorScheme.border} rounded-xl p-6 hover:bg-opacity-20 transition-all duration-300 cursor-pointer group relative`}
            onClick={onClick}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorScheme.bg} border ${colorScheme.border}`}>
                    <Icon className={`w-6 h-6 ${colorScheme.icon}`} />
                </div>
                <div className="flex items-center gap-2">
                    {trend && (
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            trend.isPositive ? 'bg-[#00FF89]/10 text-[#00FF89]' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                            {trend.isPositive ? '+' : ''}{trend.value}%
                        </div>
                    )}
                    {metricDefinition && (
                        <Tooltip content={metricDefinition} placement="auto">
                            <Info className="w-4 h-4 text-gray-400 hover:text-[#00FF89] transition-colors cursor-help" />
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <h3 className="text-gray-400 font-medium text-sm group-hover:text-gray-300 transition-colors font-league-spartan">{title}</h3>
                <p className="text-2xl font-bold text-white group-hover:text-gray-100 transition-colors font-league-spartan">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors font-league-spartan">{subtitle}</p>}
            </div>
        </motion.div>
    )
}