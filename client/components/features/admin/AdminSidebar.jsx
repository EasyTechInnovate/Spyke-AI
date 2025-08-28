'use client'

import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react'
import Link from 'next/link'
import {
    LayoutDashboard,
    X,
    LogOut,
    UserCheck,
    ChevronDown,
    Package,
    TrendingUp,
    ShieldCheck,
    Settings,
    Tag,
    ChevronLeft,
    ChevronRight,
    HelpCircle
} from 'lucide-react'
import { logoutService } from '@/lib/services/logout'
import adminAPI from '@/lib/api/admin'
import { DESIGN_TOKENS } from '@/lib/design-system/tokens'
import { DSBadge, DSLoadingState } from '@/lib/design-system'

// Coming Soon Features Set
const COMING_SOON = new Set(['analytics', 'compliance', 'settings'])

// Optimized helper functions
const matchPath = (path, target) => {
    if (!path || !target) return false
    if (path === target) return true
    try {
        const u = new URL(target, 'https://x')
        const t = new URL(path, 'https://x')
        return t.pathname.startsWith(u.pathname)
    } catch {
        return path.startsWith(target)
    }
}

const getTotal = (res) => res?.meta?.total ?? res?.pagination?.total ?? res?.total ?? res?.data?.total ?? 0

// Custom hook for measured height
function useMeasuredHeight(open) {
    const ref = useRef(null)
    const [h, setH] = useState(0)

    useEffect(() => {
        if (ref.current) {
            setH(ref.current.scrollHeight)
        }
    }, [open])

    return { ref, h }
}

// Custom hook for persisted state
function usePersistedState(key, initialValue) {
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') return initialValue
        try {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : initialValue
        } catch {
            return initialValue
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state))
        } catch (error) {
            console.warn(`Failed to persist ${key}:`, error)
        }
    }, [key, state])

    return [state, setState]
}

// Loading Badge Component
const LoadingBadge = memo(({ count, loading }) => {
    if (!count && !loading) return null

    return (
        <span
            className={`px-2 py-1 text-xs bg-[#00FF89]/10 text-[#00FF89] rounded-lg font-medium transition-all duration-300 ${loading ? 'animate-pulse' : ''}`}>
            {loading ? <div className="w-3 h-3 border border-[#00FF89]/30 border-t-[#00FF89] rounded-full animate-spin" /> : count}
        </span>
    )
})
LoadingBadge.displayName = 'LoadingBadge'

