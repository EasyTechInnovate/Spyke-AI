'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Mail, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Header from '@/components/shared/layout/Header'

// Import Design System Components
import {
  DSContainer,
  DSStack,
  DSHeading,
  DSText,
  DSButton,
  DSBadge,
  DSLoadingState
} from '@/lib/design-system'

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
        <div className="min-h-screen bg-[#121212] relative overflow-hidden">
            {/* Background Effects using Design System approach */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/50 to-black" />
                
                {/* Animated gradient orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00FF89]/8 rounded-full blur-3xl animate-pulse opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#FFC050]/6 rounded-full blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }} />

                {/* Subtle overlay for better text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
            </div>

            <Header />

            <main className="relative pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-6 lg:pb-8">
                <DSContainer>
                    <div className="flex min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-100px)] lg:min-h-[calc(100vh-120px)] items-center justify-center">
                        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-6 sm:gap-8 xl:gap-12 items-center">
                            {/* Left side - Branding & Features */}
                            <div className="hidden lg:block space-y-6">
                                <DSStack gap="medium" direction="column">
                                    <DSBadge variant="primary" icon={Sparkles}>
                                        Trusted by 10,000+ creators
                                    </DSBadge>

                                    <DSStack gap="small" direction="column">
                                        <DSHeading level={1} variant="hero">
                                            <span style={{ color: 'white' }}>Welcome back to </span>
                                            <span style={{ color: '#00FF89' }}>
                                                SpykeAI
                                            </span>
                                        </DSHeading>

                                        <DSText variant="subhero" style={{ color: '#d1d5db' }}>
                                            Continue your journey in the ultimate AI marketplace. Access exclusive tools, 
                                            connect with creators, and unlock limitless possibilities.
                                        </DSText>
                                    </DSStack>

                                    {/* Feature highlights using design system */}
                                    <DSStack gap="small" direction="column">
                                        <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                            <div className="w-8 h-8 bg-[#00FF89]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-4 h-4 text-[#00FF89]" />
                                            </div>
                                            <div>
                                                <DSText as="h3" size="sm" style={{ color: 'white', fontWeight: 700 }}>
                                                    Secure & Protected
                                                </DSText>
                                                <DSText size="xs" style={{ color: '#9ca3af', fontWeight: 600 }}>
                                                    Enterprise-grade security for your data
                                                </DSText>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-3 bg-[#1a1a1a]/50 border border-gray-800/50 rounded-xl backdrop-blur-sm">
                                            <div className="w-8 h-8 bg-[#FFC050]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Zap className="w-4 h-4 text-[#FFC050]" />
                                            </div>
                                            <div>
                                                <DSText as="h3" size="sm" style={{ color: 'white', fontWeight: 700 }}>
                                                    Lightning Fast
                                                </DSText>
                                                <DSText size="xs" style={{ color: '#9ca3af', fontWeight: 600 }}>
                                                    Optimized performance for creators
                                                </DSText>
                                            </div>
                                        </div>
                                    </DSStack>
                                </DSStack>
                            </div>

                            {/* Right side - Login Form */}
                            <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-none lg:w-auto">
                                {/* Mobile header using design system */}
                                <div className="text-center lg:hidden mb-6">
                                    <DSHeading level={1} className="text-2xl sm:text-3xl mb-2">
                                        <span style={{ color: 'white' }}>
                                            Welcome back
                                        </span>
                                    </DSHeading>
                                    <DSText style={{ color: '#9ca3af', fontWeight: 600 }}>
                                        Sign in to continue your journey
                                    </DSText>
                                </div>

                                {/* Enhanced form container */}
                                <div className="relative mx-auto max-w-md lg:max-w-lg">
                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#FFC050]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />

                                    <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                                        <DSStack gap="small" direction="column">
                                            {/* Form header */}
                                            <div>
                                                <DSHeading level={2} className="text-xl mb-1" style={{ color: 'white' }}>
                                                    Sign In
                                                </DSHeading>
                                                <DSText size="sm" style={{ color: '#9ca3af', fontWeight: 600 }}>
                                                    Access your SpykeAI account
                                                </DSText>
                                            </div>

                                            <form onSubmit={handleLogin}>
                                                <DSStack gap="medium" direction="column">
                                                    {/* Enhanced error message */}
                                                    {loginError && (
                                                        <div className="relative">
                                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-lg blur opacity-60" />
                                                            <div className="relative flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                                <div className="text-sm text-red-300 flex-1">
                                                                    <DSText size="sm" style={{ color: '#fca5a5', fontWeight: 500 }}>
                                                                        {loginError}
                                                                    </DSText>
                                                                    {loginError.toLowerCase().includes('account not confirmed') && (
                                                                        <div className="mt-3">
                                                                            <DSText size="sm" style={{ color: '#fbb6ce' }}>
                                                                                Please check your email and verify your account to continue.
                                                                            </DSText>
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleResendVerification}
                                                                                className="inline-flex items-center gap-1 mt-2 text-red-200 hover:text-white font-medium text-sm transition-colors hover:underline"
                                                                                disabled={loading || !formData.emailAddress}>
                                                                                <Mail className="w-3 h-3" />
                                                                                <span>Resend verification email</span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Email input */}
                                                    <div className="space-y-1">
                                                        <label className="block text-sm font-semibold text-gray-300 pl-1">
                                                            Email Address
                                                        </label>
                                                        <div className="relative group">
                                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                            <input
                                                                type="email"
                                                                name="emailAddress"
                                                                value={formData.emailAddress}
                                                                onChange={handleChange}
                                                                className="w-full pl-12 pr-4 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-base font-medium"
                                                                placeholder="you@example.com"
                                                                required
                                                                disabled={loading}
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Password input */}
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-sm font-semibold text-gray-300 pl-1">
                                                                Password
                                                            </label>
                                                            <Link
                                                                href="/auth/forgot-password"
                                                                className="text-sm text-[#00FF89] hover:text-[#FFC050] font-medium transition-colors hover:underline">
                                                                Forgot password?
                                                            </Link>
                                                        </div>
                                                        <div className="relative group">
                                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                            <input
                                                                type={showPassword ? 'text' : 'password'}
                                                                name="password"
                                                                value={formData.password}
                                                                onChange={handleChange}
                                                                placeholder="Enter your password"
                                                                className="w-full pl-12 pr-12 py-3 bg-[#121212]/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50 transition-all duration-200 text-base font-medium"
                                                                required
                                                                disabled={loading}
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors p-1"
                                                                disabled={loading}>
                                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Submit button using design system */}
                                                    <DSButton 
                                                        variant="primary" 
                                                        size="medium" 
                                                        loading={loading}
                                                        className="w-full"
                                                        type="submit"
                                                    >
                                                        {loading ? 'Signing you in...' : (
                                                            <>
                                                                Sign In
                                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                            </>
                                                        )}
                                                    </DSButton>

                                                    {/* Divider */}
                                                    <div className="relative my-4">
                                                        <div className="absolute inset-0 flex items-center">
                                                            <div className="w-full border-t border-gray-700" />
                                                        </div>
                                                        <div className="relative flex justify-center text-sm">
                                                            <span className="px-4 bg-[#1a1a1a] text-gray-400 font-semibold">
                                                                or continue with
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Google OAuth button */}
                                                    <DSButton
                                                        variant="secondary"
                                                        size="medium"
                                                        onClick={handleGoogleAuth}
                                                        disabled={loading}
                                                        className="w-full !bg-white/95 hover:!bg-white !text-gray-800 !border-0"
                                                        type="button"
                                                    >
                                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                        </svg>
                                                        Continue with Google
                                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                    </DSButton>
                                                </DSStack>
                                            </form>

                                            {/* Sign up link */}
                                            <div className="text-center mt-4">
                                                <DSText size="sm" style={{ color: '#9ca3af', fontWeight: 600 }}>
                                                    New to SpykeAI?{' '}
                                                    <Link
                                                        href="/signup"
                                                        className={`font-bold text-[#00FF89] hover:text-[#00e67a] transition-colors ${
                                                            loading
                                                                ? 'pointer-events-none opacity-50'
                                                                : 'hover:underline'
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
                </DSContainer>
            </main>
        </div>
    )
}

