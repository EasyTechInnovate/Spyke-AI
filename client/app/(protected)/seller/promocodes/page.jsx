'use client'
import { useState, useEffect } from 'react'
import { promocodeAPI, sellerAPI } from '@/lib/api'
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    ToggleLeft,
    ToggleRight,
    BarChart3,
    Copy,
    Filter,
    Tag,
    DollarSign,
    Percent,
    CheckCircle,
    Target,
    Clock
} from 'lucide-react'
import PromocodeForm from '@/components/features/promocode/PromocodeForm'
import PromocodeStats from '@/components/features/promocode/PromocodeStats'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'
import Notification from '@/components/shared/Notification'
export default function PromocodesPage() {
    const [notifications, setNotifications] = useState([])
    const [sellerProfile, setSellerProfile] = useState(null)
    const [allPromocodes, setAllPromocodes] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [selectedPromocode, setSelectedPromocode] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12
    })
    const addNotification = (notification) => {
        const id = Date.now() + Math.random()
        const newNotification = { id, ...notification }
        setNotifications((prev) => [...prev, newNotification])
        if (notification.duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, notification.duration)
        }
        return id
    }
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    }
    const showMessage = (message, type = 'info') => {
        addNotification({
            message,
            type,
            duration: 4000
        })
    }
    useEffect(() => {
        const fetchSellerProfile = async () => {
            try {
                const response = await sellerAPI.getProfile()
                if (response) {
                    setSellerProfile(response)
                }
            } catch (error) {
                console.error('Error fetching seller profile:', error)
            }
        }
        fetchSellerProfile()
    }, [])
    const filteredPromocodes = allPromocodes.filter((promocode) => {
        if (filterStatus === 'active' && !promocode.isActive) return false
        if (filterStatus === 'inactive' && promocode.isActive) return false
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase()
            return (
                promocode.code.toLowerCase().includes(searchLower) ||
                (promocode.description && promocode.description.toLowerCase().includes(searchLower))
            )
        }
        return true
    })
    const totalFilteredPromocodes = filteredPromocodes.length
    const totalPages = Math.ceil(totalFilteredPromocodes / pagination.limit)
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    const paginatedPromocodes = filteredPromocodes.slice(startIndex, endIndex)
    useEffect(() => {
        fetchPromocodes()
    }, []) 
    useEffect(() => {
        setPagination((prev) => ({ ...prev, page: 1 }))
    }, [searchTerm, filterStatus])
    const fetchPromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPromocodes({
                limit: 1000 
            })
            setAllPromocodes(response.promocodes || [])
        } catch (error) {
            showMessage('Failed to fetch promocodes', 'error')
            console.error('Error fetching promocodes:', error)
        } finally {
            setLoading(false)
        }
    }
    const handleSearch = (e) => {
        e.preventDefault()
    }
    const handleCreateEdit = (promocode = null) => {
        if (promocode && !promocode.isActive) {
            showMessage('Please activate the promocode first to edit it', 'warning')
            return
        }
        setSelectedPromocode(promocode)
        setShowForm(true)
    }
    const handleDelete = async (promocodeId) => {
        if (!confirm('Are you sure you want to delete this promocode? This action cannot be undone.')) return
        try {
            await promocodeAPI.deletePromocode(promocodeId)
            showMessage('Promocode deleted successfully', 'success')
            fetchPromocodes()
        } catch (error) {
            showMessage('Failed to delete promocode', 'error')
            console.error('Error deleting promocode:', error)
        }
    }
    const handleToggleStatus = async (promocodeId, currentStatus) => {
        try {
            await promocodeAPI.togglePromocodeStatus(promocodeId)
            showMessage(`Promocode ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success')
            fetchPromocodes()
        } catch (error) {
            showMessage('Failed to update promocode status', 'error')
            console.error('Error toggling status:', error)
        }
    }
    const handleShowStats = (promocode) => {
        setSelectedPromocode(promocode)
        setShowStats(true)
    }
    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code)
        setCopiedCode(code)
        showMessage(`Code "${code}" copied to clipboard!`, 'success')
        setTimeout(() => setCopiedCode(null), 2000)
    }
    const handleFormClose = (refreshData = false) => {
        setShowForm(false)
        setSelectedPromocode(null)
        if (refreshData) {
            fetchPromocodes() 
        }
    }
    const handleStatsClose = () => {
        setShowStats(false)
        setSelectedPromocode(null)
    }
    const activeCount = filteredPromocodes.filter((p) => p.isActive).length
    const totalUses = filteredPromocodes.reduce((sum, p) => sum + (p.currentUsageCount || 0), 0)
    const totalDiscount = filteredPromocodes.reduce((sum, p) => {
        if (p.usageHistory && p.usageHistory.length > 0) {
            return sum + p.usageHistory.reduce((histSum, usage) => histSum + (usage.discountAmount || 0), 0)
        }
        return sum
    }, 0)
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_#00FF89_0%,_transparent_50%)] opacity-[0.03]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_#FFC050_0%,_transparent_50%)] opacity-[0.03]" />
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        {...notification}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
            <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-[#00FF89]/20 to-[#00DD78]/20 rounded-2xl border border-[#00FF89]/30">
                            <Tag className="w-7 h-7 text-[#00FF89]" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white">Promocodes</h1>
                            <p className="text-gray-400 text-lg">Create and manage discount codes</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-5 hover:border-[#00FF89]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Codes</p>
                                    <p className="text-2xl font-bold text-white">{allPromocodes.length}</p>
                                </div>
                                <div className="p-2 bg-[#00FF89]/10 rounded-xl">
                                    <Tag className="w-5 h-5 text-[#00FF89]" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-5 hover:border-[#00FF89]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Active</p>
                                    <p className="text-2xl font-bold text-[#00FF89]">{allPromocodes.filter((p) => p.isActive).length}</p>
                                </div>
                                <div className="p-2 bg-[#00FF89]/10 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-[#00FF89]" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-5 hover:border-[#FFC050]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Uses</p>
                                    <p className="text-2xl font-bold text-white">
                                        {allPromocodes.reduce((sum, p) => sum + (p.currentUsageCount || 0), 0)}
                                    </p>
                                </div>
                                <div className="p-2 bg-[#FFC050]/10 rounded-xl">
                                    <BarChart3 className="w-5 h-5 text-[#FFC050]" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-5 hover:border-[#00FF89]/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                                    <p className="text-2xl font-bold text-[#00FF89]">
                                        $
                                        {allPromocodes
                                            .reduce((sum, p) => {
                                                if (p.usageHistory && p.usageHistory.length > 0) {
                                                    return sum + p.usageHistory.reduce((histSum, usage) => histSum + (usage.discountAmount || 0), 0)
                                                }
                                                return sum
                                            }, 0)
                                            .toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-2 bg-[#00FF89]/10 rounded-xl">
                                    <DollarSign className="w-5 h-5 text-[#00FF89]" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form
                            onSubmit={handleSearch}
                            className="flex-1 flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by code or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-[#00FF89] focus:outline-none transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 rounded-xl text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all flex items-center gap-2">
                                <Search className="w-5 h-5" />
                                <span className="hidden sm:inline">Search</span>
                            </button>
                        </form>
                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:border-[#00FF89] focus:outline-none transition-all min-w-[140px]">
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                            <button
                                onClick={() => handleCreateEdit()}
                                className="px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00DD78] text-[#0a0a0a] rounded-xl font-semibold hover:from-[#00DD78] hover:to-[#00CC6A] transition-all flex items-center gap-2 shadow-lg shadow-[#00FF89]/25">
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Create Code</span>
                            </button>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <LoadingSpinner />
                        <p className="text-gray-500 mt-4">Loading promocodes...</p>
                    </div>
                ) : allPromocodes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-3xl max-w-md mx-auto">
                            <div className="p-4 bg-[#00FF89]/10 rounded-2xl w-fit mx-auto mb-4">
                                <Tag className="w-12 h-12 text-[#00FF89]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No promocodes yet</h3>
                            <p className="text-gray-400 mb-6">Start creating promotional codes to offer discounts and attract more customers.</p>
                            <button
                                onClick={() => handleCreateEdit()}
                                className="px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00DD78] text-[#0a0a0a] rounded-xl font-semibold hover:from-[#00DD78] hover:to-[#00CC6A] transition-all inline-flex items-center gap-2">
                                <Plus className="w-5 h-5" />
                                Create Your First Code
                            </button>
                        </div>
                    </div>
                ) : filteredPromocodes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="p-6 bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-3xl max-w-md mx-auto">
                            <div className="p-4 bg-[#FFC050]/10 rounded-2xl w-fit mx-auto mb-4">
                                <Search className="w-12 h-12 text-[#FFC050]" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">No matches found</h3>
                            <p className="text-gray-400 mb-6">
                                {searchTerm ? `No promocodes match "${searchTerm}"` : 'No promocodes match the selected filter'}
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilterStatus('all')
                                }}
                                className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 text-white rounded-xl hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all">
                                Clear Filters
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {paginatedPromocodes.map((promocode) => {
                                const usagePercentage = promocode.usageLimit
                                    ? Math.round((promocode.currentUsageCount / promocode.usageLimit) * 100)
                                    : 0
                                const isExpiringSoon =
                                    promocode.validUntil && new Date(promocode.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                return (
                                    <div
                                        key={promocode._id}
                                        className="group bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800/50 rounded-2xl p-6 hover:border-[#00FF89]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#00FF89]/10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <h3 className="text-xl font-bold text-white font-mono truncate">{promocode.code}</h3>
                                                    <span
                                                        className={`text-sm font-medium px-2 py-1 rounded-lg ${promocode.isActive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                                        {promocode.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                {promocode.description && (
                                                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">{promocode.description}</p>
                                                )}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div
                                                        className={`p-2 rounded-xl ${
                                                            promocode.discountType === 'percentage' ? 'bg-[#00FF89]/10' : 'bg-[#FFC050]/10'
                                                        }`}>
                                                        {promocode.discountType === 'percentage' ? (
                                                            <Percent
                                                                className={`w-4 h-4 ${
                                                                    promocode.discountType === 'percentage' ? 'text-[#00FF89]' : 'text-[#FFC050]'
                                                                }`}
                                                            />
                                                        ) : (
                                                            <DollarSign className="w-4 h-4 text-[#FFC050]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-2xl font-bold text-white">
                                                            {promocode.discountType === 'percentage'
                                                                ? `${promocode.discountValue}%`
                                                                : `$${promocode.discountValue}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500">OFF</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => copyToClipboard(promocode.code)}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        copiedCode === promocode.code
                                                            ? 'bg-[#00FF89] text-[#0a0a0a]'
                                                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#00FF89]/10 hover:text-[#00FF89]'
                                                    }`}
                                                    title="Copy code">
                                                    {copiedCode === promocode.code ? (
                                                        <CheckCircle className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleShowStats(promocode)}
                                                    className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#FFC050]/10 hover:text-[#FFC050] transition-all"
                                                    title="View statistics">
                                                    <BarChart3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleCreateEdit(promocode)}
                                                    className="p-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#00FF89]/10 hover:text-[#00FF89] transition-all"
                                                    title="Edit">
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Uses</p>
                                                <p className="font-bold text-white">
                                                    {promocode.currentUsageCount || 0}
                                                    {promocode.usageLimit && `/${promocode.usageLimit}`}
                                                </p>
                                            </div>
                                            {promocode.minimumOrderAmount ? (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Min Order</p>
                                                    <p className="font-bold text-white">${promocode.minimumOrderAmount}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray-500">Expires</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <p className="font-bold text-white">
                                                            {promocode.validUntil
                                                                ? (() => {
                                                                      const now = new Date()
                                                                      const expiryDate = new Date(promocode.validUntil)
                                                                      const diffTime = expiryDate - now
                                                                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                                                      if (diffDays < 0) {
                                                                          return 'Expired'
                                                                      } else if (diffDays === 0) {
                                                                          return 'Today'
                                                                      } else if (diffDays === 1) {
                                                                          return '1 day'
                                                                      } else {
                                                                          return `${diffDays} days`
                                                                      }
                                                                  })()
                                                                : 'Never'}
                                                        </p>
                                                        {promocode.validUntil && (
                                                            <div className="relative group">
                                                                <div className="w-3 h-3 rounded-full bg-gray-600 flex items-center justify-center cursor-help">
                                                                    <span className="text-[8px] text-white font-bold">i</span>
                                                                </div>
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                                                    {new Date(promocode.validUntil).toLocaleDateString('en-US', {
                                                                        weekday: 'short',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric'
                                                                    })}
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {promocode.usageLimit && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="text-gray-500">Usage Progress</span>
                                                    <span className="text-white font-medium">{usagePercentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700/50 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-500 ${
                                                            usagePercentage >= 80
                                                                ? 'bg-gradient-to-r from-red-500 to-red-400'
                                                                : usagePercentage >= 50
                                                                  ? 'bg-gradient-to-r from-[#FFC050] to-[#FFB020]'
                                                                  : 'bg-gradient-to-r from-[#00FF89] to-[#00DD78]'
                                                        }`}
                                                        style={{ width: `${usagePercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {promocode.applicableProducts && promocode.applicableProducts.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#00FF89]/10 text-[#00FF89] text-xs rounded-lg border border-[#00FF89]/20">
                                                    <Target className="w-3 h-3" />
                                                    {promocode.applicableProducts.length} Products
                                                </span>
                                            )}
                                            {promocode.applicableCategories && promocode.applicableCategories.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FFC050]/10 text-[#FFC050] text-xs rounded-lg border border-[#FFC050]/20">
                                                    <Filter className="w-3 h-3" />
                                                    {promocode.applicableCategories.length} Categories
                                                </span>
                                            )}
                                            {(!promocode.applicableProducts || promocode.applicableProducts.length === 0) &&
                                                (!promocode.applicableCategories || promocode.applicableCategories.length === 0) && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-lg border border-gray-600">
                                                        All Products
                                                    </span>
                                                )}
                                            {isExpiringSoon && promocode.isActive && (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-lg border border-yellow-500/20">
                                                    <Clock className="w-3 h-3" />
                                                    Expiring Soon
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                                            <button
                                                onClick={() => handleToggleStatus(promocode._id, promocode.isActive)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                                    promocode.isActive
                                                        ? 'bg-[#00FF89]/10 text-[#00FF89] hover:bg-[#00FF89]/20'
                                                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                                                }`}>
                                                {promocode.isActive ? (
                                                    <>
                                                        <ToggleRight className="w-4 h-4" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <ToggleLeft className="w-4 h-4" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promocode._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                                                title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center gap-4">
                                <button
                                    disabled={pagination.page === 1}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                    className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                        let pageNum
                                        if (totalPages <= 5) {
                                            pageNum = i + 1
                                        } else if (pagination.page <= 3) {
                                            pageNum = i + 1
                                        } else if (pagination.page >= totalPages - 2) {
                                            pageNum = totalPages - 4 + i
                                        } else {
                                            pageNum = pagination.page - 2 + i
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setPagination({ ...pagination, page: pageNum })}
                                                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                                    pagination.page === pageNum
                                                        ? 'bg-[#00FF89] text-[#0a0a0a]'
                                                        : 'bg-[#2a2a2a] border border-gray-700 text-white hover:border-[#00FF89]'
                                                }`}>
                                                {pageNum}
                                            </button>
                                        )
                                    })}
                                </div>
                                <button
                                    disabled={pagination.page === totalPages}
                                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                    className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
            {showForm && (
                <PromocodeForm
                    promocode={selectedPromocode}
                    onClose={handleFormClose}
                />
            )}
            {showStats && selectedPromocode && (
                <PromocodeStats
                    promocode={selectedPromocode}
                    onClose={handleStatsClose}
                />
            )}
        </div>
    )
}