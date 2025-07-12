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
    Sparkles
} from 'lucide-react'
import { SpykeLogo } from '@/components/Logo'
import api from '@/lib/api'

const EnhancedSidebar = ({ currentPath = '/dashboard', sellerName = '' }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [hoveredItem, setHoveredItem] = useState(null)
    const router = useRouter()

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'Products', path: '/products' },
        { icon: ShoppingCart, label: 'Orders', path: '/orders' },
        { icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { icon: Star, label: 'Reviews', path: '/reviews' },
        { icon: MessageSquare, label: 'Messages', path: '/messages', badge: 3 },
        { icon: Wallet, label: 'Payouts', path: '/payouts' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ]

    const handleLogout = async () => {
        console.log('Logout function called!')

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
        sessionStorage.clear()

        toast.success('Logged out successfully')

        window.location.href = '/signin'
    }

    return (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out`}>
            <div className="h-screen bg-[#1a1a1a] border-r border-gray-800 flex flex-col relative">
                {/* Glow effect */}
                <div className="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-[#00FF89]/5 to-transparent pointer-events-none"></div>

                {/* Toggle button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-[#1f1f1f] border border-gray-800 rounded-full flex items-center justify-center hover:bg-[#00FF89] hover:border-[#00FF89] group transition-all duration-200 z-10">
                    {isCollapsed ? (
                        <ChevronRight className="w-3 h-3 text-[#00FF89] group-hover:text-[#121212]" />
                    ) : (
                        <ChevronLeft className="w-3 h-3 text-[#00FF89] group-hover:text-[#121212]" />
                    )}
                </button>

                {/* Logo Section */}
                <div className="p-6">
                    <SpykeLogo
                        size={132}
                        showText={!isCollapsed}
                        textSize="text-lg"
                        className="transition-all duration-300"
                    />
                </div>

                {/* User Profile Section */}
                <div className={`px-6 py-4 border-b border-gray-800 ${isCollapsed ? 'text-center' : ''}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF89] to-[#FFC050] flex items-center justify-center flex-shrink-0">
                            <span className="text-[#121212] font-bold text-sm">
                                {sellerName
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase() || 'S'}
                            </span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <h3 className="text-white font-[var(--font-league-spartan)] truncate">{sellerName || 'Seller'}</h3>
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            const isActive = currentPath === item.path
                            const isHovered = hoveredItem === item.path

                            return (
                                <li key={item.path}>
                                    <a
                                        href={`/seller${item.path}`}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                            ${isActive ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:bg-[#00FF89]/10 hover:text-[#00FF89]'}
                                            ${isCollapsed ? 'justify-center' : ''}
                                            relative overflow-hidden group
                                        `}
                                        onMouseEnter={() => setHoveredItem(item.path)}
                                        onMouseLeave={() => setHoveredItem(null)}>
                                        {/* Hover effect */}
                                        <div
                                            className={`
                                                absolute inset-0 bg-gradient-to-r from-[#00FF89]/0 via-[#00FF89]/10 to-[#00FF89]/0
                                                transform -translate-x-full group-hover:translate-x-full transition-transform duration-700
                                                ${isActive ? 'hidden' : ''}
                                            `}></div>

                                        <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'text-[#121212]' : ''}`} />

                                        {!isCollapsed && (
                                            <>
                                                <span
                                                    className={`
                                                        font-[var(--font-kumbh-sans)] relative z-10
                                                        ${isActive ? 'font-semibold' : ''}
                                                    `}>
                                                    {item.label}
                                                </span>

                                                {item.badge && (
                                                    <span className="ml-auto bg-[#FFC050] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {isCollapsed && isHovered && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-[#1f1f1f] text-[#00FF89] text-sm rounded-md whitespace-nowrap z-50 border border-[#00FF89]/20">
                                                {item.label}
                                                {item.badge && <span className="ml-2 text-[#FFC050]">({item.badge})</span>}
                                            </div>
                                        )}
                                    </a>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Logout Button - WORKING VERSION */}
                <div className="p-3 border-t border-gray-800">
                    <button
                        onClick={() => {
                            console.log('Button clicked - calling handleLogout')
                            handleLogout()
                        }}
                        className={`
                            flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                            text-gray-400 hover:bg-red-500/10 hover:text-red-400
                            transition-all duration-200 cursor-pointer
                            ${isCollapsed ? 'justify-center' : ''}
                        `}>
                        <LogOut className="w-5 h-5" />
                        {!isCollapsed && <span className="font-[var(--font-kumbh-sans)]">Logout</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export const SellerSidebar = EnhancedSidebar
export default EnhancedSidebar
