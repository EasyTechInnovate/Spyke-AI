'use client'

import { useState, useEffect } from 'react'
import { promocodeAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Card from '@/components/shared/ui/card'
import { X, TrendingUp, Users, DollarSign, Calendar, BarChart2, Percent } from 'lucide-react'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function PromocodeStats({ promocode, onClose }) {
    // Inline notification state
    const [notification, setNotification] = useState(null)

    // Show inline notification messages  
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000)
    }

    // Clear notification
    const clearNotification = () => setNotification(null)

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        fetchStats()
    }, [promocode._id])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPromocodeStats(promocode._id)
            setStats(response.stats || response)
        } catch (error) {
            showMessage('Failed to fetch promocode statistics', 'error')
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount || 0)
    }

    const formatPercentage = (value) => {
        return `${(value || 0).toFixed(1)}%`
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
            <div className="w-full max-w-2xl bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">
                                Promocode Statistics
                            </h2>
                            <p className="text-gray-400">Performance metrics for {promocode.code}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <LoadingSpinner />
                            <p className="text-gray-500 mt-4">Loading statistics...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Overview</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Discount Type</p>
                                        <p className="font-medium text-white flex items-center gap-2">
                                            {promocode.discountType === 'percentage' ? (
                                                <>
                                                    <Percent className="w-4 h-4 text-[#00FF89]" />
                                                    {promocode.discountValue}% OFF
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                                    ${promocode.discountValue} OFF
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className={`font-medium ${promocode.isActive ? 'text-[#00FF89]' : 'text-gray-400'}`}>
                                            {promocode.isActive ? 'Active' : 'Inactive'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Valid From</p>
                                        <p className="font-medium text-white">
                                            {new Date(promocode.validFrom).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Valid Until</p>
                                        <p className="font-medium text-white">
                                            {new Date(promocode.validUntil).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Usage Stats */}
                            <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Users className="w-4 h-4 text-[#00FF89]" />
                                            <p className="text-sm text-gray-500">Total Uses</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {promocode.currentUsageCount || 0}
                                        </p>
                                        {promocode.usageLimit && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                of {promocode.usageLimit} limit
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <DollarSign className="w-4 h-4 text-[#00FF89]" />
                                            <p className="text-sm text-gray-500">Total Saved</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            ${promocode.usageHistory?.reduce((sum, usage) => sum + usage.discountAmount, 0).toFixed(2) || '0.00'}
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp className="w-4 h-4 text-[#00FF89]" />
                                            <p className="text-sm text-gray-500">Avg. Discount</p>
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            ${promocode.usageHistory && promocode.usageHistory.length > 0 
                                                ? (promocode.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0) / promocode.usageHistory.length).toFixed(2)
                                                : '0.00'
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Usage Progress Bar */}
                                {promocode.usageLimit && (
                                    <div className="mt-6">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-400">Usage Progress</span>
                                            <span className="text-white font-medium">
                                                {Math.round((promocode.currentUsageCount / promocode.usageLimit) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-[#00FF89] to-[#FFC050] h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((promocode.currentUsageCount / promocode.usageLimit) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Recent Usage */}
                            {promocode.usageHistory && promocode.usageHistory.length > 0 && (
                                <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-white mb-4">Recent Usage</h3>
                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {promocode.usageHistory.slice(0, 10).map((usage, index) => (
                                            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
                                                <div>
                                                    <p className="text-sm text-white">User {usage.userId?.slice(-6) || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(usage.usedAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="font-medium text-[#00FF89]">
                                                    -${usage.discountAmount.toFixed(2)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Performance Insights */}
                            {stats && stats.insights && (
                                <div className="bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6">
                                    <div className="flex items-start gap-3">
                                        <BarChart2 className="w-6 h-6 text-[#00FF89] mt-0.5" />
                                        <div>
                                            <h3 className="font-semibold text-[#00FF89] mb-2">Performance Insights</h3>
                                            <ul className="space-y-1 text-sm text-gray-300">
                                                {stats.insights.map((insight, index) => (
                                                    <li key={index}>• {insight}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}