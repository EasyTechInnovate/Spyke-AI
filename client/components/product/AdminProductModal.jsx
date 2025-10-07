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
    Zap,
    FileText,
    Settings
} from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { useNotificationProvider } from '@/components/shared/notifications/NotificationProvider'

const AdminProductModal = ({ product, isOpen, onClose, onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview')
    const [verificationNotes, setVerificationNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    
    const { showSuccess, showError, showInfo } = useNotificationProvider()
    
    const showMessage = (message, type = 'info') => {
        switch (type) {
            case 'success':
                showSuccess('Success', message)
                break
            case 'error':
                showError('Error', message)
                break
            case 'info':
            default:
                showInfo('Info', message)
                break
        }
    }

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
            showMessage(`Product ${action}ed successfully`, 'success')
            onProductUpdate?.(product._id, updateData)
            if (action === 'reject') {
                setShowRejectModal(false)
                setRejectionReason('')
            }
            onClose()
        } catch (error) {
            showMessage(`Failed to ${action} product`, 'error')
        } finally {
            setLoading(false)
        }
    }
    
    const handleRejectClick = () => {
        setShowRejectModal(true)
    }
    
    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) {
            showMessage('Please provide a reason for rejection', 'error')
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
        { id: 'premium', label: 'Premium Content', icon: FileText },
        { id: 'technical', label: 'Technical Details', icon: TestTube },
        { id: 'seller', label: 'Seller Info', icon: User },
        { id: 'history', label: 'History', icon: Clock }
    ]

    const getCategoryName = (category) => {
        if (!category) return 'No category'
        if (typeof category === 'object') return category.name || 'Unknown category'
        return String(category)
    }

    const getIndustryName = (industry) => {
        if (!industry) return 'No industry'
        if (typeof industry === 'object') return industry.name || 'Unknown industry'
        return String(industry)
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700">
                    
                    <div className="bg-gradient-to-r from-brand-primary/20 via-purple-600/20 to-brand-primary/20 p-6 border-b border-gray-700">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-white truncate">{product.title || 'Untitled Product'}</h2>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color} flex items-center gap-1`}>
                                        <UrgencyIcon className="w-3 h-3" />
                                        {urgency.text}
                                    </div>
                                </div>
                                <p className="text-gray-400 line-clamp-2">{product.shortDescription || 'No description available'}</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${product.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <Shield className="w-3 h-3" />
                                        {product.isVerified ? 'Verified' : 'Needs Verification'}
                                    </div>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${product.isTested ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                        <TestTube className="w-3 h-3" />
                                        {product.isTested ? 'Tested' : 'Needs Testing'}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                        <Calendar className="w-3 h-3" />
                                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Unknown date'}
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

                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div className="aspect-video w-full overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                                                <img
                                                    src={product.thumbnail || '/images/placeholder-product.jpg'}
                                                    alt={product.title || 'Product image'}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = '/images/placeholder-product.jpg'
                                                    }}
                                                />
                                            </div>
                                            {product.images && product.images.length > 0 && (
                                                <div className="grid grid-cols-3 gap-3">
                                                    {product.images.slice(0, 3).map((image, index) => (
                                                        <div key={index} className="aspect-square overflow-hidden rounded-lg border border-gray-700">
                                                            <img
                                                                src={image}
                                                                alt={`Product image ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = '/images/placeholder-product.jpg'
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-gradient-to-br from-brand-primary/20 to-brand-primary/10 border border-brand-primary/30 p-6 rounded-xl">
                                                    <div className="text-gray-400 text-sm mb-2">Price</div>
                                                    <div className="text-3xl font-bold text-brand-primary">
                                                        {product.price === 0 ? 'Free' : `$${product.price || 0}`}
                                                    </div>
                                                    {product.originalPrice && product.originalPrice > product.price && (
                                                        <div className="text-gray-500 text-sm line-through mt-1">
                                                            ${product.originalPrice}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                                                    <div className="text-gray-400 text-sm mb-2">Category</div>
                                                    <div className="text-white font-semibold text-lg">{getCategoryName(product.category)}</div>
                                                </div>
                                                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                                                    <div className="text-gray-400 text-sm mb-2">Type</div>
                                                    <div className="text-white font-semibold text-lg capitalize">{product.type || 'Not specified'}</div>
                                                </div>
                                                <div className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl">
                                                    <div className="text-gray-400 text-sm mb-2">Industry</div>
                                                    <div className="text-white font-semibold text-lg">{getIndustryName(product.industry)}</div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gray-800/30 border border-gray-700 p-6 rounded-xl">
                                                <div className="text-gray-400 text-sm mb-3">Performance Stats</div>
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <Eye className="w-5 h-5 text-blue-400" />
                                                            <span className="text-2xl font-bold text-white">{product.views || 0}</span>
                                                        </div>
                                                        <div className="text-gray-400 text-sm">Views</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <TrendingUp className="w-5 h-5 text-green-400" />
                                                            <span className="text-2xl font-bold text-white">{product.sales || 0}</span>
                                                        </div>
                                                        <div className="text-gray-400 text-sm">Sales</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center gap-2 mb-2">
                                                            <Star className="w-5 h-5 text-yellow-400" />
                                                            <span className="text-2xl font-bold text-white">{product.averageRating?.toFixed(1) || '0.0'}</span>
                                                        </div>
                                                        <div className="text-gray-400 text-sm">Rating</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gray-800/30 border border-gray-700 p-8 rounded-xl">
                                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                            <MessageSquare className="w-6 h-6 text-brand-primary" />
                                            Product Description
                                        </h3>
                                        <div className="prose prose-invert max-w-none">
                                            <p className="text-gray-300 leading-relaxed text-lg">
                                                {product.fullDescription || product.shortDescription || 'No description available'}
                                            </p>
                                        </div>
                                    </div>

                                    {(product.benefits?.length > 0 || product.howItWorks?.length > 0 || product.tags?.length > 0) && (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {product.benefits && product.benefits.length > 0 && (
                                                <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl">
                                                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                                        <CheckCircle className="w-5 h-5" />
                                                        Key Benefits
                                                    </h4>
                                                    <ul className="space-y-3">
                                                        {product.benefits.map((benefit, index) => (
                                                            <li key={index} className="flex items-start gap-3 text-gray-300">
                                                                <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                                                                {benefit}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {product.howItWorks && product.howItWorks.length > 0 && (
                                                <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl">
                                                    <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                                                        <Settings className="w-5 h-5" />
                                                        How It Works
                                                    </h4>
                                                    <ol className="space-y-3">
                                                        {product.howItWorks.map((step, index) => (
                                                            <li key={index} className="flex items-start gap-3 text-gray-300">
                                                                <div className="w-6 h-6 bg-blue-400 text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                                    {index + 1}
                                                                </div>
                                                                {typeof step === 'string' ? step : step.detail || step.title}
                                                            </li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {product.tags && product.tags.length > 0 && (
                                        <div className="bg-gray-800/30 border border-gray-700 p-6 rounded-xl">
                                            <h4 className="text-lg font-semibold text-white mb-4">Tags</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {product.tags.map((tag, index) => (
                                                    <span key={index} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition-colors text-gray-300 rounded-full text-sm font-medium border border-gray-600">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'premium' && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <h3 className="text-xl font-semibold text-white">Premium Content Review</h3>
                                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium border border-yellow-500/30">
                                            What Buyers Will Get
                                        </div>
                                    </div>
                                    
                                    {product.premiumContent && (
                                        Object.keys(product.premiumContent).some(key => {
                                            const value = product.premiumContent[key]
                                            return value && (
                                                (typeof value === 'string' && value.trim()) ||
                                                (Array.isArray(value) && value.length > 0)
                                            )
                                        })
                                    ) ? (
                                        <div className="space-y-6">
                                            {(product.premiumContent.promptText || product.premiumContent.promptInstructions) && (
                                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                                                        <FileText className="w-5 h-5" />
                                                        Prompt Content
                                                    </h4>
                                                    
                                                    {product.premiumContent.promptText && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Actual Prompt Text</h5>
                                                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                                                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                                                                    {product.premiumContent.promptText}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {product.premiumContent.promptInstructions && (
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Usage Instructions</h5>
                                                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                                    {product.premiumContent.promptInstructions}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {(product.premiumContent.automationInstructions || product.premiumContent.automationFiles?.length > 0) && (
                                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                                        <Zap className="w-5 h-5" />
                                                        Automation Content
                                                    </h4>
                                                    
                                                    {product.premiumContent.automationInstructions && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Setup Instructions</h5>
                                                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                                                <p className="text-gray-300 text-sm leading-relaxed">
                                                                    {product.premiumContent.automationInstructions}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {product.premiumContent.automationFiles?.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Downloadable Files ({product.premiumContent.automationFiles.length})</h5>
                                                            <div className="space-y-2">
                                                                {product.premiumContent.automationFiles.map((file, index) => (
                                                                    <div key={index} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-700">
                                                                        <Download className="w-4 h-4 text-purple-400" />
                                                                        <div className="flex-1">
                                                                            <div className="text-white text-sm font-medium">{file.name || `File ${index + 1}`}</div>
                                                                            <div className="text-gray-400 text-xs">{file.type || 'Unknown type'}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-800/30 p-8 rounded-lg text-center">
                                            <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-gray-400 mb-2">No Premium Content</h4>
                                            <p className="text-gray-500 text-sm">This product does not include any premium content for buyers.</p>
                                            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                <p className="text-yellow-400 text-sm">
                                                    ⚠️ Consider asking seller to add premium content to justify the price or reduce to free.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>

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