'use client'
import { usePathname } from 'next/navigation'
import { AdminProvider } from '@/providers/AdminProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAdminNavigation } from '@/components/admin/hooks/useAdminNavigation'
const MobileHeader = ({ onOpenSidebar }) => (
  <div className="lg:hidden bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
    <button
      onClick={onOpenSidebar}
      className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      aria-label="Open admin menu">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
    <h1 className="text-lg font-semibold text-white truncate ml-3">
      Admin Panel
    </h1>
    <div className="w-10 h-10" /> 
  </div>
)
const AdminLayoutInner = ({ children }) => {
  const pathname = usePathname()
  const { openSidebar } = useAdminNavigation(pathname)
  return (
    <div className="min-h-screen bg-[#121212]">
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar currentPath={pathname} />
        <div className="flex-1 flex flex-col min-w-0 w-full lg:pl-[var(--admin-sidebar-width,256px)] lg:transition-all lg:duration-300 lg:ease-out">
          <MobileHeader onOpenSidebar={openSidebar} />
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
export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminLayoutInner>
        {children}
      </AdminLayoutInner>
    </AdminProvider>
  )
}