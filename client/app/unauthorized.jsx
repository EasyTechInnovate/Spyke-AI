// app/unauthorized/page.jsx (or pages/unauthorized.jsx)
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Container from '@/components/layout/Container'
import Header from '@/components/layout/Header'

export default function UnauthorizedPage() {
    const router = useRouter()
    const [userRole, setUserRole] = useState(null)

    useEffect(() => {
        // Get user's actual role from localStorage or sessionStorage
        if (typeof window !== 'undefined') {
            try {
                const roles = JSON.parse(localStorage.getItem('roles') || '[]')
                if (roles.length > 0) {
                    setUserRole(roles[0])
                }
            } catch (e) {
                console.error('Error parsing roles:', e)
            }
        }
    }, [])

    const getRedirectPath = () => {
        switch (userRole) {
            case 'admin':
                return '/admin/dashboard'
            case 'seller':
                return '/dashboard'
            case 'moderator':
                return '/moderate/dashboard'
            default:
                return '/'
        }
    }

    return (
        <div className="min-h-screen bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 pointer-events-none" />

            <Header />

            <main className="relative pt-24 pb-16">
                <Container>
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-12 h-12 text-red-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>

                            <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>

                            <p className="text-gray-400 mb-8">You don't have permission to access this area.</p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => router.push(getRedirectPath())}
                                className="w-full py-3 px-6 bg-[#00FF89] text-black rounded-lg font-semibold hover:bg-[#00FF89]/90 transition-all duration-200">
                                Go to Your Dashboard
                            </button>

                            <button
                                onClick={() => router.back()}
                                className="w-full py-3 px-6 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-200">
                                Go Back
                            </button>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}
