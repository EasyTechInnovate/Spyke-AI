'use client'

import { useEffect, useMemo, useRef, useState, useCallback, memo } from 'react'
import Link from 'next/link'
import { LayoutDashboard, X, LogOut, UserCheck, ChevronDown, Package, TrendingUp, ShieldCheck, Settings, Tag, Pin, PinOff } from 'lucide-react'
import { logoutService } from '@/lib/services/logout'
import adminAPI from '@/lib/api/admin'
import { DESIGN_TOKENS } from '@/lib/design-system/tokens'
import { DSBadge, DSLoadingState } from '@/lib/design-system'

// Design System Theme Constants
const SIDEBAR_TOKENS = {
    background: {
        main: DESIGN_TOKENS.colors.background.card.dark,
        elevated: DESIGN_TOKENS.colors.background.elevated,
        subtle: DESIGN_TOKENS.colors.background.subtle
    },
    text: {
        primary: DESIGN_TOKENS.colors.text.inverse,
        secondary: DESIGN_TOKENS.colors.text.subtle,
        muted: DESIGN_TOKENS.colors.text.muted,
        active: DESIGN_TOKENS.colors.brand.primaryText
    },
    border: {
        default: '#2b2b2b',
        focus: DESIGN_TOKENS.colors.brand.primary
    },
    brand: {
        primary: DESIGN_TOKENS.colors.brand.primary,
        gradient: `linear-gradient(135deg, ${DESIGN_TOKENS.colors.brand.primary}, #40fca7)`
    },
    animation: {
        duration: DESIGN_TOKENS.animation.duration.normal,
        easing: DESIGN_TOKENS.animation.easing.easeOut
    },
    spacing: {
        sidebar: {
            full: 'w-72 md:w-64',
            mini: 'w-[4.25rem]'
        }
    }
}

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
        <DSBadge
            variant="primary"
            size="small"
            className="ml-2">
            {loading ? (
                <DSLoadingState
                    type="spinner"
                    width="12px"
                    height="12px"
                />
            ) : (
                count
            )}
        </DSBadge>
    )
})
LoadingBadge.displayName = 'LoadingBadge'

