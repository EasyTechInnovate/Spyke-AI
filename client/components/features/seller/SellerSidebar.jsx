'use client'
import React, { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Package,
    Tag,
    User,
    LogOut,
    X,
    Settings,
    ShoppingCart,
    LayoutDashboard,
    ArrowLeftRight,
    HelpCircle,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    ChevronDown,
    FileText,
    Banknote
} from 'lucide-react'
import { logoutService } from '@/lib/services/logout'
const NAVIGATION_ITEMS = [
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
        href: '/seller/analytics'
    },
    {
        id: 'payouts',
        label: 'Payouts',
        icon: Banknote,
        href: '/seller/payouts'
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/seller/settings'
    }
]
const BrandHeader = ({ isCollapsed }) => (
    <div className={`px-6 py-8 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
        <div className="flex items-center justify-between">
            <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse" />
                    <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                        Seller Studio
                    </h2>
                </div>
                <p className="text-xs text-white/40 font-light tracking-wide">Creative Dashboard</p>
            </div>
            <div className={`items-center justify-center w-full transition-all duration-300 ${isCollapsed ? 'flex' : 'hidden'}`}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00FF89] to-[#00FF89]/80 flex items-center justify-center">
                    <span className="text-black font-bold text-xs">S</span>
                </div>
            </div>
        </div>
    </div>
)
const UserProfile = ({ sellerName, getInitials, isCollapsed }) => (
    <div className={`px-6 py-6 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center gap-4 transition-all duration-300 ${isCollapsed ? 'justify-center gap-0' : ''}`}>
            <div className="relative">
                <div className={`rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20 transition-all duration-300 ${
                    isCollapsed ? 'w-8 h-8' : 'w-12 h-12'
                }`}>
                    <span className={`text-black font-bold tracking-tight transition-all duration-300 ${
                        isCollapsed ? 'text-xs' : 'text-sm'
                    }`}>
                        {getInitials(sellerName)}
                    </span>
                </div>
                <div className={`absolute -bottom-1 -right-1 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 ${
                    isCollapsed ? 'w-3 h-3' : 'w-4 h-4'
                }`}>
                    <div className={`bg-black rounded-full transition-all duration-300 ${isCollapsed ? 'w-1 h-1' : 'w-1.5 h-1.5'}`} />
                </div>
            </div>
            <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                <h3 className="text-white font-bold text-base tracking-tight truncate mb-0.5">
                    {sellerName || 'Creative Seller'}
                </h3>
                <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">PRO CREATOR</p>
            </div>
        </div>
    </div>
)
const MobileUserProfile = ({ sellerName, getInitials }) => (
    <div className="px-6 py-6 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
            <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20">
                    <span className="text-black font-bold text-sm tracking-tight">{getInitials(sellerName)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-base tracking-tight truncate mb-0.5">
                    {sellerName || 'Creative Seller'}
                </h3>
                <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">PRO CREATOR</p>
            </div>
        </div>
    </div>
)
const CollapseButton = ({ isCollapsed, onToggle }) => (
    <button
        onClick={onToggle}
        className="absolute -right-3 top-8 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#00FF89]/30 transition-all duration-300 z-40"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
    </button>
)
const SupportCard = ({ isCollapsed }) => (
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
)
const ActionButton = ({ onClick, icon: Icon, label, variant = 'secondary', isCollapsed, title }) => {
    const baseClasses = "w-full group flex items-center rounded-2xl font-medium text-sm tracking-tight transition-all duration-300"
    const sizeClasses = isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
    const variantClasses = {
        primary: 'bg-gradient-to-r from-[#00FF89] to-[#00FF89]/90 text-black font-semibold hover:shadow-lg hover:shadow-[#00FF89]/20 hover:scale-[1.02]',
        secondary: 'text-white/60 hover:text-white hover:bg-white/5'
    }
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]}`}
            title={isCollapsed ? title : undefined}>
            <Icon className={`w-4 h-4 transition-transform duration-300 ${variant === 'primary' ? 'group-hover:rotate-180' : 'group-hover:rotate-12'}`} />
            <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>{label}</span>
        </button>
    )
}
const NavigationItem = ({ item, isActive, isCollapsed, onToggleGroup, isExpanded }) => {
    const Icon = item.icon
    const isGroup = !!item.subItems
    const baseClasses = "group flex items-center rounded-2xl transition-all duration-300"
    const sizeClasses = isCollapsed ? 'justify-center px-2 py-2' : (isGroup ? 'justify-between px-4 py-3' : 'gap-3 px-4 py-3')
    const getStateClasses = (active) => {
        if (item.disabled) return 'text-white/30 cursor-not-allowed'
        return active 
            ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
            : 'text-white/60 hover:text-white hover:bg-white/5'
    }
    if (item.disabled) {
        return (
            <div className={`${baseClasses} ${sizeClasses} ${getStateClasses(false)}`}>
                <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                    <Icon className="w-4 h-4" />
                    <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                        {item.label}
                    </span>
                </div>
                {item.badge && (
                    <span className={`px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                        {item.badge}
                    </span>
                )}
            </div>
        )
    }
    if (isGroup) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => onToggleGroup(item.id)}
                    className={`${baseClasses} ${sizeClasses} ${getStateClasses(isActive)} w-full`}
                    title={isCollapsed ? item.label : undefined}>
                    <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                        <Icon className="w-4 h-4" />
                        <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            {item.label}
                        </span>
                    </div>
                    {!isCollapsed && (
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    )}
                </button>
                {!isCollapsed && isExpanded && (
                    <div className="pl-4 space-y-1 pt-1">
                        {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            const subIsActive = isActive 
                            return (
                                <Link
                                    key={subItem.id}
                                    href={subItem.href}
                                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                                        subIsActive
                                            ? 'bg-[#00FF89]/20 text-[#00FF89] border-l-2 border-[#00FF89]'
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}>
                                    <SubIcon className="w-3.5 h-3.5" />
                                    <span className="text-sm font-medium tracking-tight">{subItem.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
    return (
        <Link
            href={item.href}
            className={`${baseClasses} ${sizeClasses} ${getStateClasses(isActive)}`}
            title={isCollapsed ? item.label : undefined}>
            <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                {item.label}
            </span>
        </Link>
    )
}
const MobileNavigationItem = ({ item, isActive, onToggleGroup, isExpanded, onCloseSidebar }) => {
    const Icon = item.icon
    const isGroup = !!item.subItems
    if (item.disabled) {
        return (
            <div className="group flex items-center justify-between px-4 py-3 rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300">
                <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm tracking-tight">{item.label}</span>
                </div>
                {item.badge && (
                    <span className="px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium">{item.badge}</span>
                )}
            </div>
        )
    }
    if (isGroup) {
        return (
            <div className="space-y-1">
                <button
                    onClick={() => onToggleGroup(item.id)}
                    className={`group w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                        isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}>
                    <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span className="font-medium text-sm tracking-tight">{item.label}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                    <div className="pl-4 space-y-1 pt-1">
                        {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon
                            const subIsActive = isActive 
                            return (
                                <Link
                                    key={subItem.id}
                                    href={subItem.href}
                                    onClick={onCloseSidebar}
                                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                                        subIsActive
                                            ? 'bg-[#00FF89]/20 text-[#00FF89] border-l-2 border-[#00FF89]'
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}>
                                    <SubIcon className="w-3.5 h-3.5" />
                                    <span className="text-sm font-medium tracking-tight">{subItem.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        )
    }
    return (
        <Link
            href={item.href}
            onClick={onCloseSidebar}
            className={`group flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                    ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}>
            <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            <span className="font-medium text-sm tracking-tight">{item.label}</span>
        </Link>
    )
}
export default function SellerSidebar({ 
    currentPath = '/profile', 
    sellerName = '', 
    sidebarOpen, 
    setSidebarOpen, 
    isCollapsed, 
    setIsCollapsed 
}) {
    const router = useRouter()
    const [expandedMenus, setExpandedMenus] = useState([])
    const getInitials = useCallback((name) => {
        if (!name) return 'S'
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }, [])
    const isActive = useCallback((href) => {
        const cleanPath = currentPath.replace('/seller', '')
        const cleanHref = href.replace('/seller', '')
        return cleanPath === cleanHref || (cleanHref !== '' && cleanPath.startsWith(cleanHref))
    }, [currentPath])
    const navigationWithActiveState = useMemo(() => {
        return NAVIGATION_ITEMS.map(item => ({
            ...item,
            isActive: item.href ? isActive(item.href) : item.subItems?.some(sub => isActive(sub.href))
        }))
    }, [isActive])
    const handleToggleCollapse = useCallback(() => {
        setIsCollapsed?.(prev => !prev)
    }, [setIsCollapsed])
    const handleToggleGroup = useCallback((menuId) => {
        setExpandedMenus(prev => 
            prev.includes(menuId) 
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        )
    }, [])
    const handleSwitchToBuyer = useCallback(() => {
        setSidebarOpen?.(false)
        router.push('/explore')
    }, [router, setSidebarOpen])
    const handleLogout = useCallback(async () => {
        await logoutService.logout()
    }, [])
    const handleCloseMobileSidebar = useCallback(() => {
        setSidebarOpen?.(false)
    }, [setSidebarOpen])
    return (
        <>
            <aside
                className={`hidden lg:flex fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out flex-col shadow-2xl ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
                aria-label="Seller navigation sidebar">
                <CollapseButton isCollapsed={isCollapsed} onToggle={handleToggleCollapse} />
                <BrandHeader isCollapsed={isCollapsed} />
                <UserProfile sellerName={sellerName} getInitials={getInitials} isCollapsed={isCollapsed} />
                <nav className={`flex-1 overflow-y-auto py-4 space-y-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {navigationWithActiveState.map(item => (
                        <NavigationItem
                            key={item.id}
                            item={item}
                            isActive={item.isActive}
                            isCollapsed={isCollapsed}
                            onToggleGroup={handleToggleGroup}
                            isExpanded={expandedMenus.includes(item.id)}
                        />
                    ))}
                </nav>
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className={`pt-4 pb-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <SupportCard isCollapsed={isCollapsed} />
                    </div>
                    <div className={`pb-4 space-y-2 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <ActionButton
                            onClick={handleSwitchToBuyer}
                            icon={ArrowLeftRight}
                            label="Switch to Buyer"
                            variant="primary"
                            isCollapsed={isCollapsed}
                            title="Switch to Buyer"
                        />
                        <ActionButton
                            onClick={handleLogout}
                            icon={LogOut}
                            label="Sign Out"
                            variant="secondary"
                            isCollapsed={isCollapsed}
                            title="Sign Out"
                        />
                    </div>
                </div>
            </aside>
            <aside
                className={`lg:hidden fixed top-0 left-0 z-50 h-full w-80 bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out flex flex-col shadow-2xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Seller navigation sidebar">
                <div className="px-6 py-6 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse" />
                                <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Seller Studio
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Creative Dashboard</p>
                        </div>
                        <button
                            onClick={handleCloseMobileSidebar}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <MobileUserProfile sellerName={sellerName} getInitials={getInitials} />
                <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                    {navigationWithActiveState.map(item => (
                        <MobileNavigationItem
                            key={item.id}
                            item={item}
                            isActive={item.isActive}
                            onToggleGroup={handleToggleGroup}
                            isExpanded={expandedMenus.includes(item.id)}
                            onCloseSidebar={handleCloseMobileSidebar}
                        />
                    ))}
                </nav>
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className="pt-4 pb-2 px-4">
                        <SupportCard isCollapsed={false} />
                    </div>
                    <div className="pb-4 px-4 space-y-2">
                        <ActionButton
                            onClick={handleSwitchToBuyer}
                            icon={ArrowLeftRight}
                            label="Switch to Buyer"
                            variant="primary"
                            isCollapsed={false}
                        />
                        <ActionButton
                            onClick={handleLogout}
                            icon={LogOut}
                            label="Sign Out"
                            variant="secondary"
                            isCollapsed={false}
                        />
                    </div>
                </div>
            </aside>
        </>
    )
}