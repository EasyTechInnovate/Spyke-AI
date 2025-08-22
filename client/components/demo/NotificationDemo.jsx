'use client'

import { useState } from 'react'
import { useNotificationProvider } from '@/components/shared/notifications/NotificationProvider'
import { NOTIFICATION_PRESETS, NOTIFICATION_TYPES, createNotification } from '@/lib/utils/notifications'

/**
 * Example component demonstrating how to use the notification system
 * This can be used as a reference for integrating notifications into other components
 */
export default function NotificationDemo() {
    const { showSuccess, showError, showWarning, showInfo, addToast } = useNotificationProvider()
    const [customTitle, setCustomTitle] = useState('')
    const [customMessage, setCustomMessage] = useState('')

    // Example 1: Using preset notifications
    const handlePresetNotifications = () => {
        showSuccess(NOTIFICATION_PRESETS.LOGIN_SUCCESS.title, NOTIFICATION_PRESETS.LOGIN_SUCCESS.message)

        setTimeout(() => {
            showInfo(NOTIFICATION_PRESETS.FEATURE_ANNOUNCEMENT.title, NOTIFICATION_PRESETS.FEATURE_ANNOUNCEMENT.message)
        }, 1000)

        setTimeout(() => {
            showWarning(NOTIFICATION_PRESETS.MAINTENANCE_WARNING.title, NOTIFICATION_PRESETS.MAINTENANCE_WARNING.message)
        }, 2000)
    }

    // Example 2: Custom notification with options
    const handleCustomNotification = () => {
        if (!customTitle || !customMessage) return

        addToast(
            createNotification(NOTIFICATION_TYPES.INFO, customTitle, customMessage, {
                duration: 8000, // Custom duration
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Expires in 24h
            })
        )
    }

    // Example 3: Simulating different notification scenarios
    const simulateScenarios = {
        purchase: () => {
            showInfo('Processing...', 'Your purchase is being processed')
            setTimeout(() => {
                showSuccess('Purchase Complete!', 'Thank you for your purchase. You can now access your content.')
            }, 2000)
        },

        error: () => {
            showError('Connection Failed', 'Unable to connect to server. Please check your internet connection and try again.')
        },

        bulkActions: () => {
            showInfo('Bulk Action', 'Processing 5 items...')
            setTimeout(() => showSuccess('Completed', '5 items processed successfully'), 2000)
            setTimeout(() => showWarning('Partial Success', '3 items completed, 2 items need attention'), 4000)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Notification System Demo</h1>
                <p className="text-gray-400">Test and demonstrate the notification system functionality</p>
            </div>

            <div className="grid gap-6">
                {/* Preset Notifications */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Preset Notifications</h2>
                    <p className="text-gray-400 mb-4">Test pre-configured notification messages</p>

                    <button
                        onClick={handlePresetNotifications}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Show Preset Sequence
                    </button>
                </div>

                {/* Custom Notifications */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Custom Notification</h2>
                    <p className="text-gray-400 mb-4">Create a custom notification with your own content</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Title</label>
                            <input
                                type="text"
                                value={customTitle}
                                onChange={(e) => setCustomTitle(e.target.value)}
                                placeholder="Enter notification title"
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Message</label>
                            <textarea
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="Enter notification message"
                                rows={3}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 resize-none"
                            />
                        </div>

                        <button
                            onClick={handleCustomNotification}
                            disabled={!customTitle || !customMessage}
                            className="px-4 py-2 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            Send Custom Notification
                        </button>
                    </div>
                </div>

                {/* Scenario Simulations */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Scenario Simulations</h2>
                    <p className="text-gray-400 mb-4">Simulate real-world notification scenarios</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={simulateScenarios.purchase}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                            Purchase Flow
                        </button>

                        <button
                            onClick={simulateScenarios.error}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                            Error Handling
                        </button>

                        <button
                            onClick={simulateScenarios.bulkActions}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                            Bulk Actions
                        </button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                    <p className="text-gray-400 mb-4">Test different notification types</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <button
                            onClick={() => showSuccess('Success!', 'This is a success message')}
                            className="px-4 py-2 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors">
                            Success
                        </button>

                        <button
                            onClick={() => showError('Error!', 'This is an error message')}
                            className="px-4 py-2 bg-red-600/20 border border-red-600/30 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
                            Error
                        </button>

                        <button
                            onClick={() => showWarning('Warning!', 'This is a warning message')}
                            className="px-4 py-2 bg-yellow-600/20 border border-yellow-600/30 text-yellow-400 rounded-lg hover:bg-yellow-600/30 transition-colors">
                            Warning
                        </button>

                        <button
                            onClick={() => showInfo('Info!', 'This is an info message')}
                            className="px-4 py-2 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors">
                            Info
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
