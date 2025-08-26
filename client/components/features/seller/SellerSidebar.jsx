'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Package,
    Tag,
    User,
    LogOut,
    Menu,
    X,
    Settings,
    ShoppingCart,
    FileText,
    LayoutDashboard,
    ArrowLeftRight,
    HelpCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { logoutService } from '@/lib/services/logout'

const SellerSidebar = ({ currentPath = '/profile', sellerName = '', sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) => {
    const router = useRouter()

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
        await logoutService.logout()
    }, [])

    // Get initials from seller name
    const getInitials = useCallback((name) => {
        if (!name) return 'S'
        return name
            .split(' ')
            .map((word) => word[0])
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

    // Handle switch to buyer mode
    const handleSwitchToBuyer = useCallback(() => {
        setIsOpen(false)
        router.push('/explore')
    }, [router, setIsOpen])

    // Toggle collapsed state - use prop function if provided
    const toggleCollapsed = useCallback(() => {
        if (setIsCollapsed) {
            setIsCollapsed(prev => !prev)
        }
    }, [setIsCollapsed])

    // Use isCollapsed prop if provided, otherwise use internal state
    const sidebarCollapsed = isCollapsed !== undefined ? isCollapsed : false

    return (
        <>
            {/* Mobile Menu Button - Elegant floating design */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-6 left-6 z-50 p-3 bg-black/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 hover:border-[#00FF89]/30 transition-all duration-300"
                aria-label="Toggle menu">
                <Menu className="w-5 h-5 text-white" />
            </button>

            {/* Mobile Overlay - Sophisticated blur */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar - Refined glass morphism design with collapse functionality */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out flex flex-col shadow-2xl lg:z-[100] ${
                    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} w-80`}
                aria-label="Seller navigation sidebar">
                {/* Desktop Collapse Toggle Button */}
                <button
                    onClick={toggleCollapsed}
                    className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-black border border-white/10 rounded-full items-center justify-center text-white/60 hover:text-white hover:border-[#00FF89]/30 transition-all duration-300 z-10"
                    aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>

                {/* Header - Minimalist brand section */}
                <div className={`px-6 py-8 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-3' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className={`space-y-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse"></div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Seller Studio
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Creative Dashboard</p>
                        </div>

                        {/* Collapsed state logo */}
                        <div
                            className={`hidden lg:flex items-center justify-center w-full transition-all duration-300 ${
                                sidebarCollapsed ? 'lg:flex' : 'lg:hidden'
                            }`}>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FF89] to-[#00FF89]/80 flex items-center justify-center">
                                <span className="text-black font-bold text-xs">S</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 lg:hidden">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* User Profile - Elegant user card */}
                <div className={`px-6 py-6 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-3' : ''}`}>
                    <div className={`flex items-center gap-4 transition-all duration-300 ${sidebarCollapsed ? 'lg:justify-center lg:gap-0' : ''}`}>
                        <div className="relative">
                            <div
                                className={`rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20 transition-all duration-300 ${
                                    sidebarCollapsed ? 'lg:w-8 lg:h-8' : 'w-12 h-12'
                                }`}>
                                <span
                                    className={`text-black font-bold tracking-tight transition-all duration-300 ${
                                        sidebarCollapsed ? 'lg:text-xs' : 'text-sm'
                                    }`}>
                                    {getInitials(sellerName)}
                                </span>
                            </div>
                            <div
                                className={`absolute -bottom-1 -right-1 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 ${
                                    sidebarCollapsed ? 'lg:w-3 lg:h-3' : 'w-4 h-4'
                                }`}>
                                <div
                                    className={`bg-black rounded-full transition-all duration-300 ${
                                        sidebarCollapsed ? 'lg:w-1 lg:h-1' : 'w-1.5 h-1.5'
                                    }`}></div>
                            </div>
                        </div>
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                            <h3 className="text-white font-bold text-base tracking-tight truncate mb-0.5">{sellerName || 'Creative Seller'}</h3>
                            <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">PRO CREATOR</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {/* Navigation - Clean minimal design */}
                    <nav className={`py-4 space-y-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`}>
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const itemIsActive = isActive(item.href)

                            return (
                                <div key={item.id}>
                                    {item.disabled ? (
                                        <div
                                            className={`group flex items-center rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300 ${
                                                sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-2' : 'justify-between px-4 py-3'
                                            }`}>
                                            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'lg:gap-0' : 'gap-3'}`}>
                                                <Icon className="w-4 h-4" />
                                                <span
                                                    className={`font-medium text-sm tracking-tight transition-all duration-300 ${
                                                        sidebarCollapsed ? 'lg:hidden' : ''
                                                    }`}>
                                                    {item.label}
                                                </span>
                                            </div>
                                            {item.badge && (
                                                <span
                                                    className={`px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium transition-all duration-300 ${
                                                        sidebarCollapsed ? 'lg:hidden' : ''
                                                    }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`group flex items-center rounded-2xl transition-all duration-300 ${
                                                sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-2' : 'gap-3 px-4 py-3'
                                            } ${
                                                itemIsActive
                                                    ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                            }`}
                                            title={sidebarCollapsed ? item.label : undefined}>
                                            <Icon
                                                className={`w-4 h-4 transition-transform duration-300 ${
                                                    itemIsActive ? 'scale-110' : 'group-hover:scale-105'
                                                }`}
                                            />
                                            <span
                                                className={`font-medium text-sm tracking-tight transition-all duration-300 ${
                                                    sidebarCollapsed ? 'lg:hidden' : ''
                                                }`}>
                                                {item.label}
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            )
                        })}
                    </nav>
                </div>

                {/* Fixed Bottom Section - Always visible */}
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    {/* Help Section */}
                    <div className={`pt-4 pb-2 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`}>
                        <div
                            className={`bg-gradient-to-r from-[#FFC050]/5 to-transparent rounded-2xl border border-[#FFC050]/10 group hover:border-[#FFC050]/20 transition-all duration-300 ${
                                sidebarCollapsed ? 'lg:p-2 lg:flex lg:justify-center' : 'p-3'
                            }`}>
                            <div className={`flex items-center transition-all duration-300 ${sidebarCollapsed ? 'lg:gap-0' : 'gap-3'}`}>
                                <HelpCircle className="w-4 h-4 text-[#FFC050]/60" />
                                <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                                    <p className="text-xs font-semibold text-[#FFC050]/80">24/7 Support</p>
                                    <p className="text-xs text-white/30">We're here to help</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`pb-4 space-y-2 transition-all duration-300 ${sidebarCollapsed ? 'lg:px-2' : 'px-4'}`}>
                        {/* Switch to Buyer - Primary action */}
                        <button
                            onClick={handleSwitchToBuyer}
                            className={`w-full group flex items-center bg-gradient-to-r from-[#00FF89] to-[#00FF89]/90 text-black rounded-2xl font-semibold text-sm tracking-tight hover:shadow-lg hover:shadow-[#00FF89]/20 transition-all duration-300 hover:scale-[1.02] ${
                                sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-2' : 'gap-3 px-4 py-3'
                            }`}
                            aria-label="Switch to Buyer"
                            title={sidebarCollapsed ? 'Switch to Buyer' : undefined}>
                            <ArrowLeftRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Switch to Buyer</span>
                        </button>

                        {/* Logout - Secondary action */}
                        <button
                            onClick={handleLogout}
                            className={`w-full group flex items-center text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm tracking-tight transition-all duration-300 ${
                                sidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-2' : 'gap-3 px-4 py-3'
                            }`}
                            aria-label="Logout"
                            title={sidebarCollapsed ? 'Sign Out' : undefined}>
                            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                            <span className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

export { SellerSidebar }
export default SellerSidebar

