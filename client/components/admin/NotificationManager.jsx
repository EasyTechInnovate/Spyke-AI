'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Users, User, Megaphone, MessageSquare, AlertTriangle, CheckCircle, Info, XCircle, Calendar, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationProvider } from '../shared/notifications/NotificationProvider'
import { authAPI } from '@/lib/api/auth'
import { adminAPI } from '@/lib/api/admin'

const NOTIFICATION_TYPES = [
    { value: 'info', label: 'Information', icon: Info, color: 'text-blue-400' },
    { value: 'success', label: 'Success', icon: CheckCircle, color: 'text-green-400' },
    { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-yellow-400' },
    { value: 'error', label: 'Error', icon: XCircle, color: 'text-red-400' }
]

const RECIPIENT_TYPES = [
    { value: 'single', label: 'Single User', icon: User },
    { value: 'bulk', label: 'Multiple Users', icon: Users },
    { value: 'all', label: 'All Users', icon: Megaphone },
    { value: 'role', label: 'By Role', icon: Users }
]

export default function AdminNotificationManager() {
    const { user } = useAuth()
    const { showSuccess, showError } = useNotificationProvider()

    const [formData, setFormData] = useState({
        recipientType: 'single',
        userId: '',
        userIds: '',
        role: 'user',
        title: '',
        message: '',
        type: 'info',
        expiresAt: ''
    })

    const [loading, setLoading] = useState(false)
    const [users, setUsers] = useState([])
    const [searchTerm, setSearchTerm] = useState('')

    // Check if user is admin
    const isAdmin = user?.roles?.includes('admin')

    useEffect(() => {
        if (isAdmin && (formData.recipientType === 'single' || formData.recipientType === 'bulk')) {
            fetchUsers()
        }
    }, [isAdmin, formData.recipientType])

    const fetchUsers = async () => {
        try {
            // This would need to be implemented in the admin API
            // const response = await adminAPI.users.getAll({ limit: 100 })
            // setUsers(response.data || [])
        } catch (error) {
            console.error('Failed to fetch users:', error)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!isAdmin) return

        setLoading(true)
        try {
            const notification = {
                title: formData.title,
                message: formData.message,
                type: formData.type,
                expiresAt: formData.expiresAt || null
            }

            switch (formData.recipientType) {
                case 'single':
                    await authAPI.sendNotification({
                        userId: formData.userId,
                        ...notification
                    })
                    showSuccess('Success', 'Notification sent to user')
                    break

                case 'bulk':
                    const userIds = formData.userIds
                        .split(',')
                        .map((id) => id.trim())
                        .filter(Boolean)
                    await authAPI.sendBulkNotification({
                        userIds,
                        ...notification
                    })
                    showSuccess('Success', `Notification sent to ${userIds.length} users`)
                    break

                case 'all':
                    // This would need backend support for sending to all users
                    await authAPI.sendBulkNotification({
                        userIds: [], // Empty array could mean "all users" in backend
                        ...notification
                    })
                    showSuccess('Success', 'Notification sent to all users')
                    break

                case 'role':
                    // This would need backend support for sending by role
                    showError('Error', 'Role-based notifications not yet implemented')
                    break
            }

            // Reset form
            setFormData({
                recipientType: 'single',
                userId: '',
                userIds: '',
                role: 'user',
                title: '',
                message: '',
                type: 'info',
                expiresAt: ''
            })
        } catch (error) {
            showError('Error', error.message || 'Failed to send notification')
        } finally {
            setLoading(false)
        }
    }

    if (!isAdmin) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-lg font-medium text-white mb-2">Access Denied</h3>
                <p className="text-gray-400">You need admin privileges to send notifications</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Send Notification</h2>
                <p className="text-gray-400">Send notifications to users across the platform</p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    {/* Recipient Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-3">Recipient Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {RECIPIENT_TYPES.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                recipientType: type.value,
                                                userId: '',
                                                userIds: '',
                                                role: 'user'
                                            }))
                                        }
                                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                            formData.recipientType === type.value
                                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                        }`}>
                                        <Icon className="w-4 h-4" />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Recipient Details */}
                    {formData.recipientType === 'single' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">User ID</label>
                            <input
                                type="text"
                                value={formData.userId}
                                onChange={(e) => setFormData((prev) => ({ ...prev, userId: e.target.value }))}
                                placeholder="Enter user ID"
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                                required
                            />
                        </div>
                    )}

                    {formData.recipientType === 'bulk' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">User IDs (comma-separated)</label>
                            <textarea
                                value={formData.userIds}
                                onChange={(e) => setFormData((prev) => ({ ...prev, userIds: e.target.value }))}
                                placeholder="user1_id, user2_id, user3_id..."
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary resize-none"
                                required
                            />
                        </div>
                    )}

                    {formData.recipientType === 'role' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-white mb-2">Role</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary">
                                <option value="user">Users</option>
                                <option value="seller">Sellers</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                    )}

                    {/* Notification Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-3">Notification Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {NOTIFICATION_TYPES.map((type) => {
                                const Icon = type.icon
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData((prev) => ({ ...prev, type: type.value }))}
                                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                                            formData.type === type.value
                                                ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                                                : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                                        }`}>
                                        <Icon className={`w-4 h-4 ${formData.type === type.value ? 'text-brand-primary' : type.color}`} />
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-2">
                            Title <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Notification title"
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                            required
                        />
                    </div>

                    {/* Message */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-2">
                            Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                            placeholder="Notification message"
                            rows={4}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary resize-none"
                            required
                        />
                    </div>

                    {/* Expiration */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-white mb-2">Expiration Date (Optional)</label>
                        <input
                            type="datetime-local"
                            value={formData.expiresAt}
                            onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary"
                        />
                        <p className="text-xs text-gray-400 mt-1">Leave empty for permanent notification</p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <motion.button
                        type="submit"
                        disabled={loading || !formData.title || !formData.message}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send className="w-4 h-4" />
                        {loading ? 'Sending...' : 'Send Notification'}
                    </motion.button>
                </div>
            </form>
        </div>
    )
}
