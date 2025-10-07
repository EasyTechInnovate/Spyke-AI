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
import OptimizedImage from '@/components/shared/ui/OptimizedImage'
import { productsAPI } from '@/lib/api'
import { useNotificationProvider } from '@/components/shared/notifications/NotificationProvider'

const AdminProductModal = ({ product, isOpen, onClose, onProductUpdate }) => {
    const [activeTab, setActiveTab] = useState('overview')
    const [verificationNotes, setVerificationNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [showRejectModal, setShowRejectModal] = useState(false)
    
    const { showSuccess, showError, showInfo } = useNotificationProvider()
    
    // Replace showMessage with proper notification functions
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

    // Helper function to safely get category name
    const getCategoryName = (category) => {
        if (!category) return 'No category'
        if (typeof category === 'object') return category.name || 'Unknown category'
        return String(category)
    }

    // Helper function to safely get industry name
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
                                    <div
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${urgency.bg} ${urgency.color} flex items-center gap-1`}>
                                        <UrgencyIcon className="w-3 h-3" />
                                        {urgency.text}
                                    </div>
                                </div>
                                <p className="text-gray-400 line-clamp-2">{product.shortDescription || 'No description available'}</p>
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
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <OptimizedImage
                                                src={product.thumbnail}
                                                alt={product.title || 'Product image'}
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
                                                        {product.price === 0 ? 'Free' : `$${product.price || 0}`}
                                                    </div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Category</div>
                                                    <div className="text-white font-medium">{getCategoryName(product.category)}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Type</div>
                                                    <div className="text-white font-medium capitalize">{product.type || 'Not specified'}</div>
                                                </div>
                                                <div className="bg-gray-800/50 p-4 rounded-lg">
                                                    <div className="text-gray-400 text-sm">Industry</div>
                                                    <div className="text-white font-medium">{getIndustryName(product.industry)}</div>
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
                                    <div className="bg-gray-800/30 p-6 rounded-lg">
                                        <h3 className="text-lg font-semibold text-white mb-4">Product Description</h3>
                                        <p className="text-gray-300 leading-relaxed">{product.fullDescription || product.shortDescription || 'No description available'}</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white">Content Review</h3>
                                    
                                    <div className="bg-gray-800/30 p-6 rounded-lg space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Title</h4>
                                            <p className="text-white">{product.title || 'No title'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Short Description</h4>
                                            <p className="text-gray-300">{product.shortDescription || 'No short description'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Full Description</h4>
                                            <p className="text-gray-300 leading-relaxed">{product.fullDescription || 'No full description'}</p>
                                        </div>

                                        {product.benefits && product.benefits.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Benefits</h4>
                                                <ul className="text-gray-300 space-y-1 list-disc list-inside">
                                                    {product.benefits.map((benefit, index) => (
                                                        <li key={index}>{benefit}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {product.tags && product.tags.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.tags.map((tag, index) => (
                                                        <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                    
                                    {product.premiumContent ? (
                                        <div className="space-y-6">
                                            {/* Prompt Content */}
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

                                            {/* Automation Content */}
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

                                            {/* Agent Content */}
                                            {(product.premiumContent.agentConfiguration || product.premiumContent.agentFiles?.length > 0) && (
                                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                                                        <Settings className="w-5 h-5" />
                                                        Agent Content
                                                    </h4>
                                                    
                                                    {product.premiumContent.agentConfiguration && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Configuration Settings</h5>
                                                            <div className="bg-black/40 rounded-lg p-4 border border-gray-700">
                                                                <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                                                                    {product.premiumContent.agentConfiguration}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {product.premiumContent.agentFiles?.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Agent Files ({product.premiumContent.agentFiles.length})</h5>
                                                            <div className="space-y-2">
                                                                {product.premiumContent.agentFiles.map((file, index) => (
                                                                    <div key={index} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-700">
                                                                        <Download className="w-4 h-4 text-green-400" />
                                                                        <div className="flex-1">
                                                                            <div className="text-white text-sm font-medium">{file.name || `Agent File ${index + 1}`}</div>
                                                                            <div className="text-gray-400 text-xs">{file.type || 'Unknown type'}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Detailed How It Works */}
                                            {product.premiumContent.detailedHowItWorks?.length > 0 && (
                                                <div className="bg-gray-700/30 border border-gray-600 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                                        <MessageSquare className="w-5 h-5" />
                                                        Detailed Step-by-Step Guide
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {product.premiumContent.detailedHowItWorks.map((step, index) => (
                                                            <div key={index} className="flex gap-4 p-4 bg-black/30 rounded-xl border border-gray-700">
                                                                <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                                                                    {index + 1}
                                                                </div>
                                                                <div className="text-gray-300 text-sm leading-relaxed">{step}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Additional Premium Features */}
                                            {(product.premiumContent.videoTutorials?.length > 0 || 
                                              product.premiumContent.configurationExamples?.length > 0 || 
                                              product.premiumContent.resultExamples?.length > 0) && (
                                                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
                                                    <h4 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                                                        <Star className="w-5 h-5" />
                                                        Additional Premium Features
                                                    </h4>
                                                    
                                                    {product.premiumContent.videoTutorials?.length > 0 && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Video Tutorials ({product.premiumContent.videoTutorials.length})</h5>
                                                            <div className="space-y-2">
                                                                {product.premiumContent.videoTutorials.map((video, index) => (
                                                                    <div key={index} className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-700">
                                                                        <ExternalLink className="w-4 h-4 text-amber-400" />
                                                                        <div className="flex-1">
                                                                            <div className="text-white text-sm font-medium">{video.title || `Video ${index + 1}`}</div>
                                                                            <div className="text-gray-400 text-xs">{video.duration || 'Duration not specified'}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {product.premiumContent.configurationExamples?.length > 0 && (
                                                        <div className="mb-4">
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Configuration Examples ({product.premiumContent.configurationExamples.length})</h5>
                                                            <div className="text-gray-300 text-sm">Examples and templates included for easy setup</div>
                                                        </div>
                                                    )}
                                                    
                                                    {product.premiumContent.resultExamples?.length > 0 && (
                                                        <div>
                                                            <h5 className="text-sm font-medium text-gray-400 mb-2">Result Examples ({product.premiumContent.resultExamples.length})</h5>
                                                            <div className="text-gray-300 text-sm">Sample outputs and expected results included</div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Value Assessment */}
                                            <div className="bg-brand-primary/10 border border-brand-primary/30 rounded-lg p-6">
                                                <h4 className="text-lg font-semibold text-brand-primary mb-4">Admin Assessment</h4>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">Content Quality:</span>
                                                        <span className="text-white ml-2">
                                                            {(product.premiumContent.promptText || product.premiumContent.automationInstructions || product.premiumContent.agentConfiguration) 
                                                                ? '✅ Substantial' : '⚠️ Limited'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Files Included:</span>
                                                        <span className="text-white ml-2">
                                                            {(product.premiumContent.automationFiles?.length > 0 || product.premiumContent.agentFiles?.length > 0) 
                                                                ? `✅ ${(product.premiumContent.automationFiles?.length || 0) + (product.premiumContent.agentFiles?.length || 0)} files` 
                                                                : '❌ None'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Instructions:</span>
                                                        <span className="text-white ml-2">
                                                            {(product.premiumContent.promptInstructions || product.premiumContent.automationInstructions || product.premiumContent.detailedHowItWorks?.length > 0) 
                                                                ? '✅ Detailed' : '⚠️ Basic'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Price Justification:</span>
                                                        <span className="text-white ml-2">
                                                            {product.price === 0 ? '✅ Free' : 
                                                             product.price > 0 && (product.premiumContent.promptText || product.premiumContent.automationInstructions || product.premiumContent.agentConfiguration) 
                                                                ? '✅ Fair' : '⚠️ Review needed'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
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

                            {activeTab === 'technical' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white">Technical Details</h3>
                                    
                                    <div className="bg-gray-800/30 p-6 rounded-lg space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Setup Time</h4>
                                            <p className="text-white">{product.setupTime || 'Not specified'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Delivery Method</h4>
                                            <p className="text-white capitalize">{product.deliveryMethod || 'Not specified'}</p>
                                        </div>

                                        {product.toolsUsed && product.toolsUsed.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Tools Used</h4>
                                                <div className="space-y-2">
                                                    {product.toolsUsed.map((tool, index) => (
                                                        <div key={index} className="bg-gray-700/50 p-3 rounded">
                                                            <p className="text-white font-medium">{tool.name}</p>
                                                            {tool.model && <p className="text-gray-400 text-sm">Model: {tool.model}</p>}
                                                            {tool.link && (
                                                                <a href={tool.link} target="_blank" rel="noopener noreferrer" 
                                                                   className="text-brand-primary text-sm hover:underline">
                                                                    View Tool
                                                                </a>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {product.embedLink && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Embed Link</h4>
                                                <a href={product.embedLink} target="_blank" rel="noopener noreferrer" 
                                                   className="text-brand-primary hover:underline break-all">
                                                    {product.embedLink}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'seller' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white">Seller Information</h3>
                                    
                                    <div className="bg-gray-800/30 p-6 rounded-lg space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Seller Name</h4>
                                            <p className="text-white">{product.sellerId?.fullName || product.sellerId?.name || 'Unknown Seller'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Email</h4>
                                            <p className="text-gray-300">{product.sellerId?.email || 'Not available'}</p>
                                        </div>

                                        {product.sellerId?.bio && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Bio</h4>
                                                <p className="text-gray-300">{product.sellerId.bio}</p>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-brand-primary">{product.sellerId?.stats?.totalProducts || 0}</div>
                                                <div className="text-xs text-gray-400">Products</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-brand-primary">{product.sellerId?.stats?.totalSales || 0}</div>
                                                <div className="text-xs text-gray-400">Sales</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-brand-primary">{product.sellerId?.stats?.averageRating || 0}</div>
                                                <div className="text-xs text-gray-400">Rating</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-white">Product History</h3>
                                    
                                    <div className="bg-gray-800/30 p-6 rounded-lg space-y-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Created</h4>
                                            <p className="text-white">{product.createdAt ? new Date(product.createdAt).toLocaleString() : 'Unknown'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Last Updated</h4>
                                            <p className="text-white">{product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'Unknown'}</p>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-400 mb-2">Status</h4>
                                            <p className="text-white capitalize">{product.status || 'Draft'}</p>
                                        </div>

                                        {product.adminNotes && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Admin Notes</h4>
                                                <p className="text-gray-300">{product.adminNotes}</p>
                                            </div>
                                        )}

                                        {product.rejectionReason && (
                                            <div>
                                                <h4 className="text-sm font-medium text-red-400 mb-2">Rejection Reason</h4>
                                                <p className="text-red-300">{product.rejectionReason}</p>
                                            </div>
                                        )}
                                    </div>
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