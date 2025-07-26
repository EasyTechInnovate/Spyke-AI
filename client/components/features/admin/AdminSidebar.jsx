
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, X, LogOut, UserCheck, ChevronDown, Package, TrendingUp, ShieldCheck, Settings } from 'lucide-react'


export default function AdminSidebar({ sidebarOpen, setSidebarOpen, currentPath }) {
    const router = useRouter()
    const [expandedMenus, setExpandedMenus] = useState(['sellers'])

    const toggleMenu = (menuId) => {
        setExpandedMenus((prev) => (prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]))
    }

    const navigationItems = [
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
            badge: 12,
            subItems: [
                {
                    id: 'pending-sellers',
                    label: 'Pending Approval',
                    href: '/admin/sellers/pending',
                    badge: 8
                },
                {
                    id: 'active-sellers',
                    label: 'Active Sellers',
                    href: '/admin/sellers/active'
                },
                {
                    id: 'payouts',
                    label: 'Payouts',
                    href: '/admin/sellers/payouts'
                }
            ]
        },
        {
            id: 'products',
            label: 'Products',
            icon: Package,
            badge: 23,
            subItems: [
                {
                    id: 'pending-products',
                    label: 'Pending Review',
                    href: '/admin/products/pending',
                    badge: 15
                },
                {
                    id: 'flagged-products',
                    label: 'Flagged Items',
                    href: '/admin/products/flagged',
                    badge: 8
                },
                {
                    id: 'featured-products',
                    label: 'Featured',
                    href: '/admin/products/featured'
                }
            ]
        },
        {
            id: 'analytics',
            label: 'Analytics',
            icon: TrendingUp,
            href: '/admin/analytics'
        },
        {
            id: 'compliance',
            label: 'Compliance',
            icon: ShieldCheck,
            href: '/admin/compliance'
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: Settings,
            href: '/admin/settings'
        }
    ]

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.clear()
            document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
            document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
        router.push('/')
    }

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-72 md:w-64 bg-[#1a1a1a] border-r border-gray-800 transform transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-[#00FF89]">Admin Panel</h2>
                            <p className="text-xs text-gray-500 mt-1">Manage your platform</p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 text-gray-400 hover:text-white rounded-lg lg:hidden">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6">
                    {navigationItems.map((item) => {
                        const Icon = item.icon
                        const isExpanded = expandedMenus.includes(item.id)
                        const isActive = item.href ? currentPath === item.href : item.subItems?.some((sub) => currentPath === sub.href)

                        return (
                            <div
                                key={item.id}
                                className="mb-2">
                                {item.href ? (
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                            isActive ? 'bg-[#00FF89] text-[#121212]' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                    </Link>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => toggleMenu(item.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                                                isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {item.badge && (
                                                    <span className="px-2 py-1 text-xs bg-[#00FF89]/20 text-[#00FF89] rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </button>

                                        {/* Sub Items */}
                                        {isExpanded && (
                                            <div className="mt-2 space-y-1">
                                                {item.subItems.map((subItem) => (
                                                    <Link
                                                        key={subItem.id}
                                                        href={subItem.href}
                                                        onClick={() => setSidebarOpen(false)}
                                                        className={`block pl-12 pr-4 py-2.5 rounded-lg text-sm transition-colors ${
                                                            currentPath === subItem.href
                                                                ? 'text-[#00FF89]'
                                                                : 'text-gray-500 hover:text-white hover:bg-gray-800'
                                                        }`}>
                                                        <div className="flex items-center justify-between">
                                                            <span>{subItem.label}</span>
                                                            {subItem.badge && (
                                                                <span className="px-2 py-0.5 text-xs bg-[#00FF89]/20 text-[#00FF89] rounded-full">
                                                                    {subItem.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
