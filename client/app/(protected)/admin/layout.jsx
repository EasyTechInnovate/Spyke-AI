'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/features/admin/AdminSidebar'
import AdminHeader from '@/components/features/admin/AdminHeader'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Mobile-first responsive layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Component */}
        <AdminSidebar
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          currentPath={pathname}
        />

        {/* Mobile overlay for sidebar */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area - No margin, sidebar is fixed overlay */}
        <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-[var(--admin-sidebar-width,256px)] lg:transition-all lg:duration-300 lg:ease-out">
          {/* Mobile Header/Nav Bar */}
          <div className="lg:hidden bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open admin menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-lg font-semibold text-white truncate ml-3">
              Admin Panel
            </h1>
            
            <div className="w-10 h-10" /> {/* Spacer for centering */}
          </div>

          {/* Desktop Header Component */}
          <div className="hidden lg:block">
            <AdminHeader
              setSidebarOpen={setSidebarOpen}
              currentPath={pathname}
            />
          </div>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-[#121212]">
            <div className="p-4 lg:p-6 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}