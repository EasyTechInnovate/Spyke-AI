'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
    const pathname = usePathname()
    const isSellerDashboardPage = pathname.startsWith('/seller/')
    const isAdminDashboard = pathname.startsWith('/admin')
    const isAuthPage = pathname.startsWith('/auth') || pathname.startsWith('/signin') || pathname.startsWith('/signup')
    const isStudioPage = pathname.startsWith('/studio')
        if (isSellerDashboardPage || isAdminDashboard || isAuthPage || isStudioPage) {
        return null
    }
    
    return <Header />
}