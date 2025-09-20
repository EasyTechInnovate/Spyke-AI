'use client'

import { usePathname } from 'next/navigation'
import Header from './Header'

export default function ConditionalHeader() {
    const pathname = usePathname()
    const isSellerPage = pathname?.startsWith('/seller') || pathname?.includes('/seller/')
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.includes('/admin/')
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signup')
    const isStudioPage = pathname?.startsWith('/studio')
    const shouldHideHeader = isSellerPage || isAdminPage || isAuthPage || isStudioPage
    if (shouldHideHeader || (typeof window !== 'undefined' && window.location.pathname.includes('/seller'))) {
        return null
    }
    
    return <Header />
}