// Navigation Item Component
const NavigationItem = memo(({ item, isActive, isExpanded, onToggle, onItemClick, pinned, loadingCounts, currentPath }) => {
    const Icon = item.icon
    const isGroup = !!item.subItems
    const disabled = COMING_SOON.has(item.id)
    const { ref, h } = useMeasuredHeight(isExpanded)

    const ItemShell = ({ active, children }) => (
        <div
            className={`group relative rounded-xl border border-transparent transition-all duration-${SIDEBAR_TOKENS.animation.duration} ${
                active ? '' : 'hover:bg-[#232323]'
            }`}>
            <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 rounded-r-full transition-all duration-${SIDEBAR_TOKENS.animation.duration} ${
                    active ? 'w-1' : 'w-0'
                }`}
                style={{ backgroundColor: active ? SIDEBAR_TOKENS.brand.primary : 'transparent' }}
            />
            {children}
        </div>
    )

    const SoonPill = () => (
        <span
            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
                backgroundColor: `${SIDEBAR_TOKENS.brand.primary}1F`,
                color: SIDEBAR_TOKENS.brand.primary
            }}>
            Soon
        </span>
    )

    if (!isGroup) {
        return (
            <div
                className="mb-1.5"
                key={item.id}>
                <ItemShell active={isActive}>
                    {disabled ? (
                        <div
                            role="button"
                            aria-disabled="true"
                            title="Coming soon"
                            className="flex items-center rounded-xl px-3 py-2.5 cursor-not-allowed opacity-60"
                            style={{ color: SIDEBAR_TOKENS.text.secondary }}>
                            <Icon className="mr-3 h-5 w-5 shrink-0" />
                            <div className={`${pinned ? 'block' : 'hidden'} min-w-0 flex-1`}>
                                <span
                                    className="truncate"
                                    style={{ color: SIDEBAR_TOKENS.text.primary }}>
                                    {item.label}
                                </span>
                                <SoonPill />
                            </div>
                        </div>
                    ) : (
                        <Link
                            href={item.href}
                            onClick={onItemClick}
                            className="flex items-center rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                            style={{
                                color: isActive ? SIDEBAR_TOKENS.text.active : SIDEBAR_TOKENS.text.secondary,
                                backgroundColor: isActive ? SIDEBAR_TOKENS.brand.primary : 'transparent',
                                focusRingColor: SIDEBAR_TOKENS.border.focus
                            }}>
                            <Icon className="mr-3 h-5 w-5 shrink-0" />
                            <div className={`${pinned ? 'block' : 'hidden'} min-w-0 flex-1`}>
                                <span
                                    className="truncate"
                                    style={{ color: isActive ? SIDEBAR_TOKENS.text.active : SIDEBAR_TOKENS.text.primary }}>
                                    {item.label}
                                </span>
                                <LoadingBadge
                                    count={item.badge}
                                    loading={loadingCounts}
                                />
                            </div>
                        </Link>
                    )}
                </ItemShell>
            </div>
        )
    }

    return (
        <div
            className="mb-1.5"
            key={item.id}>
            <div className="rounded-xl">
                <button
                    onClick={() => onToggle(item.id)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle(item.id)}
                    aria-expanded={isExpanded}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{
                        color: SIDEBAR_TOKENS.text.secondary,
                        focusRingColor: SIDEBAR_TOKENS.border.focus
                    }}>
                    <div className="flex min-w-0 items-center gap-3">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span
                            className={`${pinned ? 'block' : 'hidden'} truncate`}
                            style={{ color: SIDEBAR_TOKENS.text.primary }}>
                            {item.label}
                            <LoadingBadge
                                count={item.badge}
                                loading={loadingCounts}
                            />
                        </span>
                    </div>
                    {pinned && (
                        <ChevronDown
                            className={`h-4 w-4 transition-transform duration-${SIDEBAR_TOKENS.animation.duration} ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    )}
                </button>

                <div
                    className={`overflow-hidden transition-all duration-${SIDEBAR_TOKENS.animation.duration} ${pinned ? 'opacity-100' : 'opacity-0'}`}
                    style={{ maxHeight: pinned && isExpanded ? h : 0 }}>
                    <div
                        ref={ref}
                        className="pb-1">
                        {item.subItems.map((sub) => {
                            const activeSub = matchPath(currentPath, sub.href)
                            return (
                                <Link
                                    key={sub.id}
                                    href={sub.href}
                                    onClick={onItemClick}
                                    className="block rounded-lg pl-11 pr-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50"
                                    style={{
                                        color: activeSub ? SIDEBAR_TOKENS.brand.primary : SIDEBAR_TOKENS.text.muted,
                                        backgroundColor: activeSub ? `${SIDEBAR_TOKENS.brand.primary}14` : 'transparent',
                                        focusRingColor: SIDEBAR_TOKENS.border.focus
                                    }}>
                                    <div className="flex items-center justify-between">
                                        <span className="truncate">{sub.label}</span>
                                        <LoadingBadge
                                            count={sub.badge}
                                            loading={loadingCounts}
                                        />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
})
NavigationItem.displayName = 'NavigationItem'

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, currentPath }) => {
    const [expandedMenus, setExpandedMenus] = usePersistedState('admin_expanded_menus_v2', [])
    const [pinned, setPinned] = usePersistedState('admin_sidebar_pinned', true)

    useEffect(() => {
        try {
            localStorage.removeItem('admin_expanded_menus')
        } catch (error) {
            console.warn('Failed to clear old localStorage key:', error)
        }
    }, [])

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
                className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-${SIDEBAR_TOKENS.animation.duration} ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                className={`fixed top-0 left-0 z-50 h-dvh border-r transition-[transform,width] duration-${SIDEBAR_TOKENS.animation.duration} ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}
                style={{
                    backgroundColor: SIDEBAR_TOKENS.background.main,
                    borderColor: SIDEBAR_TOKENS.border.default
                }}>
                <div
                    className={`flex h-full flex-col ${pinned ? SIDEBAR_TOKENS.spacing.sidebar.full : SIDEBAR_TOKENS.spacing.sidebar.mini} lg:${pinned ? SIDEBAR_TOKENS.spacing.sidebar.full : SIDEBAR_TOKENS.spacing.sidebar.mini} transition-[width] duration-${SIDEBAR_TOKENS.animation.duration}`}>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between gap-2 border-b px-3 py-3"
                        style={{
                            borderColor: SIDEBAR_TOKENS.border.default,
                            backgroundColor: SIDEBAR_TOKENS.background.elevated
                        }}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div
                                className="h-8 w-8 shrink-0 rounded-lg"
                                style={{ background: SIDEBAR_TOKENS.brand.gradient }}
                            />
                            <div className={`min-w-0 ${pinned ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
                                <h2
                                    className="truncate text-sm font-bold"
                                    style={{ color: SIDEBAR_TOKENS.brand.primary }}>
                                    Admin Panel
                                </h2>
                                <p
                                    className="truncate text-[11px]"
                                    style={{ color: SIDEBAR_TOKENS.text.muted }}>
                                    Manage your platform
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPinned((v) => !v)}
                                className="hidden lg:inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-white hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                                title={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
                                aria-label={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
                                style={{ focusRingColor: SIDEBAR_TOKENS.border.focus }}>
                                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-gray-400 hover:text-white hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                                aria-label="Close sidebar"
                                style={{ focusRingColor: SIDEBAR_TOKENS.border.focus }}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
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
                                    pinned={pinned}
                                    loadingCounts={loadingCounts}
                                    currentPath={currentPath}
                                />
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div
                        className="border-t px-2 py-3"
                        style={{
                            borderColor: SIDEBAR_TOKENS.border.default,
                            backgroundColor: SIDEBAR_TOKENS.background.elevated
                        }}>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-300 hover:text-white hover:bg-[#262626] focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors"
                            aria-label="Logout"
                            style={{ focusRingColor: SIDEBAR_TOKENS.border.focus }}>
                            <LogOut className="h-5 w-5" />
                            <span className={`${pinned ? 'inline' : 'hidden'}`}>Logout</span>
                        </button>
                        <div
                            className={`mt-2 text-[10px] ${pinned ? 'block' : 'hidden'}`}
                            style={{ color: SIDEBAR_TOKENS.text.muted }}>
                            v1.0 · admin
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

// Memoize the component to prevent unnecessary re-renders
export default memo(AdminSidebar)

