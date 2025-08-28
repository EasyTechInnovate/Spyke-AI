'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SellerSidebar from '@/components/features/seller/SellerSidebar'

export default function SellerLayout({ children }) {
    const pathname = usePathname()
    const [sellerName, setSellerName] = useState('')
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const sellerProfile = JSON.parse(localStorage.getItem('sellerProfile') || '{}')
            setSellerName(sellerProfile.fullName || sellerProfile.storeName || user.name || '')
            
            // Get saved sidebar state - default to false if not set
            const savedCollapsedState = localStorage.getItem('sidebarCollapsed')
            if (savedCollapsedState !== null) {
                setIsCollapsed(JSON.parse(savedCollapsedState))
            }
            
            // Mark as hydrated to prevent layout shift
            setIsHydrated(true)
        }
    }, [])

    // Save collapsed state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined' && isHydrated) {
            localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
        }
    }, [isCollapsed, isHydrated])

    // Extract the current path relative to /seller
    const currentPath = pathname.replace('/seller', '') || '/profile'

    // Prevent layout shift during hydration
    if (!isHydrated) {
        return (
            <div className="min-h-screen bg-[#121212] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-600 border-t-[#00FF89] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#121212]">
            {/* Mobile-first responsive layout */}
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar - Mobile slide-in overlay, Desktop fixed */}
                <SellerSidebar 
                    currentPath={currentPath} 
                    sellerName={sellerName}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
                
                {/* Mobile overlay for sidebar */}
                {sidebarOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                
                {/* Main Content Area */}
                <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}>
                    {/* Mobile Header/Nav Bar */}
                    <div className="lg:hidden bg-[#1a1a1a] border-b border-white/10 px-4 py-3 flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        
                        <h1 className="text-lg font-semibold text-white truncate ml-3">
                            {sellerName || 'Seller Dashboard'}
                        </h1>
                        
                        <div className="w-10 h-10" /> {/* Spacer for centering */}
                    </div>
                    
                    {/* Scrollable Content */}
                    <main className="flex-1 overflow-y-auto">
                        <div className="p-4 lg:p-6 max-w-full">
                            {children}
                        </div>
                    </main>
                    
                    {/* Footer */}
                    <footer className="bg-black/30 border-t border-white/5 px-4 lg:px-6 py-4 flex-shrink-0">
                        <div className="text-center">
                            <p className="text-xs text-white/40">
                                © {new Date().getFullYear()} Spyke AI. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}