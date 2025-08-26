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
        <div className="min-h-screen bg-[#121212] relative">
            {/* Sidebar with absolute positioning isolation */}
            <div className="absolute inset-y-0 left-0 z-50">
                <SellerSidebar 
                    currentPath={currentPath} 
                    sellerName={sellerName}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
            </div>
            
            {/* Main Content with dynamic spacing based on sidebar state */}
            <div 
                className={`min-h-screen flex flex-col transition-all duration-500 ease-out ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}
            >
                <main className="flex-1 p-3 sm:p-4 md:p-6 relative z-10 transition-all duration-300">
                    <div className="max-w-full overflow-hidden">
                        {children}
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="bg-black/50 text-white border-t border-white/10 mt-auto backdrop-blur-sm">
                    <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6">
                        <div className="max-w-6xl mx-auto text-center">
                            <p className="text-sm text-white/40 font-light">
                                © {new Date().getFullYear()} Spyke AI. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}