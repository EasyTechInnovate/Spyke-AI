'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Container from '@/components/shared/layout/Container'
import Header from '@/components/shared/layout/Header'
import { Lock, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Shield, Key } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
import toast from '@/lib/utils/toast'
import InlineNotification from '@/components/shared/notifications/InlineNotification'
export default function ResetPasswordPage({ token }) {
    const [notification, setNotification] = useState(null)
    const showMessage = (message, type = 'info') => {
        setNotification({ message, type })
        setTimeout(() => setNotification(null), 5000)
    }
    const clearNotification = () => setNotification(null)
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    useEffect(() => {
        if (!token) {
            showMessage('Invalid reset link. Please try requesting a new password reset.', 'error')
            router.push('/auth/forgot-password')
            return
        }
        console.log('Reset password page loaded with token:', token)
    }, [token, router])
    const validatePasswordInput = (password) => {
        if (!password) return 'Password is required'
        if (password.length < 8) return 'Password must be at least 8 characters long'
        if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter'
        if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter'
        if (!/[0-9]/.test(password)) return 'Password must contain at least one number'
        return ''
    }
    const validateConfirmPasswordInput = (password, confirmPassword) => {
        if (!confirmPassword) return 'Please confirm your password'
        if (password !== confirmPassword) return 'Passwords do not match'
        return ''
    }
    const handlePasswordChange = (e) => {
        const value = e.target.value
        setNewPassword(value)
        if (errors.newPassword) {
            const newErrors = { ...errors }
            delete newErrors.newPassword
            setErrors(newErrors)
        }
        if (touched.newPassword) {
            const passwordError = validatePasswordInput(value)
            if (passwordError) {
                setErrors((prev) => ({ ...prev, newPassword: passwordError }))
            }
        }
        if (touched.confirmPassword && confirmPassword) {
            const confirmError = validateConfirmPasswordInput(value, confirmPassword)
            if (confirmError) {
                setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
            } else {
                const newErrors = { ...errors }
                delete newErrors.confirmPassword
                setErrors(newErrors)
            }
        }
    }
    const handleConfirmPasswordChange = (e) => {
        const value = e.target.value
        setConfirmPassword(value)
        if (errors.confirmPassword) {
            const newErrors = { ...errors }
            delete newErrors.confirmPassword
            setErrors(newErrors)
        }
        if (touched.confirmPassword) {
            const confirmError = validateConfirmPasswordInput(newPassword, value)
            if (confirmError) {
                setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
            }
        }
    }
    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        if (field === 'newPassword') {
            const passwordError = validatePasswordInput(newPassword)
            if (passwordError) {
                setErrors((prev) => ({ ...prev, newPassword: passwordError }))
            }
        }
        if (field === 'confirmPassword') {
            const confirmError = validateConfirmPasswordInput(newPassword, confirmPassword)
            if (confirmError) {
                setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
            }
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('Form submitted!')
        setTouched({ newPassword: true, confirmPassword: true })
        const passwordError = validatePasswordInput(newPassword)
        const confirmError = validateConfirmPasswordInput(newPassword, confirmPassword)
        const newErrors = {}
        if (passwordError) newErrors.newPassword = passwordError
        if (confirmError) newErrors.confirmPassword = confirmError
        setErrors(newErrors)
        if (Object.keys(newErrors).length > 0) {
            console.log('Form has validation errors:', newErrors)
            return
        }
        setLoading(true)
        try {
            console.log('Calling authAPI.resetPassword with:', {
                token,
                newPasswordLength: newPassword.length,
                confirmPasswordLength: confirmPassword.length
            })
            const result = await authAPI.resetPassword(token, newPassword, confirmPassword)
            console.log('Reset password success result:', result)
            setSuccess(true)
            showMessage('Password reset successfully! You can now sign in with your new password.', 'success')
            setTimeout(() => {
                router.push('/signin')
            }, 3000)
        } catch (err) {
            console.error('Reset password error:', err)
            console.error('Error response:', err?.response)
            console.error('Error data:', err?.response?.data)
            const errorMessage = err?.response?.data?.message || err?.data?.message || err?.message || 'Failed to reset password'
            if (errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('invalid')) {
                showMessage('This reset link has expired or is invalid. Please request a new password reset.', 'error')
                setTimeout(() => {
                    router.push('/auth/forgot-password')
                }, 2000)
            } else {
                setErrors({ form: errorMessage })
                showMessage(errorMessage, 'error')
            }
        } finally {
            setLoading(false)
        }
    }
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' }
        let score = 0
        if (password.length >= 8) score++
        if (/[a-z]/.test(password)) score++
        if (/[A-Z]/.test(password)) score++
        if (/[0-9]/.test(password)) score++
        if (/[^A-Za-z0-9]/.test(password)) score++
        if (score <= 2) return { strength: score * 25, label: 'Weak', color: 'red' }
        if (score <= 3) return { strength: score * 25, label: 'Fair', color: 'yellow' }
        if (score <= 4) return { strength: score * 25, label: 'Good', color: 'blue' }
        return { strength: 100, label: 'Strong', color: 'green' }
    }
    const passwordStrength = getPasswordStrength(newPassword)
    if (success) {
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
                </div>
                <Header />
                <main className="relative pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
                    <Container>
                        <div className="flex min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-160px)] items-center justify-center px-4 sm:px-6 lg:px-8">
                            <div className="w-full max-w-2xl mx-auto">
                                <div className="relative">
                                    <div className="absolute -inset-1 bg-gradient-to-r from-[#00FF89]/20 via-[#00D4FF]/20 to-[#00FF89]/20 rounded-2xl blur-xl opacity-60" />
                                    <div className="relative bg-[#1a1a1a]/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 sm:p-12 shadow-2xl text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                                            <CheckCircle className="w-8 h-8 text-[#00FF89]" />
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Password Reset Successfully!</h1>
                                        <p className="text-lg text-gray-300 leading-relaxed mb-8">
                                            Your password has been updated. You can now sign in with your new password.
                                        </p>
                                        <div className="bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-xl p-4 mb-8">
                                            <p className="text-[#00FF89] font-medium">Redirecting to sign in page in a few seconds...</p>
                                        </div>
                                        <Link
                                            href="/signin"
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] rounded-xl font-bold text-lg transition-all duration-300 hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25"
                                        >
                                            <span>Sign In Now</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Container>
                </main>
            </div>
        )
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#1a1a1a] relative overflow-hidden font-league-spartan">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-[#00FF89]/20 to-[#00D4FF]/20 rounded-full blur-3xl animate-pulse opacity-60" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-[#FF6B6B]/15 to-[#4ECDC4]/15 rounded-full blur-3xl animate-pulse opacity-40" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,137,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,137,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
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
                                    <div className="text-center mb-8 sm:mb-10">
                                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00FF89]/10 border border-[#00FF89]/20 rounded-full mb-6">
                                            <Key className="w-8 h-8 text-[#00FF89]" />
                                        </div>
                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Reset your password</h1>
                                        <p className="text-lg text-gray-300 leading-relaxed max-w-md mx-auto">
                                            Create a new, secure password for your Spyke AI account.
                                        </p>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {errors.form && (
                                            <div className="relative">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/50 to-orange-500/50 rounded-lg blur opacity-60" />
                                                <div className="relative flex items-start gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg backdrop-blur-sm">
                                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                                    <p className="text-sm text-red-300 font-medium">{errors.form}</p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-300 pl-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                <input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={newPassword}
                                                    onChange={handlePasswordChange}
                                                    onBlur={() => handleBlur('newPassword')}
                                                    className={`w-full pl-12 pr-12 py-4 bg-[#121212]/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium ${
                                                        touched.newPassword && errors.newPassword
                                                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                                            : 'border-gray-600/50 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50'
                                                    }`}
                                                    placeholder="Enter your new password"
                                                    required
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors"
                                                    disabled={loading}
                                                >
                                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {newPassword && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-400">Password strength</span>
                                                        <span className={`text-xs font-medium ${
                                                            passwordStrength.color === 'red' ? 'text-red-400' :
                                                            passwordStrength.color === 'yellow' ? 'text-yellow-400' :
                                                            passwordStrength.color === 'blue' ? 'text-blue-400' : 'text-green-400'
                                                        }`}>
                                                            {passwordStrength.label}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                passwordStrength.color === 'red' ? 'bg-red-500' :
                                                                passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                                                                passwordStrength.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                                                            }`}
                                                            style={{ width: `${passwordStrength.strength}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {touched.newPassword && errors.newPassword && (
                                                <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.newPassword}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold text-gray-300 pl-1">Confirm New Password</label>
                                            <div className="relative group">
                                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#00FF89] transition-colors" />
                                                <input
                                                    type={showConfirmPassword ? 'text' : 'password'}
                                                    value={confirmPassword}
                                                    onChange={handleConfirmPasswordChange}
                                                    onBlur={() => handleBlur('confirmPassword')}
                                                    className={`w-full pl-12 pr-12 py-4 bg-[#121212]/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 text-base font-medium ${
                                                        touched.confirmPassword && errors.confirmPassword
                                                            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                                            : 'border-gray-600/50 focus:ring-[#00FF89]/50 focus:border-[#00FF89]/50'
                                                    }`}
                                                    placeholder="Confirm your new password"
                                                    required
                                                    disabled={loading}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00FF89] transition-colors"
                                                    disabled={loading}
                                                >
                                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            {touched.confirmPassword && errors.confirmPassword && (
                                                <p className="text-red-400 text-sm font-medium flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.confirmPassword}
                                                </p>
                                            )}
                                        </div>
                                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                            <p className="text-blue-300 text-sm font-medium mb-2">Password requirements:</p>
                                            <ul className="text-blue-200/80 text-sm space-y-1">
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 8 ? 'bg-green-400' : 'bg-gray-400'}`} />
                                                    At least 8 characters long
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(newPassword) ? 'bg-green-400' : 'bg-gray-400'}`} />
                                                    One lowercase letter
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-green-400' : 'bg-gray-400'}`} />
                                                    One uppercase letter
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-green-400' : 'bg-gray-400'}`} />
                                                    One number
                                                </li>
                                            </ul>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading || !newPassword || !confirmPassword || Object.keys(errors).length > 0}
                                            className={`group w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                                                loading || !newPassword || !confirmPassword || Object.keys(errors).length > 0
                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-[#00FF89] to-[#00D4FF] text-[#121212] hover:from-[#00D4FF] hover:to-[#00FF89] transform hover:scale-[1.02] hover:shadow-lg hover:shadow-[#00FF89]/25 active:scale-[0.98]'
                                            }`}
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    <span>Resetting password...</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center gap-2">
                                                    <span>Reset Password</span>
                                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </span>
                                            )}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            <div className="mt-8 text-center">
                                <p className="text-gray-400 text-sm">
                                    Need help?{' '}
                                    <Link href="/support" className="text-[#00FF89] hover:underline font-medium">
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