'use client'

import { useState, useEffect } from 'react'
import { promocodeAPI, sellerAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'
import { Button } from '@/components/shared/ui/button'
import Input from '@/components/shared/ui/input'
import Card from '@/components/shared/ui/card'
import Badge from '@/components/shared/ui/badge'
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    BarChart,
    Copy,
    Filter,
    Tag,
    Calendar,
    DollarSign,
    Percent,
    Info,
    CheckCircle,
    AlertCircle,
    Sparkles,
    MoreVertical
} from 'lucide-react'
import PromocodeForm from '@/components/features/promocode/PromocodeForm'
import PromocodeStats from '@/components/features/promocode/PromocodeStats'
import PromocodeDetails from '@/components/features/promocode/PromocodeDetails'
import LoadingSpinner from '@/components/shared/ui/LoadingSpinner'

import InlineNotification from '@/components/shared/notifications/InlineNotification'
// Sidebar is now handled by the layout

export default function PromocodesPage() {
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

    const [sellerProfile, setSellerProfile] = useState(null)
    const [promocodes, setPromocodes] = useState([])
    const [loading, setLoading] = useState(true)
    // isMobile state removed - handled by responsive sidebar
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [showForm, setShowForm] = useState(false)
    const [showStats, setShowStats] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [selectedPromocode, setSelectedPromocode] = useState(null)
    const [copiedCode, setCopiedCode] = useState(null)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    })

    useEffect(() => {
        // Fetch seller profile
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

    useEffect(() => {
        fetchPromocodes()
    }, [pagination.page, filterStatus])

    // Mobile check removed - handled by responsive sidebar

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            // Cmd/Ctrl + K to focus search
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                document.getElementById('promocode-search')?.focus()
            }
            // Cmd/Ctrl + N to create new
            if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
                e.preventDefault()
                handleCreateEdit()
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [])

    const fetchPromocodes = async () => {
        try {
            setLoading(true)
            const response = await promocodeAPI.getPromocodes({
                page: pagination.page,
                limit: pagination.limit,
                status: filterStatus !== 'all' ? filterStatus : undefined,
                search: searchTerm || undefined
            })

            setPromocodes(response.promocodes || [])
            setPagination({
                ...pagination,
                total: response.total || 0,
                totalPages: response.totalPages || 0
            })
        } catch (error) {
            showMessage('Failed to fetch promocodes', 'error')
            console.error('Error fetching promocodes:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setPagination({ ...pagination, page: 1 })
        fetchPromocodes()
    }

    const handleCreateEdit = (promocode = null) => {
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

    const handleShowDetails = (promocode) => {
        setSelectedPromocode(promocode)
        setShowDetails(true)
    }

    const handleDetailsClose = () => {
        setShowDetails(false)
        setSelectedPromocode(null)
    }

    const handleDetailsEdit = () => {
        setShowDetails(false)
        setShowForm(true)
    }

    const handleDetailsDelete = () => {
        setShowDetails(false)
        handleDelete(selectedPromocode._id)
    }

    const handleDetailsShowStats = () => {
        setShowDetails(false)
        setShowStats(true)
    }

    // Calculate stats
    const activeCount = promocodes.filter(p => p.isActive).length
    const totalUses = promocodes.reduce((sum, p) => sum + (p.currentUsageCount || 0), 0)
    // Calculate total discount from usage history
    const totalDiscount = promocodes.reduce((sum, p) => {
        if (p.usageHistory && p.usageHistory.length > 0) {
            return sum + p.usageHistory.reduce((histSum, usage) => histSum + (usage.discountAmount || 0), 0)
        }
        return sum
    }, 0)

    return (
        <div className="w-full text-white">
            {/* Inline Notification */}
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}

            
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8 relative">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#00FF89]/5 rounded-full blur-3xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-3 bg-[#00FF89]/10 rounded-xl">
                                <Tag className="w-8 h-8 text-[#00FF89]" />
                            </div>
                            <h1 className="text-4xl font-bold text-white font-[var(--font-league-spartan)]">
                                Promocode Management
                            </h1>
                        </div>
                        <p className="text-gray-400 text-lg">Create and manage promotional codes to boost your sales</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Codes</p>
                                <p className="text-3xl font-bold text-white">{pagination.total}</p>
                            </div>
                            <Tag className="w-8 h-8 text-gray-600 group-hover:text-[#00FF89] transition-colors" />
                        </div>
                    </div>
                    
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Active Codes</p>
                                <p className="text-3xl font-bold text-[#00FF89]">{activeCount}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-[#00FF89]" />
                        </div>
                    </div>
                    
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Uses</p>
                                <p className="text-3xl font-bold text-white">{totalUses}</p>
                            </div>
                            <BarChart className="w-8 h-8 text-[#FFC050]" />
                        </div>
                    </div>
                    
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 hover:border-[#00FF89]/50 transition-all group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Saved</p>
                                <p className="text-3xl font-bold text-[#00FF89]">${totalDiscount.toFixed(2)}</p>
                            </div>
                            <DollarSign className="w-8 h-8 text-[#00FF89]" />
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                            <input
                                id="promocode-search"
                                type="text"
                                placeholder="Search by code or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-1 px-4 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#00FF89] focus:outline-none transition-all"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all flex items-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Search
                            </button>
                        </form>

                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:border-[#00FF89] focus:outline-none transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                                <option value="expired">Expired</option>
                            </select>

                            <button
                                onClick={() => handleCreateEdit()}
                                className="px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00DD78] transition-all flex items-center gap-2 group relative"
                                title="Create new promocode (⌘N)"
                            >
                                <Plus className="w-5 h-5" />
                                Create Promocode
                                <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Banner */}
                {promocodes.length === 0 && !loading && (
                    <div className="bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-xl p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <Info className="w-6 h-6 text-[#00FF89] mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-[#00FF89] mb-1">Pro Tip: Boost Your Sales with Promocodes</h3>
                                <p className="text-gray-300">
                                    Create time-limited offers, percentage discounts, or fixed amount promotions to incentivize purchases. 
                                    Track performance with detailed analytics.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Stats Summary */}
                {promocodes.length > 0 && !loading && (
                    <div className="bg-[#2a2a2a] border border-gray-700 rounded-xl p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-500">Active Codes</p>
                                    <p className="text-lg font-bold text-[#00FF89]">{activeCount} of {pagination.total}</p>
                                </div>
                                <div className="h-8 w-px bg-gray-700" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Uses Today</p>
                                    <p className="text-lg font-bold text-white">{totalUses}</p>
                                </div>
                                <div className="h-8 w-px bg-gray-700" />
                                <div>
                                    <p className="text-xs text-gray-500">Revenue Impact</p>
                                    <p className="text-lg font-bold text-[#FFC050]">${totalDiscount.toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Most Used Code</p>
                                <p className="text-sm font-medium text-white">
                                    {promocodes.reduce((prev, current) => 
                                        (prev.currentUsageCount > current.currentUsageCount) ? prev : current
                                    ).code}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Promocodes List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <LoadingSpinner />
                        <p className="text-gray-500 mt-4">Loading your promocodes...</p>
                    </div>
                ) : promocodes.length === 0 ? (
                    <div className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-16 text-center">
                        <Tag className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-white mb-2">No promocodes yet</h3>
                        <p className="text-gray-400 mb-6 max-w-md mx-auto">
                            Start creating promotional codes to offer discounts and attract more customers to your products.
                        </p>
                        <button
                            onClick={() => handleCreateEdit()}
                            className="px-6 py-3 bg-[#00FF89] text-[#121212] rounded-lg font-semibold hover:bg-[#00DD78] transition-all inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Promocode
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {promocodes.map((promocode) => {
                            const usagePercentage = promocode.usageLimit 
                                ? Math.round((promocode.currentUsageCount / promocode.usageLimit) * 100)
                                : 0
                            const isExpiringSoon = promocode.validUntil && 
                                new Date(promocode.validUntil) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            
                            return (
                                <div 
                                    key={promocode._id} 
                                    className="bg-[#1f1f1f] border border-gray-800 rounded-xl p-4 hover:border-[#00FF89]/50 transition-all group relative overflow-hidden cursor-pointer"
                                    onClick={(e) => {
                                        // Don't open details if clicking on action buttons
                                        if (e.target.closest('button')) return
                                        handleShowDetails(promocode)
                                    }}
                                    title="Click to view details"
                                >
                                    {/* Hover Gradient Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF89]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                                    <div className="flex items-center gap-4">
                                        {/* Code and Status */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-bold text-white font-mono">{promocode.code}</h3>
                                                <Badge 
                                                    variant={promocode.isActive ? 'success' : 'secondary'}
                                                    className="px-2 py-0.5 text-xs"
                                                >
                                                    {promocode.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                                {isExpiringSoon && promocode.isActive && (
                                                    <Badge 
                                                        variant="warning"
                                                        className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                    >
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        Expiring Soon
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {promocode.description && (
                                                <p className="text-sm text-gray-400 truncate">{promocode.description}</p>
                                            )}
                                        </div>

                                        {/* Discount Value */}
                                        <div className="text-right">
                                            <div className="font-bold text-[#00FF89]">
                                                {promocode.discountType === 'percentage' ? (
                                                    <span className="text-xl">{promocode.discountValue}%</span>
                                                ) : (
                                                    <span className="text-xl">${promocode.discountValue}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">OFF</p>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="hidden md:flex items-center gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-gray-500 text-xs">Uses</p>
                                                <p className="font-semibold text-white">
                                                    {promocode.currentUsageCount || 0}/{promocode.usageLimit || '∞'}
                                                </p>
                                            </div>
                                            
                                            {promocode.minimumOrderAmount && (
                                                <div className="text-center">
                                                    <p className="text-gray-500 text-xs">Min</p>
                                                    <p className="font-semibold text-white">${promocode.minimumOrderAmount}</p>
                                                </div>
                                            )}
                                            
                                            <div className="text-center">
                                                <p className="text-gray-500 text-xs">Expires</p>
                                                <p className="font-semibold text-white">
                                                    {promocode.validUntil 
                                                        ? new Date(promocode.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                        : 'Never'
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        {/* Usage Progress */}
                                        {promocode.usageLimit && (
                                            <div className="hidden lg:block w-24">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-gray-500">Usage</span>
                                                    <span className="text-white font-medium">{usagePercentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-500 ${
                                                            usagePercentage >= 80 
                                                                ? 'bg-red-500' 
                                                                : usagePercentage >= 50 
                                                                ? 'bg-yellow-500' 
                                                                : 'bg-[#00FF89]'
                                                        }`}
                                                        style={{ width: `${usagePercentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyToClipboard(promocode.code)}
                                                className={`p-2 rounded-lg transition-all relative ${
                                                    copiedCode === promocode.code
                                                        ? 'bg-[#00FF89] text-[#121212]'
                                                        : 'bg-[#2a2a2a] border border-gray-700 text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89]'
                                                }`}
                                                title="Copy code"
                                            >
                                                {copiedCode === promocode.code ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleShowStats(promocode)}
                                                className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all"
                                                title="View statistics"
                                            >
                                                <BarChart className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleToggleStatus(promocode._id, promocode.isActive)}
                                                className={`p-2 rounded-lg transition-all ${
                                                    promocode.isActive
                                                        ? 'bg-[#00FF89]/10 border border-[#00FF89] text-[#00FF89] hover:bg-[#00FF89]/20'
                                                        : 'bg-[#2a2a2a] border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
                                                }`}
                                                title={promocode.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {promocode.isActive ? (
                                                    <ToggleRight className="w-4 h-4" />
                                                ) : (
                                                    <ToggleLeft className="w-4 h-4" />
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleShowDetails(promocode)}
                                                className="p-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all"
                                                title="View details"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Stats */}
                                    <div className="flex md:hidden items-center gap-4 mt-3 pt-3 border-t border-gray-800 text-xs">
                                        <div className="flex-1">
                                            <span className="text-gray-500">Uses: </span>
                                            <span className="text-white font-medium">
                                                {promocode.currentUsageCount || 0}/{promocode.usageLimit || '∞'}
                                            </span>
                                        </div>
                                        {promocode.minimumOrderAmount && (
                                            <div className="flex-1">
                                                <span className="text-gray-500">Min: </span>
                                                <span className="text-white font-medium">${promocode.minimumOrderAmount}</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <span className="text-gray-500">Expires: </span>
                                            <span className="text-white font-medium">
                                                {promocode.validUntil 
                                                    ? new Date(promocode.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                                    : 'Never'
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {promocode.applicableProducts && promocode.applicableProducts.length > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#00FF89]/10 text-[#00FF89] text-xs rounded-full">
                                                <Tag className="w-3 h-3" />
                                                {promocode.applicableProducts.length} Products
                                            </span>
                                        )}
                                        {promocode.applicableCategories && promocode.applicableCategories.length > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFC050]/10 text-[#FFC050] text-xs rounded-full">
                                                <Filter className="w-3 h-3" />
                                                {promocode.applicableCategories.length} Categories
                                            </span>
                                        )}
                                        {(!promocode.applicableProducts || promocode.applicableProducts.length === 0) && 
                                         (!promocode.applicableCategories || promocode.applicableCategories.length === 0) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-400 text-xs rounded-full">
                                                All Products
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-4">
                        <button
                            disabled={pagination.page === 1}
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        <div className="flex items-center gap-2">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum;
                                if (pagination.totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (pagination.page <= 3) {
                                    pageNum = i + 1;
                                } else if (pagination.page >= pagination.totalPages - 2) {
                                    pageNum = pagination.totalPages - 4 + i;
                                } else {
                                    pageNum = pagination.page - 2 + i;
                                }
                                
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPagination({ ...pagination, page: pageNum })}
                                        className={`w-10 h-10 rounded-lg font-medium transition-all ${
                                            pagination.page === pageNum
                                                ? 'bg-[#00FF89] text-[#121212]'
                                                : 'bg-[#2a2a2a] border border-gray-700 text-white hover:border-[#00FF89]'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button
                            disabled={pagination.page === pagination.totalPages}
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            className="px-6 py-3 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white hover:bg-[#00FF89]/10 hover:border-[#00FF89] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
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

            {showDetails && selectedPromocode && (
                <PromocodeDetails
                    promocode={selectedPromocode}
                    onClose={handleDetailsClose}
                    onEdit={handleDetailsEdit}
                    onDelete={handleDetailsDelete}
                    onShowStats={handleDetailsShowStats}
                />
            )}
        </div>
    )
}