'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Sparkles, Shield, Zap, RefreshCw } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/shared/layout/Header'
import { DSStack, DSHeading, DSText, DSButton, DSBadge } from '@/lib/design-system'
import { authAPI } from '@/lib/api/auth'
import { useNotifications } from '@/components/shared/NotificationProvider'
import { track } from '@/lib/utils/analytics'
import { TRACKING_EVENTS, TRACKING_PROPERTIES } from '@/lib/constants/tracking'

export default function SignInPage() {
    const { login } = useAuth()
    const { showError, showSuccess } = useNotifications()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [formData, setFormData] = useState({
        emailAddress: '',
        password: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
        if (loginError) {
            setLoginError('')
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (loading) return

        setLoading(true)
        setLoginError('')

        // Track signin attempt
        track(TRACKING_EVENTS.SIGNIN_STARTED, {
            method: TRACKING_PROPERTIES.METHOD.EMAIL
        })

        try {
            await login(formData)
            // Track successful signin
            track(TRACKING_EVENTS.SIGNIN_COMPLETED, {
                method: TRACKING_PROPERTIES.METHOD.EMAIL
            })
        } catch (error) {
            const errorMessage = error?.message || error?.data?.message || 'Login failed. Please try again.'
            if (errorMessage.toLowerCase().includes('account not confirmed')) {
                showSuccess('Please check your email and verify your account to continue.')
                setLoginError('account_not_confirmed')
            } else {
                setLoginError(errorMessage)
            }
            // Track failed signin
            track(TRACKING_EVENTS.SIGNIN_FAILED, {
                method: TRACKING_PROPERTIES.METHOD.EMAIL,
                error: errorMessage
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = () => {
        if (!loading) {
            // Track Google signin attempt
            track(TRACKING_EVENTS.SIGNIN_STARTED, {
                method: TRACKING_PROPERTIES.METHOD.GOOGLE
            })

            import('@/lib/api/auth').then(({ authAPI }) => {
                authAPI.googleAuth()
            })
        }
    }

    const handleResendVerification = async () => {
        if (!formData.emailAddress) {
            showError('Please enter your email address first')
            return
        }

        setResendLoading(true)
        try {
            await authAPI.resendVerificationEmail(formData.emailAddress)
            showSuccess('Verification email sent! Check your inbox and spam folder.')
            setLoginError('')
        } catch (error) {
            const errorMessage = error?.response?.data?.message || error?.data?.message || error?.message || 'Failed to send verification email'
            showError(errorMessage)
        } finally {
            setResendLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-[#121212] relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/60 to-black" />
                <div className="absolute top-1/3 left-1/5 w-72 sm:w-96 h-72 sm:h-96 bg-[#00FF89]/10 rounded-full blur-3xl animate-pulse opacity-70" />
                <div
                    className="absolute bottom-1/3 right-1/5 w-64 sm:w-80 h-64 sm:h-80 bg-[#FFC050]/8 rounded-full blur-3xl animate-pulse opacity-50"
                    style={{ animationDelay: '2s' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-[#00FF89]/5 rounded-full blur-2xl animate-pulse opacity-30"
                    style={{ animationDelay: '4s' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
                <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/5 to-black/20" />
            </div>
            <Header />
            <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="w-full max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center min-h-[calc(100vh-120px)]">
                        <div className="hidden lg:flex lg:flex-col lg:justify-center space-y-6">
                            <DSStack
                                gap="medium"
                                direction="column">
                                <div className="inline-flex">
                                    <DSBadge
                                        variant="primary"
                                        icon={Sparkles}
                                        className="!bg-[#00FF89]/10 !border-[#00FF89]/30 !text-[#00FF89]">
                                        Trusted by 10,000+ creators
                                    </DSBadge>
                                </div>
                                <DSStack
                                    gap="small"
                                    direction="column">
                                    <DSHeading
                                        level={1}
                                        variant="hero"
                                        className="text-3xl xl:text-4xl 2xl:text-5xl leading-tight">
                                        <span className="text-white font-bold">Welcome back to </span>
                                        <span className="font-bold bg-gradient-to-r from-[#00FF89] to-[#00e67a] bg-clip-text text-transparent">
                                            SpykeAI
                                        </span>
                                    </DSHeading>
                                    <DSText
                                        variant="subhero"
                                        className="text-base xl:text-lg text-gray-300 leading-relaxed max-w-lg">
                                        Continue your journey in the ultimate AI marketplace. Access exclusive tools, connect with creators, and
                                        unlock limitless possibilities.
                                    </DSText>
                                </DSStack>
                                <DSStack
                                    gap="small"
                                    direction="column"
                                    className="space-y-3">
                                    <div className="group flex items-center gap-3 p-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-xl backdrop-blur-sm hover:bg-[#1a1a1a]/80 hover:border-[#00FF89]/20 transition-all duration-300">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#00FF89]/20 to-[#00FF89]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Shield className="w-5 h-5 text-[#00FF89]" />
                                        </div>
                                        <div className="flex-1">
                                            <DSText
                                                as="h3"
                                                size="sm"
                                                className="text-white font-bold mb-1">
                                                Secure & Protected
                                            </DSText>
                                            <DSText
                                                size="xs"
                                                className="text-gray-400 font-medium">
                                                Enterprise-grade security for your data
                                            </DSText>
                                        </div>
                                    </div>
                                    <div className="group flex items-center gap-3 p-3 bg-[#1a1a1a]/60 border border-gray-800/60 rounded-xl backdrop-blur-sm hover:bg-[#1a1a1a]/80 hover:border-[#FFC050]/20 transition-all duration-300">
                                        <div className="w-10 h-10 bg-gradient-to-br from-[#FFC050]/20 to-[#FFC050]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                                            <Zap className="w-5 h-5 text-[#FFC050]" />
                                        </div>
                                        <div className="flex-1">
                                            <DSText
                                                as="h3"
                                                size="sm"
                                                className="text-white font-bold mb-1">
                                                Lightning Fast
                                            </DSText>
                                            <DSText
                                                size="xs"
                                                className="text-gray-400 font-medium">
                                                Optimized performance for creators
                                            </DSText>
                                        </div>
                                    </div>
                                </DSStack>
                            </DSStack>
                        </div>
                        <div className="w-full flex flex-col justify-center">
                            <div className="text-center lg:hidden mb-6">
                                <DSHeading
                                    level={1}
                                    className="text-2xl sm:text-3xl mb-2 font-bold">
                                    <span className="text-white">Welcome back</span>
                                </DSHeading>
                                <DSText className="text-gray-400 font-medium">Sign in to continue your journey</DSText>
                            </div>
                            <div className="relative w-full max-w-md mx-auto lg:max-w-lg">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/15 via-[#FFC050]/15 to-[#00FF89]/15 rounded-2xl blur-xl opacity-75 animate-pulse" />
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#00FF89]/20 via-[#FFC050]/20 to-[#00FF89]/20 rounded-xl blur opacity-60" />
                                <div className="relative bg-[#1a1a1a]/90 backdrop-blur-2xl border border-gray-700/60 rounded-2xl p-6 shadow-2xl">
                                    <DSStack
                                        gap="medium"
                                        direction="column">
                                        <div className="text-center lg:text-left">
                                            <DSHeading
                                                level={2}
                                                className="text-xl lg:text-2xl mb-1 font-bold text-white">
                                                Sign In
                                            </DSHeading>
                                            <DSText
                                                size="sm"
                                                className="text-gray-400 font-medium">
                                                Access your SpykeAI account
                                            </DSText>
                                        </div>
                                        <form
                                            onSubmit={handleLogin}
                                            className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="block text-sm font-semibold text-gray-300 pl-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF89] transition-all duration-200" />
                                                    <input
                                                        type="email"
                                                        name="emailAddress"
                                                        value={formData.emailAddress}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 pr-3 py-3 bg-[#121212]/60 border border-gray-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/60 focus:border-[#00FF89]/60 focus:bg-[#121212]/80 transition-all duration-200 text-sm font-medium hover:border-gray-500/60"
                                                        placeholder="you@example.com"
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-semibold text-gray-300 pl-1">Password</label>
                                                    <Link
                                                        href="/auth/forgot-password"
                                                        className="text-xs text-[#00FF89] hover:text-[#FFC050] font-medium transition-colors hover:underline">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#00FF89] transition-all duration-200" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="Enter your password"
                                                        className="w-full pl-10 pr-10 py-3 bg-[#121212]/60 border border-gray-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/60 focus:border-[#00FF89]/60 focus:bg-[#121212]/80 transition-all duration-200 text-sm font-medium hover:border-gray-500/60"
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors p-1 rounded-md hover:bg-gray-800/30"
                                                        disabled={loading}>
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            {loginError && (
                                                <div className="space-y-3">
                                                    {loginError === 'account_not_confirmed' ? (
                                                        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <AlertCircle className="w-4 h-4 text-amber-400" />
                                                                <DSText
                                                                    size="sm"
                                                                    className="text-amber-200 font-medium">
                                                                    Account verification required
                                                                </DSText>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={handleResendVerification}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 hover:text-white font-medium text-sm rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={loading || resendLoading || !formData.emailAddress}>
                                                                {resendLoading ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-amber-200/30 border-t-amber-200 rounded-full animate-spin" />
                                                                        <span>Sending...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <RefreshCw className="w-4 h-4" />
                                                                        <span>Resend verification email</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                            <div className="flex items-center gap-2">
                                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                                                <DSText
                                                                    size="sm"
                                                                    className="text-red-200 font-medium">
                                                                    {loginError}
                                                                </DSText>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <DSButton
                                                variant="primary"
                                                size="medium"
                                                loading={loading}
                                                className="w-full !py-3 !text-sm font-semibold group"
                                                type="submit">
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Signing you in...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2">
                                                        Sign In
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                                    </span>
                                                )}
                                            </DSButton>
                                            <div className="relative my-4">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-700/60" />
                                                </div>
                                                <div className="relative flex justify-center text-sm">
                                                    <span className="px-4 bg-[#1a1a1a] text-gray-400 font-semibold text-xs">or continue with</span>
                                                </div>
                                            </div>
                                            <DSButton
                                                variant="secondary"
                                                size="medium"
                                                onClick={handleGoogleAuth}
                                                disabled={loading}
                                                className="w-full !py-3 !bg-white/96 hover:!bg-white !text-gray-800 !border-0 font-semibold group shadow-lg hover:shadow-xl transition-all duration-200"
                                                type="button">
                                                <svg
                                                    className="w-4 h-4"
                                                    viewBox="0 0 24 24">
                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    />
                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    />
                                                </svg>
                                                <span className="text-sm">Continue with Google</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-200" />
                                            </DSButton>
                                        </form>
                                        <div className="text-center pt-3 border-t border-gray-700/40">
                                            <DSText
                                                size="sm"
                                                className="text-gray-400 font-medium">
                                                New to SpykeAI?{' '}
                                                <Link
                                                    href="/signup"
                                                    className={`font-bold text-[#00FF89] hover:text-[#00e67a] transition-all duration-200 ${
                                                        loading ? 'pointer-events-none opacity-50' : 'hover:underline'
                                                    }`}>
                                                    Create your account →
                                                </Link>
                                            </DSText>
                                        </div>
                                    </DSStack>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

