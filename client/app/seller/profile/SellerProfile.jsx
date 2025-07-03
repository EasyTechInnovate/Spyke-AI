'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    DollarSign,
    Package,
    ShoppingCart,
    Clock,
    AlertCircle,
    CheckCircle,
    Plus,
    Eye,
    Edit,
    CreditCard,
    Settings,
    Star,
    Loader2
} from 'lucide-react'
import SellerSidebar from '@/components/seller/SellerSidebar'
import sellerAPI from '@/lib/api/seller'
import { toast } from 'sonner'
import Link from 'next/link'
import SellerPageLoader from '@/components/seller/SellerLoader'

export default function SellerProfile() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [sellerProfile, setSellerProfile] = useState(null)
    const [stats, setStats] = useState(null)

    useEffect(() => {
        fetchSellerData()
    }, [])

    const fetchSellerData = async () => {
        try {
            setLoading(true)
            const minimumLoadTime = new Promise((resolve) => setTimeout(resolve, 1500))
            const dataFetch = sellerAPI.getProfile()
            const [_, response] = await Promise.all([minimumLoadTime, dataFetch])
            if (response) {
                setSellerProfile(response)
                setStats(response.stats)
            } else {
                throw new Error(response.message || 'Failed to load profile')
            }
        } catch (error) {
            if (error.status === 401 || error.authError) {
                toast.error('Session expired. Please log in again.')
                router.push('/signin')
            } else if (error.status === 404) {
                toast.error('Seller profile not found. Please complete your profile.')
                router.push('/become-seller')
            } else {
                toast.error(error.message || 'Failed to load dashboard data')
            }
        } finally {
            setLoading(false)
        }
    }

    const getVerificationBadge = (status) => {
        const badges = {
            pending: {
                color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
                icon: Clock,
                text: 'Verification Pending'
            },
            approved: {
                color: 'bg-green-500/20 text-green-500 border-green-500/30',
                icon: CheckCircle,
                text: 'Verified Seller'
            },
            rejected: {
                color: 'bg-red-500/20 text-red-500 border-red-500/30',
                icon: AlertCircle,
                text: 'Verification Failed'
            }
        }
        return badges[status] || badges.pending
    }

    if (loading) {
        return <SellerPageLoader />
    }

    if (!sellerProfile) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No Seller Profile Found</h2>
                    <p className="text-gray-400 mb-4">You need to create a seller profile first.</p>
                    <Link
                        href="/become-seller"
                        className="inline-flex items-center px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
                    >
                        Create Seller Profile
                    </Link>
                </div>
            </div>
        )
    }

    const verificationBadge = getVerificationBadge(sellerProfile.verification?.status)
    const VerificationIcon = verificationBadge.icon

    return (
      <div className="flex min-h-screen bg-black">
            {/* Sidebar */}
            <SellerSidebar currentPath="/profile" />
            
            {/* Main Content */}
            <div className="flex-1">
                <div className="p-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-kumbh-sans font-bold text-white mb-2">Dashboard</h1>
                                <p className="text-gray-400">Welcome back, {sellerProfile.fullName}</p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${verificationBadge.color}`}>
                                    <VerificationIcon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{verificationBadge.text}</span>
                                </div>

                                <Link
                                    href="/seller/products/new"
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add Product</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Verification Warning */}
                    {sellerProfile.verification?.status === 'pending' && (
                        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-yellow-500 font-medium mb-1">Verification in Progress</h3>
                                <p className="text-sm text-gray-300">
                                    Your seller account is under review. You can start adding products, but they won't be visible to buyers until your
                                    account is verified.
                                </p>
                                {sellerProfile.verification?.submittedAt && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Submitted: {new Date(sellerProfile.verification.submittedAt).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Rejection Reason */}
                    {sellerProfile.verification?.status === 'rejected' && sellerProfile.verification?.rejectionReason && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-red-500 font-medium mb-1">Verification Failed</h3>
                                <p className="text-sm text-gray-300">{sellerProfile.verification.rejectionReason}</p>
                                <Link
                                    href="/seller/verification"
                                    className="inline-flex items-center gap-2 mt-3 text-sm text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Submit for Verification Again →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Earnings */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-brand-primary" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">${stats?.totalEarnings?.toFixed(2) || '0.00'}</h3>
                            <p className="text-sm text-gray-400">Total Earnings</p>
                        </div>

                        {/* Total Sales */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <ShoppingCart className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalSales || 0}</h3>
                            <p className="text-sm text-gray-400">Total Sales</p>
                        </div>

                        {/* Total Products */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stats?.totalProducts || 0}</h3>
                            <p className="text-sm text-gray-400">Total Products</p>
                        </div>

                        {/* Average Rating */}
                        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-brand-primary/50 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                    <Star className="w-6 h-6 text-yellow-500" />
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{stats?.totalReviews || 0} reviews</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stats?.averageRating?.toFixed(1) || '0.0'}</h3>
                            <p className="text-sm text-gray-400">Average Rating</p>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-8">
                        {/* Left Column - 2/3 width */}
                        <div className="xl:col-span-2 space-y-8">
                            {/* Getting Started */}
                            {stats?.totalProducts === 0 && (
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                                    <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                    <h2 className="text-2xl font-semibold text-white mb-2">Start Selling Today!</h2>
                                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                        You haven't added any products yet. Create your first product and start earning.
                                    </p>
                                    <Link
                                        href="/seller/products/new"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-black font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Your First Product
                                    </Link>
                                </div>
                            )}

                            {/* Profile Info Card */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-6">Profile Overview</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-3">Business Info</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-white">{sellerProfile.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Website</p>
                                                <p className="text-white">
                                                    {sellerProfile.websiteUrl ? (
                                                        <Link
                                                            href={sellerProfile.websiteUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-brand-primary hover:text-brand-primary/80"
                                                        >
                                                            {sellerProfile.websiteUrl}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-500">Not provided</span>
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Location</p>
                                                <p className="text-white">
                                                    {sellerProfile.location.country} •{' '}
                                                    {sellerProfile.location.timezone.split('/')[1]?.replace('_', ' ') ||
                                                        sellerProfile.location.timezone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-gray-400 mb-3">Expertise</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Niches</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sellerProfile.niches.map((niche, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs px-2 py-1 bg-brand-primary/20 text-brand-primary rounded"
                                                        >
                                                            {niche}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-2">Tools</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sellerProfile.toolsSpecialization.map((tool, index) => (
                                                        <span
                                                            key={index}
                                                            className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded"
                                                        >
                                                            {tool}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            {sellerProfile.customAutomationServices && (
                                                <div className="flex items-center gap-2 text-sm text-green-400">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Offers Custom Services</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-800">
                                    <p className="text-sm text-gray-400 mb-2">Bio</p>
                                    <p className="text-white">{sellerProfile.bio}</p>
                                </div>

                                <Link
                                    href="/seller/settings"
                                    className="inline-flex items-center gap-2 mt-6 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Right Column - 1/3 width */}
                        <div className="space-y-8">
                            {/* Payout Info */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-6">Payout Settings</h2>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Method</p>
                                        <p className="text-white capitalize flex items-center gap-2">
                                            {sellerProfile.payoutInfo.method}
                                            {!sellerProfile.payoutInfo.isVerified && (
                                                <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                                                    Not Verified
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">PayPal Email</p>
                                        <p className="text-white text-sm truncate">{sellerProfile.payoutInfo.paypalEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Available Balance</p>
                                        <p className="text-2xl font-bold text-white">$0.00</p>
                                    </div>
                                </div>
                                <Link
                                    href="/seller/payouts"
                                    className="inline-flex items-center gap-2 mt-6 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Manage Payouts
                                </Link>
                            </div>

                            {/* Settings */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Email Notifications</span>
                                        <span className={`text-sm ${sellerProfile.settings.emailNotifications ? 'text-green-400' : 'text-gray-500'}`}>
                                            {sellerProfile.settings.emailNotifications ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Marketing Emails</span>
                                        <span className={`text-sm ${sellerProfile.settings.marketingEmails ? 'text-green-400' : 'text-gray-500'}`}>
                                            {sellerProfile.settings.marketingEmails ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-300">Auto-approve Products</span>
                                        <span className={`text-sm ${sellerProfile.settings.autoApproveProducts ? 'text-green-400' : 'text-gray-500'}`}>
                                            {sellerProfile.settings.autoApproveProducts ? 'On' : 'Off'}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href="/seller/settings"
                                    className="inline-flex items-center gap-2 mt-6 text-sm text-brand-primary hover:text-brand-primary/80 transition-colors"
                                >
                                    <Settings className="w-4 h-4" />
                                    Manage Settings
                                </Link>
                            </div>

                            {/* Profile Views */}
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">Profile Performance</h2>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats?.profileViews || 0}</p>
                                        <p className="text-sm text-gray-400">Profile Views</p>
                                    </div>
                                    <Eye className="w-8 h-8 text-gray-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}