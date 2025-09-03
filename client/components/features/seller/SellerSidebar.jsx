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

export default function SellerSidebar({ currentPath = '/profile', sellerName = '', sidebarOpen, setSidebarOpen, isCollapsed, setIsCollapsed }) {
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
            href: '/seller/settings'
        }
    ]

    const handleLogout = useCallback(async () => {
        await logoutService.logout()
    }, [])

    const getInitials = useCallback((name) => {
        if (!name) return 'S'
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [])

    const isActive = (href) => {
        const cleanPath = currentPath.replace('/seller', '')
        const cleanHref = href.replace('/seller', '')
        return cleanPath === cleanHref
    }

    const handleSwitchToBuyer = useCallback(() => {
        setSidebarOpen && setSidebarOpen(false)
        router.push('/explore')
    }, [router, setSidebarOpen])

    return (
        <>
            {/* Desktop Sidebar - Fixed positioning */}
            <aside
                className={`hidden lg:flex fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out flex-col shadow-2xl ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
                aria-label="Seller navigation sidebar">
                {/* Desktop Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed && setIsCollapsed((prev) => !prev)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#00FF89]/30 transition-all duration-300 z-40"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>

                {/* Header - Brand section */}
                <div className={`px-6 py-8 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse"></div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Seller Studio
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Creative Dashboard</p>
                        </div>

                        {/* Collapsed state logo */}
                        <div className={`items-center justify-center w-full transition-all duration-300 ${isCollapsed ? 'flex' : 'hidden'}`}>
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FF89] to-[#00FF89]/80 flex items-center justify-center">
                                <span className="text-black font-bold text-xs">S</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className={`px-6 py-6 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
                    <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? 'justify-center gap-0' : ''}`}>
                        <div className="relative">
                            <div
                                className={`rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20 transition-all duration-300 ${
                                    isCollapsed ? 'w-8 h-8' : 'w-12 h-12'
                                }`}>
                                <span
                                    className={`text-black font-bold tracking-tight transition-all duration-300 ${
                                        isCollapsed ? 'text-xs' : 'text-sm'
                                    }`}>
                                    {getInitials(sellerName)}
                                </span>
                            </div>
                            <div
                                className={`absolute -bottom-1 -right-1 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 ${
                                    isCollapsed ? 'w-3 h-3' : 'w-4 h-4'
                                }`}>
                                <div className={`bg-black rounded-full transition-all duration-300 ${isCollapsed ? 'w-1 h-1' : 'w-1.5 h-1.5'}`}></div>
                            </div>
                        </div>
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            <h3 className="text-white font-bold text-base tracking-tight truncate mb-0.5">{sellerName || 'Creative Seller'}</h3>
                            <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">PRO CREATOR</p>
                        </div>
                    </div>
                </div>

                {/* Navigation - Desktop */}
                <nav className={`flex-1 overflow-y-auto py-4 space-y-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const itemIsActive = isActive(item.href)

                        return (
                            <div key={item.id}>
                                {item.disabled ? (
                                    <div
                                        className={`group flex items-center rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300 ${
                                            isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-4 py-3'
                                        }`}>
                                        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                                            <Icon className="w-4 h-4" />
                                            <span
                                                className={`font-medium text-sm tracking-tight transition-all duration-300 ${
                                                    isCollapsed ? 'hidden' : ''
                                                }`}>
                                                {item.label}
                                            </span>
                                        </div>
                                        {item.badge && (
                                            <span
                                                className={`px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium transition-all duration-300 ${
                                                    isCollapsed ? 'hidden' : ''
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`group flex items-center rounded-2xl transition-all duration-300 ${
                                            isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
                                        } ${
                                            itemIsActive
                                                ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                        title={isCollapsed ? item.label : undefined}>
                                        <Icon
                                            className={`w-4 h-4 transition-transform duration-300 ${
                                                itemIsActive ? 'scale-110' : 'group-hover:scale-105'
                                            }`}
                                        />
                                        <span
                                            className={`font-medium text-sm tracking-tight transition-all duration-300 ${
                                                isCollapsed ? 'hidden' : ''
                                            }`}>
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Bottom Actions - Desktop */}
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className={`pt-4 pb-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <div
                            className={`bg-gradient-to-r from-[#FFC050]/5 to-transparent rounded-2xl border border-[#FFC050]/10 group hover:border-[#FFC050]/20 transition-all duration-300 ${
                                isCollapsed ? 'p-2 flex justify-center' : 'p-3'
                            }`}>
                            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                                <HelpCircle className="w-4 h-4 text-[#FFC050]/60" />
                                <div className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                                    <p className="text-xs font-semibold text-[#FFC050]/80">24/7 Support</p>
                                    <p className="text-xs text-white/30">We're here to help</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`pb-4 space-y-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <button
                            onClick={handleSwitchToBuyer}
                            className={`w-full group flex items-center bg-gradient-to-r from-[#00FF89] to-[#00FF89]/90 text-black rounded-2xl font-semibold text-sm tracking-tight hover:shadow-lg hover:shadow-[#00FF89]/20 transition-all duration-300 hover:scale-[1.02] ${
                                isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
                            }`}
                            title={isCollapsed ? 'Switch to Buyer' : undefined}>
                            <ArrowLeftRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                            <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>Switch to Buyer</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className={`w-full group flex items-center text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm tracking-tight transition-all duration-300 ${
                                isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
                            }`}
                            title={isCollapsed ? 'Sign Out' : undefined}>
                            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                            <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar - Slide-in overlay */}
            <aside
                className={`lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out flex flex-col shadow-2xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Seller navigation sidebar">
                {/* Mobile Header */}
                <div className="px-6 py-6 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse"></div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Seller Studio
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Creative Dashboard</p>
                        </div>

                        <button
                            onClick={() => setSidebarOpen && setSidebarOpen(false)}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile User Profile */}
                <div className="px-6 py-6 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20">
                                <span className="text-black font-bold text-sm tracking-tight">{getInitials(sellerName)}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-base tracking-tight truncate mb-0.5">{sellerName || 'Creative Seller'}</h3>
                            <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">PRO CREATOR</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const itemIsActive = isActive(item.href)

                        return (
                            <div key={item.id}>
                                {item.disabled ? (
                                    <div className="group flex items-center justify-between px-4 py-3 rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-4 h-4" />
                                            <span className="font-medium text-sm tracking-tight">{item.label}</span>
                                        </div>
                                        {item.badge && (
                                            <span className="px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium">{item.badge}</span>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen && setSidebarOpen(false)}
                                        className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                                            itemIsActive
                                                ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                                                : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}>
                                        <Icon
                                            className={`w-4 h-4 transition-transform duration-300 ${
                                                itemIsActive ? 'scale-110' : 'group-hover:scale-105'
                                            }`}
                                        />
                                        <span className="font-medium text-sm tracking-tight">{item.label}</span>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Mobile Bottom Actions */}
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className="pt-4 pb-2 px-4">
                        <div className="bg-gradient-to-r from-[#FFC050]/5 to-transparent rounded-2xl border border-[#FFC050]/10 p-3 group hover:border-[#FFC050]/20 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-4 h-4 text-[#FFC050]/60" />
                                <div>
                                    <p className="text-xs font-semibold text-[#FFC050]/80">24/7 Support</p>
                                    <p className="text-xs text-white/30">We're here to help</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-4 px-4 space-y-2">
                        <button
                            onClick={handleSwitchToBuyer}
                            className="w-full group flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#00FF89] to-[#00FF89]/90 text-black rounded-2xl font-semibold text-sm tracking-tight hover:shadow-lg hover:shadow-[#00FF89]/20 transition-all duration-300 hover:scale-[1.02]">
                            <ArrowLeftRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                            <span>Switch to Buyer</span>
                        </button>

                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm tracking-tight transition-all duration-300">
                            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

