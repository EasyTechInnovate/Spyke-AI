'use client'
import { useState } from 'react'
import { promocodeAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import { 
    X, 
    Edit, 
    Trash2, 
    Copy, 
    BarChart2,
    Calendar,
    DollarSign,
    Percent,
    Tag,
    Filter,
    Users,
    CheckCircle,
    Clock,
    Info
} from 'lucide-react'
export default function PromocodeDetails({ promocode, onClose, onEdit, onDelete, onShowStats }) {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const [copiedCode, setCopiedCode] = useState(false)
    const copyToClipboard = () => {
        navigator.clipboard.writeText(promocode.code)
        setCopiedCode(true)
        showMessage(`Code "${promocode.code}" copied to clipboard!`, 'success')
        setTimeout(() => setCopiedCode(false), 2000)
    }
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
    const calculateDaysRemaining = () => {
        if (!promocode.validUntil) return null
        const days = Math.ceil((new Date(promocode.validUntil) - new Date()) / (1000 * 60 * 60 * 24))
        return days > 0 ? days : 0
    }
    const daysRemaining = calculateDaysRemaining()
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
            <div className="w-full max-w-2xl bg-[#1f1f1f] border border-gray-800 rounded-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold text-white font-mono">{promocode.code}</h2>
                                <Badge 
                                    variant={promocode.isActive ? 'success' : 'secondary'}
                                    className="px-3 py-1"
                                >
                                    {promocode.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {daysRemaining !== null && daysRemaining <= 7 && promocode.isActive && (
                                    <Badge 
                                        variant="warning"
                                        className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                    >
                                        {daysRemaining === 0 ? 'Expires Today' : `${daysRemaining} days left`}
                                    </Badge>
                                )}
                            </div>
                            {promocode.description && (
                                <p className="text-gray-400">{promocode.description}</p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <div className="bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {promocode.discountType === 'percentage' ? (
                                    <Percent className="w-8 h-8 text-[#00FF89]" />
                                ) : (
                                    <DollarSign className="w-8 h-8 text-[#00FF89]" />
                                )}
                                <div>
                                    <p className="text-3xl font-bold text-[#00FF89]">
                                        {promocode.discountType === 'percentage' 
                                            ? `${promocode.discountValue}% OFF`
                                            : `$${promocode.discountValue} OFF`
                                        }
                                    </p>
                                    {promocode.minimumOrderAmount && (
                                        <p className="text-sm text-gray-300 mt-1">
                                            Minimum order: ${promocode.minimumOrderAmount}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                                    copiedCode
                                        ? 'bg-[#00FF89] text-[#121212]'
                                        : 'bg-[#2a2a2a] border border-gray-700 text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89]'
                                }`}
                            >
                                {copiedCode ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-5 h-5" />
                                        Copy Code
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-white">Usage Statistics</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Times Used</span>
                                    <span className="text-white font-medium">
                                        {promocode.currentUsageCount || 0}
                                    </span>
                                </div>
                                {promocode.usageLimit && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 text-sm">Usage Limit</span>
                                        <span className="text-white font-medium">
                                            {promocode.usageLimit}
                                        </span>
                                    </div>
                                )}
                                {promocode.usageLimit && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-gray-500">Progress</span>
                                            <span className="text-gray-400">
                                                {Math.round((promocode.currentUsageCount / promocode.usageLimit) * 100)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-[#00FF89] to-[#FFC050] h-2 rounded-full transition-all"
                                                style={{ 
                                                    width: `${Math.min((promocode.currentUsageCount / promocode.usageLimit) * 100, 100)}%` 
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-5 h-5 text-[#00FF89]" />
                                <h3 className="font-semibold text-white">Validity Period</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Start Date</span>
                                    <span className="text-white text-sm">
                                        {new Date(promocode.validFrom).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">End Date</span>
                                    <span className="text-white text-sm">
                                        {new Date(promocode.validUntil).toLocaleDateString()}
                                    </span>
                                </div>
                                {daysRemaining !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 text-sm">Time Remaining</span>
                                        <span className={`text-sm font-medium ${
                                            daysRemaining <= 7 ? 'text-yellow-500' : 'text-white'
                                        }`}>
                                            {daysRemaining === 0 
                                                ? 'Expires today' 
                                                : `${daysRemaining} days`
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-5 h-5 text-[#00FF89]" />
                            <h3 className="font-semibold text-white">Applicable To</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {promocode.applicableProducts && promocode.applicableProducts.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#00FF89]/10 text-[#00FF89] text-sm rounded-full">
                                    <Tag className="w-3 h-3" />
                                    {promocode.applicableProducts.length} Products
                                </span>
                            )}
                            {promocode.applicableCategories && promocode.applicableCategories.length > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FFC050]/10 text-[#FFC050] text-sm rounded-full">
                                    <Filter className="w-3 h-3" />
                                    {promocode.applicableCategories.length} Categories
                                </span>
                            )}
                            {(!promocode.applicableProducts || promocode.applicableProducts.length === 0) && 
                             (!promocode.applicableCategories || promocode.applicableCategories.length === 0) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-400 text-sm rounded-full">
                                    All Products
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="bg-[#2a2a2a]/50 border border-gray-800 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <Info className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-300">Additional Information</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Created on</span>
                                <p className="text-white">{new Date(promocode.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Last updated</span>
                                <p className="text-white">{new Date(promocode.updatedAt).toLocaleDateString()}</p>
                            </div>
                            {promocode.usageLimitPerUser && (
                                <div>
                                    <span className="text-gray-500">Usage per user</span>
                                    <p className="text-white">{promocode.usageLimitPerUser}</p>
                                </div>
                            )}
                            {promocode.createdByType && (
                                <div>
                                    <span className="text-gray-500">Created by</span>
                                    <p className="text-white capitalize">{promocode.createdByType}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onShowStats}
                            className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all flex items-center justify-center gap-2"
                        >
                            <BarChart2 className="w-5 h-5" />
                            View Statistics
                        </button>
                        <button
                            onClick={onEdit}
                            className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all flex items-center justify-center gap-2"
                        >
                            <Edit className="w-5 h-5" />
                            Edit Details
                        </button>
                        <button
                            onClick={onDelete}
                            className="px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}