'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Shield, Clock, Key } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import toast from '@/lib/utils/toast'
import { validateEmail } from '@/lib/utils/utils'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function ForgotPasswordPage() {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [touched, setTouched] = useState(false)
    const validateEmailInput = (email) => {
        if (!email) return 'Email is required'
        if (!email.includes('@')) return "Please include an '@' in the email address"
        if (!validateEmail(email)) return 'Please enter a valid email address'
        return ''
    }
    const handleEmailChange = (e) => {
        const value = e.target.value
        setEmail(value)
        if (error) setError('')
        if (touched) {
            const emailError = validateEmailInput(value)
            setError(emailError)
        }
    }
    const handleBlur = () => {
        setTouched(true)
        const emailError = validateEmailInput(email)
        setError(emailError)
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setTouched(true)
        const emailError = validateEmailInput(email)
        if (emailError) {
            setError(emailError)
            return
        }
        setLoading(true)
        setError('')
        try {
            await authAPI.forgotPassword(email)
            setEmailSent(true)
            showMessage('Password reset email sent! Check your inbox.', 'success')
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to send reset email'
            setError(errorMessage)
            showMessage(errorMessage, 'error')
        } finally {
            setLoading(false)
        }
    }
    const handleResendEmail = async () => {
        setLoading(true)
        setError('')
        try {
            await authAPI.forgotPassword(email)
            showMessage('Password reset email sent again! Check your inbox.', 'success')
        } catch (err) {
            const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to resend email'
            setError(errorMessage)
            showMessage(errorMessage, 'error')
        } finally {
            setLoading(false)
        }
    }
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
                            <div className="mb-6 sm:mb-8">
                                <Link
                                    href="/signin"
                                    className="inline-flex items-center gap-2 text-gray-400 hover:text-[#00FF89] transition-colors font-medium text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>Back to Sign In</span>
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />
                                <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl">
                                    {!emailSent ? (
                                        <>
                                            <div className="text-center mb-8 sm:mb-10">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                                                    <Key className="w-8 h-8 text-[#00FF89]" />
                                                </div>
                                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                                    Forgot your password?
                                                </h1>
                                                <p className="text-lg text-gray-300 leading-relaxed max-w-md mx-auto">
                                                    No worries! Enter your email address and we'll send you a link to reset your password.
                                                </p>
                                            </div>
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                {error && (
                                                    <div className="relative">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-lg blur opacity-60" />
                                                        <div className="relative flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                            <p className="text-sm text-red-300 font-medium">{error}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="block text-sm font-bold text-gray-300 pl-1">
                                                        Email Address
                                                    </label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={handleEmailChange}
                                                            onBlur={handleBlur}
                                                            className={`w-full pl-12 pr-4 py-4 bg-[#121212]/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium ${
                                                                touched && error
                                                                    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                                                    : 'border-gray-600/50 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50'
                                                            }`}
                                                            placeholder="you@example.com"
                                                            required
                                                            disabled={loading}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={loading || !email}
                                                    className={`group w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                                                        loading || !email
                                                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25 active:scale-[0.98]'
                                                    }`}
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center justify-center gap-3">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>Sending reset email...</span>
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <span>Send Reset Email</span>
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </span>
                                                    )}
                                                </button>
                                            </form>
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                                                    <CheckCircle className="w-8 h-8 text-[#00FF89]" />
                                                </div>
                                                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                                    Check your email
                                                </h1>
                                                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                                                    We've sent a password reset link to <span className="text-[#00FF89] font-semibold">{email}</span>
                                                </p>
                                                <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-6 mb-8 text-left">
                                                    <h3 className="text-white font-bold text-lg mb-3">What's next?</h3>
                                                    <div className="space-y-3">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <span className="text-[#00FF89] text-sm font-bold">1</span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm">Check your email inbox (and spam folder)</p>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <span className="text-[#00FF89] text-sm font-bold">2</span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm">Click the "Reset Password" button in the email</p>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-6 h-6 bg-[#00FF89]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <span className="text-[#00FF89] text-sm font-bold">3</span>
                                                            </div>
                                                            <p className="text-gray-300 text-sm">Create a new secure password</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
                                                    <div className="flex items-start gap-3">
                                                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                                        <div className="text-left">
                                                            <p className="text-blue-300 text-sm font-medium mb-1">Security Notice</p>
                                                            <p className="text-blue-200/80 text-sm">
                                                                This link will expire in 1 hour for your security. If you didn't request this reset, you can safely ignore this email.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <button
                                                        onClick={handleResendEmail}
                                                        disabled={loading}
                                                        className="w-full py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {loading ? (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                <span>Resending...</span>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                <span>Resend Email</span>
                                                            </span>
                                                        )}
                                                    </button>
                                                    <Link
                                                        href="/signin"
                                                        className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] rounded-xl font-bold transition-all duration-300 hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02]"
                                                    >
                                                        <span>Back to Sign In</span>
                                                        <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Need help?{' '}
                                    <Link href="/contactus" className="text-[#00FF89] hover:underline font-medium">
                                        Contact Support
                                    </Link>
                                    {' '}or{' '}
                                    <Link href="/" className="text-[#00FF89] hover:underline font-medium">
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