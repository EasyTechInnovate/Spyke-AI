'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail, Shield, Sparkles } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import toast from '@/lib/utils/toast'

export default function EmailConfirmPage({ token, code }) {
    const router = useRouter()
    const [status, setStatus] = useState('loading') // 'loading', 'success', 'error', 'redirecting'
    const [countdown, setCountdown] = useState(10)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const confirmEmail = async () => {
            if (!token || !code) {
                setStatus('error')
                setErrorMessage('Invalid confirmation link. Please check your email and try again.')
                return
            }

            try {
                // Call the confirmation API
                await authAPI.confirmAccount(token, code)

                setStatus('success')
                toast.success('Email confirmed successfully! Redirecting to login...')

                // Start countdown
                const countdownInterval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval)
                            setStatus('redirecting')
                            router.push('/signin')
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)

                return () => clearInterval(countdownInterval)
            } catch (error) {
                setStatus('error')
                const message = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to confirm email'
                setErrorMessage(message)
                toast.error(message)
            }
        }

        confirmEmail()
    }, [token, code, router])

    const getStatusIcon = () => {
        switch (status) {
            case 'loading':
                return <Loader2 className="w-16 h-16 text-[#00FF89] animate-spin" />
            case 'success':
                return <CheckCircle className="w-16 h-16 text-[#00FF89]" />
            case 'error':
                return <XCircle className="w-16 h-16 text-red-500" />
            case 'redirecting':
                return <ArrowRight className="w-16 h-16 text-[#00FF89] animate-pulse" />
            default:
                return <Loader2 className="w-16 h-16 text-[#00FF89] animate-spin" />
        }
    }

    const getStatusMessage = () => {
        switch (status) {
            case 'loading':
                return {
                    title: 'Confirming Your Email',
                    subtitle: 'Please wait while we verify your account...'
                }
            case 'success':
                return {
                    title: 'Email Confirmed Successfully!',
                    subtitle: 'Your account has been activated. You can now access all Spyke AI features.'
                }
            case 'error':
                return {
                    title: 'Confirmation Failed',
                    subtitle: errorMessage
                }
            case 'redirecting':
                return {
                    title: 'Redirecting...',
                    subtitle: 'Taking you to the login page...'
                }
            default:
                return {
                    title: 'Processing',
                    subtitle: 'Please wait...'
                }
        }
    }

    const statusMessage = getStatusMessage()

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] relative overflow-hidden font-league-spartan">
            {/* Animated background effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00FF89]/20 to-[#00D4FF]/20 rounded-full blur-3xl animate-pulse opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#FF6B6B]/15 to-[#4ECDC4]/15 rounded-full blur-3xl animate-pulse opacity-40" />

                {/* Animated grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,137,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,137,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />

                {/* Floating particles */}
                <div
                    className="absolute top-20 left-20 w-2 h-2 bg-[#00FF89]/40 rounded-full animate-bounce"
                    style={{ animationDelay: '0s', animationDuration: '3s' }}
                />
                <div
                    className="absolute top-40 right-32 w-1 h-1 bg-[#00D4FF]/60 rounded-full animate-bounce"
                    style={{ animationDelay: '1s', animationDuration: '4s' }}
                />
                <div
                    className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-[#FF6B6B]/30 rounded-full animate-bounce"
                    style={{ animationDelay: '2s', animationDuration: '5s' }}
                />
            </div>

            <Header />

            <main className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
                <Container>
                    <div className="flex min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-160px)] items-center justify-center px-4 sm:px-6 lg:px-8">
                        <div className="w-full max-w-2xl mx-auto">
                            {/* Main confirmation card */}
                            <div className="relative">
                                {/* Glow effect */}
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />

                                <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
                                    {/* Status Icon */}
                                    <div className="mb-8 flex justify-center">{getStatusIcon()}</div>

                                    {/* Status Message */}
                                    <div className="mb-8">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{statusMessage.title}</h1>
                                        <p className="text-lg text-gray-300 leading-relaxed">{statusMessage.subtitle}</p>
                                    </div>

                                    {/* Success State Content */}
                                    {status === 'success' && (
                                        <div className="space-y-6">
                                            {/* Countdown */}
                                            <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4">
                                                <p className="text-[#00FF89] font-medium">Redirecting to login page in {countdown} seconds</p>
                                            </div>

                                            {/* Features Preview */}
                                            <div className="grid sm:grid-cols-3 gap-4">
                                                <div className="bg-[#121212]/50 border border-gray-700/50 rounded-xl p-4">
                                                    <Mail className="w-8 h-8 text-[#00FF89] mx-auto mb-2" />
                                                    <h3 className="font-bold text-white text-sm mb-1">Full Access</h3>
                                                    <p className="text-xs text-gray-400">Browse and purchase AI tools</p>
                                                </div>
                                                <div className="bg-[#121212]/50 border border-gray-700/50 rounded-xl p-4">
                                                    <Shield className="w-8 h-8 text-[#00D4FF] mx-auto mb-2" />
                                                    <h3 className="font-bold text-white text-sm mb-1">Secure Account</h3>
                                                    <p className="text-xs text-gray-400">Your account is now protected</p>
                                                </div>
                                                <div className="bg-[#121212]/50 border border-gray-700/50 rounded-xl p-4">
                                                    <Sparkles className="w-8 h-8 text-[#FFC050] mx-auto mb-2" />
                                                    <h3 className="font-bold text-white text-sm mb-1">Premium Features</h3>
                                                    <p className="text-xs text-gray-400">Access exclusive content</p>
                                                </div>
                                            </div>

                                            {/* Manual Login Button */}
                                            <Link
                                                href="/signin"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] rounded-xl font-bold text-lg transition-all duration-300 hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25">
                                                <span>Sign In Now</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    )}

                                    {/* Error State Content */}
                                    {status === 'error' && (
                                        <div className="space-y-6">
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                                <p className="text-red-300 text-sm">
                                                    {errorMessage.includes('already confirmed')
                                                        ? 'Your account is already confirmed. You can sign in now.'
                                                        : 'The confirmation link may have expired or is invalid. Please try requesting a new confirmation email.'}
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                <Link
                                                    href="/signin"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] rounded-xl font-bold transition-all duration-300 hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02]">
                                                    <span>Try Sign In</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href="/signup"
                                                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-xl font-bold transition-all duration-300 hover:bg-gray-600">
                                                    <span>Create New Account</span>
                                                </Link>
                                            </div>
                                        </div>
                                    )}

                                    {/* Loading State */}
                                    {status === 'loading' && (
                                        <div className="space-y-4">
                                            <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4">
                                                <p className="text-[#00FF89] font-medium text-sm">Verifying your email address...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Links */}
                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Need help?{' '}
                                    <Link
                                        href="/support"
                                        className="text-[#00FF89] hover:underline font-medium">
                                        Contact Support
                                    </Link>{' '}
                                    or{' '}
                                    <Link
                                        href="/"
                                        className="text-[#00FF89] hover:underline font-medium">
                                        Return to Homepage
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}