// Navigation Item Component
const NavigationItem = memo(({ item, isActive, isExpanded, onToggle, onItemClick, isCollapsed, loadingCounts, currentPath }) => {
    const Icon = item.icon
    const isGroup = !!item.subItems
    const disabled = COMING_SOON.has(item.id)
    const { ref, h } = useMeasuredHeight(isExpanded)

    if (!isGroup) {
        return (
            <div key={item.id}>
                {disabled ? (
                    <div
                        className={`group flex items-center rounded-2xl text-white/30 cursor-not-allowed transition-all duration-300 ${
                            isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-4 py-3'
                        }`}
                        title={isCollapsed ? `${item.label} - Coming Soon` : undefined}>
                        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                            <Icon className="w-4 h-4" />
                            <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                                {item.label}
                            </span>
                        </div>
                        <span
                            className={`px-2 py-1 text-xs bg-white/5 text-white/40 rounded-lg font-medium transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            Soon
                        </span>
                    </div>
                ) : (
                    <Link
                        href={item.href}
                        onClick={onItemClick}
                        className={`group flex items-center rounded-2xl transition-all duration-300 ${
                            isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
                        } ${isActive ? 'bg-[#00FF89] text-black shadow-lg shadow-[#00FF89]/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                        title={isCollapsed ? item.label : undefined}>
                        <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                        <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            {item.label}
                        </span>
                        {!isCollapsed && item.badge && (
                            <LoadingBadge
                                count={item.badge}
                                loading={loadingCounts}
                            />
                        )}
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div
            key={item.id}
            className="space-y-1">
            <button
                onClick={() => onToggle(item.id)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle(item.id)}
                aria-expanded={isExpanded}
                className={`group w-full flex items-center rounded-2xl transition-all duration-300 ${
                    isCollapsed ? 'justify-center px-2 py-2' : 'justify-between px-4 py-3'
                } ${isActive ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                title={isCollapsed ? item.label : undefined}>
                <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-3'}`}>
                    <Icon className="w-4 h-4" />
                    <span className={`font-medium text-sm tracking-tight transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                        {item.label}
                    </span>
                </div>
                {!isCollapsed && (
                    <div className="flex items-center gap-2">
                        {item.badge && (
                            <LoadingBadge
                                count={item.badge}
                                loading={loadingCounts}
                            />
                        )}
                        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                )}
            </button>

            {!isCollapsed && (
                <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isExpanded ? h : 0 }}>
                    <div
                        ref={ref}
                        className="pl-4 space-y-1 pt-1">
                        {item.subItems.map((sub) => {
                            const activeSub = matchPath(currentPath, sub.href)
                            return (
                                <Link
                                    key={sub.id}
                                    href={sub.href}
                                    onClick={onItemClick}
                                    className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                                        activeSub
                                            ? 'bg-[#00FF89]/20 text-[#00FF89] border-l-2 border-[#00FF89]'
                                            : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                                    }`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></div>
                                    <span className="text-sm font-medium tracking-tight">{sub.label}</span>
                                    {sub.badge && (
                                        <LoadingBadge
                                            count={sub.badge}
                                            loading={loadingCounts}
                                        />
                                    )}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
})
NavigationItem.displayName = 'NavigationItem'

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = usePersistedState('admin_expanded_menus_v2', [])
    const [isCollapsed, setIsCollapsed] = usePersistedState('admin_sidebar_collapsed', false)

    const [counts, setCounts] = useState({
        sellers: { pending: 0, active: 0, payouts: 0 },
        products: { pending: 0, flagged: 0, featured: 0 }
    })
    const [loadingCounts, setLoadingCounts] = useState(true)

    const toggleMenu = useCallback(
        (menuId) => {
            setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
        },
        [setExpandedMenus]
    )

    const fetchCounts = useCallback(async () => {
        try {
            setLoadingCounts(true)
            let overview = null

            try {
                overview = await adminAPI.dashboard.getOverview()
            } catch (error) {
                console.warn('Failed to fetch overview:', error)
            }

            const [pendingSellers, activeSellers] = await Promise.allSettled([
                adminAPI.sellers.getByStatus.fetch?.('pending', 1, 1),
                adminAPI.sellers.getByStatus.fetch?.('approved', 1, 1)
            ])

            const pendingProducts = await adminAPI.products.getPending({ page: 1, limit: 1 })

            setCounts({
                sellers: {
                    pending: overview?.sellers?.pending ?? getTotal(pendingSellers.value),
                    active: overview?.sellers?.active ?? getTotal(activeSellers.value),
                    payouts: overview?.sellers?.payouts ?? 0
                },
                products: {
                    pending: overview?.products?.pending ?? getTotal(pendingProducts),
                    flagged: overview?.products?.flagged ?? 0,
                    featured: overview?.products?.featured ?? 0
                }
            })
        } catch (error) {
            console.error('Failed to fetch admin counts:', error)
        } finally {
            setLoadingCounts(false)
        }
    }, [])

    useEffect(() => {
        fetchCounts()
        const interval = setInterval(fetchCounts, 30000)
        return () => clearInterval(interval)
    }, [fetchCounts])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Set the CSS variable immediately
            document.documentElement.style.setProperty('--admin-sidebar-width', isCollapsed ? '80px' : '256px')
        }
    }, [isCollapsed])

    // Initialize CSS variable on mount to prevent layout shift
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Initialize with default value if not set
            const currentValue = getComputedStyle(document.documentElement).getPropertyValue('--admin-sidebar-width')
            if (!currentValue) {
                document.documentElement.style.setProperty('--admin-sidebar-width', '256px')
            }
        }
    }, [])

    const navigationItems = useMemo(
        () => [
            {
                id: 'overview',
                label: 'Dashboard',
                icon: LayoutDashboard,
                href: '/admin/dashboard'
            },
            {
                id: 'sellers',
                label: 'Sellers',
                icon: UserCheck,
                badge: counts.sellers.pending + counts.sellers.active || undefined,
                subItems: [
                    {
                        id: 'pending-sellers',
                        label: 'Pending Approval',
                        href: '/admin/sellers/pending',
                        badge: counts.sellers.pending || undefined
                    },
                    {
                        id: 'active-sellers',
                        label: 'Active Sellers',
                        href: '/admin/sellers/active',
                        badge: counts.sellers.active || undefined
                    },
                    {
                        id: 'payouts',
                        label: 'Payouts',
                        href: '/admin/sellers/payouts',
                        badge: counts.sellers.payouts || undefined
                    }
                ]
            },
            {
                id: 'products',
                label: 'Products',
                icon: Package,
                badge: counts.products.pending + counts.products.flagged + counts.products.featured || undefined,
                subItems: [
                    {
                        id: 'pending-products',
                        label: 'Pending Review',
                        href: '/admin/products/pending',
                        badge: counts.products.pending || undefined
                    },
                    {
                        id: 'flagged-products',
                        label: 'Flagged Items',
                        href: '/admin/products/flagged',
                        badge: counts.products.flagged || undefined
                    },
                    {
                        id: 'featured-products',
                        label: 'Featured',
                        href: '/admin/products/featured',
                        badge: counts.products.featured || undefined
                    }
                ]
            },
            { id: 'promocodes', label: 'Promocodes', icon: Tag, href: '/admin/promocodes' },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck, href: '/admin/compliance' },
            { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' }
        ],
        [counts]
    )

    // Logout handler
    const handleLogout = useCallback(async () => {
        try {
            await logoutService.logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }, [])

    // Item click handler for mobile
    const handleItemClick = useCallback(() => {
        if (setSidebarOpen) {
            setSidebarOpen(false)
        }
    }, [setSidebarOpen])

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out flex-col shadow-2xl admin-sidebar-fix ${
                    isCollapsed ? 'w-20' : 'w-64'
                }`}
                style={{ 
                    left: 0,
                    width: isCollapsed ? '80px' : '256px',
                    position: 'fixed',
                    top: 0,
                    bottom: 0
                }}
                aria-label="Admin navigation sidebar">
                {/* Desktop Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed((prev) => !prev)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#00FF89]/30 transition-all duration-300 z-50"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                    {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
                </button>

                {/* Header - Brand section */}
                <div className={`px-6 py-4 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3 py-3' : ''}`}>
                    <div className="flex items-center justify-between">
                        <div className={`space-y-1 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse"></div>
                                <h2 className="text-base font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Admin Panel
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Platform Management</p>
                        </div>

                        {/* Collapsed state logo */}
                        <div className={`items-center justify-center w-full transition-all duration-300 ${isCollapsed ? 'flex' : 'hidden'}`}>
                            <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-[#00FF89] to-[#00FF89]/80 flex items-center justify-center">
                                <span className="text-black font-bold text-xs">A</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Profile */}
                <div className={`px-6 py-3 border-b border-white/5 flex-shrink-0 transition-all duration-300 ${isCollapsed ? 'px-3 py-2' : ''}`}>
                    <div className={`flex items-center gap-3 transition-all duration-300 ${isCollapsed ? 'justify-center gap-0' : ''}`}>
                        <div className="relative">
                            <div
                                className={`rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20 transition-all duration-300 ${
                                    isCollapsed ? 'w-7 h-7' : 'w-9 h-9'
                                }`}>
                                <span
                                    className={`text-black font-bold tracking-tight transition-all duration-300 ${
                                        isCollapsed ? 'text-xs' : 'text-sm'
                                    }`}>
                                    AD
                                </span>
                            </div>
                            <div
                                className={`absolute -bottom-1 -right-1 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center transition-all duration-300 ${
                                    isCollapsed ? 'w-3 h-3' : 'w-3.5 h-3.5'
                                }`}>
                                <div className={`bg-black rounded-full transition-all duration-300 ${isCollapsed ? 'w-1 h-1' : 'w-1.5 h-1.5'}`}></div>
                            </div>
                        </div>
                        <div className={`flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                            <h3 className="text-white font-bold text-sm tracking-tight truncate mb-0.5">Administrator</h3>
                            <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">SUPER ADMIN</p>
                        </div>
                    </div>
                </div>

                {/* Navigation - Desktop */}
                <nav
                    className={`flex-1 min-h-0 overflow-y-auto py-2 space-y-1 transition-all duration-300 custom-scrollbar ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    {navigationItems.map((item) => {
                        const isExpanded = expandedMenus.includes(item.id)
                        const isActive = COMING_SOON.has(item.id)
                            ? false
                            : item.href
                              ? matchPath(currentPath, item.href)
                              : item.subItems?.some((s) => matchPath(currentPath, s.href))

                        return (
                            <NavigationItem
                                key={item.id}
                                item={item}
                                isActive={isActive}
                                isExpanded={isExpanded}
                                onToggle={toggleMenu}
                                onItemClick={handleItemClick}
                                isCollapsed={isCollapsed}
                                loadingCounts={loadingCounts}
                                currentPath={currentPath}
                            />
                        )
                    })}
                </nav>

                {/* Bottom Actions - Desktop */}
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className={`pt-2 pb-1 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        <div
                            className={`bg-gradient-to-r from-[#FFC050]/5 to-transparent rounded-2xl border border-[#FFC050]/10 group hover:border-[#FFC050]/20 transition-all duration-300 ${
                                isCollapsed ? 'p-1.5 flex justify-center' : 'p-2.5'
                            }`}>
                            <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'gap-0' : 'gap-2'}`}>
                                <HelpCircle className="w-4 h-4 text-[#FFC050]/60" />
                                <div className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>
                                    <p className="text-xs font-semibold text-[#FFC050]/80">Admin Support</p>
                                    <p className="text-xs text-white/30">System assistance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`pb-3 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
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
                className={`lg:hidden fixed top-0 left-0 z-60 h-screen w-80 bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out flex flex-col shadow-2xl ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Admin navigation sidebar">
                {/* Mobile Header */}
                <div className="px-6 py-3 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#00FF89] animate-pulse"></div>
                                <h2 className="text-lg font-bold bg-gradient-to-r from-[#00FF89] to-[#00FF89]/80 bg-clip-text text-transparent">
                                    Admin Panel
                                </h2>
                            </div>
                            <p className="text-xs text-white/40 font-light tracking-wide">Platform Management</p>
                        </div>

                        <button
                            onClick={() => setSidebarOpen && setSidebarOpen(false)}
                            className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Mobile Admin Profile */}
                <div className="px-6 py-2 border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#00FF89] via-[#00FF89]/90 to-[#FFC050] flex items-center justify-center shadow-lg shadow-[#00FF89]/20">
                                <span className="text-black font-bold text-xs tracking-tight">AD</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-[#00FF89] rounded-full border-2 border-black flex items-center justify-center">
                                <div className="w-0.5 h-0.5 bg-black rounded-full"></div>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm tracking-tight truncate mb-0.5">Administrator</h3>
                            <p className="text-xs text-[#00FF89]/70 font-medium tracking-wide">SUPER ADMIN</p>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 min-h-0 overflow-y-auto py-2 px-4 space-y-1 custom-scrollbar">
                    {navigationItems.map((item) => {
                        const isExpanded = expandedMenus.includes(item.id)
                        const isActive = COMING_SOON.has(item.id)
                            ? false
                            : item.href
                              ? matchPath(currentPath, item.href)
                              : item.subItems?.some((s) => matchPath(currentPath, s.href))

                        return (
                            <NavigationItem
                                key={item.id}
                                item={item}
                                isActive={isActive}
                                isExpanded={isExpanded}
                                onToggle={toggleMenu}
                                onItemClick={handleItemClick}
                                isCollapsed={false}
                                loadingCounts={loadingCounts}
                                currentPath={currentPath}
                            />
                        )
                    })}
                </nav>

                {/* Mobile Bottom Actions - Always visible */}
                <div className="flex-shrink-0 border-t border-white/5 bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm">
                    <div className="pt-1 pb-1 px-4">
                        <div className="bg-gradient-to-r from-[#FFC050]/5 to-transparent rounded-xl border border-[#FFC050]/10 p-2 group hover:border-[#FFC050]/20 transition-all duration-300">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-3 h-3 text-[#FFC050]/60" />
                                <div>
                                    <p className="text-xs font-semibold text-[#FFC050]/80">Admin Support</p>
                                    <p className="text-xs text-white/30">System assistance</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-2 px-4">
                        <button
                            onClick={handleLogout}
                            className="w-full group flex items-center gap-3 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm tracking-tight transition-all duration-300">
                            <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AdminSidebar)

