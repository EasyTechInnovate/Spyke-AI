'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import SellerSidebar from '@/components/features/seller/SellerSidebar'

export default function SellerLayout({ children }) {
    const pathname = usePathname()
    const [sellerName, setSellerName] = useState('')

    useEffect(() => {
        // Get seller name from localStorage
        if (typeof window !== 'undefined') {
            const user = JSON.parse(localStorage.getItem('user') || '{}')
            const sellerProfile = JSON.parse(localStorage.getItem('sellerProfile') || '{}')
            setSellerName(sellerProfile.fullName || sellerProfile.storeName || user.name || '')
        }
    }, [])

    // Extract the current path relative to /seller
    const currentPath = pathname.replace('/seller', '') || '/profile'

    return (
        <div className="flex min-h-screen bg-[#121212]">
            {/* Sidebar */}
            <SellerSidebar 
                currentPath={currentPath} 
                sellerName={sellerName}
            />
            
            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                <main className="flex-1 p-6">
                    {children}
                </main>
                
                {/* Footer with proper sidebar spacing */}
                <footer className="bg-black text-white border-t border-gray-800 mt-auto">
                    <div className="px-6 py-8">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center">
                                <p className="text-sm text-gray-400">
                                    © {new Date().getFullYear()} Spyke AI. All rights reserved.
                                </p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    )
}