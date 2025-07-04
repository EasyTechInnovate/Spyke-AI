'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Shield, X, LogOut, UserCheck, 
  ChevronDown, ChevronRight
} from 'lucide-react'

export default function AdminSidebar({ sidebarOpen, setSidebarOpen, currentPath }) {
  const router = useRouter()
  const [expandedMenus, setExpandedMenus] = useState(['sellers']) // Keep sellers expanded by default

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  const navigationItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      badge: null 
    },
    { 
      id: 'sellers', 
      label: 'Seller Management', 
      icon: UserCheck,
      badge: '12',
      subItems: [
        { id: 'pending-sellers', label: 'Pending Approval', href: '/admin/sellers/pending' },
        { id: 'active-sellers', label: 'Active Sellers', href: '/admin/sellers/active' },
        { id: 'payouts', label: 'Payout Tracking', href: '/admin/sellers/payouts' },
      ]
    },
    { 
      id: 'products', 
      label: 'Product Moderation', 
      icon: Shield,
      badge: '23',
      subItems: [
        { id: 'pending-products', label: 'Pending Review', href: '/admin/products/pending' },
        { id: 'flagged-products', label: 'Flagged Items', href: '/admin/products/flagged' },
        { id: 'featured-products', label: 'Featured Products', href: '/admin/products/featured' },
      ]
    },
    // Add other menu items as needed...
  ]

  const handleLogout = () => {
    // Call your logout function
    localStorage.clear()
    document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'roles=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    router.push('/signin')
  }

  return (
    <aside 
      className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#1f1f1f] border-r border-[#00FF89]/10 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-[#00FF89]/10">
        <h2 className="text-xl font-bold font-league-spartan text-[#00FF89]">
          SpykeAI Admin
        </h2>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedMenus.includes(item.id)
          const isActive = item.href ? currentPath === item.href : 
            item.subItems?.some(sub => currentPath === sub.href)
          
          return (
            <div key={item.id}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all font-kumbh-sans ${
                    isActive
                      ? 'bg-[#00FF89]/20 text-[#00FF89]'
                      : 'text-gray-400 hover:bg-[#00FF89]/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      item.badge === 'New' 
                        ? 'bg-[#00FF89] text-[#121212]' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ) : (
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all font-kumbh-sans ${
                    isActive
                      ? 'bg-[#00FF89]/20 text-[#00FF89]'
                      : 'text-gray-400 hover:bg-[#00FF89]/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        item.badge === 'New' 
                          ? 'bg-[#00FF89] text-[#121212]' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                </button>
              )}
              
              {/* Sub Items */}
              {item.subItems && isExpanded && (
                <div className="ml-12 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.id}
                      href={subItem.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-all font-kumbh-sans ${
                        currentPath === subItem.href
                          ? 'bg-[#00FF89]/10 text-[#00FF89]'
                          : 'text-gray-400 hover:bg-[#00FF89]/5 hover:text-white'
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#00FF89]/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-kumbh-sans text-gray-400 hover:bg-[#00FF89]/5 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}