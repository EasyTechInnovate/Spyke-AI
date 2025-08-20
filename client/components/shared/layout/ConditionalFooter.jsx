'use client'

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
    const pathname = usePathname()
    
    // Don't render footer on seller pages (they have their own footer)
    const isSellerPage = pathname.startsWith('/seller')
    const isAdminPage = pathname.startsWith('/admin')
    
    // Hide footer on dashboard pages that have their own layout
    if (isSellerPage || isAdminPage) {
        return null
    }
    
    return <Footer />
}