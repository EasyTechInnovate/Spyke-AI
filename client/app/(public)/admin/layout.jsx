'use client'

export const dynamic = 'force-dynamic';

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from '@/components/features/admin/AdminSidebar'
import AdminHeader from '@/components/features/admin/AdminHeader'


export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Sidebar Component */}
      <AdminSidebar
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentPath={pathname}
      />

      {/* Main Content - Only apply margin on desktop */}
      <div className="min-h-screen lg:transition-all lg:duration-300 lg:ease-out lg:ml-[var(--admin-sidebar-width,256px)]">
        {/* Header Component */}
        <AdminHeader
          setSidebarOpen={setSidebarOpen}
          currentPath={pathname}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}