'use client'
import { usePathname } from 'next/navigation'
import Footer from './Footer'
export default function ConditionalFooter() {
    const pathname = usePathname()
    const isSellerPage = pathname.startsWith('/seller')
    const isAdminPage = pathname.startsWith('/admin')
    if (isSellerPage || isAdminPage) {
        return null
    }
    return <Footer />
}