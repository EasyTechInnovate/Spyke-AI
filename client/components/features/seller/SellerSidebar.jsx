'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import {
    Package,
    Tag,
    User,
    LogOut,
    Menu,
    X,
    Settings,
    ShoppingCart,
    BarChart3,
    MessageSquare,
    FileText,
    Wallet,
    LayoutDashboard
} from 'lucide-react'
import { logout } from '@/lib/services/logout'

const SellerSidebar = ({ currentPath = '/profile', sellerName = '', sidebarOpen, setSidebarOpen }) => {

    const navigationItems = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/seller/dashboard'
        },
        {
            id: 'profile',
            label: 'Profile',
            icon: User,
            href: '/seller/profile'
        },
        {
            id: 'products',
            label: 'Products',
            icon: Package,
            href: '/seller/products'
        },
        {
            id: 'promocodes',
            label: 'Promocodes',
            icon: Tag,
            href: '/seller/promocodes'
        },
        {
            id: 'orders',
            label: 'Orders',
            icon: ShoppingCart,
            href: '/seller/orders',
            disabled: true,
            badge: 'Soon'
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: BarChart3,
            href: '/seller/analytics',
            disabled: true,
            badge: 'Soon'
        },
        {
            id: 'messages',
            label: 'Messages',
            icon: MessageSquare,
            href: '/seller/messages',
            disabled: true,
            badge: 'Soon'
        },
        {
            id: 'payouts',
            label: 'Payouts',
            icon: Wallet,
            href: '/seller/payouts',
            disabled: true,
            badge: 'Soon'
        },
        {
            id: 'reports',
            label: 'Reports',
            icon: FileText,
            href: '/seller/reports',
            disabled: true,
            badge: 'Soon'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/seller/settings',
            disabled: true,
            badge: 'Soon'
        }
    ]

    // Use centralized logout
    const handleLogout = useCallback(async () => {
        await logout()
    }, [])

    // Get initials from seller name
    const getInitials = useCallback((name) => {
        if (!name) return 'S'
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [])

    // Check if the current path is active
    const isActive = (href) => {
        const cleanPath = currentPath.replace('/seller', '')
        const cleanHref = href.replace('/seller', '')
        return cleanPath === cleanHref
    }

    // Mobile state management
    const [mobileOpen, setMobileOpen] = useState(false)
    const isControlled = setSidebarOpen !== undefined
    const isOpen = isControlled ? sidebarOpen : mobileOpen
    const setIsOpen = isControlled ? setSidebarOpen : setMobileOpen

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] rounded-lg shadow-md border border-gray-800 hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
            >
                <Menu className="w-5 h-5 text-gray-300" />
            </button>

            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 md:w-64 bg-[#1a1a1a] border-r border-gray-800 transform transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
                aria-label="Seller navigation sidebar"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#00FF89]">Seller Panel</h2>
                            <p className="text-xs text-gray-500 mt-1">Manage your store</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg lg:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* User Profile Section */}
                <div className="px-6 py-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF89] to-[#FFC050] flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-[#121212] font-semibold text-sm">
                                {getInitials(sellerName)}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium truncate">
                                {sellerName || 'Seller'}
                            </h3>
                            <p className="text-xs text-gray-400">Premium Account</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const itemIsActive = isActive(item.href)

                        return (
                            <div key={item.id} className="mb-2">
                                {item.disabled ? (
                                    <div
                                        className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="px-2 py-1 text-xs bg-[#00FF89]/20 text-[#00FF89] rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                            itemIsActive 
                                                ? 'bg-[#00FF89] text-[#121212]' 
                                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 border-t border-gray-800">
                    {/* Help Section */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-[#FFC050]/10 to-[#FFC050]/5 rounded-lg border border-[#FFC050]/20">
                        <p className="text-xs font-medium text-[#FFC050] mb-1">Need help?</p>
                        <p className="text-xs text-gray-400">Contact support 24/7</p>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}

export { SellerSidebar }
export default SellerSidebar