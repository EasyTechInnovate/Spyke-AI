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
            <main className="flex-1 min-h-screen lg:ml-64">
                {children}
            </main>
        </div>
    )
}