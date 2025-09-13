'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Header from './Header'

export default function ConditionalHeader() {
    const pathname = usePathname()
    
    // More explicit checks for seller pages
    const isSellerPage = pathname?.startsWith('/seller') || pathname?.includes('/seller/')
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.includes('/admin/')
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signup')
    const isStudioPage = pathname?.startsWith('/studio')
    
    const shouldHideHeader = isSellerPage || isAdminPage || isAuthPage || isStudioPage
    
    // Debug log only in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[ConditionalHeader] Pathname:', pathname, 'Should hide:', shouldHideHeader)
        }
    }, [pathname, shouldHideHeader])
    
    // Double safety: if we're on a seller page, never render the header
    if (shouldHideHeader || (typeof window !== 'undefined' && window.location.pathname.includes('/seller'))) {
        return null
    }
    
    return <Header />
}