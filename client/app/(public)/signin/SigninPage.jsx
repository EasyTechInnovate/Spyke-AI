'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/shared/layout/Header'
import Container from '@/components/shared/layout/Container'

export default function SignInPage() {
    const { login, authService } = useAuth()

    // Form state
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [loginError, setLoginError] = useState('')
    const [formData, setFormData] = useState({
        emailAddress: '',
        password: ''
    })

    // Clear error when user types
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

        try {
            await login(formData)
            // Auth service handles toast and redirect
        } catch (error) {
            const errorMessage = error?.message || error?.data?.message || 'Login failed. Please try again.'
            setLoginError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleAuth = () => {
        if (!loading) {
            // Use auth API directly for Google auth (no toast needed as it redirects)
            import('@/lib/api/auth').then(({ authAPI }) => {
                authAPI.googleAuth()
            })
        }
    }

    const handleResendVerification = async () => {
        try {
            // Since /resend-verification doesn't exist on backend, 
            // inform user to re-register or contact support
            authService.showToast('verification', toast.info, '📧 Please re-register with your email or contact support for verification help.')
        } catch (error) {
            authService.handleAuthError(error, 'resend verification')
        }
    }

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
                        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 sm:gap-12 xl:gap-16 items-center">
                            {/* Left side - Branding & Features */}
                            <div className="hidden lg:block space-y-6 xl:space-y-8 pr-4 xl:pr-8">
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full">
                                        <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-[#00FF89] flex-shrink-0" />
                                        <span className="text-xs sm:text-sm font-bold text-[#00FF89] whitespace-nowrap">
                                            Trusted by 10,000+ creators
                                        </span>
                                    </div>

                                    <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight">
                                        <span className="block text-white">Welcome back to</span>
                                        <span className="block bg-gradient-to-r from-[#00FF89] via-[#00D4FF] to-[#00FF89] bg-clip-text text-transparent animate-pulse">
                                            SpykeAI
                                        </span>
                                    </h1>

                                    <p className="text-lg sm:text-xl text-gray-300 leading-relaxed pr-4 font-semibold">
                                        Continue your journey in the ultimate AI marketplace. Access exclusive tools, connect with creators, and
                                        unlock limitless possibilities.
                                    </p>
                                </div>

                                {/* Feature highlights */}
                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-[#00FF89]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm sm:text-base">Secure & Protected</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 font-semibold">Enterprise-grade security for your data</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                        <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#00D4FF]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-[#00D4FF]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-white text-sm sm:text-base">Lightning Fast</h3>
                                            <p className="text-xs sm:text-sm text-gray-400 font-semibold">Optimized performance for creators</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Login Form */}
                            <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:w-auto">
                                {/* Mobile header */}
                                <div className="text-center lg:hidden mb-6 sm:mb-8 px-2">
                                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                                        <span className="bg-gradient-to-r from-white to-[#00FF89] bg-clip-text text-transparent">Welcome back</span>
                                    </h1>
                                    <p className="text-gray-400 text-sm sm:text-base font-semibold">Sign in to continue your journey</p>
                                </div>

                                {/* Enhanced form container */}
                                <div className="relative mx-auto max-w-md lg:max-w-lg">
                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />

                                    <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
                                        <div className="mb-4 sm:mb-6">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Sign In</h2>
                                            <p className="text-gray-400 text-sm sm:text-base font-semibold">Access your SpykeAI account</p>
                                        </div>

                                        <form
                                            onSubmit={handleLogin}
                                            className="space-y-4 sm:space-y-6">
                                            {/* Enhanced error message */}
                                            {loginError && (
                                                <div className="relative mb-4 sm:mb-6">
                                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-lg blur opacity-60" />
                                                    <div className="relative flex items-start gap-3 p-3 sm:p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                                        <AlertCircle className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                        <div className="text-xs sm:text-sm text-red-300 flex-1 min-w-0">
                                                            <p className="font-medium break-words">{loginError}</p>
                                                            {loginError.toLowerCase().includes('account not confirmed') && (
                                                                <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                                                                    <p className="text-red-200/80">
                                                                        Please check your email and verify your account to continue.
                                                                    </p>
                                                                    <button
                                                                        type="button"
                                                                        onClick={handleResendVerification}
                                                                        className="inline-flex items-center gap-1 text-red-200 hover:text-white font-medium text-xs sm:text-sm transition-colors hover:underline"
                                                                        disabled={loading || !formData.emailAddress}>
                                                                        <Mail className="w-3 h-3 flex-shrink-0" />
                                                                        <span>Resend verification email</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Email input */}
                                            <div className="space-y-1 sm:space-y-2">
                                                <label className="block text-xs sm:text-sm font-bold text-gray-300 pl-1">Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                    <input
                                                        type="email"
                                                        name="emailAddress"
                                                        value={formData.emailAddress}
                                                        onChange={handleChange}
                                                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm sm:text-base font-medium"
                                                        placeholder="you@example.com"
                                                        required
                                                        disabled={loading}
                                                    />
                                                </div>
                                            </div>

                                            {/* Password input */}
                                            <div className="space-y-1 sm:space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-xs sm:text-sm font-bold text-gray-300 pl-1">Password</label>
                                                    <Link
                                                        href="/auth/forgot-password"
                                                        className="text-xs sm:text-sm text-[#00FF89] hover:text-[#00D4FF] font-medium transition-colors hover:underline">
                                                        Forgot password?
                                                    </Link>
                                                </div>
                                                <div className="relative group">
                                                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        placeholder="Enter your password"
                                                        className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-sm sm:text-base font-medium"
                                                        required
                                                        disabled={loading}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors p-1"
                                                        disabled={loading}>
                                                        {showPassword ? (
                                                            <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" />
                                                        ) : (
                                                            <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Submit button */}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className={`group w-full py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 mt-6 ${
                                                    loading
                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25 active:scale-[0.98]'
                                                }`}>
                                                {loading ? (
                                                    <span className="flex items-center justify-center gap-2 sm:gap-3 font-bold">
                                                        <div className="w-4 sm:w-5 h-4 sm:h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                                        <span>Signing you in...</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center justify-center gap-2 font-bold">
                                                        <span>Sign In</span>
                                                        <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
                                                    </span>
                                                )}
                                            </button>

                                            {/* Divider */}
                                            <div className="relative my-4 sm:my-6">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-700" />
                                                </div>
                                                <div className="relative flex justify-center text-xs sm:text-sm">
                                                    <span className="px-4 sm:px-6 bg-[#1a1a1a] text-gray-400 font-bold">or continue with</span>
                                                </div>
                                            </div>

                                            {/* Google OAuth button */}
                                            <button
                                                type="button"
                                                onClick={handleGoogleAuth}
                                                disabled={loading}
                                                className={`group w-full py-3 sm:py-4 px-4 sm:px-6 bg-white/95 hover:bg-white text-gray-800 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base ${
                                                    loading
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:scale-[1.02] hover:shadow-lg transform active:scale-[0.98]'
                                                }`}>
                                                <svg
                                                    className="w-4 sm:w-5 h-4 sm:h-5 flex-shrink-0"
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
                                                <span>Continue with Google</span>
                                                <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                                            </button>
                                        </form>

                                        {/* Sign up link */}
                                        <div className="mt-6 sm:mt-8 text-center">
                                            <p className="text-gray-400 text-sm sm:text-base font-semibold">
                                                New to SpykeAI?{' '}
                                                <Link
                                                    href="/signup"
                                                    className={`font-bold bg-gradient-to-r from-[#00FF89] to-[#00D4FF] bg-clip-text text-transparent ${
                                                        loading
                                                            ? 'pointer-events-none opacity-50'
                                                            : 'hover:from-[#00D4FF] hover:to-[#00FF89] transition-all duration-200'
                                                    }`}>
                                                    Create your account →
                                                </Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    )
}

