'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import { authService } from '@/lib/services/auth'

function AuthSuccessContent() {
    const [status, setStatus] = useState('processing') // processing, success, error
    const [countdown, setCountdown] = useState(3)
    const [errorMessage, setErrorMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                const token = searchParams.get('token')
                
                if (!token) {
                    setStatus('error')
                    setErrorMessage('No authentication token provided')
                    return
                }
                const apiClient = (await import('@/lib/api/client')).default
                apiClient.setAuthToken(token)
                
                // Store token in multiple places for backend compatibility
                const cookieOptions = 'path=/; max-age=86400; SameSite=strict; secure=' + (window.location.protocol === 'https:')
                document.cookie = `accessToken=${token}; ${cookieOptions}`
                document.cookie = `authToken=${token}; ${cookieOptions}`
                localStorage.setItem('authToken', token)
                localStorage.setItem('loginTime', new Date().toISOString())
                // Get user profile to complete authentication
                try {
                    const userProfile = await authAPI.getCurrentUser()
                    
                    if (userProfile) {
                        
                        // Store user data and roles
                        localStorage.setItem('user', JSON.stringify(userProfile))
                        
                        if (userProfile.roles) {
                            localStorage.setItem('roles', JSON.stringify(userProfile.roles))
                            document.cookie = `roles=${JSON.stringify(userProfile.roles)}; ${cookieOptions}`
                        }
                    } else {
                        console.warn('⚠️ No user profile data received')
                    }
                } catch (profileError) {
                    console.warn('⚠️ No user profile data received')

                }
                setStatus('success')

                const countdownInterval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval)
                            
                            // Determine redirect path
                            const redirectPath = localStorage.getItem('redirectAfterLogin') || '/explore'
                            localStorage.removeItem('redirectAfterLogin') // Clean up
                            
                            router.push(redirectPath)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)

                return () => clearInterval(countdownInterval)

            } catch (error) {
                setStatus('error')
                setErrorMessage(error.message || 'Authentication failed. Please try again.')
            }
        }

        handleAuthSuccess()
    }, [searchParams, router])

    const getStatusContent = () => {
        switch (status) {
            case 'processing':
                return {
                    icon: <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin" />,
                    title: 'Completing Sign In...',
                    message: 'Please wait while we set up your account.',
                    bgColor: 'bg-[#00FF89]/10',
                    borderColor: 'border-[#00FF89]/20'
                }
            case 'success':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-[#00FF89]" />,
                    title: 'Sign In Successful!',
                    message: `Redirecting in ${countdown} seconds...`,
                    bgColor: 'bg-[#00FF89]/10',
                    borderColor: 'border-[#00FF89]/20'
                }
            case 'error':
                return {
                    icon: <XCircle className="w-12 h-12 text-red-400" />,
                    title: 'Sign In Failed',
                    message: errorMessage || 'There was an issue completing your sign in. Please try again.',
                    bgColor: 'bg-red-500/10',
                    borderColor: 'border-red-500/20'
                }
            default:
                return {
                    icon: <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin" />,
                    title: 'Processing...',
                    message: 'Please wait...',
                    bgColor: 'bg-[#00FF89]/10',
                    borderColor: 'border-[#00FF89]/20'
                }
        }
    }

    const statusContent = getStatusContent()

    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00FF89]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md">
                <div className={`${statusContent.bgColor} ${statusContent.borderColor} border rounded-2xl p-8 text-center backdrop-blur-sm`}>
                    {/* Status Icon */}
                    <div className="flex justify-center mb-6">
                        {statusContent.icon}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white mb-4">
                        {statusContent.title}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-300 mb-6">
                        {statusContent.message}
                    </p>

                    {/* Action Button for Error State */}
                    {status === 'error' && (
                        <div className="space-y-3">
                            <button
                                onClick={() => router.push('/signin')}
                                className="w-full bg-[#00FF89] hover:bg-[#00FF89]/90 text-black font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Back to Sign In
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Loading indicator for success */}
                    {status === 'success' && (
                        <div className="flex justify-center">
                            <div className="w-6 h-6 border-2 border-[#00FF89]/30 border-t-[#00FF89] rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Additional Info */}
                <div className="text-center mt-6">
                    <p className="text-gray-500 text-sm">
                        You're being signed in with Google
                    </p>
                    {/* Debug info in development */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-2 text-xs text-gray-600">
                            Token: {searchParams.get('token')?.substring(0, 20)}...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function LoadingFallback() {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
            <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-2xl p-8 text-center backdrop-blur-sm">
                <div className="flex justify-center mb-6">
                    <Loader2 className="w-12 h-12 text-[#00FF89] animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                    Loading...
                </h1>
                <p className="text-gray-300">
                    Please wait while we process your authentication.
                </p>
            </div>
        </div>
    )
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <AuthSuccessContent />
        </Suspense>
    )
}