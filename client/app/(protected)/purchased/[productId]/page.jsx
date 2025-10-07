'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    User,
    Package,
    Crown,
    Copy,
    Check,
    Zap,
    Bot,
    Code,
    Calendar,
    CreditCard,
    ExternalLink,
    Download
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { purchaseAPI } from '@/lib/api'

export default function PurchasedProductPage() {
    const [purchase, setPurchase] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('prompt')
    const [copiedItem, setCopiedItem] = useState(null)
    const [notification, setNotification] = useState(null)
    
    const params = useParams()
    const router = useRouter()
    const productId = params.productId
    const { isAuthenticated, loading: authLoading } = useAuth()

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 3000)
    }

    useEffect(() => {
        const loadPurchaseData = () => {
            if (authLoading) return
            if (!isAuthenticated) {
                router.push('/signin')
                return
            }

            try {
                setLoading(true)
                setError(null)
                
                // First try to get purchase data from sessionStorage
                const storedPurchase = sessionStorage.getItem('currentPurchase')
                
                if (storedPurchase) {
                    const purchaseData = JSON.parse(storedPurchase)
                    
                    if (purchaseData.product?._id === productId || 
                        purchaseData.product?.slug === productId || 
                        purchaseData.purchaseId === productId) {
                        setPurchase(purchaseData)
                        setLoading(false)
                        // Clear the stored data after use
                        sessionStorage.removeItem('currentPurchase')
                        return
                    }
                }
                
                // Fallback: fetch from API if no stored data or ID mismatch
                fetchPurchaseFromAPI()
                
            } catch (err) {
                console.error('Error loading purchase data:', err)
                setError('Failed to load purchase details')
                setLoading(false)
            }
        }

        const fetchPurchaseFromAPI = async () => {
            try {
                const response = await purchaseAPI.getUserPurchases()
                const purchases = response.purchases || []
                
                const foundPurchase = purchases.find(p => 
                    p.product?._id === productId || 
                    p.product?.slug === productId ||
                    p.purchaseId === productId
                )
                
                if (!foundPurchase) {
                    setError('Purchase not found or you do not have access to this product')
                    return
                }
                
                setPurchase(foundPurchase)
            } catch (err) {
                console.error('Error fetching purchase:', err)
                setError('Failed to load purchase details')
            } finally {
                setLoading(false)
            }
        }

        loadPurchaseData()
    }, [productId, isAuthenticated, authLoading, router])

    const copyToClipboard = async (text, itemName) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedItem(itemName)
            showNotification(`${itemName} copied to clipboard!`)
            setTimeout(() => setCopiedItem(null), 2000)
        } catch (err) {
            showNotification('Failed to copy to clipboard', 'error')
        }
    }

    // Check if premium content exists
    const hasPremiumContent =
        purchase?.product?.premiumContent &&
        (purchase.product.premiumContent.promptText ||
            purchase.product.premiumContent.promptInstructions ||
            purchase.product.premiumContent.automationInstructions ||
            purchase.product.premiumContent.agentConfiguration ||
            (purchase.product.premiumContent.detailedHowItWorks && purchase.product.premiumContent.detailedHowItWorks.length > 0))

    const premiumContent = purchase?.product?.premiumContent || {}

    // Build available tabs
    const availableTabs = []
    if (premiumContent.promptText) availableTabs.push({ id: 'prompt', label: 'Prompt Template', icon: FileText })
    if (premiumContent.promptInstructions) availableTabs.push({ id: 'instructions', label: 'Instructions', icon: FileText })
    if (premiumContent.automationInstructions) availableTabs.push({ id: 'automation', label: 'Automation', icon: Zap })
    if (premiumContent.agentConfiguration) availableTabs.push({ id: 'agent', label: 'Agent Config', icon: Bot })
    if (premiumContent.detailedHowItWorks?.length > 0) availableTabs.push({ id: 'howto', label: 'How to Use', icon: Code })

    // Set default active tab
    useEffect(() => {
        if (availableTabs.length > 0 && !availableTabs.find((tab) => tab.id === activeTab)) {
            setActiveTab(availableTabs[0].id)
        }
    }, [availableTabs, activeTab])

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-24">
                    <div className="animate-pulse space-y-8">
                        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-800 rounded-2xl"></div>
                        <div className="grid lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="h-48 bg-gray-800 rounded-2xl"></div>
                                <div className="h-32 bg-gray-800 rounded-2xl"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-32 bg-gray-800 rounded-2xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !purchase) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">{error || 'Purchase not found'}</h1>
                    <p className="text-gray-400 mb-8">The product you're looking for doesn't exist or you don't have access to it.</p>
                    <button
                        onClick={() => router.push('/purchases')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#00FF89] hover:bg-[#00FF89]/90 rounded-xl text-black font-semibold transition-all mx-auto">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Purchases
                    </button>
                </div>
            </div>
        )
    }

    const product = purchase.product

    return (
        <div className="min-h-screen bg-black">
            {/* Notification */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-50 px-4 py-2 rounded-lg text-white ${
                        notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-gray-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="flex items-center justify-between py-4">
                        <button
                            onClick={() => router.push('/purchases')}
                            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm font-medium">Back to Purchases</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">
                                by <span className="text-[#00FF89] font-medium">{purchase.seller?.fullName}</span>
                            </span>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00FF89]/10 border border-[#00FF89]/30 rounded-full">
                                <CheckCircle className="w-3.5 h-3.5 text-[#00FF89]" />
                                <span className="text-xs text-[#00FF89] font-semibold">Purchased</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl pt-8 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8">
                    
                    {/* Product Info Card */}
                    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-6">
                            {/* Thumbnail - Made smaller and positioned on the left */}
                            {product.thumbnail && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={product.thumbnail}
                                        alt={product.title}
                                        className="w-32 h-32 lg:w-40 lg:h-40 object-cover rounded-xl border border-gray-600/50 shadow-lg"
                                    />
                                </div>
                            )}
                            
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                {/* Tags */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    {hasPremiumContent && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full text-yellow-400 text-xs font-bold">
                                            <Crown className="w-3.5 h-3.5" />
                                            PREMIUM
                                        </span>
                                    )}
                                    <span className="inline-flex items-center px-3 py-1.5 bg-[#00FF89]/15 border border-[#00FF89]/30 rounded-full text-[#00FF89] text-xs font-semibold">
                                        {product.categoryName}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold capitalize">
                                        {product.type}
                                    </span>
                                </div>

                                {/* Title and Price */}
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                    <div className="flex-1">
                                        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight">{product.title}</h1>
                                        <p className="text-gray-400 text-sm lg:text-base">
                                            Created by <span className="text-[#00FF89] font-semibold">{purchase.seller?.fullName}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-[#00FF89] mb-1">${product.price}</div>
                                        <div className="text-xs text-gray-400">Purchased</div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-700/50">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-300">
                                            {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-300 font-mono">#{purchase.purchaseId.slice(-8)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-400">Access Granted</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Premium Content Section - Enhanced */}
                {hasPremiumContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-8">
                        
                        {/* Premium Content Header */}
                        <div className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-yellow-600/10 border border-yellow-500/20 rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-500/20 px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 flex items-center justify-center backdrop-blur-sm">
                                        <Crown className="w-7 h-7 text-yellow-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">Premium Content</h2>
                                        <p className="text-yellow-200/80 text-sm">Exclusive resources included with your purchase</p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Tabs */}
                            {availableTabs.length > 0 && (
                                <div className="p-6">
                                    <div className="bg-black/20 rounded-xl p-1 mb-6">
                                        <div className="flex overflow-x-auto">
                                            {availableTabs.map((tab) => {
                                                const IconComponent = tab.icon
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => setActiveTab(tab.id)}
                                                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                                                            activeTab === tab.id
                                                                ? 'bg-[#00FF89] text-black shadow-lg'
                                                                : 'text-yellow-100 hover:text-white hover:bg-white/5'
                                                        }`}>
                                                        <IconComponent className="w-4 h-4" />
                                                        {tab.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    {/* Enhanced Content Display */}
                                    <div className="space-y-6">
                                        {/* ...existing content display code... */}
                                        {activeTab === 'prompt' && premiumContent.promptText && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-[#00FF89]" />
                                                        Prompt Template
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(premiumContent.promptText, 'Prompt Template')}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg text-sm transition-all font-semibold shadow-lg">
                                                        {copiedItem === 'Prompt Template' ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Template
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-black/60 rounded-xl p-6 border border-gray-600/30 shadow-inner">
                                                    <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                                                        {premiumContent.promptText}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'instructions' && premiumContent.promptInstructions && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                        <FileText className="w-5 h-5 text-[#00FF89]" />
                                                        Examples
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(premiumContent.promptInstructions, 'Example')}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg text-sm transition-all font-semibold shadow-lg">
                                                        {copiedItem === 'Instructions' ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Instructions
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-black/60 rounded-xl p-6 border border-gray-600/30 shadow-inner">
                                                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {premiumContent.promptInstructions}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'automation' && premiumContent.automationInstructions && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                        <Zap className="w-5 h-5 text-[#00FF89]" />
                                                        Automation Setup
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(premiumContent.automationInstructions, 'Automation Setup')}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg text-sm transition-all font-semibold shadow-lg">
                                                        {copiedItem === 'Automation Setup' ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Setup
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-black/60 rounded-xl p-6 border border-gray-600/30 shadow-inner">
                                                    <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                                        {premiumContent.automationInstructions}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'agent' && premiumContent.agentConfiguration && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                        <Bot className="w-5 h-5 text-[#00FF89]" />
                                                        Agent Configuration
                                                    </h3>
                                                    <button
                                                        onClick={() => copyToClipboard(premiumContent.agentConfiguration, 'Agent Configuration')}
                                                        className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF89] hover:bg-[#00FF89]/90 text-black rounded-lg text-sm transition-all font-semibold shadow-lg">
                                                        {copiedItem === 'Agent Configuration' ? (
                                                            <>
                                                                <Check className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Config
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="bg-black/60 rounded-xl p-6 border border-gray-600/30 shadow-inner">
                                                    <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                                                        {premiumContent.agentConfiguration}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'howto' && premiumContent.detailedHowItWorks?.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                                    <Code className="w-5 h-5 text-[#00FF89]" />
                                                    Step-by-Step Guide
                                                </h3>
                                                <div className="space-y-4">
                                                    {premiumContent.detailedHowItWorks.map((step, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex gap-4 p-5 bg-black/40 rounded-xl border border-gray-600/30 shadow-sm hover:bg-black/50 transition-colors">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF89] to-green-400 flex items-center justify-center text-black font-bold text-sm flex-shrink-0 shadow-lg">
                                                                {index + 1}
                                                            </div>
                                                            <div className="text-gray-200 text-sm leading-relaxed">{step}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Purchase Details - Improved Layout */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid lg:grid-cols-3 gap-6">
                    
                    <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="w-5 h-5 text-[#00FF89]" />
                                Purchase Details
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/30">
                                        <Calendar className="w-5 h-5 text-[#00FF89] mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Purchase Date</div>
                                            <div className="text-white font-semibold">
                                                {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/30">
                                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Access Granted</div>
                                            <div className="text-green-400 font-semibold">
                                                {new Date(purchase.accessGrantedAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/30">
                                        <CreditCard className="w-5 h-5 text-[#00FF89] mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Amount Paid</div>
                                            <div className="text-white font-bold text-2xl">${product.price}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-4 bg-black/30 rounded-xl border border-gray-700/30">
                                        <Package className="w-5 h-5 text-[#00FF89] mt-1 flex-shrink-0" />
                                        <div>
                                            <div className="text-sm text-gray-400 mb-1">Purchase ID</div>
                                            <div className="text-white font-mono text-sm">#{purchase.purchaseId.slice(-8)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Enhanced Seller Info */}
                        <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-[#00FF89]" />
                                Creator
                            </h4>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#00FF89] to-blue-500 flex items-center justify-center shadow-lg">
                                    <User className="w-7 h-7 text-black" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg">{purchase.seller.fullName}</div>
                                    <div className="text-gray-400 text-sm">Product Creator</div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Files Section */}
                        {(premiumContent.automationFiles?.length > 0 || premiumContent.agentFiles?.length > 0) && (
                            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/60 border border-gray-700/50 rounded-2xl p-6 shadow-xl">
                                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Download className="w-5 h-5 text-[#00FF89]" />
                                    Available Files
                                </h4>
                                <div className="space-y-3">
                                    {premiumContent.automationFiles?.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                                            <Download className="w-4 h-4 text-[#00FF89]" />
                                            <div className="flex-1">
                                                <div className="text-white text-sm font-medium">{file.name || `Automation File ${index + 1}`}</div>
                                                <div className="text-gray-400 text-xs">Automation</div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-[#00FF89] transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {premiumContent.agentFiles?.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-black/40 rounded-lg">
                                            <Download className="w-4 h-4 text-[#00FF89]" />
                                            <div className="flex-1">
                                                <div className="text-white text-sm font-medium">{file.name || `Agent File ${index + 1}`}</div>
                                                <div className="text-gray-400 text-xs">Agent</div>
                                            </div>
                                            <button className="p-1 text-gray-400 hover:text-[#00FF89] transition-colors">
                                                <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}

