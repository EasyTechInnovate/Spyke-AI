'use client'
import { motion } from 'framer-motion'
import { BarChart3, Package, ShoppingCart, DollarSign, Users, TrendingUp } from 'lucide-react'
const LoadingCard = ({ icon: Icon = BarChart3, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-700 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="h-4 bg-gray-700 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-16"></div>
        </div>
        <div className="space-y-2">
            <div className="h-8 bg-gray-700 rounded w-20"></div>
            <div className="h-3 bg-gray-700 rounded w-32"></div>
            </div>
    </motion.div>
)
const LoadingChart = ({ title, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-700 rounded w-40"></div>
        </div>
        <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-700 rounded w-20"></div>
                        <div className="h-3 bg-gray-700 rounded w-24"></div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gray-600 h-2 rounded-full" 
                            style={{ width: `${Math.random() * 80 + 20}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
)
const LoadingList = ({ delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
        <div className="flex items-center gap-2 mb-6">
            <div className="w-5 h-5 bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-700 rounded w-32"></div>
        </div>
        <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                            <div className="space-y-1">
                                <div className="h-4 bg-gray-600 rounded w-32"></div>
                                <div className="h-3 bg-gray-600 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="text-right space-y-1">
                            <div className="h-4 bg-gray-600 rounded w-16"></div>
                            <div className="h-3 bg-gray-600 rounded w-12"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-600 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
)
export const AnalyticsLoadingScreen = ({ variant = 'overview' }) => {
    if (variant === 'overview') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <LoadingCard icon={DollarSign} delay={0} />
                    <LoadingCard icon={ShoppingCart} delay={0.1} />
                    <LoadingCard icon={Package} delay={0.2} />
                    <LoadingCard icon={TrendingUp} delay={0.3} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <LoadingList delay={0.4} />
                    <LoadingChart title="Revenue Trends" delay={0.5} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <LoadingCard delay={0.6} />
                    <LoadingCard delay={0.7} />
                    <LoadingCard delay={0.8} />
                </div>
            </div>
        )
    }
    if (variant === 'products') {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <LoadingCard key={i} delay={i * 0.1} />
                    ))}
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 animate-pulse">
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="h-6 bg-gray-700 rounded w-40"></div>
                            <div className="flex gap-3">
                                <div className="h-10 bg-gray-700 rounded w-64"></div>
                                <div className="h-10 bg-gray-700 rounded w-32"></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-700 rounded-xl p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="w-16 h-16 bg-gray-600 rounded-lg"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-5 bg-gray-600 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 mb-4">
                                        {[...Array(4)].map((_, j) => (
                                            <div key={j} className="text-center">
                                                <div className="h-6 bg-gray-600 rounded mb-1"></div>
                                                <div className="h-3 bg-gray-600 rounded"></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="h-2 bg-gray-600 rounded-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <LoadingCard key={i} delay={i * 0.1} />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <LoadingChart delay={0.3} />
                <LoadingChart delay={0.4} />
            </div>
        </div>
    )
}