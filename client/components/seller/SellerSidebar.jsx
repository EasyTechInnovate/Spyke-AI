'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Home,
    Package,
    ShoppingCart,
    BarChart3,
    Star,
    MessageSquare,
    Wallet,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    TrendingUp,
    Users,
    DollarSign,
    Bell,
    Plus,
    Zap,
    Award,
    Target,
    HelpCircle,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    CheckCircle,
    AlertCircle,
    Moon,
    Sun
} from 'lucide-react'
import { SpykeLogo } from '../Logo'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

const EnhancedSidebar = ({ currentPath = '/dashboard', sellerName = '', sellerData = {} }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(null)
    const [notifications, setNotifications] = useState(12)
    const [user, setUser] = useState(null)
    const [quickStats, setQuickStats] = useState({
        todayRevenue: '$1,234',
        todayOrders: 8,
        pendingMessages: 3,
        rating: 4.8
    })
    const router = useRouter()

    // Load user data from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user')
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr)
                    setUser(userData)
                } catch (e) {
                    console.error('Failed to parse user data:', e)
                }
            }
        }
    }, [])

    // Extract display name from email
    const getDisplayName = (name, email) => {
        if (name && name.trim()) return name

        if (email) {
            const emailName = email.split('@')[0]
            const formattedName = emailName
                .replace(/[\._\-\+\d]/g, ' ')
                .split(' ')
                .filter((part) => part.length > 0)
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                .join(' ')

            return formattedName || emailName
        }

        return 'Seller'
    }

    const getInitials = (name, email) => {
        const displayName = getDisplayName(name, email)
        return displayName
            .split(' ')
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
    }

    const menuItems = [
        {
            icon: Home,
            label: 'Dashboard',
            path: '/dashboard',
            description: 'Overview & stats'
        },
        {
            icon: Package,
            label: 'Products',
            path: '/products',
            description: 'Manage listings'
        },
        {
            icon: ShoppingCart,
            label: 'Orders',
            path: '/orders',
            description: 'Track sales',
            badge: quickStats.todayOrders,
            badgeType: 'success'
        },
        {
            icon: BarChart3,
            label: 'Analytics',
            path: '/analytics',
            description: 'Performance metrics'
        },
        {
            icon: Star,
            label: 'Reviews',
            path: '/reviews',
            description: 'Customer feedback',
            badge: 'New',
            badgeType: 'warning'
        },
        {
            icon: MessageSquare,
            label: 'Messages',
            path: '/messages',
            badge: quickStats.pendingMessages,
            badgeType: 'primary',
            description: 'Customer chats'
        },
        {
            icon: Wallet,
            label: 'Payouts',
            path: '/payouts',
            description: 'Earnings & withdrawals'
        },
        {
            icon: Settings,
            label: 'Settings',
            path: '/settings',
            description: 'Account preferences'
        }
    ]

    const quickActions = [
        { icon: Plus, label: 'Add Product', action: () => router.push('/seller/products/new') },
        { icon: Zap, label: 'Boost Sales', action: () => router.push('/seller/boost') },
        { icon: Target, label: 'Campaigns', action: () => router.push('/seller/campaigns') }
    ]

    const handleLogout = async () => {
        try {
            if (api && api.auth && api.auth.logout) {
                await api.auth.logout()
            }
        } catch (err) {
            console.error('API logout failed:', err)
        }

        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        localStorage.removeItem('sellerProfile')
        localStorage.removeItem('roles')
        sessionStorage.clear()

        toast.success('Logged out successfully')
        window.location.href = '/signin'
    }

    // Auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsCollapsed(true)
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <motion.div
            className={`${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out`}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}>
            <div className="h-screen bg-black/95 backdrop-blur-xl border-r border-gray-800 flex flex-col relative overflow-hidden">
                {/* Premium glow effects */}
                <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-primary/10 via-brand-primary/5 to-transparent pointer-events-none"></div>
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow"></div>

                {/* Toggle button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center hover:bg-brand-primary hover:border-brand-primary group transition-all duration-200 z-10 shadow-lg">
                    {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-brand-primary group-hover:text-black" />
                    ) : (
                        <ChevronLeft className="w-3 h-3 text-brand-primary group-hover:text-black" />
                    )}
                </motion.button>

                {/* Logo Section */}
                <div className="p-6">
                    <SpykeLogo
                        size={isCollapsed ? 40 : 132}
                        showText={!isCollapsed}
                        textSize="text-xl"
                        className="transition-all duration-300"
                    />
                </div>

                {/* Enhanced User Profile Section */}
                <div
                    className={`px-4 py-4 mx-3 mb-2 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 ${isCollapsed ? 'text-center' : ''}`}>
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-green-400 flex items-center justify-center flex-shrink-0 shadow-lg">
                                <span className="text-black font-bold text-sm">{user ? getInitials(user.name, user.emailAddress) : 'S'}</span>
                            </div>
                            {/* Online indicator */}
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                        </div>

                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-semibold truncate">
                                    {user ? getDisplayName(user.name, user.emailAddress) : sellerName || 'Seller'}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">Pro Seller</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                        <span className="text-xs text-yellow-500">{quickStats.rating}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Stats - Only visible when not collapsed */}
                    <AnimatePresence>
                        {!isCollapsed && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pt-4 border-t border-gray-700">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                                        <div className="flex items-center justify-center gap-1 text-green-500">
                                            <TrendingUp className="w-3 h-3" />
                                            <span className="text-sm font-semibold">{quickStats.todayRevenue}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Today</p>
                                    </div>
                                    <div className="bg-gray-800/50 rounded-lg p-2 text-center">
                                        <div className="flex items-center justify-center gap-1 text-blue-500">
                                            <ShoppingCart className="w-3 h-3" />
                                            <span className="text-sm font-semibold">{quickStats.todayOrders}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Orders</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Quick Actions - Only visible when not collapsed */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="px-6 pb-4">
                            <div className="flex gap-2">
                                {quickActions.map((action, index) => (
                                    <motion.button
                                        key={action.label}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={action.action}
                                        className="flex-1 p-2 bg-brand-primary/10 hover:bg-brand-primary/20 rounded-lg text-brand-primary transition-all duration-200 group"
                                        title={action.label}>
                                        <action.icon className="w-4 h-4 mx-auto group-hover:scale-110 transition-transform" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced Navigation Menu */}
                <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
                    <ul className="space-y-1">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon
                            const isActive = currentPath === item.path
                            const isHovered = hoveredItem === item.path

                            return (
                                <motion.li
                                    key={item.path}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}>
                                    <Link
                                        href={`/seller${item.path}`}
                                        className={`
                                            flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                            ${
                                                isActive
                                                    ? 'bg-brand-primary text-black shadow-lg shadow-brand-primary/20'
                                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'
                                            }
                                            ${isCollapsed ? 'justify-center' : ''}
                                            relative overflow-hidden group
                                        `}
                                        onMouseEnter={() => setHoveredItem(item.path)}
                                        onMouseLeave={() => setHoveredItem(null)}>
                                        {/* Hover effect */}
                                        <motion.div
                                            className={`
                                                absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent
                                                ${isActive ? 'hidden' : ''}
                                            `}
                                            initial={{ x: '-100%' }}
                                            animate={{ x: isHovered ? '100%' : '-100%' }}
                                            transition={{ duration: 0.5 }}
                                        />

                                        <div className="relative z-10 flex items-center gap-3 w-full">
                                            <div className={`relative ${isActive ? '' : 'group-hover:scale-110'} transition-transform`}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-black' : ''}`} />
                                                {item.badge && isCollapsed && (
                                                    <span
                                                        className={`
                                                        absolute -top-1 -right-1 w-2 h-2 rounded-full
                                                        ${item.badgeType === 'success' ? 'bg-green-500' : ''}
                                                        ${item.badgeType === 'warning' ? 'bg-yellow-500' : ''}
                                                        ${item.badgeType === 'primary' ? 'bg-brand-primary' : ''}
                                                        ${!item.badgeType ? 'bg-red-500' : ''}
                                                    `}></span>
                                                )}
                                            </div>

                                            {!isCollapsed && (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <div>
                                                        <span className={`block font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                                                        {item.description && <span className="text-xs opacity-60">{item.description}</span>}
                                                    </div>

                                                    {item.badge && (
                                                        <motion.span
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className={`
                                                                px-2 py-0.5 text-xs font-bold rounded-full
                                                                ${item.badgeType === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                                                                ${item.badgeType === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                                                ${item.badgeType === 'primary' ? 'bg-brand-primary/20 text-brand-primary' : ''}
                                                                ${!item.badgeType ? 'bg-red-500/20 text-red-400' : ''}
                                                            `}>
                                                            {item.badge}
                                                        </motion.span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Enhanced Tooltip for collapsed state */}
                                        <AnimatePresence>
                                            {isCollapsed && isHovered && (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white rounded-lg whitespace-nowrap z-50 border border-gray-700 shadow-xl">
                                                    <div className="font-medium">{item.label}</div>
                                                    {item.description && <div className="text-xs text-gray-400 mt-1">{item.description}</div>}
                                                    {item.badge && (
                                                        <span
                                                            className={`
                                                            inline-block mt-2 px-2 py-0.5 text-xs font-bold rounded-full
                                                            ${item.badgeType === 'success' ? 'bg-green-500/20 text-green-400' : ''}
                                                            ${item.badgeType === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                                                            ${item.badgeType === 'primary' ? 'bg-brand-primary/20 text-brand-primary' : ''}
                                                            ${!item.badgeType ? 'bg-red-500/20 text-red-400' : ''}
                                                        `}>
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                </motion.li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Help Section - Only visible when not collapsed */}
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="px-6 py-4">
                            <div className="bg-gradient-to-r from-brand-primary/10 to-green-400/10 rounded-xl p-4 border border-brand-primary/20">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-brand-primary/20 rounded-lg">
                                        <Sparkles className="w-4 h-4 text-brand-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-white mb-1">Pro Tip</h4>
                                        <p className="text-xs text-gray-300">Complete your profile to increase sales by 40%</p>
                                        <button className="text-xs text-brand-primary hover:text-white mt-2 font-medium">Learn more →</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom Actions */}
                <div className="p-3 border-t border-gray-800">
                    <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2`}>
                        {/* Notification Bell */}
                        <button
                            className={`
                                relative flex items-center gap-3 px-3 py-2.5 rounded-lg
                                text-gray-400 hover:bg-gray-800/50 hover:text-white
                                transition-all duration-200
                                ${isCollapsed ? 'justify-center w-full' : 'flex-1'}
                            `}>
                            <Bell className="w-5 h-5" />
                            {notifications > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                            {!isCollapsed && <span className="text-sm">Updates</span>}
                        </button>

                        {/* Help */}
                        <button
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg
                                text-gray-400 hover:bg-gray-800/50 hover:text-white
                                transition-all duration-200
                                ${isCollapsed ? 'justify-center w-full' : 'flex-1'}
                            `}>
                            <HelpCircle className="w-5 h-5" />
                            {!isCollapsed && <span className="text-sm">Help</span>}
                        </button>
                    </div>

                    {/* Logout Button */}
                    <motion.button
                        whileHover={{ scale: 0.98 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogout}
                        className={`
                            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg mt-2
                            text-gray-400 hover:bg-red-500/10 hover:text-red-400
                            transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                            group
                        `}>
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {!isCollapsed && <span className="font-medium">Logout</span>}
                    </motion.button>
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 255, 137, 0.3);
                    border-radius: 2px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 255, 137, 0.5);
                }

                @keyframes pulse-slow {
                    0%,
                    100% {
                        opacity: 0.5;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
            `}</style>
        </motion.div>
    )
}

export const SellerSidebar = EnhancedSidebar
export default EnhancedSidebar
