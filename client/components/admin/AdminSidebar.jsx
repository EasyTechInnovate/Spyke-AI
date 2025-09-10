'use client'

import { useMemo, useCallback } from 'react'
import { X, LogOut, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { logoutService } from '@/lib/services/logout'
import { useAdmin } from '@/providers/AdminProvider'
import { useAdminNavigation } from './hooks/useAdminNavigation'
import { NavigationSection } from './navigation/NavigationComponents'
import { createNavigationItems, COMING_SOON } from './navigation/navigationConfig'

// Admin Profile Component
const AdminProfile = ({ isCollapsed }) => (
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
)

// Header Brand Component
const HeaderBrand = ({ isCollapsed }) => (
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
)

// Bottom Actions Component
const BottomActions = ({ isCollapsed, onLogout }) => (
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
        onClick={onLogout}
        className={`w-full group flex items-center text-white/60 hover:text-white hover:bg-white/5 rounded-2xl font-medium text-sm tracking-tight transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2 py-2' : 'gap-3 px-4 py-3'
        }`}
        title={isCollapsed ? 'Sign Out' : undefined}>
        <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
        <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : ''}`}>Sign Out</span>
      </button>
    </div>
  </div>
)

// Mobile Header Component
const MobileHeader = ({ onClose }) => (
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
        onClick={onClose}
        className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200">
        <X className="w-5 h-5" />
      </button>
    </div>
  </div>
)

// Main AdminSidebar Component
const AdminSidebar = ({ currentPath }) => {
  const { counts, loading } = useAdmin()
  const navigation = useAdminNavigation(currentPath)
  
  // Create navigation items with current counts
  const navigationItems = useMemo(() => 
    createNavigationItems(counts), 
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

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300 ${
          navigation.sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={navigation.closeSidebar}
      />

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex fixed top-0 left-0 z-40 h-screen bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-out flex-col shadow-2xl admin-sidebar-fix ${
          navigation.isCollapsed ? 'w-20' : 'w-64'
        }`}
        style={{ 
          left: 0,
          width: navigation.isCollapsed ? '80px' : '256px',
          position: 'fixed',
          top: 0,
          bottom: 0
        }}
        aria-label="Admin navigation sidebar">
        
        {/* Desktop Collapse Toggle Button */}
        <button
          onClick={navigation.toggleCollapse}
          className="absolute -right-3 top-8 w-6 h-6 bg-black border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:border-[#00FF89]/30 transition-all duration-300 z-50"
          aria-label={navigation.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {navigation.isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <HeaderBrand isCollapsed={navigation.isCollapsed} />
        <AdminProfile isCollapsed={navigation.isCollapsed} />
        
        <NavigationSection
          items={navigationItems}
          expandedMenus={navigation.expandedMenus}
          onToggle={navigation.toggleMenu}
          onItemClick={navigation.handleItemClick}
          isCollapsed={navigation.isCollapsed}
          loadingCounts={loading.counts}
          currentPath={currentPath}
          comingSoonItems={COMING_SOON}
        />
        
        <BottomActions 
          isCollapsed={navigation.isCollapsed} 
          onLogout={handleLogout} 
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 left-0 z-60 h-screen w-80 bg-gradient-to-b from-black/95 to-black/98 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 ease-out flex flex-col shadow-2xl ${
          navigation.sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Admin navigation sidebar">
        
        <MobileHeader onClose={navigation.closeSidebar} />
        <AdminProfile isCollapsed={false} />
        
        <NavigationSection
          items={navigationItems}
          expandedMenus={navigation.expandedMenus}
          onToggle={navigation.toggleMenu}
          onItemClick={navigation.handleItemClick}
          isCollapsed={false}
          loadingCounts={loading.counts}
          currentPath={currentPath}
          comingSoonItems={COMING_SOON}
        />
        
        <BottomActions 
          isCollapsed={false} 
          onLogout={handleLogout} 
        />
      </aside>
    </>
  )
}

export default AdminSidebar