'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, X, LogOut, UserCheck, ChevronDown, Package, TrendingUp, ShieldCheck, Settings, Tag, Pin, PinOff } from 'lucide-react'
import { logoutService } from '@/lib/services/logout'
import adminAPI from '@/lib/api/admin' // or: import { adminAPI } from '@/lib/api/admin'

/* ===== Theme ===== */
const BRAND = {
    bg: '#121212',
    card: '#1a1a1a',
    card2: '#1f1f1f',
    border: '#2b2b2b',
    textDim: '#9ca3af',
    neon: '#00FF89'
}

/* ===== Helpers ===== */
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
function useMeasuredHeight(open) {
    const ref = useRef(null)
    const [h, setH] = useState(0)
    useEffect(() => {
        if (ref.current) setH(ref.current.scrollHeight)
    }, [open])
    return { ref, h }
}
const getTotal = (res) => res?.meta?.total ?? res?.pagination?.total ?? res?.total ?? res?.data?.total ?? 0

/* ===== Coming Soon set ===== */
const COMING_SOON = new Set(['analytics', 'compliance', 'settings'])

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, currentPath }) {
    /* persisted UI state */
    const [expandedMenus, setExpandedMenus] = useState(() => {
        if (typeof window === 'undefined') return ['sellers', 'products']
        try {
            return JSON.parse(localStorage.getItem('admin_expanded_menus')) || ['sellers', 'products']
        } catch {
            return ['sellers', 'products']
        }
    })
    const [pinned, setPinned] = useState(() => {
        if (typeof window === 'undefined') return true
        try {
            const v = localStorage.getItem('admin_sidebar_pinned')
            return v ? JSON.parse(v) : true
        } catch {
            return true
        }
    })
    useEffect(() => {
        try {
            localStorage.setItem('admin_expanded_menus', JSON.stringify(expandedMenus))
        } catch {}
    }, [expandedMenus])
    useEffect(() => {
        try {
            localStorage.setItem('admin_sidebar_pinned', JSON.stringify(pinned))
        } catch {}
    }, [pinned])

    const toggleMenu = (menuId) => setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))

    /* live counts (optional; uses your adminAPI) */
    const [counts, setCounts] = useState({
        sellers: { pending: 0, active: 0, payouts: 0 },
        products: { pending: 0, flagged: 0, featured: 0 }
    })
    const [loadingCounts, setLoadingCounts] = useState(true)

    const fetchCounts = async () => {
        try {
            setLoadingCounts(true)
            let overview = null
            try {
                overview = await adminAPI.dashboard.getOverview()
            } catch {}

            const [pendingSellers, activeSellers] = await Promise.all([
                adminAPI.sellers.getByStatus.fetch?.('pending', 1, 1),
                adminAPI.sellers.getByStatus.fetch?.('approved', 1, 1) // adjust if your API uses 'active'
            ])
            const pendingProducts = await adminAPI.products.getPending({ page: 1, limit: 1 })

            setCounts({
                sellers: {
                    pending: overview?.sellers?.pending ?? getTotal(pendingSellers),
                    active: overview?.sellers?.active ?? getTotal(activeSellers),
                    payouts: overview?.sellers?.payouts ?? 0
                },
                products: {
                    pending: overview?.products?.pending ?? getTotal(pendingProducts),
                    flagged: overview?.products?.flagged ?? 0,
                    featured: overview?.products?.featured ?? 0
                }
            })
        } catch (e) {
            console.error('Failed to fetch admin counts', e)
        } finally {
            setLoadingCounts(false)
        }
    }

    useEffect(() => {
        fetchCounts()
        const id = setInterval(fetchCounts, 60000)
        return () => clearInterval(id)
    }, [])

    /* Build nav */
    const navigationItems = useMemo(
        () => [
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
            {
                id: 'sellers',
                label: 'Sellers',
                icon: UserCheck,
                badge: counts.sellers.pending + counts.sellers.active || undefined,
                subItems: [
                    { id: 'pending-sellers', label: 'Pending Approval', href: '/admin/sellers/pending', badge: counts.sellers.pending || undefined },
                    { id: 'active-sellers', label: 'Active Sellers', href: '/admin/sellers/active', badge: counts.sellers.active || undefined },
                    { id: 'payouts', label: 'Payouts', href: '/admin/sellers/payouts', badge: counts.sellers.payouts || undefined }
                ]
            },
            {
                id: 'products',
                label: 'Products',
                icon: Package,
                badge: counts.products.pending + counts.products.flagged + counts.products.featured || undefined,
                subItems: [
                    { id: 'pending-products', label: 'Pending Review', href: '/admin/products/pending', badge: counts.products.pending || undefined },
                    { id: 'flagged-products', label: 'Flagged Items', href: '/admin/products/flagged', badge: counts.products.flagged || undefined },
                    { id: 'featured-products', label: 'Featured', href: '/admin/products/featured', badge: counts.products.featured || undefined }
                ]
            },
            { id: 'promocodes', label: 'Promocodes', icon: Tag, href: '/admin/promocodes' },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/admin/analytics' },
            { id: 'compliance', label: 'Compliance', icon: ShieldCheck, href: '/admin/compliance' },
            { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' }
        ],
        [counts]
    )

    const handleLogout = async () => {
        await logoutService.logout()
    }

    /* UI bits */
    const W_FULL = 'w-72 md:w-64'
    const W_MINI = 'w-[4.25rem]'
    const ItemShell = ({ active, children }) => (
        <div className={`group relative rounded-xl border border-transparent transition-colors ${active ? '' : 'hover:bg-[#232323]'}`}>
            <span
                aria-hidden
                className={`absolute left-0 top-1/2 -translate-y-1/2 h-6 rounded-r-full transition-all ${active ? 'w-1 bg-[#00FF89]' : 'w-0'}`}
            />
            {children}
        </div>
    )
    const Badge = ({ children }) => (
        <span
            className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: 'rgba(0,255,137,0.15)', color: BRAND.neon }}>
            {loadingCounts ? '—' : children}
        </span>
    )
    const SoonPill = () => (
        <span
            className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: 'rgba(0,255,137,0.12)', color: BRAND.neon }}>
            Soon
        </span>
    )

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setSidebarOpen(false)}
            />

            <aside
                className={`fixed top-0 left-0 z-50 h-dvh border-r transition-[transform,width] duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                style={{ backgroundColor: BRAND.card, borderColor: BRAND.border }}>
                <div className={`flex h-full flex-col ${pinned ? W_FULL : W_MINI} lg:${pinned ? W_FULL : W_MINI} transition-[width] duration-300`}>
                    {/* Header */}
                    <div
                        className="flex items-center justify-between gap-2 border-b px-3 py-3"
                        style={{ borderColor: BRAND.border, backgroundColor: BRAND.card2 }}>
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div
                                className="h-8 w-8 shrink-0 rounded-lg"
                                style={{ background: `linear-gradient(135deg, ${BRAND.neon}, #40fca7)` }}
                            />
                            <div className={`min-w-0 ${pinned ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
                                <h2
                                    className="truncate text-sm font-bold"
                                    style={{ color: BRAND.neon }}>
                                    Admin Panel
                                </h2>
                                <p
                                    className="truncate text-[11px]"
                                    style={{ color: BRAND.textDim }}>
                                    Manage your platform
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPinned((v) => !v)}
                                className="hidden lg:inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-white hover:bg-[#262626]"
                                title={pinned ? 'Collapse sidebar' : 'Expand sidebar'}
                                aria-label={pinned ? 'Collapse sidebar' : 'Expand sidebar'}>
                                {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="inline-flex lg:hidden items-center justify-center rounded-lg p-2 text-gray-400 hover:text-white hover:bg-[#262626]"
                                aria-label="Close sidebar">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-2 py-4">
                        {navigationItems.map((item) => {
                            const Icon = item.icon
                            const isGroup = !!item.subItems
                            const isExpanded = expandedMenus.includes(item.id)
                            const disabled = COMING_SOON.has(item.id)
                            const isActive = disabled
                                ? false
                                : item.href
                                  ? matchPath(currentPath, item.href)
                                  : item.subItems?.some((s) => matchPath(currentPath, s.href))
                            const { ref, h } = useMeasuredHeight(isExpanded)

                            return (
                                <div
                                    key={item.id}
                                    className="mb-1.5">
                                    {/* Single link item OR disabled placeholder */}
                                    {!isGroup ? (
                                        <ItemShell active={isActive}>
                                            {disabled ? (
                                                <div
                                                    role="button"
                                                    aria-disabled="true"
                                                    title="Coming soon"
                                                    className="flex items-center rounded-xl px-3 py-2.5 cursor-not-allowed opacity-60"
                                                    style={{ color: '#e5e7eb', backgroundColor: 'transparent' }}>
                                                    <Icon className="mr-3 h-5 w-5 shrink-0" />
                                                    <div className={`${pinned ? 'block' : 'hidden'} min-w-0 flex-1`}>
                                                        <span className="truncate text-white">{item.label}</span>
                                                        <SoonPill />
                                                    </div>
                                                </div>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className="flex items-center rounded-xl px-3 py-2.5 focus:outline-none"
                                                    style={{
                                                        color: isActive ? '#121212' : '#e5e7eb',
                                                        backgroundColor: isActive ? BRAND.neon : 'transparent'
                                                    }}>
                                                    <Icon className="mr-3 h-5 w-5 shrink-0" />
                                                    <div className={`${pinned ? 'block' : 'hidden'} min-w-0 flex-1`}>
                                                        <span className="truncate text-white">{item.label}</span>
                                                    </div>
                                                </Link>
                                            )}
                                        </ItemShell>
                                    ) : (
                                        /* Group (accordion) */
                                        <div className="rounded-xl">
                                            <button
                                                onClick={() => toggleMenu(item.id)}
                                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMenu(item.id)}
                                                aria-expanded={isExpanded}
                                                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition-colors focus:outline-none"
                                                style={{ color: '#e5e7eb', backgroundColor: 'transparent' }}>
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <Icon className="h-5 w-5 shrink-0" />
                                                    <span className={`${pinned ? 'block' : 'hidden'} truncate text-white`}>
                                                        {item.label}
                                                        {item.badge ? (
                                                            <span
                                                                className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                                style={{ backgroundColor: 'rgba(0,255,137,0.15)', color: BRAND.neon }}>
                                                                {loadingCounts ? '—' : item.badge}
                                                            </span>
                                                        ) : null}
                                                    </span>
                                                </div>
                                                {pinned && (
                                                    <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                )}
                                            </button>

                                            <div
                                                className={`overflow-hidden transition-[max-height,opacity] duration-300 ${pinned ? 'opacity-100' : 'opacity-0'}`}
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
                                                                onClick={() => setSidebarOpen(false)}
                                                                className="block rounded-lg pl-11 pr-3 py-2 text-sm transition-colors"
                                                                style={{
                                                                    color: activeSub ? BRAND.neon : BRAND.textDim,
                                                                    backgroundColor: activeSub ? 'rgba(0,255,137,0.08)' : 'transparent'
                                                                }}>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="truncate">{sub.label}</span>
                                                                    {typeof sub.badge === 'number' ? (
                                                                        <span
                                                                            className="ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                                                            style={{ backgroundColor: 'rgba(0,255,137,0.15)', color: BRAND.neon }}>
                                                                            {loadingCounts ? '—' : sub.badge}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            </Link>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </nav>

                    {/* Footer */}
                    <div
                        className="border-t px-2 py-3"
                        style={{ borderColor: BRAND.border, backgroundColor: BRAND.card2 }}>
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-300 hover:text-white hover:bg-[#262626] transition-colors"
                            aria-label="Logout">
                            <LogOut className="h-5 w-5" />
                            <span className={`${pinned ? 'inline' : 'hidden'}`}>Logout</span>
                        </button>
                        <div
                            className={`mt-2 text-[10px] ${pinned ? 'block' : 'hidden'}`}
                            style={{ color: BRAND.textDim }}>
                            v1.0 · admin
                        </div>
                    </div>
                </div>
            </aside>
        </>
    )
}

