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
            
            // Force hide any global headers that might leak through
            const hideGlobalHeaders = () => {
                const headers = document.querySelectorAll('.sticky-header-wrapper, header[class*="sticky"], [class*="header"]')
                headers.forEach(header => {
                    if (header && !header.closest('[data-seller-layout]')) {
                        header.style.display = 'none !important'
                        header.style.visibility = 'hidden !important'
                        header.style.opacity = '0 !important'
                        header.style.zIndex = '-1 !important'
                    }
                })
            }
            
            // Run immediately and also on DOM changes
            hideGlobalHeaders()
            const observer = new MutationObserver(hideGlobalHeaders)
            observer.observe(document.body, { childList: true, subtree: true })
            
            return () => observer.disconnect()
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
        <>
            {/* Global CSS to hide any headers that leak through */}
            <style jsx global>{`
                body:has([data-seller-layout]) .sticky-header-wrapper,
                body:has([data-seller-layout]) header[class*="sticky"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    z-index: -1 !important;
                }
            `}</style>
            
            <div className="min-h-screen bg-[#121212]" data-seller-layout>
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
                <div className={`min-h-screen transition-all duration-300 ${
                    isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                }`}>
                    {/* Scrollable Content */}
                    <main className="min-h-screen overflow-x-hidden">
                        <div className="p-4 lg:p-6 w-full max-w-full">
                            {children}
                        </div>
                    </main>
                    
                    {/* Footer */}
                    <footer className="bg-black/30 border-t border-white/5 px-4 lg:p-6 py-4">
                        <div className="text-center">
                            <p className="text-xs text-white/40">
                                © {new Date().getFullYear()} Spyke AI. All rights reserved.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    )
}