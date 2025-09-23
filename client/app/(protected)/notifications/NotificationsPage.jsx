'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Bell, 
    Search, 
    Filter, 
    CheckCheck, 
    Trash2, 
    Calendar, 
    Clock, 
    RefreshCcw, 
    Settings,
    AlertCircle,
    Info,
    CheckCircle,
    XCircle,
    Eye,
    Download,
    SortAsc,
    SortDesc,
    ChevronDown,
    ChevronUp,
    X as CloseIcon,
    Package,
    TrendingUp,
    Activity,
    Users,
    Star,
    Zap,
    Mail,
    Globe,
    MessageSquare
} from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import NotificationItem from '@/components/shared/notifications/NotificationItem'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
import { classNames as cn } from '@/lib/utils/classNames'
import { format } from 'date-fns'
const BRAND = '#00FF89'
const AMBER = '#FFC050'
const NOTIFICATION_FILTERS = [
    { value: '', label: 'All', icon: Bell },
    { value: 'unread', label: 'Unread', icon: Clock },
    { value: 'info', label: 'Info', icon: Info },
    { value: 'success', label: 'Success', icon: CheckCircle },
    { value: 'warning', label: 'Warning', icon: AlertCircle },
    { value: 'error', label: 'Error', icon: XCircle }
]
const DATE_FILTERS = [
    { value: '', label: 'All time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' }
]
const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'type', label: 'Type' },
    { value: 'isRead', label: 'Read Status' }
]
function formatDate(date) {
    if (!date) return 'N/A'
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now - d) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        loading,
        pagination,
        markAsRead,
        markAllAsRead,
        loadMore,
        fetchNotifications,
        getUnreadNotifications
    } = useNotifications()
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [debouncedQuery, setDebouncedQuery] = useState('')
    const [selectedFilter, setSelectedFilter] = useState('')
    const [selectedDateFilter, setSelectedDateFilter] = useState('')
    const [selectedNotifications, setSelectedNotifications] = useState(new Set())
    const [bulkActionLoading, setBulkActionLoading] = useState(false)
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
    const [listOpacity, setListOpacity] = useState(1)
    useEffect(() => {
        const id = setTimeout(() => setDebouncedQuery(searchTerm.trim().toLowerCase()), 220)
        return () => clearTimeout(id)
    }, [searchTerm])
    const filteredNotifications = notifications.filter((notification) => {
        const matchesSearch =
            !debouncedQuery ||
            notification.title.toLowerCase().includes(debouncedQuery) ||
            notification.message.toLowerCase().includes(debouncedQuery)
        const matchesType = !selectedFilter || (selectedFilter === 'unread' ? !notification.isRead : notification.type === selectedFilter)
        const matchesDate =
            !selectedDateFilter ||
            (() => {
                const notificationDate = new Date(notification.createdAt)
                const now = new Date()
                switch (selectedDateFilter) {
                    case 'today':
                        return notificationDate.toDateString() === now.toDateString()
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                        return notificationDate >= weekAgo
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                        return notificationDate >= monthAgo
                    default:
                        return true
                }
            })()
        return matchesSearch && matchesType && matchesDate
    })
    const handleSelectAll = () => {
        if (selectedNotifications.size === filteredNotifications.length) {
            setSelectedNotifications(new Set())
        } else {
            setSelectedNotifications(new Set(filteredNotifications.map((n) => n._id)))
        }
    }
    const handleSelectNotification = (notificationId) => {
        const newSelected = new Set(selectedNotifications)
        if (newSelected.has(notificationId)) {
            newSelected.delete(notificationId)
        } else {
            newSelected.add(notificationId)
        }
        setSelectedNotifications(newSelected)
    }
    const handleBulkMarkAsRead = async () => {
        setBulkActionLoading(true)
        try {
            const unreadSelected = Array.from(selectedNotifications).filter((id) => {
                const notification = notifications.find((n) => n._id === id)
                return notification && !notification.isRead
            })
            await Promise.all(unreadSelected.map((id) => markAsRead(id)))
            setSelectedNotifications(new Set())
            showMessage(`Marked ${unreadSelected.length} notifications as read`, 'success')
        } catch (error) {
            showMessage('Failed to mark notifications as read', 'error')
        } finally {
            setBulkActionLoading(false)
        }
    }
    const handleRefresh = async () => {
        setListOpacity(0.6)
        await fetchNotifications({ page: 1 })
        showMessage('Notifications updated', 'success')
        setTimeout(() => setListOpacity(1), 120)
    }
    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
        } else {
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
    }
    const exportNotificationsData = (notificationsData) => {
        const csvContent = [
            ['Title', 'Message', 'Type', 'Read Status', 'Date'],
            ...notificationsData.map((notification) => [
                notification.title || '',
                notification.message || '',
                notification.type || '',
                notification.isRead ? 'Read' : 'Unread',
                formatDate(notification.createdAt)
            ])
        ]
            .map((row) => row.map((field) => `"${field}"`).join(','))
            .join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `notifications-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }
    return (
        <div className="min-h-screen pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 pb-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {notification && (
                    <InlineNotification
                        type={notification.type}
                        message={notification.message}
                        onDismiss={clearNotification}
                    />
                )}
                <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#141414]">
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                'radial-gradient(600px 200px at 10% -20%, rgba(0,255,137,.08), transparent), radial-gradient(400px 150px at 90% -20%, rgba(255,192,80,.06), transparent)'
                        }}
                    />
                    <div className="relative p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2 sm:p-2.5 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: `${BRAND}1a` }}>
                                    <Bell
                                        className="w-5 h-5 sm:w-6 sm:h-6"
                                        style={{ color: BRAND }}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Notifications</h1>
                                    <p className="text-sm sm:text-base text-gray-400 mt-1">
                                        {unreadCount > 0 ? (
                                            <>You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</>
                                        ) : (
                                            "You're all caught up!"
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 w-full sm:w-auto">
                                <MiniKPI
                                    label="Total"
                                    value={notifications.length}
                                    icon={
                                        <Bell
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            style={{ color: BRAND }}
                                        />
                                    }
                                />
                                <MiniKPI
                                    label="Unread"
                                    value={unreadCount}
                                    icon={
                                        <Clock
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            style={{ color: '#ff6b6b' }}
                                        />
                                    }
                                />
                                <MiniKPI
                                    label="Today"
                                    value={notifications.filter(n => {
                                        const today = new Date().toDateString()
                                        return new Date(n.createdAt).toDateString() === today
                                    }).length}
                                    icon={
                                        <Activity
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            style={{ color: AMBER }}
                                        />
                                    }
                                />
                                <MiniKPI
                                    label="This Week"
                                    value={notifications.filter(n => {
                                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                        return new Date(n.createdAt) >= weekAgo
                                    }).length}
                                    icon={
                                        <TrendingUp
                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                            style={{ color: '#00AFFF' }}
                                        />
                                    }
                                />
                            </div>
                        </div>
                    </div>
                    <div className="px-4 sm:px-6 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search notifications by title or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-transparent"
                                aria-label="Search notifications"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    aria-label="Clear search"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {debouncedQuery && (
                    <div className="text-xs sm:text-sm text-gray-400 px-1">Showing {filteredNotifications.length} results for "{debouncedQuery}".</div>
                )}
                <div className="bg-[#171717] border border-gray-800 rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <span className="text-sm text-gray-400 flex-shrink-0">Sort by:</span>
                            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="flex-1 sm:flex-initial sm:w-40 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    {SORT_OPTIONS.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                                    className="p-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors flex-shrink-0">
                                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
                                <select
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="flex-1 xs:flex-initial xs:w-32 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    {NOTIFICATION_FILTERS.map((filter) => (
                                        <option
                                            key={filter.value}
                                            value={filter.value}>
                                            {filter.label}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    value={selectedDateFilter}
                                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                                    className="flex-1 xs:flex-initial xs:w-36 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50">
                                    {DATE_FILTERS.map((filter) => (
                                        <option
                                            key={filter.value}
                                            value={filter.value}>
                                            {filter.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 flex-1 xs:flex-initial">
                                    <button
                                        onClick={() => exportNotificationsData(filteredNotifications)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex-1 xs:flex-initial">
                                        <Download className="w-4 h-4" />
                                        <span className="hidden xs:inline">Export CSV</span>
                                        <span className="xs:hidden">Export</span>
                                    </button>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={markAllAsRead}
                                            className="flex items-center justify-center gap-2 px-3 py-2 bg-[#00FF89] text-[#121212] rounded-lg hover:bg-[#00FF89]/90 transition-colors text-sm font-medium flex-1 xs:flex-initial">
                                            <CheckCheck className="w-4 h-4" />
                                            <span className="hidden xs:inline">Mark All Read</span>
                                            <span className="xs:hidden">Mark All</span>
                                        </button>
                                    )}
                                </div>
                                {filteredNotifications.length > 0 && (
                                    <div className="flex items-center gap-2 bg-[#0f0f0f] px-3 py-2 rounded-lg border border-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={selectedNotifications.size === filteredNotifications.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                                        />
                                        <span className="text-sm text-gray-400 hidden xs:inline">Select All</span>
                                        <span className="text-sm text-gray-400 xs:hidden">All</span>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    title="Refresh"
                                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#0f0f0f] border border-gray-700 rounded-lg text-gray-300 hover:bg-[#1b1b1b] transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF89]/60 flex-shrink-0">
                                    <RefreshCcw className={cn('w-4 h-4', loading && 'animate-spin')} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {selectedNotifications.size > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 py-3 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                                {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBulkMarkAsRead}
                                    disabled={bulkActionLoading}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50">
                                    <CheckCheck className="w-4 h-4" />
                                    Mark as read
                                </button>
                                <button
                                    onClick={() => setSelectedNotifications(new Set())}
                                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                                    Clear selection
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
                <section
                    aria-busy={loading}
                    className="transition-opacity duration-200"
                    style={{ opacity: listOpacity }}>
                    {loading && notifications.length === 0 ? (
                        <Loader />
                    ) : filteredNotifications.length === 0 ? (
                        <EmptyState query={debouncedQuery} />
                    ) : (
                        <div className="space-y-3">
                            {filteredNotifications.map((notification) => (
                                <EnhancedNotificationCard
                                    key={notification._id}
                                    notification={notification}
                                    isSelected={selectedNotifications.has(notification._id)}
                                    onSelect={() => handleSelectNotification(notification._id)}
                                    onMarkAsRead={() => markAsRead(notification._id)}
                                />
                            ))}
                            {pagination.page < pagination.totalPages && (
                                <div className="text-center pt-6">
                                    <button
                                        onClick={loadMore}
                                        disabled={loading}
                                        className="px-6 py-3 bg-[#171717] hover:bg-[#1b1b1b] border border-gray-700 text-white rounded-lg transition-colors disabled:opacity-50">
                                        {loading ? 'Loading...' : 'Load more notifications'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
function MiniKPI({ label, value, icon }) {
    return (
        <div className="relative rounded-lg border border-gray-800 bg-[#0f0f0f] px-3 py-2">
            <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
                <div className="opacity-80">{icon}</div>
            </div>
            <div className="text-lg font-bold text-white">{value}</div>
        </div>
    )
}
function Loader() {
    return (
        <div className="flex items-center justify-center h-64">
            <div
                className="animate-spin rounded-full h-12 w-12 border-2"
                style={{ borderColor: `${BRAND}`, borderTopColor: 'transparent' }}
            />
        </div>
    )
}
function EmptyState({ query }) {
    return (
        <div className="bg-[#171717] border border-gray-800 rounded-xl p-10 text-center">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white">{query ? 'No matching notifications' : 'No notifications yet'}</h3>
            <p className="text-sm text-gray-400 mt-1">{query ? 'Try adjusting your search or filters' : "We'll notify you when something happens"}</p>
        </div>
    )
}
function EnhancedNotificationCard({ notification, isSelected, onSelect, onMarkAsRead }) {
    const getTypeConfig = (type) => {
        switch (type) {
            case 'success':
                return { icon: CheckCircle, color: 'text-[#00FF89]', bg: 'bg-[#00FF89]/10', border: 'border-[#00FF89]/20' }
            case 'error':
                return { icon: XCircle, color: 'text-[#ff6b6b]', bg: 'bg-[#ff6b6b]/10', border: 'border-[#ff6b6b]/20' }
            case 'warning':
                return { icon: AlertCircle, color: 'text-[#FFC050]', bg: 'bg-[#FFC050]/10', border: 'border-[#FFC050]/20' }
            case 'info':
            default:
                return { icon: Info, color: 'text-[#00AFFF]', bg: 'bg-[#00AFFF]/10', border: 'border-[#00AFFF]/20' }
        }
    }
    const typeConfig = getTypeConfig(notification.type)
    const TypeIcon = typeConfig.icon
    return (
        <div className={`rounded-xl border ${notification.isRead ? 'border-gray-800 bg-[#171717]' : 'border-[#00FF89]/20 bg-[#171717]'} overflow-hidden`}>
            <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onSelect}
                        className="mt-1 w-4 h-4 text-[#00FF89] bg-[#0f0f0f] border-gray-700 rounded focus:ring-[#00FF89]/50"
                    />
                    <div className={`p-2 rounded-lg ${typeConfig.bg} ${typeConfig.border} border`}>
                        <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className={`text-base font-semibold ${notification.isRead ? 'text-gray-300' : 'text-white'}`}>
                                {notification.title}
                            </h3>
                            {!notification.isRead && (
                                <span className="w-2 h-2 bg-[#00FF89] rounded-full flex-shrink-0"></span>
                            )}
                        </div>
                        <p className={`text-sm mt-1 ${notification.isRead ? 'text-gray-400' : 'text-gray-300'}`}>
                            {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(notification.createdAt)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${typeConfig.bg} ${typeConfig.color}`}>
                                {notification.type}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!notification.isRead && (
                            <button
                                onClick={onMarkAsRead}
                                className="px-3 py-1 bg-[#00FF89] text-[#121212] rounded text-xs font-medium hover:bg-[#00FF89]/90 transition-colors">
                                Mark as read
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}