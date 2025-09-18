'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    UserCheck,
    Search,
    Filter,
    UserX,
    Key,
    Package,
    Eye,
    EyeOff,
    ChevronDown,
    Download,
    MoreHorizontal,
    Mail,
    Calendar,
    DollarSign,
    Globe,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    X,
    Star,
    MapPin,
    Users
} from 'lucide-react'
import apiClient from '@/lib/api/client'
import { adminAPI } from '@/lib/api/admin'
import Notification from '@/components/shared/Notification'

const BRAND = '#00FF89'

const SELLER_STATUS = {
    approved: {
        label: 'Active',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        icon: CheckCircle
    },
    pending: {
        label: 'Pending',
        color: 'text-yellow-400',
        bg: 'bg-yellow-400/10',
        icon: Clock
    },
    under_review: {
        label: 'Under Review',
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        icon: Eye
    },
    rejected: {
        label: 'Rejected',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        icon: AlertTriangle
    },
    suspended: {
        label: 'Suspended',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        icon: UserX
    }
}

const FILTER_OPTIONS = [
    { id: 'all', label: 'All Sellers' },
    { id: 'approved', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'under_review', label: 'Under Review' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'high-earning', label: 'High Earners' }
]

// Simple Confirmation Modal Component
function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    confirmColor = 'bg-red-600',
    isLoading = false,
    showReasonInput = false
}) {
    const [reason, setReason] = useState('')
    const [activationNote, setActivationNote] = useState('')

    const handleConfirm = () => {
        const data = showReasonInput && confirmText === 'Suspend' ? { reason } : confirmText === 'Activate' ? { activationNote } : {}
        onConfirm(data)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-4">{message}</p>

                {showReasonInput && confirmText === 'Suspend' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Reason for suspension *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Enter reason for suspension..."
                            className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] resize-none"
                            rows={3}
                            required
                        />
                    </div>
                )}

                {confirmText === 'Activate' && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Activation note (optional)</label>
                        <textarea
                            value={activationNote}
                            onChange={(e) => setActivationNote(e.target.value)}
                            placeholder="Enter optional note for activation..."
                            className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] resize-none"
                            rows={2}
                        />
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading || (showReasonInput && confirmText === 'Suspend' && !reason.trim())}
                        className={`px-4 py-2 ${confirmColor} hover:opacity-90 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2`}>
                        {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function SellerManagementPage() {
    const [sellers, setSellers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [showActionDropdown, setShowActionDropdown] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalSellers, setTotalSellers] = useState(0)
    const sellersPerPage = 20

    // Notification state
    const [notifications, setNotifications] = useState([])

    // Modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        sellerId: '',
        sellerName: '',
        showReasonInput: false
    })

    const showMessage = (message, type = 'info', title = null) => {
        const id = Date.now()
        const notification = {
            id,
            type,
            message,
            title,
            duration: 4000
        }
        setNotifications((prev) => [...prev, notification])
    }

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }

    const fetchSellers = useCallback(async (page = 1, filter = 'all', search = '') => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: sellersPerPage,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            }

            // Add search to backend query
            if (search.trim()) {
                params.search = search.trim()
            }

            // Handle status filters at backend level
            if (filter !== 'all') {
                if (filter === 'approved') {
                    params.verificationStatus = 'approved'
                } else if (filter === 'pending') {
                    params.verificationStatus = 'pending'
                } else if (filter === 'under_review') {
                    params.verificationStatus = 'under_review'
                } else if (filter === 'rejected') {
                    params.verificationStatus = 'rejected'
                } else if (filter === 'suspended') {
                    params.isActive = false
                } else if (filter === 'high-earning') {
                    params.minEarnings = 5000 // Backend filter for high-earning sellers
                }
            }

            const response = await apiClient.get('/v1/analytics/admin/sellers', { params })

            if (response?.data?.sellers) {
                let filteredSellers = response.data.sellers

                setSellers(filteredSellers)

                // Use backend pagination data for accurate counts
                const pagination = response.data.pagination
                if (pagination) {
                    setTotalPages(pagination.totalPages || 1)
                    setTotalSellers(pagination.totalCount || 0)
                } else {
                    // Fallback for backend without pagination
                    setTotalPages(Math.ceil(filteredSellers.length / sellersPerPage))
                    setTotalSellers(filteredSellers.length)
                }
            }
        } catch (error) {
            console.error('Failed to fetch sellers:', error)
            showMessage('Failed to load sellers', 'error')
        } finally {
            setLoading(false)
        }
    }, [])

    // Debounced search to avoid too many API calls
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [searchQuery])

    // Reset to page 1 when filters or search change
    useEffect(() => {
        setCurrentPage(1)
        fetchSellers(1, activeFilter, debouncedSearchQuery)
    }, [fetchSellers, activeFilter, debouncedSearchQuery])

    // Fetch data when page changes (but not filter/search)
    useEffect(() => {
        if (currentPage !== 1) {
            // Avoid double fetch on filter change
            fetchSellers(currentPage, activeFilter, debouncedSearchQuery)
        }
    }, [currentPage])

    // Single seller action handlers
    const handleSingleSellerAction = async (action, sellerId) => {
        const seller = sellers.find((s) => s._id === sellerId)
        if (!seller) return

        if (action === 'suspend' && seller.isActive !== false) {
            setConfirmModal({
                isOpen: true,
                type: 'suspend',
                sellerId,
                sellerName: seller.fullName || seller.email || 'Unknown Seller',
                showReasonInput: true
            })
        } else if (action === 'activate' && seller.isActive === false) {
            setConfirmModal({
                isOpen: true,
                type: 'activate',
                sellerId,
                sellerName: seller.fullName || seller.email || 'Unknown Seller',
                showReasonInput: false
            })
        }
        setShowActionDropdown(null)
    }

    // Confirm single seller action
    const confirmSingleSellerAction = async (data = {}) => {
        if (!confirmModal.sellerId) return

        setActionLoading(true)
        try {
            if (confirmModal.type === 'suspend') {
                // Note: This endpoint may need to be implemented on the backend
                await apiClient.post(`/v1/seller/admin/suspend/${confirmModal.sellerId}`, { 
                    reason: data.reason || 'Seller suspended by administrator' 
                })
                showMessage(`Seller "${confirmModal.sellerName}" has been suspended`, 'success')
            } else if (confirmModal.type === 'activate') {
                // Note: This endpoint may need to be implemented on the backend
                await apiClient.post(`/v1/seller/admin/activate/${confirmModal.sellerId}`, { 
                    note: data.activationNote 
                })
                showMessage(`Seller "${confirmModal.sellerName}" has been activated`, 'success')
            }

            // Refresh seller list
            await fetchSellers(currentPage, activeFilter, debouncedSearchQuery)
            setConfirmModal({ isOpen: false, type: '', sellerId: '', sellerName: '', showReasonInput: false })
        } catch (error) {
            console.error('Failed to perform seller action:', error)
            showMessage(`Failed to ${confirmModal.type} seller`, 'error')
        } finally {
            setActionLoading(false)
        }
    }

    const handleSellerAction = async (action, sellerId) => {
        if (action === 'suspend' || action === 'activate') {
            handleSingleSellerAction(action, sellerId)
        } else if (action === 'send-reset-email') {
            // Handle password reset for seller
            setActionLoading(true)
            try {
                const seller = sellers.find(s => s._id === sellerId)
                const result = await adminAPI.users.sendPasswordResetEmail(seller.userId)
                showMessage(`Password reset email sent to ${result.email}`, 'success', 'Email Sent')
            } catch (error) {
                console.error('Failed to send password reset email:', error)
                showMessage(error.message || 'Failed to send password reset email', 'error', 'Reset Failed')
            } finally {
                setActionLoading(false)
                setShowActionDropdown(null)
            }
        } else {
            // Handle other actions
            setActionLoading(true)
            try {
                switch (action) {
                    case 'view-products':
                        showMessage('Product view will be implemented soon', 'info')
                        break
                    case 'view-earnings':
                        showMessage('Earnings view will be implemented soon', 'info')
                        break
                    default:
                        break
                }
            } catch (error) {
                showMessage(`Failed to ${action} seller`, 'error')
            } finally {
                setActionLoading(false)
                setShowActionDropdown(null)
            }
        }
    }

    const exportSellers = () => {
        const csvContent = [
            ['Name', 'Email', 'Status', 'Joined', 'Products', 'Total Earnings', 'Location'].join(','),
            ...sellers.map((seller) =>
                [
                    seller.fullName || 'N/A',
                    seller.email || 'N/A',
                    getSellerStatus(seller),
                    new Date(seller.createdAt).toLocaleDateString(),
                    seller.stats?.totalProducts || 0,
                    `$${seller.stats?.totalEarnings || 0}`,
                    seller.location?.country || 'N/A'
                ].join(',')
            )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sellers-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        showMessage('Seller data exported successfully', 'success')
    }

    const getSellerStatus = (seller) => {
        if (seller.isActive === false) return 'suspended'
        return seller.verification?.status || seller.verificationStatus || 'pending'
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="border-b border-gray-800 bg-[#1a1a1a]">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                            <UserCheck
                                className="w-6 h-6"
                                style={{ color: BRAND }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Seller Management</h1>
                            <p className="text-gray-400">Manage seller accounts, products, and earnings</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search sellers by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[var(--neon,#00FF89)] transition-colors"
                                />
                            </div>

                            <div className="relative">
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="appearance-none bg-[#121212] border border-gray-700 rounded-lg px-4 py-2 pr-8 text-white focus:outline-none focus:border-[var(--neon,#00FF89)] transition-colors">
                                    {FILTER_OPTIONS.map((option) => (
                                        <option
                                            key={option.id}
                                            value={option.id}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={exportSellers}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>

                            <button
                                onClick={() => fetchSellers(currentPage, activeFilter)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--neon,#00FF89)] text-black rounded-lg hover:bg-[var(--neon,#00FF89)]/90 transition-colors disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notifications Container */}
            <div className="fixed top-6 right-6 z-50 space-y-3 pointer-events-none">
                <div className="pointer-events-auto">
                    {notifications.map((notification) => (
                        <Notification
                            key={notification.id}
                            id={notification.id}
                            type={notification.type}
                            message={notification.message}
                            title={notification.title}
                            duration={notification.duration}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </div>
            </div>

            <div className="p-6">
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[#121212] border-b border-gray-800">
                                <tr>
                                    <th className="text-left p-4 text-gray-300 font-medium">Seller</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Products</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Total Earnings</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-8 text-center text-gray-400">
                                            <div className="flex items-center justify-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Loading sellers...
                                            </div>
                                        </td>
                                    </tr>
                                ) : sellers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-8 text-center text-gray-400">
                                            No sellers found
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.map((seller) => {
                                        const status = getSellerStatus(seller)
                                        const statusConfig = SELLER_STATUS[status] || SELLER_STATUS.pending
                                        const StatusIcon = statusConfig.icon

                                        return (
                                            <tr
                                                key={seller._id}
                                                className="border-b border-gray-800 hover:bg-[#121212]/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--neon,#00FF89)] to-[var(--neon,#00FF89)]/70 rounded-full flex items-center justify-center text-black font-medium text-sm">
                                                            {(seller.fullName || seller.email || 'S').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{seller.fullName || 'Unnamed Seller'}</div>
                                                            <div className="text-gray-400 text-sm">{seller.email}</div>
                                                            {seller.location?.country && (
                                                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {seller.location.country}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-300">{new Date(seller.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Package className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-300">{seller.stats?.totalProducts || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-green-400" />
                                                        <span className="text-gray-300">${seller.stats?.totalEarnings || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowActionDropdown(showActionDropdown === seller._id ? null : seller._id)}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>

                                                        {showActionDropdown === seller._id && (
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#121212] border border-gray-700 rounded-lg shadow-xl z-10">
                                                                <button
                                                                    onClick={() => handleSellerAction('send-reset-email', seller._id)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                                                    <Mail className="w-4 h-4" />
                                                                    Send Reset Email
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSellerAction('view-products', seller._id)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                                                    <Package className="w-4 h-4" />
                                                                    View Products
                                                                </button>
                                                                <button
                                                                    onClick={() => handleSellerAction('view-earnings', seller._id)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                                                                    <DollarSign className="w-4 h-4" />
                                                                    View Earnings
                                                                </button>
                                                                {seller.isActive !== false ? (
                                                                    <button
                                                                        onClick={() => handleSellerAction('suspend', seller._id)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors">
                                                                        <UserX className="w-4 h-4" />
                                                                        Suspend Seller
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleSellerAction('activate', seller._id)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-green-300 hover:text-green-200 hover:bg-green-900/20 transition-colors">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Activate Seller
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-800 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-gray-400 text-sm">
                                Showing {(currentPage - 1) * sellersPerPage + 1} to {Math.min(currentPage * sellersPerPage, totalSellers)} of {totalSellers}{' '}
                                sellers
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Previous
                                </button>
                                <span className="text-gray-300 px-3">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, type: '', sellerId: '', sellerName: '', showReasonInput: false })}
                onConfirm={confirmSingleSellerAction}
                title={confirmModal.type === 'suspend' ? 'Suspend Seller' : 'Activate Seller'}
                message={`Are you sure you want to ${confirmModal.type} ${confirmModal.sellerName}?`}
                confirmText={confirmModal.type === 'suspend' ? 'Suspend' : 'Activate'}
                confirmColor={confirmModal.type === 'suspend' ? 'bg-red-600' : 'bg-green-600'}
                isLoading={actionLoading}
                showReasonInput={confirmModal.showReasonInput}
            />
        </div>
    )
}