'use client'
import { usePathname } from 'next/navigation'
import Header from './Header'
export default function ConditionalHeader() {
    const pathname = usePathname()
    const isSellerPage = pathname === '/seller' || pathname?.startsWith('/seller/')
    const isAdminPage = pathname?.startsWith('/admin') || pathname?.includes('/admin/')
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/signin') || pathname?.startsWith('/signup')
    const isStudioPage = pathname?.startsWith('/studio')

    const shouldHideHeader = isSellerPage || isAdminPage || isAuthPage || isStudioPage

    // Remove overly broad substring check that hid header for routes like "/seller-benefits"
    if (shouldHideHeader) {
        return null
    }
    return <Header />
}