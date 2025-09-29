'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { CheckCircle, XCircle, Loader2, ArrowRight, Mail, Shield, Sparkles } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function EmailConfirmPage({ token, code }) {
    const [notification, setNotification] = useState(null)
    const notificationTimeoutRef = useRef(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current)
        notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => {
        setNotification(null)
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current)
            notificationTimeoutRef.current = null
        }
    }
    const router = useRouter()
    const [status, setStatus] = useState('loading')
    const [countdown, setCountdown] = useState(10)
    const [errorMessage, setErrorMessage] = useState('')
    const countdownIntervalRef = useRef(null)
    const isUnmountedRef = useRef(false)
    const confirmationAttemptedRef = useRef(false)
    const confirmationKey = `email_confirmation_${token}_${code}`
    useEffect(() => {
        isUnmountedRef.current = false
        const confirmEmail = async () => {
            if (!token || !code || token === 'undefined' || code === 'undefined') {
                setStatus('error')
                setErrorMessage('Invalid confirmation link. Please check your email and try again.')
                return
            }
            if (confirmationAttemptedRef.current) {
                return
            }
            confirmationAttemptedRef.current = true
            if (typeof window !== 'undefined') {
                const sessionResult = sessionStorage.getItem(confirmationKey)
                if (sessionResult === 'confirmed') {
                    setStatus('success')
                    showMessage('Email confirmed successfully! Redirecting to login...', 'success')
                    startCountdown()
                    return
                }
            }
            try {
                const response = await authAPI.confirmAccount(token, code)
                if (isUnmountedRef.current) return
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem(confirmationKey, 'confirmed')
                }
                setStatus('success')
                showMessage('Email confirmed successfully! Redirecting to login...', 'success')
                startCountdown()
            } catch (error) {
                if (isUnmountedRef.current) return
                const errorResponse = error?.response
                const errorMessage = errorResponse?.data?.message || error?.data?.message || error?.message || 'Failed to confirm email'
                const isAlreadyConfirmed =
                    errorResponse?.status === 409 ||
                    errorResponse?.status === 400 ||
                    errorMessage.toLowerCase().includes('already confirmed') ||
                    errorMessage.toLowerCase().includes('already verified') ||
                    errorMessage.toLowerCase().includes('account confirmed') ||
                    errorMessage.toLowerCase().includes('email confirmed') ||
                    errorMessage.toLowerCase().includes('verification completed')
                if (isAlreadyConfirmed) {
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem(confirmationKey, 'confirmed')
                    }
                    setStatus('success')
                    showMessage('Your account is already confirmed! Redirecting to login...', 'success')
                    startCountdown()
                } else {
                    setStatus('error')
                    let userFriendlyMessage = errorMessage
                    if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
                        userFriendlyMessage = 'This confirmation link has expired or is invalid. Please request a new confirmation email.'
                    } else if (errorMessage.toLowerCase().includes('not found')) {
                        userFriendlyMessage = 'This confirmation link is not valid. Please check your email and try again.'
                    } else if (errorMessage.toLowerCase().includes('network') || errorMessage.toLowerCase().includes('timeout')) {
                        userFriendlyMessage = 'Network error occurred. Please check your connection and try again.'
                    }
                    setErrorMessage(userFriendlyMessage)
                    showMessage(userFriendlyMessage, 'error')
                }
            }
        }
        const startCountdown = () => {
            setCountdown(10)
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        if (countdownIntervalRef.current) {
                            clearInterval(countdownIntervalRef.current)
                            countdownIntervalRef.current = null
                        }
                        setStatus('redirecting')
                        const redirectUrl = `/signin?verified=true`
                        router.push(redirectUrl)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        const timeoutId = setTimeout(() => {
            confirmEmail()
        }, 200)
        return () => {
            clearTimeout(timeoutId)
            isUnmountedRef.current = true
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
                countdownIntervalRef.current = null
            }
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current)
                notificationTimeoutRef.current = null
            }
        }
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
            {notification && (
                <InlineNotification
                    type={notification.type}
                    message={notification.message}
                    onDismiss={clearNotification}
                />
            )}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00FF89]/20 to-[#00D4FF]/20 rounded-full blur-3xl animate-pulse opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#FF6B6B]/15 to-[#4ECDC4]/15 rounded-full blur-3xl animate-pulse opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,137,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,137,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
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
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />
                                <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
                                    <div className="mb-8 flex justify-center">{getStatusIcon()}</div>
                                    <div className="mb-8">
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">{statusMessage.title}</h1>
                                        <p className="text-lg text-gray-300 leading-relaxed">{statusMessage.subtitle}</p>
                                    </div>
                                    {status === 'success' && (
                                        <div className="space-y-6">
                                            <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4">
                                                <p className="text-[#00FF89] font-medium">Redirecting to login page in {countdown} seconds</p>
                                            </div>
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
                                            <Link
                                                href="/signin"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] rounded-xl font-bold text-lg transition-all duration-300 hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25">
                                                <span>Sign In Now</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    )}
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
                                    {status === 'loading' && (
                                        <div className="space-y-4">
                                            <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4">
                                                <p className="text-[#00FF89] font-medium text-sm">Verifying your email address...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Need help?{' '}
                                    <Link
                                        href="/contactus"
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
