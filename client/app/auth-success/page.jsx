'use client'
import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Loader2, XCircle, Phone } from 'lucide-react'
import { authAPI } from '@/lib/api/auth'
function PhoneNumberCollection({ onComplete, onSkip }) {
    const [phoneData, setPhoneData] = useState({
        countryCode: '+1',
        phoneNumber: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const countryOptions = [
        { value: '+1', label: '+1 (US/Canada)' },
        { value: '+44', label: '+44 (UK)' },
        { value: '+91', label: '+91 (India)' },
        { value: '+49', label: '+49 (Germany)' },
        { value: '+33', label: '+33 (France)' },
        { value: '+86', label: '+86 (China)' },
        { value: '+81', label: '+81 (Japan)' },
        { value: '+61', label: '+61 (Australia)' }
    ]
    const formatPhoneNumber = (value, code) => {
        const cleaned = value.replace(/\D/g, '').slice(0, code === '+1' ? 10 : 15)
        if (code === '+1' && cleaned.length <= 10) {
            if (cleaned.length <= 3) return cleaned
            if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
        }
        return cleaned
    }
    const validatePhone = (phone, code) => {
        const cleaned = phone.replace(/\D/g, '')
        return code === '+1' ? cleaned.length === 10 : cleaned.length >= 6 && cleaned.length <= 15
    }
    const handlePhoneChange = (e) => {
        const value = e.target.value
        const formatted = formatPhoneNumber(value, phoneData.countryCode)
        setPhoneData((prev) => ({ ...prev, phoneNumber: formatted }))
        setError('')
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validatePhone(phoneData.phoneNumber, phoneData.countryCode)) {
            setError('Please enter a valid phone number')
            return
        }
        setLoading(true)
        setError('')
        try {
            const countryCodeDigits = phoneData.countryCode.replace(/\D/g, '')
            const phoneNumberDigits = phoneData.phoneNumber.replace(/\D/g, '')
            const fullPhoneNumber = countryCodeDigits + phoneNumberDigits
            await authAPI.updateProfile({
                phoneNumber: fullPhoneNumber
            })
            onComplete()
        } catch (err) {
            setError(err.message || 'Failed to save phone number. Please try again.')
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="bg-[#1a1a1a]/90 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-center mb-6">
                <div className="w-12 h-12 bg-[#00FF89]/20 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#00FF89]" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Complete Your Profile</h2>
            <p className="text-gray-300 mb-6 text-center">Please add your phone number to complete your account setup</p>
            <form
                onSubmit={handleSubmit}
                className="space-y-4">
                <div className="flex gap-3">
                    <select
                        value={phoneData.countryCode}
                        onChange={(e) =>
                            setPhoneData((prev) => ({
                                ...prev,
                                countryCode: e.target.value,
                                phoneNumber: '' 
                            }))
                        }
                        className="w-40 px-3 py-3 bg-[#121212] border border-gray-600 rounded-xl text-white focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                        disabled={loading}>
                        {countryOptions.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="tel"
                        value={phoneData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder={phoneData.countryCode === '+1' ? '(555) 123-4567' : 'Phone number'}
                        className="flex-1 px-4 py-3 bg-[#121212] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:border-[#00FF89] focus:ring-2 focus:ring-[#00FF89]/20 transition-all"
                        disabled={loading}
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={loading || !phoneData.phoneNumber}
                        className="flex-1 bg-[#00FF89] hover:bg-[#00FF89]/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Continue'
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onSkip}
                        disabled={loading}
                        className="px-6 py-3 border border-gray-600 text-gray-300 hover:bg-gray-700 rounded-xl transition-colors">
                        Skip
                    </button>
                </div>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center">Your phone number helps secure your account and enables important notifications</p>
        </div>
    )
}
function AuthSuccessContent() {
    const [status, setStatus] = useState('processing') 
    const [countdown, setCountdown] = useState(3)
    const [errorMessage, setErrorMessage] = useState('')
    const [userProfile, setUserProfile] = useState(null)
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
                const cookieOptions = 'path=/; max-age=86400; SameSite=strict; secure=' + (window.location.protocol === 'https:')
                document.cookie = `accessToken=${token}; ${cookieOptions}`
                document.cookie = `authToken=${token}; ${cookieOptions}`
                localStorage.setItem('authToken', token)
                localStorage.setItem('loginTime', new Date().toISOString())
                try {
                    const profile = await authAPI.getCurrentUser()
                    console.log('Fetched user profile:', profile)
                    if (profile) {
                        setUserProfile(profile)
                        localStorage.setItem('user', JSON.stringify(profile))
                        if (profile.roles) {
                            localStorage.setItem('roles', JSON.stringify(profile.roles))
                            document.cookie = `roles=${JSON.stringify(profile.roles)}; ${cookieOptions}`
                        }
                        const hasPhoneNumber =
                            profile.phoneNumber &&
                            ((typeof profile.phoneNumber === 'object' && profile.phoneNumber.internationalNumber) ||
                                (typeof profile.phoneNumber === 'string' && profile.phoneNumber.length > 0))
                        if (!hasPhoneNumber) {
                            setStatus('phone_required')
                            return
                        }
                    } else {
                        console.warn('⚠️ No user profile data received')
                    }
                } catch (profileError) {
                    console.warn('⚠️ Failed to fetch user profile:', profileError)
                }
                proceedWithRedirect()
            } catch (error) {
                setStatus('error')
                setErrorMessage(error.message || 'Authentication failed. Please try again.')
            }
        }
        handleAuthSuccess()
    }, [searchParams, router])
    const proceedWithRedirect = () => {
        setStatus('success')
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval)
                    let redirectPath = localStorage.getItem('redirectAfterLogin')
                    if (!redirectPath) {
                        const roles = userProfile?.roles || []
                        if (roles.includes('admin')) {
                            redirectPath = '/admin/dashboard'
                        } else if (roles.includes('seller')) {
                            redirectPath = '/seller/dashboard'
                        } else {
                            redirectPath = '/'
                        }
                    }
                    localStorage.removeItem('redirectAfterLogin') 
                    router.push(redirectPath)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(countdownInterval)
    }
    const handlePhoneComplete = async () => {
        try {
            const updatedProfile = await authAPI.getCurrentUser()
            if (updatedProfile) {
                setUserProfile(updatedProfile)
                localStorage.setItem('user', JSON.stringify(updatedProfile))
            }
        } catch (error) {
            console.warn('Failed to refresh user profile:', error)
        }
        proceedWithRedirect()
    }
    const handlePhoneSkip = () => {
        proceedWithRedirect()
    }
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
            case 'phone_required':
                return null 
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
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#00FF89]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 w-full max-w-md">
                {status === 'phone_required' ? (
                    <PhoneNumberCollection
                        onComplete={handlePhoneComplete}
                        onSkip={handlePhoneSkip}
                    />
                ) : (
                    statusContent && (
                        <div className={`${statusContent.bgColor} ${statusContent.borderColor} border rounded-2xl p-8 text-center backdrop-blur-sm`}>
                            <div className="flex justify-center mb-6">{statusContent.icon}</div>
                            <h1 className="text-2xl font-bold text-white mb-4">{statusContent.title}</h1>
                            <p className="text-gray-300 mb-6">{statusContent.message}</p>
                            {status === 'error' && (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push('/signin')}
                                        className="w-full bg-[#00FF89] hover:bg-[#00FF89]/90 text-black font-semibold py-3 px-6 rounded-xl transition-colors">
                                        Back to Sign In
                                    </button>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                                        Try Again
                                    </button>
                                </div>
                            )}
                            {status === 'success' && (
                                <div className="flex justify-center">
                                    <div className="w-6 h-6 border-2 border-[#00FF89]/30 border-t-[#00FF89] rounded-full animate-spin" />
                                </div>
                            )}
                        </div>
                    )
                )}
                {status !== 'phone_required' && (
                    <div className="text-center mt-6">
                        <p className="text-gray-500 text-sm">You're being signed in with Google</p>
                    </div>
                )}
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
                <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
                <p className="text-gray-300">Please wait while we process your authentication.</p>
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