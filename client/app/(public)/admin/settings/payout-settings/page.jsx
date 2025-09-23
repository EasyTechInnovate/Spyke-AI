'use client'
import { useState, useEffect } from 'react'
import {
    DollarSign,
    Save,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    CreditCard,
    Percent,
    Shield,
    Info
} from 'lucide-react'
import apiClient from '@/lib/api/client'
import Notification from '@/components/shared/Notification'
const BRAND = '#00FF89'
export default function PayoutSettingsPage() {
    const [settings, setSettings] = useState({
        platformFeePercentage: 12,
        minimumPayoutThreshold: 75,
        payoutProcessingTime: 5,
        paymentProcessingFee: 2.5,
        holdPeriodNewSellers: 21,
        autoPayoutEnabled: false,
        maxPayoutAmount: 5000,
        currency: 'USD'
    })
    const [originalSettings, setOriginalSettings] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [hasChanges, setHasChanges] = useState(false)
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
    useEffect(() => {
        fetchSettings()
    }, [])
    useEffect(() => {
        const hasChangesNow = JSON.stringify(settings) !== JSON.stringify(originalSettings)
        setHasChanges(hasChangesNow)
    }, [settings, originalSettings])
    const fetchSettings = async () => {
        try {
            setLoading(true)
            const response = await apiClient.get('/v1/admin/platform/settings')
            if (response?.data) {
                setSettings(response.data)
                setOriginalSettings(response.data)
            }
        } catch (error) {
            console.error('Failed to fetch platform settings:', error)
            showMessage('Failed to load platform settings', 'error')
        } finally {
            setLoading(false)
        }
    }
    const handleInputChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }))
    }
    const validateSettings = () => {
        const errors = []
        if (settings.platformFeePercentage < 0 || settings.platformFeePercentage > 50) {
            errors.push('Platform fee must be between 0% and 50%')
        }
        if (settings.minimumPayoutThreshold < 1) {
            errors.push('Minimum payout threshold must be at least $1')
        }
        if (settings.payoutProcessingTime < 1) {
            errors.push('Payout processing time must be at least 1 day')
        }
        if (settings.paymentProcessingFee < 0) {
            errors.push('Payment processing fee cannot be negative')
        }
        if (settings.holdPeriodNewSellers < 0) {
            errors.push('Hold period cannot be negative')
        }
        if (settings.maxPayoutAmount < settings.minimumPayoutThreshold) {
            errors.push('Maximum payout amount must be greater than minimum threshold')
        }
        return errors
    }
    const handleSave = async () => {
        const errors = validateSettings()
        if (errors.length > 0) {
            errors.forEach(error => showMessage(error, 'error'))
            return
        }
        try {
            setSaving(true)
            const response = await apiClient.put('/v1/admin/platform/settings', settings)
            if (response?.data) {
                setOriginalSettings({ ...settings })
                showMessage('Platform settings updated successfully', 'success')
            }
        } catch (error) {
            console.error('Failed to update platform settings:', error)
            showMessage(
                error.response?.data?.message || 'Failed to update platform settings', 
                'error'
            )
        } finally {
            setSaving(false)
        }
    }
    const handleReset = async () => {
        try {
            setSaving(true)
            const response = await apiClient.post('/v1/admin/platform/settings/reset')
            if (response?.data) {
                setSettings(response.data)
                setOriginalSettings(response.data)
                showMessage('Platform settings reset to defaults', 'success')
            }
        } catch (error) {
            console.error('Failed to reset platform settings:', error)
            showMessage('Failed to reset platform settings', 'error')
        } finally {
            setSaving(false)
        }
    }
    const handleDiscard = () => {
        setSettings({ ...originalSettings })
        showMessage('Changes discarded', 'info')
    }
    if (loading) {
        return (
            <div className="min-h-screen bg-[#121212]">
                <div className="border-b border-gray-800 bg-[#1a1a1a]">
                    <div className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                                <DollarSign className="w-6 h-6" style={{ color: BRAND }} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Payout Settings</h1>
                                <p className="text-gray-400">Configure platform payout policies and parameters</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin text-[#00FF89]" />
                            <span className="text-white">Loading platform settings...</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-[#121212]">
            <div className="border-b border-gray-800 bg-[#1a1a1a]">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                            <DollarSign
                                className="w-6 h-6"
                                style={{ color: BRAND }}
                            />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Payout Settings</h1>
                            <p className="text-gray-400">Configure platform payout policies and parameters</p>
                        </div>
                    </div>
                    {hasChanges && (
                        <div className="flex items-center justify-between p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-yellow-400" />
                                <span className="text-yellow-400 text-sm">You have unsaved changes</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDiscard}
                                    className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="px-3 py-1 text-xs bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded transition-colors disabled:opacity-50">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}
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
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                                    <Percent className="w-5 h-5" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Financial Settings</h3>
                                    <p className="text-sm text-gray-400">Core revenue and fee structure</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Platform Fee Percentage (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        step="0.1"
                                        value={settings.platformFeePercentage}
                                        onChange={(e) => handleInputChange('platformFeePercentage', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Percentage of each sale taken as platform fee (0-50%)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Payment Processing Fee (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.1"
                                        value={settings.paymentProcessingFee}
                                        onChange={(e) => handleInputChange('paymentProcessingFee', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Additional fee for payment processing</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        value={settings.currency}
                                        onChange={(e) => handleInputChange('currency', e.target.value)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#00FF89] transition-colors">
                                        <option value="USD">USD - US Dollar</option>
                                        <option value="EUR">EUR - Euro</option>
                                        <option value="GBP">GBP - British Pound</option>
                                        <option value="CAD">CAD - Canadian Dollar</option>
                                        <option value="AUD">AUD - Australian Dollar</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                                    <CreditCard className="w-5 h-5" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Payout Limits</h3>
                                    <p className="text-sm text-gray-400">Define minimum and maximum amounts</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Minimum Payout Threshold ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={settings.minimumPayoutThreshold}
                                        onChange={(e) => handleInputChange('minimumPayoutThreshold', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Minimum amount required to request a payout</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Maximum Payout Amount ($)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={settings.maxPayoutAmount}
                                        onChange={(e) => handleInputChange('maxPayoutAmount', parseFloat(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Maximum amount that can be paid out in a single transaction</p>
                                </div>
                                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Info className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-medium text-blue-400">Current Range</span>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        ${settings.minimumPayoutThreshold} - ${settings.maxPayoutAmount}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                                    <Clock className="w-5 h-5" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Processing Settings</h3>
                                    <p className="text-sm text-gray-400">Configure timing and automation</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Payout Processing Time (days)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={settings.payoutProcessingTime}
                                        onChange={(e) => handleInputChange('payoutProcessingTime', parseInt(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Expected time to process payout requests</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Hold Period for New Sellers (days)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={settings.holdPeriodNewSellers}
                                        onChange={(e) => handleInputChange('holdPeriodNewSellers', parseInt(e.target.value) || 0)}
                                        className="w-full p-3 bg-[#121212] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00FF89] transition-colors"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Number of days to hold funds for new sellers</p>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                    <div>
                                        <h4 className="text-sm font-medium text-white mb-1">Auto Payout Enabled</h4>
                                        <p className="text-xs text-gray-400">Automatically process eligible payouts</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.autoPayoutEnabled}
                                            onChange={(e) => handleInputChange('autoPayoutEnabled', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#00FF89]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00FF89]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-[var(--neon,#00FF89)]/20 rounded-lg">
                                    <Shield className="w-5 h-5" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Security & Overview</h3>
                                    <p className="text-sm text-gray-400">Current configuration status</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div className="text-lg font-bold text-[#00FF89] mb-1">{settings.platformFeePercentage}%</div>
                                        <div className="text-xs text-gray-400">Platform Fee</div>
                                    </div>
                                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div className="text-lg font-bold text-[#00FF89] mb-1">${settings.minimumPayoutThreshold}</div>
                                        <div className="text-xs text-gray-400">Min Threshold</div>
                                    </div>
                                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div className="text-lg font-bold text-[#00FF89] mb-1">{settings.payoutProcessingTime}</div>
                                        <div className="text-xs text-gray-400">Processing Days</div>
                                    </div>
                                    <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                                        <div className="text-lg font-bold text-[#00FF89] mb-1">{settings.holdPeriodNewSellers}</div>
                                        <div className="text-xs text-gray-400">Hold Period Days</div>
                                    </div>
                                </div>
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-medium text-green-400">System Status</span>
                                    </div>
                                    <p className="text-sm text-gray-300">All payout systems operational and secure</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                            Reset to Defaults
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !hasChanges}
                            className="px-6 py-2 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                            {saving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}