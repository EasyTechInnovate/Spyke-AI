'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
    Users,
    Search,
    Filter,
    UserX,
    Key,
    ShoppingBag,
    Eye,
    EyeOff,
    ChevronDown,
    Download,
    MoreHorizontal,
    Mail,
    Calendar,
    DollarSign,
    Package,
    AlertTriangle,
    CheckCircle,
    Clock,
    RefreshCw,
    X,
    UserCheck
} from 'lucide-react'
import apiClient from '@/lib/api/client'
import { adminAPI } from '@/lib/api/admin'
import Notification from '@/components/shared/Notification'
const BRAND = '#00FF89'
const USER_STATUS = {
    active: {
        label: 'Active',
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        icon: CheckCircle
    },
    inactive: {
        label: 'Inactive',
        color: 'text-gray-400',
        bg: 'bg-gray-400/10',
        icon: Clock
    },
    suspended: {
        label: 'Suspended',
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        icon: AlertTriangle
    }
}
const FILTER_OPTIONS = [
    { id: 'all', label: 'All Users' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'suspended', label: 'Suspended' },
    { id: 'high-value', label: 'High Value Buyers' }
]
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
export default function UserManagementPage() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [showActionDropdown, setShowActionDropdown] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const usersPerPage = 20
    const [notifications, setNotifications] = useState([])
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: '',
        userId: '',
        userName: '',
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
    const fetchUsers = useCallback(async (page = 1, filter = 'all') => {
        try {
            setLoading(true)
            const params = {
                page,
                limit: usersPerPage,
                sortBy: 'createdAt',
                sortOrder: 'desc',
                role: 'user'
            }
            if (filter !== 'all') {
                if (filter === 'active') params.status = 'active'
                else if (filter === 'inactive') params.status = 'inactive'
                else if (filter === 'high-value') params.minSpent = 1000
            }
            const response = await apiClient.get('/v1/analytics/admin/users', { params })
            if (response?.data?.users) {
                let filteredUsers = response.data.users.filter((user) => {
                    const isPrimarySeller = user.roles?.includes('seller') && !user.roles?.includes('user')
                    return !isPrimarySeller
                })
                setUsers(filteredUsers)
                const pagination = response.data.pagination
                if (pagination) {
                    setTotalPages(pagination.totalPages || 1)
                    setTotalUsers(pagination.totalCount || 0)
                } else {
                    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage))
                    setTotalUsers(filteredUsers.length)
                }
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
            showMessage('Failed to load users', 'error')
        } finally {
            setLoading(false)
        }
    }, [])
    useEffect(() => {
        setCurrentPage(1)
        fetchUsers(1, activeFilter)
    }, [fetchUsers, activeFilter])
    useEffect(() => {
        if (currentPage !== 1) {
            fetchUsers(currentPage, activeFilter)
        }
    }, [currentPage, activeFilter, fetchUsers])
    const displayedUsers = useMemo(() => {
        // Apply dropdown filter client-side
        let base = users
        switch (activeFilter) {
            case 'active':
                base = base.filter((u) => u.isActive)
                break
            case 'inactive':
                base = base.filter((u) => !u.isActive && !(u.isSuspended || u.suspension?.isSuspended))
                break
            case 'suspended':
                base = base.filter((u) => u.status === 'suspended' || u.isSuspended || u.suspension?.isSuspended)
                break
            case 'high-value':
                base = base.filter((u) => (u.totalSpent || 0) >= 1000)
                break
            default:
                break
        }
        const q = searchQuery.trim().toLowerCase()
        if (!q) return base
        return base.filter((u) => {
            const name = (u.name || '').toLowerCase()
            const email = (u.emailAddress || u.email || '').toLowerCase()
            return name.includes(q) || email.includes(q)
        })
    }, [users, searchQuery, activeFilter])

    // Highlight helper for matched text
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
    const highlightMatch = (text) => {
        const raw = text || ''
        const q = searchQuery.trim()
        if (!q) return raw
        try {
            const pattern = new RegExp(`(${escapeRegExp(q)})`, 'ig')
            const parts = raw.split(pattern)
            return parts.map((part, i) =>
                part.toLowerCase() === q.toLowerCase() ? (
                    <span key={i} className="text-[var(--neon,#00FF89)] font-semibold">{part}</span>
                ) : (
                    part
                )
            )
        } catch {
            return raw
        }
    }
    const handleSingleUserAction = async (action, userId) => {
        const user = users.find((u) => u._id === userId)
        if (!user) return
        if (action === 'suspend' && user.isActive) {
            setConfirmModal({
                isOpen: true,
                type: 'suspend',
                userId,
                userName: user.name || user.emailAddress || 'Unknown User',
                showReasonInput: true
            })
        } else if (action === 'activate' && !user.isActive) {
            setConfirmModal({
                isOpen: true,
                type: 'activate',
                userId,
                userName: user.name || user.emailAddress || 'Unknown User',
                showReasonInput: false
            })
        }
        setShowActionDropdown(null)
    }
    const confirmSingleUserAction = async (data = {}) => {
        if (!confirmModal.userId) return
        setActionLoading(true)
        try {
            if (confirmModal.type === 'suspend') {
                await adminAPI.users.suspend(confirmModal.userId, data.reason || 'Account suspended by administrator')
                showMessage(`User "${confirmModal.userName}" has been suspended`, 'success')
            } else if (confirmModal.type === 'activate') {
                await adminAPI.users.activate(confirmModal.userId, data.activationNote)
                showMessage(`User "${confirmModal.userName}" has been activated`, 'success')
            }
            await fetchUsers(currentPage, activeFilter)
            setConfirmModal({ isOpen: false, type: '', userId: '', userName: '', showReasonInput: false })
        } catch (error) {
            console.error('Failed to perform user action:', error)
            showMessage(`Failed to ${confirmModal.type} user`, 'error')
        } finally {
            setActionLoading(false)
        }
    }
    const handleUserAction = async (action, userId) => {
        if (action === 'suspend' || action === 'activate') {
            handleSingleUserAction(action, userId)
        } else if (action === 'send-reset-email') {
            setActionLoading(true)
            try {
                const result = await adminAPI.users.sendPasswordResetEmail(userId)
                showMessage(`Password reset email sent to ${result.email}`, 'success', 'Email Sent')
            } catch (error) {
                console.error('Failed to send password reset email:', error)
                showMessage(error.message || 'Failed to send password reset email', 'error', 'Reset Failed')
            } finally {
                setActionLoading(false)
                setShowActionDropdown(null)
                if (action !== 'view-orders') await fetchUsers(currentPage, activeFilter)
            }
        } else {
            setActionLoading(true)
            try {
                switch (action) {
                    case 'view-orders':
                        window.open(`/admin/users/${userId}/orders`, '_blank')
                        showMessage('Opening user order history', 'info')
                        break
                    default:
                        break
                }
            } catch (error) {
                showMessage(`Failed to ${action} user`, 'error')
            } finally {
                setActionLoading(false)
                setShowActionDropdown(null)
                if (action !== 'view-orders') await fetchUsers(currentPage, activeFilter)
            }
        }
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="border-b border-gray-800 bg-[#1a1a1a]">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                            <Users
                                className="w-6 h-6"
                                style={{ color: BRAND }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">User Management</h1>
                            <p className="text-gray-400">Manage buyer accounts, orders, and access</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
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
                                onClick={() => fetchUsers(currentPage, activeFilter)}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--neon,#00FF89)] text-black rounded-lg hover:bg-[var(--neon,#00FF89)]/90 transition-colors disabled:opacity-50">
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </div>
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
                                    <th className="text-left p-4 text-gray-300 font-medium">User</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Joined</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Orders</th>
                                    <th className="text-left p-4 text-gray-300 font-medium">Total Spent</th>
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
                                                Loading users...
                                            </div>
                                        </td>
                                    </tr>
                                ) : displayedUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="p-8 text-center text-gray-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    displayedUsers.map((user) => {
                                        const status = user.isActive ? 'active' : 'inactive'
                                        const StatusIcon = USER_STATUS[status].icon
                                        return (
                                            <tr
                                                key={user._id}
                                                className="border-b border-gray-800 hover:bg-[#121212]/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-[var(--neon,#00FF89)] to-[var(--neon,#00FF89)]/70 rounded-full flex items-center justify-center text-black font-medium text-sm">
                                                            {(user.name || user.emailAddress || 'U').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-medium">{highlightMatch(user.name || 'Unnamed User')}</div>
                                                            <div className="text-gray-400 text-sm">{highlightMatch(user.emailAddress || user.email || '')}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${USER_STATUS[status].bg} ${USER_STATUS[status].color}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {USER_STATUS[status].label}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 text-gray-300">{user.totalPurchases || 0}</td>
                                                <td className="p-4 text-gray-300">${user.totalSpent || 0}</td>
                                                <td className="p-4">
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setShowActionDropdown(showActionDropdown === user._id ? null : user._id)}
                                                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </button>
                                                        {showActionDropdown === user._id && (
                                                            <div className="absolute right-0 top-full mt-1 w-48 bg-[#121212] border border-gray-700 rounded-lg shadow-xl z-10">
                                                                <button
                                                                    // Disable if account already confirmed
                                                                    disabled={user?.accountConfirmation?.status === true}
                                                                    onClick={
                                                                        user?.accountConfirmation?.status === true
                                                                            ? undefined
                                                                            : () => handleUserAction('send-reset-email', user._id)
                                                                    }
                                                                    className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                                                                        user?.accountConfirmation?.status === true
                                                                            ? 'text-gray-500 cursor-not-allowed opacity-50'
                                                                            : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                                                    }`}
                                                                    title={
                                                                        user?.accountConfirmation?.status === true
                                                                            ? 'Account confirmed - reset disabled'
                                                                            : 'Send password reset email'
                                                                    }>
                                                                    <Mail className="w-4 h-4" />
                                                                    Send Reset Email
                                                                </button>
                                                                <button
                                                                    disabled={!((user.totalPurchases || 0) > 0)}
                                                                    onClick={
                                                                        (user.totalPurchases || 0) > 0
                                                                            ? () => handleUserAction('view-orders', user._id)
                                                                            : undefined
                                                                    }
                                                                    className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                                                                        (user.totalPurchases || 0) > 0
                                                                            ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                                                                            : 'text-gray-500 cursor-not-allowed opacity-50'
                                                                    }`}
                                                                    title={(user.totalPurchases || 0) > 0 ? 'View Orders' : 'No orders to view'}>
                                                                    <ShoppingBag className="w-4 h-4" />
                                                                    View Orders
                                                                </button>
                                                                {user.isActive ? (
                                                                    <button
                                                                        onClick={() => handleUserAction('suspend', user._id)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-300 hover:text-red-200 hover:bg-red-900/20 transition-colors">
                                                                        <UserX className="w-4 h-4" />
                                                                        Deactivate User
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleUserAction('activate', user._id)}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 text-left text-green-300 hover:text-green-200 hover:bg-green-900/20 transition-colors">
                                                                        <CheckCircle className="w-4 h-4" />
                                                                        Activate User
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
                                {searchQuery.trim() || activeFilter !== 'all' ? (
                                    <>Filtered {displayedUsers.length} of {totalUsers} users{activeFilter !== 'all' && !searchQuery.trim() ? ` (filter: ${activeFilter})` : ''}</>
                                ) : (
                                    <>Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users</>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1 || !!searchQuery.trim() || activeFilter !== 'all'}
                                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Previous
                                </button>
                                <span className="text-gray-300 px-3">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || !!searchQuery.trim() || activeFilter !== 'all'}
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
                onClose={() => setConfirmModal({ isOpen: false, type: '', userId: '', userName: '', showReasonInput: false })}
                onConfirm={confirmSingleUserAction}
                title={confirmModal.type === 'suspend' ? 'Suspend User' : 'Activate User'}
                message={`Are you sure you want to ${confirmModal.type} ${confirmModal.userName}?`}
                confirmText={confirmModal.type === 'suspend' ? 'Suspend' : 'Activate'}
                confirmColor={confirmModal.type === 'suspend' ? 'bg-red-600' : 'bg-green-600'}
                isLoading={actionLoading}
                showReasonInput={confirmModal.showReasonInput}
            />
        </div>
    )
}

