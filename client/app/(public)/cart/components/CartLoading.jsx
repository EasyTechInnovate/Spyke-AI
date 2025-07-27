'use client'

import Header from '@/components/shared/layout/Header'
import Container from '@/components/shared/layout/Container'

export default function CartLoading() {
    return (
        <div className="min-h-screen bg-[#121212]">
            <Header />
            <Container>
                <div className="pt-24 pb-16">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <LoadingSpinner />
                    </div>
                </div>
            </Container>
        </div>
    )
}

function LoadingSpinner() {
    return (
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF89] mx-auto mb-4" />
            <p className="text-gray-400">Loading your cart...</p>
        </div>
    )
}