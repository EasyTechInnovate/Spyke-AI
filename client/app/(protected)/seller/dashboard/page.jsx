'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SellerDashboardRedirect() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to the main dashboard with seller context
        router.replace('/dashboard')
    }, [router])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
        </div>
    )
}