'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
    const pathname = usePathname()
    
    // Don't render header on specific pages that have their own header/layout
    const isSellerPage = pathname.startsWith('/seller') // Hide on ALL seller pages
    const isAdminDashboard = pathname.startsWith('/admin')
    const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/signin') || pathname.startsWith('/signup')
    const isStudioPage = pathname.startsWith('/studio')
    
    // Hide header on pages that have their own layout or don't need a header
    if (isSellerPage || isAdminDashboard || isAuthPage || isStudioPage) {
        return null
    }
    
    return <Header />
}