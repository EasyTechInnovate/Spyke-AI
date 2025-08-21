'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    CheckCircle,
    XCircle,
    Eye,
    TestTube,
    AlertTriangle,
    Calendar,
    User,
    DollarSign,
    Star,
    ExternalLink,
    Download,
    MessageSquare,
    Clock,
    Shield,
    Package,
    TrendingUp,
    Zap
} from 'lucide-react'
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import { productsAPI } from '@/lib/api'
import toast from '@/lib/utils/toast'

const AdminProductModal = ({ product, isOpen, onClose, onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview')
    const [verificationNotes, setVerificationNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)

    if (!isOpen || !product) return null

    const handleQuickAction = async (action, notes = '') => {
        setLoading(true)
        try {
            let updateData = {}

            switch (action) {
                case 'verify':
                    updateData = { isVerified: true }
                    break
                case 'test':
                    updateData = { isTested: true }
                    break
                case 'approve':
                    updateData = { isVerified: true, isTested: true }
                    break
                case 'reject':
                    updateData = { isVerified: false, isTested: false, rejectionReason: notes }
                    break
            }

            if (notes) updateData.adminNotes = notes

            await productsAPI.verifyProduct(product._id, updateData)

            toast.success(`Product ${action}d successfully`)
            onProductUpdate?.(product._id, updateData)
            
            if (action === 'reject') {
                setShowRejectModal(false)
                setRejectionReason('')
            }
            
            onClose()
        } catch (error) {
            toast.error(`Failed to ${action} product`)
        } finally {
            setLoading(false)
        }
    }

    const handleRejectClick = () => {
        setShowRejectModal(true)
    }

    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection')
            return
        }
        handleQuickAction('reject', rejectionReason)
    }

    const getUrgencyIndicator = () => {
        const hoursDiff = (Date.now() - new Date(product.createdAt)) / (1000 * 60 * 60)
        if (hoursDiff > 72) return { color: 'text-red-400', bg: 'bg-red-500/10', text: 'URGENT', icon: AlertTriangle }
        if (hoursDiff > 48) return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', text: 'Priority', icon: Clock }
        return { color: 'text-green-400', bg: 'bg-green-500/10', text: 'Normal', icon: CheckCircle }
    }

    const urgency = getUrgencyIndicator()
    const UrgencyIcon = urgency.icon

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Package },
        { id: 'content', label: 'Content Review', icon: Eye },
        { id: 'technical', label: 'Technical Details', icon: TestTube },
        { id: 'seller', label: 'Seller Info', icon: User },
        { id: 'history', label: 'History', icon: Clock }
    ]

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-brand-primary/20 via-purple-600/20 to-brand-primary/20 p-6 border-b border-gray-700">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white truncate">{product.title}</h2>
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color} flex items-center gap-1`}>
                                        <UrgencyIcon className="w-3 h-3" />
                                        {urgency.text}
                                    </div>
                                </div>
                                <p className="text-gray-400 line-clamp-2">{product.shortDescription}</p>

                                {/* Status indicators */}
                                <div className="flex items-center gap-4 mt-4">
                                    <div
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${product.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <Shield className="w-3 h-3" />
                                        {product.isVerified ? 'Verified' : 'Needs Verification'}
                                    </div>
                                    <div
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${product.isTested ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <TestTube className="w-3 h-3" />
                                        {product.isTested ? 'Tested' : 'Needs Testing'}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(product.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    <div className="flex h-[calc(90vh-200px)]">
                        {/* Sidebar Tabs */}
                        <div className="w-64 bg-gray-800/50 border-r border-gray-700 p-4">
                            <div className="space-y-2">
                                {tabs.map((tab) => {
                                    const TabIcon = tab.icon
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                                activeTab === tab.id
                                                    ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                                                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                            }`}>
                                            <TabIcon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-8 space-y-2">
                                <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Actions</h3>

                                {!product.isVerified && (
                                    <button
                                        onClick={() => handleQuickAction('verify', 'Quick verification')}
                                        disabled={loading}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        Verify
                                    </button>
                                )}

                                {!product.isTested && (
                                    <button
                                        onClick={() => handleQuickAction('test', 'Quick testing approval')}
                                        disabled={loading}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm">
                                        <TestTube className="w-4 h-4" />
                                        Mark Tested
                                    </button>
                                )}

                                {!product.isVerified || !product.isTested ? (
                                    <button
                                        onClick={() => handleQuickAction('approve', 'Full approval - verified and tested')}
                                        disabled={loading}
                                        className="w-full flex items-center gap-2 px-3 py-2 bg-brand-primary/20 text-brand-primary rounded-lg hover:bg-brand-primary/30 transition-colors text-sm">
                                        <Zap className="w-4 h-4" />
                                        Quick Approve
                                    </button>
                                ) : (
                                    <div className="w-full flex items-center gap-2 px-3 py-2 bg-green-600/20 text-green-400 rounded-lg text-sm">
                                        <CheckCircle className="w-4 h-4" />
                                        Fully Approved
                                    </div>
                                )}

                                <button
                                    onClick={handleRejectClick}
                                    disabled={loading}
                                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors text-sm">
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Product Image and Basic Info */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <OptimizedImage
                                                src={product.thumbnail}
                                                alt={product.title}
                                                width={400}
                                                height={300}
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Price</div>
                                                    <div className="text-2xl font-bold text-brand-primary">
                                                        {product.price === 0 ? 'Free' : `$${product.price}`}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Category</div>
                                                    <div className="text-white font-medium">{product.category}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Type</div>
                                                    <div className="text-white font-medium capitalize">{product.type}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Industry</div>
                                                    <div className="text-white font-medium">{product.industry}</div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-800/50 p-4 rounded-lg">
                                                <div className="text-gray-400 text-sm mb-2">Stats</div>
                                                <div className="flex gap-4 text-sm">
                                                    <div className="flex items-center gap-1 text-gray-300">
                                                        <Eye className="w-4 h-4" />
                                                        {product.views || 0} views
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-300">
                                                        <TrendingUp className="w-4 h-4" />
                                                        {product.sales || 0} sales
                                                    </div>
                                                    <div className="flex items-center gap-1 text-gray-300">
                                                        <Star className="w-4 h-4" />
                                                        {product.averageRating || 0} rating
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-800/30 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-4">Product Description</h3>
                                        <p className="text-gray-300 leading-relaxed">{product.fullDescription}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-700">
                        <div className="p-6">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Reject Product</h3>
                                    <p className="text-sm text-gray-400 mt-1">
                                        This will reject "{product.title}" and notify the seller.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-800/30 p-4 rounded-lg mb-4">
                                <div className="text-sm text-gray-400 mb-2">Product</div>
                                <div className="text-white font-medium">{product.title}</div>
                                <div className="text-sm text-gray-500">
                                    by {product.sellerId?.fullName || 'Unknown Seller'}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    Reason for rejection <span className="text-red-400">*</span>
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Provide a clear reason for rejection that will be sent to the seller..."
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none resize-none"
                                    rows={4}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleRejectSubmit}
                                    disabled={!rejectionReason.trim() || loading}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? 'Rejecting...' : 'Reject Product'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false)
                                        setRejectionReason('')
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default AdminProductModal

